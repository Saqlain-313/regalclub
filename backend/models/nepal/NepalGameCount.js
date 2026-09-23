const mongoose = require("mongoose");

const nepalGameCountSchema = new mongoose.Schema(
  {
    ticketType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
      required: true,
    },

    gameType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
      default: null,
    },

    totalGames: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    label: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NepalGameCount", nepalGameCountSchema);
