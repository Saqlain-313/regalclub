const mongoose = require("mongoose");

const nepalPowerballDivisionSchema = new mongoose.Schema(
  {
    division: {
      type: Number,
      required: true,
      min: 1,
    },
    main: {
      type: Number,
      required: true,
      min: 0,
    },
    powerball: {
      type: Boolean,
      required: true,
      default: false,
    },
    prize: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

nepalPowerballDivisionSchema.index({ division: 1 }, { unique: true });

module.exports =
  mongoose.models.NepalPowerballDivision ||
  mongoose.model("NepalPowerballDivision", nepalPowerballDivisionSchema);
