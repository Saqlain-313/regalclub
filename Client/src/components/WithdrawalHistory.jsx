import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearWithdrawalError,
  fetchWithdrawalHistory,
  selectHistoryError,
  selectHistoryLoading,
  selectPagination,
  selectWithdrawalHistory,
} from "../redux/slices/withdrawalSlice";

// ======================================================
// THEME TOKENS — VIP purple gradient system
// ======================================================

const accentGradient =
  "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9]";
const accentGlow =
  "shadow-[0_0_10px_rgba(180,92,255,0.35),0_4px_20px_rgba(58,0,201,0.35)]";
const cardBase =
  "bg-[#150D22]/90 border border-[#2a1b3d] shadow-[0_4px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]";
const statBox = "bg-[#12061C] rounded-xl border border-[#2a1b3d] px-3 py-2";

// ======================================================
// STATUS CONFIG — user-facing labels
// "approved"/"completed" is shown to users as "Success"
// ======================================================

const statusConfig = (status) => {
  const value = String(status).toLowerCase();

  if (["success", "approved", "completed"].includes(value)) {
    return {
      label: "Success",
      badge: "text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30",
      bar: "bg-gradient-to-b from-[#00E676] to-transparent",
    };
  }
  if (["pending", "processing"].includes(value)) {
    return {
      label: "Pending",
      badge: "text-[#F1C40F] bg-[#F1C40F]/10 border border-[#F1C40F]/30",
      bar: "bg-gradient-to-b from-[#F1C40F] to-transparent",
    };
  }
  if (["failed", "rejected"].includes(value)) {
    return {
      label: "Failed",
      badge: "text-red-400 bg-red-500/10 border border-red-500/30",
      bar: "bg-gradient-to-b from-red-500 to-transparent",
    };
  }
  return {
    label: status || "Pending",
    badge: "text-gray-400 bg-gray-500/10 border border-gray-500/30",
    bar: "bg-gradient-to-b from-gray-500 to-transparent",
  };
};

export default function WithdrawalHistory() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  // Redux selectors
  const withdrawals = useSelector(selectWithdrawalHistory);
  const loading = useSelector(selectHistoryLoading);
  const error = useSelector(selectHistoryError);
  const pagination = useSelector(selectPagination);

  // Fetch withdrawal history on component mount / page change
  useEffect(() => {
    dispatch(
      fetchWithdrawalHistory({
        page: currentPage,
        limit: 10,
      }),
    );

    return () => {
      dispatch(clearWithdrawalError());
    };
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
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

  const formatAmount = (amount) => {
    const num = Number(amount);
    if (!Number.isFinite(num)) return "₹0";
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Summary stats
  const totalAmount = withdrawals.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const successCount = withdrawals.filter((item) =>
    ["success", "approved", "completed"].includes(
      String(item.status).toLowerCase(),
    ),
  ).length;

  return (
    <div className="min-h-screen bg-[#0B0410] overflow-hidden relative pb-10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-64 h-64 bg-[#B45CFF]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-[#8E44AD]/10 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 py-6">
        <div className="max-w-md w-full mx-auto">
          {/* ===== Header ===== */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl ${accentGradient} ${accentGlow} border border-[#C77AFF] flex items-center justify-center flex-shrink-0`}
              >
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight tracking-wide">
                  Withdrawal History
                </h1>
                <p className="text-[11px] text-gray-400">
                  Your withdrawal transactions
                </p>
              </div>
            </div>
          </div>

          {/* ===== Stats strip ===== */}
          {withdrawals.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className={`${cardBase} rounded-2xl p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText size={11} className="text-[#B45CFF]" />
                  <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                    Total
                  </span>
                </div>
                <p className="text-sm font-black text-white">
                  {withdrawals.length}
                </p>
              </div>
              <div className={`${cardBase} rounded-2xl p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet size={11} className="text-[#F1C40F]" />
                  <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                    Amount
                  </span>
                </div>
                <p className="text-sm font-black text-white">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className={`${cardBase} rounded-2xl p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={11} className="text-[#00E676]" />
                  <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                    Success
                  </span>
                </div>
                <p className="text-sm font-black text-[#00E676]">
                  {successCount}
                </p>
              </div>
            </div>
          )}

          {/* ===== List ===== */}
          {loading ? (
            <div className="flex items-center justify-center gap-2.5 bg-[#150D22]/90 border border-[#2a1b3d] rounded-2xl p-10">
              <span className="w-5 h-5 border-2 border-[#2a1b3d] border-t-[#B45CFF] rounded-full animate-spin" />
              <span className="text-sm text-gray-400 font-medium">
                Loading withdrawals...
              </span>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="relative bg-[#150D22]/90 border border-[#2a1b3d] rounded-3xl p-10 text-center overflow-hidden">
              <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 w-40 h-32 bg-[#7418F5]/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl border border-[#B45CFF]/30 bg-[#B45CFF]/10 flex items-center justify-center">
                  <ArrowUpRight className="w-8 h-8 text-[#B45CFF]/70" />
                </div>
                <p className="text-sm font-black text-white tracking-wide">
                  No withdrawals yet
                </p>
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                  Request your first withdrawal and it
                  <br />
                  will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((item) => {
                const status = statusConfig(item.status);

                return (
                  <div
                    key={item._id || item.id}
                    className={`relative rounded-2xl ${cardBase} p-4 overflow-hidden transition-all duration-200 hover:border-[#B45CFF]/40`}
                  >
                    {/* Left accent bar */}
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-[3px] ${status.bar}`}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-black text-white leading-none">
                          {formatAmount(item.amount)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500">
                          <CreditCard size={10} />
                          {item.method || "Withdrawal"}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex-shrink-0 ${status.badge}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Txn / reference */}
                    {(item.transactionId || item._id || item.id) && (
                      <div className="mt-3 flex items-center gap-1.5 bg-[#12061C] rounded-xl border border-[#2a1b3d] px-3 py-2">
                        <FileText size={11} className="text-[#B45CFF] flex-shrink-0" />
                        <span className="text-[10px] font-mono text-gray-300 truncate">
                          {item.transactionId || item._id || item.id}
                        </span>
                      </div>
                    )}

                    {/* Date time */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.createdAt || item.date)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== Pagination ===== */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-5 py-2.5 rounded-xl bg-[#150D22]/90 border border-[#2a1b3d] text-xs font-bold text-gray-300 hover:border-[#B45CFF]/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-5 py-2.5 rounded-xl bg-[#150D22]/90 border border-[#2a1b3d] text-xs font-bold text-gray-300 hover:border-[#B45CFF]/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
