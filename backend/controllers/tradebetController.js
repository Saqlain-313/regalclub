const Bet = require("../models/TradeBet");
const Trade = require("../models/Trade");
const User = require("../models/authmodel");
const Admin = require("../models/TradeAdmin");
const socket = require("../config/socket");

// ============================================================
// HELPERS
// ============================================================

// Always use numeric userId.
// Priority: req.user.userId -> req.user.id -> req.id
const uid = (req) => {
  if (!req.user) return null;

  const id = req.user.userId ?? req.user.id ?? req.id;
  const numericId = Number(id);

  return Number.isFinite(numericId) ? numericId : null;
};

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ============================================================
// SOCKET BROADCAST
// ============================================================

const broadcast = () => {
  try {
    if (socket && typeof socket.broadcast === "function") {
      socket.broadcast({
        event: "betDataUpdated",
        data: "betRows",
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error("Socket broadcast error:", err.message);
  }
};

// ============================================================
// CANDLE GENERATION
// ============================================================

const candle = (open, result) => {
  const safeOpen = Number.isFinite(Number(open))
    ? Number(open)
    : 1.4463;

  const delta =
    0.00001 * (Math.floor(Math.random() * 13) + 1);

  const close = Number(
    (
      safeOpen +
      (Number(result) > 4 ? delta : -delta)
    ).toFixed(5)
  );

  const high = Number(
    (
      Math.max(safeOpen, close) +
      0.00001 * (Math.floor(Math.random() * 8) + 1)
    ).toFixed(5)
  );

  const low = Number(
    (
      Math.min(safeOpen, close) -
      0.00001 * (Math.floor(Math.random() * 10) + 1)
    ).toFixed(5)
  );

  return {
    open: safeOpen,
    high,
    low,
    close,
  };
};

// ============================================================
// CREATE TRADE
// ADMIN ONLY
// ============================================================

exports.createTrade = async (req, res) => {
  try {
    // ----------------------------------------------------------
    // Admin check
    // ----------------------------------------------------------

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required to create trades",
      });
    }

    // ----------------------------------------------------------
    // Get last trade
    // ----------------------------------------------------------

    const last = await Trade.findOne()
      .sort({ period: -1 })
      .lean();

    const lastPeriod = last?.period ?? null;

    // ----------------------------------------------------------
    // Get previous period bets + admin setting
    // ----------------------------------------------------------

    const [up, down, admin] = await Promise.all([
      Bet.aggregate([
        {
          $match: {
            period: lastPeriod,
            bet: "up",
            status: 0,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      Bet.aggregate([
        {
          $match: {
            period: lastPeriod,
            bet: "down",
            status: 0,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      Admin.findOne().lean(),
    ]);

    const upAmt = num(up[0]?.total);
    const downAmt = num(down[0]?.total);

    // ----------------------------------------------------------
    // Determine result
    // ----------------------------------------------------------

    let result;

    const trade = String(admin?.trade ?? "-1");

    if (trade === "-1") {
      if (upAmt + downAmt > 10) {
        result =
          upAmt > downAmt
            ? Math.floor(Math.random() * 5)
            : Math.floor(Math.random() * 5) + 5;
      } else {
        result =
          Math.floor(Math.random() * 9) + 1;
      }
    } else if (trade === "-2") {
      result =
        Math.floor(Math.random() * 9) + 1;
    } else {
      result = parseInt(trade, 10);
    }

    if (
      !Number.isFinite(result) ||
      result < 1 ||
      result > 9
    ) {
      result =
        Math.floor(Math.random() * 9) + 1;
    }

    // ----------------------------------------------------------
    // Last completed trade
    // ----------------------------------------------------------

    const lastComplete = await Trade.findOne({
      status: 1,
    })
      .sort({ period: -1 })
      .lean();

    const open = num(lastComplete?.close) || 1.4463;

    const c = candle(open, result);

    // ----------------------------------------------------------
    // Candle timestamp
    // ----------------------------------------------------------

    const x = lastComplete?.x
      ? new Date(
          new Date(lastComplete.x).getTime() + 10000
        )
      : new Date(Date.now() - 300000);

    // ----------------------------------------------------------
    // Complete current pending trade
    // ----------------------------------------------------------

    if (lastPeriod !== null) {
      await Trade.updateOne(
        {
          period: lastPeriod,
        },
        {
          $set: {
            status: 1,
            result: result < 5 ? "down" : "up",
            trade_no: result,

            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,

            x,
          },
        }
      );
    }

    // ----------------------------------------------------------
    // Create next period
    // ----------------------------------------------------------

    const newPeriod =
      lastPeriod !== null
        ? Number(lastPeriod) + 1
        : Number(
            `${new Date()
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "")}0001`
          );

    await Trade.updateOne(
      {
        period: newPeriod,
      },
      {
        $setOnInsert: {
          period: newPeriod,

          tradeType: "BUY",

          open: 0,
          high: 0,
          low: 0,
          close: 0,

          x: new Date(),

          status: 0,
        },
      },
      {
        upsert: true,
      }
    );

    // ----------------------------------------------------------
    // Reset admin trade mode
    // ----------------------------------------------------------

    await Admin.findOneAndUpdate(
      {},
      {
        $set: {
          trade:
            trade === "-1"
              ? "-1"
              : "-2",
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // ----------------------------------------------------------
    // Socket update
    // ----------------------------------------------------------

    broadcast();

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "New trade created successfully",

      data: {
        period: newPeriod,
        result,
      },
    });
  } catch (e) {
    console.error(
      "createTrade error:",
      e
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
};

// ============================================================
// GET TRADE
// PUBLIC / USER
// ============================================================

exports.getTrade = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const [last, all, latest, total] =
      await Promise.all([
        Trade.findOne({
          status: 0,
        })
          .sort({ period: -1 })
          .lean(),

        Trade.find({
          status: 1,
        })
          .sort({ period: -1 })
          .limit(99)
          .lean(),

        Trade.findOne({
          status: 1,
        })
          .sort({ period: -1 })
          .select("trade_no result period close open high low x")
          .lean(),

        Trade.countDocuments({
          status: 1,
        }),
      ]);

    return res.json({
      success: true,

      lastTrade: last?.period ?? null,

      currentTrade: last ?? null,

      allTrade: all,

      betResult: latest?.trade_no ?? null,

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(
          total / limit
        ),
        totalTrades: total,
        limit,
      },

      message: "Trades fetched successfully",
    });
  } catch (e) {
    console.error(
      "getTrade error:",
      e
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
};

// ============================================================
// PLACE BET
// USER ONLY
// ============================================================

exports.placeBet = async (req, res) => {
  try {
    // ----------------------------------------------------------
    // User check
    // ----------------------------------------------------------

    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "User access required to place bets",
      });
    }

    // ----------------------------------------------------------
    // Request data
    // ----------------------------------------------------------

    const {
      period,
      amount,
      bet,
      tradeType,
    } = req.body;

    console.log("placeBet request:", {
      period,
      amount,
      bet,
      tradeType,
    });

    const a = num(amount);

    const userId = uid(req);

    // ----------------------------------------------------------
    // Auth check
    // ----------------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (
      period === undefined ||
      period === null ||
      a <= 0 ||
      !bet ||
      !tradeType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (period, amount, bet, tradeType) are required",
      });
    }

    const periodNumber = Number(period);

    if (!Number.isFinite(periodNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period",
      });
    }

    // ----------------------------------------------------------
    // Validate bet
    // ----------------------------------------------------------

    const normalizedBet = String(
      bet
    ).toLowerCase();

    if (
      normalizedBet !== "up" &&
      normalizedBet !== "down"
    ) {
      return res.status(400).json({
        success: false,
        message: "Bet must be up or down",
      });
    }

    // ----------------------------------------------------------
    // Check current trade
    // ----------------------------------------------------------

    const currentTrade =
      await Trade.findOne({
        period: periodNumber,
        status: 0,
      }).lean();

    if (!currentTrade) {
      return res.status(400).json({
        success: false,
        message:
          "This trading period is no longer active",
      });
    }

    // ----------------------------------------------------------
    // Deduct credit using numeric userId
    // ----------------------------------------------------------

    const user =
      await User.findOneAndUpdate(
        {
          userId: userId,

          credit: {
            $gte: a,
          },
        },
        {
          $inc: {
            credit: -a,
          },
        },
        {
          new: true,
        }
      );

    if (!user) {
      const exists =
        await User.exists({
          userId: userId,
        });

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Insufficient credit",
      });
    }

    // ----------------------------------------------------------
    // Generate order ID
    // ----------------------------------------------------------

    const orderId =
      `${Date.now()}${Math.floor(
        Math.random() * 1000
      )}`;

    try {
      // --------------------------------------------------------
      // Create bet
      // --------------------------------------------------------

      const b = await Bet.create({
        orderId,

        userId,

        period: periodNumber,

        amount: a,

        bet: normalizedBet,

        tradeType,
      });

      // --------------------------------------------------------
      // Broadcast
      // --------------------------------------------------------

      broadcast();

      return res.status(201).json({
        success: true,
        message: "Trade created successfully",

        trade: b,

        credit: user.credit,
      });
    } catch (e) {
      // --------------------------------------------------------
      // Rollback credit
      // --------------------------------------------------------

      await User.updateOne(
        {
          userId: userId,
        },
        {
          $inc: {
            credit: a,
          },
        }
      );

      throw e;
    }
  } catch (e) {
    console.error(
      "placeBet error:",
      e
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
};

// ============================================================
// CHECK WINNERS
// ADMIN ONLY
// ============================================================

exports.checkwhichUserIsWinner = async (
  req,
  res
) => {
  try {
    // ----------------------------------------------------------
    // Admin check
    // ----------------------------------------------------------

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required to process winners",
      });
    }

    // ----------------------------------------------------------
    // Get latest completed trade
    // ----------------------------------------------------------

    const t =
      await Trade.findOne({
        status: 1,
      })
        .sort({ period: -1 })
        .lean();

    if (!t) {
      return res.status(404).json({
        success: false,
        message:
          "No completed trades found",
      });
    }

    // ----------------------------------------------------------
    // Get pending bets
    // ----------------------------------------------------------

    const bets =
      await Bet.find({
        period: t.period,
        status: 0,
      }).lean();

    if (!bets.length) {
      broadcast();

      return res.json({
        success: true,
        message:
          "No pending bets for this period",
        period: t.period,
        result: t.result,
        processed: 0,
      });
    }

    let winners = 0;
    let losers = 0;

    // ----------------------------------------------------------
    // Process bets
    // ----------------------------------------------------------

    for (const b of bets) {
      // --------------------------------------------------------
      // Winner
      // --------------------------------------------------------

      if (b.bet === t.result) {
        const getAmount = Number(
          (
            Number(b.amount) +
            Number(b.amount) * 0.93
          ).toFixed(2)
        );

        const updated =
          await Bet.updateOne(
            {
              _id: b._id,
              status: 0,
            },
            {
              $set: {
                getAmount,
                result: t.result,
                status: 1,
              },
            }
          );

        // Only credit credit if bet was
        // actually changed from pending -> winner.
        if (updated.modifiedCount > 0) {
          await User.updateOne(
            {
              userId: Number(b.userId),
            },
            {
              $inc: {
                credit: getAmount,
              },
            }
          );

          winners++;
        }
      }

      // --------------------------------------------------------
      // Loser
      // --------------------------------------------------------

      else {
        const updated =
          await Bet.updateOne(
            {
              _id: b._id,
              status: 0,
            },
            {
              $set: {
                result: t.result,
                status: 2,
                getAmount: 0,
              },
            }
          );

        if (updated.modifiedCount > 0) {
          losers++;
        }
      }
    }

    // ----------------------------------------------------------
    // Socket update
    // ----------------------------------------------------------

    broadcast();

    return res.json({
      success: true,
      message: "Bets updated successfully",

      period: t.period,

      result: t.result,

      processed: winners + losers,

      winners,

      losers,
    });
  } catch (e) {
    console.error(
      "checkwhichUserIsWinner error:",
      e
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
};

// ============================================================
// GET BETS BY USER
// USER ONLY
// ============================================================

exports.getBetsByUserId = async (
  req,
  res
) => {
  try {
    // ----------------------------------------------------------
    // User check
    // ----------------------------------------------------------

    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message:
          "User access required to view bets",
      });
    }

    // ----------------------------------------------------------
    // Get numeric userId
    // ----------------------------------------------------------

    const userId = uid(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ----------------------------------------------------------
    // Get bets
    // ----------------------------------------------------------

    const bets =
      await Bet.find({
        userId: userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

    // IMPORTANT:
    // Empty history is NOT an error.
    // Return 200 with [].
    return res.json({
      success: true,

      data: bets,

      count: bets.length,
    });
  } catch (e) {
    console.error(
      "getBetsByUserId error:",
      e
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};

// ============================================================
// GET PENDING TRADES
// USER ONLY
// ============================================================

exports.getPendingTrades = async (
  req,
  res
) => {
  try {
    // ----------------------------------------------------------
    // User check
    // ----------------------------------------------------------

    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message:
          "User access required to view pending bets",
      });
    }

    // ----------------------------------------------------------
    // Get numeric userId
    // ----------------------------------------------------------

    const userId = uid(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ----------------------------------------------------------
    // Get pending bets
    // ----------------------------------------------------------

    const bets =
      await Bet.find({
        userId: userId,
        status: 0,
      })
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

    // IMPORTANT:
    // No pending bets = valid empty result.
    return res.json({
      success: true,

      data: bets,

      count: bets.length,
    });
  } catch (e) {
    console.error(
      "getPendingTrades error:",
      e
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};

// ============================================================
// DELETE OLD TRADES
// BACKGROUND
// ============================================================

const deleteOldTrades = async () => {
  try {
    const keep =
      await Trade.find({
        status: 1,
      })
        .sort({
          period: -1,
        })
        .limit(100)
        .select("_id")
        .lean();

    const ids = keep.map(
      (x) => x._id
    );

    if (ids.length) {
      await Trade.deleteMany({
        status: 1,
        _id: {
          $nin: ids,
        },
      });
    }
  } catch (e) {
    console.error(
      "deleteOldTrades error:",
      e.message
    );
  }
};

// ============================================================
// ADMIN DELETE OLD TRADES
// ============================================================

exports.adminDeleteOldTrades = async (
  req,
  res
) => {
  try {
    // ----------------------------------------------------------
    // Admin check
    // ----------------------------------------------------------

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required to delete trades",
      });
    }

    await deleteOldTrades();

    return res.json({
      success: true,
      message:
        "Old trades deleted successfully",
    });
  } catch (e) {
    console.error(
      "adminDeleteOldTrades error:",
      e
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
};

// ============================================================
// CLEANUP EVERY HOUR
// ============================================================

setInterval(
  deleteOldTrades,
  60 * 60 * 1000
);

// Initial cleanup
deleteOldTrades();