const crypto = require("crypto");
const MinesGame = require("../models/MinesGame");
const User = require("../models/authmodel");
const CurrencyRate = require("../models/CurrencyRate");

const GRID_SIZE = 6;
const TOTAL_CELLS = 36;

const MULTIPLIERS = [
  1.05, 1.1, 1.15, 1.25, 1.5, 1.75, 2.0, 2.05, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5,
  4.0, 4.5, 5.0, 5.5, 6.0, 7.0, 8.0, 10.0,
];

function generateMines(count) {
  const positions = new Set();

  while (positions.size < count) {
    positions.add(crypto.randomInt(0, TOTAL_CELLS));
  }

  return [...positions];
}

/* =========================================================
   GUARANTEED SAFE FIRST CLICKS

   Public game rule: every new game has either 2 or 3
   guaranteed-safe first clicks.

   Derived deterministically from the game id so it stays
   consistent across all clicks of the same game.
========================================================= */
function getGuaranteedSafeClicks(game) {
  if (!game || !game._id) {
    return crypto.randomInt(0, 10) < 6 ? 2 : 3;
  }

  const idStr = String(game._id);
  const lastChar = idStr.charCodeAt(idStr.length - 1);

  return lastChar % 2 === 0 ? 2 : 3;
}

/*
 * If one of the first guaranteed-safe clicks happens to be
 * a mine, move that mine to another unopened cell.
 *
 * Mine count remains exactly the same.
 */
function moveMineFromSafeCell(game, safeCell) {
  const minePositions = Array.isArray(game.minePositions)
    ? [...game.minePositions]
    : [];

  const mineIndex = minePositions.indexOf(safeCell);

  if (mineIndex === -1) {
    return true;
  }

  const openedCells = new Set(
    Array.isArray(game.openedCells) ? game.openedCells : [],
  );

  const occupiedByOtherMines = new Set(
    minePositions.filter((position) => position !== safeCell),
  );

  const availableCells = [];

  for (let position = 0; position < TOTAL_CELLS; position += 1) {
    if (position === safeCell) continue;
    if (openedCells.has(position)) continue;
    if (occupiedByOtherMines.has(position)) continue;

    availableCells.push(position);
  }

  if (availableCells.length === 0) {
    return false;
  }

  const newMineCell =
    availableCells[crypto.randomInt(0, availableCells.length)];

  minePositions[mineIndex] = newMineCell;
  game.minePositions = minePositions;

  return true;
}

function getMultiplier(safeCells) {
  if (safeCells <= 0) {
    return 1;
  }

  return MULTIPLIERS[safeCells - 1] || MULTIPLIERS[MULTIPLIERS.length - 1];
}

/* =========================================================
   CURRENCY / COUNTRY HELPERS
========================================================= */

const COUNTRY_ALIASES = {
  in: "IN",
  india: "IN",

  au: "AU",
  australia: "AU",

  pk: "PK",
  pakistan: "PK",

  bd: "BD",
  bangladesh: "BD",

  np: "NP",
  nepal: "NP",

  ae: "AE",
  uae: "AE",
  dubai: "AE",
  "united arab emirates": "AE",
};

function normalizeCountryCode(country) {
  if (!country) return "IN";

  const key = String(country).trim().toLowerCase();

  return COUNTRY_ALIASES[key] || key.toUpperCase();
}

async function getUserCurrencyInfo(user) {
  const countryCode = normalizeCountryCode(user?.country);

  if (countryCode === "IN") {
    return {
      countryCode: "IN",
      currencyCode: "INR",
      rate: 1,
    };
  }

  const currencyRate = await CurrencyRate.findOne({
    countryCode,
    status: true,
  }).lean();

  if (!currencyRate) {
    const error = new Error(
      `Currency rate not configured for country ${countryCode}`,
    );
    error.code = "CURRENCY_RATE_NOT_FOUND";
    error.countryCode = countryCode;
    throw error;
  }

  const rate = Number(currencyRate.rate);

  if (!Number.isFinite(rate) || rate <= 0) {
    const error = new Error(
      `Invalid currency rate for country ${countryCode}`,
    );
    error.code = "INVALID_CURRENCY_RATE";
    error.countryCode = countryCode;
    throw error;
  }

  return {
    countryCode,
    currencyCode: String(currencyRate.currencyCode || "").toUpperCase(),
    rate,
  };
}

function localToBaseAmount(localAmount, _rate) {
  const amount = Number(localAmount);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return amount;
}

function baseToLocalAmount(baseAmount, _rate) {
  const amount = Number(baseAmount);
  if (!Number.isFinite(amount)) return 0;
  return amount;
}

/* =========================================================
   START GAME
========================================================= */

exports.startGame = async (req, res) => {
  let deducted = false;
  let deductedAmount = 0;

  try {
    const userId = req.user.id;

    // ---------------------------------------------------------
    // VALIDATE USER FIRST
    // ---------------------------------------------------------
    const user = await User.findById(userId).select(
      "credit status country",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    // ---------------------------------------------------------
    // FIND USER COUNTRY + CURRENCY RATE
    // ---------------------------------------------------------
    let currencyInfo;

    try {
      currencyInfo = await getUserCurrencyInfo(user);
    } catch (currencyError) {
      if (
        currencyError.code === "CURRENCY_RATE_NOT_FOUND" ||
        currencyError.code === "INVALID_CURRENCY_RATE"
      ) {
        return res.status(400).json({
          success: false,
          message: currencyError.message,
          country: currencyError.countryCode,
        });
      }

      throw currencyError;
    }

    // ---------------------------------------------------------
    // MINES
    // ---------------------------------------------------------
    const minesCount = Math.min(
      Math.max(Number(req.body.minesCount) || 15, 1),
      35,
    );

    const localStake = Number(req.body.virtualStake);

    if (!Number.isFinite(localStake) || localStake <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid game entry amount",
      });
    }

    const virtualStake = localToBaseAmount(localStake, currencyInfo.rate);

    if (!Number.isFinite(virtualStake) || virtualStake <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid game entry amount",
      });
    }

    // ---------------------------------------------------------
    // CHECK ACTIVE GAME FIRST
    // ---------------------------------------------------------
    const existing = await MinesGame.findOne({
      user: userId,
      status: "playing",
    }).select("+minePositions");

    if (existing) {
      const existingStake = Number(existing.virtualStake || 0);

      return res.json({
        success: true,
        existingGame: true,

        country: currencyInfo.countryCode,
        currency: currencyInfo.currencyCode,
        currencyRate: currencyInfo.rate,

        credit: Number(user.credit || 0),
        creditLocal: baseToLocalAmount(
          Number(user.credit || 0),
          currencyInfo.rate,
        ),

        game: {
          id: existing._id,
          gridSize: existing.gridSize || GRID_SIZE,
          totalCells: existing.totalCells || TOTAL_CELLS,

          minesCount: existing.minesCount,

          openedCells: existing.openedCells || [],
          safeCells: existing.safeCells || 0,

          multiplier: Number(existing.multiplier || 1),

          virtualStake: existingStake,
          entryAmount: existingStake,

          virtualWin: Number(existing.virtualWin || 0),

          winAmount: baseToLocalAmount(
            Number(existing.virtualWin || 0),
            currencyInfo.rate,
          ),

          status: existing.status,
          createdAt: existing.createdAt,
        },
      });
    }

    // ---------------------------------------------------------
    // DEDUCT ENTRY FROM REAL LOCAL credit
    // ---------------------------------------------------------
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        status: "active",
        credit: {
          $gte: virtualStake,
        },
      },
      {
        $inc: {
          credit: -virtualStake,
        },
      },
      {
        new: true,
      },
    ).select("credit country");

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credit",
      });
    }

    deducted = true;
    deductedAmount = virtualStake;

    // ---------------------------------------------------------
    // GENERATE MINES
    // ---------------------------------------------------------
    const minePositions = generateMines(minesCount);

    // ---------------------------------------------------------
    // CREATE GAME
    // ---------------------------------------------------------
    let game;

    try {
      game = await MinesGame.create({
        user: userId,

        gridSize: GRID_SIZE,
        totalCells: TOTAL_CELLS,

        minesCount,
        minePositions,

        openedCells: [],
        safeCells: 0,

        multiplier: 1,

        virtualStake,
        virtualWin: 0,

        status: "playing",
      });
    } catch (createError) {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          credit: virtualStake,
        },
      });

      deducted = false;
      throw createError;
    }

    const entryLocalAmount = baseToLocalAmount(
      virtualStake,
      currencyInfo.rate,
    );

    // ---------------------------------------------------------
    // SOCKET ADMIN
    // ---------------------------------------------------------
    const io = req.app.get("io");

    if (io) {
      io.to("admin").emit("mines-game-created", {
        gameId: game._id,
        userId,

        country: currencyInfo.countryCode,
        currency: currencyInfo.currencyCode,
        currencyRate: currencyInfo.rate,

        minesCount,

        virtualStake,
        entryAmount: virtualStake,

        localStake: entryLocalAmount,

        creditAfter: Number(updatedUser.credit),

        status: game.status,
        createdAt: game.createdAt,
      });
    }

    // ---------------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------------
    return res.status(201).json({
      success: true,

      country: currencyInfo.countryCode,
      currency: currencyInfo.currencyCode,
      currencyRate: currencyInfo.rate,

      credit: Number(updatedUser.credit),

      creditLocal: baseToLocalAmount(
        Number(updatedUser.credit),
        currencyInfo.rate,
      ),

      game: {
        id: game._id,

        gridSize: GRID_SIZE,
        totalCells: TOTAL_CELLS,

        minesCount,

        openedCells: [],
        safeCells: 0,

        multiplier: 1,

        virtualStake,

        entryAmount: virtualStake,

        virtualWin: 0,
        winAmount: 0,

        status: "playing",
        createdAt: game.createdAt,
      },
    });
  } catch (error) {
    console.error("Mines startGame error:", error);

    if (deducted && deductedAmount > 0) {
      try {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: {
            credit: deductedAmount,
          },
        });
      } catch (refundError) {
        console.error("Mines credit refund error:", refundError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to start Mines game",
    });
  }
};

/* =========================================================
   REVEAL CELL
========================================================= */

exports.revealCell = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    const cell = Number(req.body.cell);

    if (!Number.isInteger(cell) || cell < 0 || cell >= TOTAL_CELLS) {
      return res.status(400).json({
        success: false,
        message: "Invalid cell",
      });
    }

    const user = await User.findById(userId).select(
      "credit status country",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    let currencyInfo;

    try {
      currencyInfo = await getUserCurrencyInfo(user);
    } catch (currencyError) {
      if (
        currencyError.code === "CURRENCY_RATE_NOT_FOUND" ||
        currencyError.code === "INVALID_CURRENCY_RATE"
      ) {
        return res.status(400).json({
          success: false,
          message: currencyError.message,
          country: currencyError.countryCode,
        });
      }

      throw currencyError;
    }

    const game = await MinesGame.findOne({
      _id: gameId,
      user: userId,
      status: "playing",
    }).select("+minePositions");

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    if (game.openedCells.includes(cell)) {
      return res.status(400).json({
        success: false,
        message: "Cell already opened",
      });
    }

    // ---------------------------------------------------------
    // GUARANTEED SAFE FIRST 2-3 CLICKS
    // ---------------------------------------------------------
    const currentClickNumber = (game.openedCells?.length || 0) + 1;
    const guaranteedSafeClicks = getGuaranteedSafeClicks(game);

    if (currentClickNumber <= guaranteedSafeClicks) {
      const moved = moveMineFromSafeCell(game, cell);

      if (!moved) {
        return res.status(500).json({
          success: false,
          message: "Unable to prepare guaranteed-safe cell",
        });
      }
    }

    // ---------------------------------------------------------
    // CHECK MINE
    // ---------------------------------------------------------
    const isMine = game.minePositions.includes(cell);

    if (isMine) {
      game.status = "lost";
      game.finishedAt = new Date();
      game.virtualWin = 0;

      await game.save();

      const io = req.app.get("io");

      const payload = {
        gameId,
        cell,
        isMine: true,
        status: "lost",
        minesCount: game.minesCount,

        openedCells: game.openedCells || [],
        safeCells: game.safeCells || 0,

        multiplier: Number(game.multiplier || 1),

        virtualStake: Number(game.virtualStake || 0),
        entryAmount: Number(game.virtualStake || 0),
        virtualWin: 0,

        localStake: baseToLocalAmount(
          Number(game.virtualStake || 0),
          currencyInfo.rate,
        ),
        localWin: 0,

        country: currencyInfo.countryCode,
        currency: currencyInfo.currencyCode,
        currencyRate: currencyInfo.rate,

        minePositions: game.minePositions,
      };

      if (io) {
        io.to(`user-${userId}`).emit("mines-update", payload);

        io.to("admin").emit("mines-game-finished", {
          gameId,
          userId,

          country: currencyInfo.countryCode,
          currency: currencyInfo.currencyCode,
          currencyRate: currencyInfo.rate,

          status: "lost",

          virtualStake: Number(game.virtualStake || 0),
          virtualWin: 0,

          cell,
          finishedAt: game.finishedAt,
        });
      }

      return res.json({
        success: true,
        result: payload,
      });
    }

    // ---------------------------------------------------------
    // SAFE CELL
    // ---------------------------------------------------------
    game.openedCells.push(cell);
    game.safeCells = game.openedCells.length;
    game.multiplier = getMultiplier(game.safeCells);

    const safeTotal = TOTAL_CELLS - game.minesCount;

    // ---------------------------------------------------------
    // AUTO WIN
    // ---------------------------------------------------------
    if (game.safeCells >= safeTotal) {
      game.status = "won";

      const virtualWin =
        Number(game.virtualStake || 0) *
        Number(game.multiplier || 1);

      game.virtualWin = virtualWin;
      game.finishedAt = new Date();

      await game.save();

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            credit: virtualWin,
          },
        },
        {
          new: true,
        },
      ).select("credit country");

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          message: "Win recorded but credit update failed. Contact admin.",
        });
      }

      const localStake = baseToLocalAmount(
        Number(game.virtualStake || 0),
        currencyInfo.rate,
      );

      const localWin = baseToLocalAmount(
        Number(virtualWin || 0),
        currencyInfo.rate,
      );

      const payload = {
        gameId,
        cell,
        isMine: false,
        status: "won",

        openedCells: game.openedCells,
        safeCells: game.safeCells,

        multiplier: Number(game.multiplier || 1),

        virtualStake: Number(game.virtualStake || 0),
        entryAmount: Number(game.virtualStake || 0),
        virtualWin: Number(virtualWin || 0),

        localStake,
        localWin,

        country: currencyInfo.countryCode,
        currency: currencyInfo.currencyCode,
        currencyRate: currencyInfo.rate,

        credit: Number(updatedUser.credit || 0),

        creditLocal: baseToLocalAmount(
          Number(updatedUser.credit || 0),
          currencyInfo.rate,
        ),

        minePositions: game.minePositions,
      };

      const io = req.app.get("io");

      if (io) {
        io.to(`user-${userId}`).emit("mines-update", payload);

        io.to("admin").emit("mines-game-finished", {
          gameId,
          userId,

          country: currencyInfo.countryCode,
          currency: currencyInfo.currencyCode,
          currencyRate: currencyInfo.rate,

          status: "won",

          virtualStake: Number(game.virtualStake || 0),
          virtualWin: Number(virtualWin || 0),

          creditAfter: Number(updatedUser?.credit || 0),

          finishedAt: game.finishedAt,
        });
      }

      return res.json({
        success: true,
        result: payload,
      });
    }

    // ---------------------------------------------------------
    // NORMAL PLAYING GAME
    // ---------------------------------------------------------
    await game.save();

    const localStake = baseToLocalAmount(
      Number(game.virtualStake || 0),
      currencyInfo.rate,
    );

    const currentLocalWin = baseToLocalAmount(
      Number(game.virtualStake || 0) *
        Number(game.multiplier || 1),
      currencyInfo.rate,
    );

    const payload = {
      gameId,
      cell,
      isMine: false,
      status: game.status,

      openedCells: game.openedCells,
      safeCells: game.safeCells,

      multiplier: Number(game.multiplier || 1),

      virtualStake: Number(game.virtualStake || 0),
      entryAmount: Number(game.virtualStake || 0),
      virtualWin: 0,

      localStake,
      localWin: currentLocalWin,

      country: currencyInfo.countryCode,
      currency: currencyInfo.currencyCode,
      currencyRate: currencyInfo.rate,
    };

    const io = req.app.get("io");

    if (io) {
      io.to(`user-${userId}`).emit("mines-update", payload);
    }

    return res.json({
      success: true,
      result: payload,
    });
  } catch (error) {
    console.error("Mines revealCell error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reveal cell",
    });
  }
};

/* =========================================================
   CASHOUT
========================================================= */

exports.cashout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    const user = await User.findById(userId).select(
      "credit status country",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    let currencyInfo;

    try {
      currencyInfo = await getUserCurrencyInfo(user);
    } catch (currencyError) {
      if (
        currencyError.code === "CURRENCY_RATE_NOT_FOUND" ||
        currencyError.code === "INVALID_CURRENCY_RATE"
      ) {
        return res.status(400).json({
          success: false,
          message: currencyError.message,
          country: currencyError.countryCode,
        });
      }

      throw currencyError;
    }

    const game = await MinesGame.findOne({
      _id: gameId,
      user: userId,
      status: "playing",
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Active game not found",
      });
    }

    if (Number(game.safeCells || 0) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Open at least one safe cell",
      });
    }

    const virtualWin =
      Number(game.virtualStake || 0) *
      Number(game.multiplier || 1);

    if (!Number.isFinite(virtualWin) || virtualWin <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid winning amount",
      });
    }

    const updatedGame = await MinesGame.findOneAndUpdate(
      {
        _id: gameId,
        user: userId,
        status: "playing",
        safeCells: {
          $gt: 0,
        },
      },
      {
        $set: {
          status: "cashout",
          virtualWin,
          finishedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );

    if (!updatedGame) {
      return res.status(400).json({
        success: false,
        message: "Game has already been completed",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          credit: virtualWin,
        },
      },
      {
        new: true,
      },
    ).select("credit country");

    if (!updatedUser) {
      console.error(
        "CRITICAL: User not found while crediting Mines cashout",
        {
          userId,
          gameId,
          virtualWin,
        },
      );

      return res.status(500).json({
        success: false,
        message:
          "Cashout recorded but credit update failed. Contact admin.",
      });
    }

    const localStake = baseToLocalAmount(
      Number(updatedGame.virtualStake || 0),
      currencyInfo.rate,
    );

    const localWin = baseToLocalAmount(
      Number(virtualWin || 0),
      currencyInfo.rate,
    );

    const result = {
      gameId,
      status: "cashout",

      openedCells: updatedGame.openedCells || [],
      safeCells: updatedGame.safeCells || 0,

      multiplier: Number(updatedGame.multiplier || 1),

      virtualStake: Number(updatedGame.virtualStake || 0),
      entryAmount: Number(updatedGame.virtualStake || 0),
      virtualWin: Number(virtualWin),

      localStake,
      localWin,

      country: currencyInfo.countryCode,
      currency: currencyInfo.currencyCode,
      currencyRate: currencyInfo.rate,

      credit: Number(updatedUser.credit || 0),

      creditLocal: baseToLocalAmount(
        Number(updatedUser.credit || 0),
        currencyInfo.rate,
      ),

      finishedAt: updatedGame.finishedAt,
    };

    const io = req.app.get("io");

    if (io) {
      io.to(`user-${userId}`).emit("mines-cashout", result);

      io.to("admin").emit("mines-game-finished", {
        gameId,
        userId,

        country: currencyInfo.countryCode,
        currency: currencyInfo.currencyCode,
        currencyRate: currencyInfo.rate,

        status: "cashout",

        virtualStake: Number(updatedGame.virtualStake || 0),
        virtualWin: Number(virtualWin),

        localStake,
        localWin,

        creditAfter: Number(updatedUser.credit || 0),

        finishedAt: updatedGame.finishedAt,
      });
    }

    return res.json({
      success: true,
      message: "Cashout successful",

      country: currencyInfo.countryCode,
      currency: currencyInfo.currencyCode,
      currencyRate: currencyInfo.rate,

      virtualWin: Number(virtualWin),

      winAmount: localWin,

      multiplier: Number(updatedGame.multiplier || 1),

      credit: Number(updatedUser.credit || 0),

      creditLocal: baseToLocalAmount(
        Number(updatedUser.credit || 0),
        currencyInfo.rate,
      ),

      entryAmount: Number(updatedGame.virtualStake || 0),

      entryAmountLocal: localStake,

      status: "cashout",
    });
  } catch (error) {
    console.error("Mines cashout error:", error);

    return res.status(500).json({
      success: false,
      message: "Cashout failed",
    });
  }
};

/* =========================================================
   GET HISTORY
========================================================= */

exports.getHistory = async (req, res) => {
  try {
    const games = await MinesGame.find()
      .populate("user", "username name email mobile country")
      .sort({
        createdAt: -1,
      })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Mines getHistory error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load history",
    });
  }
};