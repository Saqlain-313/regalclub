import {
  AlertCircle,
  ArrowRight,
  Clock,
  CreditCard,
  Landmark,
  QrCode,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDepositMethods } from "../redux/slices/depositSlice";

const normalizeCountryCode = (country) => {
  const value = String(country || "")
    .trim()
    .toLowerCase();

  const countryAliases = {
    in: "IN",
    india: "IN",
    au: "AU",
    australia: "AU",
    pk: "PK",
    pakistan: "PK",
    bd: "BD",
    bangladesh: "BD",
    np: "NP",
    nepal: "NP",
    ae: "AE",
    uae: "AE",
    dubai: "AE",
    "united arab emirates": "AE",
    ca: "CA",
    canada: "CA",
    us: "US",
    usa: "US",
    "united states": "US",
    gb: "GB",
    uk: "GB",
    "united kingdom": "GB",
    nz: "NZ",
    "new zealand": "NZ",
    sg: "SG",
    singapore: "SG",
    my: "MY",
    malaysia: "MY",
    ph: "PH",
    philippines: "PH",
    jp: "JP",
    japan: "JP",
    cn: "CN",
    china: "CN",
    th: "TH",
    thailand: "TH",
    id: "ID",
    indonesia: "ID",
    vn: "VN",
    vietnam: "VN",
    tr: "TR",
    turkey: "TR",
    sa: "SA",
    "saudi arabia": "SA",
    za: "ZA",
    "south africa": "ZA",
    ng: "NG",
    nigeria: "NG",
    ke: "KE",
    kenya: "KE",
    br: "BR",
    brazil: "BR",
    mx: "MX",
    mexico: "MX",
    de: "DE",
    germany: "DE",
    fr: "FR",
    france: "FR",
    it: "IT",
    italy: "IT",
    es: "ES",
    spain: "ES",
  };

  return countryAliases[value] || value.toUpperCase() || "IN";
};

const getPresetAmounts = (countryCode) => {
  const presets = {
    IN: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    NP: [200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    PK: [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000],
    BD: [200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    AU: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    CA: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    US: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    GB: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    NZ: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    SG: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    MY: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    PH: [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000],
    JP: [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000],
    CN: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    TH: [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000],
    ID: [
      20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000,
    ],
    VN: [
      50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000,
      20000000,
    ],
    TR: [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000],
    AE: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000],
    SA: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    ZA: [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000],
    NG: [5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000],
    KE: [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000],
    BR: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    MX: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    DE: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    FR: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    IT: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    ES: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
  };

  return presets[countryCode] || presets.IN;
};

// ======================================================
// CURRENCY SYMBOL CONFIGURATION
// ======================================================

const getCurrencyConfig = (countryCode) => {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  const config = {
    IN: { symbol: "₹", code: "INR", locale: "en-IN", name: "Indian Rupee" },
    NP: { symbol: "रू", code: "NPR", locale: "ne-NP", name: "Nepali Rupee" },
    AU: {
      symbol: "A$",
      code: "AUD",
      locale: "en-AU",
      name: "Australian Dollar",
    },
    PK: { symbol: "₨", code: "PKR", locale: "en-PK", name: "Pakistani Rupee" },
    BD: { symbol: "৳", code: "BDT", locale: "en-BD", name: "Bangladeshi Taka" },
    AE: { symbol: "د.إ", code: "AED", locale: "ar-AE", name: "UAE Dirham" },
    CA: { symbol: "C$", code: "CAD", locale: "en-CA", name: "Canadian Dollar" },
    US: { symbol: "$", code: "USD", locale: "en-US", name: "US Dollar" },
    GB: { symbol: "£", code: "GBP", locale: "en-GB", name: "British Pound" },
    NZ: {
      symbol: "NZ$",
      code: "NZD",
      locale: "en-NZ",
      name: "New Zealand Dollar",
    },
    SG: {
      symbol: "S$",
      code: "SGD",
      locale: "en-SG",
      name: "Singapore Dollar",
    },
    MY: {
      symbol: "RM",
      code: "MYR",
      locale: "ms-MY",
      name: "Malaysian Ringgit",
    },
    PH: { symbol: "₱", code: "PHP", locale: "en-PH", name: "Philippine Peso" },
    JP: { symbol: "¥", code: "JPY", locale: "ja-JP", name: "Japanese Yen" },
    CN: { symbol: "¥", code: "CNY", locale: "zh-CN", name: "Chinese Yuan" },
    TH: { symbol: "฿", code: "THB", locale: "th-TH", name: "Thai Baht" },
    ID: {
      symbol: "Rp",
      code: "IDR",
      locale: "id-ID",
      name: "Indonesian Rupiah",
    },
    VN: { symbol: "₫", code: "VND", locale: "vi-VN", name: "Vietnamese Dong" },
    TR: { symbol: "₺", code: "TRY", locale: "tr-TR", name: "Turkish Lira" },
    SA: { symbol: "﷼", code: "SAR", locale: "ar-SA", name: "Saudi Riyal" },
    ZA: {
      symbol: "R",
      code: "ZAR",
      locale: "en-ZA",
      name: "South African Rand",
    },
    NG: { symbol: "₦", code: "NGN", locale: "en-NG", name: "Nigerian Naira" },
    KE: {
      symbol: "KSh",
      code: "KES",
      locale: "en-KE",
      name: "Kenyan Shilling",
    },
    BR: { symbol: "R$", code: "BRL", locale: "pt-BR", name: "Brazilian Real" },
    MX: { symbol: "MX$", code: "MXN", locale: "es-MX", name: "Mexican Peso" },
    DE: { symbol: "€", code: "EUR", locale: "de-DE", name: "Euro" },
    FR: { symbol: "€", code: "EUR", locale: "fr-FR", name: "Euro" },
    IT: { symbol: "€", code: "EUR", locale: "it-IT", name: "Euro" },
    ES: { symbol: "€", code: "EUR", locale: "es-ES", name: "Euro" },
    default: {
      symbol: "₹",
      code: "INR",
      locale: "en-IN",
      name: "Indian Rupee",
    },
  };

  return config[normalizedCountryCode] || config.default;
};

// ======================================================
// COMPONENT
// ======================================================

const Deposit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { methods, loading } = useSelector((state) => state.deposit);
  const { user } = useSelector((state) => state.auth);

  // ======================================================
  // CURRENCY CONFIG
  // ======================================================

  const countryCode = normalizeCountryCode(user?.country || "IN");
  const currencyConfig = getCurrencyConfig(countryCode);
  const currencySymbol = currencyConfig.symbol;
  const locale = currencyConfig.locale;
  const presetAmounts = getPresetAmounts(countryCode);

  // ======================================================
  // STATE
  // ======================================================

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // FORMAT CURRENCY
  // ======================================================

  const formatCurrency = (value) => {
    if (!value) return `${currencySymbol}0`;
    const num = parseFloat(value);
    if (isNaN(num)) return `${currencySymbol}0`;
    return `${currencySymbol}${num.toLocaleString(locale)}`;
  };

  // ======================================================
  // EFFECTS
  // ======================================================

  useEffect(() => {
    dispatch(getDepositMethods());
  }, [dispatch]);

  // ======================================================
  // VALIDATION
  // ======================================================

  const validateAmount = (value, method) => {
    const num = parseFloat(value);
    if (!value || value === "") return `Please enter an amount`;
    if (isNaN(num) || num <= 0) return `Please enter a valid amount`;
    if (method) {
      const min = parseFloat(method.minimumDeposit);
      const max = parseFloat(method.maximumDeposit);
      if (num < min) return `Minimum amount is ${formatCurrency(min)}`;
      if (num > max) return `Maximum amount is ${formatCurrency(max)}`;
    }
    return "";
  };

  // ======================================================
  // HANDLERS
  // ======================================================

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (touched) setError(validateAmount(amount, method));
  };

  const handlePresetClick = (value) => {
    setAmount(String(value));
    setTouched(true);
    setError(validateAmount(String(value), selectedMethod));
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    if (touched) setError(validateAmount(value, selectedMethod));
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateAmount(amount, selectedMethod));
  };

  // ======================================================
  // ICON
  // ======================================================

  const getMethodIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "bank":
        return <Landmark className="w-4 h-4" />;
      case "upi":
        return <QrCode className="w-4 h-4" />;
      case "card":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  // ======================================================
  // PROCEED
  // ======================================================

  const proceedHandler = () => {
    const amountError = validateAmount(amount, selectedMethod);
    setTouched(true);
    setError(amountError);

    if (!selectedMethod) {
      toast.error("Please select a payment method first");
      return;
    }
    if (amountError) {
      toast.error(amountError);
      return;
    }

    navigate("/deposit/payment", {
      state: { method: selectedMethod, amount },
    });
  };

  const canProceed = selectedMethod && amount && !error;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="relative min-h-screen bg-[#0B0410] overflow-hidden">
      {/* Decorative background orbs (Purple) */}
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-64 h-64 bg-[#8E44AD]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 bg-[#9B59B6]/10 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 py-6">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#9B59B6]/10 border border-[#9B59B6]/40 rounded-full">
              <span className="text-[10px] font-medium text-[#9B59B6]">
                Currency: {currencySymbol} {currencyConfig.code}
              </span>
            </div>
          </div>

          {/* ============================================= */}
          {/* AMOUNT SECTION — pehle */}
          {/* ============================================= */}
          <div className="bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Amount ({currencySymbol})
            </h3>

            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {presetAmounts.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handlePresetClick(val)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    String(amount) === String(val)
                      ? "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white"
                      : "bg-[#12061C] text-gray-300 border border-[#2a1b3d] hover:border-[#9B59B6]/50 hover:bg-[#2a1b3d]/50"
                  }`}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>

            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Custom amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                {currencySymbol}
              </span>
              <input
                type="number"
                className={`w-full rounded-xl border p-3 pl-8 text-sm text-white bg-[#12061C] transition focus:outline-none focus:ring-2 ${
                  touched && error
                    ? "border-red-500/50 focus:ring-red-500/20 bg-red-500/5"
                    : touched && !error && amount
                      ? "border-[#00E676]/50 focus:ring-[#00E676]/20 bg-[#00E676]/5"
                      : "border-[#2a1b3d] focus:ring-[#9B59B6]/20 focus:border-[#9B59B6]/50"
                }`}
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleBlur}
                placeholder={`Enter amount in ${currencyConfig.code}`}
                step="0.01"
                min="0"
              />
            </div>
            {touched && error && (
              <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          {/* ============================================= */}
          {/* PAYMENT METHOD — radio style — Amount ke neeche */}
          {/* ============================================= */}
          <div className="mt-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Payment Method
              </h3>
              {!selectedMethod && (
                <span className="text-[10px] font-semibold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                  Required
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {methods?.map((item) => {
                const isSelected = selectedMethod?.title === item.title;

                return (
                  <button
                    type="button"
                    key={item.title}
                    onClick={() => handleMethodSelect(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#B45CFF]/10 via-[#7418F5]/10 to-[#3A00C9]/10 border-[#B45CFF] shadow-[0_0_12px_rgba(180,92,255,0.35)]"
                        : "border-[#2a1b3d] bg-[#12061C] hover:border-[#9B59B6]/50 hover:bg-[#2a1b3d]/50"
                    }`}
                  >
                    {/* 👇 RADIO BUTTON */}
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                        isSelected
                          ? "border-[#B45CFF] bg-[#0B0410]"
                          : "border-[#3a2a4d] bg-[#0B0410]"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9]" />
                      )}
                    </span>

                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] text-white"
                          : "bg-[#1C0F2B] text-gray-400 border border-[#2a1b3d]"
                      }`}
                    >
                      {getMethodIcon(item.type)}
                    </div>

                    {/* Title + Time */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {item.processingTime}
                      </p>
                    </div>

                    {/* Limit info (right side) */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-[10px] text-gray-500">Limit</p>
                      <p className="text-[10px] font-medium text-gray-300">
                        {formatCurrency(item.minimumDeposit)} -{" "}
                        {formatCurrency(item.maximumDeposit)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================= */}
          {/* PROCEED BUTTON — sabse neeche */}
          {/* ============================================= */}
          <div className="mt-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 font-medium">
                You'll deposit
              </span>
              <span className="text-xl font-bold text-white">
                {amount ? formatCurrency(amount) : `${currencySymbol}0`}
              </span>
            </div>
            <button
              type="button"
              disabled={loading || !canProceed}
              onClick={proceedHandler}
              className={`w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-1.5 ${
                loading || !canProceed
                  ? "bg-[#2a1b3d] text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white active:scale-[0.98]"
              }`}
            >
              Proceed to Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
