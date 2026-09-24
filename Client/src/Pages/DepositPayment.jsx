import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  Landmark,
  Loader2,
  QrCode,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../hooks/toast";

import { clearDepositState, createDeposit } from "../redux/slices/depositSlice";

const DepositPayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    loading,
    success,
    message,
    error: apiError,
  } = useSelector((state) => state.deposit);

  const selectedMethod = location.state?.method;
  const amount = location.state?.amount;

  const [transactionId, setTransactionId] = useState("");

  const [touched, setTouched] = useState({
    transactionId: false,
  });

  const [errors, setErrors] = useState({
    transactionId: "",
  });

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const inputWrapper = (hasError, hasSuccess) =>
    `w-full rounded-xl border p-3 text-sm text-white bg-[#12061C] transition focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-500/50 focus:ring-red-500/20 bg-red-500/5"
        : hasSuccess
          ? "border-[#00E676]/50 focus:ring-[#00E676]/20 bg-[#00E676]/5"
          : "border-[#2a1b3d] focus:ring-[#B45CFF]/20 focus:border-[#B45CFF]/50"
    }`;

  // ---------------------------------------------------------
  // Redirect if payment method / amount is missing
  // ---------------------------------------------------------
  useEffect(() => {
    if (!selectedMethod || !amount) {
      showErrorToast(
        "Missing Details",
        "Please select a payment method and amount first",
      );
      navigate("/deposit", { replace: true });
    }
  }, [selectedMethod, amount, navigate]);

  // ---------------------------------------------------------
  // Handle deposit success / error
  // ---------------------------------------------------------
  useEffect(() => {
    if (success) {
      showSuccessToast(
        "Deposit Submitted",
        message || "Deposit request submitted successfully!",
      );

      dispatch(clearDepositState());

      navigate("/deposit-history", {
        replace: true,
      });
    }

    if (apiError) {
      showErrorToast("Deposit Failed", apiError || "Something went wrong");
      dispatch(clearDepositState());
    }
  }, [success, apiError, message, dispatch, navigate]);

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------
  const validateTransactionId = (value) => {
    if (!value || value.trim() === "") {
      return "Please enter transaction ID";
    }

    if (value.trim().length < 3) {
      return "Transaction ID must be at least 3 characters";
    }

    return "";
  };

  // ---------------------------------------------------------
  // Blur handlers
  // ---------------------------------------------------------
  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    if (field === "transactionId") {
      setErrors((prev) => ({
        ...prev,
        transactionId: validateTransactionId(transactionId),
      }));
    }
  };

  // ---------------------------------------------------------
  // Transaction ID
  // ---------------------------------------------------------
  const handleTransactionIdChange = (e) => {
    const value = e.target.value;

    setTransactionId(value);

    if (touched.transactionId) {
      setErrors((prev) => ({
        ...prev,
        transactionId: validateTransactionId(value),
      }));
    }
  };

  // ---------------------------------------------------------
  // Method icon
  // ---------------------------------------------------------
  const getMethodIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "bank":
      case "bank transfer":
        return <Landmark className="w-4 h-4" />;

      case "upi":
        return <QrCode className="w-4 h-4" />;

      case "card":
        return <CreditCard className="w-4 h-4" />;

      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  // ---------------------------------------------------------
  // UPI details
  // ---------------------------------------------------------
  const upiId = selectedMethod?.details?.upiId || selectedMethod?.upiId || "";

  const isUPI = selectedMethod?.type?.toLowerCase() === "upi" || Boolean(upiId);

  // ---------------------------------------------------------
  // Generate UPI payment URL
  // ---------------------------------------------------------
  const getUpiPaymentUrl = () => {
    if (!upiId) return "";

    const params = new URLSearchParams();

    params.set("pa", upiId);

    params.set(
      "pn",
      selectedMethod?.details?.payeeName || selectedMethod?.title || "Payment",
    );

    if (amount) {
      params.set("am", Number(amount).toFixed(2));
    }

    params.set("cu", "INR");

    if (selectedMethod?.details?.transactionNote) {
      params.set("tn", selectedMethod.details.transactionNote);
    } else {
      params.set("tn", "Deposit Payment");
    }

    return `upi://pay?${params.toString()}`;
  };

  const upiPaymentUrl = getUpiPaymentUrl();

  // ---------------------------------------------------------
  // Copy UPI ID
  // ---------------------------------------------------------
  const copyUpiId = async () => {
    if (!upiId) return;

    try {
      await navigator.clipboard.writeText(upiId);
      showSuccessToast("Copied", "UPI ID copied!");
    } catch (error) {
      showErrorToast("Copy Failed", "Unable to copy UPI ID");
    }
  };

  // ---------------------------------------------------------
  // Copy normal detail
  // ---------------------------------------------------------
  const copyValue = async (value) => {
    if (value === null || value === undefined || typeof value === "object") {
      return;
    }

    try {
      await navigator.clipboard.writeText(String(value));
      showSuccessToast("Copied", "Copied to clipboard!");
    } catch (error) {
      showErrorToast("Copy Failed", "Unable to copy");
    }
  };

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------
  const submitHandler = (e) => {
    e.preventDefault();

    const transactionError = validateTransactionId(transactionId);

    setTouched({
      transactionId: true,
    });

    setErrors({
      transactionId: transactionError,
    });

    if (transactionError) {
      showErrorToast(
        "Incomplete Form",
        "Please fix all errors before submitting",
      );
      return;
    }

    const form = new FormData();

    form.append("amount", amount);
    form.append("transactionId", transactionId.trim());

    form.append("methodType", selectedMethod?.type || "");

    form.append("methodTitle", selectedMethod?.title || "");

    dispatch(createDeposit(form));
  };

  // ---------------------------------------------------------
  // Don't render if data missing
  // ---------------------------------------------------------
  if (!selectedMethod || !amount) {
    return null;
  }

  // ---------------------------------------------------------
  // Normal payment details
  // ---------------------------------------------------------
  const paymentDetails = Object.entries(selectedMethod.details || {}).filter(
    ([key]) => {
      const normalizedKey = key.toLowerCase();

      return (
        normalizedKey !== "qr" &&
        normalizedKey !== "upiid" &&
        normalizedKey !== "upivpa"
      );
    },
  );

  return (
    <div className="relative min-h-screen bg-[#0B0410] overflow-hidden">
      {/* Decorative purple glows */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />

      <div className="pointer-events-none absolute top-1/3 -right-24 w-64 h-64 bg-[#B45CFF]/15 rounded-full blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-[#9B59B6]/10 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 py-6">
        <div className="max-w-md w-full mx-auto">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/deposit")}
            className="flex items-center gap-1 text-gray-400 text-xs font-medium mb-4 hover:text-[#B45CFF] transition w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="flex gap-2 items-center">
              <div
                className={`w-11 h-11 rounded-2xl ${purpleGradient} flex items-center justify-center`}
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-white tracking-tight">
                Complete Payment
              </h1>
            </span>

            <p className="text-sm text-gray-400 mt-1 ml-[3rem]">
              Pay using the details below, then confirm
            </p>
          </div>

          {/* Amount + Method */}
          <div className="mb-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] px-5 py-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium block">
                Amount to pay
              </span>

              <span className="text-xl font-bold text-white">
                ₹{Number(amount).toLocaleString("en-IN")}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl ${purpleGradient} text-white`}
            >
              {getMethodIcon(selectedMethod.type)}

              <span className="text-xs font-semibold">
                {selectedMethod.title}
              </span>
            </div>
          </div>

          {/* =================================================
              UPI QR SECTION
          ================================================= */}
          {isUPI && upiId && (
            <div className="mb-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Scan & Pay
                  </h3>

                  <p className="text-[11px] text-gray-500 mt-1">
                    Scan this QR using any UPI app
                  </p>
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#B45CFF]/15 border border-[#B45CFF]/30 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-[#B45CFF]" />
                </div>
              </div>

              {/* QR */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                  <QRCodeSVG
                    value={upiPaymentUrl}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="mt-4 text-center">
                <p className="text-[10px] uppercase tracking-wide text-gray-400">
                  Payment Amount
                </p>

                <p className="text-2xl font-bold text-[#9B59B6] mt-0.5">
                  ₹{Number(amount).toLocaleString("en-IN")}
                </p>
              </div>

              {/* UPI ID */}
              <div className="mt-4 bg-[#12061C] rounded-xl border border-[#2a1b3d] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      UPI ID
                    </p>

                    <p className="text-sm font-semibold text-white truncate mt-0.5">
                      {upiId}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="shrink-0 p-2 rounded-lg bg-[#1C0F2B] border border-[#2a1b3d] hover:border-[#B45CFF]/50 hover:bg-[#2a1b3d] transition"
                    title="Copy UPI ID"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-[#B45CFF]" />
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 text-center mt-3">
                Open Google Pay, PhonePe, Paytm or another UPI app and scan the
                QR code.
              </p>
            </div>
          )}

          {/* =================================================
              PAYMENT DETAILS
          ================================================= */}
          {(paymentDetails.length > 0 ||
            (!isUPI && selectedMethod.details)) && (
            <div className="mb-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3.5">
                Payment Details
              </h3>

              <div className="space-y-2.5">
                {paymentDetails.map(([key, value]) => {
                  if (value === null || value === undefined || value === "") {
                    return null;
                  }

                  if (typeof value === "object") {
                    return null;
                  }

                  return (
                    <div
                      key={key}
                      className="bg-[#12061C] px-3.5 py-2.5 rounded-xl border border-[#2a1b3d] flex items-center gap-2 overflow-hidden"
                    >
                      <span className="text-[11px] font-medium text-gray-500 capitalize whitespace-nowrap min-w-[64px]">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>

                      <span className="flex-1 text-xs text-white font-medium truncate">
                        {String(value)}
                      </span>

                      <button
                        type="button"
                        className="p-1.5 rounded-md bg-[#1C0F2B] border border-[#2a1b3d] hover:border-[#B45CFF]/50 hover:bg-[#2a1b3d] transition"
                        onClick={() => copyValue(value)}
                      >
                        <Copy className="w-3 h-3 text-gray-400 hover:text-[#B45CFF]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================
              CONFIRM PAYMENT FORM
          ================================================= */}
          <form
            onSubmit={submitHandler}
            className="bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5"
          >
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Confirm Payment
            </h3>

            {/* Transaction ID */}
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-300 mb-1.5">
                <FileText className="w-3 h-3 text-[#B45CFF]" />
                Transaction ID
              </label>

              <div className="relative">
                <input
                  type="text"
                  className={inputWrapper(
                    touched.transactionId && errors.transactionId,
                    touched.transactionId &&
                      !errors.transactionId &&
                      transactionId,
                  )}
                  value={transactionId}
                  onChange={handleTransactionIdChange}
                  onBlur={() => handleBlur("transactionId")}
                  placeholder="e.g. TRX-12345"
                />

                {touched.transactionId &&
                  !errors.transactionId &&
                  transactionId && (
                    <CheckCircle2 className="w-4 h-4 text-[#00E676] absolute right-3 top-1/2 -translate-y-1/2" />
                  )}

                {touched.transactionId && errors.transactionId && (
                  <XCircle className="w-4 h-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {touched.transactionId && errors.transactionId && (
                <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.transactionId}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-6 w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-1.5 ${
                loading
                  ? "bg-[#2a1b3d] text-gray-500 cursor-not-allowed"
                  : `${purpleGradient} text-white active:scale-[0.98]`
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Confirm Payment
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-500 mt-3 text-center">
              By submitting you agree to our deposit terms and conditions
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepositPayment;