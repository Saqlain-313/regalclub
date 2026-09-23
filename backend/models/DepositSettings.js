const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    // UPI, BANK, PAYPAL, CRYPTO, JAZZCASH etc.
    type: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // Dynamic data
    // Example:
    // UPI => upiId + qr
    // Bank => account details
    // Crypto => wallet
    // PayPal => email
    details: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    minimumDeposit: {
      type: Number,
      default: 100,
    },

    maximumDeposit: {
      type: Number,
      default: 1000000,
    },

    processingTime: {
      type: String,
      default: "5-30 Minutes",
    },

    status: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const depositSettingsSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    countryName: {
      type: String,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      default: "USD",
    },

    methods: [paymentMethodSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DepositSettings",
  depositSettingsSchema
);