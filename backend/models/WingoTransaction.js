// models/Transaction.js
const mongoose = require('mongoose');

const wingotransactionSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    credit: {
      type: Number,
      default: 0,
    },
    time: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

wingotransactionSchema.index({ mobile: 1, createdAt: -1 });

module.exports = mongoose.model('wingotransactions', wingotransactionSchema);