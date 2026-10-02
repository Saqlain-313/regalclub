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

import { showErrorToast } from "../hooks/toast";
import {
  clearWithdrawalError,
  clearWithdrawalSuccess,
  fetchWithdrawalEligibility,
  fetchWithdrawalHistory,
  fetchWithdrawalSettings,
  requestWithdrawal,
  selectCurrentWithdrawal,
  selectEligibilityLoading,
  selectHistoryLoading,
  selectPagination,
  selectRequestError,
  selectRequestLoading,
  selectRequestSuccess,
  selectSettingsError,
  selectSummary,
  selectWithdrawalEligibility,
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

  // Wagering eligibility
  const eligibility = useSelector(selectWithdrawalEligibility);
  const eligibilityLoading = useSelector(selectEligibilityLoading);

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

  useEffect(() => {
    dispatch(fetchWithdrawalSettings());
    dispatch(fetchWithdrawalEligibility());
    dispatch(fetchWithdrawalHistory());
  }, [dispatch]);

  useEffect(() => {
    if (requestSuccess && currentWithdrawal) {
      setShowSuccessModal(true);
      setFormData((prev) => ({ ...prev, amount: "" }));
      setFee(0);
      setNetAmount(0);
      dispatch(fetchWithdrawalHistory());
      setTimeout(() => {
        setShowSuccessModal(false);
        dispatch(clearWithdrawalSuccess());
      }, 5000);
    }
  }, [requestSuccess, currentWithdrawal, dispatch]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "amount") {
      calculateFeeAndNet(value, formData.paymentMethod);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
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
    } else if (
      eligibility &&
      parseFloat(formData.amount) > eligibility.maxAllowedWithdrawal
    ) {
      errors.amount =
        eligibility.remainingWagering > 0
          ? `Wagering pending. Complete ${currencySymbol}${eligibility.remainingWagering} more wagering, or withdraw up to ${currencySymbol}${eligibility.maxAllowedWithdrawal}`
          : `Insufficient credit. Available: ${currencySymbol}${user?.credit}`;
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = "Please select a payment method";
    }

    const method = formData.paymentMethod;
    if (method === "bank_transfer") {
      if (!formData.bankDetails.accountNumber)
        errors["bankDetails.accountNumber"] = "Account number is required";
      if (!formData.bankDetails.accountHolderName)
        errors["bankDetails.accountHolderName"] =
          "Account holder name is required";
      if (!formData.bankDetails.bankName)
        errors["bankDetails.bankName"] = "Bank name is required";
      if (!formData.bankDetails.ifscCode)
        errors["bankDetails.ifscCode"] = "IFSC code is required";
    } else if (["upi", "phonepe", "googlepay", "paytm"].includes(method)) {
      if (!formData.upiDetails.upiId)
        errors["upiDetails.upiId"] = "UPI ID is required";
      if (!formData.upiDetails.upiName)
        errors["upiDetails.upiName"] = "UPI holder name is required";
    } else if (["paypal", "skrill", "neteller"].includes(method)) {
      if (!formData.paypalDetails.email)
        errors["paypalDetails.email"] = "Email address is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalDetails.email))
        errors["paypalDetails.email"] = "Please enter a valid email address";
    } else if (method === "crypto") {
      if (!formData.cryptoDetails.walletAddress)
        errors["cryptoDetails.walletAddress"] = "Wallet address is required";
      if (!formData.cryptoDetails.network)
        errors["cryptoDetails.network"] = "Network is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return `${currencySymbol}0.00`;
    return `${currencySymbol}${numericAmount.toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // India-only: settings load hone tak page turant render hota hai,
  // full-screen loader nahi dikhta (settings optional chaining se safe hai)

  if (settingsError && !settings) {
    return (
      <div className="min-h-screen bg-[#0B0410] flex items-center justify-center p-4">
        <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-6 sm:p-8 max-w-md w-full text-center border border-[#2a1b3d]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Withdrawal Not Available
          </h2>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            {settingsError ||
              "Withdrawal settings are not configured for your country. Please contact support."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 sm:px-8 py-3 bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-bold rounded-xl transition-all duration-300 text-sm sm:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

// temp replacement JSX for Withdrawal.jsx main return (lines 475-1108)
  return (
    <div className="min-h-screen bg-[#0B0410] overflow-hidden relative">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-64 h-64 bg-[#8E44AD]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 bg-[#9B59B6]/10 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 py-6">
        <div className="max-w-md w-full mx-auto">
          {/* ============================================= */}
          {/* HEADER                                        */}
          {/* ============================================= */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white leading-tight">
                  Withdrawal
                </h1>
                <p className="text-[11px] text-gray-400">
                  Withdraw your winnings securely
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#9B59B6]/10 border border-[#9B59B6]/40 rounded-full flex-shrink-0">
              <Shield className="w-3 h-3 text-[#B45CFF]" />
              <span className="text-[10px] font-medium text-[#B45CFF]">
                Secure
              </span>
            </span>
          </div>

          {/* ============================================= */}
          {/* BALANCE STRIP                                 */}
          {/* ============================================= */}
          <div className="mb-5 flex items-center justify-between bg-[#12061C] border border-[#2a1b3d] rounded-xl px-4 py-3">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Available Credit
            </span>
            <span className="text-base font-bold text-[#00E676]">
              {formatCurrency(user?.credit || 0)}
            </span>
          </div>

          {/* ============================================= */}
          {/* STEP 1 — AMOUNT                               */}
          {/* ============================================= */}
          <div className="bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#B45CFF] to-[#7418F5] text-white text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                Withdrawal Amount
              </h3>
              {settings?.processingFee > 0 && (
                <span className="text-[10px] font-semibold text-[#F1C40F] bg-[#F1C40F]/10 border border-[#F1C40F]/30 px-2 py-0.5 rounded-full">
                  Fee:{" "}
                  {settings.processingFeeType === "percentage"
                    ? `${settings.processingFee}%`
                    : formatCurrency(settings.processingFee)}
                </span>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#12061C] rounded-xl px-3 py-2 border border-[#2a1b3d]">
                <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                  Min
                </p>
                <p className="text-xs font-bold text-gray-200 truncate">
                  {formatCurrency(settings?.minWithdrawal || 0)}
                </p>
              </div>
              <div className="bg-[#12061C] rounded-xl px-3 py-2 border border-[#2a1b3d]">
                <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                  Max
                </p>
                <p className="text-xs font-bold text-gray-200 truncate">
                  {formatCurrency(settings?.maxWithdrawal || 0)}
                </p>
              </div>
            </div>

            {/* ============================================= */}
            {/* WAGERING PROGRESS — withdrawal eligibility    */}
            {/* ============================================= */}
            {eligibilityLoading ? (
              <div className="mb-4 flex items-center justify-center gap-2 bg-[#12061C] border border-[#2a1b3d] rounded-xl px-3 py-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9B59B6]" />
                <span className="text-[11px] text-gray-400">
                  Checking wagering requirement...
                </span>
              </div>
            ) : eligibility ? (
              <div className="mb-4 bg-[#12061C] rounded-xl border border-[#2a1b3d] p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wide">
                    Wagering Requirement
                  </span>
                  {eligibility.remainingWagering <= 0 ? (
                    <span className="text-[9px] font-semibold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30 px-2 py-0.5 rounded-full">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-[#F1C40F] bg-[#F1C40F]/10 border border-[#F1C40F]/30 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#1C0F2B] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#B45CFF] to-[#7418F5] transition-all duration-500"
                    style={{
                      width: `${
                        eligibility.requiredWagering > 0
                          ? Math.min(
                              100,
                              ((eligibility.wageringCompleted ??
                                eligibility.totalWagered) /
                                eligibility.requiredWagering) *
                                100,
                            )
                          : 100
                      }%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">
                      Target
                    </p>
                    <p className="text-[11px] font-bold text-gray-200">
                      {formatCurrency(eligibility.requiredWagering)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">
                      Wagered + Won
                    </p>
                    <p className="text-[11px] font-bold text-[#B45CFF]">
                      {formatCurrency(
                        eligibility.wageringCompleted ??
                          eligibility.totalWagered,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">
                      Remaining
                    </p>
                    <p
                      className={`text-[11px] font-bold ${
                        eligibility.remainingWagering > 0
                          ? "text-[#F1C40F]"
                          : "text-[#00E676]"
                      }`}
                    >
                      {formatCurrency(eligibility.remainingWagering)}
                    </p>
                  </div>
                </div>

                {/* Withdrawal cap notice */}
                <div
                  className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 border ${
                    eligibility.remainingWagering > 0
                      ? "bg-[#F1C40F]/5 border-[#F1C40F]/30"
                      : "bg-[#00E676]/5 border-[#00E676]/30"
                  }`}
                >
                  {eligibility.remainingWagering > 0 ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-[#F1C40F] flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gray-300 leading-relaxed">
                        Wagering pending. You have completed{" "}
                        <strong className="text-white">
                          {formatCurrency(eligibility.maxAllowedWithdrawal)}
                        </strong>{" "}
                        only. To withdraw the full amount, complete{" "}
                        <strong className="text-white">
                          {formatCurrency(eligibility.remainingWagering)}
                        </strong>{" "}
                        more wagering.
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#00E676] flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gray-300 leading-relaxed">
                        Wagering complete! You can withdraw your full wallet
                        balance.
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            {/* Amount input */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                {currencySymbol}
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder={`Min: ${settings?.minWithdrawal || 0}`}
                className={`w-full rounded-xl border p-3 pl-8 text-base font-semibold text-white bg-[#12061C] transition focus:outline-none focus:ring-2 ${
                  formErrors.amount
                    ? "border-red-500/50 focus:ring-red-500/20 bg-red-500/5"
                    : "border-[#2a1b3d] focus:ring-[#9B59B6]/20 focus:border-[#9B59B6]/50"
                }`}
                step="0.01"
                min={settings?.minWithdrawal || 0}
                max={settings?.maxWithdrawal || 0}
              />
            </div>
            {formErrors.amount && (
              <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1 error-message">
                <AlertCircle size={12} /> {formErrors.amount}
              </p>
            )}

            {/* Fee & Net breakdown */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="mt-4 bg-[#12061C] rounded-xl border border-[#2a1b3d] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Withdrawal</span>
                  <span className="font-bold text-gray-200">
                    {formatCurrency(parseFloat(formData.amount))}
                  </span>
                </div>
                {fee > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Processing Fee</span>
                    <span className="font-bold text-red-400">
                      -{formatCurrency(fee)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#2a1b3d]">
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#9B59B6]" />
                    You'll receive
                  </span>
                  <span className="text-base font-bold text-[#00E676]">
                    {formatCurrency(netAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ============================================= */}
          {/* STEP 2 — PAYMENT METHOD                       */}
          {/* ============================================= */}
          <div className="mt-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#B45CFF] to-[#7418F5] text-white text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                Payment Method
              </h3>
              {!selectedPaymentMethod && (
                <span className="text-[10px] font-semibold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                  Required
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {settings?.paymentMethods?.map((method) => {
                const isSelected = selectedPaymentMethod === method;

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handlePaymentMethodChange(method)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#B45CFF]/10 via-[#7418F5]/10 to-[#3A00C9]/10 border-[#B45CFF] shadow-[0_0_12px_rgba(180,92,255,0.35)]"
                        : "border-[#2a1b3d] bg-[#12061C] hover:border-[#9B59B6]/50 hover:bg-[#2a1b3d]/50"
                    }`}
                  >
                    {/* Radio */}
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

                    {/* Icon + label */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] text-white"
                            : "bg-[#1C0F2B] text-gray-400 border border-[#2a1b3d]"
                        }`}
                      >
                        {getPaymentMethodIcon(method)}
                      </div>
                      <p
                        className={`text-xs font-bold uppercase tracking-wide ${
                          isSelected ? "text-[#C77AFF]" : "text-gray-400"
                        }`}
                      >
                        {getPaymentMethodName(method)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {formErrors.paymentMethod && (
              <p className="text-red-400 text-[11px] mt-2 flex items-center gap-1 error-message">
                <AlertCircle size={12} /> {formErrors.paymentMethod}
              </p>
            )}

            {/* Dynamic Payment Fields */}
            {selectedPaymentMethod && (
              <div className="animate-fadeIn mt-4 pt-4 border-t border-[#2a1b3d]">
                {selectedPaymentMethod === "bank_transfer" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-200 flex items-center gap-2 text-sm">
                      <Building2 size={16} className="text-[#9B59B6]" />
                      Bank Details
                    </h4>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium block mb-1">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountHolderName"
                        value={formData.bankDetails.accountHolderName}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                        placeholder="Enter account holder name"
                      />
                      {formErrors["bankDetails.accountHolderName"] && (
                        <p className="text-red-400 text-[10px] mt-1 error-message">
                          {formErrors["bankDetails.accountHolderName"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium block mb-1">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountNumber"
                        value={formData.bankDetails.accountNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                        placeholder="Enter account number"
                      />
                      {formErrors["bankDetails.accountNumber"] && (
                        <p className="text-red-400 text-[10px] mt-1 error-message">
                          {formErrors["bankDetails.accountNumber"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium block mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        name="bankDetails.bankName"
                        value={formData.bankDetails.bankName}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                        placeholder="Enter bank name"
                      />
                      {formErrors["bankDetails.bankName"] && (
                        <p className="text-red-400 text-[10px] mt-1 error-message">
                          {formErrors["bankDetails.bankName"]}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-400 font-medium block mb-1">
                          IFSC Code *
                        </label>
                        <input
                          type="text"
                          name="bankDetails.ifscCode"
                          value={formData.bankDetails.ifscCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                          placeholder="Enter IFSC code"
                          maxLength="11"
                        />
                        {formErrors["bankDetails.ifscCode"] && (
                          <p className="text-red-400 text-[10px] mt-1 error-message">
                            {formErrors["bankDetails.ifscCode"]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400 font-medium block mb-1">
                          Branch (Optional)
                        </label>
                        <input
                          type="text"
                          name="bankDetails.branchName"
                          value={formData.bankDetails.branchName}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                          placeholder="Enter branch"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {["upi", "phonepe", "googlepay", "paytm"].includes(
                  selectedPaymentMethod,
                ) && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-200 flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-[#9B59B6]" />
                      {getPaymentMethodName(selectedPaymentMethod)} Details
                    </h4>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium block mb-1">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        name="upiDetails.upiId"
                        value={formData.upiDetails.upiId}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                        placeholder="e.g., user@paytm"
                      />
                      {formErrors["upiDetails.upiId"] && (
                        <p className="text-red-400 text-[10px] mt-1 error-message">
                          {formErrors["upiDetails.upiId"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium block mb-1">
                        UPI Holder Name *
                      </label>
                      <input
                        type="text"
                        name="upiDetails.upiName"
                        value={formData.upiDetails.upiName}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                        placeholder="Enter UPI holder name"
                      />
                      {formErrors["upiDetails.upiName"] && (
                        <p className="text-red-400 text-[10px] mt-1 error-message">
                          {formErrors["upiDetails.upiName"]}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {["paypal", "skrill", "neteller"].includes(
                  selectedPaymentMethod,
                ) && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-200 flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-[#9B59B6]" />
                      {getPaymentMethodName(selectedPaymentMethod)} Details
                    </h4>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="paypalDetails.email"
                        value={formData.paypalDetails.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                        placeholder="Enter email address"
                      />
                      {formErrors["paypalDetails.email"] && (
                        <p className="text-red-400 text-[10px] mt-1 error-message">
                          {formErrors["paypalDetails.email"]}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === "crypto" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-200 flex items-center gap-2 text-sm">
                      <CreditCard size={16} className="text-[#9B59B6]" />
                      Cryptocurrency Details
                    </h4>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium block mb-1">
                        Network *
                      </label>
                      <select
                        name="cryptoDetails.network"
                        value={formData.cryptoDetails.network}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                      >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="BSC">Binance Smart Chain</option>
                        <option value="SOL">Solana</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium block mb-1">
                        Wallet Address *
                      </label>
                      <input
                        type="text"
                        name="cryptoDetails.walletAddress"
                        value={formData.cryptoDetails.walletAddress}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-[#12061C] text-white border border-[#2a1b3d] rounded-xl focus:ring-2 focus:ring-[#B45CFF]/30 focus:border-[#B45CFF]/60 outline-none transition-all text-sm"
                        placeholder="Enter wallet address"
                      />
                      {formErrors["cryptoDetails.walletAddress"] && (
                        <p className="text-red-400 text-[10px] mt-1 error-message">
                          {formErrors["cryptoDetails.walletAddress"]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================= */}
          {/* STEP 3 — SUMMARY + REQUEST                    */}
          {/* ============================================= */}
          <div className="mt-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                You'll receive
              </span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(netAmount || 0)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={requestLoading || !selectedPaymentMethod}
              className={`w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-1.5 ${
                requestLoading || !selectedPaymentMethod
                  ? "bg-[#2a1b3d] text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white active:scale-[0.98]"
              }`}
            >
              {requestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gem className="w-4 h-4" />
                  Request Withdrawal
                </>
              )}
            </button>

            {settings?.processingTime && (
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <Clock size={12} className="text-[#9B59B6]" />
                <span>
                  Processing time:{" "}
                  <strong className="text-gray-200">
                    {settings.processingTime}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* ============================================= */}
          {/* SUMMARY CHIPS                                 */}
          {/* ============================================= */}
          {summary && summary.length > 0 && (
            <div className="mt-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">
                <TrendingUp size={14} className="text-[#9B59B6]" />
                Withdrawal Summary
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {summary.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-[#12061C] rounded-xl px-3 py-2 border border-[#2a1b3d]"
                  >
                    <span className="text-[11px] text-gray-400 capitalize flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item._id === "pending"
                            ? "bg-[#F1C40F]"
                            : item._id === "processing"
                              ? "bg-blue-400"
                              : item._id === "completed"
                                ? "bg-[#00E676]"
                                : "bg-gray-400"
                        }`}
                      ></span>
                      {item._id}
                    </span>
                    <span className="text-[11px] font-bold text-white">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================= */}
          {/* HISTORY                                       */}
          {/* ============================================= */}
          <div className="mt-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                <History size={14} className="text-[#9B59B6]" />
                Withdrawal History
              </span>
              {showHistory ? (
                <ChevronUp size={16} className="text-[#9B59B6]" />
              ) : (
                <ChevronDown size={16} className="text-[#9B59B6]" />
              )}
            </button>

            {showHistory && (
              <div className="mt-4 space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar">
                {historyLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin text-[#9B59B6]" size={20} />
                  </div>
                ) : withdrawalHistory && withdrawalHistory.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-6">
                    No withdrawal history
                  </p>
                ) : (
                  <>
                    {withdrawalHistory?.slice(0, 5).map((item) => (
                      <div
                        key={item._id}
                        className="border border-[#2a1b3d] bg-[#12061C] rounded-xl p-3 hover:border-[#9B59B6]/50 transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm">
                              {formatCurrency(item.amount)}
                            </p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              {getPaymentMethodIcon(item.paymentMethod)}
                              <span className="truncate">
                                {getPaymentMethodName(item.paymentMethod)}
                              </span>
                            </p>
                          </div>
                          <span
                            className={`text-[9px] px-2 py-1 rounded-full font-medium flex-shrink-0 ${getStatusBadge(item.status)}`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(item.requestedAt)}
                        </p>
                      </div>
                    ))}
                    {withdrawalHistory?.length > 5 && (
                      <p className="text-center text-[10px] text-gray-500 py-1">
                        Showing latest 5 of {withdrawalHistory.length}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ============================================= */}
          {/* SUPPORT                                       */}
          {/* ============================================= */}
          <div className="mt-5 mb-4 flex items-start gap-3 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <div className="p-2 bg-[#9B59B6]/15 rounded-xl border border-[#9B59B6]/30 flex-shrink-0">
              <Gift size={16} className="text-[#9B59B6]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-gray-200 text-xs">Need Help?</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Contact our support team for assistance with your withdrawal.
              </p>
              <button
                onClick={() => navigate("/support")}
                className="text-[11px] text-[#9B59B6] font-bold hover:text-[#B45CFF] mt-1.5 inline-flex items-center gap-1 transition-all"
              >
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && currentWithdrawal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
          <div className="bg-[#1C0F2B] rounded-2xl max-w-md w-full p-5 sm:p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.7)] border border-[#2a1b3d] animate-scaleIn">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#00E676]/15 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 relative border border-[#00E676]/30">
                <CheckCircle
                  className="text-[#00E676] w-7 h-7 sm:w-9 sm:h-9"
                  size={36}
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] rounded-full flex items-center justify-center border border-[#C77AFF]">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
                {currentWithdrawal.status === "completed"
                  ? "🎉 Withdrawal Successful!"
                  : "✅ Withdrawal Request Submitted!"}
              </h3>
              <p className="text-gray-400 mb-5 sm:mb-6 text-xs sm:text-sm">
                {currentWithdrawal.status === "completed"
                  ? "Your withdrawal has been processed successfully."
                  : `Your withdrawal request has been submitted and will be processed within ${settings?.processingTime || "24-48 hours"}.`}
              </p>

              <div className="bg-[#12061C] rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 border border-[#2a1b3d]">
                <div className="flex justify-between text-xs sm:text-sm py-1.5">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(
                      currentWithdrawal.withdrawal?.amount ||
                        currentWithdrawal.amount,
                    )}
                  </span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm py-1.5 border-t border-[#2a1b3d]">
                    <span className="text-gray-400">Fee:</span>
                    <span className="text-red-400 font-bold">
                      -{formatCurrency(fee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm py-1.5 border-t border-[#2a1b3d] font-bold">
                  <span className="text-gray-200">Net Amount:</span>
                  <span className="text-[#9B59B6]">
                    {formatCurrency(netAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm py-1.5 border-t border-[#2a1b3d]">
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
                  navigate('/account');
                }}
                className="w-full py-3 bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-bold rounded-xl active:scale-[0.98] transition-all duration-300 text-sm sm:text-base"
              >
                Go to Account
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #12061C; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #9B59B6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B45CFF; }
      `}</style>
    </div>
  );
};

export default Withdrawal;
