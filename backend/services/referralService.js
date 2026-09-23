const User = require("../models/authmodel");
const ReferralLevel = require("../models/ReferralLevel");


// ======================================================
// DISTRIBUTE 8 LEVEL REFERRAL EARNING
// ======================================================

const distributeReferralEarning = async (
    userId,
    amount,
    session = null
) => {
    try {
        amount = Number(amount);

        if (
            !userId ||
            !amount ||
            amount <= 0
        ) {
            return {
                success: false,
                message:
                    "Invalid user or amount",
            };
        }

        // ==================================================
        // GET ACTIVE LEVELS
        // ==================================================

        const levels =
            await ReferralLevel.find({
                status: true,
                level: {
                    $gte: 1,
                    $lte: 8,
                },
            })
                .sort({
                    level: 1,
                })
                .lean();

        if (!levels.length) {
            return {
                success: true,
                message:
                    "No active referral levels",
                earnings: [],
            };
        }

        // ==================================================
        // START USER
        // ==================================================

        let currentUser =
            await User.findById(
                userId
            ).lean();

        if (!currentUser) {
            return {
                success: false,
                message:
                    "Source user not found",
            };
        }

        const earnings = [];

        // ==================================================
        // TRAVERSE 8 LEVELS
        // ==================================================

        for (
            let level = 1;
            level <= 8;
            level++
        ) {
            // No parent
            if (
                !currentUser.referredByUser
            ) {
                break;
            }

            // ==============================================
            // FIND PARENT
            // ==============================================

            const parent =
                await User.findById(
                    currentUser.referredByUser
                ).lean();

            if (!parent) {
                break;
            }

            // ==============================================
            // FIND CONFIG
            // ==============================================

            const levelConfig =
                levels.find(
                    (item) =>
                        item.level ===
                        level
                );

            if (!levelConfig) {
                currentUser =
                    parent;

                continue;
            }

            // ==============================================
            // CHECK PARENT STATUS
            // ==============================================

            if (
                parent.status !==
                "blocked"
            ) {
                const percentage =
                    Number(
                        levelConfig.percentage
                    );

                const earning =
                    Number(
                        (
                            amount *
                            percentage
                        ) / 100
                    ).toFixed(2);

                if (earning > 0) {
                    // ==========================================
                    // ADD credit + REFERRAL EARNING
                    // ==========================================

                    const updateQuery = {
                        $inc: {
                            credit: earning,
                            referralEarning:
                                earning,
                        },
                    };

                    const updatedParent =
                        session
                            ? await User.findByIdAndUpdate(
                                  parent._id,
                                  updateQuery,
                                  {
                                      new: true,
                                      session,
                                  }
                              ).lean()
                            : await User.findByIdAndUpdate(
                                  parent._id,
                                  updateQuery,
                                  {
                                      new: true,
                                  }
                              ).lean();

                    earnings.push({
                        level,
                        userId:
                            parent._id,
                        percentage,
                        sourceAmount:
                            amount,
                        earning,
                        credit:
                            updatedParent
                                ?.credit ||
                            0,
                    });
                }
            }

            // ==============================================
            // MOVE TO NEXT PARENT
            // ==============================================

            currentUser = parent;
        }

        return {
            success: true,
            sourceUser: userId,
            sourceAmount: amount,
            totalLevels: earnings.length,
            totalEarning: Number(
                earnings
                    .reduce(
                        (sum, item) =>
                            sum +
                            item.earning,
                        0
                    )
                    .toFixed(2)
            ),
            earnings,
        };

    } catch (error) {
        console.error(
            "REFERRAL DISTRIBUTION ERROR:",
            error
        );

        throw error;
    }
};


module.exports = {
    distributeReferralEarning,
};