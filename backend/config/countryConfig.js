const countries = {
  india: {
    key: "india",
    name: "India",
    GameCount: require("../models/india/IndiaGameCount"),
    GamePool: require("../models/india/IndiaGamePool"),
    PowerballDivision: require("../models/india/IndiaPowerballDivision"),
    PowerballResult: require("../models/india/IndiaPowerballResult"),
  },

  uae: {
    key: "uae",
    name: "UAE",
    GameCount: require("../models/uae/UAEGameCount"),
    GamePool: require("../models/uae/UAEGamePool"),
    PowerballDivision: require("../models/uae/UaePowerballDivision"),
    PowerballResult: require("../models/uae/UAEPowerballResult"),
  },

  nepal: {
    key: "nepal",
    name: "Nepal",
    GameCount: require("../models/nepal/NepalGameCount"),
    GamePool: require("../models/nepal/NepalGamePool"),
    PowerballDivision: require("../models/nepal/NepalPowerballDivision"),
    PowerballResult: require("../models/nepal/NepalPowerballResult"),
  },

  pakistan: {
    key: "pakistan",
    name: "Pakistan",
    GameCount: require("../models/pakistan/PakistanGameCount"),
    GamePool: require("../models/pakistan/PakistanGamePool"),
    PowerballDivision: require("../models/pakistan/PakistanPowerballDivision"),
    PowerballResult: require("../models/pakistan/PakistanPowerballResult"),
  },

  australia: {
    key: "australia",
    name: "Australia",
    GameCount: require("../models/australia/AustraliaGameCount"),
    GamePool: require("../models/australia/AustraliaGamePool"),
    PowerballDivision: require("../models/australia/AustraliaPowerballDivision"),
    PowerballResult: require("../models/australia/AustraliaPowerballResult"),
  },

  bangladesh: {
    key: "bangladesh",
    name: "Bangladesh",
    GameCount: require("../models/bangladesh/BangladeshGameCount"),
    GamePool: require("../models/bangladesh/BangladeshGamePool"),
    PowerballDivision: require("../models/bangladesh/BangladeshPowerballDivision"),
    PowerballResult: require("../models/bangladesh/BangladeshPowerballResult"),
  },
};

function getCountryContext(req) {
  const raw =
    req.params?.country ||
    req.body?.country ||
    req.query?.country;

  const country = String(raw || "").trim().toLowerCase();

  const context = countries[country];

  if (!context) {
    const error = new Error(
      "Unsupported country. Use india, uae, nepal, pakistan, australia or bangladesh."
    );

    error.statusCode = 400;
    throw error;
  }

  return context;
}

module.exports = {
  countries,
  getCountryContext,
};