const axios = require("axios");
const AuthModel = require("../../models/authmodel");

/**
 * 🔴 LIVE ENVIRONMENT ONLY
 */
// const apiUrl = "http://localhost:8000/api";
const apiUrl = "https://www.api-doc.space/api";
const launchUrl = "https://www.api-doc.space/api/launch-game";
// const launchUrl = "http://localhost:8000/api/launch-game";
const key = "lham1f1pSAoAViS0BK7e";
// const key = "3aqSD5NzX8sKj2MG2CkNS6mqerzJywUW";

/* =========================
   HELPERS
========================= */

const zapHeaders = {
  "Content-Type": "application/json",
  "x-domain": "regalclub.live",
};

/**
 * Retry helper for transient MongoDB-style conflicts on the provider side.
 * Retries only when the error message contains "would create a conflict".
 */
const axiosRetry = async (fn, retries = 2, baseDelay = 400) => {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg =
        err.response?.data?.error?.error?.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "";
      const isConflict = /would create a conflict/i.test(msg);

      if (!isConflict || i === retries) throw err;

      const delay = baseDelay * (i + 1);
      console.warn(
        `⚠️ [axiosRetry] conflict detected, retry ${i + 1}/${retries} in ${delay}ms → ${msg}`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
};

/**
 * Ensure the player exists on the Zapcore side.
 * Safe to call repeatedly — Zapcore auto-creates on Userbalance.
 */
const ensureZapPlayer = async (playerid) => {
  try {
    const res = await axios.post(
      `${apiUrl}/Userbalance`,
      { playerid, key },
      { headers: zapHeaders }
    );
    return res.data;
  } catch (err) {
    console.warn(
      "⚠️ [ensureZapPlayer] failed:",
      err.response?.data || err.message
    );
    return null;
  }
};

/* =========================
   CHECK BALANCE (AUTO CREATE USER)
========================= */
const checkBalance = async (req, res) => {
  try {
    const playerid = String(req.body.playerid || "").trim();
    if (!playerid) {
      return res
        .status(400)
        .json({ status: false, message: "playerid required" });
    }

    const response = await axios.post(
      `${apiUrl}/Userbalance`,
      { playerid, key },
      { headers: zapHeaders }
    );

    console.log("CHECK BALANCE RESPONSE 👉", response.data);

    return res.json({
      status: true,
      message: "Balance fetched successfully",
      data: response.data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Balance error",
      error: error.response?.data || error.message,
    });
  }
};

/* =========================
   TRANSFER BALANCE (ZAP → LOCAL)
========================= */
const transferBalance = async (req, res) => {
  try {
    /* 1️⃣ Find user */
    const user = await AuthModel.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid user",
      });
    }

    const playerid = String(user.mobile).trim();

    /* 2️⃣ Get balance from Zapcore */
    const balRes = await axios.post(
      `${apiUrl}/Userbalance?playerid=${playerid}&key=${key}`,
      { playerid, key },
      { headers: zapHeaders }
    );

    const zapBalance = Number(balRes.data?.Balance || 0);
    console.log("ZAPCORE BALANCE 👉", zapBalance);

    /* 3️⃣ IF–ELSE CONDITION */
    if (!isNaN(zapBalance) && zapBalance > 0) {
      /* 4️⃣ Add balance to local wallet (atomic $inc only — no $set on same field) */
      const updatedUser = await AuthModel.findByIdAndUpdate(
        user._id,
        { $inc: { credit: zapBalance + (user.exposure || 0) } },
        { new: true }
      );

      /* 5️⃣ Reset Zapcore balance */
      let resetRes;
      try {
        resetRes = await axios.post(
          `${apiUrl}/Setbalance?playerid=${playerid}&key=${key}`,
          {
            playerid,
            key,
            opening_balance: -zapBalance,
          },
          { headers: zapHeaders }
        );
      } catch (err) {
        resetRes = { data: { status: false } };
        console.error(
          "SETBALANCE ERROR 👉",
          err.response?.data || err.message
        );
      }

      /* 6️⃣ Rollback if reset fails — atomic $inc (never $set+$inc together) */
      if (resetRes.data?.status !== true) {
        await AuthModel.updateOne(
          { _id: user._id },
          { $inc: { credit: -(zapBalance + (user.exposure || 0)) } }
        );

        return res.status(500).json({
          status: false,
          message: "Zap reset failed, rollback applied safely",
        });
      }

      /* ✅ SUCCESS */
      return res.status(200).json({
        status: true,
        message: "Balance transferred successfully",
        transferredAmount: zapBalance,
        currentBalance: updatedUser.credit,
      });
    } else {
      /* ❌ NO BALANCE */
      return res.status(200).json({
        status: false,
        message: "No balance to transfer",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Transfer error",
      error: error.response?.data || error.message,
    });
  }
};

/* =========================
   LAUNCH GAME (LOCAL → ZAP)
========================= */
const launchGame = async (req, res) => {
  let lockedUserId = null;

  try {
    const { gameId } = req.body;
    if (!gameId) {
      return res
        .status(400)
        .json({ status: false, message: "gameId required" });
    }

    const user = await AuthModel.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ status: false, message: "Invalid user" });
    }

    /* 🛡️ ATOMIC LOCK — only one launch per user at a time */
    const locked = await AuthModel.findOneAndUpdate(
      { _id: user._id, launching: { $ne: true } },
      { $set: { launching: true } },
      { new: true }
    );

    if (!locked) {
      return res.status(429).json({
        status: false,
        message: "Launch already in progress, please wait",
      });
    }

    lockedUserId = locked._id;
    const playerid = String(locked.mobile).trim();

    /* ✅ Step 1: ensure player exists on provider side */
    await ensureZapPlayer(playerid);

    /* ✅ Step 2: launch with retry on transient conflicts */
    const response = await axiosRetry(() =>
      axios.post(
        launchUrl,
        {
          playerid,
          uid: gameId,
          opening_balance: (locked.credit || 0) - (locked.exposure || 0),
          key,
        },
        { headers: zapHeaders }
      )
    );

    if (response.data?.status === true) {
      await AuthModel.updateOne(
        { _id: locked._id },
        { $set: { credit: 0 } }
      );

      return res.json({
        status: true,
        message: "Game launched successfully",
        data: response.data,
      });
    }

    return res.status(500).json({
      status: false,
      message: "Game launch failed",
      data: response.data,
    });
  } catch (error) {
    console.error("LAUNCH ERROR →", {
      playerid: String(req.user?.mobile || "").trim(),
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return res.status(500).json({
      status: false,
      message: "Launch error",
      error: error.response?.data || error.message,
    });
  } finally {
    /* 🔓 Always release the lock */
    if (lockedUserId) {
      try {
        await AuthModel.updateOne(
          { _id: lockedUserId },
          { $set: { launching: false } }
        );
      } catch (e) {
        console.error("LOCK RELEASE ERROR 👉", e.message);
      }
    }
  }
};

/* =========================
   GAME META & LISTING
========================= */
const getgamedetails = async (req, res) => {
  try {
    const { page = 1, size = 2000 } = req.query;
    const response = await axios.get(
      `${apiUrl}/getgamedetails?page=${page}&size=${size}`
    );
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

const gameProvider = async (req, res) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getgamedetails?provider_list=1`
    );
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

const gameType = async (req, res) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getgamedetails?gametype_list=1`
    );
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

const gameListByProvider = async (req, res) => {
  try {
    const { provider, page = 1, size = 20 } = req.query;
    const response = await axios.get(
      `${apiUrl}/getgamedetails?provider=${provider}&page=${page}&size=${size}`
    );
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

const gameListByGameType = async (req, res) => {
  try {
    const { game_type, page = 1, size = 20 } = req.query;
    const response = await axios.get(
      `${apiUrl}/getgamedetails?game_type=${game_type}&page=${page}&size=${size}`
    );
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

const gameListByGameTypeAndProvider = async (req, res) => {
  try {
    const { provider, game_type, page = 1, size = 20 } = req.query;
    const response = await axios.get(
      `${apiUrl}/getgamedetails?provider=${provider}&game_type=${game_type}&page=${page}&size=${size}`
    );
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

/* =========================
   GAME HISTORY
========================= */
const gameHistory = async (req, res) => {
  try {
    const playerid = String(req.user.mobile).trim();

    const { page = 1, size = 2000, from_date, to_date } = req.query;
    const response = await axios.post(
      `${apiUrl}/history?page=${page}&size=${size}`,
      {
        key,
        playerid,
        page,
        limit: size,
        from_date,
        to_date,
      },
      { headers: zapHeaders }
    );

    return res.json({
      data: response.data,
      message: "Game history fetched successfully",
      status: true,
    });
  } catch (err) {
    console.error("GAME HISTORY ERROR 👉", err.response?.data || err.message);
    return res.status(500).json({ status: false, error: err.message });
  }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  checkBalance,
  transferBalance,
  launchGame,
  getgamedetails,
  gameProvider,
  gameType,
  gameListByProvider,
  gameListByGameType,
  gameListByGameTypeAndProvider,
  gameHistory,
};