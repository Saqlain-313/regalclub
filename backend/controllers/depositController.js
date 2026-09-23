const Deposit = require("../models/Deposit");
const DepositSettings = require("../models/DepositSettings");
const User = require("../models/authmodel");
const mongoose = require("mongoose");
const ReferralCommission = require("../models/ReferralCommission");
const ReferralLevel = require("../models/ReferralLevel");
const uploadToImgBB = require("../utils/uploadToImgBB");
// CurrencyRate ab use nahi ho raha (conversion hata diya)
// const CurrencyRate = require("../models/CurrencyRate");

// ==========================================
// Create Deposit Request
// ==========================================
exports.createDeposit = async (req, res) => {
    try {
        // ==========================================
        // 1. USER ID
        // ==========================================
        const userId = req.user.id;

        // ==========================================
        // 2. REQUEST BODY
        // ==========================================
        const {
            amount,
            transactionId,
            methodType,
            methodTitle,
        } = req.body;

        // ==========================================
        // 3. REQUIRED FIELDS
        // ==========================================
        if (
            amount === undefined ||
            amount === null ||
            !transactionId ||
            !methodType ||
            !methodTitle
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // ==========================================
        // 4. AMOUNT VALIDATION
        // ==========================================
        const depositAmount = Number(amount);

        if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount",
            });
        }

        // ==========================================
        // 5. TRANSACTION ID CLEAN
        // ==========================================
        const cleanTransactionId = String(transactionId).trim();

        if (!cleanTransactionId) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required",
            });
        }

        // ==========================================
        // 6. GET USER
        // ==========================================
        const user = await User.findById(userId);

        console.log("USER:", user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ==========================================
        // 7. CHECK USER COUNTRY
        // ==========================================
        if (!user.country) {
            return res.status(400).json({
                success: false,
                message: "Country not found",
            });
        }

        // ==========================================
        // 8. COUNTRY NAME -> ISO CODE
        // ==========================================
        const countryMap = {
            // India
            india: "IN",

            // Australia
            australia: "AU",
            austraila: "AU",

            // Nepal
            nepal: "NP",

            // Pakistan
            pakistan: "PK",

            // Bangladesh
            bangladesh: "BD",

            // UAE
            dubai: "AE",
            uae: "AE",
            "united arab emirates": "AE",
        };

        const userCountry = String(user.country)
            .trim()
            .toLowerCase();

        // Country name hai to code mein convert karo.
        // Agar already IN / BD / AU etc. hai to direct use hoga.
        const countryCode =
            countryMap[userCountry] ||
            userCountry.toUpperCase();

        console.log("USER COUNTRY:", user.country);
        console.log("NORMALIZED COUNTRY:", userCountry);
        console.log("COUNTRY CODE:", countryCode);

        // ==========================================
        // 9. GET DEPOSIT SETTINGS
        // ==========================================
        const settings = await DepositSettings.findOne({
            country: countryCode,
        });

        console.log("DEPOSIT SETTINGS:", settings);

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Deposit settings not found",
                country: user.country,
                countryCode: countryCode,
            });
        }

        // ==========================================
        // 10. CHECK METHODS ARRAY
        // ==========================================
        if (!Array.isArray(settings.methods)) {
            return res.status(404).json({
                success: false,
                message: "No payment methods configured",
            });
        }

        // ==========================================
        // 11. FIND PAYMENT METHOD
        // ==========================================
        const cleanMethodType = String(methodType).trim();
        const cleanMethodTitle = String(methodTitle).trim();

        const method = settings.methods.find(
            (m) =>
                m &&
                String(m.type).trim().toUpperCase() ===
                    cleanMethodType.toUpperCase() &&
                String(m.title).trim().toLowerCase() ===
                    cleanMethodTitle.toLowerCase() &&
                m.status === true
        );

        console.log("SELECTED METHOD:", method);

        if (!method) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found",
            });
        }

        // ==========================================
        // 12. MINIMUM DEPOSIT
        // ==========================================
        const minimumDeposit = Number(
            method.minimumDeposit || 0
        );

        if (
            minimumDeposit > 0 &&
            depositAmount < minimumDeposit
        ) {
            return res.status(400).json({
                success: false,
                message: `Minimum deposit is ${minimumDeposit}`,
            });
        }

        // ==========================================
        // 13. MAXIMUM DEPOSIT
        // ==========================================
        const maximumDeposit = Number(
            method.maximumDeposit || 0
        );

        if (
            maximumDeposit > 0 &&
            depositAmount > maximumDeposit
        ) {
            return res.status(400).json({
                success: false,
                message: `Maximum deposit is ${maximumDeposit}`,
            });
        }

        // ==========================================
        // 14. CHECK DUPLICATE TRANSACTION ID
        // ==========================================
        const already = await Deposit.findOne({
            transactionId: cleanTransactionId,
        });

        if (already) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID already used",
            });
        }

        // ==========================================
        // 15. UPLOAD SCREENSHOT
        // ==========================================
        let screenshot = "";

        if (req.file) {
            screenshot = await uploadToImgBB(req.file);
        }

        // ==========================================
        // 16. CREATE DEPOSIT
        // ==========================================
        const deposit = await Deposit.create({
            user: user._id,

            // Always save normalized ISO country code
            country: settings.country,

            currency: settings.currency,

            methodType: method.type,
            methodTitle: method.title,

            amount: depositAmount,

            transactionId: cleanTransactionId,

            screenshot,

            status: "pending",
        });

        // ==========================================
        // 17. SUCCESS RESPONSE
        // ==========================================
        return res.status(201).json({
            success: true,
            message: "Deposit request submitted successfully",

            deposit,
        });

    } catch (error) {
        console.error(
            "CREATE DEPOSIT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Get Logged In User Deposit History
// ==========================================
exports.getUserDeposits = async (req, res) => {
    try {
        const userId = req.user.id;

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter = {
            user: userId,
        };

        if (req.query.status) {
            filter.status =
                req.query.status;
        }

        const total =
            await Deposit.countDocuments(
                filter
            );

        const deposits =
            await Deposit.find(filter)
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit);

        return res.status(200).json({
            success: true,
            currentPage: page,
            totalPages:
                Math.ceil(
                    total / limit
                ),
            totalRecords: total,
            deposits,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Get Single Deposit
// ==========================================
exports.getDepositDetails = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const deposit =
            await Deposit.findOne({
                _id: id,
                user: req.user.id,
            });

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: "Deposit not found",
            });
        }

        return res.status(200).json({
            success: true,
            deposit,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Admin - Get All Deposits
// ==========================================
exports.getAllDeposits = async (
    req,
    res
) => {
    try {
        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 20;

        const skip =
            (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            filter.status =
                req.query.status;
        }

        if (req.query.country) {
            filter.country =
                req.query.country.toUpperCase();
        }

        if (req.query.methodType) {
            filter.methodType =
                req.query.methodType;
        }

        if (req.query.search) {
            const users =
                await User.find({
                    $or: [
                        {
                            name: {
                                $regex:
                                    req.query.search,
                                $options: "i",
                            },
                        },
                        {
                            email: {
                                $regex:
                                    req.query.search,
                                $options: "i",
                            },
                        },
                        {
                            mobile: {
                                $regex:
                                    req.query.search,
                                $options: "i",
                            },
                        },
                    ],
                }).select("_id");

            filter.user = {
                $in: users.map(
                    (u) => u._id
                ),
            };
        }

        const total =
            await Deposit.countDocuments(
                filter
            );

        const deposits =
            await Deposit.find(filter)
                .populate(
                    "user",
                    "name email mobile country credit"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit);

        return res.status(200).json({
            success: true,
            currentPage: page,
            totalPages:
                Math.ceil(
                    total / limit
                ),
            totalRecords: total,
            deposits,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Admin Pending Deposits
// ==========================================
exports.getPendingDeposits = async (
    req,
    res
) => {
    try {
        const deposits =
            await Deposit.find({
                status: "pending",
            })
                .populate(
                    "user",
                    "name email mobile country"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            total: deposits.length,
            deposits,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Admin - Approve Deposit
// ==========================================
exports.approveDeposit = async (
    req,
    res
) => {
    const session =
        await mongoose.startSession();

    try {
        session.startTransaction();

        const { id } = req.params;
        const { remark } = req.body;

        // ==========================================
        // FIND DEPOSIT
        // ==========================================

        const deposit =
            await Deposit.findById(
                id
            ).session(session);

        if (!deposit) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Deposit not found",
            });
        }

        // ==========================================
        // PREVENT DOUBLE APPROVAL
        // ==========================================

        if (
            deposit.status !==
            "pending"
        ) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message:
                    `Deposit already ${deposit.status}`,
            });
        }

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await User.findById(
                deposit.user
            ).session(session);

        if (!user) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ==========================================
        // AMOUNT (NO CONVERSION - SAME CURRENCY)
        // ==========================================
        // Deposit jis currency me hua hai, usi me credit hoga.
        // Koi INR conversion nahi.

        const amountInINR = Number(deposit.amount);
        const conversionRate = 1;
        const currencyCode = deposit.currency || "INR";
        const countryCode = deposit.country || "IN";

        console.log(
            "Crediting amount (same currency):",
            amountInINR,
            currencyCode,
            "for country:",
            countryCode
        );

        // ==========================================
        // COUNT PREVIOUS APPROVED DEPOSITS
        // ==========================================

        const approvedRechargeCount =
            await Deposit.countDocuments({
                user: user._id,
                status: "approved",
            }).session(session);

        // ==========================================
        // CREDIT USER credit (SAME CURRENCY)
        // ==========================================

        user.credit =
            Number(
                user.credit || 0
            ) + amountInINR;

        await user.save({
            session,
        });

        // ==========================================
        // GET 8 LEVEL CONFIGURATION
        // ==========================================

        const referralLevels =
            await ReferralLevel.find({
                level: {
                    $gte: 1,
                    $lte: 8,
                },
                status: true,
            })
                .sort({
                    level: 1,
                })
                .session(session)
                .lean();

        // ==========================================
        // REFERRAL COMMISSION ARRAY
        // ==========================================

        const referralCommission = [];

        // Direct referrer = Level 1
        let currentUserId =
            user.referredByUser ||
            null;

        // ==========================================
        // TRAVERSE 8 LEVELS
        // ==========================================

        for (
            let level = 1;
            level <= 8;
            level++
        ) {
            // No more upline
            if (!currentUserId) {
                break;
            }

            // ======================================
            // FIND UPLINE
            // ======================================

            const referrer =
                await User.findById(
                    currentUserId
                ).session(session);

            if (!referrer) {
                break;
            }

            // ======================================
            // GET ADMIN LEVEL CONFIG
            // ======================================

            const levelConfig =
                referralLevels.find(
                    (item) =>
                        item.level ===
                        level
                );

            // Level not configured/disabled.
            // Still continue to next upline.
            if (!levelConfig) {
                currentUserId =
                    referrer.referredByUser ||
                    null;

                continue;
            }

            const commissionPercent =
                Number(
                    levelConfig.percentage
                ) || 0;

            // ======================================
            // BLOCKED USER DOES NOT GET COMMISSION
            // ======================================

            if (
                referrer.status !==
                "active"
            ) {
                currentUserId =
                    referrer.referredByUser ||
                    null;

                continue;
            }

            // ======================================
            // CALCULATE COMMISSION (SAME CURRENCY)
            // ======================================

            const commission =
                Number(
                    (
                        (amountInINR *
                            commissionPercent) /
                        100
                    ).toFixed(2)
                );

            if (commission > 0) {
                // ==================================
                // ADD credit
                // ==================================

                referrer.credit =
                    Number(
                        referrer.credit ||
                            0
                    ) + commission;

                // ==================================
                // ADD REFERRAL EARNING
                // ==================================

                referrer.referralEarning =
                    Number(
                        referrer.referralEarning ||
                            0
                    ) + commission;

                // ==================================
                // SAVE REFERRER
                // ==================================

                await referrer.save({
                    session,
                });

                // ==================================
                // SAVE COMMISSION HISTORY
                // ==================================

                const commissionRecord =
                    await ReferralCommission.create(
                        [
                            {
                                referrer:
                                    referrer._id,

                                referredUser:
                                    user._id,

                                deposit:
                                    deposit._id,

                                depositAmount:
                                    deposit.amount,

                                depositAmountINR:
                                    amountInINR,

                                currencyCode:
                                    currencyCode,

                                level:
                                    level,

                                percentage:
                                    commissionPercent,

                                commission:
                                    commission,

                                rechargeNumber:
                                    approvedRechargeCount +
                                    1,

                                status:
                                    "credited",
                            },
                        ],
                        {
                            session,
                        }
                    );

                referralCommission.push(
                    commissionRecord[0]
                );
            }

            // ==================================
            // MOVE TO NEXT UPLINE
            // ==================================

            currentUserId =
                referrer.referredByUser ||
                null;
        }

        // ==========================================
        // UPDATE DEPOSIT
        // ==========================================

        deposit.status =
            "approved";

        deposit.approvedBy =
            req.user.id;

        deposit.approvedAt =
            new Date();

        deposit.amountInINR =
            amountInINR;

        deposit.conversionRate =
            conversionRate;

        deposit.currencyCode =
            currencyCode;

        if (remark) {
            deposit.remark =
                remark;
        }

        await deposit.save({
            session,
        });

        // ==========================================
        // COMMIT
        // ==========================================

        await session.commitTransaction();

        session.endSession();

        // ==========================================
        // TOTAL REFERRAL COMMISSION
        // ==========================================

        const totalReferralCommission =
            Number(
                referralCommission
                    .reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.commission ||
                                    0
                            ),
                        0
                    )
                    .toFixed(2)
            );

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,

            message:
                "Deposit approved successfully",

            deposit,

            usercredit:
                user.credit,

            amountInINR,

            conversionRate,

            currencyCode,

            referralLevelsCredited:
                referralCommission.length,

            totalReferralCommission,

            referralCommission,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.log(
            "APPROVE DEPOSIT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};


// ==========================================
// Admin Reject Deposit
// ==========================================
exports.rejectDeposit = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        const { remark } =
            req.body;

        const deposit =
            await Deposit.findById(id);

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: "Deposit not found",
            });
        }

        if (
            deposit.status !==
            "pending"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Deposit already ${deposit.status}`,
            });
        }

        deposit.status =
            "rejected";

        deposit.rejectedAt =
            new Date();

        if (remark) {
            deposit.remark =
                remark;
        }

        await deposit.save();

        return res.status(200).json({
            success: true,
            message:
                "Deposit rejected successfully",
            deposit,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Admin Deposit Statistics
// ==========================================
exports.getDepositStats = async (
    req,
    res
) => {
    try {
        const [
            totalDeposits,
            pendingDeposits,
            approvedDeposits,
            rejectedDeposits,
            approvedAmount,
            pendingAmount,
        ] = await Promise.all([

            Deposit.countDocuments(),

            Deposit.countDocuments({
                status: "pending",
            }),

            Deposit.countDocuments({
                status: "approved",
            }),

            Deposit.countDocuments({
                status: "rejected",
            }),

            Deposit.aggregate([
                {
                    $match: {
                        status:
                            "approved",
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

            Deposit.aggregate([
                {
                    $match: {
                        status:
                            "pending",
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
        ]);

        return res.status(200).json({
            success: true,

            stats: {
                totalDeposits,

                pendingDeposits,

                approvedDeposits,

                rejectedDeposits,

                approvedAmount:
                    approvedAmount.length >
                    0
                        ? approvedAmount[0]
                              .total
                        : 0,

                pendingAmount:
                    pendingAmount.length >
                    0
                        ? pendingAmount[0]
                              .total
                        : 0,
            },
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};