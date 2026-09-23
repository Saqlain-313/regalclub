import { Gift, Link2, Trophy, Users } from "lucide-react";

const tabs = [
  { id: "link", title: "My Link", icon: Link2 },
  { id: "members", title: "Joined Members", icon: Users },
  { id: "recharge", title: "Recharge Bonus", icon: Gift },
  { id: "bet", title: "Bet Bonus", icon: Trophy },
];

const PromoTabs = ({ activeTab, setActiveTab }) => {
  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1 transition-all duration-200 ${
              isActive
                ? `${purpleGradient} text-white`
                : "bg-[#1C0F2B] border border-[#2a1b3d] text-gray-400 hover:border-[#9B59B6]/50 hover:text-white"
            }`}
          >
            <Icon size={19} strokeWidth={2} />
            <span className="text-[10.5px] font-semibold text-center leading-tight">
              {tab.title}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PromoTabs;
