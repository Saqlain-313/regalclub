const DepositSettings = require("../models/DepositSettings")

const seedDepositSettings = async () => {
  await DepositSettings.deleteMany({});

  await DepositSettings.insertMany([
    // ===================== AUSTRALIA =====================
    {
      country: "AUSTRALIA",
      countryName: "Australian",
      currency: "AUD",
      methods: [
        {
          type: "BANK",
          title: "Bank Transfer",
          icon: "",
          description: "Deposit via Australian Bank",
          details: {
            bankName: "Commonwealth Bank",
            accountName: "Winzox Pty Ltd",
            accountNumber: "123456789",
            bsb: "062000",
          },
          minimumDeposit: 20,
          maximumDeposit: 10000,
          processingTime: "5-30 Minutes",
          status: true,
          sortOrder: 1,
        },
        {
          type: "PAYID",
          title: "PayID",
          details: {
            payId: "payments@winzox.au",
          },
          minimumDeposit: 10,
          maximumDeposit: 5000,
          processingTime: "Instant",
          status: true,
          sortOrder: 2,
        },
      ],
    },

    // ===================== INDIA =====================
    {
      country: "INDIA",
      countryName: "Indian",
      currency: "INR",
      methods: [
        {
          type: "UPI",
          title: "UPI Payment",
          description: "Pay using any UPI App",
          details: {
            upiId: "winzox@paytm",
            qr: "https://example.com/upi-qr.png",
          },
          minimumDeposit: 100,
          maximumDeposit: 100000,
          processingTime: "Instant",
          status: true,
          sortOrder: 1,
        },
        {
          type: "BANK",
          title: "Bank Transfer",
          details: {
            bankName: "State Bank of India",
            accountName: "Winzox India",
            accountNumber: "1234567890",
            ifsc: "SBIN0001234",
          },
          minimumDeposit: 500,
          maximumDeposit: 500000,
          processingTime: "10-30 Minutes",
          status: true,
          sortOrder: 2,
        },
      ],
    },

    // ===================== PAKISTAN =====================
    {
      country: "PAKISTAN",
      countryName: "Pakistani",
      currency: "PKR",
      methods: [
        {
          type: "JAZZCASH",
          title: "JazzCash",
          details: {
            mobile: "03001234567",
            accountName: "Winzox Pakistan",
          },
          minimumDeposit: 500,
          maximumDeposit: 100000,
          processingTime: "Instant",
          status: true,
          sortOrder: 1,
        },
        {
          type: "EASYPAISA",
          title: "EasyPaisa",
          details: {
            mobile: "03111234567",
          },
          minimumDeposit: 500,
          maximumDeposit: 100000,
          processingTime: "Instant",
          status: true,
          sortOrder: 2,
        },
      ],
    },

    // ===================== BANGLADESH =====================
    {
      country: "BANGLADESH",
      countryName: "Bangladesh",
      currency: "BDT",
      methods: [
        {
          type: "BKASH",
          title: "bKash",
          details: {
            number: "01712345678",
          },
          minimumDeposit: 200,
          maximumDeposit: 100000,
          processingTime: "Instant",
          status: true,
          sortOrder: 1,
        },
        {
          type: "NAGAD",
          title: "Nagad",
          details: {
            number: "01812345678",
          },
          minimumDeposit: 200,
          maximumDeposit: 100000,
          processingTime: "Instant",
          status: true,
          sortOrder: 2,
        },
      ],
    },

    // ===================== NEPAL =====================
    {
      country: "NEPAL",
      countryName: "Nepal",
      currency: "NPR",
      methods: [
        {
          type: "ESEWA",
          title: "eSewa",
          details: {
            walletId: "9800000000",
          },
          minimumDeposit: 200,
          maximumDeposit: 100000,
          processingTime: "Instant",
          status: true,
          sortOrder: 1,
        },
        {
          type: "KHALTI",
          title: "Khalti",
          details: {
            walletId: "9801111111",
          },
          minimumDeposit: 200,
          maximumDeposit: 100000,
          processingTime: "Instant",
          status: true,
          sortOrder: 2,
        },
      ],
    },

    // ===================== DUBAI / UAE =====================
    {
      country: "DUBAI",
      countryName: "Dubai",
      currency: "AED",
      methods: [
        {
          type: "BANK",
          title: "Bank Transfer",
          details: {
            bankName: "Emirates NBD",
            accountName: "Winzox UAE",
            iban: "AE070331234567890123456",
          },
          minimumDeposit: 50,
          maximumDeposit: 50000,
          processingTime: "10-30 Minutes",
          status: true,
          sortOrder: 1,
        },
        {
          type: "PAYPAL",
          title: "PayPal",
          details: {
            email: "payments@winzox.ae",
          },
          minimumDeposit: 20,
          maximumDeposit: 10000,
          processingTime: "Instant",
          status: true,
          sortOrder: 2,
        },
      ],
    },
  ]);

  console.log("✅ Deposit Settings Seeded Successfully");
};

module.exports = seedDepositSettings;