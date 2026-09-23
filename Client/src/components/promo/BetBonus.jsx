import { Trophy } from "lucide-react";

const BetBonus = () => {
  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  return (
    <div className="mt-6">
      <div className="bg-[#1C0F2B] rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2a1b3d] p-6 relative overflow-hidden">
        {/* Decorative purple glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 bg-[#9B59B6]/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl ${purpleGradient} flex items-center justify-center flex-shrink-0`}
          >
            <Trophy size={28} className="text-white" />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white">Betting Bonus</h2>

            <p className="text-gray-400">
              Earn commission whenever your referrals place bets.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-8 rounded-2xl bg-[#12061C] border border-[#2a1b3d] p-6 text-center">
          <h1 className="text-5xl font-bold text-[#00E676]">1%</h1>

          <p className="mt-2 text-gray-400">Commission on every valid bet.</p>
        </div>
      </div>
    </div>
  );
};

export default BetBonus;
