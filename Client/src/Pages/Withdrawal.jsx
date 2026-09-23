// pages/Withdrawal.jsx
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  CreditCard,
  Gem,
  Gift,
  History,
  Loader2,
  Mail,
  Phone,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Import from withdrawal slice
import { showErrorToast } from "../hooks/toast";
import {
  clearWithdrawalError,
  clearWithdrawalSuccess,
  fetchWithdrawalHistory,
  fetchWithdrawalSettings,
  requestWithdrawal,
  selectCurrentWithdrawal,
  selectHistoryLoading,
  selectPagination,
  selectRequestError,
  selectRequestLoading,
  selectRequestSuccess,
  selectSettingsError,
  selectSettingsLoading,
  selectSummary,
  selectWithdrawalError,
  selectWithdrawalHistory,
  selectWithdrawalMessage,
  selectWithdrawalSettings,
} from "../redux/slices/withdrawalSlice";

const Withdrawal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Redux state
  const settings = useSelector(selectWithdrawalSettings);
  const settingsLoading = useSelector(selectSettingsLoading);
  const settingsError = useSelector(selectSettingsError);
  const withdrawalHistory = useSelector(selectWithdrawalHistory);
  const historyLoading = useSelector(selectHistoryLoading);
  const summary = useSelector(selectSummary);
  const pagination = useSelector(selectPagination);
  const requestLoading = useSelector(selectRequestLoading);
  const requestError = useSelector(selectRequestError);
  const requestSuccess = useSelector(selectRequestSuccess);
  const currentWithdrawal = useSelector(selectCurrentWithdrawal);
  const error = useSelector(selectWithdrawalError);
  const message = useSelector(selectWithdrawalMessage);

  // Local state
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "",
    bankDetails: {
      accountNumber: "",
      accountHolderName: "",
      bankName: "",
      ifscCode: "",
      branchName: "",
    },
    upiDetails: {
      upiId: "",
      upiName: "",
    },
    paypalDetails: {
      email: "",
    },
    cryptoDetails: {
      walletAddress: "",
      network: "BTC",
    },
  });

  const [formErrors, setFormErrors] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [fee, setFee] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch withdrawal settings and history
  useEffect(() => {
    dispatch(fetchWithdrawalSettings());
    dispatch(fetchWithdrawalHistory());
  }, [dispatch]);

  // Handle success state
  useEffect(() => {
    if (requestSuccess && currentWithdrawal) {
      setShowSuccessModal(true);
      setFormData((prev) => ({
        ...prev,
        amount: "",
      }));
      setFee(0);
      setNetAmount(0);
      dispatch(fetchWithdrawalHistory());
      setTimeout(() => {
        setShowSuccessModal(false);
        dispatch(clearWithdrawalSuccess());
      }, 5000);
    }
  }, [requestSuccess, currentWithdrawal, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showErrorToast("Withdrawal Failed", error);
      dispatch(clearWithdrawalError());
    }
    if (requestError) {
      showErrorToast("Withdrawal Failed", requestError);
      dispatch(clearWithdrawalError());
    }
    if (settingsError) {
      showErrorToast("Settings Error", settingsError);
      dispatch(clearWithdrawalError());
    }
  }, [error, requestError, settingsError, dispatch]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "amount") {
      calculateFeeAndNet(value, formData.paymentMethod);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
    setSelectedPaymentMethod(method);
    setFormErrors({});
    calculateFeeAndNet(formData.amount, method);
  };

  const calculateFeeAndNet = (amount, method) => {
    if (!amount || !settings) {
      setFee(0);
      setNetAmount(0);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFee(0);
      setNetAmount(0);
      return;
    }

    let calculatedFee = 0;
    if (settings.processingFeeType === "percentage") {
      calculatedFee = (numAmount * settings.processingFee) / 100;
    } else {
      calculatedFee = settings.processingFee || 0;
    }

    setFee(calculatedFee);
    setNetAmount(numAmount - calculatedFee);
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.amount) {
      errors.amount = "Please enter withdrawal amount";
    } else if (parseFloat(formData.amount) < settings?.minWithdrawal) {
      errors.amount = `Minimum withdrawal amount is ${currencySymbol}${settings?.minWithdrawal}`;
    } else if (parseFloat(formData.amount) > settings?.maxWithdrawal) {
      errors.amount = `Maximum withdrawal amount is ${currencySymbol}${settings?.maxWithdrawal}`;
    } else if (parseFloat(formData.amount) > user?.credit) {
      errors.amount = `Insufficient credit. Available: ${currencySymbol}${user?.credit}`;
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = "Please select a payment method";
    }

    const method = formData.paymentMethod;
    if (method === "bank_transfer") {
      if (!formData.bankDetails.accountNumber) {
        errors["bankDetails.accountNumber"] = "Account number is required";
      }
      if (!formData.bankDetails.accountHolderName) {
        errors["bankDetails.accountHolderName"] =
          "Account holder name is required";
      }
      if (!formData.bankDetails.bankName) {
        errors["bankDetails.bankName"] = "Bank name is required";
      }
      if (!formData.bankDetails.ifscCode) {
        errors["bankDetails.ifscCode"] = "IFSC code is required";
      }
    } else if (["upi", "phonepe", "googlepay", "paytm"].includes(method)) {
      if (!formData.upiDetails.upiId) {
        errors["upiDetails.upiId"] = "UPI ID is required";
      }
      if (!formData.upiDetails.upiName) {
        errors["upiDetails.upiName"] = "UPI holder name is required";
      }
    } else if (["paypal", "skrill", "neteller"].includes(method)) {
      if (!formData.paypalDetails.email) {
        errors["paypalDetails.email"] = "Email address is required";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalDetails.email)
      ) {
        errors["paypalDetails.email"] = "Please enter a valid email address";
      }
    } else if (method === "crypto") {
      if (!formData.cryptoDetails.walletAddress) {
        errors["cryptoDetails.walletAddress"] = "Wallet address is required";
      }
      if (!formData.cryptoDetails.network) {
        errors["cryptoDetails.network"] = "Network is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit withdrawal using Redux
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const withdrawalData = {
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
    };

    const method = formData.paymentMethod;
    if (method === "bank_transfer") {
      withdrawalData.bankDetails = formData.bankDetails;
    } else if (["upi", "phonepe", "googlepay", "paytm"].includes(method)) {
      withdrawalData.upiDetails = formData.upiDetails;
    } else if (["paypal", "skrill", "neteller"].includes(method)) {
      withdrawalData.paypalDetails = formData.paypalDetails;
    } else if (method === "crypto") {
      withdrawalData.cryptoDetails = formData.cryptoDetails;
    }

    dispatch(requestWithdrawal(withdrawalData));
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "bg-[#F1C40F]/15 text-[#F1C40F] border border-[#F1C40F]/30",
      processing: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
      completed: "bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30",
      failed: "bg-red-500/15 text-red-400 border border-red-500/30",
      cancelled: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
      rejected: "bg-red-500/15 text-red-400 border border-red-500/30",
    };
    return (
      statusMap[status] ||
      "bg-gray-500/15 text-gray-400 border border-gray-500/30"
    );
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      bank_transfer: <Building2 size={16} />,
      upi: <Phone size={16} />,
      phonepe: <Phone size={16} />,
      googlepay: <Phone size={16} />,
      paytm: <Phone size={16} />,
      paypal: <Mail size={16} />,
      skrill: <Mail size={16} />,
      neteller: <Mail size={16} />,
      crypto: <CreditCard size={16} />,
    };
    return icons[method] || <CreditCard size={16} />;
  };

  // Get payment method display name
  const getPaymentMethodName = (method) => {
    const names = {
      bank_transfer: "Bank Transfer",
      upi: "UPI",
      phonepe: "PhonePe",
      googlepay: "Google Pay",
      paytm: "Paytm",
      paypal: "PayPal",
      skrill: "Skrill",
      neteller: "Neteller",
      crypto: "Cryptocurrency",
    };
    return names[method] || method;
  };

  // ======================================================
  // CURRENCY SYMBOL
  // Same country-based currency logic used by WalletDashboard
  // ======================================================

  const getCurrencySymbol = () => {
    const country = String(user?.country || "")
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

    const countryCode = countryAliases[country] || country.toUpperCase();

    const currencyMap = {
      IN: "₹",
      NP: "रू",
      AU: "A$",
      PK: "₨",
      BD: "৳",
      AE: "د.إ",
      CA: "C$",
      US: "$",
      GB: "£",
      NZ: "NZ$",
      SG: "S$",
      MY: "RM",
      PH: "₱",
      JP: "¥",
      CN: "¥",
      TH: "฿",
      ID: "Rp",
      VN: "₫",
      TR: "₺",
      SA: "﷼",
      ZA: "R",
      NG: "₦",
      KE: "KSh",
      BR: "R$",
      MX: "MX$",
      DE: "€",
      FR: "€",
      IT: "€",
      ES: "€",
    };

    return currencyMap[countryCode] || "₹";
  };

  const currencySymbol = getCurrencySymbol();

  // Format currency
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return `${currencySymbol}0.00`;
    }

    return `${currencySymbol}${numericAmount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-[#0B0410] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#2a1b3d] border-t-[#B45CFF] rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-[#B45CFF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading withdrawal settings...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (settingsError && !settings) {
    return (
      <div className="min-h-screen bg-[#0B0410] flex items-center justify-center p-4">
        <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-8 max-w-md w-full text-center border border-[#2a1b3d]">
          <div className="w-20 h-20 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Withdrawal Not Available
          </h2>
          <p className="text-gray-400 mb-6">
            {settingsError ||
              "Withdrawal settings are not configured for your country. Please contact support."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-bold rounded-xl transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0410] py-4 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Premium */}
        <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-4 sm:p-6 mb-4 sm:mb-6 border border-[#2a1b3d] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#9B59B6]/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#8E44AD]/10 rounded-full blur-2xl"></div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[#2a1b3d] rounded-xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft size={20} className="text-gray-300" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  Withdraw Funds
                  <span className="text-[10px] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] text-white px-2 py-0.5 rounded-full font-normal">
                    Secure
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Withdraw your winnings securely & instantly
                </p>
              </div>
            </div>

            {/* credit Card */}
            <div className="w-full sm:w-auto bg-[#12061C] px-4 sm:px-6 py-3 rounded-xl border border-[#9B59B6]/40 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#9B59B6]/20 rounded-lg border border-[#9B59B6]/30">
                  <Wallet className="text-[#9B59B6]" size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    Available credit
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#9B59B6]">
                    {formatCurrency(user?.credit || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-4 sm:p-6 border border-[#2a1b3d]">
              <form onSubmit={handleSubmit}>
                {/* Withdrawal Limits Info - Premium */}
                <div className="bg-[#12061C] rounded-xl p-4 mb-6 border border-[#9B59B6]/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#9B59B6]/20 rounded-lg border border-[#9B59B6]/30">
                      <Shield className="text-[#9B59B6]" size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        Withdrawal Limits
                        <Zap className="w-3 h-3 text-[#B45CFF]" />
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        <div className="bg-[#1C0F2B] rounded-lg px-3 py-1.5 border border-[#2a1b3d]">
                          <p className="text-[10px] text-gray-500">Min</p>
                          <p className="text-sm font-bold text-gray-200">
                            {formatCurrency(settings?.minWithdrawal || 0)}
                          </p>
                        </div>
                        <div className="bg-[#1C0F2B] rounded-lg px-3 py-1.5 border border-[#2a1b3d]">
                          <p className="text-[10px] text-gray-500">Max</p>
                          <p className="text-sm font-bold text-gray-200">
                            {formatCurrency(settings?.maxWithdrawal || 0)}
                          </p>
                        </div>
                        {settings?.dailyLimit && (
                          <div className="bg-[#1C0F2B] rounded-lg px-3 py-1.5 border border-[#2a1b3d]">
                            <p className="text-[10px] text-gray-500">
                              Daily Limit
                            </p>
                            <p className="text-sm font-bold text-gray-200">
                              {formatCurrency(settings.dailyLimit)}
                            </p>
                          </div>
                        )}
                        {settings?.processingFee > 0 && (
                          <div className="bg-[#1C0F2B] rounded-lg px-3 py-1.5 border border-[#2a1b3d]">
                            <p className="text-[10px] text-gray-500">Fee</p>
                            <p className="text-sm font-bold text-[#F1C40F]">
                              {settings.processingFeeType === "percentage"
                                ? `${settings.processingFee}%`
                                : formatCurrency(settings.processingFee)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Input - Premium */}
                <div className="mb-5">
                  <label className="text-sm font-bold text-gray-200 block mb-2">
                    Withdrawal Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                      {currencySymbol}
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder={`Enter amount (min: ${settings?.minWithdrawal || 0})`}
                      className={`w-full pl-10 pr-4 py-3.5 text-lg bg-[#12061C] text-white border-2 rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all ${
                        formErrors.amount
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-[#2a1b3d] hover:border-[#9B59B6]/40"
                      }`}
                      step="0.01"
                      min={settings?.minWithdrawal || 0}
                      max={settings?.maxWithdrawal || 0}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1 error-message">
                      <AlertCircle size={14} /> {formErrors.amount}
                    </p>
                  )}

                  {/* Fee and Net Amount Display - Premium */}
                  {formData.amount && parseFloat(formData.amount) > 0 && (
                    <div className="mt-3 p-4 bg-[#12061C] rounded-xl border border-[#2a1b3d]">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-[10px] text-gray-500">
                              Withdrawal
                            </p>
                            <p className="text-sm font-bold text-gray-200">
                              {formatCurrency(parseFloat(formData.amount))}
                            </p>
                          </div>
                          {fee > 0 && (
                            <>
                              <div className="hidden sm:block w-px h-8 bg-[#2a1b3d]"></div>
                              <div>
                                <p className="text-[10px] text-gray-500">Fee</p>
                                <p className="text-sm font-bold text-red-400">
                                  -{formatCurrency(fee)}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 bg-[#9B59B6]/10 px-4 py-2 rounded-lg border border-[#9B59B6]/30">
                          <Coins className="w-4 h-4 text-[#9B59B6]" />
                          <div>
                            <p className="text-[10px] text-gray-400">
                              Net Amount
                            </p>
                            <p className="text-base font-bold text-[#9B59B6]">
                              {formatCurrency(netAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method Selection - Premium */}
                <div className="mb-5">
                  <label className="text-sm font-bold text-gray-200 block mb-3">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {settings?.paymentMethods?.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handlePaymentMethodChange(method)}
                        className={`p-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                          selectedPaymentMethod === method
                            ? "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white scale-105"
                            : "border border-[#2a1b3d] bg-[#12061C] text-gray-400 hover:border-[#9B59B6]/50 hover:bg-[#2a1b3d]/50 hover:scale-105"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={`p-1.5 rounded-lg ${
                              selectedPaymentMethod === method
                                ? "bg-white/20 text-white"
                                : "bg-[#1C0F2B] text-gray-500 border border-[#2a1b3d]"
                            }`}
                          >
                            {getPaymentMethodIcon(method)}
                          </div>
                          <span className="text-[10px] sm:text-xs">
                            {getPaymentMethodName(method)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {formErrors.paymentMethod && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.paymentMethod}
                    </p>
                  )}
                </div>

                {/* Dynamic Payment Method Fields - Premium */}
                {selectedPaymentMethod && (
                  <div className="animate-fadeIn">
                    {/* Bank Transfer */}
                    {selectedPaymentMethod === "bank_transfer" && (
                      <div className="bg-[#12061C] p-4 sm:p-5 rounded-xl border border-[#2a1b3d]">
                        <h4 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                          <Building2 size={18} className="text-[#9B59B6]" />
                          Bank Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              Account Holder Name *
                            </label>
                            <input
                              type="text"
                              name="bankDetails.accountHolderName"
                              value={formData.bankDetails.accountHolderName}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                              placeholder="Enter account holder name"
                            />
                            {formErrors["bankDetails.accountHolderName"] && (
                              <p className="text-red-400 text-xs mt-1">
                                {formErrors["bankDetails.accountHolderName"]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              Account Number *
                            </label>
                            <input
                              type="text"
                              name="bankDetails.accountNumber"
                              value={formData.bankDetails.accountNumber}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                              placeholder="Enter account number"
                            />
                            {formErrors["bankDetails.accountNumber"] && (
                              <p className="text-red-400 text-xs mt-1">
                                {formErrors["bankDetails.accountNumber"]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              Bank Name *
                            </label>
                            <input
                              type="text"
                              name="bankDetails.bankName"
                              value={formData.bankDetails.bankName}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                              placeholder="Enter bank name"
                            />
                            {formErrors["bankDetails.bankName"] && (
                              <p className="text-red-400 text-xs mt-1">
                                {formErrors["bankDetails.bankName"]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              IFSC Code *
                            </label>
                            <input
                              type="text"
                              name="bankDetails.ifscCode"
                              value={formData.bankDetails.ifscCode}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                              placeholder="Enter IFSC code"
                              maxLength="11"
                            />
                            {formErrors["bankDetails.ifscCode"] && (
                              <p className="text-red-400 text-xs mt-1">
                                {formErrors["bankDetails.ifscCode"]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              Branch Name (Optional)
                            </label>
                            <input
                              type="text"
                              name="bankDetails.branchName"
                              value={formData.bankDetails.branchName}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                              placeholder="Enter branch name"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI */}
                    {["upi", "phonepe", "googlepay", "paytm"].includes(
                      selectedPaymentMethod,
                    ) && (
                      <div className="bg-[#12061C] p-4 sm:p-5 rounded-xl border border-[#2a1b3d]">
                        <h4 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                          <Phone size={18} className="text-[#9B59B6]" />
                          {getPaymentMethodName(selectedPaymentMethod)} Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              UPI ID *
                            </label>
                            <input
                              type="text"
                              name="upiDetails.upiId"
                              value={formData.upiDetails.upiId}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                              placeholder="e.g., user@paytm"
                            />
                            {formErrors["upiDetails.upiId"] && (
                              <p className="text-red-400 text-xs mt-1">
                                {formErrors["upiDetails.upiId"]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              UPI Holder Name *
                            </label>
                            <input
                              type="text"
                              name="upiDetails.upiName"
                              value={formData.upiDetails.upiName}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                              placeholder="Enter UPI holder name"
                            />
                            {formErrors["upiDetails.upiName"] && (
                              <p className="text-red-400 text-xs mt-1">
                                {formErrors["upiDetails.upiName"]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal, Skrill, Neteller */}
                    {["paypal", "skrill", "neteller"].includes(
                      selectedPaymentMethod,
                    ) && (
                      <div className="bg-[#12061C] p-4 sm:p-5 rounded-xl border border-[#2a1b3d]">
                        <h4 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                          <Mail size={18} className="text-[#9B59B6]" />
                          {getPaymentMethodName(selectedPaymentMethod)} Details
                        </h4>
                        <div>
                          <label className="text-xs text-gray-400 font-medium block mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="paypalDetails.email"
                            value={formData.paypalDetails.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                            placeholder="Enter email address"
                          />
                          {formErrors["paypalDetails.email"] && (
                            <p className="text-red-400 text-xs mt-1">
                              {formErrors["paypalDetails.email"]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Crypto */}
                    {selectedPaymentMethod === "crypto" && (
                      <div className="bg-[#12061C] p-4 sm:p-5 rounded-xl border border-[#2a1b3d]">
                        <h4 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                          <CreditCard size={18} className="text-[#9B59B6]" />
                          Cryptocurrency Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              Network *
                            </label>
                            <select
                              name="cryptoDetails.network"
                              value={formData.cryptoDetails.network}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                            >
                              <option value="BTC">Bitcoin (BTC)</option>
                              <option value="ETH">Ethereum (ETH)</option>
                              <option value="USDT">Tether (USDT)</option>
                              <option value="BSC">Binance Smart Chain</option>
                              <option value="SOL">Solana</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-medium block mb-1">
                              Wallet Address *
                            </label>
                            <input
                              type="text"
                              name="cryptoDetails.walletAddress"
                              value={formData.cryptoDetails.walletAddress}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-[#1C0F2B] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all"
                              placeholder="Enter wallet address"
                            />
                            {formErrors["cryptoDetails.walletAddress"] && (
                              <p className="text-red-400 text-xs mt-1">
                                {formErrors["cryptoDetails.walletAddress"]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button - Premium */}
                <button
                  type="submit"
                  disabled={requestLoading || !selectedPaymentMethod}
                  className={`w-full mt-6 py-3.5 font-bold rounded-xl transition-all duration-300 text-base ${
                    requestLoading || !selectedPaymentMethod
                      ? "bg-[#2a1b3d] text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white active:scale-[0.98]"
                  }`}
                >
                  {requestLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="animate-spin" size={20} />
                      Processing Withdrawal...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Gem className="w-4 h-4" />
                      Request Withdrawal ({formatCurrency(netAmount || 0)})
                    </span>
                  )}
                </button>

                {/* Processing Time Info */}
                {settings?.processingTime && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 bg-[#12061C] py-2 rounded-lg border border-[#2a1b3d]">
                    <Clock size={14} className="text-[#9B59B6]" />
                    <span>
                      Processing time:{" "}
                      <strong className="text-gray-200">
                        {settings.processingTime}
                      </strong>
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar - Premium */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Stats */}
            <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-4 sm:p-5 border border-[#2a1b3d]">
              <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#9B59B6]" />
                Withdrawal Summary
              </h3>
              {summary && summary.length > 0 ? (
                <div className="space-y-2">
                  {summary.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center p-2 bg-[#12061C] rounded-lg border border-[#2a1b3d]"
                    >
                      <span className="text-sm text-gray-400 capitalize flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item._id === "pending"
                              ? "bg-[#F1C40F]"
                              : item._id === "processing"
                                ? "bg-blue-400"
                                : item._id === "completed"
                                  ? "bg-[#00E676]"
                                  : "bg-gray-400"
                          }`}
                        ></div>
                        {item._id}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {item.count} ({formatCurrency(item.totalAmount)})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No withdrawals yet
                </p>
              )}
            </div>

            {/* Quick Actions - Withdrawal History */}
            <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-4 sm:p-5 border border-[#2a1b3d]">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between p-2 hover:bg-[#2a1b3d]/50 rounded-xl transition-all duration-300"
              >
                <span className="flex items-center gap-2 text-gray-200 font-medium">
                  <History size={18} className="text-[#9B59B6]" />
                  <span>Withdrawal History</span>
                </span>
                {showHistory ? (
                  <ChevronUp size={18} className="text-[#9B59B6]" />
                ) : (
                  <ChevronDown size={18} className="text-[#9B59B6]" />
                )}
              </button>

              {showHistory && (
                <div className="mt-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {historyLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2
                        className="animate-spin text-[#9B59B6]"
                        size={24}
                      />
                    </div>
                  ) : withdrawalHistory && withdrawalHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6">
                      No withdrawal history
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {withdrawalHistory?.slice(0, 5).map((item) => (
                        <div
                          key={item._id}
                          className="border border-[#2a1b3d] bg-[#12061C] rounded-xl p-3 hover:border-[#9B59B6]/50 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-white">
                                {formatCurrency(item.amount)}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                {getPaymentMethodIcon(item.paymentMethod)}
                                <span>
                                  {getPaymentMethodName(item.paymentMethod)}
                                </span>
                              </p>
                            </div>
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${getStatusBadge(item.status)}`}
                            >
                              {item.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(item.requestedAt)}
                          </p>
                        </div>
                      ))}
                      {withdrawalHistory?.length > 5 && (
                        <button className="w-full text-center text-xs text-[#9B59B6] font-medium hover:underline py-2">
                          View All ({withdrawalHistory.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Support - Premium */}
            <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-4 sm:p-5 border border-[#2a1b3d]">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#9B59B6]/15 rounded-xl border border-[#9B59B6]/30">
                  <Gift size={18} className="text-[#9B59B6]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 text-sm">
                    Need Help?
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Contact our support team for assistance with your
                    withdrawal.
                  </p>
                  <button
                    onClick={() => navigate("/support")}
                    className="text-xs text-[#9B59B6] font-bold hover:text-[#B45CFF] mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Contact Support →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal - Premium */}
      {showSuccessModal && currentWithdrawal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1C0F2B] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.7)] border border-[#2a1b3d] animate-scaleIn">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#00E676]/15 rounded-full flex items-center justify-center mx-auto mb-4 relative border border-[#00E676]/30">
                <CheckCircle className="text-[#00E676]" size={36} />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] rounded-full flex items-center justify-center border border-[#C77AFF]">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {currentWithdrawal.status === "completed"
                  ? "🎉 Withdrawal Successful!"
                  : "✅ Withdrawal Request Submitted!"}
              </h3>
              <p className="text-gray-400 mb-6 text-sm">
                {currentWithdrawal.status === "completed"
                  ? "Your withdrawal has been processed successfully."
                  : `Your withdrawal request has been submitted and will be processed within ${settings?.processingTime || "24-48 hours"}.`}
              </p>

              <div className="bg-[#12061C] rounded-xl p-4 mb-6 border border-[#2a1b3d]">
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(
                      currentWithdrawal.withdrawal?.amount ||
                        currentWithdrawal.amount,
                    )}
                  </span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between text-sm py-1.5 border-t border-[#2a1b3d]">
                    <span className="text-gray-400">Fee:</span>
                    <span className="text-red-400 font-bold">
                      -{formatCurrency(fee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm py-1.5 border-t border-[#2a1b3d] font-bold">
                  <span className="text-gray-200">Net Amount:</span>
                  <span className="text-[#9B59B6]">
                    {formatCurrency(netAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-t border-[#2a1b3d]">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-bold capitalize ${
                      currentWithdrawal.status === "completed"
                        ? "text-[#00E676]"
                        : "text-[#F1C40F]"
                    }`}
                  >
                    {currentWithdrawal.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(clearWithdrawalSuccess());
                  navigate("/dashboard");
                }}
                className="w-full py-3 bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-bold rounded-xl active:scale-[0.98] transition-all duration-300"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #12061C;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9B59B6;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B45CFF;
        }
      `}</style>
    </div>
  );
};

export default Withdrawal;
