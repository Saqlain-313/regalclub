// pages/Deposit.jsx
//
// Image-style deposit page (purple theme):
//   balance card -> method tiles -> selected channel -> amount
//   -> recharge instructions -> sticky Deposit bar -> deposit history

import {
  AlertCircle,
  Banknote,
  ChevronLeft,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getDepositMethods,
  getMyDeposits,
} from "../redux/slices/depositSlice";

// Fallback chips — used until the admin saves preset amounts
const FALLBACK_PRESETS = [100, 200, 300, 400, 500, 1000, 2000, 3000, 5000];

const shortMoney = (n) =>
  n >= 1000 ? `${n / 1000}K` : String(n);

const statusInfo = (status) => {
  const value = String(status).toLowerCase();
  if (["success", "approved", "completed"].includes(value))
    return { label: "Success", cls: "text-[#00E676]" };
  if (value === "pending") return { label: "Pending", cls: "text-[#F1C40F]" };
  if (["failed", "rejected"].includes(value))
    return { label: "Failed", cls: "text-red-400" };
  return { label: status || "Pending", cls: "text-gray-400" };
};

const Deposit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { methods, loading, deposits, presetAmounts } = useSelector(
    (state) => state.deposit,
  );
  const { user } = useSelector((state) => state.auth);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const currencySymbol = "₹";

  const formatCurrency = (value) => {
    if (!value) return `${currencySymbol}0`;
    const num = parseFloat(value);
    if (isNaN(num)) return `${currencySymbol}0`;
    return `${currencySymbol}${num.toLocaleString("en-IN")}`;
  };

  useEffect(() => {
    dispatch(getDepositMethods());
    dispatch(getMyDeposits());
  }, [dispatch]);

  // First gateway selected by default
  useEffect(() => {
    if (methods?.length && !selectedMethod) {
      setSelectedMethod(methods[0]);
    }
  }, [methods, selectedMethod]);

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

  // Bonus percent — shown as the red badge on tiles / channel card
  const bonusOf = (method) => {
    const bonus = method?.details?.bonusPercent ?? method?.details?.bonus;
    const num = Number(bonus);
    return Number.isFinite(num) && num > 0 ? num : null;
  };

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await dispatch(getMyDeposits());
    setTimeout(() => setRefreshing(false), 600);
  };

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

  const channelMin = selectedMethod
    ? parseFloat(selectedMethod.minimumDeposit) || 100
    : 100;
  const channelMax = selectedMethod
    ? parseFloat(selectedMethod.maximumDeposit) || 50000
    : 50000;
  const channelBonus = selectedMethod ? bonusOf(selectedMethod) : null;

  return (
    <div className="min-h-screen bg-[#0B0410] pb-44 md:pb-28">
      <div className="mx-auto max-w-md px-4 pt-4">

        {/* ============================================= */}
        {/* HEADER — back / title / history link          */}
        {/* ============================================= */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-white transition-all active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>

          <h1 className="text-base font-bold text-white">Deposit</h1>

          <button
            type="button"
            onClick={() => navigate("/deposit-history")}
            className="text-[11px] font-semibold text-[#B45CFF] transition-all active:scale-95"
          >
            Deposit history
          </button>
        </div>

        {/* ============================================= */}
        {/* BALANCE CARD                                  */}
        {/* ============================================= */}
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] p-4 shadow-[0_8px_28px_rgba(116,24,245,0.45)]">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-2">
            <Wallet size={14} className="text-white/80" />
            <span className="text-[11px] font-semibold text-white/80">
              Balance
            </span>
          </div>

          <div className="relative mt-1 flex items-center gap-2.5">
            <p className="text-3xl font-extrabold tracking-tight text-white">
              {formatCurrency(user?.credit)}
            </p>
            <button
              type="button"
              onClick={handleRefreshBalance}
              className="text-white/70 transition-all hover:text-white active:rotate-180"
              aria-label="Refresh balance"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="relative mt-3 flex justify-end gap-3 text-white/60">
            <span className="text-[10px] tracking-[0.3em]">••••</span>
            <span className="text-[10px] tracking-[0.3em]">••••</span>
          </div>
        </div>

        {/* ============================================= */}
        {/* PAYMENT METHOD TILES                          */}
        {/* ============================================= */}
        {loading ? (
          <div className="mb-5 grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[84px] animate-pulse rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B]"
              />
            ))}
          </div>
        ) : methods?.length ? (
          <div className="mb-5 grid grid-cols-3 gap-2.5">
            {methods.map((item) => {
              const isSelected = selectedMethod?.title === item.title;
              const bonus = bonusOf(item);

              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => handleMethodSelect(item)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-4 transition-all active:scale-95 ${
                    isSelected
                      ? "border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] shadow-[0_0_10px_rgba(180,92,255,0.5)]"
                      : "border-[#2a1b3d] bg-[#1C0F2B] hover:border-[#9B59B6]/50"
                  }`}
                >
                  {/* bonus badge */}
                  {bonus !== null && (
                    <span className="absolute right-1.5 top-1.5 rounded-md bg-gradient-to-br from-[#B45CFF] to-[#7418F5] px-1 py-0.5 text-[8px] font-black text-white">
                      +{bonus}%
                    </span>
                  )}

                  {item.icon &&
                  /^(https?:\/\/|\/|data:)/i.test(item.icon) ? (
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="h-7 w-7 rounded-lg object-contain"
                    />
                  ) : (
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#B45CFF]/15 text-[#B45CFF]"
                      }`}
                    >
                      {String(item.title || "?").charAt(0).toUpperCase()}
                    </span>
                  )}

                  <span
                    className={`max-w-full truncate px-1 text-[9px] font-bold ${
                      isSelected ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-dashed border-[#2a1b3d] bg-[#1C0F2B] py-8 text-center">
            <AlertCircle className="mx-auto mb-2 w-6 w-6 text-gray-500" />
            <p className="text-xs text-gray-400">
              No payment methods available right now. Please try again later.
            </p>
          </div>
        )}

        {/* ============================================= */}
        {/* SELECT CHANNEL (selected method details)      */}
        {/* ============================================= */}
        {selectedMethod && (
          <div className="mb-5 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Banknote size={15} className="text-[#B45CFF]" />
              Select channel
            </h2>

            <div className="rounded-xl border border-[#B45CFF]/60 bg-gradient-to-br from-[#B45CFF]/15 to-[#7418F5]/10 p-3.5">
              <p className="text-xs font-bold text-white">
                {selectedMethod.title}
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                Balance:{" "}
                <span className="font-semibold text-gray-300">
                  {currencySymbol}
                  {shortMoney(channelMin)} - {currencySymbol}
                  {shortMoney(channelMax)}
                </span>
                {channelBonus !== null && (
                  <>
                    {"  •  "}Bonus:{" "}
                    <span className="font-semibold text-[#00E676]">
                      {channelBonus}%
                    </span>
                  </>
                )}
              </p>
              {selectedMethod.processingTime && (
                <p className="mt-0.5 text-[10px] text-gray-500">
                  Processing time: {selectedMethod.processingTime}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============================================= */}
        {/* DEPOSIT AMOUNT                                */}
        {/* ============================================= */}
        <div className="mb-5 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <Wallet size={15} className="text-[#B45CFF]" />
            Deposit amount
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {(presetAmounts.length > 0
              ? presetAmounts
              : FALLBACK_PRESETS
            ).map((value) => {
              const isSelected = String(amount) === String(value);
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => handlePresetClick(value)}
                  className={`flex items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? "border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] text-white"
                      : "border-[#2a1b3d] bg-[#12061C] text-gray-300 hover:border-[#9B59B6]/50"
                  }`}
                >
                  {/* ₹ stays white in both states */}
                  <span className="text-white/90">{currencySymbol}</span>
                  {shortMoney(value)}
                </button>
              );
            })}
          </div>

          {/* custom amount input */}
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl border bg-[#12061C] px-3 py-3 transition-all focus-within:border-[#B45CFF]/60 ${
              touched && error ? "border-red-500/50" : "border-[#2a1b3d]"
            }`}
          >
            <span className="text-sm font-bold text-[#B45CFF]">
              {currencySymbol}
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleBlur}
              placeholder={`${currencySymbol}100.00 - ${currencySymbol}50,000.00`}
              className="w-full bg-transparent text-sm font-semibold text-white placeholder-gray-500 outline-none"
              step="0.01"
              min="0"
            />
            {amount && (
              <button
                type="button"
                onClick={() => {
                  setAmount("");
                  setError("");
                }}
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gray-600 text-gray-500 transition-all hover:text-white active:scale-90"
                aria-label="Clear amount"
              >
                <X size={11} />
              </button>
            )}
          </div>
          {touched && error && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
              <AlertCircle size={11} />
              {error}
            </p>
          )}
        </div>

        {/* ============================================= */}
        {/* RECHARGE INSTRUCTIONS                         */}
        {/* ============================================= */}
        <div className="mb-5 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <Banknote size={15} className="text-[#B45CFF]" />
            Recharge instructions
          </h2>

          <ul className="space-y-2">
            {[
              "If the transfer time is up, please fill out the deposit form again.",
              "The transfer amount must match the order you created, otherwise the money cannot be credited successfully.",
              "If you transfer the wrong amount, our company will not be responsible for the lost amount!",
              "Minimum deposit: " +
                formatCurrency(channelMin) +
                ", Maximum deposit: " +
                formatCurrency(channelMax) +
                ".",
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
        {/* DEPOSIT HISTORY                               */}
        {/* ============================================= */}
        <div className="mb-3 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-[#B45CFF] to-[#7418F5]" />
          <h2 className="text-sm font-bold text-white">Deposit history</h2>
        </div>

        <div className="space-y-2.5">
          {!deposits || deposits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2a1b3d] bg-[#1C0F2B] py-8 text-center">
              <p className="text-xs text-gray-500">No deposits yet</p>
            </div>
          ) : (
            <>
              {deposits.slice(0, 5).map((item) => {
                const status = statusInfo(item.status);
                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-3.5 transition-all hover:border-[#9B59B6]/50"
                  >
                    {/* top row — tag + status */}
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <span className="rounded-md bg-gradient-to-r from-[#B45CFF] to-[#7418F5] px-2.5 py-1 text-[10px] font-bold text-white">
                        Deposit
                      </span>
                      <span className={`text-[11px] font-bold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Order amount</span>
                        <span className="font-bold text-white">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Type</span>
                        <span className="font-semibold text-gray-300">
                          {item.methodTitle || item.method || "Deposit"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Time</span>
                        <span className="text-gray-300">
                          {new Date(item.createdAt || item.requestedAt).toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">UTR number</span>
                        <span className="max-w-[150px] truncate font-mono text-[10px] text-gray-400">
                          {item.transactionId || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => navigate("/deposit-history")}
                className="w-full rounded-full border border-[#C77AFF]/60 bg-[#1C0F2B] py-3 text-xs font-bold text-[#B45CFF] transition-all hover:bg-[#2a1b3d] active:scale-[0.98]"
              >
                All history
              </button>
            </>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* STICKY BOTTOM BAR — above the app bottom nav  */}
      {/* ============================================= */}
      <div className="fixed inset-x-0 bottom-[72px] z-40 border-t border-[#2a1b3d] bg-[#0B0410]/95 px-4 py-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500">Recharge Method:</p>
            <p className="truncate text-xs font-bold text-white">
              {selectedMethod?.title || "—"}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            {amount && (
              <div className="text-right">
                <p className="text-[10px] text-gray-500">Amount</p>
                <p className="text-sm font-bold text-[#B45CFF]">
                  {formatCurrency(amount)}
                </p>
              </div>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={proceedHandler}
              className={`rounded-xl px-6 py-3 text-sm font-bold text-white transition-all active:scale-[0.98] ${
                loading
                  ? "cursor-not-allowed bg-[#2a1b3d] text-gray-500"
                  : "border border-[#C77AFF] bg-gradient-to-r from-[#B45CFF] via-[#7418F5] to-[#3A00C9] shadow-[0_0_12px_rgba(180,92,255,0.5)]"
              }`}
            >
              {loading ? "..." : "Deposit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
