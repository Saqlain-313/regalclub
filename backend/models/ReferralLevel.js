const mongoose = require("mongoose");

const referralLevelSchema = new mongoose.Schema(
    {
        level: {
            type: Number,
            required: true,
            unique: true,
            min: 1,
            max: 8,
        },

        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0,
        },

        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const ReferralLevel = mongoose.model(
    "ReferralLevel",
    referralLevelSchema
);

module.exports = ReferralLevel;