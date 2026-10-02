// utils/wageringService.js
//
// =====================================================
// WAGERING-BASED WITHDRAWAL ELIGIBILITY
//
// Rules:
// - Required wagering target = total COMPLETED recharge amount
//   (Deposit model, status "approved") — dynamic, koi fixed
//   amount nahi.
// - Wagered = user ke total game-play amounts (wingo/trx Bet +
//   matka Bid + trade Bet). Naye games yahan add kiye ja sakte
//   hain.
// - Wagering remaining > 0 -> user sirf utne amount tak
//   withdraw kar sakta hai jitna wager complete kiya hai
//   (cap: wagered).
// - Wagering remaining = 0 -> wallet balance ke according
//   withdrawal allowed.
// =====================================================

const Deposit = require("../models/Deposit");
const Bet = require("../models/Bet");
const Bid = require("../models/Bid");
const TradeBet = require("../models/TradeBet");
const { getApiGameWagered } = require("../controllers/allgamecontroller/allGameController");

/**
 * Wagering summary compute karo for a user.
 * @param {Object} user - auth user doc (needs _id, mobile)
 * @returns {Object} summary
 */
const getWageringSummary = async (user) => {
  const userId = user._id;
  const mobile = String(user.mobile || "").trim();

  // 1) Total completed recharge (wagering target)
  const [rechargeAgg] = await Deposit.aggregate([
    { $match: { user: userId, status: "approved" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const rechargeWagering = rechargeAgg?.total || 0;

  // 1b) Admin-set wagering requirement — withdrawal block karne ke liye
  //     admin manually ek target set kar sakta hai.
  //     Effective target = max(recharge-based, admin-set). 0 = off.
  const adminWageringRequired = Math.max(
    0,
    Number(user.adminWageringRequired) || 0,
  );
  const requiredWagering = Math.max(rechargeWagering, adminWageringRequired);

  // 2) Total wagered — saare game bets (parallel)
  //    Bet.money stake net of 2% fee hota hai, isliye gross stake =
  //    money + fee (warna 500 stake par sirf 490 wagering hoti thi).
  // 2b) Total winnings — JEET ka paisa bhi wagering COMPLETE karta
  //    hai. Rule: bada win aaye to wagering khatam (500 recharge +
  //    100 bet + 9000 win => wagering 0, full withdrawal allowed).
  const [betAgg, betWinAgg, bidAgg, bidWinAgg, tradeBetAgg, tradeWinAgg] =
    await Promise.all([
      // Wingo / TRX bets — mobile se linked (stake)
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
      // Wingo / TRX winnings (payout "get" field)
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

  // 3) API provider games (home page wale zapcore games) ka wagered
  //    Provider history se aata hai. API fail ho to wagering local
  //    games se hi compute ho — withdrawal block na ho.
  let apiGameWagered = 0;
  if (mobile) {
    try {
      apiGameWagered = Number(await getApiGameWagered(mobile)) || 0;
    } catch (error) {
      console.error(
        "WAGERING: API game history fetch failed, skipping api wagered:",
        error.message,
      );
    }
  }

  const totalWagered =
    (betAgg[0]?.total || 0) +
    (bidAgg[0]?.total || 0) +
    (tradeBetAgg[0]?.total || 0) +
    apiGameWagered;

  // Winnings (matka + wingo + trade) wagering ko complete karti hain
  const totalWinnings =
    (betWinAgg[0]?.total || 0) +
    (bidWinAgg[0]?.total || 0) +
    (tradeWinAgg[0]?.total || 0);

  // Wagering completion = stakes + winnings. Bada win aaye to
  // requirement turant khatam.
  const wageringCompleted = totalWagered + totalWinnings;

  const remainingWagering = Math.max(0, requiredWagering - wageringCompleted);

  // 3) Withdrawal cap:
  //    - Wagering pending -> completed (stake+win) amount tak hi withdraw
  //    - Wagering complete -> wallet balance tak
  const credit = Number(user.credit || 0);
  const maxAllowedWithdrawal =
    remainingWagering > 0 ? Math.min(wageringCompleted, credit) : credit;

  return {
    requiredWagering,
    rechargeWagering,
    adminWageringRequired,
    totalWagered,
    totalWinnings,
    wageringCompleted,
    apiGameWagered,
    remainingWagering,
    maxAllowedWithdrawal,
    isEligibleForFullWithdrawal: remainingWagering <= 0,
    canWithdraw: maxAllowedWithdrawal > 0,
  };
};

module.exports = { getWageringSummary };
