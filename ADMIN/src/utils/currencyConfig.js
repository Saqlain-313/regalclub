// src/utils/currencyConfig.js
export const CURRENCY_CONFIG = {
  australia: {
    code: 'AUD',
    symbol: 'A$',
    locale: 'en-AU',
    exchangeRate: 1,
    label: 'Australia',
    flag: '🇦🇺'
  },
  india: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    exchangeRate: 0.018,
    label: 'India',
    flag: '🇮🇳'
  },
  nepal: {
    code: 'NPR',
    symbol: 'रू',
    locale: 'ne-NP',
    exchangeRate: 0.011,
    label: 'Nepal',
    flag: '🇳🇵'
  },
  uae: {
    code: 'AED',
    symbol: 'د.إ',
    locale: 'ar-AE',
    exchangeRate: 0.41,
    label: 'UAE',
    flag: '🇦🇪'
  },
  canada: {
    code: 'CAD',
    symbol: 'C$',
    locale: 'en-CA',
    exchangeRate: 1.10,
    label: 'Canada',
    flag: '🇨🇦'
  },
  pakistan: {
    code: 'PKR',
    symbol: '₨',
    locale: 'ur-PK',
    exchangeRate: 0.0054,
    label: 'Pakistan',
    flag: '🇵🇰'
  },
};

export const getCurrencyConfig = (country) => {
  const config = CURRENCY_CONFIG[country?.toLowerCase()];
  return config || CURRENCY_CONFIG.australia;
};

export const formatCurrency = (amount, country, config = null) => {
  if (!amount && amount !== 0) return 'N/A';
  
  const currencyConfig = config || getCurrencyConfig(country);
  
  try {
    const localAmount = amount * currencyConfig.exchangeRate;
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(localAmount);
  } catch (error) {
    return `${currencyConfig.symbol} ${amount.toLocaleString()}`;
  }
};