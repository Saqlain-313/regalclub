import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Coins,
  Copy,
  Crown,
  Flame,
  Gamepad2,
  Gift,
  Key,
  Loader2,
  LogOut,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
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
import { api } from "../redux/slices/api";
import { getProfile, logout } from "../redux/slices/authSlice";

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
  const [eligibility, setEligibility] = useState(null);

  const userCountry = user?.country || "IN";
  const countryPath = getCountryPath(userCountry);

  const getUserDisplayName = () => user?.name || user?.username || "Player123";
  const getUserUID = () => user?.userId || "WINZOX123456";
  const getUserPhone = () => user?.mobile || "+91 98765 43210";

  // ======================================================
  // WAGERING ELIGIBILITY (live progress)
  // ======================================================

  const loadEligibility = useCallback(async () => {
    try {
      const { data } = await api.get("/withdrawals/eligibility");
      setEligibility(data?.eligibility || null);
    } catch {
      setEligibility(null);
    }
  }, []);

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

  useEffect(() => {
    if (shouldRefreshOnReturn) {
      dispatch(setShouldRefreshOnReturn(false));
      runCheckCredit();
    }
  }, [shouldRefreshOnReturn, dispatch, runCheckCredit]);

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility, user?.credit]);

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
  // WAGERING PROGRESS VALUES
  // ======================================================

  const wagered = Number(eligibility?.totalWagered || 0);
  const required = Number(eligibility?.requiredWagering || 0);
  const wagerPercent =
    required > 0 ? Math.min(100, Math.round((wagered / required) * 100)) : 100;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0B0410] pb-24 sm:pb-10 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-72 bg-[#7418F5]/25 rounded-full blur-[90px]" />
      <div className="pointer-events-none absolute top-1/3 -right-28 w-72 h-72 bg-[#B45CFF]/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-80 h-80 bg-[#3A00C9]/12 rounded-full blur-3xl" />

      <div className="relative w-full max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4">
        {/* ============================================ */}
        {/* HERO — layered gradient + glass balance      */}
        {/* ============================================ */}
        <div className="relative rounded-[28px] overflow-hidden shadow-[0_16px_50px_rgba(58,0,201,0.5)]">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9]" />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* Corner glow */}
          <div className="pointer-events-none absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-[#C77AFF]/30 blur-3xl" />
          <div className="pointer-events-none absolute -top-16 -right-8 w-44 h-44 rounded-full bg-white/15 blur-3xl" />

          {/* ---------- Content ---------- */}
          <div className="relative px-4 sm:px-5 pt-4 pb-4">
            {/* Compact wagering — circular ring, top right corner */}
            <Link
              to="/withdrawal"
              className="absolute top-2.5 right-3 z-10 flex flex-col items-center gap-1 group"
            >
              <div className="relative w-[52px] h-[52px]">
                <svg viewBox="0 0 52 52" className="w-full h-full -rotate-90">
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke="rgba(11,4,16,0.35)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke="#00E676"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(wagerPercent / 100) * 2 * Math.PI * 22} ${
                      2 * Math.PI * 22
                    }`}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                  {wagerPercent}%
                </span>
              </div>
              <span className="text-[7px] font-black tracking-[0.18em] text-white/85 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                Wagering
              </span>
            </Link>

            {/* Profile row */}
            <div className="flex items-center gap-3.5">
              <Link to="/profile" className="relative group flex-shrink-0">
                {/* Double ring avatar */}
                <div className="w-[62px] h-[62px] sm:w-[70px] sm:h-[70px] rounded-2xl p-[2.5px] bg-gradient-to-br from-white via-[#F1C40F] to-white shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:rotate-3 transition-transform duration-300">
                  <div className="w-full h-full rounded-[13px] bg-[#12061C] flex items-center justify-center overflow-hidden">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={getUserDisplayName()}
                        className="w-full h-full object-cover rounded-[13px]"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <User
                        size={30}
                        className="text-[#B45CFF]"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#00E676] border-[3px] border-[#5b12b8] shadow-[0_0_8px_rgba(0,230,118,0.7)]" />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white truncate uppercase tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                    {getUserDisplayName()}
                  </h2>
                  {/* Gold VIP badge */}
                  <span className="flex items-center gap-0.5 px-2 py-[3px] rounded-full bg-gradient-to-r from-[#FFE27A] via-[#F1C40F] to-[#D4A017] shadow-[0_2px_10px_rgba(241,196,15,0.5)] flex-shrink-0">
                    <Crown size={10} className="text-[#4A2E00]" />
                    <span className="text-[8px] font-black text-[#4A2E00] tracking-[0.15em]">
                      VIP
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <button
                    onClick={copyUID}
                    className="flex items-center gap-1 px-2 py-[3px] rounded-lg bg-white/15 border border-white/25 hover:bg-white/25 transition-colors backdrop-blur-sm"
                  >
                    <span className="text-[10px] font-bold text-white font-mono">
                      UID {getUserUID()}
                    </span>
                    <Copy
                      size={10}
                      className={copied ? "text-[#00E676]" : "text-white/70"}
                    />
                  </button>
                  <span className="flex items-center gap-1 px-2 py-[3px] rounded-lg bg-white/10 border border-white/20 text-[10px] font-semibold text-white/85 backdrop-blur-sm">
                    <Phone size={10} />
                    {getUserPhone()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Quick actions row ---------- */}
          <div className="relative bg-[#0E0718] border-t border-[#2a1b3d] px-2 py-3.5 grid grid-cols-4">
            {[
              {
                icon: Coins,
                label: "Deposit",
                path: "/deposit",
                hot: true,
              },
              {
                icon: ArrowUpRight,
                label: "Withdraw",
                path: "/withdrawal",
              },
              {
                icon: Crown,
                label: "VIP",
                path: "/promo",
              },
              {
                icon: MessageCircle,
                label: "Support",
                path: "/support-chat",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group relative flex flex-col items-center gap-1.5 py-1 rounded-xl hover:bg-[#B45CFF]/[0.07] transition-colors"
                >
                  {item.hot && (
                    <span className="absolute top-0 right-[22%] flex items-center">
                      <Flame size={12} className="text-[#FF6B4A] drop-shadow" />
                    </span>
                  )}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#B45CFF]/30 via-[#7418F5]/25 to-[#3A00C9]/30 border border-[#B45CFF]/45 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_14px_rgba(58,0,201,0.35)] group-hover:scale-110 group-hover:border-[#C77AFF] group-hover:shadow-[0_0_16px_rgba(180,92,255,0.5)] transition-all duration-200">
                    <Icon
                      size={19}
                      className="text-[#D9B3FF] group-hover:text-white transition-colors"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* GAME CREDIT SYNC STRIP                       */}
        {/* ============================================ */}
        <button
          onClick={handleCheckCreditClick}
          disabled={isCheckingCredit}
          className="group w-full flex items-center justify-between rounded-2xl bg-[#150D22]/95 border border-[#2a1b3d] shadow-[0_4px_20px_rgba(0,0,0,0.45)] px-4 py-3 hover:border-[#00E676]/40 transition-colors disabled:opacity-70"
        >
          <span className="flex items-center gap-3">
            <span className="relative w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center">
              {isCheckingCredit && (
                <span className="absolute inset-0 rounded-xl border border-[#00E676]/50 animate-ping opacity-40" />
              )}
              <Coins size={17} className="text-[#00E676]" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-black text-white tracking-wide">
                Game Credit
              </span>
              <span className="block text-[10px] text-gray-500 mt-0.5">
                Sync game balance to your wallet
              </span>
            </span>
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#00E676]/15 to-[#00E676]/5 border border-[#00E676]/35 text-[10px] font-black text-[#00E676] uppercase tracking-widest group-hover:from-[#00E676]/25 transition-colors">
            {isCheckingCredit ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Syncing
              </>
            ) : (
              <>
                <Sparkles size={11} />
                Sync
              </>
            )}
          </span>
        </button>

        {/* ============================================ */}
        {/* 2x2 HISTORY GRID                             */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: Gamepad2,
              label: "Game History",
              sub: "My game history",
              path: "/game-history",
              tint: "from-[#B45CFF]/25 to-[#7418F5]/15 text-[#C77AFF] border-[#B45CFF]/35",
            },
            {
              icon: ClipboardList,
              label: "Matka History",
              sub: "My matka bet history",
              path: "/matka/bids-history",
              tint: "from-cyan-500/25 to-cyan-500/5 text-cyan-300 border-cyan-500/35",
            },
            {
              icon: ArrowDownLeft,
              label: "Deposit",
              sub: "My deposit history",
              path: "/deposit-history",
              tint: "from-[#F1C40F]/25 to-[#F1C40F]/5 text-[#F1C40F] border-[#F1C40F]/35",
            },
            {
              icon: ArrowUpRight,
              label: "Withdraw",
              sub: "My withdrawal history",
              path: "/withdrawal-history",
              tint: "from-[#00E676]/25 to-[#00E676]/5 text-[#00E676] border-[#00E676]/35",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`group relative rounded-2xl bg-[#150D22]/95 border border-[#2a1b3d] shadow-[0_4px_20px_rgba(0,0,0,0.45)] p-3.5 overflow-hidden hover:border-[#B45CFF]/50 transition-all duration-200 hover:-translate-y-0.5`}
              >
                <div className="pointer-events-none absolute -right-6 -top-6 w-20 h-20 rounded-full bg-[#7418F5]/10 blur-xl group-hover:bg-[#7418F5]/20 transition-colors" />
                <div
                  className={`relative w-10 h-10 rounded-xl border bg-gradient-to-br flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6 ${item.tint}`}
                >
                  <Icon size={19} strokeWidth={2} />
                </div>
                <p className="relative text-xs sm:text-[13px] font-black text-white leading-tight">
                  {item.label}
                </p>
                <p className="relative text-[9px] sm:text-[10px] text-gray-500 mt-1">
                  {item.sub}
                </p>
              </Link>
            );
          })}
        </div>

        {/* ============================================ */}
        {/* REWARDS & SETTINGS LIST                      */}
        {/* ============================================ */}
        <div>
          <h3 className="flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-gray-400 uppercase">
            <Sparkles size={12} className="text-[#B45CFF]" />
            Rewards & Settings
            <span className="flex-1 h-px bg-gradient-to-r from-[#2a1b3d] to-transparent ml-1" />
          </h3>
          <div className="rounded-2xl overflow-hidden mt-2.5 bg-[#150D22]/95 border border-[#2a1b3d] shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
            {[
              {
                icon: Gift,
                label: "Refer & Earn",
                sub: "Invite friends & earn rewards",
                value: null,
                path: "/promo",
                tint: "text-pink-300 bg-pink-500/12 border-pink-500/35",
              },
              {
                icon: ClipboardList,
                label: "Powerhit History",
                sub: "Powerball bet history",
                value: countryPath.toUpperCase(),
                path: `/${countryPath}/powerhit/history`,
                tint: "text-purple-300 bg-purple-500/12 border-purple-500/35",
              },
              {
                icon: Key,
                label: "Change Password",
                sub: "Update your account password",
                value: null,
                path: "/change-password",
                tint: "text-[#F1C40F] bg-[#F1C40F]/12 border-[#F1C40F]/35",
              },
            ].map((item, i, arr) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`group flex items-center gap-3 p-3.5 hover:bg-[#B45CFF]/[0.06] transition-colors ${
                    i !== arr.length - 1 ? "border-b border-[#2a1b3d]/70" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl border bg-gradient-to-br from-white/[0.04] to-transparent flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${item.tint}`}
                  >
                    <Icon size={17} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-white truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                  {item.value && (
                    <span className="text-[9px] font-black tracking-wider text-[#B45CFF] bg-[#B45CFF]/10 border border-[#B45CFF]/30 px-2 py-0.5 rounded-full flex-shrink-0">
                      {item.value}
                    </span>
                  )}
                  <ChevronRight
                    size={15}
                    className="text-gray-600 group-hover:text-[#B45CFF] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* SERVICE CENTER                               */}
        {/* ============================================ */}
        <div>
          <h3 className="flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-gray-400 uppercase">
            <MessageCircle size={12} className="text-[#B45CFF]" />
            Service Center
            <span className="flex-1 h-px bg-gradient-to-r from-[#2a1b3d] to-transparent ml-1" />
          </h3>
          <div className="rounded-2xl mt-2.5 bg-[#150D22]/95 border border-[#2a1b3d] shadow-[0_4px_20px_rgba(0,0,0,0.45)] px-2 py-4 grid grid-cols-3">
            {[
              {
                icon: User,
                label: "Profile",
                path: "/profile",
              },
              {
                icon: MessageCircle,
                label: "Support Chat",
                path: "/support-chat",
              },
              {
                icon: Key,
                label: "Password",
                path: "/change-password",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group flex flex-col items-center gap-1.5 py-1 rounded-xl hover:bg-[#B45CFF]/[0.06] transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#B45CFF]/20 to-[#3A00C9]/20 border border-[#B45CFF]/35 flex items-center justify-center group-hover:scale-110 group-hover:border-[#B45CFF]/70 group-hover:shadow-[0_0_14px_rgba(180,92,255,0.4)] transition-all duration-200">
                    <Icon
                      size={18}
                      className="text-[#D9B3FF] group-hover:text-white transition-colors"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* LOGOUT PILL                                  */}
        {/* ============================================ */}
        <button
          onClick={handleLogoutClick}
          className="group w-full flex items-center justify-center gap-2 rounded-full border border-red-500/35 bg-red-500/[0.06] py-3.5 hover:bg-red-500/[0.14] hover:border-red-500/60 hover:shadow-[0_4px_20px_rgba(239,68,68,0.25)] transition-all duration-200"
        >
          <LogOut
            size={16}
            className="text-red-400 group-hover:translate-x-0.5 transition-transform"
          />
          <span className="text-[13px] font-black text-red-400 tracking-wider">
            Log out
          </span>
        </button>
      </div>

      {/* ===== Logout Confirmation Popup ===== */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4"
          onClick={handleCancelLogout}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[340px] rounded-3xl p-[1.5px] bg-gradient-to-br from-[#B45CFF]/60 via-[#2a1b3d] to-[#3A00C9]/60 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(116,24,245,0.15)] animate-[popupIn_0.2s_ease-out]"
          >
            <div className="relative bg-[#150D22] rounded-3xl p-6 text-center overflow-hidden">
              <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-32 bg-[#7418F5]/25 rounded-full blur-2xl" />

              <button
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-[#2a1b3d] transition-colors disabled:opacity-40"
              >
                <X size={14} className="text-gray-500" />
              </button>

              <div className="relative w-16 h-16 mx-auto mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-md" />
                <LogOut size={24} className="relative text-red-400" />
              </div>

              <h3 className="text-base font-black text-white mb-1.5 tracking-wide">
                Log out of RegalClub?
              </h3>
              <p className="text-[11px] text-gray-400 mb-5 leading-relaxed">
                You'll need to sign in again to access your wallet, bets and
                winnings.
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCancelLogout}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#2a1b3d] bg-[#12061C] text-gray-300 font-bold text-xs hover:bg-[#2a1b3d] hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  disabled={isLoggingOut}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-b from-red-500 to-red-600 text-white font-bold text-xs hover:from-red-600 hover:to-red-700 transition-all active:scale-[0.97] disabled:opacity-60 shadow-[0_4px_16px_rgba(239,68,68,0.35)]"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Yes, Logout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Account;
