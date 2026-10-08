// pages/WalletDashboard.jsx
//
// /wallet — same design language as /deposit, /deposit-history and
// /withdrawal-history:
//   back-button header -> gradient balance card -> deposit/withdrawal
//   tiles -> deposit history cards -> withdrawal history cards
// -> "All history" pill buttons. No page-level bottom nav — the global
// app navbar already renders it.

import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfile } from "../redux/slices/authSlice";
import { getMyDeposits } from "../redux/slices/depositSlice";
import { fetchWithdrawalHistory } from "../redux/slices/withdrawalSlice";

const accentGradient =
  "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_10px_rgba(180,92,255,0.5)]";

const statusInfo = (status) => {
  const value = String(status).toLowerCase();
  if (["success", "approved", "completed"].includes(value))
    return { label: "Success", cls: "text-[#00E676]" };
  if (["pending", "processing"].includes(value))
    return { label: "Pending", cls: "text-[#F1C40F]" };
  if (["failed", "rejected"].includes(value))
    return { label: "Failed", cls: "text-red-400" };
  if (value === "cancelled") return { label: "Cancelled", cls: "text-gray-400" };
  return { label: status || "Pending", cls: "text-gray-400" };
};

const WalletDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { deposits, loading: isDepositLoading } = useSelector(
    (state) => state.deposit,
  );
  const { history: withdrawals, loading: isWithdrawalLoading } = useSelector(
    (state) => state.withdrawal,
  );

  const [showcredit, setShowcredit] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getMyDeposits());
    dispatch(fetchWithdrawalHistory());
  }, [dispatch]);

  const currencySymbol = "₹";

  const formatAmount = (amount) => {
    const num = Number(amount);
    if (!Number.isFinite(num)) return `${currencySymbol}0.00`;
    return `${currencySymbol}${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await dispatch(getProfile());
    setTimeout(() => setRefreshing(false), 600);
  };

  const copyValue = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  // Copyable row — /deposit-history jaisa: mono value + copy icon
  const CopyRow = ({ label, value, copyLabel }) => {
    const text = String(value || "").trim();

    return (
      <div className="flex justify-between gap-2">
        <span className="text-gray-500">{label}</span>
        <span className="flex items-center gap-1.5">
          <span className="max-w-[150px] truncate font-mono text-[10px] text-gray-400">
            {text || "—"}
          </span>
          {text && (
            <button
              type="button"
              onClick={() => copyValue(text, copyLabel || label)}
              className="text-gray-500 transition-all hover:text-[#B45CFF] active:scale-90"
              aria-label={`Copy ${copyLabel || label}`}
            >
              <Copy size={11} />
            </button>
          )}
        </span>
      </div>
    );
  };

  // =============================================
  // HISTORY ENTRY CARD — /deposit-history style:
  // tag + status, then Order amount / Type / Time /
  // Order number / UTR number / Remarks rows
  // =============================================

  const HistoryCard = ({ tag, item, isDeposit }) => {
    const status = statusInfo(item.status);

    const order = isDeposit
      ? item.depositRef || item._id
      : item.orderNumber || item._id || "";
    const utr = String(item.transactionId || "").trim();
    const remark = item.remark || (!isDeposit && item.adminRemark) || "";
    const type = isDeposit
      ? item.methodTitle || item.method || "DEPOSIT"
      : item.paymentMethod || item.methodTitle || item.method || "WITHDRAWAL";

    return (
      <div className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-3.5 transition-all hover:border-[#9B59B6]/50">
        {/* top row — tag + status */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="rounded-md bg-gradient-to-r from-[#B45CFF] to-[#7418F5] px-2.5 py-1 text-[10px] font-bold text-white">
            {tag}
          </span>
          <span className={`text-[11px] font-bold ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* detail rows */}
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Order amount</span>
            <span className="font-bold text-white">
              {formatAmount(item.amount)}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Type</span>
            <span className="font-semibold text-gray-300">
              {String(type).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Time</span>
            <span className="text-gray-300">
              {formatDate(item.createdAt || item.requestedAt)}
            </span>
          </div>

          <CopyRow label="Order number" value={order} />

          {/* UTR — deposits only */}
          {isDeposit && <CopyRow label="UTR number" value={utr} />}

          {/* Remarks — withdrawal par hamesha (— fallback), deposit par jab ho */}
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Remarks</span>
            <span className="max-w-[170px] truncate text-gray-400">
              {remark || "—"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // =============================================
  // SECTION — accent-bar title + entries + view-all
  // =============================================

  const HistorySection = ({
    title,
    tag,
    items,
    loading,
    emptyText,
    actionText,
    onViewAll,
    isDeposit,
  }) => (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-[#B45CFF] to-[#7418F5]" />
          <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-semibold text-[#B45CFF] transition-all active:scale-95"
        >
          View all
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-10">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2a1b3d] border-t-[#B45CFF]" />
          <span className="ml-2.5 text-xs font-medium text-gray-400">
            Loading...
          </span>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a1b3d] bg-[#1C0F2B] py-8 text-center">
          <p className="text-xs text-gray-500">{emptyText}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {items.slice(0, 5).map((item, i) => (
              <HistoryCard
                key={item._id || item.id || i}
                tag={tag}
                item={item}
                isDeposit={isDeposit}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="mt-3 w-full rounded-full border border-[#C77AFF]/60 bg-[#1C0F2B] py-3 text-xs font-bold text-[#B45CFF] transition-all hover:bg-[#2a1b3d] active:scale-[0.98]"
          >
            {actionText}
          </button>
        </>
      )}
    </>
  );

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="min-h-screen bg-[#0B0410] pb-10">
      <div className="mx-auto max-w-md px-4 pt-4">
        {/* ============================================= */}
        {/* HEADER — back / title / (spacer)              */}
        {/* ============================================= */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-white transition-all active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-white">
            Wallet
          </h1>
          <span className="w-9 flex-shrink-0" />
        </div>

        {/* ============================================= */}
        {/* BALANCE CARD — /deposit style + wallet image  */}
        {/* ============================================= */}
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] p-4 shadow-[0_8px_28px_rgba(116,24,245,0.45)]">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-white/80" />
                <span className="text-[11px] font-semibold text-white/80">
                  Balance
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2.5">
                <p className="text-3xl font-extrabold tracking-tight text-white">
                  {showcredit
                    ? formatAmount(user?.credit)
                    : "••••••"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowcredit(!showcredit)}
                  className="text-white/70 transition-all hover:text-white"
                  aria-label="Toggle balance visibility"
                >
                  {showcredit ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
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

              <div className="mt-3 flex gap-3 text-white/60">
                <span className="text-[10px] tracking-[0.3em]">••••</span>
                <span className="text-[10px] tracking-[0.3em]">••••</span>
              </div>
            </div>

            {/* Wallet illustration — wapas, purane design jaisi */}
            <img
              src="https://i.ibb.co/8gXCwzjp/wallet.png"
              alt="Wallet illustration"
              className="-mr-4 h-[110px] w-[170px] flex-shrink-0 object-contain opacity-90"
            />
          </div>
        </div>

        {/* ============================================= */}
        {/* DEPOSIT / WITHDRAWAL TILES                    */}
        {/* ============================================= */}
        <div className="mb-6 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/deposit")}
            className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-4 transition-all hover:border-[#9B59B6]/50 active:scale-95"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00E676]/15">
              <ArrowDownLeft size={16} className="text-[#00E676]" />
            </span>
            <span className="text-[11px] font-bold text-gray-300">
              Deposit
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/withdrawal")}
            className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-4 transition-all hover:border-[#9B59B6]/50 active:scale-95"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1C40F]/15">
              <ArrowUpRight size={16} className="text-[#F1C40F]" />
            </span>
            <span className="text-[11px] font-bold text-gray-300">
              Withdrawal
            </span>
          </button>
        </div>

        {/* ============================================= */}
        {/* DEPOSIT HISTORY                               */}
        {/* ============================================= */}
        <div className="mb-6">
          <HistorySection
            title="Deposit history"
            tag="Deposit"
            items={deposits}
            loading={isDepositLoading}
            emptyText="No deposits yet"
            actionText="All history"
            onViewAll={() => navigate("/deposit-history")}
            isDeposit={true}
          />
        </div>

        {/* ============================================= */}
        {/* WITHDRAWAL HISTORY                            */}
        {/* ============================================= */}
        <div className="mb-4">
          <HistorySection
            title="Withdrawal history"
            tag="Withdrawal"
            items={withdrawals}
            loading={isWithdrawalLoading}
            emptyText="No withdrawals yet"
            actionText="All history"
            onViewAll={() => navigate("/withdrawal-history")}
            isDeposit={false}
          />
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
