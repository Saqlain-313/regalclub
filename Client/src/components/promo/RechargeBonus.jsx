import { Coins, Users, Wallet } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getReferralLevels } from "../../redux/slices/referralLevelSlice";

// TopX themed icon backgrounds
const levelStyles = [
  {
    color: "bg-[#F1C40F]/20 border border-[#F1C40F]/40",
    icon: Wallet,
    iconColor: "text-[#F1C40F]",
  },
  {
    color: "bg-[#3498DB]/20 border border-[#3498DB]/40",
    icon: Users,
    iconColor: "text-[#3498DB]",
  },
  {
    color: "bg-[#B45CFF]/20 border border-[#B45CFF]/40",
    icon: Coins,
    iconColor: "text-[#B45CFF]",
  },
];

const RechargeBonus = () => {
  const dispatch = useDispatch();

  const { levels, loading, error } = useSelector(
    (state) => state.referralLevel,
  );

  useEffect(() => {
    dispatch(getReferralLevels());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="mt-6 space-y-4">
        <div className="bg-[#1C0F2B] rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2a1b3d] p-5 text-center text-gray-400">
          Loading referral levels...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 space-y-4">
        <div className="bg-[#1C0F2B] rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-red-500/30 p-5 text-center text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {levels
        .filter((item) => item.status)
        .map((item, index) => {
          const style = levelStyles[index % levelStyles.length];
          const Icon = style.icon;

          return (
            <div
              key={item._id || item.level}
              className="bg-[#1C0F2B] rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2a1b3d] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${style.color} flex items-center justify-center`}
                  >
                    <Icon size={24} className={style.iconColor} />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-white">
                      Level {item.level}
                    </h3>

                    <p className="text-sm text-gray-400">Recharge Commission</p>
                  </div>
                </div>

                <span className="text-2xl font-bold text-[#00E676]">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default RechargeBonus;
