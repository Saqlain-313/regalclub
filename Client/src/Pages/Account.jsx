import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Circle,
  ClipboardList,
  Coins,
  Copy,
  Crown,
  Gift,
  History,
  HistoryIcon,
  Key,
  LogOut,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../hooks/toast";
import { logout } from "../redux/slices/authSlice";

// ======================================================
// COUNTRY CONFIGURATION
// ======================================================

const countryAliases = {
  india: "india",
  in: "india",
  australia: "australia",
  au: "australia",
  pakistan: "pakistan",
  pk: "pakistan",
  canada: "canada",
  ca: "canada",
  nepal: "nepal",
  np: "nepal",
  uae: "uae",
  ae: "uae",
  dubai: "uae",
};

const getCountryPath = (countryCode) => {
  const countryMap = {
    IN: "india",
    AU: "australia",
    PK: "pakistan",
    CA: "canada",
    NP: "nepal",
    UAE: "uae",
  };

  const country = countryCode?.toUpperCase();
  return countryMap[country] || "india";
};

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  // ======================================================
  // Get user's country for dynamic routing
  // ======================================================

  const userCountry = user?.country || "IN";
  const countryPath = getCountryPath(userCountry);

  // ======================================================
  // ACCOUNT MENU ITEMS WITH DYNAMIC PATHS
  // ======================================================

  const accountMenuItems = [
    {
      icon: User,
      label: "Profile",
      path: "/profile",
      iconColor: "text-blue-400",
      description: "View and edit your profile",
      group: "more",
    },
    {
      icon: Coins,
      label: "Deposit",
      path: "/deposit",
      iconColor: "text-[#9B59B6]",
      description: "Add money to your wallet",
      group: "top",
    },
    {
      icon: History,
      label: "Deposit History",
      path: "/deposit-history",
      iconColor: "text-[#F1C40F]",
      description: "Check your all deposit history",
      group: "history",
    },
    {
      icon: HistoryIcon,
      label: "Powerhit History",
      path: `/${countryPath}/powerhit/history`,
      iconColor: "text-purple-400",
      description: "Check your powerhit history",
      group: "history",
    },
    {
      icon: ArrowUpRight,
      label: "Withdrawal",
      path: "/withdrawal",
      iconColor: "text-[#F1C40F]",
      description: "Withdraw to your bank",
      group: "top",
    },
    {
      icon: ArrowDownLeft,
      label: "Withdrawal History",
      path: "/withdrawal-history",
      iconColor: "text-blue-400",
      description: "Check your all withdrawal history",
      group: "history",
    },
    {
      icon: Gift,
      label: "Refer & Earn",
      path: "/promo",
      iconColor: "text-pink-400",
      description: "Invite friends & earn rewards",
      group: "more",
    },
    {
      icon: ClipboardList,
      label: "Matka Bet History",
      path: "/matka/bids-history",
      iconColor: "text-violet-400",
      description: "Check your all bet history",
      group: "history",
    },
    {
      icon: Key,
      label: "Change Password",
      path: "/change-password",
      iconColor: "text-[#F1C40F]",
      description: "Update your account password",
      group: "more",
    },
    {
      icon: MessageCircle,
      label: "Support Chat",
      path: "/support-chat",
      iconColor: "text-cyan-400",
      description: "Help & support center",
      group: "more",
    },
  ];

  const topCards = accountMenuItems.filter((i) => i.group === "top");
  const historyItems = accountMenuItems.filter((i) => i.group === "history");
  const moreOptions = accountMenuItems.filter((i) => i.group === "more");

  const getUserDisplayName = () => user?.name || user?.username || "Player123";
  const getUserUID = () => user?.userId || "WINZOX123456";
  const getUserPhone = () => user?.mobile || "+91 98765 43210";

  const copyUID = async () => {
    try {
      await navigator.clipboard.writeText(getUserUID());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy UID:", error);
    }
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const handleCancelLogout = () => {
    if (isLoggingOut) return;
    setShowLogoutConfirm(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await dispatch(logout()).unwrap();
      showSuccessToast(
        "Logged Out",
        result?.message || "You've been logged out successfully.",
      );
      setShowLogoutConfirm(false);
      navigate("/login");
    } catch (error) {
      showErrorToast(
        "Logout Failed",
        error || "Something went wrong. Try again.",
      );
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0B0410] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Profile Card */}
        <Link
          to="/profile"
          className="flex items-center gap-4 rounded-2xl bg-[#1C0F2B] border border-[#9B59B6]/40 p-4 mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:border-[#9B59B6]/60 transition-all"
        >
          {/* Profile Picture / Avatar */}
          <div className="w-20 h-20 rounded-full border-2 border-[#9B59B6] flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#2a1b3d]">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={getUserDisplayName()}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-[#9B59B6]">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  `;
                }}
              />
            ) : (
              <User size={38} className="text-[#9B59B6]" strokeWidth={1.5} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white truncate uppercase">
                {getUserDisplayName()}
              </h2>
              <span className="w-6 h-6 rounded-md bg-[#9B59B6]/20 border border-[#9B59B6]/40 flex items-center justify-center flex-shrink-0">
                <Crown size={13} className="text-[#9B59B6]" />
              </span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                copyUID();
              }}
              className="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5"
            >
              UID: WINZOX{getUserUID()}
              <Copy
                size={13}
                className={copied ? "text-[#00E676]" : "text-gray-500"}
              />
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-gray-300">
                <Phone size={14} className="text-gray-500" />
                {getUserPhone()}
              </span>

              <span className="flex items-center gap-1 text-xs font-bold text-[#9B59B6] border border-[#9B59B6]/40 bg-[#9B59B6]/10 rounded-full px-2.5 py-0.5">
                Verified
                <ShieldCheck size={12} />
              </span>

              <span className="flex items-center gap-1 text-xs font-bold text-blue-400 border border-blue-400/40 bg-blue-400/10 rounded-full px-2.5 py-0.5">
                {user?.country || "IN"}
              </span>
            </div>
          </div>

          <ChevronRight size={20} className="text-gray-500 flex-shrink-0" />
        </Link>

        {/* Deposit / Withdrawal */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {topCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.path}
                className="rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-[#9B59B6]/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon
                    size={26}
                    className="text-[#9B59B6]"
                    strokeWidth={1.8}
                  />
                  <ChevronRight size={16} className="text-gray-500 mt-1" />
                </div>
                <p className="text-base font-bold text-white">{card.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* History */}
        <h3 className="text-sm font-black text-[#9B59B6] tracking-wide mb-2">
          HISTORY
        </h3>
        <div className="rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] mb-5 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          {historyItems.map((item, i) => {
            const Icon = item.icon;
            const isPowerhitHistory = item.label === "Powerhit History";

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 p-4 hover:bg-[#2a1b3d]/50 transition-colors ${
                  i !== historyItems.length - 1
                    ? "border-b border-[#2a1b3d]"
                    : ""
                }`}
              >
                <div className="w-11 h-11 rounded-full border border-[#2a1b3d] bg-[#12061C] flex items-center justify-center flex-shrink-0">
                  <Icon size={19} className={item.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    {isPowerhitHistory && (
                      <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                        {countryPath.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-500 flex-shrink-0"
                />
              </Link>
            );
          })}
        </div>

        {/* More Options */}
        <h3 className="text-sm font-black text-[#9B59B6] tracking-wide mb-2">
          MORE OPTIONS
        </h3>
        <div className="rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] mb-5 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          {moreOptions.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 p-4 hover:bg-[#2a1b3d]/50 transition-colors ${
                  i !== moreOptions.length - 1
                    ? "border-b border-[#2a1b3d]"
                    : ""
                }`}
              >
                <div className="w-11 h-11 rounded-full border border-[#2a1b3d] bg-[#12061C] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className={item.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-500 flex-shrink-0"
                />
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-red-500/40 transition-all"
        >
          <div className="w-11 h-11 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <LogOut size={18} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-red-400">Logout</p>
            <p className="text-xs text-gray-400">Logout from your account</p>
          </div>
          <ChevronRight size={18} className="text-gray-500 flex-shrink-0" />
        </button>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={handleCancelLogout}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] w-full max-w-xs p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
          >
            <button
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-[#2a1b3d] transition-colors disabled:opacity-40"
            >
              <X size={14} className="text-gray-400" />
            </button>

            <div className="w-14 h-14 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <LogOut size={22} className="text-red-400" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Log out of WINZOX?
            </h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Are you sure you want to logout? You'll need to sign in again to
              access your wallet and bets.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#2a1b3d] text-gray-300 font-bold text-sm hover:bg-[#2a1b3d] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-b from-red-500 to-red-600 rounded-xl text-white font-bold text-sm hover:from-red-600 hover:to-red-700 transition-colors disabled:opacity-60 shadow-[0_2px_8px_rgba(239,68,68,0.4)]"
              >
                {isLoggingOut ? (
                  <>
                    <Circle className="animate-spin" size={14} />
                    Logging out...
                  </>
                ) : (
                  "Yes, Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
