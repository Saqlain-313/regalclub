// models/Wingo.js
const mongoose = require('mongoose');

const wingoSchema = new mongoose.Schema(
  {
    period: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    game: {
      type: String,
      enum: ['wingo', 'wingo3', 'wingo5', 'wingo10', 'trx', 'trx3', 'trx5', 'trx10'],
      required: true,
      index: true,
    },
    status: {
      type: Number,
      default: 0, // 0: active/ongoing, 1: completed, 2: cancelled
      index: true,
    },
    hashvalue: {
      type: String,
      default: null,
    },
    blocs: {
      type: Number,
      default: 50,
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

// =====================================================
// INDEXES FOR PERFORMANCE
// =====================================================

// For finding active games
wingoSchema.index({ game: 1, status: 1, period: -1 });

// For finding latest period
wingoSchema.index({ game: 1, status: 0, _id: -1 });

// For period lookup
wingoSchema.index({ period: 1, game: 1 });

// For history
wingoSchema.index({ game: 1, status: { $ne: 0 }, _id: -1 });

// Compound index for common queries
wingoSchema.index({ game: 1, status: 0, period: 1 });

// =====================================================
// STATIC METHODS
// =====================================================

// Get current active period for a game
wingoSchema.statics.getCurrentPeriod = async function(gameName) {
  const result = await this.findOne({ 
    game: gameName, 
    status: 0 
  })
  .sort({ _id: -1 })
  .limit(1);
  
  return result;
};

// Get latest completed result
wingoSchema.statics.getLatestResult = async function(gameName) {
  const result = await this.findOne({ 
    game: gameName, 
    status: 1 
  })
  .sort({ _id: -1 })
  .limit(1);
  
  return result;
};

// Get history with pagination
wingoSchema.statics.getHistory = async function(gameName, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const results = await this.find({ 
    game: gameName, 
    status: { $ne: 0 } 
  })
  .sort({ _id: -1 })
  .skip(skip)
  .limit(limit);
  
  const total = await this.countDocuments({ 
    game: gameName, 
    status: { $ne: 0 } 
  });
  
  return {
    data: results,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Update period result
wingoSchema.statics.updateResult = async function(period, gameName, amount, status = 1) {
  return await this.updateOne(
    { period, game: gameName },
    { $set: { amount, status } }
  );
};

// Create new period
wingoSchema.statics.createNewPeriod = async function(period, gameName) {
  return await this.create({
    period: String(period),
    amount: 0,
    game: gameName,
    status: 0,
    hashvalue: generateRandomHash(10),
    blocs: 50,
    time: formatDate(Date.now()),
  });
};

// =====================================================
// INSTANCE METHODS
// =====================================================

// Check if period is active
wingoSchema.methods.isActive = function() {
  return this.status === 0;
};

// Check if period is completed
wingoSchema.methods.isCompleted = function() {
  return this.status === 1;
};

// Get result as number
wingoSchema.methods.getResult = function() {
  return Number(this.amount);
};

// =====================================================
// HELPERS (defined inside for static methods)
// =====================================================

function generateRandomHash(length) {
  const characters = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

function formatDate(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type).value;

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model('wingo', wingoSchema);