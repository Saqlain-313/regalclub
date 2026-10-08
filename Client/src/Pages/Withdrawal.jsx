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
import { toast } from "react-toastify";
import { getProfile } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { showErrorToast } from "../hooks/toast";
import bankCardImg from "../assets/withdraw/bank card.png";
import upiImg from "../assets/withdraw/upi.jpg";
import usdtImg from "../assets/withdraw/usdt.png";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deletePaymentMethod,
  fetchPaymentMethods,
  selectPaymentMethods,
} from "../redux/slices/paymentMethodSlice";
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
      network: "TRC20",
    },
  });

  const [formErrors, setFormErrors] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [fee, setFee] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Saved payment methods (bank / upi / usdt) from the backend
  const savedMethods = useSelector(selectPaymentMethods);

  // Last known withdrawable amount — shown instantly on refresh so
  // the card never flashes the total wallet while eligibility loads
  const [cachedWithdrawable, setCachedWithdrawable] = useState(() => {
    try {
      return Number(localStorage.getItem("rg_last_withdrawable")) || 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (!eligibilityLoading && eligibility) {
      setCachedWithdrawable(eligibility.maxAllowedWithdrawal || 0);
      try {
        localStorage.setItem(
          "rg_last_withdrawable",
          String(eligibility.maxAllowedWithdrawal || 0),
        );
      } catch {
        /* storage unavailable */
      }
    }
  }, [eligibility, eligibilityLoading]);

  const displayedWithdrawable =
    eligibilityLoading || !eligibility
      ? cachedWithdrawable
      : eligibility.maxAllowedWithdrawal || 0;

  // Frontend type -> saved-method type mapping
  const savedTypeOf = (method) =>
    method === "bank_transfer" ? "bank" : method === "crypto" ? "usdt" : "upi";

  const methodsForSelected = savedMethods.filter(
    (m) => m.type === savedTypeOf(selectedPaymentMethod),
  );

  useEffect(() => {
    dispatch(fetchWithdrawalSettings());
    dispatch(fetchWithdrawalEligibility());
    dispatch(fetchWithdrawalHistory());
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  // When the method type changes, preselect its default saved account
  useEffect(() => {
    if (!selectedPaymentMethod) {
      setSelectedMethodId(null);
      return;
    }
    const list = savedMethods.filter((m) => m.type === savedTypeOf(selectedPaymentMethod));
    const def = list.find((m) => m.isDefault) || list[0];
    setSelectedMethodId(def ? def._id : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentMethod, savedMethods.length]);

  // Coming back from the add page (or first load): auto-select the
  // method that has a saved account so the user doesn't re-pick it
  useEffect(() => {
    if (!selectedPaymentMethod && savedMethods.length > 0) {
      const first = savedMethods[0];
      const methodTile =        first.type === "bank"
          ? "bank_transfer"
          : first.type === "usdt"
            ? "crypto"
            : "upi";
      // route through handlePaymentMethodChange so formData +
      // fee calculation also update
      handlePaymentMethodChange(methodTile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedMethods.length]);

  useEffect(() => {
    if (requestSuccess && currentWithdrawal) {
      setShowSuccessModal(true);
      setFormData((prev) => ({ ...prev, amount: "" }));
      // fee/netAmount are still needed by the success modal —
      // they reset when the modal closes instead
      dispatch(fetchWithdrawalHistory());
      setTimeout(() => {
        setShowSuccessModal(false);
        setFee(0);
        setNetAmount(0);
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
    // Settings failures fall back to INDIA_DEFAULT_SETTINGS —
    // every refresh used to show a "Settings Error" toast, so
    // that toast was removed
  }, [error, requestError, dispatch]);

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

  // Per-method limits from admin settings — UPI/Bank and USDT can
  // each have their own min/max (blank = global limits)
  const methodKey =
    selectedPaymentMethod === "crypto"
      ? "crypto"
      : selectedPaymentMethod === "bank_transfer"
        ? "bank"
        : "upi";
  const methodLimits = settings?.methodSettings?.[methodKey] || {};
  const effectiveMin =
    Number(methodLimits.minWithdrawal) > 0
      ? Number(methodLimits.minWithdrawal)
      : Number(settings?.minWithdrawal || 0);
  const effectiveMax =
    Number(methodLimits.maxWithdrawal) > 0
      ? Number(methodLimits.maxWithdrawal)
      : Number(settings?.maxWithdrawal || 0);

  const validateForm = () => {
    const errors = {};

    if (!formData.amount) {
      errors.amount = "Please enter withdrawal amount";
    } else if (parseFloat(formData.amount) < effectiveMin) {
      errors.amount = `Minimum withdrawal amount is ${currencySymbol}${effectiveMin}`;
    } else if (parseFloat(formData.amount) > effectiveMax) {
      errors.amount = `Maximum withdrawal amount is ${currencySymbol}${effectiveMax}`;
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

    // A saved account must be picked (details come from the DB)
    if (formData.paymentMethod && !selectedMethodId) {
      const label =
        savedTypeOf(formData.paymentMethod) === "bank"
          ? "bank account"
          : savedTypeOf(formData.paymentMethod) === "upi"
            ? "UPI address"
            : "USDT address";
      errors.paymentMethod = `Please select or add a saved ${label}`;
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

    // Details come from the saved payment method selected by the user
    const saved = savedMethods.find((m) => m._id === selectedMethodId);

    if (!saved) {
      toast.error("Please select or add a saved payment method");
      return;
    }

    const method = formData.paymentMethod;
    if (method === "bank_transfer") {
      withdrawalData.bankDetails = {
        accountHolderName: saved.accountHolderName,
        accountNumber: saved.accountNumber,
        bankName: saved.bankName,
        ifscCode: saved.ifscCode,
      };
    } else if (["upi", "phonepe", "googlepay", "paytm"].includes(method)) {
      withdrawalData.upiDetails = {
        upiId: saved.upiId,
        upiName: saved.upiName,
      };
    } else if (["paypal", "skrill", "neteller"].includes(method)) {
      withdrawalData.paypalDetails = {
        email: saved.email || "",
      };
    } else if (method === "crypto") {
      withdrawalData.cryptoDetails = {
        network: saved.network,
        walletAddress: saved.walletAddress,
      };
    }

    if (requestLoading) return; // double-submit guard

    try {
      const result = await dispatch(requestWithdrawal(withdrawalData)).unwrap();

      // Instant navbar update — deduct the amount from the wallet
      dispatch(getProfile());

      const status = result?.data?.status;
      toast.success(
        status === "completed"
          ? "Withdrawal completed successfully!"
          : "Withdrawal request submitted successfully!",
      );
    } catch (err) {
      toast.error(String(err).slice(0, 120) || "Withdrawal failed");
    }
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
      crypto: "USDT (Crypto)",
    };
    return names[method] || method;
  };

  // India-only platform — currency is always INR
  const getCurrencySymbol = () => "₹";

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

  // India-only: the page renders immediately while settings load,
  // no full-screen loader (settings access uses optional chaining)

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

  return (
    <div className="min-h-screen bg-[#0B0410] pb-10">
      <div className="max-w-md mx-auto px-4 pt-4">

        {/* ============================================= */}
        {/* HEADER — back / title / history link          */}
        {/* ============================================= */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-white active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>

          <h1 className="text-base font-bold text-white">Withdraw</h1>

          <button
            type="button"
            onClick={() => navigate("/withdrawal-history")}
            className="text-[11px] font-semibold text-[#B45CFF] active:scale-95 transition-all"
          >
            Withdrawal history
          </button>
        </div>

        {/* ============================================= */}
        {/* AVAILABLE BALANCE CARD                        */}
        {/* ============================================= */}
        <div className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_8px_28px_rgba(116,24,245,0.45)] p-4">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 -left-8 w-40 h-40 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-white/80" />
                <span className="text-[11px] font-semibold text-white/80">
                  Withdrawable balance
                </span>
              </div>

              {/* Show what the user can actually withdraw right now:
                  winnings + the wagering-completed amount (wagering
                  cap applied) — not the total wallet */}
              <p className="relative mt-1.5 text-3xl font-extrabold text-white tracking-tight">
                {formatCurrency(displayedWithdrawable)}
              </p>

              <div className="relative mt-3 flex gap-3 text-white/60">
                <span className="tracking-[0.3em] text-[10px]">••••</span>
                <span className="tracking-[0.3em] text-[10px]">••••</span>
              </div>
            </div>

            {/* Wallet illustration — /wallet jaisi */}
            <img
              src="https://i.ibb.co/8gXCwzjp/wallet.png"
              alt="Wallet illustration"
              className="-mr-4 h-[110px] w-[170px] flex-shrink-0 object-contain opacity-90"
            />
          </div>
        </div>

        {/* ============================================= */}
        {/* ADMIN PAUSE NOTICE — withdrawals disabled     */}
        {/* ============================================= */}
        {settings?.isActive === false && (
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-[#F1C40F]/30 bg-[#F1C40F]/8 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F1C40F]" />
            <div>
              <p className="text-xs font-bold text-[#F1C40F]">
                Withdrawals are temporarily unavailable
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-gray-400">
                Our team has paused withdrawals for maintenance. Please try
                again later.
              </p>
            </div>
          </div>
        )}

        {/* ============================================= */}
        {/* STEP 1 — SELECT METHOD (3 tiles)              */}
        {/* ============================================= */}
        <p className="mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          Withdrawal method
        </p>
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          {[
            { id: "bank_transfer", label: "BANK CARD", img: bankCardImg },
            { id: "upi", label: "UPI", img: upiImg },
            { id: "crypto", label: "USDT", img: usdtImg },
          ].map(({ id, label, img }) => {
            const isActive = selectedPaymentMethod === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handlePaymentMethodChange(id)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-4 border transition-all active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border-[#C77AFF] shadow-[0_0_10px_rgba(180,92,255,0.5)]"
                    : "bg-[#1C0F2B] border-[#2a1b3d] hover:border-[#9B59B6]/50"
                }`}
              >
                <img
                  src={img}
                  alt={label}
                  className={`h-9 w-9 object-contain ${isActive ? "" : "opacity-90"}`}
                />
                <span
                  className={`text-[9px] font-bold tracking-wide ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ============================================= */}
        {/* SAVED ACCOUNTS — select / add / edit          */}
        {/* ============================================= */}
        {selectedPaymentMethod && (
          <div className="mb-4 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                {getPaymentMethodIcon(selectedPaymentMethod)}
                {getPaymentMethodName(selectedPaymentMethod)} accounts
              </h3>
              <span className="text-[10px] text-gray-500">
                {methodsForSelected.length} saved
              </span>
            </div>

            {methodsForSelected.length === 0 ? (
              <p className="mb-3 text-[11px] leading-relaxed text-gray-500">
                No saved accounts yet — add one below and you won't have to
                enter the details again.
              </p>
            ) : (
              <div className="mb-3 space-y-2">
                {methodsForSelected.map((m) => {
                  const isSelected = selectedMethodId === m._id;
                  return (
                    <div
                      key={m._id}
                      onClick={() => setSelectedMethodId(m._id)}
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-all ${
                        isSelected
                          ? "border-[#B45CFF]/70 bg-[#B45CFF]/10"
                          : "border-[#2a1b3d] bg-[#12061C] hover:border-[#9B59B6]/50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-[#B45CFF] bg-[#B45CFF]"
                              : "border-gray-600"
                          }`}
                        >
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-white">
                            {m.type === "bank" &&
                              `${m.bankName} ••••${(m.accountNumber || "").slice(-4)}`}
                            {m.type === "upi" && m.upiId}
                            {m.type === "usdt" &&
                              `USDT (${m.network}) ••••${(m.walletAddress || "").slice(-4)}`}
                          </p>
                          <p className="truncate text-[10px] text-gray-500">
                            {m.type === "bank" && m.accountHolderName}
                            {m.type === "upi" && m.upiName}
                            {m.type === "usdt" && "Crypto withdrawal"}
                            {m.isDefault && " • Default"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              m.type === "bank"
                                ? "/withdrawal/add/bankcard"
                                : m.type === "upi"
                                  ? "/withdrawal/add/upiaddress"
                                  : "/withdrawal/add/usdt",
                              { state: { methodId: m._id } },
                            );
                          }}
                          className="rounded-lg border border-[#2a1b3d] bg-[#1C0F2B] p-1.5 text-gray-400 transition-all hover:border-[#B45CFF]/50 hover:text-[#B45CFF] active:scale-95"
                          aria-label="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm("Delete this saved account?"))
                              return;
                            try {
                              await dispatch(
                                deletePaymentMethod(m._id),
                              ).unwrap();
                              toast.success("Account deleted");
                            } catch (err) {
                              toast.error(String(err).slice(0, 120));
                            }
                          }}
                          className="rounded-lg border border-[#2a1b3d] bg-[#1C0F2B] p-1.5 text-gray-400 transition-all hover:border-red-500/50 hover:text-red-400 active:scale-95"
                          aria-label="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dashed add tile */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  selectedPaymentMethod === "bank_transfer"
                    ? "/withdrawal/add/bankcard"
                    : selectedPaymentMethod === "upi"
                      ? "/withdrawal/add/upiaddress"
                      : "/withdrawal/add/usdt",
                )
              }
              className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#2a1b3d] py-4 text-gray-500 transition-all hover:border-[#B45CFF]/60 hover:text-[#B45CFF] active:scale-[0.98]"
            >
              <Plus size={20} />
              <span className="text-[11px] font-semibold">
                {selectedPaymentMethod === "bank_transfer" && "Add Bank Card"}
                {selectedPaymentMethod === "upi" && "Add UPI"}
                {selectedPaymentMethod === "crypto" && "Add USDT"}
              </span>
            </button>

            {formErrors.paymentMethod && (
              <p className="mt-2 text-[10px] text-red-400 error-message">
                {formErrors.paymentMethod}
              </p>
            )}
          </div>
        )}

        {/* ============================================= */}
        {/* STEP 2 — AMOUNT                               */}
        {/* ============================================= */}
        <div className="mb-4 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4">
          <div className="flex items-center gap-2 rounded-xl border border-[#2a1b3d] bg-[#12061C] px-3 py-3 focus-within:border-[#B45CFF]/60">
            <span className="text-lg font-bold text-[#B45CFF]">
              {currencySymbol}
            </span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder={`Min ${currencySymbol}${effectiveMin} - Max ${currencySymbol}${effectiveMax}`}
              className="w-full bg-transparent text-base font-semibold text-white placeholder-gray-500 outline-none"
              step="0.01"
              min={effectiveMin}
              max={effectiveMax}
            />
            <button
              type="button"
              onClick={() => {
                const maxAmt = Math.min(
                  Number(eligibility?.maxAllowedWithdrawal ?? user?.credit ?? 0),
                  effectiveMax,
                );
                handleChange({
                  target: { name: "amount", value: String(maxAmt || "") },
                });
              }}
              className="flex-shrink-0 rounded-full border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] to-[#7418F5] px-4 py-1 text-xs font-bold text-white active:scale-95 transition-all"
            >
              All
            </button>
          </div>
          {formErrors.amount && (
            <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1 error-message">
              <AlertCircle size={11} />
              {formErrors.amount}
            </p>
          )}

          {/* Balance + net amount rows */}
          <div className="mt-3 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Withdrawable balance</span>
              <span className="font-semibold text-gray-300">
                {formatCurrency(displayedWithdrawable)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">
                Processing fee
                {settings?.processingFee
                  ? ` (${settings.processingFee}${settings.processingFeeType === "percentage" ? "%" : " flat"})`
                  : ""}
              </span>
              <span className="font-semibold text-gray-300">
                -{formatCurrency(fee)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#2a1b3d] pt-1.5">
              <span className="text-gray-400">Withdrawal amount</span>
              <span className="font-bold text-[#B45CFF]">
                {formatCurrency(netAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================= */}
        {/* WITHDRAW BUTTON                               */}
        {/* ============================================= */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={requestLoading || !formData.amount || !selectedPaymentMethod}
          className={`mb-5 w-full rounded-full py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98] ${
            requestLoading || !formData.amount || !selectedPaymentMethod
              ? "bg-[#2a1b3d] text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_12px_rgba(180,92,255,0.5)]"
          }`}
        >
          {requestLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </span>
          ) : (
            "Withdraw"
          )}
        </button>

        {/* ============================================= */}
        {/* WITHDRAWAL RULES — numbered notes             */}
        {/* ============================================= */}
        <div className="mb-6 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4">
          <p className="mb-2.5 text-[11px] font-bold text-white">
            Please note
          </p>
          <ul className="space-y-2">
            {[
              // Remaining-based — decreases as the user wagers
              !eligibility || eligibility.remainingWagering > 0
                ? `Need to bet ${currencySymbol}${formatCurrency(eligibility?.remainingWagering || 0).replace(currencySymbol, "")} more to unlock your full wallet.`
                : `Wagering complete — your full wallet balance is withdrawable.`,
              `Wagering target: ${currencySymbol}${formatCurrency(eligibility?.requiredWagering || 0).replace(currencySymbol, "")} • Completed: ${currencySymbol}${formatCurrency(eligibility?.wageringCompleted || 0).replace(currencySymbol, "")}.`,
              !eligibility || eligibility.remainingWagering > 0
                ? `Right now you can withdraw up to ${currencySymbol}${formatCurrency(eligibility?.maxAllowedWithdrawal || 0).replace(currencySymbol, "")} (what you have played and not yet withdrawn).`
                : `You can withdraw your full wallet balance.`,
              "Please check your bank information carefully. If your information is wrong, the company will not be responsible for any loss.",
              "If your withdrawal account information is incorrect, please contact customer service.",
              `Withdrawals are processed within ${settings?.processingTime || "24-48 hours"}.`,
            ].map((note, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-400"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-br from-[#B45CFF] to-[#7418F5]" />
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* ============================================= */}
        {/* WITHDRAWAL HISTORY                            */}
        {/* ============================================= */}
        <div className="mb-3 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-[#B45CFF] to-[#7418F5]" />
          <h2 className="text-sm font-bold text-white">Withdrawal history</h2>
        </div>

        <div className="space-y-2.5">
          {historyLoading ? (
            <div className="flex justify-center rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-8">
              <Loader2 className="animate-spin text-[#B45CFF]" size={20} />
            </div>
          ) : withdrawalHistory && withdrawalHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2a1b3d] bg-[#1C0F2B] py-8 text-center">
              <p className="text-xs text-gray-500">No withdrawal history</p>
            </div>
          ) : (
            <>
              {withdrawalHistory?.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-3.5 transition-all hover:border-[#9B59B6]/50"
                >
                  {/* top row — tag + status */}
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-gradient-to-r from-[#B45CFF] to-[#7418F5] px-2.5 py-1 text-[10px] font-bold text-white">
                      Withdraw
                    </span>
                    <span
                      className={`text-[10px] font-bold capitalize ${
                        item.status === "completed"
                          ? "text-[#00E676]"
                          : item.status === "pending" ||
                              item.status === "processing"
                            ? "text-[#F1C40F]"
                            : "text-red-400"
                      }`}
                    >
                      {item.status === "completed"
                        ? "Completed"
                        : item.status === "pending"
                          ? "Pending"
                          : item.status === "processing"
                            ? "Processing"
                            : item.status === "rejected"
                              ? "Rejected"
                              : item.status === "cancelled"
                                ? "Cancelled"
                                : item.status}
                    </span>
                  </div>

                  {/* detail rows */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Balance</span>
                      <span className="font-bold text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Type</span>
                      <span className="font-semibold text-gray-300">
                        {getPaymentMethodName(item.paymentMethod)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Time</span>
                      <span className="text-gray-300">
                        {formatDate(item.requestedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Order number</span>
                      <span className="max-w-[150px] truncate font-mono text-[10px] text-gray-400">
                        {item.orderNumber || item._id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {withdrawalHistory?.length > 5 && (
                <p className="text-center text-[10px] text-gray-500">
                  Showing latest 5 of {withdrawalHistory.length}
                </p>
              )}

              <button
                type="button"
                onClick={() => navigate("/withdrawal-history")}
                className="w-full rounded-full border border-[#C77AFF]/60 bg-[#1C0F2B] py-3 text-xs font-bold text-[#B45CFF] transition-all hover:bg-[#2a1b3d] active:scale-[0.98]"
              >
                All history
              </button>
            </>
          )}
        </div>

        {/* ============================================= */}
        {/* SUPPORT                                       */}
        {/* ============================================= */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4">
          <div className="flex-shrink-0 rounded-xl border border-[#9B59B6]/30 bg-[#9B59B6]/15 p-2">
            <Gift size={16} className="text-[#9B59B6]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-gray-200">Need Help?</h4>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
              Contact our support team for assistance with your withdrawal.
            </p>
            <button
              type="button"
              onClick={() => navigate("/support")}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#9B59B6] transition-all hover:text-[#B45CFF]"
            >
              Contact Support →
            </button>
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
                  <span className="text-[#B45CFF]">
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
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(clearWithdrawalSuccess());
                  navigate("/account");
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
