import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { useDispatch } from "react-redux";

import { getActivityContent } from "../../redux/slices/activityBannerSlice";
import BetBonus from "../../components/promo/BetBonus";
import HowToEarn from "../../components/promo/HowToEarn";
import JoinedMembers from "../../components/promo/JoinedMembers";
import PromoBanner from "../../components/promo/PromoBanner";
import PromoTabs from "../../components/promo/PromoTabs";
import RechargeBonus from "../../components/promo/RechargeBonus";
import ReferralCard from "../../components/promo/ReferralCard";
import ReferralRules from "../../components/promo/ReferralRules";

const PromoPage = () => {
  const [activeTab, setActiveTab] = useState("link");
  const dispatch = useDispatch();

  // Referral share image (admin-managed) fetch karo
  useEffect(() => {
    dispatch(getActivityContent());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#0B0410] text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-64 h-64 bg-[#B45CFF]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-[#8E44AD]/10 rounded-full blur-3xl" />

      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-24 max-w-7xl mx-auto">
        {/* VIP header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75)] flex items-center justify-center flex-shrink-0">
            <Gift size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">
              Refer & Earn
            </h1>
            <p className="text-[11px] text-gray-400">
              Invite friends and earn rewards together
            </p>
          </div>
        </div>

        <PromoTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "link" && (
          <div className="mt-6 grid grid-cols-1  gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PromoBanner />
              <ReferralCard />
            </div>
            <div className="space-y-6">
              <HowToEarn />
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="mt-6">
            <JoinedMembers />
          </div>
        )}

        {activeTab === "recharge" && (
          <div className="mt-6 grid grid-cols-1  gap-6">
            <div className="xl:col-span-2">
              <RechargeBonus />
            </div>
            <div>
              <ReferralRules />
            </div>
          </div>
        )}

        {activeTab === "bet" && (
          <div className="mt-6 grid grid-cols-1  gap-6">
            <div className="xl:col-span-2">
              <BetBonus />
            </div>
            <div>
              <ReferralRules />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoPage;
