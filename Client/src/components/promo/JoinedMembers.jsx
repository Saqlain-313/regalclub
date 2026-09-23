import {
  ChevronRight,
  ClipboardList,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../../redux/slices/authSlice";
import MemberStatCard from "./MemberStatCard";

// TopX themed level badges
const levelBadge = {
  1: "border-[#B45CFF]/60 text-[#C77AFF] bg-[#B45CFF]/10",
  2: "border-[#3498DB]/60 text-[#3498DB] bg-[#3498DB]/10",
  3: "border-[#F1C40F]/60 text-[#F1C40F] bg-[#F1C40F]/10",
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatAmount = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const JoinedMembers = () => {
  const dispatch = useDispatch();
  const { referralStats, recentJoinedMembers, profileLoaded } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!profileLoaded) {
      dispatch(getProfile());
    }
  }, [dispatch, profileLoaded]);

  const stats = [
    {
      icon: Users,
      iconColor: "text-[#B45CFF]",
      label: "Total Members\nJoined",
      value: referralStats?.totalMembersJoined ?? 0,
    },
    {
      icon: UserPlus,
      iconColor: "text-[#3498DB]",
      label: "Total Members\nFirst Deposit",
      value: referralStats?.totalMembersFirstDeposit ?? 0,
    },
    {
      icon: Users,
      iconColor: "text-[#00E676]",
      label: "1st Level Members",
      value: referralStats?.level1Count ?? 0,
    },
    {
      icon: Users,
      iconColor: "text-[#E67E22]",
      label: "2nd Level Members",
      value: referralStats?.level2Count ?? 0,
    },
    {
      icon: Users,
      iconColor: "text-[#E91E63]",
      label: "3rd Level Members",
      value: referralStats?.level3Count ?? 0,
    },
    {
      icon: Trophy,
      iconColor: "text-[#F1C40F]",
      label: "Total Betting\nCommission",
      value: formatAmount(referralStats?.totalBettingCommission),
    },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-black text-[#B45CFF] tracking-wide">
        OVERVIEW
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <MemberStatCard key={s.label} {...s} />
        ))}

        <MemberStatCard
          icon={Wallet}
          iconColor="text-[#00E676]"
          label="Total Recharge Commission"
          value={formatAmount(referralStats?.referralEarning)}
          fullWidth
        />
      </div>

      {/* Recent Joined Members */}
      <div className="rounded-3xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-[#9B59B6] tracking-wide">
            RECENT JOINED MEMBERS
          </h3>
          <button className="text-xs font-bold text-gray-300 bg-[#12061C] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {recentJoinedMembers?.length ? (
            recentJoinedMembers.map((m) => (
              <div key={m.userId} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  ID: {m.userId}
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${levelBadge[m.level]}`}
                  >
                    Level {m.level}
                  </span>
                  <span className="text-xs text-gray-400 w-16 text-right">
                    {formatDateTime(m.joinedAt)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No members joined yet.</p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-3xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
        <h3 className="text-sm font-black text-[#9B59B6] tracking-wide mb-4">
          SUMMARY
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Total Betting Commission
            </span>
            <span className="text-sm font-black text-[#F1C40F]">
              {formatAmount(referralStats?.totalBettingCommission)}
            </span>
          </div>
          <div className="h-px bg-[#2a1b3d]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Total Recharge Commission
            </span>
            <span className="text-sm font-black text-[#00E676]">
              {formatAmount(referralStats?.totalRechargeCommission)}
            </span>
          </div>
        </div>
      </div>

      <button className="w-full flex items-center justify-between rounded-2xl bg-[#9B59B6]/10 border border-[#9B59B6]/40 p-4 hover:bg-[#9B59B6]/20 transition">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75)] flex items-center justify-center">
            <ClipboardList size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold text-[#C77AFF]">
            Promo Terms &amp; Conditions
          </span>
        </div>
        <ChevronRight size={18} className="text-[#B45CFF]" />
      </button>
    </div>
  );
};

export default JoinedMembers;
