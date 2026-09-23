const ReferralLevel = require("../models/ReferralLevel");

// ======================================================
// DEFAULT 8 LEVELS
// ======================================================

const DEFAULT_LEVELS = [
    {
        level: 1,
        percentage: 10,
    },
    {
        level: 2,
        percentage: 5,
    },
    {
        level: 3,
        percentage: 3,
    },
    {
        level: 4,
        percentage: 2,
    },
    {
        level: 5,
        percentage: 1.5,
    },
    {
        level: 6,
        percentage: 1,
    },
    {
        level: 7,
        percentage: 0.5,
    },
    {
        level: 8,
        percentage: 0.5,
    },
];


// ======================================================
// INITIALIZE 8 LEVELS
// ======================================================

const initializeReferralLevels = async () => {
    try {
        for (const item of DEFAULT_LEVELS) {
            await ReferralLevel.findOneAndUpdate(
                {
                    level: item.level,
                },
                {
                    $setOnInsert: {
                        level: item.level,
                        percentage:
                            item.percentage,
                        status: true,
                    },
                },
                {
                    upsert: true,
                    returnDocument: "after",
                }
            );
        }

        console.log(
            "Referral levels initialized successfully"
        );
    } catch (error) {
        console.error(
            "INITIALIZE REFERRAL LEVEL ERROR:",
            error
        );
    }
};


// ======================================================
// GET ALL REFERRAL LEVELS
// ======================================================

const getReferralLevels = async (
    req,
    res
) => {
    try {
        await initializeReferralLevels();

        const levels =
            await ReferralLevel.find({})
                .sort({
                    level: 1,
                })
                .lean();

        return res.status(200).json({
            success: true,
            count: levels.length,
            levels,
        });

    } catch (error) {
        console.error(
            "GET REFERRAL LEVELS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch referral levels",
        });
    }
};


// ======================================================
// UPDATE SINGLE LEVEL
// ======================================================

const updateReferralLevel = async (
    req,
    res
) => {
    try {
        const { level } = req.params;

        const {
            percentage,
            status,
        } = req.body;

        const levelNumber =
            Number(level);

        // ================= VALIDATE LEVEL =================

        if (
            !Number.isInteger(
                levelNumber
            ) ||
            levelNumber < 1 ||
            levelNumber > 8
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Level must be between 1 and 8",
            });
        }

        // ================= VALIDATE PERCENTAGE =================

        if (
            percentage !== undefined
        ) {
            const percentageNumber =
                Number(percentage);

            if (
                Number.isNaN(
                    percentageNumber
                ) ||
                percentageNumber < 0 ||
                percentageNumber > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Percentage must be between 0 and 100",
                });
            }
        }

        // ================= UPDATE DATA =================

        const updateData = {};

        if (
            percentage !== undefined
        ) {
            updateData.percentage =
                Number(percentage);
        }

        if (
            status !== undefined
        ) {
            updateData.status =
                Boolean(status);
        }

        // ================= UPDATE =================

        const updatedLevel =
            await ReferralLevel.findOneAndUpdate(
                {
                    level: levelNumber,
                },
                {
                    $set: updateData,
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                }
            );

        return res.status(200).json({
            success: true,
            message:
                `Level ${levelNumber} updated successfully`,
            level: updatedLevel,
        });

    } catch (error) {
        console.error(
            "UPDATE REFERRAL LEVEL ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update referral level",
        });
    }
};


// ======================================================
// UPDATE ALL 8 LEVELS
// ======================================================

const updateAllReferralLevels = async (
    req,
    res
) => {
    try {
        const { levels } = req.body;

        if (
            !Array.isArray(levels) ||
            levels.length !== 8
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Exactly 8 referral levels are required",
            });
        }

        const updatedLevels = [];

        for (const item of levels) {
            const levelNumber =
                Number(item.level);

            const percentage =
                Number(item.percentage);

            if (
                !Number.isInteger(
                    levelNumber
                ) ||
                levelNumber < 1 ||
                levelNumber > 8
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each level must be between 1 and 8",
                });
            }

            if (
                Number.isNaN(
                    percentage
                ) ||
                percentage < 0 ||
                percentage > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Invalid percentage for level ${levelNumber}`,
                });
            }

            const updated =
                await ReferralLevel.findOneAndUpdate(
                    {
                        level: levelNumber,
                    },
                    {
                        $set: {
                            percentage,
                            status:
                                item.status !==
                                undefined
                                    ? Boolean(
                                          item.status
                                      )
                                    : true,
                        },
                    },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                    }
                );

            updatedLevels.push(
                updated
            );
        }

        updatedLevels.sort(
            (a, b) =>
                a.level - b.level
        );

        return res.status(200).json({
            success: true,
            message:
                "All referral levels updated successfully",
            levels: updatedLevels,
        });

    } catch (error) {
        console.error(
            "UPDATE ALL REFERRAL LEVELS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update referral levels",
        });
    }
};


// ======================================================
// DELETE / RESET LEVELS
// ======================================================

const resetReferralLevels = async (
    req,
    res
) => {
    try {
        await ReferralLevel.deleteMany({});

        await initializeReferralLevels();

        const levels =
            await ReferralLevel.find({})
                .sort({
                    level: 1,
                });

        return res.status(200).json({
            success: true,
            message:
                "Referral levels reset successfully",
            levels,
        });

    } catch (error) {
        console.error(
            "RESET REFERRAL LEVEL ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to reset referral levels",
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    initializeReferralLevels,
    getReferralLevels,
    updateReferralLevel,
    updateAllReferralLevels,
    resetReferralLevels,
};