const Bid = require("../models/Bid");
const Market = require("../models/Market");
const User = require("../models/authmodel");
const mongoose = require("mongoose");
const WinMultiplier = require("../models/WinMultiplier");
const CurrencyRate = require("../models/CurrencyRate");

// ============================================================
// MARKET DAY HELPERS (marketArray based)
// ============================================================
const toDateKey = (value = new Date()) => {
  const d = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const findMarketDay = (market, marketDayId = null, marketDate = null) => {
  if (!market || !Array.isArray(market.marketArray)) return null;

  if (marketDayId) {
    const found = market.marketArray.id
      ? market.marketArray.id(marketDayId)
      : market.marketArray.find((d) => String(d._id) === String(marketDayId));
    if (found) return found;
  }

  if (marketDate) {
    const key = toDateKey(marketDate);
    const found = market.marketArray.find(
      (d) => toDateKey(d.marketDate) === key,
    );
    if (found) return found;
  }

  const todayKey = toDateKey(new Date());
  return (
    market.marketArray.find((d) => toDateKey(d.marketDate) === todayKey) || null
  );
};

const requireMarketDay = (market, marketDayId = null, marketDate = null) => {
  const day = findMarketDay(market, marketDayId, marketDate);
  if (!day) {
    const err = new Error(
      "Market day not found. Send a valid marketDayId or marketDate for a marketArray entry.",
    );
    err.statusCode = 404;
    throw err;
  }
  return day;
};

const attachMarketDayCompatibility = (market, day) => {
  if (!market || !day) return market;
  Object.defineProperties(market, {
    isActive: { value: day.isActive, writable: true, configurable: true },
    isResultDeclared: {
      value: day.isResultDeclared,
      writable: true,
      configurable: true,
    },
    minBid: { value: day.minBid, writable: true, configurable: true },
    maxBid: { value: day.maxBid, writable: true, configurable: true },
    openTime: { value: day.openTime, writable: true, configurable: true },
    closeTime: { value: day.closeTime, writable: true, configurable: true },
    resultTime: { value: day.resultTime, writable: true, configurable: true },
    winningNumber: {
      value: day.winningNumber,
      writable: true,
      configurable: true,
    },
    resultDeclaredAt: {
      value: day.resultDeclaredAt,
      writable: true,
      configurable: true,
    },
    declaredGameType: {
      value: day.declaredGameType || null,
      writable: true,
      configurable: true,
    },
  });
  return market;
};

const getDayFromBid = (bid, market) =>
  findMarketDay(market, bid?.marketDayId, bid?.marketDate);

const decorateBidMarketDay = (bid) => {
  if (!bid?.marketId || !Array.isArray(bid.marketId.marketArray)) return bid;
  const day = getDayFromBid(bid, bid.marketId);
  if (day) bid.marketDay = day;
  return bid;
};

// ============================================================
// MARKET DIGIT TYPE / GAME TYPE CONFIG
// ============================================================
const TWO_DIGIT_GAME_TYPES = ["single", "jodi", "last-digit", "first-digit"];

const THREE_DIGIT_GAME_TYPES = [
  "single",
  "single-Patti",
  "double-Patti",
  "triple-Patti",
  "jodi",
  "panna",
  "half-sangam",
  "full-sangam",
  "last-digit",
  "first-digit",
];

const ALL_GAME_TYPES = [
  ...new Set([...TWO_DIGIT_GAME_TYPES, ...THREE_DIGIT_GAME_TYPES]),
];

// ============================================================
// NORMALIZE DIGIT TYPE
// ============================================================
const normalizeDigitType = (market) => {
  if (!market) return null;

  const raw = String(
    market.digitType || market.numberType || market.digitsType || "",
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (["2", "2digit", "2-digits", "2digitnumber", "2-digit"].includes(raw)) {
    return "2-digit";
  }

  if (["3", "3digit", "3-digits", "3digitnumber", "3-digit"].includes(raw)) {
    return "3-digit";
  }

  return null;
};

// ============================================================
// GET MARKET GAME TYPES
// ============================================================
const getMarketGameTypes = (market) => {
  const digitType = normalizeDigitType(market);

  if (digitType === "2-digit") return [...TWO_DIGIT_GAME_TYPES];
  if (digitType === "3-digit") return [...THREE_DIGIT_GAME_TYPES];

  if (Array.isArray(market?.gameTypes) && market.gameTypes.length > 0) {
    return market.gameTypes.filter((type) => ALL_GAME_TYPES.includes(type));
  }

  return [];
};

const isGameTypeAllowedForMarket = (market, gameType) =>
  getMarketGameTypes(market).includes(gameType);

// ============================================================
// FORMAT NUMBER
// ============================================================
const formatGameNumber = (gameType, number) => {
  const value = String(number).trim();

  if (["jodi", "last-digit", "first-digit"].includes(gameType)) {
    return value.padStart(2, "0");
  }

  if (gameType === "single") return value.padStart(1, "0");

  if (
    ["single-Patti", "double-Patti", "triple-Patti", "panna"].includes(gameType)
  ) {
    return value.padStart(3, "0");
  }

  if (gameType === "half-sangam" || gameType === "full-sangam") {
    return value;
  }

  return value;
};

// ============================================================
// MARKET CONFIG VALIDATION
// ============================================================
const validateMarketDigitType = (market) => {
  const digitType = normalizeDigitType(market);
  const gameTypes = getMarketGameTypes(market);

  if (!digitType && gameTypes.length === 0) {
    return {
      valid: false,
      digitType: null,
      gameTypes: [],
      message:
        "Market digit type is not configured. Set market digitType to 2-digit or 3-digit.",
    };
  }

  return { valid: true, digitType: digitType || null, gameTypes };
};

// ============================================================
// GENERATE TRANSACTION ID
// ============================================================
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BID${timestamp}${random}`;
};

// ============================================================
// COUNTRY -> CURRENCY FALLBACK MAP
// ============================================================
const COUNTRY_CURRENCY_MAP = {
  IN: "INR",
  INDIA: "INR",
  NP: "NPR",
  NEPAL: "NPR",
  BD: "BDT",
  BANGLADESH: "BDT",
  PK: "PKR",
  PAKISTAN: "PKR",
  AU: "AUD",
  AUSTRALIA: "AUD",
  AE: "AED",
  UAE: "AED",
  "UNITED ARAB EMIRATES": "AED",
};

// ============================================================
// GET USER CURRENCY (helper)
// ============================================================
/**
 * Returns the active CurrencyRate document for the user's country.
 * Falls back to country->currency map, then to INR.
 * Returns: { currency, rate, currencyCode, countryCode } or null
 */
const getUserCurrency = async (user, session = null) => {
  if (!user) return null;

  const rawCountry = String(user.country || "IN")
    .trim()
    .toUpperCase();

  // 1) Find by countryCode
  let query = CurrencyRate.findOne({
    countryCode: rawCountry,
    status: true,
  });
  if (session) query.session(session);

  let currency = await query;

  // 2) Fallback by currencyCode
  if (!currency) {
    const currencyCode = COUNTRY_CURRENCY_MAP[rawCountry];
    if (currencyCode) {
      let fb = CurrencyRate.findOne({ currencyCode, status: true });
      if (session) fb.session(session);
      currency = await fb;
    }
  }

  // 3) Default INR
  if (!currency) {
    let def = CurrencyRate.findOne({
      $or: [
        { countryCode: "IN", currencyCode: "INR" },
        { countryCode: "INDIA", currencyCode: "INR" },
        { currencyCode: "INR" },
      ],
      status: true,
    });
    if (session) def.session(session);
    currency = await def;
  }

  if (!currency) {
    // No currency config at all -> treat as INR 1:1
    return {
      currency: null,
      rate: 1,
      currencyCode: "INR",
      countryCode: rawCountry || "IN",
    };
  }

  const rate = Number(currency.rate);
  if (!Number.isFinite(rate) || rate <= 0) {
    return {
      currency,
      rate: 1,
      currencyCode: currency.currencyCode || "INR",
      countryCode: currency.countryCode || rawCountry || "IN",
    };
  }

  return {
    currency,
    rate,
    currencyCode: currency.currencyCode || "INR",
    countryCode: currency.countryCode || rawCountry || "IN",
  };
};

// ============================================================
// CONVERT USER CURRENCY <-> INR
// ============================================================
/**
 * Rate meaning (per screenshot):
 *   1 user-currency-unit = `rate` INR
 *   e.g. 1 AUD = 68.37 INR, 1 NPR = 0.63 INR, 1 INR = 1 INR
 */
const userCurrencyToINR = (amount, rate) => {
  const a = Number(amount);
  const r = Number(rate);
  if (!Number.isFinite(a) || !Number.isFinite(r) || r <= 0) return 0;
  return a * r;
};

const inrToUserCurrency = (amountINR, rate) => {
  const a = Number(amountINR);
  const r = Number(rate);
  if (!Number.isFinite(a) || !Number.isFinite(r) || r <= 0) return 0;
  return Number((a / r).toFixed(2));
};

// ============================================================
// CALCULATE WIN AMOUNT
// ============================================================
/**
 * Bid amount is in user's currency.
 * 1. Convert bid amount -> INR
 * 2. Apply INR-based win multiplier
 * 3. Convert back to user's currency
 */
const calculateWinAmount = async (
  gameType,
  bidAmount,
  user,
  session = null,
) => {
  try {
    if (!user) return 0;

    const multiplierQuery = WinMultiplier.findOne();
    if (session) multiplierQuery.session(session);
    const settings = await multiplierQuery;

    if (!settings || !settings.multipliers) return 0;

    const multiplierData = settings.multipliers.get(gameType);
    if (!multiplierData) return 0;

    const multiplier = Number(multiplierData.value);
    const amount = Number(bidAmount);

    if (!Number.isFinite(multiplier) || multiplier < 0) return 0;
    if (!Number.isFinite(amount) || amount <= 0) return 0;

    const currencyInfo = await getUserCurrency(user, session);
    if (!currencyInfo) return 0;

    const rate = Number(currencyInfo.rate);
    if (!Number.isFinite(rate) || rate <= 0) return 0;

    // Win calculation is performed through INR, but the final amount
    // returned/saved is ALWAYS in the user's own currency.
    const bidAmountInINR = userCurrencyToINR(amount, rate);
    const winAmountInINR = bidAmountInINR * multiplier;
    const winAmountUserCurrency = inrToUserCurrency(winAmountInINR, rate);

    return Number(winAmountUserCurrency.toFixed(2));
  } catch (error) {
    console.error("Calculate Win Amount Error:", error);
    return 0;
  }
};

// ============================================================
// CALCULATE BID AMOUNT IN INR (helper)
// ============================================================
const calculateBidAmountInINR = async (amount, user, session = null) => {
  const { rate } = await getUserCurrency(user, session);
  return userCurrencyToINR(amount, rate);
};

// ============================================================
// VALIDATE BID NUMBER
// ============================================================
const validateNumber = (gameType, number) => {
  const str = String(number).trim();

  switch (gameType) {
    case "single":
      return /^[0-9]$/.test(str);

    case "single-Patti":
      return /^[0-9]{3}$/.test(str) && new Set(str.split("")).size === 3;

    case "double-Patti":
      return /^[0-9]{3}$/.test(str) && new Set(str.split("")).size === 2;

    case "triple-Patti":
      return /^[0-9]{3}$/.test(str) && new Set(str.split("")).size === 1;

    case "jodi":
      return /^[0-9]{2}$/.test(str);

    case "panna":
      return /^[0-9]{3}$/.test(str);

    case "half-sangam":
      return /^[0-9]{3}-[0-9]$/.test(str) || /^[0-9]-[0-9]{3}$/.test(str);

    case "full-sangam":
      return /^[0-9]{3}-[0-9]{3}$/.test(str);

    case "last-digit":
      return /^[0-9]{2}$/.test(str);

    case "first-digit":
      return /^[0-9]{2}$/.test(str);

    default:
      return false;
  }
};

// ============================================================
// CHECK BID WIN
// ============================================================
const checkBidWin = (bid, winningNumber) => {
  const winningNumStr = String(winningNumber).trim();
  const bidNumStr = String(bid.number).trim();

  switch (bid.gameType) {
    case "single":
      return /^[0-9]$/.test(winningNumStr) && winningNumStr === bidNumStr;

    case "single-Patti":
      return (
        /^[0-9]{3}$/.test(winningNumStr) &&
        new Set(winningNumStr.split("")).size === 3 &&
        winningNumStr === bidNumStr
      );

    case "double-Patti":
      return (
        /^[0-9]{3}$/.test(winningNumStr) &&
        new Set(winningNumStr.split("")).size === 2 &&
        winningNumStr === bidNumStr
      );

    case "triple-Patti":
      return (
        /^[0-9]{3}$/.test(winningNumStr) &&
        new Set(winningNumStr.split("")).size === 1 &&
        winningNumStr === bidNumStr
      );

    case "jodi":
    case "panna":
      return winningNumStr === bidNumStr;

    case "half-sangam": {
      const bidParts = bidNumStr.split("-");
      const resultParts = winningNumStr.split("-");
      if (bidParts.length !== 2 || resultParts.length !== 2) return false;

      const [bidFirst, bidSecond] = bidParts;
      const [resultFirst, resultSecond] = resultParts;

      if (bidFirst.length === 3 && bidSecond.length === 1) {
        return (
          resultFirst.length === 3 &&
          resultSecond.length === 1 &&
          resultFirst === bidFirst &&
          resultSecond === bidSecond
        );
      }

      if (bidFirst.length === 1 && bidSecond.length === 3) {
        return (
          resultFirst.length === 1 &&
          resultSecond.length === 3 &&
          resultFirst === bidFirst &&
          resultSecond === bidSecond
        );
      }

      return false;
    }

    case "full-sangam": {
      const bidParts = bidNumStr.split("-");
      const resultParts = winningNumStr.split("-");
      if (bidParts.length !== 2 || resultParts.length !== 2) return false;

      if (
        bidParts[0].length !== 3 ||
        bidParts[1].length !== 3 ||
        resultParts[0].length !== 3 ||
        resultParts[1].length !== 3
      ) {
        return false;
      }

      return bidParts[0] === resultParts[0] && bidParts[1] === resultParts[1];
    }

    case "last-digit":
      return winningNumStr.slice(-1) === bidNumStr.slice(-1);

    case "first-digit":
      return winningNumStr.charAt(0) === bidNumStr.charAt(0);

    default:
      return false;
  }
};

// ============================================================
// PLACE SINGLE BID
// ============================================================
exports.placeBid = async (req, res) => {
  try {
    const { marketId, marketDayId, marketDate, gameType, number, bidAmount } =
      req.body;

    const userId = req.user.id;

    if (
      !marketId ||
      !gameType ||
      number === undefined ||
      number === null ||
      bidAmount === undefined ||
      bidAmount === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: marketId, gameType, number, bidAmount",
      });
    }

    if (!ALL_GAME_TYPES.includes(gameType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid game type. Allowed: single, single-Patti, double-Patti, triple-Patti, jodi, panna, half-sangam, full-sangam, last-digit, first-digit",
      });
    }

    if (!validateNumber(gameType, number)) {
      return res.status(400).json({
        success: false,
        message: `Invalid number format for ${gameType}`,
      });
    }

    const amount = Number(bidAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Bid amount must be greater than 0",
      });
    }

    const market = await Market.findById(marketId);
    if (!market) {
      return res
        .status(404)
        .json({ success: false, message: "Market not found" });
    }

    const marketDay = requireMarketDay(market, marketDayId, marketDate);
    attachMarketDayCompatibility(market, marketDay);

    const marketConfig = validateMarketDigitType(market);
    if (!marketConfig.valid) {
      return res.status(400).json({
        success: false,
        message: marketConfig.message,
      });
    }

    if (!isGameTypeAllowedForMarket(market, gameType)) {
      return res.status(400).json({
        success: false,
        message: `Game type '${gameType}' is not supported by this market`,
        digitType: marketConfig.digitType,
        supportedTypes: marketConfig.gameTypes,
      });
    }

    if (!market.isActive) {
      return res.status(400).json({
        success: false,
        message: "Market is currently inactive",
      });
    }

    if (market.isResultDeclared) {
      return res.status(400).json({
        success: false,
        message: "Result already declared for this market",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.status === "suspended" || user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is suspended or blocked. Please contact support.",
      });
    }

    // ---- Currency info ----
    const currencyInfo = await getUserCurrency(user);
    const { rate, currencyCode } = currencyInfo;

    // ---- Market min/max are stored in INR. Convert user amount -> INR ----
    const amountInINR = userCurrencyToINR(amount, rate);

    if (!Number.isFinite(amountInINR) || amountInINR <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to convert bid amount to INR. Please check currency rate.",
      });
    }

    if (amountInINR < market.minBid || amountInINR > market.maxBid) {
      const minUser = Number((market.minBid / rate).toFixed(2));
      const maxUser = Number((market.maxBid / rate).toFixed(2));
      return res.status(400).json({
        success: false,
        message: `Bid amount must be between ${minUser} and ${maxUser} ${currencyCode} (₹${market.minBid} - ₹${market.maxBid} INR)`,
        minBid: market.minBid,
        maxBid: market.maxBid,
        minBidUserCurrency: minUser,
        maxBidUserCurrency: maxUser,
        currencyCode,
        rate,
      });
    }

    // credit is maintained in INR
    if (Number(user.credit) < amount) {
      const creditUserCurrency = Number(user.credit);
      return res.status(400).json({
        success: false,
        message: "Insufficient credit",
        credit: user.credit,
        creditUserCurrency,
        currencyCode,
        required: amount,
        requiredUserCurrency: amount,
      });
    }

    const possibleWinAmount = await calculateWinAmount(gameType, amount, user);
    if (possibleWinAmount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to calculate winning amount. Please check WinMultiplier settings.",
      });
    }

    const formattedNumber = formatGameNumber(gameType, number);

    const bid = await Bid.create({
      userId,
      marketId,
      marketDayId: marketDay._id,
      marketDate: marketDay.marketDate,
      gameType,
      number: formattedNumber,
      bidAmount: amount, // user's actual currency amount
      bidAmountUserCurrency: amount, // user-currency snapshot
      currencyCode, // e.g. "AUD"
      currencyRate: rate, // e.g. 68.37
      possibleWinAmount, // user's currency (wallet/accounting)
      transactionId: generateTransactionId(),
      status: "pending",
      bidTime: new Date(),
    });

    console.log(bid);

    user.credit = Number(user.credit) - amount;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Bid placed successfully",
      data: {
        bid: {
          id: bid._id,
          transactionId: bid.transactionId,
          market: {
            id: market._id,
            name: market.name,
            marketDayId: marketDay._id,
            marketDate: marketDay.marketDate,
            marketId: market.marketId,
            digitType: marketConfig.digitType,
          },
          gameType: bid.gameType,
          number: bid.number,
          bidAmount: bid.bidAmount, // user currency
          bidAmountUserCurrency: bid.bidAmountUserCurrency, // user currency
          currencyCode: bid.currencyCode,
          currencyRate: bid.currencyRate,
          possibleWinAmount: bid.possibleWinAmount, // user currency
          possibleWinAmountUserCurrency: Number(bid.possibleWinAmount),
          status: bid.status,
          bidTime: bid.bidTime,
          createdAt: bid.createdAt,
        },
        wallet: {
          deducted: amount, // user currency
          deductedINR: amountInINR,
          currencyCode,
          rate,
          remainingcredit: user.credit, // user currency
          remainingcreditUserCurrency: Number(user.credit),
        },
      },
    });
  } catch (error) {
    console.error("Place Bid Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// PLACE MULTIPLE BIDS
// ============================================================
exports.placeMultipleBids = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bids } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(bids) || bids.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Bids array is required and cannot be empty",
      });
    }

    if (bids.length > 50) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Maximum 50 bids can be placed at once",
      });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.status === "suspended" || user.status === "blocked") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message:
          "Your account is suspended or blocked. Please contact support.",
      });
    }

    const currencyInfo = await getUserCurrency(user, session);
    const { rate, currencyCode } = currencyInfo;

    let totalBidAmountINR = 0;
    const validatedBids = [];

    for (let i = 0; i < bids.length; i++) {
      const currentBid = bids[i];
      const { marketId, marketDayId, marketDate, gameType, number, bidAmount } =
        currentBid;

      if (
        !marketId ||
        !gameType ||
        number === undefined ||
        number === null ||
        bidAmount === undefined ||
        bidAmount === null
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Bid at index ${i} has missing required fields`,
        });
      }

      if (!ALL_GAME_TYPES.includes(gameType)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Invalid game type '${gameType}' at index ${i}`,
        });
      }

      if (!validateNumber(gameType, number)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Invalid number '${number}' for ${gameType} at index ${i}`,
        });
      }

      const amount = Number(bidAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Invalid bid amount at index ${i}`,
        });
      }

      const market = await Market.findById(marketId).session(session);
      if (!market) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Market not found at index ${i}`,
        });
      }

      const marketDay = requireMarketDay(market, marketDayId, marketDate);
      attachMarketDayCompatibility(market, marketDay);

      const marketConfig = validateMarketDigitType(market);
      if (!marketConfig.valid) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: marketConfig.message,
        });
      }

      if (!isGameTypeAllowedForMarket(market, gameType)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Game type '${gameType}' is not supported by market '${market.name}'`,
          digitType: marketConfig.digitType,
          supportedTypes: marketConfig.gameTypes,
        });
      }

      if (!market.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Market '${market.name}' is inactive`,
        });
      }

      if (market.isResultDeclared) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Result already declared for market '${market.name}'`,
        });
      }

      const amountInINR = userCurrencyToINR(amount, rate);
      if (!Number.isFinite(amountInINR) || amountInINR <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Unable to convert bid amount at index ${i} to INR`,
        });
      }

      if (amountInINR < market.minBid || amountInINR > market.maxBid) {
        const minUser = Number((market.minBid / rate).toFixed(2));
        const maxUser = Number((market.maxBid / rate).toFixed(2));
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Bid amount for '${market.name}' must be between ${minUser} and ${maxUser} ${currencyCode} (₹${market.minBid} - ₹${market.maxBid} INR)`,
        });
      }

      const possibleWinAmount = await calculateWinAmount(
        gameType,
        amount,
        user,
        session,
      );

      if (possibleWinAmount === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Unable to calculate winning amount for '${gameType}'`,
        });
      }

      totalBidAmountINR += amountInINR;

      validatedBids.push({
        ...currentBid,
        marketDayId: marketDay._id,
        marketDate: marketDay.marketDate,
        amount,
        amountInINR,
        formattedNumber: formatGameNumber(gameType, number),
        possibleWinAmount,
      });
    }

    const totalBidAmountUserCurrency = bids.reduce(
      (sum, item) => sum + Number(item.bidAmount),
      0,
    );

    if (Number(user.credit) < totalBidAmountUserCurrency) {
      const creditUserCurrency = Number(user.credit);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Insufficient credit for all bids",
        required: totalBidAmountUserCurrency,
        requiredUserCurrency: totalBidAmountUserCurrency,
        available: user.credit,
        availableUserCurrency: creditUserCurrency,
        currencyCode,
        rate,
        shortfall: Number(
          (totalBidAmountUserCurrency - Number(user.credit)).toFixed(2),
        ),
      });
    }

    const createdBids = [];

    for (const bidData of validatedBids) {
      const created = await Bid.create(
        [
          {
            userId,
            marketId: bidData.marketId,
            marketDayId: bidData.marketDayId,
            marketDate: bidData.marketDate,
            gameType: bidData.gameType,
            number: bidData.formattedNumber,
            bidAmount: bidData.amount,
            bidAmountUserCurrency: bidData.amount,
            currencyCode,
            currencyRate: rate,
            possibleWinAmount: bidData.possibleWinAmount,
            transactionId: generateTransactionId(),
            status: "pending",
            bidTime: new Date(),
          },
        ],
        { session },
      );

      createdBids.push(created[0]);
    }

    user.credit = Number(user.credit) - totalBidAmountUserCurrency;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: `${createdBids.length} bids placed successfully`,
      data: {
        bids: createdBids.map((bid) => ({
          id: bid._id,
          transactionId: bid.transactionId,
          marketId: bid.marketId,
          marketDayId: bid.marketDayId,
          marketDate: bid.marketDate,
          gameType: bid.gameType,
          number: bid.number,
          bidAmount: bid.bidAmount,
          bidAmountUserCurrency: bid.bidAmountUserCurrency,
          currencyCode: bid.currencyCode,
          currencyRate: bid.currencyRate,
          possibleWinAmount: bid.possibleWinAmount,
          status: bid.status,
          bidTime: bid.bidTime,
        })),
        wallet: {
          totalDeducted: totalBidAmountUserCurrency,
          totalDeductedINR: totalBidAmountINR,
          currencyCode,
          rate,
          remainingcredit: user.credit,
          remainingcreditUserCurrency: Number(user.credit),
        },
        totalBids: createdBids.length,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Place Multiple Bids Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// PLACE BID ON MULTIPLE NUMBERS
// ============================================================
exports.placeBidOnMultipleNumbers = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { marketId, marketDayId, marketDate, gameType, numbers, bidAmount } =
      req.body;
    const userId = req.user.id;

    if (
      !marketId ||
      !gameType ||
      !Array.isArray(numbers) ||
      numbers.length === 0 ||
      bidAmount === undefined ||
      bidAmount === null
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "marketId, gameType, numbers and bidAmount are required",
      });
    }

    if (numbers.length > 20) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Maximum 20 numbers can be bid at once",
      });
    }

    if (!ALL_GAME_TYPES.includes(gameType)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Invalid game type '${gameType}'`,
      });
    }

    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Bid amount must be greater than 0",
      });
    }

    const market = await Market.findById(marketId).session(session);
    if (!market) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Market not found" });
    }

    const marketDay = requireMarketDay(market, marketDayId, marketDate);
    attachMarketDayCompatibility(market, marketDay);

    const marketConfig = validateMarketDigitType(market);
    if (!marketConfig.valid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: marketConfig.message,
      });
    }

    if (!isGameTypeAllowedForMarket(market, gameType)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Game type '${gameType}' is not supported by this market`,
        digitType: marketConfig.digitType,
        supportedTypes: marketConfig.gameTypes,
      });
    }

    if (!market.isActive) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Market is currently inactive",
      });
    }

    if (market.isResultDeclared) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Result already declared for this market",
      });
    }

    const uniqueNumbers = [...new Set(numbers.map((n) => String(n).trim()))];

    for (const number of uniqueNumbers) {
      if (!validateNumber(gameType, number)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Invalid number '${number}' for ${gameType}`,
        });
      }
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.status === "suspended" || user.status === "blocked") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message:
          "Your account is suspended or blocked. Please contact support.",
      });
    }

    const currencyInfo = await getUserCurrency(user, session);
    const { rate, currencyCode } = currencyInfo;

    const amountInINR = userCurrencyToINR(amount, rate);
    if (!Number.isFinite(amountInINR) || amountInINR <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Unable to convert bid amount to INR",
      });
    }

    if (amountInINR < market.minBid || amountInINR > market.maxBid) {
      const minUser = Number((market.minBid / rate).toFixed(2));
      const maxUser = Number((market.maxBid / rate).toFixed(2));
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Bid amount must be between ${minUser} and ${maxUser} ${currencyCode} (₹${market.minBid} - ₹${market.maxBid} INR)`,
      });
    }

    const totalBidAmountINR = uniqueNumbers.length * amountInINR;

    const totalBidAmountUserCurrency = uniqueNumbers.length * amount;

    if (Number(user.credit) < totalBidAmountUserCurrency) {
      const creditUserCurrency = Number(user.credit);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Insufficient credit",
        required: totalBidAmountINR,
        requiredUserCurrency: totalBidAmountUserCurrency,
        available: user.credit,
        availableUserCurrency: creditUserCurrency,
        currencyCode,
        rate,
      });
    }

    const possibleWinAmount = await calculateWinAmount(
      gameType,
      amount,
      user,
      session,
    );

    if (possibleWinAmount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Unable to calculate winning amount",
      });
    }

    const createdBids = [];

    for (const number of uniqueNumbers) {
      const created = await Bid.create(
        [
          {
            userId,
            marketId,
            marketDayId: marketDay._id,
            marketDate: marketDay.marketDate,
            gameType,
            number: formatGameNumber(gameType, number),
            bidAmount: amount,
            bidAmountUserCurrency: amount,
            currencyCode,
            currencyRate: rate,
            possibleWinAmount,
            transactionId: generateTransactionId(),
            status: "pending",
            bidTime: new Date(),
          },
        ],
        { session },
      );

      createdBids.push(created[0]);
    }

    user.credit = Number(user.credit) - totalBidAmountUserCurrency;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: `${createdBids.length} bids placed successfully on different numbers`,
      data: {
        bids: createdBids.map((bid) => ({
          id: bid._id,
          transactionId: bid.transactionId,
          number: bid.number,
          bidAmount: bid.bidAmount,
          bidAmountUserCurrency: bid.bidAmountUserCurrency,
          currencyCode: bid.currencyCode,
          currencyRate: bid.currencyRate,
          possibleWinAmount: bid.possibleWinAmount,
          status: bid.status,
          bidTime: bid.bidTime,
        })),
        wallet: {
          totalDeducted: totalBidAmountUserCurrency,
          totalDeductedINR: totalBidAmountINR,
          currencyCode,
          rate,
          remainingcredit: user.credit,
          remainingcreditUserCurrency: Number(user.credit),
        },
        totalBids: createdBids.length,
        numbersPlayed: createdBids.map((bid) => bid.number),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Place Bid on Multiple Numbers Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// GET BIDDING HISTORY
// ============================================================
exports.getBiddingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      marketId,
      marketDayId,
      marketDate,
      gameType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { userId };

    if (status) filter.status = status;
    if (marketId) filter.marketId = marketId;
    if (marketDayId) filter.marketDayId = marketDayId;
    if (marketDate) filter.marketDate = marketDate;

    if (gameType) {
      if (!ALL_GAME_TYPES.includes(gameType)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid game type" });
      }
      filter.gameType = gameType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const bids = await Bid.find(filter)
      .populate("marketId", "name marketId digitType gameTypes marketArray")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Bid.countDocuments(filter);

    const summary = await Bid.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalPossibleWin: { $sum: "$possibleWinAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
    ]);

    const gameTypeSummary = await Bid.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$gameType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalPossibleWin: { $sum: "$possibleWinAmount" },
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        bids,
        summary,
        gameTypeSummary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get Bidding History Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// GET BID BY ID
// ============================================================
exports.getBidById = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.id;

    const bid = await Bid.findOne({ _id: bidId, userId })
      .populate("marketId", "name marketId digitType gameTypes marketArray")
      .populate("userId", "name email mobile");

    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    return res.json({ success: true, data: bid });
  } catch (error) {
    console.error("Get Bid By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// GET USER BIDS
// ============================================================
exports.getUserBids = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      marketId,
      marketDayId,
      marketDate,
      gameType,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { userId };

    if (marketId) filter.marketId = marketId;
    if (marketDayId) filter.marketDayId = marketDayId;
    if (marketDate) filter.marketDate = marketDate;

    if (gameType) {
      if (!ALL_GAME_TYPES.includes(gameType)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid game type" });
      }
      filter.gameType = gameType;
    }

    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      filter.bidAmount = {};
      if (minAmount) filter.bidAmount.$gte = Number(minAmount);
      if (maxAmount) filter.bidAmount.$lte = Number(maxAmount);
    }

    const bids = await Bid.find(filter)
      .populate("marketId", "name marketId digitType gameTypes")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Bid.countDocuments(filter);

    const stats = await Bid.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBids: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalPossibleWin: { $sum: "$possibleWinAmount" },
          totalWon: {
            $sum: { $cond: [{ $eq: ["$status", "won"] }, 1, 0] },
          },
          totalLost: {
            $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] },
          },
          totalPending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          totalWonAmount: { $sum: "$winAmount" },
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        bids,
        statistics: stats[0] || {
          totalBids: 0,
          totalAmount: 0,
          totalPossibleWin: 0,
          totalWon: 0,
          totalLost: 0,
          totalPending: 0,
          totalWonAmount: 0,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get User Bids Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// TODAY BIDS SUMMARY
// ============================================================
exports.getTodayBidsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateFilter = {
      userId: objectUserId,
      createdAt: { $gte: today, $lt: tomorrow },
    };

    const statusSummary = await Bid.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          totalBids: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalPossibleWin: { $sum: "$possibleWinAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
    ]);

    const gameTypeSummary = await Bid.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$gameType",
          totalBids: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalPossibleWin: { $sum: "$possibleWinAmount" },
        },
      },
    ]);

    const marketSummary = await Bid.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$marketId",
          totalBids: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
        },
      },
      {
        $lookup: {
          from: "markets",
          localField: "_id",
          foreignField: "_id",
          as: "market",
        },
      },
      {
        $unwind: {
          path: "$market",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          marketName: "$market.name",
          marketId: "$market.marketId",
          digitType: "$market.digitType",
          totalBids: 1,
          totalAmount: 1,
        },
      },
    ]);

    const totalBids = await Bid.countDocuments(dateFilter);

    const totalAmountResult = await Bid.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: "$bidAmount" },
          totalPossibleWin: { $sum: "$possibleWinAmount" },
        },
      },
    ]);

    const getStatus = (status) =>
      statusSummary.find((item) => item._id === status) || {
        totalBids: 0,
        totalAmount: 0,
        totalPossibleWin: 0,
        totalWinAmount: 0,
      };

    return res.status(200).json({
      success: true,
      data: {
        date: today,
        totalBids,
        totalAmount: totalAmountResult[0]?.total || 0,
        totalPossibleWin: totalAmountResult[0]?.totalPossibleWin || 0,
        pending: getStatus("pending"),
        won: getStatus("won"),
        lost: getStatus("lost"),
        cancelled: getStatus("cancelled"),
        gameTypeSummary,
        marketSummary,
      },
    });
  } catch (error) {
    console.error("getTodayBidsSummary Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ============================================================
// CANCEL BID
// ============================================================
exports.cancelBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;
    const userId = req.user.id;

    const bid = await Bid.findOne({
      _id: bidId,
      userId,
      status: "pending",
    }).session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Bid not found or already processed",
      });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Refund in the user's country currency.
    const refundAmount = Number(bid.bidAmount);
    user.credit = Number(user.credit) + refundAmount;
    await user.save({ session });

    bid.status = "cancelled";
    bid.cancelledAt = new Date();
    await bid.save({ session });

    await session.commitTransaction();
    session.endSession();

    const currencyInfo = await getUserCurrency(user);
    const refundUserCurrency = refundAmount;

    return res.json({
      success: true,
      message: "Bid cancelled successfully",
      data: {
        bidId: bid._id,
        transactionId: bid.transactionId,
        refundAmount: refundAmount,
        refundAmountUserCurrency: refundUserCurrency,
        currencyCode: currencyInfo.currencyCode,
        rate: currencyInfo.rate,
        credit: user.credit,
        creditUserCurrency: Number(user.credit),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Cancel Bid Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// CANCEL MULTIPLE BIDS
// ============================================================
exports.cancelMultipleBids = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(bidIds) || bidIds.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "bidIds array is required",
      });
    }

    if (bidIds.length > 20) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Maximum 20 bids can be cancelled at once",
      });
    }

    const bids = await Bid.find({
      _id: { $in: bidIds },
      userId,
      status: "pending",
    }).session(session);

    if (bids.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "No pending bids found to cancel",
      });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let totalRefundUserCurrency = 0;

    for (const bid of bids) {
      totalRefundUserCurrency += Number(bid.bidAmount);
      bid.status = "cancelled";
      bid.cancelledAt = new Date();
      await bid.save({ session });
    }

    user.credit = Number(user.credit) + totalRefundUserCurrency;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    const currencyInfo = await getUserCurrency(user);

    return res.json({
      success: true,
      message: `${bids.length} bids cancelled successfully`,
      data: {
        cancelledCount: bids.length,
        totalRefund: totalRefundUserCurrency,
        totalRefundINR: userCurrencyToINR(
          totalRefundUserCurrency,
          currencyInfo.rate,
        ),
        currencyCode: currencyInfo.currencyCode,
        rate: currencyInfo.rate,
        credit: user.credit,
        creditUserCurrency: Number(user.credit),
        cancelledBids: bids.map((bid) => ({
          id: bid._id,
          transactionId: bid.transactionId,
          refundAmount: bid.bidAmount,
          refundAmountUserCurrency: Number(bid.bidAmount),
        })),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Cancel Multiple Bids Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ADMIN GET ALL BIDS
// ============================================================
exports.adminGetAllBids = async (req, res) => {
  try {
    const {
      status,
      marketId,
      marketDayId,
      marketDate,
      userId,
      gameType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (marketId) filter.marketId = marketId;
    if (marketDayId) filter.marketDayId = marketDayId;
    if (marketDate) filter.marketDate = marketDate;
    if (userId) filter.userId = userId;

    if (gameType) {
      if (!ALL_GAME_TYPES.includes(gameType)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid game type" });
      }
      filter.gameType = gameType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const bids = await Bid.find(filter)
      .populate("userId", "name email mobile credit country")
      .populate("marketId", "name marketId digitType gameTypes")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Bid.countDocuments(filter);

    const statusSummary = await Bid.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
          totalPossibleWin: { $sum: "$possibleWinAmount" },
        },
      },
    ]);

    const gameTypeSummary = await Bid.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$gameType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
    ]);

    const totalStats = await Bid.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBids: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
          totalPossibleWin: { $sum: "$possibleWinAmount" },
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        bids,
        summary: {
          statusSummary,
          gameTypeSummary,
          totalStats: totalStats[0] || {
            totalBids: 0,
            totalAmount: 0,
            totalWinAmount: 0,
            totalPossibleWin: 0,
          },
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin Get All Bids Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ADMIN BID STATS
// ============================================================
exports.adminGetBidStats = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const totalBids = await Bid.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBids = await Bid.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const statusStats = await Bid.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
    ]);

    const gameTypeStats = await Bid.aggregate([
      {
        $group: {
          _id: "$gameType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
    ]);

    const dailyStats = await Bid.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const marketStats = await Bid.aggregate([
      {
        $group: {
          _id: "$marketId",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
      {
        $lookup: {
          from: "markets",
          localField: "_id",
          foreignField: "_id",
          as: "market",
        },
      },
      {
        $unwind: { path: "$market", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          marketName: "$market.name",
          marketId: "$market.marketId",
          digitType: "$market.digitType",
          count: 1,
          totalAmount: 1,
          totalWinAmount: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const userStats = await Bid.aggregate([
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
          wonCount: {
            $sum: { $cond: [{ $eq: ["$status", "won"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          userName: "$user.name",
          userEmail: "$user.email",
          count: 1,
          totalAmount: 1,
          totalWinAmount: 1,
          wonCount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ]);

    const hourlyStats = await Bid.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyStats = await Bid.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return res.json({
      success: true,
      data: {
        totalBids,
        todayBids,
        statusStats,
        gameTypeStats,
        dailyStats,
        marketStats,
        userStats,
        hourlyStats,
        monthlyStats,
        period,
        startDate,
      },
    });
  } catch (error) {
    console.error("Admin Get Bid Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ADMIN TODAY BIDS
// ============================================================
exports.adminGetTodayBids = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bids = await Bid.find({
      createdAt: { $gte: today, $lt: tomorrow },
    })
      .populate("userId", "name email mobile country")
      .populate("marketId", "name marketId digitType")
      .sort({ createdAt: -1 });

    const stats = await Bid.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
    ]);

    return res.json({
      success: true,
      data: { bids, stats, total: bids.length },
    });
  } catch (error) {
    console.error("Admin Get Today Bids Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ADMIN GET BID BY ID
// ============================================================
exports.adminGetBidById = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)
      .populate("userId", "name email mobile credit country")
      .populate("marketId", "name marketId digitType gameTypes marketArray");

    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    return res.json({ success: true, data: bid });
  } catch (error) {
    console.error("Admin Get Bid By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ADMIN UPDATE BID STATUS
// ============================================================
exports.adminUpdateBidStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;
    const { status, remarks } = req.body;

    if (!["pending", "won", "lost", "cancelled"].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: pending, won, lost, cancelled",
      });
    }

    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    if (status === "won" && bid.status !== "won") {
      const user = await User.findById(bid.userId).session(session);
      if (user) {
        // winAmount and credit are stored in the user's country currency.
        user.credit += Number(bid.possibleWinAmount);
        await user.save({ session });
        bid.winAmount = bid.possibleWinAmount;
        bid.wonAt = new Date();
      }
    }

    if (bid.status === "won" && status !== "won") {
      const user = await User.findById(bid.userId).session(session);
      if (user && bid.winAmount) {
        user.credit -= Number(bid.winAmount);
        await user.save({ session });
        bid.winAmount = 0;
      }
    }

    bid.status = status;
    if (remarks) bid.remarks = remarks;
    if (status === "lost") bid.lostAt = new Date();

    await bid.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: "Bid status updated successfully",
      data: bid,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Admin Update Bid Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ADMIN DELETE BID
// ============================================================
exports.adminDeleteBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    if (bid.status === "pending") {
      const user = await User.findById(bid.userId).session(session);
      if (user) {
        user.credit += Number(bid.bidAmount);
        await user.save({ session });
      }
    }

    if (bid.status === "won" && bid.winAmount) {
      const user = await User.findById(bid.userId).session(session);
      if (user) {
        user.credit -= Number(bid.winAmount);
        await user.save({ session });
      }
    }

    await Bid.findByIdAndDelete(bidId).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.json({ success: true, message: "Bid deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Admin Delete Bid Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// VALIDATE WINNING NUMBER
// ============================================================
const validateWinningNumber = (gameType, number) => {
  const str = String(number).trim();

  switch (gameType) {
    case "single":
      return /^[0-9]$/.test(str);

    case "single-Patti":
      return /^[0-9]{3}$/.test(str) && new Set(str.split("")).size === 3;

    case "double-Patti":
      return /^[0-9]{3}$/.test(str) && new Set(str.split("")).size === 2;

    case "triple-Patti":
      return /^[0-9]{3}$/.test(str) && new Set(str.split("")).size === 1;

    case "jodi":
      return /^[0-9]{2}$/.test(str);

    case "panna":
      return /^[0-9]{3}$/.test(str);

    case "half-sangam":
      return /^[0-9]{3}-[0-9]$/.test(str) || /^[0-9]-[0-9]{3}$/.test(str);

    case "full-sangam":
      return /^[0-9]{3}-[0-9]{3}$/.test(str);

    case "last-digit":
      return /^[0-9]{2}$/.test(str);

    case "first-digit":
      return /^[0-9]{2}$/.test(str);

    default:
      return false;
  }
};

// ============================================================
// DECLARE RESULT
// ============================================================
exports.declareResult = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { marketId } = req.params;
    const { winningNumber, gameType, resultDate, marketDayId, marketDate } =
      req.body;

    if (
      winningNumber === undefined ||
      winningNumber === null ||
      String(winningNumber).trim() === ""
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Winning number is required",
      });
    }

    if (!gameType) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Game type is required",
      });
    }

    if (!ALL_GAME_TYPES.includes(gameType)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid game type",
      });
    }

    const market = await Market.findById(marketId).session(session);
    if (!market) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Market not found" });
    }

    const marketDay = requireMarketDay(
      market,
      marketDayId,
      marketDate || resultDate,
    );
    attachMarketDayCompatibility(market, marketDay);

    const marketConfig = validateMarketDigitType(market);
    if (!marketConfig.valid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: marketConfig.message,
      });
    }

    if (!isGameTypeAllowedForMarket(market, gameType)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Game type '${gameType}' is not supported by this market`,
        digitType: marketConfig.digitType,
        supportedTypes: marketConfig.gameTypes,
      });
    }

    if (market.isResultDeclared) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Result already declared for this market",
      });
    }

    if (!validateWinningNumber(gameType, winningNumber)) {
      const formatHints = {
        single: "1-digit number (0-9)",
        "single-Patti": "3-digit Patti with all different digits (123)",
        "double-Patti": "3-digit Patti with one repeated digit (112)",
        "triple-Patti": "3-digit Patti with all same digits (111)",
        jodi: "2-digit number (00-99)",
        panna: "3-digit number (000-999)",
        "half-sangam": "Panna + Digit (123-5) or Digit + Panna (5-123)",
        "full-sangam": "Panna + Panna (123-456)",
        "last-digit": "2-digit number (00-99)",
        "first-digit": "2-digit number (00-99)",
      };

      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Invalid winning number format for ${gameType}. Expected: ${
          formatHints[gameType] || "valid number"
        }`,
      });
    }

    const formattedWinningNumber = formatGameNumber(gameType, winningNumber);

    const pendingBids = await Bid.find({
      marketId,
      marketDayId: marketDay._id,
      gameType,
      status: "pending",
    }).session(session);

    let totalWon = 0;
    let totalLost = 0;
    let totalPayoutINR = 0;
    let totalPayoutUserCurrency = 0;

    const winningBidsList = [];

    for (const bid of pendingBids) {
      const isWin = checkBidWin(bid, formattedWinningNumber);

      if (isWin) {
        bid.status = "won";
        bid.winAmount = bid.possibleWinAmount; // stored in user's currency
        bid.wonAt = new Date();
        bid.resultNumber = formattedWinningNumber;

        const user = await User.findById(bid.userId).session(session);
        if (user) {
          // Wallet credit is maintained in the user's own country currency.
          user.credit += Number(bid.possibleWinAmount);
          await user.save({ session });

          const cur = await getUserCurrency(user, session);
          const payoutRate = Number(bid.currencyRate || cur.rate || 1);
          const userCurrencyAmount = Number(bid.possibleWinAmount);
          totalPayoutUserCurrency += userCurrencyAmount;
          // Keep INR total only as an informational/reporting value.
          totalPayoutINR += userCurrencyToINR(userCurrencyAmount, payoutRate);

          winningBidsList.push({
            id: bid._id,
            userId: bid.userId,
            number: bid.number,
            bidAmount: bid.bidAmount,
            bidAmountUserCurrency: bid.bidAmountUserCurrency,
            winAmount: bid.winAmount,
            winAmountUserCurrency: userCurrencyAmount,
            currencyCode: bid.currencyCode || cur.currencyCode,
            currencyRate: payoutRate,
          });
        }

        totalWon++;
      } else {
        bid.status = "lost";
        bid.lostAt = new Date();
        bid.resultNumber = formattedWinningNumber;
        totalLost++;
      }

      await bid.save({ session });
    }

    const Result = require("../models/Result");

    const resultData = {
      marketId: market._id,
      marketDayId: marketDay._id,
      marketDate: marketDay.marketDate,
      marketName: market.name,
      gameType,
      gameTypes: marketConfig.gameTypes,
      winningNumber: formattedWinningNumber,
      resultDate: resultDate ? new Date(resultDate) : new Date(),
      declaredBy: req.user.id,
      totalBids: pendingBids.length,
      totalWinningBids: totalWon,
      totalPayout: totalPayoutINR, // stored in user currency
      status: "declared",
    };

    if (gameType === "last-digit") {
      resultData.winningLastDigit = formattedWinningNumber.slice(-1);
    }

    if (gameType === "first-digit") {
      resultData.winningFirstDigit = formattedWinningNumber.charAt(0);
    }

    const result = await Result.create([resultData], { session });

    marketDay.winningNumber = formattedWinningNumber;
    marketDay.isResultDeclared = true;
    marketDay.resultDeclaredAt = new Date();
    marketDay.declaredGameType = gameType;

    await market.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: "Result declared successfully",
      data: {
        market: {
          id: market._id,
          name: market.name,
          marketDayId: marketDay._id,
          marketDate: marketDay.marketDate,
          digitType: marketConfig.digitType,
          winningNumber: formattedWinningNumber,
          gameType,
        },
        result: result[0],
        summary: {
          totalBidsProcessed: pendingBids.length,
          totalWon,
          totalLost,
          totalPayout: totalPayoutINR,
          totalPayoutUserCurrency,
        },
        winningBids: winningBidsList,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Declare Result Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// GET LOWEST BID NUMBER
// ============================================================
const generatePannaNumbersForUnused = () => {
  const numbers = [];
  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      for (let c = 0; c <= 9; c++) {
        if (a !== b && b !== c && a !== c) {
          numbers.push(`${a}${b}${c}`);
        }
      }
    }
  }
  return numbers;
};

const getAllValidNumbersForUnused = (gameType) => {
  switch (gameType) {
    case "jodi":
      return Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0"));

    case "last-digit":
    case "first-digit":
      return Array.from({ length: 10 }, (_, i) => String(i));

    case "panna":
      return generatePannaNumbersForUnused();

    case "half-sangam": {
      const pannaNumbers = generatePannaNumbersForUnused();
      const numbers = [];
      for (const panna of pannaNumbers) {
        for (let digit = 0; digit <= 9; digit++) {
          numbers.push(`${panna}-${digit}`);
          numbers.push(`${digit}-${panna}`);
        }
      }
      return numbers;
    }

    case "full-sangam": {
      const pannaNumbers = generatePannaNumbersForUnused();
      const numbers = [];
      for (const openPanna of pannaNumbers) {
        for (const closePanna of pannaNumbers) {
          numbers.push(`${openPanna}-${closePanna}`);
        }
      }
      return numbers;
    }

    default:
      return [];
  }
};

const normalizeUnusedBidNumber = (gameType, number) => {
  if (number === undefined || number === null) return null;

  let value = String(number).trim().replace(/\s+/g, "");

  if (gameType === "jodi") return value.padStart(2, "0");

  if (gameType === "last-digit" || gameType === "first-digit") {
    if (/^\d$/.test(value)) return value;
    return value;
  }

  if (gameType === "panna") return value.padStart(3, "0");

  if (gameType === "half-sangam" || gameType === "full-sangam") return value;

  return value;
};

const sortUnusedCandidates = (a, b) => {
  if (a.betCount !== b.betCount) return a.betCount - b.betCount;
  return String(a.number).localeCompare(String(b.number), undefined, {
    numeric: true,
  });
};

exports.getLowestBidNumber = async (req, res) => {
  try {
    const { marketId, marketDayId, marketDate } = req.params;

    if (!marketId) {
      return res
        .status(400)
        .json({ success: false, message: "Market ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(marketId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Market ID" });
    }

    const market = await Market.findById(marketId).select(
      "name marketId digitType numberType gameTypes marketArray",
    );

    if (!market) {
      return res
        .status(404)
        .json({ success: false, message: "Market not found" });
    }

    const marketDay = requireMarketDay(market, marketDayId, marketDate);
    attachMarketDayCompatibility(market, marketDay);

    const gameTypes = getMarketGameTypes(market);
    if (!gameTypes.length) {
      return res.status(400).json({
        success: false,
        message: "No valid game types configured for this market",
      });
    }

    const pendingBids = await Bid.find({
      marketId: new mongoose.Types.ObjectId(marketId),
      marketDayId: marketDay._id,
      status: "pending",
      gameType: { $in: gameTypes },
    })
      .select("gameType number bidAmount userId")
      .lean();

    const betCounts = {};
    for (const gameType of gameTypes) betCounts[gameType] = new Map();

    for (const bid of pendingBids) {
      const gameType = bid.gameType;
      if (!betCounts[gameType]) betCounts[gameType] = new Map();

      const normalizedNumber = normalizeUnusedBidNumber(gameType, bid.number);
      if (!normalizedNumber) continue;

      const current = betCounts[gameType].get(normalizedNumber) || 0;
      betCounts[gameType].set(normalizedNumber, current + 1);
    }

    const lowestBids = {};

    for (const gameType of gameTypes) {
      const allNumbers = getAllValidNumbersForUnused(gameType);
      const counts = betCounts[gameType] || new Map();

      const candidates = allNumbers.map((number) => ({
        number,
        betCount: counts.get(number) || 0,
      }));

      candidates.sort(sortUnusedCandidates);

      const selected = candidates[0] || null;

      const unusedNumbers = candidates
        .filter((item) => item.betCount === 0)
        .map((item) => item.number);

      const minimumBetCount = selected ? selected.betCount : 0;

      const lowestNumbers = candidates
        .filter((item) => item.betCount === minimumBetCount)
        .map((item) => item.number);

      const numbersWithBet = candidates.filter(
        (item) => item.betCount > 0,
      ).length;

      const allNumbersHaveBets =
        candidates.length > 0 && numbersWithBet === candidates.length;

      lowestBids[gameType] = {
        number: selected ? selected.number : null,
        betCount: selected ? selected.betCount : 0,
        allNumbersHaveBets,
        totalValidNumbers: candidates.length,
        totalNumbersWithBet: numbersWithBet,
        unusedNumbers,
        lowestNumbers,
      };
    }

    return res.status(200).json({
      success: true,
      message: "Unused numbers / lowest-bet numbers fetched successfully",
      marketId,
      digitType: normalizeDigitType(market),
      gameTypes,
      lowestBids,
    });
  } catch (error) {
    console.error("Get Lowest/Unused Bid Number Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// GET MARKET RESULTS
// ============================================================
exports.getMarketResults = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { marketDayId, marketDate } = req.query;

    const market = await Market.findById(marketId).select(
      "name marketId digitType gameTypes marketArray",
    );

    if (!market) {
      return res
        .status(404)
        .json({ success: false, message: "Market not found" });
    }

    const marketDay = requireMarketDay(market, marketDayId, marketDate);
    attachMarketDayCompatibility(market, marketDay);

    const winningBids = await Bid.find({
      marketId,
      marketDayId: marketDay._id,
      status: "won",
    })
      .populate("userId", "name email country")
      .select(
        "userId gameType number bidAmount winAmount wonAt currencyCode bidAmountUserCurrency",
      );

    const summary = await Bid.aggregate([
      {
        $match: {
          marketId: new mongoose.Types.ObjectId(marketId),
          marketDayId: marketDay._id,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$bidAmount" },
          totalWinAmount: { $sum: "$winAmount" },
        },
      },
    ]);

    return res.json({
      success: true,
      data: { market, marketDay, winningBids, summary },
    });
  } catch (error) {
    console.error("Get Market Results Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// GET BIDS BY MARKET ID
// ============================================================
exports.getBidsByMarketId = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { marketDayId, marketDate } = req.query;

    if (!marketId) {
      return res
        .status(400)
        .json({ success: false, message: "Market ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(marketId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Market ID" });
    }

    const market = await Market.findById(marketId).select(
      "name marketId digitType gameTypes marketArray",
    );

    if (!market) {
      return res
        .status(404)
        .json({ success: false, message: "Market not found" });
    }

    const marketDay = requireMarketDay(market, marketDayId, marketDate);

    const bids = await Bid.find({
      marketId,
      marketDayId: marketDay._id,
    })
      .populate("userId", "username name email mobile country")
      .populate("marketId", "name marketId digitType gameTypes")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Bids fetched successfully",
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    console.error("Get bids by market ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bids",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALLOWED GAME TYPES FOR MARKET
// ============================================================
exports.getAllowedGameTypesForMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { marketDayId, marketDate } = req.query;

    if (!marketId || !mongoose.Types.ObjectId.isValid(marketId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Market ID is required",
      });
    }

    const market = await Market.findById(marketId).select(
      "name marketId digitType numberType gameTypes marketArray",
    );

    if (!market) {
      return res
        .status(404)
        .json({ success: false, message: "Market not found" });
    }

    const marketDay = requireMarketDay(market, marketDayId, marketDate);
    attachMarketDayCompatibility(market, marketDay);

    const config = validateMarketDigitType(market);

    return res.status(200).json({
      success: true,
      data: {
        market,
        digitType: config.digitType,
        gameTypes: config.gameTypes,
      },
    });
  } catch (error) {
    console.error("Get Allowed Game Types Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
