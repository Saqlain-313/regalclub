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
   CHECK credit (AUTO CREATE USER)
========================= */
const checkcredit = async (req, res) => {
  try {
    const playerid = String(req.body.playerid || "").trim();
    if (!playerid) {
      return res
        .status(400)
        .json({ status: false, message: "playerid required" });
    }

    const response = await axios.post(`${apiUrl}/Userbalance`, {
      playerid,
      key,
    });

    console.log("CHECK credit RESPONSE 👉", response.data);

    return res.json({
      status: true,
      message: "credit fetched successfully",
      data: response.data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "credit error",
      error: error.response?.data || error.message,
    });
  }
};

/* =========================
   TRANSFER credit (ZAP → LOCAL)
========================= */
const transfercredit = async (req, res) => {
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

    /* 2️⃣ Get credit from Zapcore */
    const balRes = await axios.post(
      `${apiUrl}/Userbalance?playerid=${playerid}&key=${key}`,
      {
        playerid,
        key,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-domain": "cd regalclub.live",
        },
      },
    );

    // console.log("ZAPCORE credit RESPONSE 👉", balRes.data);

    const zapcredit = Number(balRes.data?.credit || 0);
    // console.log("ZAPCORE credit 👉", zapcredit);

    /* 3️⃣ IF–ELSE CONDITION */
    if (!isNaN(zapcredit) && zapcredit > 0) {
      /* 4️⃣ Add credit to local wallet */
      const updatedUser = await AuthModel.findByIdAndUpdate(
        user._id,
        { $inc: { credit: zapcredit + user.exposure } },
        { new: true },
      );

      // console.log("LOCAL WALLET UPDATED 👉", updatedUser);

      /* 5️⃣ Reset Zapcore credit */
      const resetRes = await axios.post(
        `${apiUrl}/Setcredit?playerid=${playerid}&key=${key}`,
        {
          playerid,
          key,
          opening_balance: -zapcredit,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-domain": "cd regalclub.live",
          },
        },
      );

      // console.log("ZAPCORE credit RESET RESPONSE 👉", resetRes.data);

      /* 6️⃣ Rollback if reset fails */
      if (resetRes.data?.status !== true) {
        await AuthModel.updateOne({ _id: user._id }, [
          {
            $set: {
              credit: {
                $cond: [
                  { $gte: ["$credit", zapcredit] },
                  { $subtract: ["$credit", zapcredit] },
                  0,
                ],
              },
            },
          },
        ]);

        return res.status(500).json({
          status: false,
          message: "Zap reset failed, rollback applied safely",
        });
      }

      /* ✅ SUCCESS */
      return res.status(200).json({
        status: true,
        message: "credit transferred successfully",
        transferredAmount: zapcredit,
        currentcredit: updatedUser.credit,
      });
    } else {
      /* ❌ NO credit */
      return res.status(200).json({
        status: false,
        message: "No credit to transfer",
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
  try {
    const { gameId } = req.body;

    console.log("========================================");
    console.log("LAUNCH GAME REQUEST");
    console.log("gameId:", gameId);
    console.log("========================================");

    if (!gameId) {
      return res.status(400).json({
        status: false,
        message: "gameId required",
      });
    }

    // ==============================
    // FIND USER
    // ==============================
    const user = await AuthModel.findById(req.user._id).lean();

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid user",
      });
    }

    const playerid = String(user.mobile || "").trim();

    if (!playerid) {
      return res.status(400).json({
        status: false,
        message: "User mobile/playerid not found",
      });
    }

    // ==============================
    // SAFE NUMBERS
    // ==============================
    const credit = Number(user.credit || 0);
    const exposure = Number(user.exposure || 0);

    if (!Number.isFinite(credit) || !Number.isFinite(exposure)) {
      return res.status(400).json({
        status: false,
        message: "Invalid credit/exposure value",
        data: {
          credit: user.credit,
          exposure: user.exposure,
        },
      });
    }

    const openingBalance = credit - exposure;

    if (!Number.isFinite(openingBalance)) {
      return res.status(400).json({
        status: false,
        message: "Invalid opening balance",
      });
    }

    console.log("PLAYER DATA 👉", {
      playerid,
      uid: gameId,
      credit,
      exposure,
      opening_balance: openingBalance,
      key,
    });

    // ==============================
    // LAUNCH GAME
    // ==============================
    let response;

    try {
      response = await axios.post(
        launchUrl,
        {
          playerid,
          uid: gameId,
          opening_balance: openingBalance,
          key,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-domain": "cd regalclub.live",
          },

          timeout: 30000,
        }
      );
    } catch (apiError) {
      console.error(
        "LAUNCH API ERROR 👉",
        apiError.response?.data || apiError.message
      );

      return res.status(apiError.response?.status || 500).json({
        status: false,
        message: "Launch API error",
        error:
          apiError.response?.data || {
            message: apiError.message,
          },
      });
    }

    console.log("LAUNCH API RESPONSE 👉", response.data);

    // ==============================
    // CHECK API RESPONSE
    // ==============================
    if (response.data?.status !== true) {
      return res.status(400).json({
        status: false,
        message: "Game launch failed",
        data: response.data,
      });
    }

    // ==============================
    // LOCAL WALLET UPDATE
    // ONLY CREDIT IS UPDATED
    // ==============================
    const updatedUser = await AuthModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          credit: 0,
        },
      },
      {
        new: true,
        runValidators: false,
      }
    ).lean();

    console.log("LOCAL USER AFTER LAUNCH 👉", {
      userId: user._id,
      credit: updatedUser?.credit,
      exposure: updatedUser?.exposure,
    });

    // ==============================
    // SUCCESS
    // ==============================
    return res.status(200).json({
      status: true,
      message: "Game launched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("LAUNCH GAME ERROR 👉", error);

    return res.status(500).json({
      status: false,
      message: "Launch error",
      error: error.response?.data || error.message,
    });
  }
};

/* =========================
   GAME META & LISTING
========================= */
const getgamedetails = async (req, res) => {
  try {
    const { page = 1, size = 2000 } = req.query;
    const response = await axios.get(
      `${apiUrl}/getgamedetails?page=${page}&size=${size}`,
    );
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

const gameProvider = async (req, res) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getgamedetails?provider_list=1`,
    );
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

const gameType = async (req, res) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getgamedetails?gametype_list=1`,
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
      `${apiUrl}/getgamedetails?provider=${provider}&page=${page}&size=${size}`,
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
      `${apiUrl}/getgamedetails?game_type=${game_type}&page=${page}&size=${size}`,
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
      `${apiUrl}/getgamedetails?provider=${provider}&game_type=${game_type}&page=${page}&size=${size}`,
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
      {
        headers: {
          "Content-Type": "application/json",
          "x-domain": "cd regalclub.live",
        },
      },
    );

    return res.json({
      data: response.data,
      message: "Game history fetched successfully",
      status: true,
    });
  } catch (err) {
    console.error("GAME HISTORY ERROR 👉", err);
    return res.status(500).json({ status: false, error: err.message });
  }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  checkcredit,
  transfercredit,
  launchGame,
  getgamedetails,
  gameProvider,
  gameType,
  gameListByProvider,
  gameListByGameType,
  gameListByGameTypeAndProvider,
  gameHistory,
};
