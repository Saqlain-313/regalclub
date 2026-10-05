// pages/WalletDashboard.jsx
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Gift,
  History,
  Home,
  User,
  Wallet,
  Wallet as WalletIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getMyDeposits } from "../redux/slices/depositSlice";
import { fetchWithdrawalHistory } from "../redux/slices/withdrawalSlice";

// ======================================================
// COMPONENT
// ======================================================

export default function WalletDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showcredit, setShowcredit] = useState(true);

  // ======================================================
  // CURRENCY SYMBOL
  // ======================================================

  // India-only platform — currency is always INR
  const getCurrencySymbol = () => "₹";

  const currencySymbol = getCurrencySymbol();

  // ======================================================
  // REDUX STATE
  // ======================================================

  const depositState = useSelector((state) => state.deposit);
  const withdrawalState = useSelector((state) => state.withdrawal);

  const depositsFromStore = depositState?.deposits || [];
  const withdrawalsFromStore = withdrawalState?.history || [];
  const isDepositLoading = depositState?.loading || false;
  const isWithdrawalLoading = withdrawalState?.loading || false;

  const walletcredit = user?.credit;

  // ======================================================
  // EFFECTS
  // ======================================================

  useEffect(() => {
    dispatch(getMyDeposits());
    dispatch(fetchWithdrawalHistory());
  }, [dispatch]);

  // ======================================================
  // FORMAT FUNCTIONS
  // ======================================================

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const depositStatus = (s) => {
    // "approved" ko user ko "Success" dikhao (deposit-history jaisa)
    const t = String(s || "").toLowerCase();
    if (t === "approved") return "Success";
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Success";
  };

  const normalizeDeposit = (d) => ({
    id: d.depositRef || d.transactionId || d.id || d._id?.slice(-8).toUpperCase() || "N/A",
    date: d.date || formatDate(d.createdAt || d.requestedAt),
    amount: d.amount,
    status: depositStatus(d.status),
  });

  const normalizeWithdrawal = (w) => ({
    id: w.depositRef || w.id || w._id?.slice(-8).toUpperCase() || "N/A",
    date: w.date || formatDate(w.requestedAt || w.createdAt),
    amount: w.amount,
    status: depositStatus(w.status),
  });

  const deposits = depositsFromStore.map(normalizeDeposit);
  const withdrawals = withdrawalsFromStore.map(normalizeWithdrawal);

  const formatAmount = (amount) =>
    `${currencySymbol}${Number(amount).toLocaleString("en-IN")}`;

  const formatcredit = (amount) =>
    `${currencySymbol}${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const statusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending")
      return "bg-[#F1C40F]/15 text-[#F1C40F] border border-[#F1C40F]/30";
    if (s === "failed" || s === "rejected")
      return "bg-red-500/15 text-red-400 border border-red-500/30";
    if (s === "processing")
      return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    return "bg-[#9B59B6]/15 text-[#9B59B6] border border-[#9B59B6]/30";
  };

  // ======================================================
  // HISTORY-STYLE CARD TOKENS (same as /deposit-history
  // aur /withdrawal-history pages)
  // ======================================================

  const cardBase =
    "bg-[#150D22]/90 border border-[#2a1b3d] shadow-[0_4px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]";

  const statusConfig = (status) => {
    const value = String(status || "").toLowerCase();

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

  // ======================================================
  // EMPTY STATE COMPONENT
  // ======================================================

  const EmptyState = ({
    type,
    icon: Icon,
    title,
    description,
    actionText,
    onAction,
  }) => {
    const isDeposit = type === "deposit";

    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#2a1b3d] flex items-center justify-center mb-3">
          <Icon className="w-7 h-7 text-gray-500" strokeWidth={1.5} />
        </div>
        <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-400 max-w-[200px] mb-4">
          {description}
        </p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-xs font-semibold text-white hover:shadow-[0_4px_12px_rgba(155,89,182,0.6)] hover:scale-[1.02] transition-all"
          >
            {actionText}
          </button>
        )}
      </div>
    );
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0B0410] pb-28 font-sans relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-64 h-64 bg-[#B45CFF]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-[#8E44AD]/10 rounded-full blur-3xl" />

      <div className="relative max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-6 pb-4 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75)] flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">
                Wallet
              </h1>
              <p className="text-[11px] text-gray-400">
                Manage your balance
              </p>
            </div>
          </div>
          <button>
            <Bell className="w-6 h-6 text-gray-300" strokeWidth={1.8} />
          </button>
        </div>

        {/* credit Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] px-5 py-5 mb-4 shadow-[0_10px_36px_rgba(58,0,201,0.45)]">
          <div
            className="absolute inset-0 opacity-[0.14] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="pointer-events-none absolute -right-10 -bottom-14 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black tracking-[0.18em] text-white/75 uppercase mb-1.5">
                Current Wallet Credit
              </p>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[30px] leading-none font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                  {showcredit ? formatcredit(walletcredit) : "••••••••"}
                </h2>
                <button onClick={() => setShowcredit(!showcredit)}>
                  {showcredit ? (
                    <Eye className="w-4 h-4 text-white/70" strokeWidth={1.8} />
                  ) : (
                    <EyeOff
                      className="w-4 h-4 text-white/70"
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              </div>
              <div className="border-t border-white/20 pt-3">
                <span className="text-[11px] font-bold tracking-wider text-white/75 uppercase">
                  Available Credit{" "}
                </span>
                <span className="text-sm font-black text-white ml-1">
                  {formatcredit(walletcredit)}
                </span>
              </div>
            </div>
            <img
              src="https://i.ibb.co/8gXCwzjp/wallet.png"
              alt="Wallet illustration"
              className="w-[190px] h-[110px] object-contain -mr-4 flex-shrink-0 opacity-90"
            />
          </div>
        </div>

        {/* Deposit / Withdrawal buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Link
            to="/deposit"
            className="flex items-center gap-2.5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] px-3.5 py-3.5 hover:border-[#9B59B6]/50 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-[#9B59B6]/15 flex items-center justify-center flex-shrink-0 border border-[#9B59B6]/30">
              <ArrowDownLeft
                className="w-4 h-4 text-[#9B59B6]"
                strokeWidth={2.2}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#9B59B6] leading-tight">
                Deposit
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">
                Add money to wallet
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </Link>

          <Link
            to="/withdrawal"
            className="flex items-center gap-2.5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] px-3.5 py-3.5 hover:border-[#9B59B6]/50 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-[#3498DB]/15 flex items-center justify-center flex-shrink-0 border border-[#3498DB]/30">
              <ArrowUpRight
                className="w-4 h-4 text-[#3498DB]"
                strokeWidth={2.2}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3498DB] leading-tight">
                Withdrawal
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">
                Withdraw to bank
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </Link>
        </div>

        {/* Last 10 Deposits */}
        <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2a1b3d] mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h3 className="text-[15px] font-semibold text-[#9B59B6]">
              Last 10 Deposits
            </h3>
            <button
              onClick={() => navigate("/deposit-history")}
              className="flex items-center gap-0.5 text-sm font-medium text-[#9B59B6]"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isDepositLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#9B59B6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deposits.length === 0 ? (
            <EmptyState
              type="deposit"
              icon={CircleDollarSign}
              title="No Deposits Yet"
              description="Start your investment journey by making your first deposit today!"
              actionText="Make a Deposit"
              onAction={() => navigate("/deposit")}
            />
          ) : (
            <>
              <div className="px-4 pb-4 space-y-3">
                {depositsFromStore.slice(0, 5).map((d, i) => {
                  const status = statusConfig(d.status);

                  return (
                    <div
                      key={d._id || d.id || i}
                      className={`relative rounded-2xl ${cardBase} p-4 overflow-hidden transition-all duration-200 hover:border-[#B45CFF]/40`}
                    >
                      {/* Left accent bar */}
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-[3px] ${status.bar}`}
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-lg font-black text-white leading-none">
                            {formatAmount(d.amount)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500">
                            <CreditCard size={10} />
                            {d.methodTitle || d.methodType || "Deposit"}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex-shrink-0 ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Txn ID */}
                      <div className="mt-3 flex items-center gap-1.5 bg-[#12061C] rounded-xl border border-[#2a1b3d] px-3 py-2">
                        <FileText size={11} className="text-[#B45CFF] flex-shrink-0" />
                        <span className="text-[10px] font-mono text-gray-300 truncate">
                          {d.depositRef || d.transactionId || d._id || "—"}
                        </span>
                      </div>

                      {/* Date time */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(d.createdAt || d.requestedAt)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate("/deposit-history")}
                className="w-full flex items-center justify-center gap-1 text-sm font-medium text-[#9B59B6] py-3 border-t border-[#2a1b3d]"
              >
                View All Deposits <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Last 10 Withdrawals */}
        <div className="bg-[#1C0F2B] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2a1b3d] mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h3 className="text-[15px] font-semibold text-[#9B59B6]">
              Last 10 Withdrawals
            </h3>
            <button
              onClick={() => navigate("/withdrawal-history")}
              className="flex items-center gap-0.5 text-sm font-medium text-[#9B59B6]"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isWithdrawalLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#9B59B6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : withdrawals.length === 0 ? (
            <EmptyState
              type="withdrawal"
              icon={History}
              title="No Withdrawals Yet"
              description="You haven't made any withdrawals yet. Your funds are safe and ready when you need them."
              actionText="Withdraw Now"
              onAction={() => navigate("/withdrawal")}
            />
          ) : (
            <>
              <div className="px-4 pb-4 space-y-3">
                {withdrawalsFromStore.slice(0, 5).map((w, i) => {
                  const status = statusConfig(w.status);

                  return (
                    <div
                      key={w._id || w.id || i}
                      className={`relative rounded-2xl ${cardBase} p-4 overflow-hidden transition-all duration-200 hover:border-[#B45CFF]/40`}
                    >
                      {/* Left accent bar */}
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-[3px] ${status.bar}`}
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-lg font-black text-white leading-none">
                            {formatAmount(w.amount)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500">
                            <CreditCard size={10} />
                            {w.method || w.methodTitle || "Withdrawal"}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex-shrink-0 ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Txn / reference */}
                      <div className="mt-3 flex items-center gap-1.5 bg-[#12061C] rounded-xl border border-[#2a1b3d] px-3 py-2">
                        <FileText size={11} className="text-[#B45CFF] flex-shrink-0" />
                        <span className="text-[10px] font-mono text-gray-300 truncate">
                          {w.transactionId || w._id || "—"}
                        </span>
                      </div>

                      {/* Date time */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(w.createdAt || w.requestedAt)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate("/withdrawal-history")}
                className="w-full flex items-center justify-center gap-1 text-sm font-medium text-[#9B59B6] py-3 border-t border-[#2a1b3d]"
              >
                View All Withdrawals <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0410] border-t border-[#2a1b3d]">
        <div className="max-w-md mx-auto px-2 relative">
          <div className="flex items-end justify-between py-2 px-2">
            <button
              onClick={() => navigate("/")}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#9B59B6] py-1 w-1/5 transition-colors"
            >
              <Home className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button
              onClick={() => navigate("/activity")}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#9B59B6] py-1 w-1/5 transition-colors"
            >
              <ClipboardList className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Activity</span>
            </button>

            {/* Center raised Promo button */}
            <div className="flex flex-col items-center w-1/5 -mt-8">
              <button
                onClick={() => navigate("/promo")}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-[#9B59B6] to-[#8E44AD] shadow-[0_4px_12px_rgba(155,89,182,0.5)] flex items-center justify-center border-4 border-[#0B0410]"
              >
                <Gift className="w-6 h-6 text-white" strokeWidth={2} />
              </button>
              <span className="text-[10px] font-semibold text-[#9B59B6] mt-0.5">
                For Promo
              </span>
            </div>

            <button
              onClick={() => navigate("/wallet")}
              className="flex flex-col items-center gap-1 text-[#9B59B6] py-1 w-1/5"
            >
              <WalletIcon className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Wallet</span>
            </button>
            <button
              onClick={() => navigate("/account")}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#9B59B6] py-1 w-1/5 transition-colors"
            >
              <User className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
