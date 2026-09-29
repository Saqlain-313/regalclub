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
  const requiredWagering = rechargeAgg?.total || 0;

  // 2) Total wagered — saare game bets (parallel)
  const [betAgg, bidAgg, tradeBetAgg] = await Promise.all([
    // Wingo / TRX bets — mobile se linked
    mobile
      ? Bet.aggregate([
          { $match: { mobile } },
          { $group: { _id: null, total: { $sum: "$money" } } },
        ])
      : Promise.resolve([]),
    // Matka bids
    Bid.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$bidAmount" } } },
    ]),
    // Trade bets
    TradeBet.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalWagered =
    (betAgg[0]?.total || 0) +
    (bidAgg[0]?.total || 0) +
    (tradeBetAgg[0]?.total || 0);

  const remainingWagering = Math.max(0, requiredWagering - totalWagered);

  // 3) Withdrawal cap:
  //    - Wagering pending -> wagered amount tak hi withdraw
  //    - Wagering complete -> wallet balance tak
  const credit = Number(user.credit || 0);
  const maxAllowedWithdrawal =
    remainingWagering > 0 ? Math.min(totalWagered, credit) : credit;

  return {
    requiredWagering,
    totalWagered,
    remainingWagering,
    maxAllowedWithdrawal,
    isEligibleForFullWithdrawal: remainingWagering <= 0,
    canWithdraw: maxAllowedWithdrawal > 0,
  };
};

module.exports = { getWageringSummary };
