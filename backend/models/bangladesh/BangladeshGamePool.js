const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    gameNo: {
      type: Number,
      required: true,
    },

    numbers: {
      type: [Number],
      required: true,
    },

    powerball: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    games: [gameSchema],

    gameEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BangladeshGameEntry",
    },

    bidAmount: {
      type: Number,
      required: true,
    },

    currencyDetails: {
      usdAmount: Number,
      localAmount: Number,
      localCurrency: String,
      exchangeRate: Number,
      userCountry: String,
    },

    result: {
      division: {
        type: Number,
        default: null,
      },

      prize: {
        type: Number,
        default: 0,
      },

      gameNo: {
        type: Number,
        default: null,
      },

      referralBonus: {
        type: Number,
        default: 0,
      },

      referralPercentage: {
        type: Number,
        default: 0,
      },

      referrerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
      },

      referrerName: {
        type: String,
        default: null,
      },
    },

    status: {
      type: String,
      enum: ["Pending", "Won", "Lost"],
      default: "Pending",
    },
  },
  {
    _id: true,
  }
);

const gamePoolSchema = new mongoose.Schema(
  {
    ticketType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
      required: true,
    },

    gameType: {
      type: mongoose.Schema.Types.ObjectId,
    },

    gameCount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BangladeshGameCount",
      required: true,
    },

    country: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
      default: "BANGLADESH",
    },

    players: [playerSchema],

    totalPlayers: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    drawNo: {
      type: Number,
      required: true,
    },

    winningNumbers: {
      numbers: [Number],
      powerball: Number,
    },

    resultDeclared: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Open", "Closed", "Completed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

gamePoolSchema.index({
  ticketType: 1,
  gameType: 1,
  gameCount: 1,
  country: 1,
  status: 1,
});

gamePoolSchema.index({
  country: 1,
  status: 1,
  createdAt: -1,
});

gamePoolSchema.index({
  country: 1,
  drawNo: 1,
});

module.exports = mongoose.model(
  "BangladeshGamePool",
  gamePoolSchema
);