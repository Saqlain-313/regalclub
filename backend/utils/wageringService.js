// utils/wageringService.js
//
// =====================================================
// WAGERING-BASED WITHDRAWAL ELIGIBILITY (v2)
//
// Rules:
// - Required wagering target = max(total COMPLETED recharge
//   amount, admin-set requirement). Admin can force a target
//   per user via `adminWageringRequired` (0 = off).
// - Wagered = user's total game-play stakes across all games:
//   wingo/TRX bets + matka bids + trade bets + API provider
//   games. New games can be plugged in below.
// - Winnings also complete wagering (a big win clears the
//   requirement — e.g. 500 recharge + 100 bet + 9000 win =>
//   wagering 0, full withdrawal allowed).
// - Wagering pending -> user can withdraw only up to the
//   completed (stake + win) amount, capped by wallet credit.
// - Wagering complete -> full wallet balance withdrawable.
// =====================================================

const Deposit = require("../models/Deposit");
const Bet = require("../models/Bet");
const Bid = require("../models/Bid");
const TradeBet = require("../models/TradeBet");
const Withdrawal = require("../models/Withdrawal");
const { getApiGameWagered } = require("../controllers/allgamecontroller/allGameController");

// Round to 2 decimals so floats like 999.999999 never reach the UI
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/*
 * Provider history is expensive (up to 10 paginated HTTP calls).
 * Every /withdrawals page load triggers an eligibility fetch, so
 * cache the per-user API wagered total briefly. 60s keeps the
 * numbers fresh enough for display while protecting the provider
 * from request storms.
 */
const API_WAGERED_CACHE_TTL_MS = 60 * 1000;
const apiWageredCache = new Map(); // mobile -> { value, expiresAt }

const getCachedApiWagered = async (mobile) => {
  const now = Date.now();
  const cached = apiWageredCache.get(mobile);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  try {
    const value = Number(await getApiGameWagered(mobile)) || 0;
    apiWageredCache.set(mobile, {
      value,
      expiresAt: now + API_WAGERED_CACHE_TTL_MS,
    });
    return value;
  } catch (error) {
    console.error(
      "WAGERING: API game history fetch failed, falling back to cached/local value:",
      error.message,
    );
    // Stale cache is still better than 0 — serve it if we have one
    if (cached) return cached.value;
    return 0;
  }
};

/**
 * Compute the wagering summary for a user.
 * @param {Object} user - auth user doc (needs _id, mobile, credit)
 * @returns {Object} summary with totals, breakdown and withdrawal cap
 */
const getWageringSummary = async (user) => {
  const userId = user._id;
  const mobile = String(user.mobile || "").trim();

  // 1) Total completed recharge (wagering target)
  const [rechargeAgg] = await Deposit.aggregate([
    { $match: { user: userId, status: "approved" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const rechargeWagering = round2(rechargeAgg?.total || 0);

  // 1b) Admin-set wagering requirement — admin can manually block
  //     withdrawal by setting a fixed target per user.
  //     Effective target = max(recharge-based, admin-set). 0 = off.
  const adminWageringRequired = Math.max(
    0,
    Number(user.adminWageringRequired) || 0,
  );
  const requiredWagering = Math.max(rechargeWagering, adminWageringRequired);

  // 2) Total wagered — all game stakes (parallel), plus total
  //    winnings. Bet.money is the stake net of the 2% fee, so the
  //    gross stake = money + fee (otherwise a 500 stake only
  //    counted 490 towards wagering).
  const [betAgg, betWinAgg, bidAgg, bidWinAgg, tradeBetAgg, tradeWinAgg] =
    await Promise.all([
      // Wingo / TRX bets — linked via mobile (stake)
      mobile
        ? Bet.aggregate([
            { $match: { mobile } },
            {
              $group: {
                _id: null,
                total: {
                  $sum: { $add: ["$money", { $ifNull: ["$fee", 0] }] },
                },
              },
            },
          ])
        : Promise.resolve([]),
      // Wingo / TRX winnings (payout stored in "get")
      mobile
        ? Bet.aggregate([
            { $match: { mobile } },
            {
              $group: {
                _id: null,
                total: { $sum: { $ifNull: ["$get", 0] } },
              },
            },
          ])
        : Promise.resolve([]),
      // Matka bids (stake)
      Bid.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$bidAmount" } } },
      ]),
      // Matka winnings
      Bid.aggregate([
        { $match: { userId, status: "won" } },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$winAmount", 0] } },
          },
        },
      ]),
      // Trade bets (stake)
      TradeBet.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      // Trade winnings
      TradeBet.aggregate([
        { $match: { userId, status: 1 } },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$getAmount", 0] } },
          },
        },
      ]),
    ]);

  const wingoWagered = round2(betAgg[0]?.total || 0);
  const matkaWagered = round2(bidAgg[0]?.total || 0);
  const tradeWagered = round2(tradeBetAgg[0]?.total || 0);

  // 3) API provider games (zapcore games on the home page)
  //    Wagered comes from the provider's history. If the API
  //    fails or is slow, wagering still completes using the
  //    local games — withdrawal must never be blocked by that.
  const apiGameWagered = mobile
    ? round2(await getCachedApiWagered(mobile))
    : 0;

  const totalWagered = round2(
    wingoWagered + matkaWagered + tradeWagered + apiGameWagered,
  );

  // Winnings (matka + wingo + trade) also complete wagering
  const wingoWinnings = round2(betWinAgg[0]?.total || 0);
  const matkaWinnings = round2(bidWinAgg[0]?.total || 0);
  const tradeWinnings = round2(tradeWinAgg[0]?.total || 0);
  const totalWinnings = round2(
    wingoWinnings + matkaWinnings + tradeWinnings,
  );

  // Wagering completion = stakes + winnings. A big win clears
  // the requirement instantly.
  const wageringCompleted = round2(totalWagered + totalWinnings);

  const remainingWagering = round2(
    Math.max(0, requiredWagering - wageringCompleted),
  );

  // 4) Amount already withdrawn (not rejected/cancelled) — while
  //    wagering is pending this counts against the wagered cap,
  //    otherwise the user could drain the whole wallet in multiple
  //    small withdrawals of <= completed amount each time.
  const [withdrawnAgg] = await Withdrawal.aggregate([
    {
      $match: {
        user: userId,
        status: { $nin: ["rejected", "cancelled"] },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalWithdrawn = round2(withdrawnAgg?.total || 0);

  // 5) Withdrawal cap:
  //    - Wagering pending -> (completed stake+win) minus what has
  //      already been withdrawn, capped by wallet credit
  //    - Wagering complete -> full wallet balance
  const credit = round2(user.credit || 0);
  const maxAllowedWithdrawal = round2(
    remainingWagering > 0
      ? Math.max(0, Math.min(wageringCompleted, credit) - totalWithdrawn)
      : credit,
  );

  // 5) Progress + status helpers for the UI
  const progressPercent =
    requiredWagering > 0
      ? Math.min(100, round2((wageringCompleted / requiredWagering) * 100))
      : 100;

  return {
    // Totals
    requiredWagering,
    rechargeWagering,
    adminWageringRequired,
    totalWagered,
    totalWinnings,
    wageringCompleted,
    remainingWagering,
    totalWithdrawn,
    maxAllowedWithdrawal,
    // Per-source breakdown (advanced view / future UI)
    breakdown: {
      wingo: { wagered: wingoWagered, won: wingoWinnings },
      matka: { wagered: matkaWagered, won: matkaWinnings },
      trade: { wagered: tradeWagered, won: tradeWinnings },
      apiGames: { wagered: apiGameWagered, won: 0 },
    },
    progressPercent,
    // Status flags
    isEligibleForFullWithdrawal: remainingWagering <= 0,
    canWithdraw: maxAllowedWithdrawal > 0,
    credit,
  };
};

module.exports = { getWageringSummary };
