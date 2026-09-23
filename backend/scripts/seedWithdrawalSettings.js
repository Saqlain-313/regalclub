// scripts/seedWithdrawalSettings.js
const WithdrawalSettings = require('../models/WithdrawalSettings');

const seedWithdrawalSettings = async () => {
  const countries = [
    {
      country: 'IN',
      countryName: 'India',
      currency: 'INR',
      currencySymbol: '₹',
      minWithdrawal: 100,
      maxWithdrawal: 100000,
      dailyLimit: 50000,
      weeklyLimit: 200000,
      monthlyLimit: 500000,
      processingTime: '24-48 hours',
      processingFee: 0,
      processingFeeType: 'fixed',
      paymentMethods: ['bank_transfer', 'upi', 'phonepe', 'googlepay', 'paytm'],
      requirements: {
        bank_transfer: {
          required: ['accountNumber', 'accountHolderName', 'bankName', 'ifscCode'],
        },
        upi: {
          required: ['upiId', 'upiName'],
        },
        phonepe: {
          required: ['upiId', 'upiName'],
        },
        googlepay: {
          required: ['upiId', 'upiName'],
        },
        paytm: {
          required: ['upiId', 'upiName'],
        },
      },
      verificationRequired: true,
      minAccountAge: 1,
      maxWithdrawalsPerDay: 3,
      isActive: true,
    },
    {
      country: 'US',
      countryName: 'United States',
      currency: 'USD',
      currencySymbol: '$',
      minWithdrawal: 10,
      maxWithdrawal: 5000,
      dailyLimit: 2000,
      weeklyLimit: 10000,
      monthlyLimit: 30000,
      processingTime: '24-48 hours',
      processingFee: 2,
      processingFeeType: 'percentage',
      paymentMethods: ['bank_transfer', 'paypal', 'skrill'],
      requirements: {
        bank_transfer: {
          required: ['accountNumber', 'accountHolderName', 'bankName', 'routingNumber'],
        },
        paypal: {
          required: ['email'],
        },
        skrill: {
          required: ['email'],
        },
      },
      verificationRequired: true,
      minAccountAge: 2,
      maxWithdrawalsPerDay: 5,
      isActive: true,
    },
    {
      country: 'GB',
      countryName: 'United Kingdom',
      currency: 'GBP',
      currencySymbol: '£',
      minWithdrawal: 10,
      maxWithdrawal: 5000,
      dailyLimit: 2000,
      weeklyLimit: 10000,
      monthlyLimit: 30000,
      processingTime: '24-48 hours',
      processingFee: 1.5,
      processingFeeType: 'percentage',
      paymentMethods: ['bank_transfer', 'paypal', 'skrill', 'neteller'],
      requirements: {
        bank_transfer: {
          required: ['accountNumber', 'accountHolderName', 'bankName', 'sortCode'],
        },
        paypal: {
          required: ['email'],
        },
        skrill: {
          required: ['email'],
        },
        neteller: {
          required: ['email'],
        },
      },
      verificationRequired: true,
      minAccountAge: 2,
      maxWithdrawalsPerDay: 5,
      isActive: true,
    },
  ];

  try {
    for (const countryData of countries) {
      await WithdrawalSettings.findOneAndUpdate(
        { country: countryData.country },
        countryData,
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded settings for ${countryData.countryName}`);
    }
    console.log('✅ Withdrawal settings seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding withdrawal settings:', error);
  }
};

module.exports = seedWithdrawalSettings;