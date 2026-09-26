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
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  checkGamecredit,
  resetGameState,
  setShouldRefreshOnReturn,
} from "../../../Client/src/redux/slices/gameSlice";
import { showErrorToast, showSuccessToast } from "../hooks/toast";
import { getProfile, logout } from "../redux/slices/authSlice";

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
  const { shouldRefreshOnReturn } = useSelector((state) => state.game);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);

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

  // ======================================================
  // CHECK GAME CREDIT + REFRESH PROFILE
  // ======================================================

  const runCheckCredit = useCallback(async () => {
    if (isCheckingCredit) return;
    setIsCheckingCredit(true);
    try {
      dispatch(resetGameState());
      const result = await dispatch(checkGamecredit()).unwrap();
      await dispatch(getProfile()).unwrap();
      showSuccessToast(
        "Credit Updated",
        result?.message || "Game credit refreshed.",
      );
    } catch (error) {
      showErrorToast(
        "Check Failed",
        error?.message || error || "Failed to refresh game credit.",
      );
    } finally {
      setIsCheckingCredit(false);
    }
  }, [dispatch, isCheckingCredit]);

  const handleCheckCreditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    runCheckCredit();
  };

  // ======================================================
  // AUTO-HIT when user returns from a game route
  // ======================================================

  useEffect(() => {
    if (shouldRefreshOnReturn) {
      dispatch(setShouldRefreshOnReturn(false));
      runCheckCredit();
    }
  }, [shouldRefreshOnReturn, dispatch, runCheckCredit]);

  // ======================================================
  // LOGOUT
  // ======================================================

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
    <div className="min-h-screen bg-[#0B0410] pb-24 sm:pb-8">
      {/* ✅ SINGLE COLUMN — Mobile aur Desktop dono pe same layout */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-4 sm:space-y-5">
        {/* ===== Profile Card ===== */}
        <Link
          to="/profile"
          className="flex items-center gap-3 sm:gap-4 rounded-2xl bg-[#1C0F2B] border border-[#9B59B6]/40 p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:border-[#9B59B6]/60 transition-all"
        >
          {/* Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 border-[#9B59B6] flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#2a1b3d]">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={getUserDisplayName()}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-[#9B59B6]">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  `;
                }}
              />
            ) : (
              <User size={30} className="text-[#9B59B6]" strokeWidth={1.5} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate uppercase">
                {getUserDisplayName()}
              </h2>
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#9B59B6]/20 border border-[#9B59B6]/40 flex items-center justify-center flex-shrink-0">
                <Crown size={12} className="text-[#9B59B6]" />
              </span>
            </div>

            {/* UID */}
            <button
              onClick={(e) => {
                e.preventDefault();
                copyUID();
              }}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 mb-1"
            >
              UID: WINZOX{getUserUID()}
              <Copy
                size={11}
                className={copied ? "text-[#00E676]" : "text-gray-500"}
              />
            </button>

            {/* Phone */}
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-300 mb-1.5">
              <Phone size={11} className="text-gray-500" />
              {getUserPhone()}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-[#9B59B6] border border-[#9B59B6]/40 bg-[#9B59B6]/10 rounded-full px-1.5 sm:px-2 py-0.5">
                Verified
                <ShieldCheck size={10} />
              </span>
              <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-blue-400 border border-blue-400/40 bg-blue-400/10 rounded-full px-1.5 sm:px-2 py-0.5">
                {user?.country || "IN"}
              </span>
            </div>
          </div>

          {/* Check Credit Button */}
          <button
            onClick={handleCheckCreditClick}
            disabled={isCheckingCredit}
            title="Check Game Credit"
            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-[#9B59B6] to-[#7D3C98] text-white text-[9px] sm:text-[10px] font-bold hover:from-[#a86bc4] hover:to-[#8a45a5] transition-all disabled:opacity-60 shadow-[0_2px_8px_rgba(155,89,182,0.4)] flex-shrink-0"
          >
            {isCheckingCredit ? (
              <>
                <Circle className="animate-spin" size={14} />
                <span>Checking</span>
              </>
            ) : (
              <>
                <Coins size={14} />
                <span>Credit</span>
              </>
            )}
          </button>
        </Link>

        {/* ===== Deposit / Withdrawal ===== */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {topCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.path}
                className="rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] p-3 sm:p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-[#9B59B6]/50 transition-all"
              >
                <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                  <Icon
                    size={22}
                    className="text-[#9B59B6]"
                    strokeWidth={1.8}
                  />
                  <ChevronRight size={16} className="text-gray-500 mt-0.5" />
                </div>
                <p className="text-xs sm:text-sm lg:text-base font-bold text-white">
                  {card.label}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-snug">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* ===== History ===== */}
        <div>
          <h3 className="text-xs sm:text-sm font-black text-[#9B59B6] tracking-wide mb-1.5 sm:mb-2">
            HISTORY
          </h3>
          <div className="rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {historyItems.map((item, i) => {
              const Icon = item.icon;
              const isPowerhitHistory = item.label === "Powerhit History";

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 hover:bg-[#2a1b3d]/50 transition-colors ${
                    i !== historyItems.length - 1
                      ? "border-b border-[#2a1b3d]"
                      : ""
                  }`}
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#2a1b3d] bg-[#12061C] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className={`${item.iconColor} sm:hidden`} />
                    <Icon
                      size={19}
                      className={`hidden ${item.iconColor} sm:block`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.label}
                      </p>
                      {isPowerhitHistory && (
                        <span className="text-[8px] sm:text-[10px] font-semibold text-purple-400 bg-purple-500/15 px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-500/30 flex-shrink-0">
                          {countryPath.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-500 flex-shrink-0 sm:hidden"
                  />
                  <ChevronRight
                    size={18}
                    className="hidden text-gray-500 flex-shrink-0 sm:block"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===== More Options ===== */}
        <div>
          <h3 className="text-xs sm:text-sm font-black text-[#9B59B6] tracking-wide mb-1.5 sm:mb-2">
            MORE OPTIONS
          </h3>
          <div className="rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {moreOptions.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 hover:bg-[#2a1b3d]/50 transition-colors ${
                    i !== moreOptions.length - 1
                      ? "border-b border-[#2a1b3d]"
                      : ""
                  }`}
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#2a1b3d] bg-[#12061C] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className={`${item.iconColor} sm:hidden`} />
                    <Icon
                      size={18}
                      className={`hidden ${item.iconColor} sm:block`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-500 flex-shrink-0 sm:hidden"
                  />
                  <ChevronRight
                    size={18}
                    className="hidden text-gray-500 flex-shrink-0 sm:block"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===== Logout ===== */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] p-3 sm:p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-red-500/40 transition-all"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-red-400 sm:hidden" />
            <LogOut size={18} className="hidden text-red-400 sm:block" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs sm:text-sm font-bold text-red-400">Logout</p>
            <p className="text-[10px] sm:text-xs text-gray-400">
              Logout from your account
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-gray-500 flex-shrink-0 sm:hidden"
          />
          <ChevronRight
            size={18}
            className="hidden text-gray-500 flex-shrink-0 sm:block"
          />
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
            className="relative bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] w-full max-w-xs p-5 sm:p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
          >
            <button
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-[#2a1b3d] transition-colors disabled:opacity-40"
            >
              <X size={14} className="text-gray-400" />
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <LogOut size={20} className="text-red-400 sm:hidden" />
              <LogOut size={22} className="hidden text-red-400 sm:block" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white mb-1">
              Log out of WINZOX?
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mb-4 sm:mb-5 leading-relaxed">
              Are you sure you want to logout? You'll need to sign in again to
              access your wallet and bets.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#2a1b3d] text-gray-300 font-bold text-xs sm:text-sm hover:bg-[#2a1b3d] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-b from-red-500 to-red-600 rounded-xl text-white font-bold text-xs sm:text-sm hover:from-red-600 hover:to-red-700 transition-colors disabled:opacity-60 shadow-[0_2px_8px_rgba(239,68,68,0.4)]"
              >
                {isLoggingOut ? (
                  <>
                    <Circle className="animate-spin" size={13} />
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
