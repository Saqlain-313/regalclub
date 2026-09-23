// models/Commission.js
const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
    },
    bonusby: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'Bet',
    },
    commission: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('commissions', commissionSchema);