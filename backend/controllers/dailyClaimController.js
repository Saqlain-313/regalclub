const DailyClaim = require("../models/DailyClaim");
const User = require("../models/authmodel");

// 7 Days Rewards
const rewards = {
  1: 10,
  2: 15,
  3: 20,
  4: 25,
  5: 30,
  6: 35,
  7: 50,
};

const getISTDateString = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const getNextISTMidnightUTC = () => {
  const now = new Date();

  const istNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  istNow.setDate(istNow.getDate() + 1);
  istNow.setHours(0, 0, 0, 0);

  const utcTime = new Date(istNow.getTime() - (5.5 * 60 * 60 * 1000));

  return utcTime;
};


const getISTStartOfDay = (date = new Date()) => {
  const istDateStr = getISTDateString(date); 
  // IST midnight = istDateStr + "T00:00:00+05:30"
  return new Date(`${istDateStr}T00:00:00+05:30`);
};


const isSameISTDay = (date1, date2) => {
  return getISTDateString(date1) === getISTDateString(date2);
};


const getDaysDifferenceInIST = (date1, date2) => {
  const d1 = getISTStartOfDay(date1);
  const d2 = getISTStartOfDay(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};


const claimDailyBonus = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Helper for IST Date
    const getISTDate = (date = new Date()) => {
      return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    };

    // Create document if not exists
    const claim = await DailyClaim.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: {
          user: userId,
          currentDay: 1,
          totalClaims: 0,
          lastClaimDate: null,
          lastClaimIST: null,
          claimHistory: [],
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // Already claimed today
    if (claim.lastClaimDate && isSameISTDay(claim.lastClaimDate, now)) {
      const nextClaimTime = getNextISTMidnightUTC();

      return res.status(400).json({
        success: false,
        message: "You have already claimed today's reward.",
        canClaim: false,
        currentDay: claim.currentDay,
        totalClaims: claim.totalClaims,
        lastClaimDate: claim.lastClaimDate,
        lastClaimDateIST: getISTDateString(claim.lastClaimDate),
        nextClaimTime: nextClaimTime.toISOString(),
        nextClaimDateIST: getISTDateString(nextClaimTime),
      });
    }

    // Missed day logic
    if (claim.lastClaimDate) {
      const diff = getDaysDifferenceInIST(claim.lastClaimDate, now);

      // Missed 2 or more days -> reset streak
      if (diff > 1) {
        claim.currentDay = 1;
      }
    }

    const reward = rewards[claim.currentDay];

    if (!reward) {
      return res.status(400).json({
        success: false,
        message: "Invalid reward day.",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Add reward
    user.credit = Number(user.credit || 0) + reward;
    await user.save();

    const claimedDay = claim.currentDay;

    // Save claim info
    claim.lastClaimDate = now;
    claim.lastClaimIST = getISTDate(now);
    claim.totalClaims += 1;

    // Save history
    claim.claimHistory.push({
      day: claimedDay,
      reward,
      claimedAt: now,
      claimedAtIST: getISTDate(now),
    });

    // Next day
    if (claim.currentDay >= 7) {
      claim.currentDay = 1;
    } else {
      claim.currentDay += 1;
    }

    await claim.save();

    const nextClaimTime = getNextISTMidnightUTC();

    return res.status(200).json({
      success: true,
      message: `Day ${claimedDay} reward claimed successfully.`,

      claimedDay,
      reward,
      nextDay: claim.currentDay,

      totalCredit: user.credit,
      totalClaims: claim.totalClaims,

      lastClaimDate: claim.lastClaimDate,
      lastClaimDateIST: getISTDateString(claim.lastClaimDate),

      canClaim: false,

      nextClaimTime: nextClaimTime.toISOString(),
      nextClaimDateIST: getISTDateString(nextClaimTime),

      claimHistory: claim.claimHistory,
    });
  } catch (error) {
    console.error("Daily Claim Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// =======================
// Get Claim Status
// =======================
const getDailyClaimStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const claim = await DailyClaim.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: {
          user: userId,
          currentDay: 1,
          totalClaims: 0,
          lastClaimDate: null,
          lastClaimIST: null,
          claimHistory: [],
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    let canClaim = true;

    // ================= CHECK CLAIM STATUS =================
    if (claim.lastClaimDate) {
      // Already claimed today (IST)
      if (isSameISTDay(claim.lastClaimDate, now)) {
        canClaim = false;
      } else {
        // Days difference
        const daysDiff = getDaysDifferenceInIST(
          claim.lastClaimDate,
          now
        );

        // Missed 2 or more days -> Reset streak
        if (daysDiff > 1) {
          claim.currentDay = 1;
          await claim.save();

          console.log(
            `🔄 User ${userId} missed ${daysDiff - 1} day(s). Reset to Day 1`
          );
        }
      }
    }

    // ================= NEXT CLAIM TIME (IST MIDNIGHT) =================

    const nextClaimTime = getNextISTMidnightUTC();

    // ================= TIME REMAINING =================

    const timeRemaining = Math.max(
      0,
      nextClaimTime.getTime() - now.getTime()
    );

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) /
      (1000 * 60)
    );

    const seconds = Math.floor(
      (timeRemaining % (1000 * 60)) / 1000
    );

    return res.status(200).json({
      success: true,

      canClaim,
      currentDay: claim.currentDay,
      rewards,

      totalClaims: claim.totalClaims,

      lastClaimDate: claim.lastClaimDate,
      lastClaimDateIST: claim.lastClaimDate
        ? getISTDateString(claim.lastClaimDate)
        : null,

      lastClaimIST: claim.lastClaimIST,

      claimHistory: claim.claimHistory,

      // Next claim
      nextClaimTime: nextClaimTime.toISOString(),
      nextClaimDateIST: getISTDateString(nextClaimTime),

      // Countdown
      timeRemaining: {
        days,
        hours,
        minutes,
        seconds,
        total: timeRemaining,
      },
    });
  } catch (error) {
    console.error("Get Claim Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// =======================
// Reset Claim (Admin/Testing)
// =======================
const resetDailyClaim = async (req, res) => {
  try {
    const userId = req.user.id;

    // Optional: Check if user is admin
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: "Unauthorized" });
    // }

    const claim = await DailyClaim.findOne({ user: userId });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim record not found",
      });
    }

    claim.currentDay = 1;
    claim.totalClaims = 0;
    claim.lastClaimDate = null;
    await claim.save();

    return res.status(200).json({
      success: true,
      message: "Daily claim reset successfully",
      currentDay: claim.currentDay,
    });
  } catch (error) {
    console.error("Reset Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  claimDailyBonus,
  getDailyClaimStatus,
  resetDailyClaim,
};