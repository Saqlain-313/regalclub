const countries = {
  india: {
    key: "india",
    name: "India",

    gameCount: require("../models/india/IndiaGameCount"),
    gamePool: require("../models/india/IndiaGamePool"),

    powerballDivision: require(
      "../models/india/IndiaPowerballDivision"
    ),

    powerballResult: require(
      "../models/india/IndiaPowerballResult"
    ),
  },

  uae: {
    key: "uae",
    name: "UAE",

    gameCount: require("../models/uae/UAEGameCount"),
    gamePool: require("../models/uae/UAEGamePool"),

    powerballDivision: require(
      "../models/uae/UaePowerballDivision"
    ),

    powerballResult: require(
      "../models/uae/UAEPowerballResult"
    ),
  },

  nepal: {
    key: "nepal",
    name: "Nepal",

    gameCount: require("../models/nepal/NepalGameCount"),
    gamePool: require("../models/nepal/NepalGamePool"),

    powerballDivision: require(
      "../models/nepal/NepalPowerballDivision"
    ),

    powerballResult: require(
      "../models/nepal/NepalPowerballResult"
    ),
  },

  pakistan: {
    key: "pakistan",
    name: "Pakistan",

    gameCount: require(
      "../models/pakistan/PakistanGameCount"
    ),

    gamePool: require(
      "../models/pakistan/PakistanGamePool"
    ),

    powerballDivision: require(
      "../models/pakistan/PakistanPowerballDivision"
    ),

    powerballResult: require(
      "../models/pakistan/PakistanPowerballResult"
    ),
  },

  australia: {
    key: "australia",
    name: "Australia",

    gameCount: require(
      "../models/australia/AustraliaGameCount"
    ),

    gamePool: require(
      "../models/australia/AustraliaGamePool"
    ),

    powerballDivision: require(
      "../models/australia/AustraliaPowerballDivision"
    ),

    powerballResult: require(
      "../models/australia/AustraliaPowerballResult"
    ),
  },

  // ==========================================
  // BANGLADESH
  // ==========================================
  bangladesh: {
    key: "bangladesh",
    name: "Bangladesh",

    gameCount: require(
      "../models/bangladesh/BangladeshGameCount"
    ),

    gamePool: require(
      "../models/bangladesh/BangladeshGamePool"
    ),

    powerballDivision: require(
      "../models/bangladesh/BangladeshPowerballDivision"
    ),

    powerballResult: require(
      "../models/bangladesh/BangladeshPowerballResult"
    ),
  },
};

// ==========================================
// NORMALIZE COUNTRY
// ==========================================

const normalizeCountry = (country) => {
  const value = String(country || "")
    .trim()
    .toLowerCase();

  const aliases = {
    // INDIA
    india: "india",
    in: "india",

    // UAE
    uae: "uae",
    ae: "uae",
    dubai: "uae",

    // NEPAL
    nepal: "nepal",
    np: "nepal",

    // PAKISTAN
    pakistan: "pakistan",
    pk: "pakistan",

    // AUSTRALIA
    australia: "australia",
    au: "australia",

    // BANGLADESH
    bangladesh: "bangladesh",
    bd: "bangladesh",
    bangla: "bangladesh",
  };

  return aliases[value] || "";
};

// ==========================================
// GET COUNTRY MODELS
// ==========================================

const getCountryModels = (country) => {
  const normalized = normalizeCountry(country);

  if (!normalized) {
    const error = new Error(
      `Country is required. Received: ${country || "empty"}`
    );

    error.statusCode = 400;

    throw error;
  }

  const context = countries[normalized];

  if (!context) {
    const error = new Error(
      `Unsupported country: ${country || ""}`
    );

    error.statusCode = 400;

    throw error;
  }

  return context;
};

// ==========================================
// GET COUNTRY CONTEXT
// ==========================================

const getCountryContext = (req) => {
  const country =
    req.country ||
    req.params?.country ||
    req.body?.country ||
    req.query?.country ||
    req.user?.country;

  return getCountryModels(country);
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  countries,
  normalizeCountry,
  getCountryModels,
  getCountryContext,
};