// models/WingoResultConfig.js
//
// Period-specific authorized result configuration + audit trail.
// Admin kisi FUTURE/PENDING period ke liye expected result (0-9)
// set karta hai. processResultImmediately() us period ke result
// time par yahi config consume karta hai (ek hi baar — consumedAt
// set hota hai, dobara use nahi hota).
const mongoose = require("mongoose");

const wingoResultConfigSchema = new mongoose.Schema(
  {
    // Game field name — "wingo" | "wingo3" | "wingo5" | "wingo10"
    game: {
      type: String,
      required: true,
      index: true,
      enum: ["wingo", "wingo3", "wingo5", "wingo10"],
    },

    // Exact period number jiske liye result lock hai
    period: {
      type: String,
      required: true,
    },

    // Authorized result 0-9
    result: {
      type: Number,
      required: true,
      min: 0,
      max: 9,
    },

    // Derived attributes (server-side calculate hote hain —
    // consistency ke liye yahin store, har jagah yahi se dikhega)
    size: {
      type: String,
      enum: ["Big", "Small"],
    },
    color: {
      type: String, // "Green" | "Red" | "Red + Violet" | "Green + Violet"
    },

    // ---- AUDIT ----
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    createdByMobile: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    updatedAt: {
      type: Date,
    },
    action: {
      type: String,
      enum: ["set", "update", "clear"],
      default: "set",
    },

    // Consumption — result process hone ke baad set hota hai
    consumedAt: {
      type: Date,
      default: null,
    },
    processedResult: {
      type: Number,
      default: null,
    },
  },
  { timestamps: false },
);

// Ek period ke liye sirf ek config
wingoResultConfigSchema.index({ game: 1, period: 1 }, { unique: true });

// Central mapping — number -> { size, color }
wingoResultConfigSchema.statics.deriveAttributes = function (number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 0 || n > 9) return null;

  const size = n >= 5 ? "Big" : "Small";
  let color;
  if (n === 0) color = "Red + Violet";
  else if (n === 5) color = "Green + Violet";
  else color = [1, 3, 7, 9].includes(n) ? "Green" : "Red";

  return { size, color };
};

module.exports = mongoose.model(
  "WingoResultConfig",
  wingoResultConfigSchema,
);
