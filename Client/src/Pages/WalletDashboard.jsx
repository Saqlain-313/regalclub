// pages/WalletDashboard.jsx
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Eye,
  EyeOff,
  Gift,
  History,
  Home,
  User,
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

  const normalizeDeposit = (d) => ({
    id: d.id || d._id?.slice(-8).toUpperCase() || "N/A",
    date: d.date || formatDate(d.createdAt || d.requestedAt),
    amount: d.amount,
    status: d.status
      ? d.status.charAt(0).toUpperCase() + d.status.slice(1)
      : "Success",
  });

  const normalizeWithdrawal = (w) => ({
    id: w.id || w._id?.slice(-8).toUpperCase() || "N/A",
    date: w.date || formatDate(w.requestedAt || w.createdAt),
    amount: w.amount,
    status: w.status
      ? w.status.charAt(0).toUpperCase() + w.status.slice(1)
      : "Success",
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
    <div className="min-h-screen bg-[#0B0410] pb-28 font-sans">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-6 pb-4 flex items-center justify-between relative">
          <h1 className="text-xl font-semibold text-white">Wallet</h1>
          <button>
            <Bell className="w-6 h-6 text-gray-300" strokeWidth={1.8} />
          </button>
        </div>

        {/* credit Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#9B59B6]/40 bg-gradient-to-br from-[#1C0F2B] to-[#2a1b3d] px-5 py-5 mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-white mb-1.5">
                Current Wallet credit
              </p>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[28px] leading-none font-bold text-gray-300 tracking-tight">
                  {showcredit ? formatcredit(walletcredit) : "••••••••"}
                </h2>
                <button onClick={() => setShowcredit(!showcredit)}>
                  {showcredit ? (
                    <Eye className="w-4 h-4 text-gray-400" strokeWidth={1.8} />
                  ) : (
                    <EyeOff
                      className="w-4 h-4 text-gray-400"
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              </div>
              <div className="border-t border-[#9B59B6]/30 pt-3">
                <span className="text-sm text-gray-400">
                  Available credit{" "}
                </span>
                <span className="text-sm font-semibold text-white ml-1">
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
              <div>
                {deposits.slice(0, 5).map((d, i) => (
                  <div
                    key={d.id || i}
                    className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a1b3d]/50 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#9B59B6]/15 flex items-center justify-center flex-shrink-0 border border-[#9B59B6]/30">
                        <ArrowDownLeft
                          className="w-3.5 h-3.5 text-[#9B59B6]"
                          strokeWidth={2.2}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          #{d.id}
                        </p>
                        <p className="text-xs text-gray-400">{d.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                      <span className="text-sm font-semibold text-white">
                        {formatAmount(d.amount)}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusBadgeClass(d.status)}`}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
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
              <div>
                {withdrawals.slice(0, 5).map((w, i) => (
                  <div
                    key={w.id || i}
                    className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a1b3d]/50 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#9B59B6]/15 flex items-center justify-center flex-shrink-0 border border-[#9B59B6]/30">
                        <ArrowUpRight
                          className="w-3.5 h-3.5 text-[#9B59B6]"
                          strokeWidth={2.2}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          #{w.id}
                        </p>
                        <p className="text-xs text-gray-400">{w.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                      <span className="text-sm font-semibold text-white">
                        {formatAmount(w.amount)}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusBadgeClass(w.status)}`}
                      >
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))}
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
