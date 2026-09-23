// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    wingo: {
      type: String,
      default: '-1',
    },
    wingo3: {
      type: String,
      default: '-1',
    },
    wingo5: {
      type: String,
      default: '-1',
    },
    wingo10: {
      type: String,
      default: '-1',
    },
    trx: {
      type: String,
      default: '-1',
    },
    trx3: {
      type: String,
      default: '-1',
    },
    trx5: {
      type: String,
      default: '-1',
    },
    trx10: {
      type: String,
      default: '-1',
    },
    wingo1_mode: {
      type: Number,
      default: 0,
    },
    wingo3_mode: {
      type: Number,
      default: 0,
    },
    wingo5_mode: {
      type: Number,
      default: 0,
    },
    wingo10_mode: {
      type: Number,
      default: 0,
    },
    wingo30_mode: {
      type: Number,
      default: 0,
    },
    trx_mode: {
      type: Number,
      default: 0,
    },
    trx3_mode: {
      type: Number,
      default: 0,
    },
    trx5_mode: {
      type: Number,
      default: 0,
    },
    trx10_mode: {
      type: Number,
      default: 0,
    },
    commition_Bet_Amount: {
      type: Number,
      default: 0,
    },
    user_bet_commition: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('admins', adminSchema);