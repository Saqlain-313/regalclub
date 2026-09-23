// controllers/betController.js
const User = require("../models/authmodel");
const Wingo = require("../models/Wingo");
const Bet = require("../models/Bet");
const Transaction = require("../models/WingoTransaction");
const Commission = require("../models/Commission");
const Subordinate = require("../models/Subordinate");
const Level = require("../models/Level");
const Admin = require("../models/Admin");
const axios = require("axios");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ============================================
// GLOBAL IO REFERENCE
// ============================================
let ioInstance = null;

const setIo = (io) => {
  ioInstance = io;
};

// Track emitted results to prevent duplicates
const emittedResults = {
  wingo10: null,
  wingo: null,
  wingo3: null,
  wingo5: null,
  trx: null,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
};

function formatDate(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type).value;

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

function formatDateOnly(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type).value;

  return `${getPart("year")}${getPart("month")}${getPart("day")}`;
}

function generateRandomHash(length) {
  const characters = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

function shuffleArrayInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ============================================
// CALCULATE TIMER FUNCTION FOR SOCKET
// ============================================
function calculateTimer(intervalSeconds) {
  const now = new Date();
  const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  
  let remaining = intervalSeconds - (totalSeconds % intervalSeconds);
  if (remaining === 0) remaining = intervalSeconds;
  
  const minute = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const secondtime1 = Math.floor(seconds / 10);
  const secondtime2 = seconds % 10;
  
  return { minute, secondtime1, secondtime2 };
}

// ============================================
// GENERATE RANDOM RESULT (0-9)
// ============================================
function generateRandomResult() {
  const randomBytes = crypto.randomBytes(1);
  const randomNumber = randomBytes[0] % 10;
  return randomNumber;
}

// ============================================
// SOCKET EMIT FUNCTIONS - WITH DUPLICATE CHECK
// ============================================
const emitTimerUpdate = (type, timerData) => {
  if (ioInstance) {
    const eventMap = {
      10: 'timeUpdate_30',
      1: 'timeUpdate_11',
      3: 'timeUpdate_3',
      5: 'timeUpdate_5',
    };
    const event = eventMap[type];
    if (event) {
      ioInstance.emit(event, timerData);
      console.log(`[SOCKET] Emitted ${event}:`, timerData);
    }
  }
};

const emitGameResult = (game, period, amount) => {
  if (ioInstance) {
    // Check if this result was already emitted
    if (emittedResults[game] === period) {
      console.log(`[${game}] Result for period ${period} already emitted, skipping duplicate`);
      return;
    }
    
    emittedResults[game] = period;
    
    ioInstance.emit('data-server', {
      data: [{ game, period, amount }]
    });
    console.log(`[SOCKET] Emitted result for ${game}: ${period} -> ${amount}`);
  }
};

// ============================================
// PAGE RENDERERS
// ============================================

const winGoPage = async (req, res) => {
  return res.render("bet/wingo/win.ejs");
};

const winGoPage3 = async (req, res) => {
  return res.render("bet/wingo/win3.ejs");
};

const winGoPage5 = async (req, res) => {
  return res.render("bet/wingo/win5.ejs");
};

const winGoPage10 = async (req, res) => {
  return res.render("bet/wingo/win10.ejs");
};

// ============================================
// COMMISSION FUNCTIONS
// ============================================

const commissions = async (user, money) => {
  try {
    if (!user) return;

    const levels = await Level.find().sort({ level: 1 });
    if (!levels.length) return;

    const checkTime2 = formatDate(Date.now());
    let uplines = [user];
    let count = 0;

    for (let i = 0; i < 6 && uplines.length > 0; i++) {
      const rosesFs = (money / 100) * (levels[i]?.f1 || 0);

      if (rosesFs > 0) {
        const upline = await User.findOne({ code: uplines[0].invite });
        if (upline) {
          count++;

          await Commission.create({
            mobile: upline.mobile,
            bonusby: uplines[0].mobile,
            type: "Bet",
            commission: rosesFs,
            amount: money,
            level: count,
            date: checkTime2,
          });

          await Subordinate.create({
            mobile: upline.mobile,
            bonusby: uplines[0].mobile,
            type: "bet commission",
            commission: rosesFs,
            amount: money,
            level: count,
            date: checkTime2,
          });

          await User.updateOne(
            { mobile: upline.mobile },
            { $inc: { pending_commission: rosesFs } },
          );

          uplines = [upline];
        } else {
          break;
        }
      } else {
        break;
      }
    }
  } catch (error) {
    console.error("Commission error:", error);
  }
};

// ============================================
// BET PLACEMENT
// ============================================

const betWinGo = async (req, res) => {
  try {
    const { typeid, join, x, money } = req.body;
    const user = req.user;

    console.log("Received bet request:", { typeid, join, x, money, userId: user?._id });
    
    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
        status: false,
      });
    }

    if (user.veri !== 1) {
      return res.status(401).json({
        message: "User not verified",
        status: false,
      });
    }

    const userId = user._id;

    const validTypeIds = [1, 3, 5, 10];
    const numericTypeId = Number(typeid);

    if (!validTypeIds.includes(numericTypeId)) {
      return res.status(400).json({
        message: "Invalid type id",
        status: false,
      });
    }

    const gameMap = {
      1: "wingo",
      3: "wingo3",
      5: "wingo5",
      10: "wingo10",
    };

    const gameJoin = gameMap[numericTypeId];

    const winGoNow = await Wingo.findOne({
      status: 0,
      game: gameJoin,
    })
      .sort({ _id: -1 })
      .limit(1);

    if (!winGoNow) {
      return res.status(400).json({
        message: "Game not available",
        status: false,
      });
    }

    const betCount = Number(x);
    const betAmount = Number(money);

    if (
      !Number.isFinite(betCount) ||
      !Number.isFinite(betAmount) ||
      betCount <= 0 ||
      betAmount <= 0
    ) {
      return res.status(400).json({
        message: "Invalid amount",
        status: false,
      });
    }

    const totalBetAmount = betCount * betAmount;
    const fee = totalBetAmount * 0.02;
    const total = totalBetAmount - fee;
    const period = winGoNow.period;

    if (!Number.isFinite(totalBetAmount) || totalBetAmount <= 0) {
      return res.status(400).json({
        message: "Invalid total bet amount",
        status: false,
      });
    }

    if (Number(user.credit || 0) < totalBetAmount) {
      return res.status(400).json({
        message: "The amount is not enough",
        status: false,
        credit: Number(user.credit || 0),
      });
    }

    if (Number(user.legal_bet_score || 0) >= 3) {
      await User.updateOne({ mobile: user.mobile }, { $set: { status: 2 } });

      const lockedUser = await User.findOne({
        mobile: user.mobile,
      });

      return res.status(403).json({
        message: "Your account is locked",
        status: true,
        change: lockedUser?.level || null,
        money: Number(lockedUser?.credit || 0),
        credit: Number(lockedUser?.credit || 0),
      });
    }

    const date = new Date();
    const id_product =
      formatDateOnly(date.getTime()) +
      Math.floor(Math.random() * 1000000000000000);
    const checkTime = formatDate(Date.now());

    const creditUpdate = await User.updateOne(
      {
        _id: user._id,
        veri: 1,
        credit: { $gte: totalBetAmount },
      },
      {
        $inc: {
          credit: -totalBetAmount,
          rebate: totalBetAmount,
        },
      },
    );

    if (creditUpdate.modifiedCount !== 1) {
      return res.status(400).json({
        message: "Insufficient credit",
        status: false,
      });
    }

    try {
      await Bet.create({
        id_product,
        mobile: user.mobile,
        code: user.code,
        invite: user.invite,
        stage: period,
        level: user.level,
        money: total,
        amount: betCount,
        fee,
        get: 0,
        game: gameJoin,
        bet: join,
        status: 0,
        today: checkTime,
        isdemo: user.isdemo || false,
      });
    } catch (betError) {
      await User.updateOne(
        { _id: user._id },
        {
          $inc: {
            credit: totalBetAmount,
            rebate: -totalBetAmount,
          },
        },
      );
      throw betError;
    }

    const bigScore = await Bet.findOne({
      mobile: user.mobile,
      stage: period,
      bet: "l",
    });

    const smallScore = await Bet.findOne({
      mobile: user.mobile,
      stage: period,
      bet: "n",
    });

    if (bigScore && smallScore) {
      await User.updateOne(
        { mobile: user.mobile },
        { $inc: { legal_bet_score: 1 } },
      );
    }

    await Transaction.create({
      mobile: user.mobile,
      detail: "Bet",
      credit: -totalBetAmount,
      time: checkTime,
    });

    await commissions(user, totalBetAmount);

    const updatedUser = await User.findOne({
      _id: user._id,
      veri: 1,
    });

    return res.status(200).json({
      message: "Bet Succeeded",
      status: true,
      change: updatedUser?.level || null,
      money: Number(updatedUser?.credit || 0),
      credit: Number(updatedUser?.credit || 0),
      betAmount: totalBetAmount,
      fee,
      netBetAmount: total,
      period,
      game: gameJoin,
    });
  } catch (error) {
    console.error("Error in betWinGo:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

// ============================================
// ORDER LIST
// ============================================

const listOrderOld = async (req, res) => {
  try {
    let { typeid, pageno, pageto } = req.body;

    const validTypeIds = [1, 3, 5, 10];
    if (!validTypeIds.includes(typeid)) {
      return res
        .status(200)
        .json({ message: "Invalid type id", status: false });
    }

    if (pageno < 1 || pageto < 1) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const user = req.user;
    if (!user) {
      return res
        .status(200)
        .json({ message: "Error! user is missing.", status: false });
    }

    const gameMap = {
      1: "wingo",
      3: "wingo3",
      5: "wingo5",
      10: "wingo10",
    };
    const game = gameMap[typeid];

    const offset = pageno - 1;
    const limit = pageto - pageno + 1;

    const wingo = await Wingo.find({ status: { $ne: 0 }, game })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit);

    const wingoAll = await Wingo.find({ status: { $ne: 0 }, game });
    const period = await Wingo.findOne({ status: 0, game })
      .sort({ _id: -1 })
      .limit(1);

    if (!wingo.length) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    if (!period) {
      return res.status(200).json({
        message: "Error! period is missing.",
        status: false,
      });
    }

    let page = Math.ceil(wingoAll.length / limit);

    return res.status(200).json({
      code: 0,
      msg: "Get success",
      data: { gameslist: wingo },
      period: period.period,
      page: page,
      time: period.time,
      status: true,
    });
  } catch (error) {
    console.error("Error in listOrderOld:", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ============================================
// GET MY BET HISTORY
// ============================================

const GetMyEmerdList = async (req, res) => {
  try {
    let { typeid, pageno, pageto } = req.body;

    const validTypeIds = [1, 3, 5, 10, 15];
    if (!validTypeIds.includes(typeid)) {
      return res
        .status(200)
        .json({ message: "Invalid type id", status: false });
    }

    if (pageno < 0 || pageto < 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(200).json({
        code: 0,
        msg: "User not found",
        data: { gameslist: [] },
        status: false,
      });
    }

    const gameMap = {
      1: "wingo",
      3: "wingo3",
      5: "wingo5",
      10: "wingo10",
    };

    if (typeid === 15) {
      const limit = 100;
      const offset = (1 - 1) * limit;

      const bets = await Bet.find({ mobile: user.mobile })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit);

      return res.status(200).json({
        code: 0,
        msg: "Get success",
        data: { gameslist: bets },
        status: true,
      });
    }

    const game = gameMap[typeid];
    const offset = pageno - 1;
    const limit = pageto - pageno + 1;

    const bets = await Bet.find({ mobile: user.mobile, game })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit);

    const betsAll = await Bet.find({ mobile: user.mobile, game });

    if (!bets || bets.length === 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    let page = Math.ceil(betsAll.length / 10);

    return res.status(200).json({
      code: 0,
      msg: "Get success data",
      data: { gameslist: bets },
      page: page,
      status: true,
    });
  } catch (error) {
    console.error("Error in GetMyEmerdList:", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ============================================
// HANDLE WIN RESULTS
// ============================================

const handlingWinGo1P = async (typeid) => {
  try {
    const gameMap = {
      1: "wingo",
      3: "wingo3",
      5: "wingo5",
      10: "wingo10",
      11: "trx",
    };
    const game = gameMap[typeid] || "wingo";

    const winGoNow = await Wingo.findOne({ status: { $ne: 0 }, game })
      .sort({ _id: -1 })
      .limit(1);

    if (!winGoNow) return;

    const result = Number(winGoNow.amount);

    await Bet.updateMany(
      { status: 0, game, stage: winGoNow.period },
      { $set: { result: result } },
    );

    const betTypeMap = {
      0: { bet: ["0", "t", "d", "n", "l"], special: true },
      1: { bet: ["1", "x", "n", "l"], special: false },
      2: { bet: ["2", "d", "n", "l"], special: false },
      3: { bet: ["3", "x", "n", "l"], special: false },
      4: { bet: ["4", "d", "n", "l"], special: false },
      5: { bet: ["5", "t", "x", "n", "l"], special: true },
      6: { bet: ["6", "d", "n", "l"], special: false },
      7: { bet: ["7", "x", "n", "l"], special: false },
      8: { bet: ["8", "d", "n", "l"], special: false },
      9: { bet: ["9", "x", "n", "l"], special: false },
    };

    const betInfo = betTypeMap[result];
    if (!betInfo) return;

    const losingBets = await Bet.find({
      status: 0,
      game,
      stage: winGoNow.period,
      bet: { $nin: betInfo.bet },
    });

    for (const bet of losingBets) {
      await Bet.updateOne({ _id: bet._id }, { status: 2 });
    }

    if (result < 5) {
      await Bet.updateMany(
        { status: 0, game, stage: winGoNow.period, bet: "l" },
        { status: 2 },
      );
    } else {
      await Bet.updateMany(
        { status: 0, game, stage: winGoNow.period, bet: "n" },
        { status: 2 },
      );
    }

    const winningBets = await Bet.find({
      status: 0,
      game,
      stage: winGoNow.period,
    });

    const processBet = async (bet) => {
      let nhan_duoc = 0;
      let betType = bet.bet;
      let total = bet.money;
      let mobile = bet.mobile;

      if (betType === "l" || betType === "n") {
        nhan_duoc = total * 2;
      } else {
        if (result === 0 || result === 5) {
          if (betType === "d" || betType === "x") {
            nhan_duoc = total * 1.5;
          } else if (betType === "t") {
            nhan_duoc = total * 4.5;
          } else if (betType === "0" || betType === "5") {
            nhan_duoc = total * 4.5;
          }
        } else {
          const specialMap = {
            1: { bet: "1", special: "x" },
            2: { bet: "2", special: "d" },
            3: { bet: "3", special: "x" },
            4: { bet: "4", special: "d" },
            6: { bet: "6", special: "d" },
            7: { bet: "7", special: "x" },
            8: { bet: "8", special: "d" },
            9: { bet: "9", special: "x" },
          };

          const specialInfo = specialMap[result];
          if (specialInfo) {
            if (betType === specialInfo.bet) {
              nhan_duoc = total * 9;
            } else if (betType === specialInfo.special) {
              nhan_duoc = total * 2;
            }
          }
        }
      }

      if (nhan_duoc > 0) {
        let checkTime2 = formatDate(Date.now());

        await Bet.updateOne(
          { _id: bet._id },
          { $set: { get: nhan_duoc, status: 1 } },
        );

        await Transaction.create({
          mobile: mobile,
          detail: "Win",
          credit: nhan_duoc,
          time: checkTime2,
        });

        await User.updateOne(
          { mobile: mobile },
          { $inc: { credit: nhan_duoc } },
        );
      } else {
        await Bet.updateOne({ _id: bet._id }, { status: 2 });
      }
    };

    for (const bet of winningBets) {
      await processBet(bet);
    }

    // Result socket emit is handled by the single result processor.
    // Do NOT emit here, otherwise the same period can be broadcast twice.

  } catch (error) {
    console.error("Error in handlingWinGo1P:", error.message);
  }
};

// ============================================
// TRADE COMMISSION
// ============================================

const tradeCommission = async () => {
  try {
    const users = await User.find({ pending_commission: { $gt: 0 } });

    if (users.length === 0) {
      console.log("No users with pending commission.");
      return;
    }

    const sumdate = formatDate(Date.now());

    for (const user of users) {
      await User.updateOne(
        { mobile: user.mobile },
        {
          $inc: { credit: user.pending_commission },
          $set: { pending_commission: 0 },
        },
      );

      await Transaction.create({
        mobile: user.mobile,
        detail: "Agent Commission",
        credit: user.pending_commission,
        time: sumdate,
      });
    }
  } catch (error) {
    console.error("Error processing commissions:", error);
  }
};

const tradeCommissionadmin = async (req, res) => {
  try {
    const users = await User.find({ pending_commission: { $gt: 0 } });

    if (users.length === 0) {
      return res.status(200).json({
        message: "No users with pending commission!",
        status: true,
      });
    }

    const sumdate = formatDate(Date.now());

    for (const user of users) {
      await User.updateOne(
        { mobile: user.mobile },
        {
          $inc: { credit: user.pending_commission },
          $set: { pending_commission: 0 },
        },
      );

      await Transaction.create({
        mobile: user.mobile,
        detail: "Agent Commission",
        credit: user.pending_commission,
        time: sumdate,
      });
    }

    return res.status(200).json({
      message: "commission Successfully!",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error!",
      status: false,
    });
  }
};

const tradeCommissionGet = async (req, res) => {
  try {
    const users = await User.find({ pending_commission: { $gt: 0 } });
    return res.status(200).json({
      message: "commission Successfully!",
      status: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error!",
      status: false,
    });
  }
};

// ============================================
// API FETCH FUNCTIONS
// ============================================

const maxApiRetries = 3;
const apiTimeout = 900;

const fetchApiData_bdgwin_10 = async () => {
  const ts = Date.now();
  const apiUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${ts}`;

  const headers = {
    accept: "application/json, text/plain, */*",
  };

  let attempts = 0;

  while (attempts < maxApiRetries) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), apiTimeout);
      const startTime = Date.now();
      const response = await axios.get(apiUrl, {
        headers,
        timeout: apiTimeout,
      });
      const endTime = Date.now();

      clearTimeout(timeout);

      if (endTime - startTime > apiTimeout) {
        attempts++;
        continue;
      }

      return response.data?.data?.list?.[0] || null;
    } catch (error) {
      attempts++;
      console.error(`API call failed (Attempt ${attempts}):`, error.message);
      if (attempts >= maxApiRetries) {
        throw new Error("API failed after maximum retries");
      }
    }
  }
  return null;
};

const fetchApiData_bdgwin_1 = async () => {
  const ts = Date.now();
  const apiUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=${ts}`;

  const headers = {
    accept: "application/json, text/plain, */*",
  };

  let attempts = 0;

  while (attempts < maxApiRetries) {
    try {
      const startTime = Date.now();
      const response = await axios.get(apiUrl, {
        headers,
        timeout: apiTimeout,
      });
      const endTime = Date.now();

      if (endTime - startTime > apiTimeout) {
        attempts++;
        continue;
      }

      return response.data?.data?.list?.[0] || null;
    } catch (error) {
      attempts++;
      console.error(`API call failed (Attempt ${attempts}):`, error.message);
      if (attempts >= maxApiRetries) {
        throw new Error("API failed after maximum retries");
      }
    }
  }
  return null;
};

// ============================================
// DEFINERESULT - Smart Result Generation
// ============================================

const defineresult = async (game) => {
  try {
    const gameMappings = {
      1: { join: "wingo", updatenum: 1 },
      3: { join: "wingo3", updatenum: 2 },
      5: { join: "wingo5", updatenum: 3 },
      10: { join: "wingo10", updatenum: 4 },
    };

    const { join, updatenum } = gameMappings[game] || {};
    if (!join) throw new Error("Invalid game type provided");

    const winGoNow = await Wingo.findOne({ status: 0, game: join })
      .sort({ _id: -1 })
      .limit(1);

    if (!winGoNow) {
      return generateRandomResult();
    }

    const period = winGoNow.period;

    const betColumns = [
      { name: "red_small", bets: ["0", "2", "4", "d", "n"] },
      { name: "red_big", bets: ["6", "8", "d", "l"] },
      { name: "green_big", bets: ["5", "7", "9", "x", "l"] },
      { name: "green_small", bets: ["1", "3", "x", "n"] },
      { name: "violet_small", bets: ["0", "t", "n"] },
      { name: "violet_big", bets: ["5", "t", "l"] },
    ];

    shuffleArrayInPlace(betColumns);

    const categories = await Promise.all(
      betColumns.map(async (column) => {
        const result = await Bet.aggregate([
          {
            $match: {
              game: join,
              status: 0,
              isdemo: false,
              bet: { $in: column.bets },
            },
          },
          { $group: { _id: null, total_money: { $sum: "$money" } } },
        ]);

        return {
          name: column.name,
          total_money: parseInt(result[0]?.total_money) || 0,
        };
      }),
    );

    shuffleArrayInPlace(categories);

    const smallestCategory = categories.reduce((smallest, category) =>
      !smallest || category.total_money < smallest.total_money
        ? category
        : smallest,
    );

    const [color, size] = smallestCategory.name.split("_");
    const availableBets =
      betColumns.find((col) => col.name === `${color}_${size}`)?.bets || [];
    const validBets = availableBets.filter((bet) => !isNaN(parseInt(bet, 10)));

    const randomIndex = Math.floor(Math.random() * validBets.length);
    return parseInt(validBets[randomIndex], 10);
  } catch (error) {
    console.error("Error in defineresult:", error);
    return generateRandomResult();
  }
};

// ============================================
// ADD WINGO 30 SECOND
// ============================================

let lastCallTime30 = 0;
const lockDuration30 = 3000;

const addWinGo_30 = async () => {
  // DISABLED: result processing is owned exclusively by server.js
  // processResultImmediately() at the exact timer boundary.
  // Keeping this function as a no-op prevents legacy callers from
  // generating a second result for the same period.
  console.log("[RESULT ENGINE] addWinGo_30 ignored: centralized processor is active.");
  return;
};

// ============================================
// ADD WINGO 1 MINUTE
// ============================================

const addWinGo_1 = async () => {
  // DISABLED: result processing is owned exclusively by server.js
  // processResultImmediately() at the exact timer boundary.
  // Keeping this function as a no-op prevents legacy callers from
  // generating a second result for the same period.
  console.log("[RESULT ENGINE] addWinGo_1 ignored: centralized processor is active.");
  return;
};

// ============================================
// ADD WINGO 3 MINUTE
// ============================================

let lastCallTime3 = 0;
const lockDuration3 = 3000;

const addWinGo_3 = async () => {
  // DISABLED: result processing is owned exclusively by server.js
  // processResultImmediately() at the exact timer boundary.
  // Keeping this function as a no-op prevents legacy callers from
  // generating a second result for the same period.
  console.log("[RESULT ENGINE] addWinGo_3 ignored: centralized processor is active.");
  return;
};

// ============================================
// ADD WINGO 5 MINUTE
// ============================================

let lastCallTime5 = 0;
const lockDuration5 = 3000;

const addWinGo_5 = async () => {
  // DISABLED: result processing is owned exclusively by server.js
  // processResultImmediately() at the exact timer boundary.
  // Keeping this function as a no-op prevents legacy callers from
  // generating a second result for the same period.
  console.log("[RESULT ENGINE] addWinGo_5 ignored: centralized processor is active.");
  return;
};

// ============================================
// ADD TRX (11)
// ============================================

const addWinGo_11 = async () => {
  try {
    const join = "trx";
    console.log(`[TRX] Period processed`);
  } catch (error) {
    console.error("addWinGo_11 error:", error);
  }
};


// ============================================
// ADMIN - GET ALL BETS
// ============================================

const getAdminBets = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 50,
      game,
      status,
      bet,
      mobile,
      period,
    } = req.query;

    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 50, 1), 200);

    // =========================
    // FILTER
    // =========================
    const filter = {};

    // Game filter
    if (game && game !== "all") {
      const validGames = [
        "wingo",
        "wingo3",
        "wingo5",
        "wingo10",
        "trx",
        "trx3",
        "trx5",
        "trx10",
      ];

      if (!validGames.includes(game)) {
        return res.status(400).json({
          message: "Invalid game",
          status: false,
        });
      }

      filter.game = game;
    }

    // Status filter
    if (
      status !== undefined &&
      status !== "" &&
      status !== "all"
    ) {
      const numericStatus = Number(status);

      if (![0, 1, 2].includes(numericStatus)) {
        return res.status(400).json({
          message: "Invalid status",
          status: false,
        });
      }

      filter.status = numericStatus;
    }

    // Bet type / number filter
    if (bet && bet !== "all") {
      filter.bet = String(bet);
    }

    // Mobile filter
    if (mobile && mobile.trim() !== "") {
      filter.mobile = {
        $regex: mobile.trim(),
        $options: "i",
      };
    }

    // Period / Timer filter
    if (period && period.trim() !== "") {
      filter.stage = {
        $regex: period.trim(),
        $options: "i",
      };
    }

    // =========================
    // PAGINATION
    // =========================
    const skip = (page - 1) * limit;

    const [bets, total] = await Promise.all([
      Bet.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Bet.countDocuments(filter),
    ]);

    // =========================
    // FORMAT BET DATA
    // =========================
    const formattedBets = bets.map((item) => {
      const statusMap = {
        0: "Pending",
        1: "Won",
        2: "Lost",
      };

      const betTypeMap = {
        l: "Big",
        n: "Small",
        d: "Red",
        x: "Green",
        t: "Violet",

        "0": "Number 0",
        "1": "Number 1",
        "2": "Number 2",
        "3": "Number 3",
        "4": "Number 4",
        "5": "Number 5",
        "6": "Number 6",
        "7": "Number 7",
        "8": "Number 8",
        "9": "Number 9",
      };

      const money = Number(item.money || 0);
      const winningAmount = Number(item.get || 0);

      let netResult = 0;

      if (item.status === 1) {
        netResult = winningAmount - money;
      } else if (item.status === 2) {
        netResult = -money;
      }

      return {
        _id: item._id,
        id_product: item.id_product,

        // USER
        mobile: item.mobile,
        code: item.code,
        invite: item.invite,

        // GAME
        game: item.game,
        period: item.stage,
        timer: item.stage,

        // BET
        bet: item.bet,
        betType: betTypeMap[item.bet] || item.bet,

        // MONEY
        money,
        amount: Number(item.amount || 0),
        fee: Number(item.fee || 0),

        // RESULT
        result:
          item.result !== null &&
          item.result !== undefined
            ? Number(item.result)
            : null,

        // WIN
        winningAmount,

        // STATUS
        status: item.status,
        statusText: statusMap[item.status] || "Unknown",

        // PROFIT / LOSS
        netResult,

        // OTHER
        level: item.level,
        isdemo: item.isdemo,

        today: item.today,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    // =========================
    // SUMMARY
    // =========================
    const summary = await Bet.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: null,

          totalBets: {
            $sum: 1,
          },

          totalBetAmount: {
            $sum: "$money",
          },

          totalFee: {
            $sum: "$fee",
          },

          totalWinningAmount: {
            $sum: "$get",
          },

          pendingBets: {
            $sum: {
              $cond: [{ $eq: ["$status", 0] }, 1, 0],
            },
          },

          wonBets: {
            $sum: {
              $cond: [{ $eq: ["$status", 1] }, 1, 0],
            },
          },

          lostBets: {
            $sum: {
              $cond: [{ $eq: ["$status", 2] }, 1, 0],
            },
          },
        },
      },
    ]);

    const stats = summary[0] || {
      totalBets: 0,
      totalBetAmount: 0,
      totalFee: 0,
      totalWinningAmount: 0,
      pendingBets: 0,
      wonBets: 0,
      lostBets: 0,
    };

    return res.status(200).json({
      message: "Admin bets fetched successfully",
      status: true,

      data: formattedBets,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },

      stats: {
        totalBets: stats.totalBets || 0,
        totalBetAmount: Number(stats.totalBetAmount || 0),
        totalFee: Number(stats.totalFee || 0),
        totalWinningAmount: Number(
          stats.totalWinningAmount || 0
        ),
        pendingBets: stats.pendingBets || 0,
        wonBets: stats.wonBets || 0,
        lostBets: stats.lostBets || 0,
      },
    });
  } catch (error) {
    console.error("Error in getAdminBets:", error);

    return res.status(500).json({
      message: "Internal server error!",
      status: false,
      error: error.message,
    });
  }
};


// ============================================
// EXPORT
// ============================================

module.exports = {
  winGoPage,
  winGoPage3,
  winGoPage5,
  winGoPage10,
  betWinGo,
  listOrderOld,
  GetMyEmerdList,
  handlingWinGo1P,
  tradeCommission,
  tradeCommissionadmin,
  tradeCommissionGet,
  addWinGo_30,
  addWinGo_1,
  addWinGo_3,
  addWinGo_5,
  addWinGo_11,
  setIo,
  getAdminBets,
  generateRandomResult,
  defineresult,
  calculateTimer,
  emitGameResult,
  emitTimerUpdate,
};