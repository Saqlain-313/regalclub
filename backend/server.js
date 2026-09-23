require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// =====================================================
// DNS
// =====================================================

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// =====================================================
// DATABASE - MongoDB
// =====================================================

const connectDB = require("./config/connectdb");

// =====================================================
// MODELS
// =====================================================

const User = require("./models/authmodel");
const Wingo = require("./models/Wingo");
const Bet = require("./models/Bet");
const Transaction = require("./models/Transaction");
const Commission = require("./models/Commission");
const Subordinate = require("./models/Subordinate");
const Admin = require("./models/Admin");
const Level = require("./models/Level");
const Recharge = require("./models/Recharge");
require("./cron");

// =====================================================
// BET CONTROLLER
// =====================================================

const betController = require("./controllers/betController");
const betRoutes = require("./routes/betRoutes");

// =====================================================
// USER ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const dailyClaimRoutes = require("./routes/dailyClaimRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const depositRoutes = require("./routes/depositRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const publicBidRoutes = require("./routes/publicBidRoutes");

const marketRoutes = require("./routes/marketRoutes");
const bidRoutes = require("./routes/bidRoutes");
const resultRoutes = require("./routes/resultRoutes");
const currencyRateRoutes = require("./routes/currencyRateRoutes");

const userTicketTypeRoutes = require("./routes/user/ticketTypeRoutes");

const bettingBonusRoutes = require("./routes/bettingBonusRoutes");

// =====================================================
// GENERIC COUNTRY USER GAME ROUTES
// =====================================================

const userGameEntryRoutes = require("./routes/user/gameEntryRoutes");
const userGameCountRoutes = require("./routes/user/gameCountRoutes");

// =====================================================
// MINES GAME
// =====================================================

const mineGameRoutes = require("./routes/minesRoutes");

// =====================================================
// ADMIN ROUTES
// =====================================================

const adminWithdrawalRoutes = require("./routes/admin/withdrawalRoutes");
const depositSettingsRoutes = require("./routes/depositSettingsRoutes");
const withdrawalSettingsRoutes = require("./routes/withdrawalSettingsRoutes");
const adminTicketTypeRoutes = require("./routes/admin/ticketTypeRoutes");
const winMultiplierRoutes = require("./routes/winMultiplierRoutes");

// =====================================================
// GENERIC COUNTRY ADMIN ROUTES
// =====================================================

const adminGameCountRoutes = require("./routes/admin/gameCountRoutes");
const adminGameEntryRoutes = require("./routes/admin/gameEntryRoutes");
const adminPowerballResultRoutes = require("./routes/admin/powerballResultRoutes");
const adminPowerballDivisionRoutes = require("./routes/admin/powerballDivisionRoutes");

// =====================================================
// TRADING SOCKET ENGINE
// =====================================================

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
  "http://127.0.0.1:5177",
  "https://regalclub.live",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
        origin,
      );

      if (allowedOrigins.includes(origin) || isLocalhost) {
        return callback(null, true);
      }

      return callback(new Error("Socket.IO CORS origin not allowed"));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

    credentials: true,
  },
});

// =====================================================
// MAKE SOCKET.IO AVAILABLE TO APP
// =====================================================

app.set("io", io);
global.io = io;

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
        origin,
      );

      if (allowedOrigins.includes(origin) || isLocalhost) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Expires",
    ],

    optionsSuccessStatus: 204,
  }),
);

// =====================================================
// PREFLIGHT
// =====================================================

app.options("*path", cors());

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

// =====================================================
// COOKIE
// =====================================================

app.use(cookieParser());

// =====================================================
// NO CACHE FOR API
// =====================================================

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// =====================================================
// BET ROUTES
// =====================================================
app.use("/api", betRoutes);

// =====================================================
// USER ROUTES
// =====================================================

app.use("/api/auth", authRoutes);
app.use("/api/daily-claim", dailyClaimRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/public-bids", publicBidRoutes);

// =====================================================
// MARKET / BID / RESULT
// =====================================================

app.use("/api/markets", marketRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/currency", currencyRateRoutes);

app.use("/api", require("./routes/allgameroute/allGameRoute"));

app.use("/api", require("./routes/gameRoutes"));

// =====================================================
// USER TICKET TYPES
// =====================================================

app.use("/api/user/ticket-types", userTicketTypeRoutes);

// =====================================================
// WIN MULTIPLIERS
// =====================================================

app.use("/api/win-multipliers", winMultiplierRoutes);

// =====================================================
// BETTING BONUS
// =====================================================

app.use("/api/betting-bonus", bettingBonusRoutes);

// =====================================================
// GENERIC COUNTRY USER GAME ROUTES
// =====================================================

app.use("/api/:country/game-entry", userGameEntryRoutes);
app.use("/api/:country/game-counts", userGameCountRoutes);

// =====================================================
// MINES GAME
// =====================================================

app.use("/api/mine-games", mineGameRoutes);

// =====================================================
// ADMIN ROUTES
// =====================================================

app.use("/api/admin/withdrawals", adminWithdrawalRoutes);
app.use("/api", depositSettingsRoutes);
app.use("/api/withdrawal-settings", withdrawalSettingsRoutes);
app.use("/api/admin/ticket-types", adminTicketTypeRoutes);

// =====================================================
// COUNTRY ADMIN GAME ROUTES
// =====================================================

app.use("/api/admin/:country/game-count", adminGameCountRoutes);
app.use("/api/admin/:country/game-entries", adminGameEntryRoutes);
app.use("/api/admin/:country/powerball-results", adminPowerballResultRoutes);
app.use(
  "/api/admin/:country/powerball/divisions",
  adminPowerballDivisionRoutes,
);

// =====================================================
// PUBLIC POWERBALL RESULTS
// =====================================================

app.use(
  "/api/public/:country/powerball-results",
  require("./routes/user/powerballpublicresult"),
);

// =====================================================
// REFERRAL LEVELS
// =====================================================

app.use("/api/admin/referral-levels", require("./routes/referralLevelRoutes"));

app.use("/api/admin/bet-admin/", require("./routes/TradeadminRoute"));

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running with MongoDB",
    port: PORT,
    timestamp: new Date(),
    games: {
      "30s": "wingo10",
      "1m": "wingo",
      trx: "trx",
    },
  });
});

// =====================================================
// USER FRONTEND
// =====================================================

// =====================================================
// FRONTEND STATIC FILES - PRODUCTION SAFE
// =====================================================
//
// Expected production structure:
//
// project/
//   server/
//     server.js
//   client/
//     dist/
//       index.html
//       assets/
//   ADMIN/
//     dist/
//       index.html
//       assets/
//
// IMPORTANT:
// Build files must physically exist at these paths on production.
// =====================================================

const userDistPath = path.resolve(__dirname, "../Client/dist");
const adminDistPath = path.resolve(__dirname, "../ADMIN/dist");

console.log("======================================");
console.log("[FRONTEND] Client dist:", userDistPath);
console.log("[FRONTEND] Admin dist :", adminDistPath);
console.log("======================================");

// -----------------------------------------------------
// USER / CLIENT STATIC FILES
// -----------------------------------------------------

app.use(
  express.static(userDistPath, {
    index: false,
    fallthrough: true,
    maxAge: "1d",
  }),
);

// -----------------------------------------------------
// ADMIN STATIC FILES
// -----------------------------------------------------

app.use(
  "/admin",
  express.static(adminDistPath, {
    index: false,
    fallthrough: true,
    maxAge: "1d",
  }),
);

// -----------------------------------------------------
// ADMIN ROOT
// -----------------------------------------------------

app.get("/admin", (req, res) => {
  const indexPath = path.join(adminDistPath, "index.html");

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("[ADMIN] index.html error:", err);
      if (!res.headersSent) {
        res.status(500).send("Admin frontend not found");
      }
    }
  });
});

// -----------------------------------------------------
// ADMIN SPA FALLBACK
// -----------------------------------------------------
// Do not return index.html for missing asset files.

app.get("/admin/{*path}", (req, res, next) => {
  if (
    req.path.startsWith("/admin/assets/") ||
    req.path.match(
      /^\/admin\/.*\.(js|css|map|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i,
    )
  ) {
    return next();
  }

  const indexPath = path.join(adminDistPath, "index.html");

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("[ADMIN] SPA fallback error:", err);
      if (!res.headersSent) {
        res.status(500).send("Admin frontend not found");
      }
    }
  });
});

// -----------------------------------------------------
// USER / CLIENT SPA FALLBACK
// -----------------------------------------------------
// Do not return index.html for missing static assets.

app.get("/{*path}", (req, res, next) => {
  // Never let frontend SPA fallback handle API routes.
  if (req.path.startsWith("/api/") || req.path === "/api") {
    return next();
  }

  // Never return index.html for a missing static asset.
  if (
    req.path.startsWith("/assets/") ||
    req.path.match(
      /\.(js|css|map|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i,
    )
  ) {
    return next();
  }

  const indexPath = path.join(userDistPath, "index.html");

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("[CLIENT] SPA fallback error:", err);
      if (!res.headersSent) {
        res.status(500).send("Client frontend not found");
      }
    }
  });
});

// =====================================================
// 404 API HANDLER
// =====================================================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =====================================================
// SOCKET TIMER FUNCTIONS - FIXED
// =====================================================

// Store current timer values to emit on new connections
let currentTimers = {
  timeUpdate_30: { minute: 0, secondtime1: 0, secondtime2: 0 },
  timeUpdate_11: { minute: 0, secondtime1: 0, secondtime2: 0 },
  timeUpdate_3: { minute: 0, secondtime1: 0, secondtime2: 0 },
  timeUpdate_5: { minute: 0, secondtime1: 0, secondtime2: 0 },
};

// Store last game results
let lastResults = {
  wingo10: null,
  wingo: null,
  wingo3: null,
  wingo5: null,
  trx: null,
};

// Track processed periods to prevent duplicate processing
const processedPeriods = {
  wingo10: null,
  wingo: null,
  wingo3: null,
  wingo5: null,
  trx: null,
};

// Track if result has been emitted for a period (to prevent duplicate emits)
const emittedPeriods = {
  wingo10: null,
  wingo: null,
  wingo3: null,
  wingo5: null,
  trx: null,
};

/*
 * Exact timer boundary guard.
 * A game is allowed to process only once for each completed interval.
 */
const lastTimerBoundary = {
  wingo10: null,
  wingo: null,
  wingo3: null,
  wingo5: null,
};

function calculateTimer(intervalSeconds) {
  const now = new Date();
  const totalSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  let remaining = intervalSeconds - (totalSeconds % intervalSeconds);
  if (remaining === 0) remaining = intervalSeconds;

  const minute = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const secondtime1 = Math.floor(seconds / 10);
  const secondtime2 = seconds % 10;

  return { minute, secondtime1, secondtime2 };
}

// ============================================
// PROCESS RESULT - ATOMIC / NO DUPLICATE
// ============================================
async function processResultImmediately(gameName, typeId) {
  try {
    // -------------------------------------------------
    // 1. Find latest pending period
    // -------------------------------------------------
    const winGoNow = await Wingo.findOne({
      status: 0,
      game: gameName,
    })
      .sort({ _id: -1 })
      .limit(1);

    if (!winGoNow) {
      console.log(`[${gameName}] No pending period found`);
      return;
    }

    const period = String(winGoNow.period);

    console.log(`[${gameName}] Attempting atomic processing: ${period}`);

    // -------------------------------------------------
    // 2. Generate result
    // -------------------------------------------------
    const resultAmount = Number(betController.generateRandomResult());

    const finalResult =
      Number.isInteger(resultAmount) && resultAmount >= 0 && resultAmount <= 9
        ? resultAmount
        : Math.floor(Math.random() * 10);

    console.log(`[${gameName}] Generated result: ${period} -> ${finalResult}`);

    // -------------------------------------------------
    // 3. ATOMIC CLAIM
    //
    // Only ONE caller can change this exact document
    // from status 0 -> status 1.
    // -------------------------------------------------
    const updateResult = await Wingo.updateOne(
      {
        _id: winGoNow._id,
        status: 0,
        game: gameName,
      },
      {
        $set: {
          amount: finalResult,
          status: 1,
        },
      },
    );

    // -------------------------------------------------
    // 4. Another timer/backup already processed it
    // -------------------------------------------------
    if (updateResult.modifiedCount !== 1) {
      console.log(
        `[${gameName}] Period ${period} already processed by another caller. SKIP.`,
      );
      return;
    }

    console.log(`[${gameName}] LOCKED/PROCESSED: ${period} -> ${finalResult}`);

    // -------------------------------------------------
    // 5. Create next period
    // -------------------------------------------------
    const newPeriod = String(BigInt(period) + BigInt(1));

    const existingNext = await Wingo.findOne({
      game: gameName,
      period: newPeriod,
    });

    if (!existingNext) {
      await Wingo.create({
        period: newPeriod,
        amount: 0,
        game: gameName,
        status: 0,
        hashvalue: require("crypto").randomBytes(5).toString("hex"),
        blocs: 50,
        time: new Date().toISOString(),
      });

      // console.log(`[${gameName}] New period created: ${newPeriod}`);
    } else {
      // console.log(`[${gameName}] Next period ${newPeriod} already exists`);
    }

    // -------------------------------------------------
    // 6. Clear admin forced result
    // -------------------------------------------------
    await Admin.updateOne(
      {},
      {
        $set: {
          [gameName]: "-1",
        },
      },
    );

    // -------------------------------------------------
    // 7. Process winning bets ONLY HERE
    // -------------------------------------------------
    await betController.handlingWinGo1P(typeId);

    // -------------------------------------------------
    // 8. Emit result EXACTLY ONCE
    // -------------------------------------------------
    if (emittedPeriods[gameName] === period) {
      console.log(`[${gameName}] Period ${period} already emitted. SKIP emit.`);
      return;
    }

    emittedPeriods[gameName] = period;

    const resultData = {
      game: gameName,
      period: period,
      amount: finalResult,
    };

    lastResults[gameName] = resultData;

    io.emit("data-server", {
      data: [resultData],
    });

    // console.log(
    //   `[${gameName}] RESULT EMITTED ONCE: ${period} -> ${finalResult}`,
    // );
  } catch (error) {
    // console.error(`[${gameName}] processResultImmediately ERROR:`, error);
  }
}

function broadcastTimers() {
  const timers = {
    timeUpdate_30: calculateTimer(30),
    timeUpdate_11: calculateTimer(60),
    timeUpdate_3: calculateTimer(180),
    timeUpdate_5: calculateTimer(300),
  };

  currentTimers = timers;

  io.emit("timeUpdate_30", timers.timeUpdate_30);
  io.emit("timeUpdate_11", timers.timeUpdate_11);
  io.emit("timeUpdate_3", timers.timeUpdate_3);
  io.emit("timeUpdate_5", timers.timeUpdate_5);

  // =====================================================
  // RESULT PROCESSING - ONLY AT EXACT TIMER COMPLETION
  // =====================================================
  const now = new Date();
  const totalSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const gameConfigs = [
    { name: "wingo10", interval: 30, type: 10 },
    { name: "wingo", interval: 60, type: 1 },
    { name: "wingo3", interval: 180, type: 3 },
    { name: "wingo5", interval: 300, type: 5 },
  ];

  for (const config of gameConfigs) {
    /*
     * Timer is complete ONLY on an exact interval boundary:
     * 30s  -> :00, :30
     * 1m   -> every :00
     * 3m   -> every 3 minutes
     * 5m   -> every 5 minutes
     *
     * No processing happens at any other second.
     */
    if (totalSeconds % config.interval !== 0) {
      continue;
    }

    const boundary = Math.floor(totalSeconds / config.interval);

    // Same boundary can be observed more than once by a 1-second interval.
    if (lastTimerBoundary[config.name] === boundary) {
      continue;
    }

    lastTimerBoundary[config.name] = boundary;

    console.log(
      `[TIMER] ${config.name} completed exactly. Processing result now.`,
    );

    processResultImmediately(config.name, config.type).catch((error) => {
      console.error(`[TIMER] ${config.name} result processing error:`, error);
    });
  }
}

// Send timer and result on new connection
io.on("connection", (socket) => {
  // Send current timers
  socket.emit("timeUpdate_30", currentTimers.timeUpdate_30);
  socket.emit("timeUpdate_11", currentTimers.timeUpdate_11);
  socket.emit("timeUpdate_3", currentTimers.timeUpdate_3);
  socket.emit("timeUpdate_5", currentTimers.timeUpdate_5);

  // Send last results for all games
  Object.keys(lastResults).forEach((game) => {
    if (lastResults[game]) {
      socket.emit("data-server", {
        data: [lastResults[game]],
      });
    }
  });

  // User rooms
  socket.on("join-user", (userId) => {
    if (!userId) return;
    const room = `user-${userId}`;
    socket.join(room);
    console.log(`[SOCKET] ${socket.id} joined ${room}`);
  });

  socket.on("join-admin", (adminId) => {
    socket.join("admin");
    console.log(`[SOCKET] ${socket.id} joined admin`);
  });

  socket.on("join-mines-game", (gameId) => {
    if (!gameId) return;
    const room = `mines-${gameId}`;
    socket.join(room);
    console.log(`[SOCKET] ${socket.id} joined ${room}`);
  });

  socket.on("leave-mines-game", (gameId) => {
    if (!gameId) return;
    const room = `mines-${gameId}`;
    socket.leave(room);
    console.log(`[SOCKET] ${socket.id} left ${room}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[SOCKET] Disconnected: ${socket.id}`, reason);
  });
});

// =====================================================
// DATABASE + SERVER
// =====================================================

const PORT = Number(process.env.PORT) || 8097;

const startServer = async () => {
  try {
    await connectDB();
    console.log("[DATABASE] MongoDB connected");

    const adminExists = await Admin.findOne();
    if (!adminExists) {
      await Admin.create({
        wingo: "-1",
        wingo10: "-1",
        trx: "-1",
        wingo1_mode: 0,
        wingo30_mode: 0,
        trx_mode: 0,
        commition_Bet_Amount: 0,
        user_bet_commition: 0,
      });
      console.log("Admin settings initialized");
    }

    const levelCount = await Level.countDocuments();
    if (levelCount === 0) {
      const levels = [];
      for (let i = 1; i <= 6; i++) {
        levels.push({
          level: i,
          f1: i * 2,
        });
      }
      await Level.insertMany(levels);
      console.log("Levels initialized");
    }

    // Initialize game periods
    const games = ["wingo", "wingo10", "trx", "wingo3", "wingo5"];
    for (const game of games) {
      const existing = await Wingo.findOne({ game, status: 0 });
      if (!existing) {
        const initialPeriod = Date.now().toString().slice(-8);
        await Wingo.create({
          period: initialPeriod,
          amount: 0,
          game,
          status: 0,
          hashvalue: require("crypto").randomBytes(5).toString("hex"),
          blocs: 50,
          time: new Date().toISOString(),
        });
        console.log(`Initial period created for ${game}`);
      }
    }

    // =================================================
    // START TRADING SOCKET ENGINE
    // =================================================

    // initTradingSocket(io);

    // =================================================
    // START TIMER BROADCAST - EVERY SECOND
    // =================================================

    // Set the IO instance in betController
    betController.setIo(io);

    setTimeout(() => {
      broadcastTimers();
      console.log("[SOCKET] Initial timers broadcasted");
    }, 1000);

    setInterval(() => {
      broadcastTimers();
    }, 1000);

    console.log("[SOCKET] Timer broadcast started (every 1s)");

    // =================================================
    // START SERVER
    // =================================================

    server.listen(PORT, "0.0.0.0", () => {
      console.log("======================================");
      console.log(`Server running on port ${PORT}`);
      console.log(`User:  http://localhost:${PORT}`);
      console.log(`Admin: http://localhost:${PORT}/admin`);
      console.log(`API:   http://localhost:${PORT}/api`);
      console.log(`Mines: http://localhost:${PORT}/api/mine-games`);
      console.log(`Bet:   http://localhost:${PORT}/bet`);
      console.log("Socket.IO: enabled");
      console.log(
        "Timer Events: timeUpdate_30, timeUpdate_11, timeUpdate_3, timeUpdate_5",
      );
      console.log("Trading Engine: enabled");
      console.log(
        "Games: 30s (wingo10), 1m (wingo), 3m (wingo3), 5m (wingo5), TRX (trx)",
      );
      console.log("Database: MongoDB");
      console.log("======================================");
    });

    // =================================================
    // RESULT PROCESSING
    // =================================================
    // Results are processed ONLY by the exact timer boundary
    // inside broadcastTimers(). No independent backup runner.
    // =================================================

    // =================================================
    // COMMISSION PROCESSING
    // =================================================

    let lastCommission = 0;
    setInterval(async () => {
      const now = Date.now();
      if (now - lastCommission >= 300000) {
        lastCommission = now;
        try {
          await betController.tradeCommission();
        } catch (error) {
          console.error("Commission cron error:", error);
        }
      }
    }, 1000);

    setTimeout(async () => {
      try {
        await betController.tradeCommission();
        console.log("Initial commission processed");
      } catch (error) {
        console.error("Initial commission error:", error);
      }
    }, 10000);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// =====================================================
// FRONTEND FILESYSTEM CHECK
// =====================================================

const fs = require("fs");

console.log("[FRONTEND] Client dist exists:", fs.existsSync(userDistPath));
console.log(
  "[FRONTEND] Client index exists:",
  fs.existsSync(path.join(userDistPath, "index.html")),
);
console.log(
  "[FRONTEND] Client assets exists:",
  fs.existsSync(path.join(userDistPath, "assets")),
);

console.log("[FRONTEND] Admin dist exists:", fs.existsSync(adminDistPath));
console.log(
  "[FRONTEND] Admin index exists:",
  fs.existsSync(path.join(adminDistPath, "index.html")),
);
console.log(
  "[FRONTEND] Admin assets exists:",
  fs.existsSync(path.join(adminDistPath, "assets")),
);

startServer();

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

process.on("SIGINT", () => {
  console.log("\n[SERVER] Shutting down...");
  // stopTradingSocket();
  server.close(() => {
    console.log("[SERVER] Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n[SERVER] SIGTERM received...");
  stopTradingSocket();
  server.close(() => {
    console.log("[SERVER] Server closed");
    process.exit(0);
  });
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
