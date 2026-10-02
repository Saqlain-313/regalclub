import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Coins,
  Gamepad2,
  Gift,
  RefreshCw,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  claimDailyBonus,
  clearDailyClaimError,
  getDailyClaimStatus,
  resetClaimSuccess,
} from "../redux/slices/dailyClaimSlice";
import { getActivityContent } from "../redux/slices/activityBannerSlice";

// Fallback banners — shown when the admin has not uploaded any
const DEFAULT_BANNERS = [
  {
    _id: "default-1",
    title: "FIRST RECHARGE",
    image: "https://i.ibb.co/V0THwFvm/banner1.png",
    navigateTo: "/deposit",
  },
  {
    _id: "default-2",
    title: "REFER & EARN",
    image: "https://i.ibb.co/vxQwyNXC/banner2.png",
    navigateTo: "/promo",
  },
  {
    _id: "default-3",
    title: "PLAY & WIN",
    image: "https://i.ibb.co/PzhpvsHt/banner3.png",
    navigateTo: "/matka",
  },
];

const defaultRewards = {
  1: 10,
  2: 15,
  3: 20,
  4: 25,
  5: 30,
  6: 35,
  7: 50,
};

// =======================
// IST Helpers
// =======================
const getISTDateString = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);

const getNextISTMidnight = () => {
  const nowIST = getISTDateString();
  const [y, m, d] = nowIST.split("-").map(Number);
  return new Date(
    `${y}-${String(m).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}T00:00:00+05:30`,
  );
};

// Which icon each day shows
const getDayIcon = (day) =>
  day === 3 || day === 5 || day === 7 ? Gift : Coins;

// =======================
// RewardCard Component
// =======================
const RewardCard = ({ title, subtitle, image, navigateTo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2a1b3d] group active:scale-[0.98] transition-transform duration-150 cursor-pointer hover:border-[#B45CFF]/60"
      onClick={handleClick}
    >
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0410]/90 via-[#0B0410]/30 to-transparent"></div>
      </div>

      <div className="relative z-10 px-4 py-4 min-h-[140px] sm:min-h-[160px] flex flex-col justify-end">
        {title && (
          <h3 className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
            {title}
          </h3>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-300">
            {subtitle}
          </span>

          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#B45CFF] to-[#7418F5] border border-[#C77AFF] px-3.5 py-1.5 text-[10px] font-black text-white shadow-[0_0_10px_rgba(180,92,255,0.6)] group-hover:gap-2 transition-all">
            {navigateTo === "/promo"
              ? "REFER NOW"
              : navigateTo === "/deposit"
                ? "RECHARGE"
                : navigateTo === "/matka"
                  ? "PLAY NOW"
                  : "OPEN"}
            <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
};

// =======================
// Promo CTA — links the /activity page to /promo
// =======================
const PromoCta = () => {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#C77AFF]/60 bg-gradient-to-br from-[#1C0F2B] via-[#2a1245] to-[#1C0F2B] p-4 shadow-[0_4px_20px_rgba(180,92,255,0.25)]">
      <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-[#B45CFF]/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_12px_rgba(180,92,255,0.6)]">
          <Users size={22} className="text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-white">
            Refer &amp; Earn ₹150
          </h3>
          <p className="text-[11px] text-gray-400">
            Invite friends — they get bonus, you get rewarded
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/promo")}
          className="flex flex-shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] px-4 py-2 text-[11px] font-black text-white shadow-[0_0_10px_rgba(180,92,255,0.6)] active:scale-95 hover:scale-[1.03] transition-transform"
        >
          GO TO PROMO
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

// =======================
// Main Activity Component
// =======================
const Activity = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [istCurrentDate, setIstCurrentDate] = useState(getISTDateString);

  const {
    loading,
    claimLoading,
    currentDay,
    claimedDay,
    claimSuccess,
    canClaim,
    rewards,
    error,
    reward,
  } = useSelector((state) => state.dailyClaim);

  const activityBanners = useSelector(
    (state) => state.activityBanner?.banners || [],
  );

  // Admin-managed banners (fallback: DEFAULT_BANNERS)
  const bannerList = activityBanners.length
    ? activityBanners
    : DEFAULT_BANNERS;

  useEffect(() => {
    dispatch(getActivityContent());
  }, [dispatch]);

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  // Countdown ticker
  const updateTimeRemaining = useCallback(() => {
    const now = new Date();
    const midnight = getNextISTMidnight();
    const diff = midnight.getTime() - now.getTime();

    if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeUntilReset("New day available!");
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      await dispatch(getDailyClaimStatus()).unwrap();
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchStatus();
    updateTimeRemaining();
  }, [fetchStatus, updateTimeRemaining]);

  useEffect(() => {
    const id = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(id);
  }, [updateTimeRemaining]);

  useEffect(() => {
    const id = setInterval(() => {
      setIstCurrentDate((prev) => {
        const today = getISTDateString();
        if (today !== prev) {
          fetchStatus();
          return today;
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const id = setTimeout(() => {
        setShowError(false);
        dispatch(clearDailyClaimError());
      }, 5000);
      return () => clearTimeout(id);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (claimSuccess) {
      const id = setTimeout(() => dispatch(resetClaimSuccess()), 3000);
      return () => clearTimeout(id);
    }
  }, [claimSuccess, dispatch]);

  const handleClaim = async () => {
    if (!canClaim) return;
    try {
      await dispatch(claimDailyBonus()).unwrap();
    } catch (err) {
      console.error("Claim failed:", err);
    }
  };

  const handleRefresh = () => {
    fetchStatus();
    setIstCurrentDate(getISTDateString());
    updateTimeRemaining();
  };

  const rewardData =
    rewards && Object.keys(rewards).length > 0 ? rewards : defaultRewards;
  const rewardList = Object.entries(rewardData)
    .map(([day, amount]) => ({ day: Number(day), amount }))
    .sort((a, b) => a.day - b.day);

  // Loading state
  if (loading && !canClaim) {
    return (
      <div className="min-h-screen bg-[#0B0410] py-4 px-4">
        <div className="bg-[#1C0F2B] rounded-2xl shadow-lg px-4 py-3 mb-4 border border-[#2a1b3d]">
          <h1 className="text-xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#9B59B6]" />
            Activity
          </h1>
        </div>
        <div className="relative overflow-hidden bg-[#1C0F2B] rounded-3xl shadow-2xl p-8 max-w-sm mx-auto border border-[#2a1b3d]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#9B59B6]/10 to-transparent animate-shimmer"></div>
          <div className="relative z-10 text-center">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-[#B45CFF] border-t-transparent"></div>
            <p className="mt-4 text-gray-400 font-medium text-sm">
              Loading daily rewards...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0410] py-4 px-4 pb-20">
      {/* Header */}
      <div className="text-center mb-4 px-6">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[#9B59B6] text-xs">✦</span>
          <Sparkles size={14} className="text-[#9B59B6]" />
          <h2 className="text-lg font-extrabold text-white">
            7 Days Daily Claim
          </h2>
          <Sparkles size={14} className="text-[#9B59B6]" />
          <span className="text-[#9B59B6] text-xs">✦</span>
        </div>
        <p className="text-gray-400 text-[11px] mt-1">
          Claim daily and win exciting rewards
        </p>
      </div>

      {/* Daily Claim Card */}
      <div className="relative bg-[#1C0F2B] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2a1b3d] overflow-hidden mb-4 px-3 sm:px-4 pt-4 pb-4 w-full">
        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={loading || claimLoading}
          className="absolute top-3 right-3 p-1.5 hover:bg-[#2a1b3d] rounded-full transition-all duration-300 hover:rotate-180 border border-[#2a1b3d] z-20"
        >
          <RefreshCw
            size={14}
            className={`${loading ? "animate-spin" : ""} text-[#B45CFF]`}
          />
        </button>

        {/* Days Row */}
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          <div className="flex items-end gap-2 min-w-[560px] sm:min-w-0">
            {rewardList.map((item) => {
              const isCompleted = item.day < currentDay;
              const isCurrent = item.day === currentDay && canClaim;
              const isLocked =
                item.day > currentDay || (item.day === currentDay && !canClaim);
              const Icon = getDayIcon(item.day);

              return (
                <div
                  key={item.day}
                  className={`flex-1 min-w-[72px] flex flex-col items-center rounded-xl border transition-all duration-300 ${
                    isCurrent
                      ? `${purpleGradient} py-4`
                      : isCompleted
                        ? "bg-[#12061C] border-[#B45CFF]/50 py-2.5"
                        : "bg-[#12061C] border-dashed border-[#3a2a4d] py-2.5"
                  }`}
                >
                  {/* Day label */}
                  <span
                    className={`text-[9px] font-bold mb-1 ${
                      isCurrent
                        ? "text-white"
                        : isCompleted
                          ? "text-[#B45CFF]"
                          : "text-gray-500"
                    }`}
                  >
                    Day {item.day}
                  </span>

                  {/* Icon */}
                  <div className="mb-1">
                    {isCompleted ? (
                      <CheckCircle size={16} className="text-[#B45CFF]" />
                    ) : (
                      <Icon
                        size={16}
                        className={
                          isCurrent
                            ? "text-white"
                            : isLocked
                              ? "text-gray-600"
                              : "text-[#B45CFF]"
                        }
                      />
                    )}
                  </div>

                  {/* Amount */}
                  <span
                    className={`text-[10px] font-black mb-1.5 ${
                      isCurrent
                        ? "text-white"
                        : isLocked
                          ? "text-gray-500"
                          : "text-gray-300"
                    }`}
                  >
                    ₹{item.amount}
                  </span>

                  {/* Action */}
                  {isCurrent ? (
                    <button
                      onClick={handleClaim}
                      disabled={claimLoading}
                      className="w-[85%] bg-[#0B0410]/70 backdrop-blur-sm hover:bg-black text-white text-[8px] font-bold py-1 rounded-full transition-colors disabled:opacity-70 border border-white/30"
                    >
                      {claimLoading ? "..." : "Claim"}
                    </button>
                  ) : isCompleted ? (
                    <span className="w-[85%] text-center bg-[#B45CFF]/20 text-[#C77AFF] text-[8px] font-bold py-1 rounded-full border border-[#B45CFF]/40">
                      Claimed
                    </span>
                  ) : (
                    <span className="w-[85%] text-center border border-[#3a2a4d] text-gray-500 text-[8px] font-bold py-1 rounded-full">
                      Locked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset timer */}
        {!canClaim && !loading && (
          <p className="mt-3 text-center text-[10px] text-[#B45CFF] flex items-center justify-center gap-1">
            <Clock size={11} /> Resets in {timeUntilReset}
          </p>
        )}

        {/* Success Banner */}
        {claimSuccess && (
          <div className="mt-3 p-3 bg-[#B45CFF]/10 border border-[#B45CFF]/40 rounded-xl animate-slideDown">
            <div className="flex items-center justify-center gap-2">
              <div
                className={`p-1.5 ${purpleGradient} rounded-full animate-bounce`}
              >
                <Zap size={14} className="text-white" />
              </div>
              <p className="font-bold text-[#C77AFF] text-xs">
                ₹{reward} claimed for Day {claimedDay}!
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {showError && error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/40 rounded-xl animate-shake">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 font-medium text-xs">{error}</p>
              </div>

              <button
                onClick={() => {
                  setShowError(false);
                  dispatch(clearDailyClaimError());
                }}
                className="text-red-400 font-bold hover:bg-red-500/20 p-0.5 px-2 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Promo CTA — Refer & Earn */}
      <PromoCta />

      {/* Reward Cards (admin-managed) */}
      <div className="mt-3 space-y-3">
        {bannerList.map((banner) => (
          <RewardCard
            key={banner._id}
            title={banner.title}
            subtitle={banner.navigateTo === "/promo"
              ? "Invite friends & earn unlimited"
              : banner.navigateTo === "/deposit"
                ? "Extra bonus on first recharge!"
                : "Win exciting prizes everyday"}
            image={banner.image}
            navigateTo={banner.navigateTo}
          />
        ))}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-3px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(3px);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Activity;
