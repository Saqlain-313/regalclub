const Result = require("../models/Result");
const Bid = require("../models/Bid");
const Market = require("../models/Market");
const User = require("../models/authmodel");
const mongoose = require("mongoose");

const normalizeMarketDate = (value) => {
  if (!value) return null;

  // Already Date
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const strValue = String(value).trim();

  if (!strValue) return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
    const date = new Date(`${strValue}T00:00:00.000Z`);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(strValue);

  return Number.isNaN(date.getTime()) ? null : date;
};

const findMarketDay = (
  market,
  { marketDayId, marketDate, resultDate } = {},
) => {
  if (!Array.isArray(market.marketArray) || market.marketArray.length === 0)
    return null;

  if (marketDayId) {
    const day = market.marketArray.id(marketDayId);
    if (day) return day;
  }

  const wantedDate =
    normalizeMarketDate(marketDate) || normalizeMarketDate(resultDate);

  if (wantedDate) {
    const day = market.marketArray.find(
      (item) => normalizeMarketDate(item.marketDate) === wantedDate,
    );
    if (day) return day;
  }

  return null;
};

// ============================================================
// GAME TYPES
// ============================================================

const TWO_DIGIT_GAME_TYPES = Object.freeze([
  "single",
  "jodi",
  "last-digit",
  "first-digit",
]);

const THREE_DIGIT_GAME_TYPES = Object.freeze([
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
]);

const VALID_DIGIT_TYPES = Object.freeze(["2-digit", "3-digit"]);

// ============================================================
// HELPER: SAFE SESSION END
// ============================================================

const endSession = async (session) => {
  try {
    await session.endSession();
  } catch (error) {
    console.error("Session End Error:", error);
  }
};

// ============================================================
// DECLARE RESULT CONTROLLER (FULL FIXED CODE)
// ============================================================

exports.declareResult = async (req, res) => {
  const session = await mongoose.startSession();

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const str = (value) => {
    if (value === undefined || value === null) {
      return "";
    }

    return String(value).trim();
  };

  // Normalize every game-type spelling to one canonical value.
  // Examples:
  // single-Patti -> single-patti
  // single_patti -> single-patti
  // Single Patti -> single-patti
  const normalizeGameType = (value) => {
    return str(value)
      .toLowerCase()
      .trim()
      .replace(/[_\s]+/g, "-")
      .replace(/-+/g, "-");
  };

  // ============================================================
  // RESULT / BID HELPERS
  // ============================================================

  // Keep all values as strings so leading zeroes are preserved.
  const digitsOnly = (value) => {
    return str(value).replace(/[^0-9]/g, "");
  };

  // ============================================================
  // SINGLE DIGIT
  // 45 -> 9
  // 123 -> 6
  // 989712 -> 9
  // ============================================================

  const getSingleDigit = (value) => {
    const digits = digitsOnly(value);

    if (!digits) {
      return "";
    }

    let sum = 0;

    for (const digit of digits) {
      sum += Number(digit);
    }

    while (sum >= 10) {
      sum = String(sum)
        .split("")
        .reduce((total, digit) => total + Number(digit), 0);
    }

    return String(sum);
  };

  // ============================================================
  // FIRST DIGIT
  // ============================================================

  const getFirstDigit = (value) => {
    const digits = digitsOnly(value);

    return digits ? digits.charAt(0) : "";
  };

  // ============================================================
  // LAST DIGIT
  // ============================================================

  const getLastDigit = (value) => {
    const digits = digitsOnly(value);

    return digits ? digits.charAt(digits.length - 1) : "";
  };

  // ============================================================
  // THREE DIGIT
  // ============================================================

  const getThreeDigit = (value) => {
    const digits = digitsOnly(value);

    if (!digits) {
      return "";
    }

    return digits.length >= 3
      ? digits.substring(0, 3)
      : digits.padStart(3, "0");
  };

  // ============================================================
  // OPEN / CLOSE PANNA
  // ============================================================

  const getOpenPanna = (digits) => {
    const clean = digitsOnly(digits);

    return clean.length >= 3 ? clean.substring(0, 3) : clean;
  };

  const getClosePanna = (digits) => {
    const clean = digitsOnly(digits);

    return clean.length >= 6 ? clean.substring(3, 6) : "";
  };

  // ============================================================
  // SINGLE PATTI
  // All 3 digits different
  // ============================================================

  const isSinglePatti = (value) => {
    const digits = getThreeDigit(value);

    return digits.length === 3 && new Set(digits.split("")).size === 3;
  };

  // ============================================================
  // DOUBLE PATTI
  // Exactly one pair
  // Examples: 112, 121, 211, 505
  // ============================================================

  const isDoublePatti = (value) => {
    const digits = getThreeDigit(value);

    if (digits.length !== 3) {
      return false;
    }

    const counts = {};

    for (const digit of digits) {
      counts[digit] = (counts[digit] || 0) + 1;
    }

    return Object.values(counts).sort().join(",") === "1,2";
  };

  // ============================================================
  // TRIPLE PATTI
  // AAA
  // ============================================================

  const isTriplePatti = (value) => {
    const digits = getThreeDigit(value);

    return (
      digits.length === 3 &&
      digits.charAt(0) === digits.charAt(1) &&
      digits.charAt(1) === digits.charAt(2)
    );
  };

  // ============================================================
  // JODI
  //
  // 36 -> 36
  // 123456 -> 36
  // 123-456 -> 36
  // ============================================================

  const getJodi = (value) => {
    const input = str(value);

    if (!input) {
      return "";
    }

    const parts = input.split("-").map((part) => part.trim());

    // Full Sangam
    if (
      parts.length === 2 &&
      /^\d{3}$/.test(parts[0]) &&
      /^\d{3}$/.test(parts[1])
    ) {
      return parts[0].charAt(2) + parts[1].charAt(2);
    }

    const digits = digitsOnly(input);

    // Full 6 digit
    if (digits.length === 6) {
      return digits.charAt(2) + digits.charAt(5);
    }

    // Already Jodi
    if (digits.length === 2) {
      return digits;
    }

    // Fallback
    if (digits.length === 3) {
      return digits.substring(0, 2);
    }

    if (digits.length === 4) {
      return digits.substring(0, 2);
    }

    return "";
  };

  // ============================================================
  // HALF SANGAM
  //
  // 123-6
  // 6-123
  // 123456 -> 123-6
  // 1234 -> 123-4
  // ============================================================

  const normalizeHalfSangam = (value) => {
    const input = str(value);

    if (!input) {
      return null;
    }

    const parts = input.split("-").map((part) => part.trim());

    if (
      parts.length === 2 &&
      /^\d{3}$/.test(parts[0]) &&
      /^\d$/.test(parts[1])
    ) {
      return {
        panna: parts[0],
        digit: parts[1],
      };
    }

    if (
      parts.length === 2 &&
      /^\d$/.test(parts[0]) &&
      /^\d{3}$/.test(parts[1])
    ) {
      return {
        panna: parts[1],
        digit: parts[0],
      };
    }

    const digits = digitsOnly(input);

    if (digits.length === 6) {
      return {
        panna: digits.substring(0, 3),
        digit: digits.charAt(5),
      };
    }

    if (digits.length === 4) {
      return {
        panna: digits.substring(0, 3),
        digit: digits.charAt(3),
      };
    }

    return null;
  };

  const checkHalfSangamWin = (bidNumber, winningNumber) => {
    const bid = normalizeHalfSangam(bidNumber);

    const winning = normalizeHalfSangam(winningNumber);

    if (!bid || !winning) {
      return false;
    }

    return bid.panna === winning.panna && bid.digit === winning.digit;
  };

  // ============================================================
  // FULL SANGAM
  // ============================================================

  const normalizeFullSangam = (value) => {
    const input = str(value);

    if (!input) {
      return "";
    }

    const parts = input.split("-").map((part) => part.trim());

    if (
      parts.length === 2 &&
      /^\d{3}$/.test(parts[0]) &&
      /^\d{3}$/.test(parts[1])
    ) {
      return `${parts[0]}-${parts[1]}`;
    }

    const digits = digitsOnly(input);

    if (digits.length === 6) {
      return `${digits.substring(0, 3)}-` + `${digits.substring(3, 6)}`;
    }

    return "";
  };

  // ============================================================
  // CHECK BID WIN
  // ============================================================

  const checkBidWin = (bid, formattedWinningNumbers) => {
    if (!bid) {
      return false;
    }

    const gameType = normalizeGameType(bid.gameType);

    const bidNumber = str(bid.number);

    if (!gameType || !bidNumber) {
      return false;
    }

    // NOTE: formattedWinningNumbers stores schema-cased keys
    // (single-Patti, double-Patti, triple-Patti). Bid gameType is
    // always lowercase after normalizeGameType(), so we look up
    // using a lowercase-safe accessor here.
    const winningNumberLookup = {
      ...formattedWinningNumbers,
      "single-patti": formattedWinningNumbers["single-Patti"],
      "double-patti": formattedWinningNumbers["double-Patti"],
      "triple-patti": formattedWinningNumbers["triple-Patti"],
    };

    const winningNumber = winningNumberLookup[gameType];

    if (
      winningNumber === undefined ||
      winningNumber === null ||
      str(winningNumber) === ""
    ) {
      return false;
    }

    const bidDigits = digitsOnly(bidNumber);

    const winningDigits = digitsOnly(winningNumber);

    if (!bidDigits || !winningDigits) {
      return false;
    }

    // ==========================================================
    // SINGLE
    // ==========================================================

    if (gameType === "single") {
      return getSingleDigit(bidNumber) === getSingleDigit(winningNumber);
    }

    // ==========================================================
    // FIRST DIGIT
    // ==========================================================

    if (gameType === "first-digit") {
      return getFirstDigit(bidNumber) === getFirstDigit(winningNumber);
    }

    // ==========================================================
    // LAST DIGIT
    // ==========================================================

    if (gameType === "last-digit") {
      return getLastDigit(bidNumber) === getLastDigit(winningNumber);
    }

    // ==========================================================
    // JODI
    // ==========================================================

    if (gameType === "jodi") {
      const resultJodi = getJodi(winningNumber);

      const bidJodi = getJodi(bidNumber);

      return resultJodi !== "" && bidJodi !== "" && bidJodi === resultJodi;
    }

    // ==========================================================
    // SINGLE PATTI
    // ==========================================================

    if (gameType === "single-patti") {
      if (bidDigits.length !== 3 || !isSinglePatti(bidNumber)) {
        return false;
      }

      const bidPanna = getThreeDigit(bidNumber);

      const openPanna = getOpenPanna(winningDigits);

      const closePanna = getClosePanna(winningDigits);

      if (isSinglePatti(openPanna) && bidPanna === openPanna) {
        return true;
      }

      if (
        winningDigits.length >= 6 &&
        isSinglePatti(closePanna) &&
        bidPanna === closePanna
      ) {
        return true;
      }

      return false;
    }

    // ==========================================================
    // DOUBLE PATTI
    // ==========================================================

    if (gameType === "double-patti") {
      if (bidDigits.length !== 3 || !isDoublePatti(bidNumber)) {
        return false;
      }

      const bidPanna = getThreeDigit(bidNumber);

      const openPanna = getOpenPanna(winningDigits);

      const closePanna = getClosePanna(winningDigits);

      if (isDoublePatti(openPanna) && bidPanna === openPanna) {
        return true;
      }

      if (
        winningDigits.length >= 6 &&
        isDoublePatti(closePanna) &&
        bidPanna === closePanna
      ) {
        return true;
      }

      return false;
    }

    // ==========================================================
    // TRIPLE PATTI
    // ==========================================================

    if (gameType === "triple-patti") {
      if (bidDigits.length !== 3 || !isTriplePatti(bidNumber)) {
        return false;
      }

      const bidPanna = getThreeDigit(bidNumber);

      const openPanna = getOpenPanna(winningDigits);

      const closePanna = getClosePanna(winningDigits);

      if (isTriplePatti(openPanna) && bidPanna === openPanna) {
        return true;
      }

      if (
        winningDigits.length >= 6 &&
        isTriplePatti(closePanna) &&
        bidPanna === closePanna
      ) {
        return true;
      }

      return false;
    }

    // ==========================================================
    // PANNA
    // ==========================================================

    if (gameType === "panna") {
      if (bidDigits.length !== 3) {
        return false;
      }

      const bidPanna = getThreeDigit(bidNumber);

      const openPanna = getOpenPanna(winningDigits);

      const closePanna = getClosePanna(winningDigits);

      if (bidPanna === openPanna) {
        return true;
      }

      if (winningDigits.length >= 6 && bidPanna === closePanna) {
        return true;
      }

      return false;
    }

    // ==========================================================
    // OPEN
    // ==========================================================

    if (gameType === "open") {
      const openPanna = getOpenPanna(winningDigits);

      if (bidDigits.length === 1) {
        return getSingleDigit(openPanna) === bidDigits;
      }

      if (bidDigits.length === 3) {
        return getThreeDigit(bidNumber) === openPanna;
      }

      return false;
    }

    // ==========================================================
    // CLOSE
    // ==========================================================

    if (gameType === "close") {
      const closePanna = getClosePanna(winningDigits);

      if (bidDigits.length === 1) {
        return getSingleDigit(closePanna) === bidDigits;
      }

      if (bidDigits.length === 3) {
        return getThreeDigit(bidNumber) === closePanna;
      }

      return false;
    }

    // ==========================================================
    // HALF SANGAM
    // ==========================================================

    if (gameType === "half-sangam") {
      return checkHalfSangamWin(bidNumber, winningNumber);
    }

    // ==========================================================
    // FULL SANGAM
    // ==========================================================

    if (gameType === "full-sangam") {
      const bidFull = normalizeFullSangam(bidNumber);

      const resultFull = normalizeFullSangam(winningNumber);

      return bidFull !== "" && resultFull !== "" && bidFull === resultFull;
    }

    return false;
  };

  try {
    await session.startTransaction();

    // ============================================================
    // REQUEST BODY
    // ============================================================

    const {
      marketId,
      marketDayId,
      marketDate,
      winningNumbers,
      resultDate,
      nextOpenDate,
      digitType: requestedDigitType,
    } = req.body;

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!marketId) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Market ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(marketId)) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Invalid Market ID",
      });
    }

    if (
      !winningNumbers ||
      typeof winningNumbers !== "object" ||
      Array.isArray(winningNumbers)
    ) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Winning numbers object is required",
      });
    }

    if (!nextOpenDate) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Next open date is required",
      });
    }

    const parsedResultDate = resultDate
      ? new Date(resultDate)
      : marketDate
        ? new Date(`${marketDate}T00:00:00`)
        : new Date();

    const parsedNextOpenDate = new Date(nextOpenDate);

    if (Number.isNaN(parsedResultDate.getTime())) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Invalid result date",
      });
    }

    if (Number.isNaN(parsedNextOpenDate.getTime())) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Invalid next open date",
      });
    }

    if (parsedNextOpenDate.getTime() <= parsedResultDate.getTime()) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Next open date must be after result date",
      });
    }

    // ============================================================
    // GET MARKET
    // ============================================================

    const market = await Market.findById(marketId).session(session);

    if (!market) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }

    // ============================================================
    // MARKET DAY (marketArray)
    // ============================================================

    const marketDay = findMarketDay(market, {
      marketDayId,
      marketDate,
      resultDate: parsedResultDate,
    });

    if (!marketDay) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message:
          "Market day not found. Provide a valid marketDayId or marketDate matching marketArray.",
        marketDayId: marketDayId || null,
        marketDate: marketDate || normalizeMarketDate(parsedResultDate),
        availableDates: Array.isArray(market.marketArray)
          ? market.marketArray.map((day) => day.marketDate)
          : [],
      });
    }

    const resolvedMarketDayId = marketDay._id;
    const resolvedMarketDate = normalizeMarketDate(marketDay.marketDate);

    // ============================================================
    // DIGIT TYPE
    // ============================================================

    let digitType = market.digitType;

    if (!VALID_DIGIT_TYPES.includes(digitType)) {
      if (VALID_DIGIT_TYPES.includes(requestedDigitType)) {
        market.digitType = requestedDigitType;

        digitType = requestedDigitType;
      }
    }

    if (!VALID_DIGIT_TYPES.includes(digitType)) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Market digit type must be 2-digit or 3-digit",
      });
    }

    // ============================================================
    // ALLOWED GAME TYPES
    // ============================================================

    const gameTypesTwoDigit = [
      "single",
      "jodi",
      "open",
      "close",
      "last-digit",
      "first-digit",
    ];

    const gameTypesThreeDigit = [
      "single",
      "single-patti",
      "double-patti",
      "triple-patti",
      "panna",
      "open",
      "close",
      "jodi",
      "half-sangam",
      "full-sangam",
      "last-digit",
      "first-digit",
    ];

    const allowedGameTypes =
      digitType === "2-digit" ? gameTypesTwoDigit : gameTypesThreeDigit;

    // ============================================================
    // RESULT ALREADY DECLARED
    // ============================================================

    if (marketDay.isResultDeclared) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Result already declared for this market",
      });
    }

    // ============================================================
    // NORMALIZE WINNING NUMBERS
    // ============================================================

    const normalizedWinningNumbers = {};

    for (const [rawGameType, value] of Object.entries(winningNumbers)) {
      const normalizedType = normalizeGameType(rawGameType);

      if (normalizedType) {
        normalizedWinningNumbers[normalizedType] = value;
      }
    }

    // ============================================================
    // VALIDATE GAME TYPES
    // ============================================================

    const invalidGameTypes = Object.keys(normalizedWinningNumbers).filter(
      (gameType) => {
        const value = normalizedWinningNumbers[gameType];

        if (value === undefined || value === null || str(value) === "") {
          return false;
        }

        return !allowedGameTypes.includes(gameType);
      },
    );

    if (invalidGameTypes.length > 0) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Invalid game type for this market",
        invalidGameTypes,
        allowedGameTypes,
        digitType,
      });
    }

    // ============================================================
    // FORMAT WINNING NUMBERS
    //
    // IMPORTANT: keys here stay in the *normalized lowercase*
    // form ("single-patti") while we're working, and only get
    // converted to the schema's exact casing ("single-Patti")
    // in the final derivation block below, right before the
    // Result document is built. This avoids the historical bug
    // where the lowercase keys were being silently dropped by
    // Mongoose (schema strict:true only recognizes the capital
    // "P" spelling), which is why single/single-Patti/
    // double-Patti/triple-Patti were always saved as null.
    // ============================================================

    const formattedWinningNumbers = {};
    const errors = [];

    // ------------------------------------------------------------
    // PASS 1
    // Format values actually submitted by frontend
    // ------------------------------------------------------------

    for (const gameType of allowedGameTypes) {
      const number = normalizedWinningNumbers[gameType];

      if (number === undefined || number === null || str(number) === "") {
        formattedWinningNumbers[gameType] = null;

        continue;
      }

      try {
        formattedWinningNumbers[gameType] = Result.formatWinningNumber(
          number,
          gameType,
        );
      } catch (error) {
        errors.push(`${gameType}: ${error.message}`);
      }
    }

    // ============================================================
    // PASS 2
    // DERIVE MISSING RESULTS
    // ============================================================

    // ------------------------------------------------------------
    // SINGLE FROM PANNA
    //
    // 123 -> 1+2+3 = 6
    // ------------------------------------------------------------

    if (
      allowedGameTypes.includes("single") &&
      (formattedWinningNumbers.single === null ||
        formattedWinningNumbers.single === undefined ||
        str(formattedWinningNumbers.single) === "")
    ) {
      const source =
        formattedWinningNumbers.panna ?? normalizedWinningNumbers.panna;

      const digits = digitsOnly(source);

      if (digits.length > 0) {
        formattedWinningNumbers.single = getSingleDigit(digits);
      }
    }

    // ------------------------------------------------------------
    // FIRST DIGIT FROM PANNA
    //
    // 123 -> 1
    // ------------------------------------------------------------

    if (
      allowedGameTypes.includes("first-digit") &&
      (formattedWinningNumbers["first-digit"] === null ||
        formattedWinningNumbers["first-digit"] === undefined ||
        str(formattedWinningNumbers["first-digit"]) === "")
    ) {
      const source =
        formattedWinningNumbers.panna ?? normalizedWinningNumbers.panna;

      const digits = digitsOnly(source);

      if (digits.length > 0) {
        formattedWinningNumbers["first-digit"] = digits.charAt(0);
      }
    }

    // ------------------------------------------------------------
    // LAST DIGIT
    //
    // Priority:
    // 1. half-sangam explicit digit
    // 2. full-sangam close panna last digit
    // 3. panna last digit
    // ------------------------------------------------------------

    if (
      allowedGameTypes.includes("last-digit") &&
      (formattedWinningNumbers["last-digit"] === null ||
        formattedWinningNumbers["last-digit"] === undefined ||
        str(formattedWinningNumbers["last-digit"]) === "")
    ) {
      let lastDigit = "";

      // HALF SANGAM
      const halfSangam = normalizedWinningNumbers["half-sangam"];

      if (halfSangam) {
        const normalizedHalf = normalizeHalfSangam(halfSangam);

        if (normalizedHalf && normalizedHalf.digit) {
          lastDigit = normalizedHalf.digit;
        }
      }

      // FULL SANGAM
      if (!lastDigit) {
        const fullSangam = normalizedWinningNumbers["full-sangam"];

        if (fullSangam) {
          const normalizedFull = normalizeFullSangam(fullSangam);

          const fullDigits = digitsOnly(normalizedFull);

          if (fullDigits.length >= 6) {
            lastDigit = fullDigits.charAt(5);
          }
        }
      }

      // PANNA
      if (!lastDigit) {
        const source =
          formattedWinningNumbers.panna ?? normalizedWinningNumbers.panna;

        const digits = digitsOnly(source);

        if (digits.length > 0) {
          lastDigit = digits.charAt(digits.length - 1);
        }
      }

      if (lastDigit) {
        formattedWinningNumbers["last-digit"] = lastDigit;
      }
    }

    // ------------------------------------------------------------
    // JODI
    //
    // Only derive when frontend did not send jodi.
    //
    // 123-456 -> 36
    // ------------------------------------------------------------

    if (
      allowedGameTypes.includes("jodi") &&
      (formattedWinningNumbers.jodi === null ||
        formattedWinningNumbers.jodi === undefined ||
        str(formattedWinningNumbers.jodi) === "")
    ) {
      const fullSangam = normalizedWinningNumbers["full-sangam"];

      if (fullSangam) {
        const derivedJodi = getJodi(fullSangam);

        if (derivedJodi) {
          formattedWinningNumbers.jodi = derivedJodi;
        }
      }
    }

    // ============================================================
    // PASS 3
    // FINAL DIGIT NORMALIZATION
    // ============================================================

    for (const gameType of ["single", "last-digit", "first-digit"]) {
      if (
        formattedWinningNumbers[gameType] !== null &&
        formattedWinningNumbers[gameType] !== undefined
      ) {
        const digits = digitsOnly(formattedWinningNumbers[gameType]);

        formattedWinningNumbers[gameType] = digits || null;
      }
    }

    // ============================================================
    // FINAL GUARANTEED DERIVATION FROM OPEN PANNA
    //
    // THE FIX: this block guarantees single / single-Patti /
    // double-Patti / triple-Patti are populated whenever an open
    // panna exists, and writes them using the EXACT schema casing
    // ("single-Patti", not "single-patti"). Previously these were
    // computed under the lowercase key produced by
    // normalizeGameType(), which Mongoose's strict schema quietly
    // discarded on save — so they always ended up null in the DB
    // no matter what was computed above.
    // ============================================================

    const openPannaSource =
      formattedWinningNumbers.panna ?? normalizedWinningNumbers.panna;

    const resultPannaDigits = digitsOnly(openPannaSource);

    // Frontend sends a 6-digit result: first 3 = OPEN PANNA, last 3 = CLOSE PANNA.
    const openPannaDigits = getOpenPanna(resultPannaDigits);
    const closePannaDigits = getClosePanna(resultPannaDigits);

    if (openPannaDigits.length === 3) {
      if (
        allowedGameTypes.includes("single") &&
        (!formattedWinningNumbers.single ||
          str(formattedWinningNumbers.single) === "")
      ) {
        formattedWinningNumbers.single = getSingleDigit(openPannaDigits);
      }

      if (
        allowedGameTypes.includes("first-digit") &&
        (!formattedWinningNumbers["first-digit"] ||
          str(formattedWinningNumbers["first-digit"]) === "")
      ) {
        formattedWinningNumbers["first-digit"] = openPannaDigits.charAt(0);
      }

      if (
        allowedGameTypes.includes("last-digit") &&
        (!formattedWinningNumbers["last-digit"] ||
          str(formattedWinningNumbers["last-digit"]) === "")
      ) {
        formattedWinningNumbers["last-digit"] =
          closePannaDigits.length === 3
            ? closePannaDigits.charAt(2)
            : openPannaDigits.charAt(2);
      }

      // Patti fields use the schema's exact casing.
      // They store the OPEN PANNA Patti; win checking separately checks
      // both OPEN and CLOSE PANNA, so close-side Patti bets also work.
      if (allowedGameTypes.includes("single-patti")) {
        formattedWinningNumbers["single-Patti"] = isSinglePatti(openPannaDigits)
          ? openPannaDigits
          : null;
      }

      if (allowedGameTypes.includes("double-patti")) {
        formattedWinningNumbers["double-Patti"] = isDoublePatti(openPannaDigits)
          ? openPannaDigits
          : null;
      }

      if (allowedGameTypes.includes("triple-patti")) {
        formattedWinningNumbers["triple-Patti"] = isTriplePatti(openPannaDigits)
          ? openPannaDigits
          : null;
      }
    }

    // Drop the stray lowercase keys created by PASS 1 for the
    // patti fields — the schema-cased keys above are now the
    // single source of truth for these three fields.
    delete formattedWinningNumbers["single-patti"];
    delete formattedWinningNumbers["double-patti"];
    delete formattedWinningNumbers["triple-patti"];

    // ============================================================
    // ENSURE JODI FROM FULL SANGAM
    // ============================================================

    if (
      allowedGameTypes.includes("jodi") &&
      normalizedWinningNumbers["full-sangam"]
    ) {
      const jodi = getJodi(normalizedWinningNumbers["full-sangam"]);

      if (jodi) {
        // Keep explicitly submitted jodi.
        // Only replace if it was missing.
        if (
          !formattedWinningNumbers.jodi ||
          str(formattedWinningNumbers.jodi) === ""
        ) {
          formattedWinningNumbers.jodi = jodi;
        }
      }
    }

    // ============================================================
    // CLEAN DIGIT VALUES ONE MORE TIME
    // ============================================================

    if (
      formattedWinningNumbers.single !== null &&
      formattedWinningNumbers.single !== undefined
    ) {
      formattedWinningNumbers.single =
        digitsOnly(formattedWinningNumbers.single) || null;
    }

    if (
      formattedWinningNumbers["first-digit"] !== null &&
      formattedWinningNumbers["first-digit"] !== undefined
    ) {
      formattedWinningNumbers["first-digit"] =
        digitsOnly(formattedWinningNumbers["first-digit"]) || null;
    }

    if (
      formattedWinningNumbers["last-digit"] !== null &&
      formattedWinningNumbers["last-digit"] !== undefined
    ) {
      formattedWinningNumbers["last-digit"] =
        digitsOnly(formattedWinningNumbers["last-digit"]) || null;
    }

    if (errors.length > 0) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "Invalid winning numbers",
        errors,
      });
    }

    // ============================================================
    // AT LEAST ONE RESULT REQUIRED
    // ============================================================

    const hasWinningNumber = Object.values(formattedWinningNumbers).some(
      (value) => value !== null && value !== undefined && str(value) !== "",
    );

    if (!hasWinningNumber) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "At least one winning number is required",
      });
    }

    // ============================================================
    // FIND ALL PENDING BIDS
    // ============================================================

    const pendingBids = await Bid.find({
      marketId,
      marketDayId: resolvedMarketDayId,
      status: "pending",
    }).session(session);

    if (pendingBids.length === 0) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(400).json({
        success: false,
        message: "No pending bids found for this market",
      });
    }

    // ============================================================
    // PROCESS BIDS
    // ============================================================

    let totalWon = 0;
    let totalLost = 0;
    let totalPayout = 0;

    const winningBidsList = [];
    const gameTypeStats = {};

    for (const type of allowedGameTypes) {
      gameTypeStats[type] = {
        won: 0,
        lost: 0,
        total: 0,
      };
    }

    // ============================================================
    // PROCESS EVERY BID
    // ============================================================

    for (const bid of pendingBids) {
      // ----------------------------------------------------------
      // NORMALIZE BID GAME TYPE
      // ----------------------------------------------------------

      const normalizedBidGameType = normalizeGameType(bid.gameType);

      // ----------------------------------------------------------
      // INVALID / OLD GAME TYPE
      // ----------------------------------------------------------

      if (!allowedGameTypes.includes(normalizedBidGameType)) {
        bid.status = "lost";
        bid.lostAt = new Date();
        bid.winAmount = 0;
        bid.resultNumber = null;
        bid.nextOpenDate = parsedNextOpenDate;

        await bid.save({
          session,
        });

        totalLost++;

        continue;
      }

      // ----------------------------------------------------------
      // ALWAYS STORE DECLARED RESULT
      //
      // NOTE: for the patti game types the stored value now needs
      // to come from the schema-cased key, since
      // formattedWinningNumbers no longer keeps a lowercase
      // "single-patti" entry.
      // ----------------------------------------------------------

      const pattiKeyMap = {
        "single-patti": "single-Patti",
        "double-patti": "double-Patti",
        "triple-patti": "triple-Patti",
      };

      const lookupKey =
        pattiKeyMap[normalizedBidGameType] || normalizedBidGameType;

      const bidResultNumber = formattedWinningNumbers[lookupKey];

      bid.resultNumber =
        bidResultNumber !== undefined &&
        bidResultNumber !== null &&
        str(bidResultNumber) !== ""
          ? String(bidResultNumber)
          : null;

      // ----------------------------------------------------------
      // TOTAL GAME TYPE BIDS
      // ----------------------------------------------------------

      if (gameTypeStats[normalizedBidGameType]) {
        gameTypeStats[normalizedBidGameType].total++;
      }

      // ----------------------------------------------------------
      // CHECK WIN
      // ----------------------------------------------------------

      const isWin = checkBidWin(
        {
          ...bid.toObject(),
          gameType: normalizedBidGameType,
        },
        formattedWinningNumbers,
      );

      // ==========================================================
      // WON
      // ==========================================================

      if (isWin) {
        bid.status = "won";

        bid.winAmount = Number(bid.possibleWinAmount) || 0;

        bid.wonAt = new Date();

        // --------------------------------------------------------
        // GET USER
        // --------------------------------------------------------

        const user = await User.findById(bid.userId).session(session);

        if (user) {
          user.credit =
            (Number(user.credit) || 0) + (Number(bid.possibleWinAmount) || 0);

          await user.save({
            session,
          });

          totalPayout += Number(bid.possibleWinAmount) || 0;
        }

        totalWon++;

        winningBidsList.push(bid);

        if (gameTypeStats[normalizedBidGameType]) {
          gameTypeStats[normalizedBidGameType].won++;
        }
      }

      // ==========================================================
      // LOST
      // ==========================================================
      else {
        bid.status = "lost";

        bid.winAmount = 0;

        bid.lostAt = new Date();

        totalLost++;

        if (gameTypeStats[normalizedBidGameType]) {
          gameTypeStats[normalizedBidGameType].lost++;
        }
      }

      // ============================================================
      // NEXT OPEN DATE
      // ============================================================

      bid.nextOpenDate = parsedNextOpenDate;

      // ============================================================
      // SAVE BID
      // ============================================================

      await bid.save({
        session,
      });
    }

    // ============================================================
    // CREATE RESULT DATA
    // ============================================================

    const resultData = {
      marketId: market._id,

      marketDayId: resolvedMarketDayId,

      marketDate: resolvedMarketDate,

      marketName: market.name,

      digitType,

      winningNumber: formattedWinningNumbers,

      resultDate: parsedResultDate,

      nextOpenDate: parsedNextOpenDate,

      declaredBy: req.user.id,

      totalBids: pendingBids.length,

      totalWinningBids: totalWon,

      totalPayout,

      status: "declared",
    };

    // ============================================================
    // SAVE RESULT
    // ============================================================

    const result = await Result.create([resultData], {
      session,
    });

    // ============================================================
    // UPDATE ALL BIDS NEXT OPEN DATE
    // ============================================================

    await Bid.updateMany(
      {
        marketId: market._id,
        marketDayId: resolvedMarketDayId,
      },
      {
        $set: {
          nextOpenDate: parsedNextOpenDate,
        },
      },
      {
        session,
      },
    );

    // ============================================================
    // UPDATE MARKET
    // ============================================================

    marketDay.isResultDeclared = true;

    // marketArray.winningNumber is a STRING in the Market schema.
    // Store a stable JSON string here. Result.winningNumber can remain
    // the complete object because its schema accepts an object.
    marketDay.winningNumber = JSON.stringify(formattedWinningNumbers);

    marketDay.resultDeclaredAt = new Date();

    marketDay.declaredGameType = null;

    await market.save({
      session,
    });

    // ============================================================
    // COMMIT
    // ============================================================

    await session.commitTransaction();

    await session.endSession();

    // ============================================================
    // SUCCESS
    // ============================================================

    return res.json({
      success: true,

      message: "Result declared successfully",

      data: {
        market: {
          id: market._id,
          name: market.name,
          digitType,
        },

        result: result[0],

        resultDate: parsedResultDate,

        nextOpenDate: parsedNextOpenDate,

        summary: {
          digitType,

          allowedGameTypes,

          totalBidsProcessed: pendingBids.length,

          totalWon,

          totalLost,

          totalPayout,

          gameTypeStats,
        },

        winningBids: winningBidsList.map((bid) => ({
          id: bid._id,

          userId: bid.userId,

          gameType: bid.gameType,

          number: bid.number,

          bidAmount: bid.bidAmount,

          winAmount: bid.winAmount,

          resultNumber: bid.resultNumber,

          nextOpenDate: parsedNextOpenDate,
        })),
      },
    });
  } catch (error) {
    // ============================================================
    // ROLLBACK
    // ============================================================

    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("Transaction Abort Error:", abortError);
    }

    await session.endSession();

    console.error("Declare Result Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ================= GET RESULTS ================================
// ============================================================

exports.getResults = async (req, res) => {
  try {
    const { marketId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (marketId) {
      filter.marketId = marketId;
    }

    if (startDate || endDate) {
      filter.resultDate = {};

      if (startDate) {
        const parsedStartDate = new Date(startDate);

        if (!Number.isNaN(parsedStartDate.getTime())) {
          filter.resultDate.$gte = parsedStartDate;
        }
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);

        if (!Number.isNaN(parsedEndDate.getTime())) {
          filter.resultDate.$lte = parsedEndDate;
        }
      }
    }

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);

    const parsedLimit = Math.max(parseInt(limit, 10) || 20, 1);

    const results = await Result.find(filter)
      .populate("marketId", "name marketId digitType")
      .populate("declaredBy", "name email")
      .sort({
        resultDate: -1,
      })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    const total = await Result.countDocuments(filter);

    return res.json({
      success: true,

      data: results,

      pagination: {
        page: parsedPage,

        limit: parsedLimit,

        total,

        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error("Get Results Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ================= GET RESULT BY ID ==========================
// ============================================================

exports.getResultById = async (req, res) => {
  try {
    const { resultId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result ID",
      });
    }

    const result = await Result.findById(resultId)
      .populate("marketId", "name marketId digitType")
      .populate("declaredBy", "name email");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const actualMarketId = result.marketId?._id || result.marketId;

    const winningBids = await Bid.find({
      marketId: actualMarketId,
      status: "won",
    })
      .populate("userId", "name email mobile")
      .select("userId gameType number bidAmount winAmount");

    return res.json({
      success: true,

      data: {
        result,

        winningBids,

        totalWinners: winningBids.length,
      },
    });
  } catch (error) {
    console.error("Get Result By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ================= GET TODAY'S RESULTS =======================
// ============================================================

exports.getTodayResults = async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const results = await Result.find({
      resultDate: {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate("marketId", "name marketId digitType")
      .sort({
        resultDate: -1,
      });

    return res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get Today Results Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ============================================================
// ================= GET RESULT STATISTICS =====================
// ============================================================

exports.getResultStats = async (req, res) => {
  try {
    const stats = await Result.aggregate([
      {
        $group: {
          _id: "$marketId",

          totalResults: {
            $sum: 1,
          },

          totalPayout: {
            $sum: "$totalPayout",
          },

          totalWinningBids: {
            $sum: "$totalWinningBids",
          },

          avgPayout: {
            $avg: "$totalPayout",
          },
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
        $unwind: "$market",
      },

      {
        $project: {
          _id: 0,

          marketId: "$_id",

          marketName: "$market.name",

          digitType: "$market.digitType",

          totalResults: 1,

          totalPayout: 1,

          totalWinningBids: 1,

          avgPayout: {
            $round: ["$avgPayout", 2],
          },
        },
      },

      {
        $sort: {
          totalResults: -1,
        },
      },
    ]);

    // ==========================================================
    // OVERALL STATS
    // ==========================================================

    const overallStats = await Result.aggregate([
      {
        $group: {
          _id: null,

          totalResults: {
            $sum: 1,
          },

          totalPayout: {
            $sum: "$totalPayout",
          },

          totalWinningBids: {
            $sum: "$totalWinningBids",
          },

          totalBids: {
            $sum: "$totalBids",
          },

          avgPayout: {
            $avg: "$totalPayout",
          },
        },
      },
    ]);

    return res.json({
      success: true,

      data: {
        byMarket: stats,

        overall: overallStats[0] || {
          totalResults: 0,
          totalPayout: 0,
          totalWinningBids: 0,
          totalBids: 0,
          avgPayout: 0,
        },
      },
    });
  } catch (error) {
    console.error("Get Result Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getAllPublicResults = async (req, res) => {
  try {
    const results = await Result.find({
      status: "declared",
    })
      .select(
        "marketId marketName marketDate digitType winningNumber resultDate nextOpenDate status",
      )
      .sort({
        resultDate: -1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get All Public Results Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch results",
    });
  }
};
