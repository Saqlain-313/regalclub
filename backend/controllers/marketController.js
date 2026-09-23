const Market = require("../models/Market");
const uploadToImgBB = require("../utils/uploadToImgBB");

const GAME_TYPES = {
  "2-digit": ["single", "jodi", "last-digit", "first-digit"],
  "3-digit": [
    "single", "single-Patti", "double-Patti", "triple-Patti",
    "jodi", "panna", "half-sangam", "full-sangam",
    "last-digit", "first-digit",
  ],
};

const getGameTypesByDigitType = (digitType) => GAME_TYPES[digitType] || [];

const validateDigitType = (digitType) => {
  if (!digitType) return "Digit type is required";
  if (!["2-digit", "3-digit"].includes(digitType)) {
    return "Digit type must be either 2-digit or 3-digit";
  }
  return null;
};

const parseNumber = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeDate = (value) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

// ✅ FIXED: accept isActive and isResultDeclared properly
const buildDay = ({
  marketDate,
  openTime,
  closeTime,
  resultTime,
  minBid = 10,
  maxBid = 10000,
  isActive = true,
}) => ({
  marketDate: normalizeDate(marketDate),
  openTime: openTime || "",
  closeTime: closeTime || "",
  resultTime: resultTime || "",
  minBid,
  maxBid,
  isActive: isActive !== false,
  isResultDeclared: false,
  winningNumber: null,
  resultDeclaredAt: null,
});

const getTodayDay = (market) => {
  if (!market?.marketArray?.length) return null;
  const today = normalizeDate(new Date());
  return market.marketArray.find(
    (d) => normalizeDate(d.marketDate)?.getTime() === today.getTime()
  );
};

// ======================================================
// CREATE MASTER MARKET + MARKET DAY ARRAY
// ======================================================
exports.createMarket = async (req, res) => {
  try {
    console.log("CREATE MARKET REQUEST BODY:", req.body);

    const {
      name,
      marketId,
      digitType,
      description,
      marketArray: marketArrayRaw,
    } = req.body;

    // BASIC VALIDATION
    if (!name?.trim() || !marketId?.trim() || !digitType) {
      return res.status(400).json({
        success: false,
        message: "Name, market ID and digit type are required",
      });
    }

    // DIGIT TYPE VALIDATION
    const digitTypeError = validateDigitType(digitType);
    if (digitTypeError) {
      return res.status(400).json({
        success: false,
        message: digitTypeError,
      });
    }

    // PARSE MARKET ARRAY
    let marketArray = [];
    if (marketArrayRaw) {
      try {
        marketArray =
          typeof marketArrayRaw === "string"
            ? JSON.parse(marketArrayRaw)
            : marketArrayRaw;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid marketArray JSON",
        });
      }
    }

    if (!Array.isArray(marketArray) || marketArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "marketArray is required and must contain at least one market date",
      });
    }

    // VALIDATE / BUILD EACH MARKET DAY
    const processedMarketArray = [];

    for (const day of marketArray) {
      if (!day.marketDate) {
        return res.status(400).json({
          success: false,
          message: "marketDate is required for every market day",
        });
      }

      const parsedMinBid = parseNumber(day.minBid, 10);
      const parsedMaxBid = parseNumber(day.maxBid, 10000);

      if (
        parsedMinBid === null ||
        parsedMaxBid === null ||
        parsedMinBid < 0 ||
        parsedMaxBid < parsedMinBid
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid minBid/maxBid for market date ${day.marketDate}`,
        });
      }

      const normalizedDate = normalizeDate(day.marketDate);
      if (!normalizedDate) {
        return res.status(400).json({
          success: false,
          message: `Invalid marketDate: ${day.marketDate}`,
        });
      }

      processedMarketArray.push(
        buildDay({
          marketDate: normalizedDate,
          openTime: day.openTime,
          closeTime: day.closeTime,
          resultTime: day.resultTime,
          minBid: parsedMinBid,
          maxBid: parsedMaxBid,
          isActive: day.isActive !== false, // ✅ now respected
        })
      );
    }

    // CHECK DUPLICATE MARKET
    const existing = await Market.findOne({
      $or: [{ name: name.trim() }, { marketId: marketId.trim() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Market name or ID already exists",
      });
    }

    // IMAGE UPLOAD
    let image = "";
    if (req.file) {
      const uploaded = await uploadToImgBB(req.file);
      if (typeof uploaded !== "string") {
        return res.status(500).json({
          success: false,
          message: "Invalid image URL received from ImgBB",
        });
      }
      image = uploaded;
    }

    // CREATE MARKET
    const market = await Market.create({
      name: name.trim(),
      marketId: marketId.trim(),
      image,
      digitType,
      gameTypes: getGameTypesByDigitType(digitType),
      marketArray: processedMarketArray,
      description: description?.trim() || "",
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Market created successfully",
      data: market,
    });
  } catch (error) {
    console.error("CREATE MARKET ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Market name or ID already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// ADD A DATE OBJECT INSIDE marketArray
// ======================================================
exports.createNextMarketDaysCron = async () => {
  try {
    const markets = await Market.find({});

    if (!markets.length) {
      console.log("No markets found");
      return;
    }

    for (const market of markets) {
      try {
        if (!market.marketArray || market.marketArray.length === 0) {
          console.log(`Skipping market ${market._id}: no market days`);
          continue;
        }

        // Latest market day find karo
        const latestDay = market.marketArray.reduce((latest, current) => {
          const latestDate = normalizeDate(latest.marketDate);
          const currentDate = normalizeDate(current.marketDate);

          if (!currentDate) return latest;
          if (!latestDate) return current;

          return currentDate > latestDate ? current : latest;
        });

        const latestDate = normalizeDate(latestDay.marketDate);

        if (!latestDate) {
          console.log(
            `Skipping market ${market._id}: invalid latest market date`
          );
          continue;
        }

        // Next day
        const nextDate = new Date(latestDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // Duplicate check
        const alreadyExists = market.marketArray.some((day) => {
          const dayDate = normalizeDate(day.marketDate);

          return (
            dayDate &&
            dayDate.getTime() === nextDate.getTime()
          );
        });

        if (alreadyExists) {
          console.log(
            `Market ${market._id}: ${nextDate.toISOString().split("T")[0]} already exists`
          );
          continue;
        }

        // Same settings, ONLY date changes
        const newDay = buildDay({
          marketDate: nextDate,

          openTime: latestDay.openTime,
          closeTime: latestDay.closeTime,
          resultTime: latestDay.resultTime,

          minBid: latestDay.minBid,
          maxBid: latestDay.maxBid,

          isActive: latestDay.isActive,
        });

        market.marketArray.push(newDay);

        await market.save();

        console.log(
          `Market ${market._id}: created next day ${nextDate
            .toISOString()
            .split("T")[0]}`
        );
      } catch (marketError) {
        console.error(
          `Error processing market ${market._id}:`,
          marketError
        );
      }
    }

    console.log("NEXT MARKET DAYS CRON COMPLETED");
  } catch (error) {
    console.error("NEXT MARKET DAYS CRON ERROR:", error);
  }
};

// ======================================================
// ENSURE TOMORROW EXISTS (cron-safe)
// ======================================================
exports.ensureTomorrowMarketDay = async (req, res) => {
  try {
    const { marketId } = req.params;
    const market = await Market.findById(marketId);
    if (!market) return res.status(404).json({ success: false, message: "Market not found" });

    const today = normalizeDate(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const exists = market.marketArray.some(
      (d) => normalizeDate(d.marketDate)?.getTime() === tomorrow.getTime()
    );

    if (!exists) {
      const source =
        getTodayDay(market) ||
        market.marketArray[market.marketArray.length - 1];

      if (!source) {
        return res.status(400).json({ success: false, message: "No source market day available" });
      }

      market.marketArray.push(
        buildDay({
          marketDate: tomorrow,
          openTime: source.openTime,
          closeTime: source.closeTime,
          resultTime: source.resultTime,
          minBid: source.minBid,
          maxBid: source.maxBid,
          isActive: source.isActive !== false,
        })
      );

      await market.save();
    }

    return res.status(200).json({
      success: true,
      message: exists ? "Tomorrow already exists" : "Tomorrow market day created",
      data: market,
    });
  } catch (error) {
    console.error("ENSURE TOMORROW ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE MASTER DATA (+ optional marketArray merge)
// ======================================================
exports.updateMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const market = await Market.findById(marketId);
    if (!market) return res.status(404).json({ success: false, message: "Market not found" });

    const update = {};
    const allowed = ["name", "image", "digitType", "description"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    if (update.name !== undefined) update.name = String(update.name).trim();
    if (update.description !== undefined) update.description = String(update.description).trim();

    if (update.digitType !== undefined) {
      const error = validateDigitType(update.digitType);
      if (error) return res.status(400).json({ success: false, message: error });
      update.gameTypes = getGameTypesByDigitType(update.digitType);
    }

    // ✅ FIXED: handle optional marketArray sent from the edit modal
    if (req.body.marketArray !== undefined) {
      let parsedArray = req.body.marketArray;

      if (typeof parsedArray === "string") {
        try {
          parsedArray = JSON.parse(parsedArray);
        } catch (err) {
          return res.status(400).json({ success: false, message: "Invalid marketArray JSON" });
        }
      }

      if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
        return res.status(400).json({ success: false, message: "marketArray must contain at least one day" });
      }

      const incomingDay = parsedArray[0];
      const incomingDate = normalizeDate(incomingDay.marketDate);
      if (!incomingDate) {
        return res.status(400).json({ success: false, message: "Invalid marketDate in marketArray" });
      }

      const parsedMinBid = parseNumber(incomingDay.minBid, 10);
      const parsedMaxBid = parseNumber(incomingDay.maxBid, 10000);

      if (
        parsedMinBid === null ||
        parsedMaxBid === null ||
        parsedMinBid < 0 ||
        parsedMaxBid < parsedMinBid
      ) {
        return res.status(400).json({ success: false, message: "Invalid minBid/maxBid" });
      }

      // find existing day by the same date, otherwise by first day
      const existingDay =
        market.marketArray.find(
          (d) => normalizeDate(d.marketDate)?.getTime() === incomingDate.getTime()
        ) || market.marketArray[0];

      if (existingDay) {
        existingDay.marketDate = incomingDate;
        existingDay.openTime = incomingDay.openTime || "";
        existingDay.closeTime = incomingDay.closeTime || "";
        existingDay.resultTime = incomingDay.resultTime || "";
        existingDay.minBid = parsedMinBid;
        existingDay.maxBid = parsedMaxBid;

        if (incomingDay.isActive !== undefined) {
          existingDay.isActive = incomingDay.isActive !== false;
        }
      } else {
        market.marketArray.push(
          buildDay({
            marketDate: incomingDate,
            openTime: incomingDay.openTime,
            closeTime: incomingDay.closeTime,
            resultTime: incomingDay.resultTime,
            minBid: parsedMinBid,
            maxBid: parsedMaxBid,
            isActive: incomingDay.isActive !== false,
          })
        );
      }
    }

    // IMAGE UPLOAD
    if (req.file) {
      const uploaded = await uploadToImgBB(req.file);
      if (typeof uploaded !== "string") {
        return res.status(500).json({ success: false, message: "Invalid image URL received from ImgBB" });
      }
      update.image = uploaded;
    }

    // Apply top-level fields
    Object.assign(market, update);

    await market.save();

    const populated = await Market.findById(marketId)
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Market updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("UPDATE MARKET ERROR:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Market name or ID already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE ONE DATE OBJECT
// ======================================================
exports.updateMarketDay = async (req, res) => {
  try {
    const { marketId, dayId } = req.params;
    const market = await Market.findById(marketId);
    if (!market) return res.status(404).json({ success: false, message: "Market not found" });

    const day = market.marketArray.id(dayId);
    if (!day) return res.status(404).json({ success: false, message: "Market day not found" });

    const fields = ["openTime", "closeTime", "resultTime", "isActive"];
    for (const key of fields) {
      if (req.body[key] !== undefined) day[key] = req.body[key];
    }

    if (req.body.marketDate !== undefined) {
      const date = normalizeDate(req.body.marketDate);
      if (!date) return res.status(400).json({ success: false, message: "Invalid marketDate" });

      const duplicate = market.marketArray.some(
        (d) => d._id.toString() !== dayId && normalizeDate(d.marketDate)?.getTime() === date.getTime()
      );
      if (duplicate) {
        return res.status(400).json({ success: false, message: "This date already exists in marketArray" });
      }
      day.marketDate = date;
    }

    if (req.body.minBid !== undefined) day.minBid = parseNumber(req.body.minBid, day.minBid);
    if (req.body.maxBid !== undefined) day.maxBid = parseNumber(req.body.maxBid, day.maxBid);

    if (
      !Number.isFinite(day.minBid) ||
      !Number.isFinite(day.maxBid) ||
      day.minBid < 0 ||
      day.maxBid < day.minBid
    ) {
      return res.status(400).json({ success: false, message: "Invalid minBid/maxBid" });
    }

    await market.save();

    return res.status(200).json({
      success: true,
      message: "Market day updated successfully",
      data: market,
    });
  } catch (error) {
    console.error("UPDATE MARKET DAY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// DECLARE RESULT FOR ONE DATE
// ======================================================
exports.declareResult = async (req, res) => {
  try {
    const { marketId, dayId } = req.params;
    const { winningNumber } = req.body;

    if (winningNumber === undefined || winningNumber === null || winningNumber === "") {
      return res.status(400).json({ success: false, message: "winningNumber is required" });
    }

    const market = await Market.findById(marketId);
    if (!market) return res.status(404).json({ success: false, message: "Market not found" });

    const day = market.marketArray.id(dayId);
    if (!day) return res.status(404).json({ success: false, message: "Market day not found" });

    if (day.isResultDeclared) {
      return res.status(400).json({ success: false, message: "Result already declared for this date" });
    }

    day.winningNumber = String(winningNumber).trim();
    day.isResultDeclared = true;
    day.resultDeclaredAt = new Date();

    await market.save();

    return res.status(200).json({
      success: true,
      message: "Result declared successfully",
      data: market,
    });
  } catch (error) {
    console.error("DECLARE RESULT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// TOGGLE STATUS — top-level AND per-day (✅ FIXED)
// ======================================================
exports.toggleMarketStatus = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { isActive, marketDayId } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be true or false" });
    }

    const market = await Market.findById(marketId);
    if (!market) return res.status(404).json({ success: false, message: "Market not found" });

    // If a specific market day is provided, toggle that day.
    if (marketDayId) {
      const day = market.marketArray.id(marketDayId);
      if (!day) {
        return res.status(404).json({ success: false, message: "Market day not found" });
      }
      day.isActive = isActive;
      await market.save();

      return res.status(200).json({
        success: true,
        message: `Market day ${isActive ? "activated" : "deactivated"} successfully`,
        data: market,
      });
    }

    // Otherwise toggle the top-level market status.
    market.isActive = isActive;
    await market.save();

    return res.status(200).json({
      success: true,
      message: `Market ${isActive ? "activated" : "deactivated"} successfully`,
      data: market,
    });
  } catch (error) {
    console.error("TOGGLE MARKET STATUS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET ALL MARKETS
// ======================================================
exports.getAllMarkets = async (req, res) => {
  try {
    const { isActive, digitType, date, page = 1, limit = 20 } = req.query;
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const currentLimit = Math.max(parseInt(limit, 10) || 20, 1);

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (digitType) filter.digitType = digitType;

    const markets = await Market.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * currentLimit)
      .limit(currentLimit);

    let data = markets;
    if (date) {
      const target = normalizeDate(date);
      if (!target) return res.status(400).json({ success: false, message: "Invalid date" });

      data = markets.map((m) => {
        const obj = m.toObject();
        obj.marketArray = obj.marketArray.filter(
          (d) => normalizeDate(d.marketDate)?.getTime() === target.getTime()
        );
        return obj;
      });
    }

    const total = await Market.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        pages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    console.error("GET ALL MARKETS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET MARKET BY ID
// ======================================================
exports.getMarketById = async (req, res) => {
  try {
    const { marketId } = req.params;
    const market = await Market.findById(marketId).populate("createdBy", "name email");

    if (!market) return res.status(404).json({ success: false, message: "Market not found" });

    return res.status(200).json({ success: true, data: market });
  } catch (error) {
    console.error("GET MARKET ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET ACTIVE MARKETS
// ======================================================
exports.getActiveMarkets = async (req, res) => {
  try {
    const markets = await Market.find({})
      .select(
        "name marketId digitType gameTypes image description marketArray createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const activeMarkets = markets
      .map((market) => {
        const activeDays = (market.marketArray || []).filter(
          (day) => day.isActive === true
        );

        return {
          ...market,
          marketArray: activeDays,
        };
      })
      .filter((market) => market.marketArray.length > 0);

    return res.status(200).json({
      success: true,
      data: activeMarkets,
    });
  } catch (error) {
    console.error("GET ACTIVE MARKETS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================================
// DELETE A DATE OBJECT
// ======================================================
exports.deleteMarketDay = async (req, res) => {
  try {
    const { marketId, dayId } = req.params;
    const market = await Market.findById(marketId);
    if (!market) return res.status(404).json({ success: false, message: "Market not found" });

    const day = market.marketArray.id(dayId);
    if (!day) return res.status(404).json({ success: false, message: "Market day not found" });

    market.marketArray.pull(dayId);
    await market.save();

    return res.status(200).json({ success: true, message: "Market day deleted successfully", data: market });
  } catch (error) {
    console.error("DELETE MARKET DAY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// DELETE MARKET
// ======================================================
exports.deleteMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const market = await Market.findByIdAndDelete(marketId);

    if (!market) return res.status(404).json({ success: false, message: "Market not found" });

    return res.status(200).json({ success: true, message: "Market deleted successfully" });
  } catch (error) {
    console.error("DELETE MARKET ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};