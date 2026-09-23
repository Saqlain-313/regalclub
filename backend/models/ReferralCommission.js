const mongoose = require("mongoose");

const referralIncomeSchema = new mongoose.Schema(
    {
        referrer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        referredUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        deposit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deposit",
            required: true,
        },
        level: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },

        depositAmount: Number,

        percentage: Number,

        commission: Number,

        rechargeNumber: Number,
    },
    {
        timestamps: true,
    });

module.exports = mongoose.model("ReferralIncome", referralIncomeSchema);