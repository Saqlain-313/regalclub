// controllers/trade/tradeTimer.js
//
// ============================================================
// TRADING HEARTBEAT — ported from the trading subdomain's
// index.js (1-second timer).
//
// Every second it broadcasts a "timeUpdate_30" clock derived
// from Unix time (so all browsers see the same trading clock).
// The /trading chart is DRIVEN by these events:
//   - countdown timer UI
//   - live candle animation (isCandleMoving)
//   - refetch on each new round
// At 5s remaining it opens the next trade round; at 4s it
// settles winners — both guarded per 30s cycle.
// ============================================================

const websocket = require("../../config/tradeWebsocket");
const { createTrade, checkwhichUserIsWinner } = require("./tradebetController");

const ROUND_SECONDS = 30;

let lastCreateCycle = null;
let lastWinnerCycle = null;
let lastRecoveryRun = 0;
let timer = null;

const getTradingClock = () => {
  const nowMs = Date.now();
  const unixSeconds = Math.floor(nowMs / 1000);
  const cycleSecond = unixSeconds % ROUND_SECONDS;
  const countdown = ROUND_SECONDS - cycleSecond;

  return {
    minute: Math.floor(countdown / 60),
    secondtime1: Math.floor((countdown % 60) / 10),
    secondtime2: countdown % 10,
    countdown,
    cycleSecond,
    timestamp: nowMs,
    nextRoundAt: nowMs + countdown * 1000,
  };
};

const broadcastTradingClock = () => {
  const clock = getTradingClock();

  const payload = {
    event: "timeUpdate_30",
    ...clock,
  };

  websocket.broadcast(payload);

  // Socket.IO fallback — the raw /ws channel can be blocked by a hosting
  // reverse proxy that does not forward WebSocket upgrades. Socket.IO
  // (polling + websocket) reaches clients even then, so the /trading
  // timer and live candle keep working.
  if (global.io) {
    global.io.emit("timeUpdate_30", payload);
  }

  return clock;
};


// ============================================================
// STALE ROUND RECOVERY — agar backend round ke beech crash/restart
// ho jaye to status-0 rounds orphan ban jate hain (bets kabhi settle
// nahi hoti). Startup par 2 minute se purane status-0 rounds ko
// complete karke unki bets settle kar dete hain.
// ============================================================
const recoverStaleRounds = async () => {
  const Trade = require("../../models/Trade");
  const Bet = require("../../models/TradeBet");
  const User = require("../../models/authmodel");

  const cutoff = new Date(Date.now() - 2 * 60 * 1000);

  // Bets placed on periods that have NO trade record at all (backend
  // died between the bet and round creation) — create the round now,
  // BEFORE fetching stale rounds so they are completed in this pass.
  const pendingBets = await Bet.find({ status: 0 });
  for (const b of pendingBets) {
    const exists = await Trade.findOne({ period: b.period }).lean();

    // Bet placed on a round that is ALREADY settled — the settle
    // snapshot ran before this bet was committed. Settle it now
    // using that round's result, otherwise it stays orphaned forever.
    if (exists && exists.status === 1) {
      try {
        const won = b.bet === exists.result;
        if (won) {
          const getAmount = Number((b.amount + b.amount * 0.93).toFixed(2));
          await Bet.updateOne(
            { _id: b._id, status: 0 },
            { $set: { getAmount, result: b.bet, status: 1 } },
          );
          await User.updateOne(
            { userId: b.userId },
            { $inc: { credit: getAmount } },
          );
        } else {
          await Bet.updateOne(
            { _id: b._id, status: 0 },
            { $set: { result: b.bet, status: 2 } },
          );
        }
        console.log(
          `♻️ Settled late bet ${b._id} on already-closed round ${b.period}`,
        );
      } catch (e) {
        console.error("♻️ Late-bet settle error:", e.message);
      }
      continue;
    }

    if (!exists) {
      try {
        await Trade.create({
          period: b.period,
          tradeType: "BUY",
          open: 0, high: 0, low: 0, close: 0,
          x: new Date(b.createdAt || Date.now()),
          status: 0,
        });
        console.log(`♻️ Created missing round ${b.period} for a pending bet`);
      } catch (e) {
        console.error("♻️ Round create error:", e.message);
      }
    }
  }

  const stale = await Trade.find({ status: 0, createdAt: { $lt: cutoff } }).lean();

  let recovered = 0;
  for (const t of stale) {
    try {
      const lastComplete = await Trade.findOne({ status: 1 }).sort({ period: -1 }).lean();
      const open = Number(lastComplete?.close || 1.4463);
      const result = Math.floor(Math.random() * 9) + 1;
      const delta = 0.00001 * (Math.floor(Math.random() * 13) + 1);
      const close = Number((open + (result > 4 ? delta : -delta)).toFixed(5));
      const high = Number((close + 0.00001 * (Math.floor(Math.random() * 8) + 1)).toFixed(5));
      const low = Number((open - 0.00001 * (Math.floor(Math.random() * 10) + 1)).toFixed(5));

      await Trade.updateOne(
        { _id: t._id, status: 0 },
        { $set: { status: 1, result: result < 5 ? "down" : "up", trade_no: result, open, high, low, close } },
      );

      // settle the bets on this period
      const bets = await Bet.find({ period: t.period, status: 0 });
      for (const b of bets) {
        if (b.bet === (result < 5 ? "down" : "up")) {
          const getAmount = Number((b.amount + b.amount * 0.93).toFixed(2));
          await Bet.updateOne({ _id: b._id }, { $set: { getAmount, result: b.bet, status: 1 } });
          await User.updateOne({ userId: b.userId }, { $inc: { credit: getAmount } });
        } else {
          await Bet.updateOne({ _id: b._id }, { $set: { result: b.bet, status: 2 } });
        }
      }
      recovered += 1;
      console.log(`♻️ Recovered stale trade round ${t.period} (${bets.length} bets settled)`);
    } catch (e) {
      console.error("♻️ Stale round recovery error:", e.message);
    }
  }
  return recovered;
};

const start = () => {
  if (timer) return timer;

  // startup recovery (non-blocking)
  recoverStaleRounds().catch((e) => console.error("recovery error:", e.message));

  timer = setInterval(async () => {
    try {
      const clock = broadcastTradingClock();

      // Safety net every 60s — settle bets orphaned mid-run
      // (backend restart races, late commits) without waiting for
      // the next restart
      if (Date.now() - lastRecoveryRun > 60 * 1000) {
        lastRecoveryRun = Date.now();
        await recoverStaleRounds().catch((e) =>
          console.error("recovery error:", e.message),
        );
      }

      // At 5 seconds remaining, open/create the next trade round.
      if (clock.countdown === 5) {
        const cycleId = Math.floor(clock.timestamp / 1000 / ROUND_SECONDS);

        if (lastCreateCycle !== cycleId) {
          lastCreateCycle = cycleId;

          try {
            await createTrade();
            console.log("✅ Trade created");
            websocket.broadcast({
              event: "tradeCreated",
              countdown: 5,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.error("❌ createTrade error:", error);
          }
        }
      }

      // At 4 seconds remaining, settle/check the current round.
      if (clock.countdown === 4) {
        const cycleId = Math.floor(clock.timestamp / 1000 / ROUND_SECONDS);

        if (lastWinnerCycle !== cycleId) {
          lastWinnerCycle = cycleId;

          try {
            await checkwhichUserIsWinner();
            console.log("✅ Winner checking completed");
            websocket.broadcast({
              event: "winnerChecked",
              countdown: 4,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.error("❌ checkwhichUserIsWinner error:", error);
          }
        }
      }
    } catch (error) {
      console.error("❌ Trading timer error:", error);
    }
  }, 1000);

  // Immediately publish a synchronized clock after start.
  setTimeout(() => {
    broadcastTradingClock();
  }, 100);

  console.log("✅ Trading heartbeat timer started (30s rounds)");
  return timer;
};

const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

module.exports = { start, stop, broadcastTradingClock, getTradingClock };
