const CurrencyRate = require("../models/CurrencyRate");

// Create Currency
exports.createCurrency = async (req, res) => {
  try {
    const { countryCode, currencyCode, rate } = req.body;

    if (!countryCode || !currencyCode || !rate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const exists = await CurrencyRate.findOne({
      countryCode: countryCode.toUpperCase(),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Currency already exists",
      });
    }

    const currency = await CurrencyRate.create({
      countryCode: countryCode.toUpperCase(),
      currencyCode: currencyCode.toUpperCase(),
      rate,
    });

    res.status(201).json({
      success: true,
      message: "Currency created successfully",
      data: currency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All
exports.getCurrencies = async (req, res) => {
  try {
    const currencies = await CurrencyRate.find().sort({
      countryCode: 1,
    });

    res.status(200).json({
      success: true,
      count: currencies.length,
      data: currencies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single
exports.getCurrency = async (req, res) => {
  try {
    const currency = await CurrencyRate.findById(req.params.id);

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    res.status(200).json({
      success: true,
      data: currency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update
exports.updateCurrency = async (req, res) => {
  try {
    const { countryCode, currencyCode, rate, status } = req.body;

    const currency = await CurrencyRate.findById(req.params.id);

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    if (countryCode)
      currency.countryCode = countryCode.toUpperCase();

    if (currencyCode)
      currency.currencyCode = currencyCode.toUpperCase();

    if (rate !== undefined)
      currency.rate = rate;

    if (status !== undefined)
      currency.status = status;

    await currency.save();

    res.status(200).json({
      success: true,
      message: "Currency updated successfully",
      data: currency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete
exports.deleteCurrency = async (req, res) => {
  try {
    const currency = await CurrencyRate.findById(req.params.id);

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    await currency.deleteOne();

    res.status(200).json({
      success: true,
      message: "Currency deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get by Country Code (For Conversion)
exports.getCurrencyByCountry = async (req, res) => {
  try {
    const countryCode = req.params.countryCode.toUpperCase();

    const currency = await CurrencyRate.findOne({
      countryCode,
      status: true,
    });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    res.status(200).json({
      success: true,
      data: currency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};