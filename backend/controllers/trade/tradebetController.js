const Bet = require("../../models/TradeBet");
const Trade = require("../../models/Trade");
const User = require("../../models/authmodel");
const Admin = require("../../models/TradeAdmin");
const websocket = require("../../config/tradeWebsocket");

// ============================================================
// LIVE WALLET PUSH — same pattern as the main games: emit the
// fresh credit to the user's socket.io room so the main-site
// navbar updates instantly after a trade bet / win.
// ============================================================
const emitWalletUpdateByUserId = async (numericUserId) => {
  try {
    if (!global.io || !numericUserId) return;
    const fresh = await User.findOne({ userId: Number(numericUserId) }).select("credit");
    if (!fresh) return;
    const room = `user-${fresh._id}`;
global.io.in(room).fetchSockets().then((socks) => {
}).catch(() => {});
global.io.to(room).emit("wallet-update", {
      credit: Number(fresh.credit) || 0,
    });
  } catch (e) {
    // best-effort only
  }
};
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const uid = (req) => Number(req.user?.userId ?? req.id);
const broadcast = () => {
  try {
    const wss = websocket.getWSS();
    wss.clients.forEach((c) => {
      if (c.readyState === 1)
        c.send(JSON.stringify({ event: "betDataUpdated", data: "betRows" }));
    });
  } catch (e) {}
};
const candle = (open, result) => {
  const delta = 0.00001 * (Math.floor(Math.random() * 13) + 1);
  const close = Number((open + (result > 4 ? delta : -delta)).toFixed(5));
  const high = Number(
    (close + 0.00001 * (Math.floor(Math.random() * 8) + 1)).toFixed(5),
  );
  const low = Number(
    (open - 0.00001 * (Math.floor(Math.random() * 10) + 1)).toFixed(5),
  );
  return { open, high, low, close };
};

exports.createTrade = async (req, res = null) => {
  try {
    const last = await Trade.findOne().sort({ period: -1 }).lean();
    const lastPeriod = last?.period ?? null;
    const [up, down, admin] = await Promise.all([
      Bet.aggregate([
        { $match: { period: lastPeriod, bet: "up", status: 0 } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Bet.aggregate([
        { $match: { period: lastPeriod, bet: "down", status: 0 } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Admin.findOne().lean(),
    ]);
    const upAmt = up[0]?.total || 0,
      downAmt = down[0]?.total || 0;
    let result;
    const trade = admin?.trade ?? "-1";
    if (trade === "-1")
      result =
        upAmt + downAmt > 10
          ? upAmt > downAmt
            ? Math.floor(Math.random() * 5)
            : Math.floor(Math.random() * 5) + 5
          : Math.floor(Math.random() * 9) + 1;
    else if (trade === "-2") result = Math.floor(Math.random() * 9) + 1;
    else result = parseInt(trade, 10);
    if (!Number.isFinite(result)) result = Math.floor(Math.random() * 9) + 1;
    const lastComplete = await Trade.findOne({ status: 1 })
      .sort({ period: -1 })
      .lean();
    const open = Number(lastComplete?.close || 1.4463);
    const c = candle(open, result);
    const x = lastComplete?.x
      ? new Date(lastComplete.x.getTime() + 10000)
      : new Date(Date.now() - 300000);
    if (lastPeriod !== null)
      await Trade.updateOne(
        { period: lastPeriod },
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
        },
      );
    const newPeriod =
      lastPeriod !== null
        ? lastPeriod + 1
        : Number(
            `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}0001`,
          );
    await Trade.updateOne(
      { period: newPeriod },
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
      { upsert: true },
    );
    await Admin.findOneAndUpdate(
      {},
      { $set: { trade: trade === "-1" ? "-1" : "-2" } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    if (res)
      return res
        .status(201)
        .json({
          success: true,
          message: "New trade created successfully",
          data: { period: newPeriod },
        });
    return newPeriod;
  } catch (e) {
    console.error("createTrade", e);
    if (res)
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: e.message });
    return null;
  }
};
exports.getTrade = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1),
      limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const [last, all, latest, total] = await Promise.all([
      Trade.findOne({ status: 0 }).sort({ period: -1 }).lean(),
      Trade.find({ status: 1 }).sort({ period: -1 }).limit(99).lean(),
      Trade.findOne({ status: 1 })
        .sort({ period: -1 })
        .select("trade_no")
        .lean(),
      Trade.countDocuments({ status: 1 }),
    ]);
    // ============================================================
    // LIVE CURRENT CANDLE — the current round (status 0) has zero
    // OHLC until settlement. Build it from the last settled close so
    // the chart always shows the running candle; the frontend animates
    // it tick-by-tick.
    let candles = all;
    if (last) {
      const base = all.length ? Number(all[0].close) || 1.4463 : 1.4463;
      // Keep the timeline contiguous: the settled candles' x advances
      // 10s per round, so the live candle must sit at lastX + 10s.
      // Using createdAt would jump far ahead and push every other
      // candle out of the visible chart window.
      const liveX = all.length
        ? new Date(new Date(all[0].x).getTime() + 10000)
        : new Date();
      candles = [
        {
          ...last,
          open: base,
          high: base,
          low: base,
          close: base,
          x: liveX,
        },
        ...all,
      ];
    }

    return res.json({
      lastTrade: last?.period,
      allTrade: candles,
      betResult: latest?.trade_no,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTrades: total,
        limit,
      },
      message: "Trades fetched successfully",
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
exports.placeBet = async (req, res) => {
  try {
    const { period, amount, bet, tradeType } = req.body;
    const a = num(amount),
      id = uid(req);
    if (!period || a <= 0 || !bet || !tradeType)
      return res
        .status(400)
        .json({
          success: false,
          message: "All fields (period, amount, bet, tradeType) are required",
        });
    const user = await User.findOneAndUpdate(
      { userId: id, credit: { $gte: a } },
      { $inc: { credit: -a } },
      { new: true },
    );
    console.log(user)
    if (!user) {
      if (!(await User.exists({ userId: id })))
        return res.status(400).json({ message: "User Not Found" });
      return res
        .status(400)
        .json({ success: false, message: "Insufficient credit" });
    }
    const orderId =
      String(Date.now()) + String(Math.floor(Math.random() * 1000));
    try {
      const b = await Bet.create({
        orderId,
        userId: id,
        period: Number(period),
        amount: a,
        bet,
        tradeType,
      });
      broadcast();
      await emitWalletUpdateByUserId(id);
      return res
        .status(201)
        .json({
          success: true,
          message: "Trade created successfully",
          trade: b,
        });
    } catch (e) {
      await User.updateOne({ userId: id }, { $inc: { credit: a } });
      throw e;
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
exports.checkwhichUserIsWinner = async (req = null, res = null) => {
  try {
    const t = await Trade.findOne({ status: 1 }).sort({ period: -1 }).lean();
    if (!t) {
      if (res)
        return res
          .status(404)
          .json({ success: false, message: "No completed trades found" });
      return;
    }
    const bets = await Bet.find({ period: t.period, status: 0 }).lean();
    for (const b of bets) {
      if (b.bet === t.result) {
        const getAmount = Number((b.amount + b.amount * 0.93).toFixed(2));
        await Bet.updateOne(
          { _id: b._id, status: 0 },
          { $set: { getAmount, result: t.result, status: 1 } },
        );
        await User.updateOne(
          { userId: b.userId },
          { $inc: { credit: getAmount } },
        );
        await emitWalletUpdateByUserId(b.userId);
      } else {
        await Bet.updateOne(
          { _id: b._id, status: 0 },
          { $set: { result: t.result, status: 2 } },
        );
      }
    }
    broadcast();
    if (res)
      return res.json({
        success: true,
        message: "Bets updated successfully",
        period: t.period,
        result: t.result,
      });
  } catch (e) {
    if (res)
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: e.message });
    console.error("winner", e);
  }
};
exports.getBetsByUserId = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: uid(req) })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    if (!bets.length)
      return res
        .status(404)
        .json({ success: false, message: "No bets found for this user" });
    return res.json({ success: true, data: bets });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
exports.getPendingTrades = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: uid(req), status: 0 })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    if (!bets.length)
      return res
        .status(404)
        .json({
          success: false,
          message: "No completed bets found for this user",
        });
    return res.json({ success: true, data: bets });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
async function deleteOldTrades() {
  try {
    const keep = await Trade.find({ status: 1 })
      .sort({ period: -1 })
      .limit(100)
      .select("_id")
      .lean();
    const ids = keep.map((x) => x._id);
    if (ids.length) await Trade.deleteMany({ status: 1, _id: { $nin: ids } });
  } catch (e) {
    console.error("deleteOldTrades", e.message);
  }
}
setInterval(deleteOldTrades, 3600000);
deleteOldTrades();