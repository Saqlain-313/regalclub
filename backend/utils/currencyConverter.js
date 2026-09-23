// utils/currencyConverter.js

// Exchange rates (1 USD to other currencies)
// You can update these rates or fetch from an API
const EXCHANGE_RATES = {
  USD: 1,
  INR: 83.50,    // 1 USD = 83.50 INR
  AED: 3.67,     // 1 USD = 3.67 AED
  PKR: 278.50,   // 1 USD = 278.50 PKR
  BDT: 109.50,   // 1 USD = 109.50 BDT
  NPR: 133.50,   // 1 USD = 133.50 NPR
  AUD: 1.53,     // 1 USD = 1.53 AUD
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
  AU: 'AUD',
  IN: 'INR',
  PK: 'PKR',
  BD: 'BDT',
  NP: 'NPR',
  AE: 'AED',
};

/**
 * Convert USD to user's local currency
 * @param {number} usdAmount - Amount in USD
 * @param {string} countryCode - Country code (AU, IN, PK, etc.)
 * @returns {Object} - Converted amount and currency details
 */
const convertUSDtoLocal = (usdAmount, countryCode) => {
  const currency = COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
  const rate = EXCHANGE_RATES[currency] || 1;
  
  return {
    originalAmount: usdAmount,
    originalCurrency: 'USD',
    convertedAmount: usdAmount * rate,
    convertedCurrency: currency,
    exchangeRate: rate,
    countryCode: countryCode,
  };
};

/**
 * Get currency symbol for a country
 * @param {string} countryCode - Country code
 * @returns {string} - Currency symbol
 */
const getCurrencySymbol = (countryCode) => {
  const symbols = {
    USD: '$',
    INR: '₹',
    AED: 'د.إ',
    PKR: 'Rs',
    BDT: '৳',
    NPR: 'Rs',
    AUD: '$',
  };
  
  const currency = COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
  return symbols[currency] || '$';
};

/**
 * @param {number} amount - Amount in local currency
 * @param {string} countryCode - Country code
 * @returns {string} - Formatted string
 */
const formatCurrency = (amount, countryCode) => {
  const symbol = getCurrencySymbol(countryCode);
  return `${symbol} ${amount.toFixed(2)}`;
};

module.exports = {
  EXCHANGE_RATES,
  COUNTRY_CURRENCY_MAP,
  convertUSDtoLocal,
  getCurrencySymbol,
  formatCurrency,
};