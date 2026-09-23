// models/Level.js
const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
    },
    f1: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('levels', levelSchema);