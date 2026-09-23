import React, { useEffect, useState, useCallback } from "react";
import { 
  Coins, Gift, RefreshCw, AlertCircle, Calendar, 
  TrendingUp, Sparkles, Clock, Shield, Award, Zap, 
  CheckCircle, Lock 
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDailyClaimStatus,
  claimDailyBonus,
  clearDailyClaimError,
  resetClaimSuccess,
} from "../redux/slices/dailyClaimSlice";

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
  return new Date(`${y}-${String(m).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}T00:00:00+05:30`);
};

// Golden text style
const goldenTextStyle = {
  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #F59E0B 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

// =======================
// Premium Component
// =======================
const DailyClaim = () => {
  const dispatch = useDispatch();
  const [showError, setShowError] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [istCurrentDate, setIstCurrentDate] = useState(getISTDateString);
  const [hoveredDay, setHoveredDay] = useState(null);

  const {
    loading,
    claimLoading,
    currentDay,
    claimedDay,
    claimSuccess,
    canClaim,
    rewards,
    error,
    lastClaimDate,
    lastClaimDateIST,
    totalCredit,
    reward,
  } = useSelector((state) => state.dailyClaim);

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

  // Lifecycle effects
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
      console.error("❌ Claim failed:", err);
    }
  };

  const handleRefresh = () => {
    fetchStatus();
    setIstCurrentDate(getISTDateString());
    updateTimeRemaining();
  };

  const rewardData = rewards && Object.keys(rewards).length > 0 ? rewards : defaultRewards;
  const rewardList = Object.entries(rewardData)
    .map(([day, amount]) => ({ day: Number(day), amount }))
    .sort((a, b) => a.day - b.day);

  // Loading state with shimmer effect
  if (loading && !canClaim) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-2xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        <div className="relative z-10 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading daily rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl p-6 mb-6 border border-gray-100 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Header Section */}
      <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-4 md:p-6 shadow-lg relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-yellow-400 rounded-full blur-md opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-xl shadow-lg">
                  <Gift className="text-white" size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black tracking-tight" style={goldenTextStyle}>
                  Daily Loyalty Reward
                </h3>
                <p className="text-gray-500 text-xs font-medium flex items-center gap-1">
                  <Sparkles size={12} className="text-yellow-500" />
                  Claim daily for 7 days
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || claimLoading}
              className="p-2 hover:bg-yellow-50/80 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-180 border border-yellow-200/50"
              title="Refresh Status"
            >
              <RefreshCw size={18} className={`${loading ? "animate-spin" : ""} text-yellow-600`} />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {totalCredit && Number(totalCredit) > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-yellow-200/50 shadow-sm">
                <p className="text-xs text-gray-500 font-medium">Total Credits</p>
                <p className="text-xl font-bold text-yellow-600">₹{totalCredit}</p>
              </div>
            )}
            {currentDay && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-yellow-200/50 shadow-sm">
                <p className="text-xs text-gray-500 font-medium">Current Day</p>
                <p className="text-xl font-bold text-gray-800">Day {currentDay}/7</p>
              </div>
            )}
            {claimedDay && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-green-200/50 shadow-sm">
                <p className="text-xs text-gray-500 font-medium">Last Claimed</p>
                <p className="text-xl font-bold text-green-600">Day {claimedDay}</p>
              </div>
            )}
            {reward && claimSuccess && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-yellow-200/50 shadow-sm">
                <p className="text-xs text-gray-500 font-medium">Reward Earned</p>
                <p className="text-xl font-bold text-yellow-600">₹{reward}</p>
              </div>
            )}
          </div>

          {/* Last Claim */}
          {lastClaimDate && (
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-400 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200/50">
                🕐 Last Claimed:{" "}
                {lastClaimDateIST
                  ? lastClaimDateIST
                  : new Date(lastClaimDate).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>
            </div>
          )}

          {/* Success Banner */}
          {claimSuccess && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20 border border-green-400/30 rounded-2xl backdrop-blur-sm animate-slideDown">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 bg-green-500 rounded-full animate-bounce">
                  <Zap size={20} className="text-white" />
                </div>
                <p className="font-bold text-green-700">
                  🎉 Success! You claimed ₹{reward} for Day {claimedDay}!
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {showError && error && (
            <div className="mt-4 p-4 bg-gradient-to-r from-red-400/20 via-red-500/20 to-red-400/20 border border-red-400/30 rounded-2xl backdrop-blur-sm animate-shake">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setShowError(false);
                    dispatch(clearDailyClaimError());
                  }}
                  className="text-red-700 font-bold hover:bg-red-100/50 p-1 px-3 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Days Grid */}
          <div className="mt-5">
            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {rewardList.map((item) => {
                const isCompleted = item.day < currentDay;
                const isCurrent = item.day === currentDay && canClaim;
                const isLocked = item.day > currentDay || (item.day === currentDay && !canClaim);

                return (
                  <div
                    key={item.day}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-b from-green-400 to-green-500 border-2 border-green-600 shadow-lg"
                        : isCurrent
                          ? "bg-gradient-to-b from-yellow-400 to-yellow-500 border-2 border-yellow-600 shadow-lg ring-2 ring-yellow-300/50 animate-pulse"
                          : "bg-white/60 backdrop-blur-sm border-2 border-gray-200 opacity-60"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="text-white" size={16} />
                        <span className="text-[8px] md:text-[10px] font-bold text-white mt-0.5">DAY {item.day}</span>
                      </>
                    ) : isCurrent ? (
                      <>
                        <span className="text-[8px] md:text-[10px] font-bold text-white">DAY {item.day}</span>
                        <span className="text-[10px] md:text-xs font-black text-white">₹{item.amount}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400">DAY {item.day}</span>
                        <Lock className="text-gray-400" size={14} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={!canClaim || claimLoading}
            className={`mt-4 md:mt-6 w-full font-bold py-2.5 md:py-3 rounded-xl transition-all duration-300 shadow-lg text-sm md:text-base ${
              canClaim && !claimLoading
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {claimLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span>
                Claiming...
              </span>
            ) : canClaim ? (
              "Claim Reward"
            ) : (
              "Already Claimed"
            )}
          </button>

          {/* Footer Info */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> Daily reset at 12:00 AM IST
            </span>
            {!canClaim && !loading && (
              <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                <Clock size={12} /> {timeUntilReset}
              </span>
            )}
            <span className="flex items-center gap-1 text-yellow-600">
              <Gift size={12} /> ₹{rewardList.reduce((sum, r) => sum + (r.day < currentDay ? r.amount : 0), 0)} claimed
            </span>
          </div>

          {/* Progress Section */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-1">
              <span>Progress</span>
              <span className="text-yellow-600 font-bold">{Math.min(currentDay - 1, 7)}/7 Days</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${((currentDay - 1) / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DailyClaim;