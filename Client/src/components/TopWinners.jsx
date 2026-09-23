import { Award, Crown, Medal, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ---- TOP 3 config ----
const initialTop3 = [
  { rank: 1, name: "Rahul K.", amount: "₹12,50,000", avatar: 0 },
  { rank: 2, name: "Alex M.", amount: "₹8,20,000", avatar: 2 },
  { rank: 3, name: "Suman P.", amount: "₹5,60,000", avatar: 4 },
];

const top3NamePool = [
  "Rahul K.",
  "Alex M.",
  "Suman P.",
  "Vikram S.",
  "Neha J.",
  "Carlos R.",
  "Priya M.",
  "Tom W.",
  "Sana K.",
  "Arjun B.",
  "Emily T.",
  "Farhan A.",
  "Divya N.",
  "Michael O.",
  "Kavya R.",
];

const avatarPool = [
  "https://i.ibb.co/RT5RVHv9/one.png",
  "https://i.ibb.co/RTgWNDJN/two.png",
  "https://i.ibb.co/1tdr9Bvj/three.png",
  "https://i.ibb.co/xSSX8M8G/four.png",
  "https://i.ibb.co/p6zrKs2q/five.png",
  "https://i.ibb.co/jPXPPMfc/six.png",
];

const namePool = [
  "John D.",
  "Amit S.",
  "Peter K.",
  "Ram C.",
  "David L.",
  "Ali R.",
  "Mohan T.",
  "Vikram S.",
  "Neha J.",
  "Carlos R.",
  "Priya M.",
  "Tom W.",
  "Sana K.",
  "Arjun B.",
  "Emily T.",
  "Farhan A.",
  "Divya N.",
  "Michael O.",
  "Kavya R.",
  "Rohit V.",
  "Lisa C.",
  "Imran H.",
  "Ananya D.",
  "Steve P.",
  "Zoya F.",
  "Karan G.",
  "Meera S.",
  "Daniel K.",
  "Pooja L.",
  "Yusuf M.",
];

const winnersPool = Array.from({ length: 30 }, (_, i) => {
  const base = 320000 - i * 7000 + Math.round(Math.random() * 4000);
  return { id: i, name: namePool[i % namePool.length], amount: base };
});

const initialVisible = winnersPool.slice(0, 7).map((w, i) => ({
  rank: i + 4,
  poolId: w.id,
  name: w.name,
  amount: w.amount,
}));

const formatINR = (num) => "₹" + Math.round(num).toLocaleString("en-IN");

// Rank badge colors
const rankBadgeStyle = {
  1: "bg-gradient-to-br from-[#F1C40F] to-[#E67E22] text-[#0B0410]",
  2: "bg-gradient-to-br from-gray-300 to-gray-500 text-[#0B0410]",
  3: "bg-gradient-to-br from-[#E67E22] to-[#B85C1A] text-white",
};

// Podium config
const podiumConfig = {
  1: {
    height: "h-28 sm:h-36",
    icon: Crown,
    iconColor: "text-[#F1C40F]",
    ringColor: "ring-[#F1C40F]/60",
    glow: "shadow-[0_0_24px_rgba(241,196,15,0.5)]",
    bg: "from-[#F1C40F]/25 via-[#F1C40F]/10 to-transparent",
    border: "border-[#F1C40F]/60",
  },
  2: {
    height: "h-20 sm:h-28",
    icon: Medal,
    iconColor: "text-gray-300",
    ringColor: "ring-gray-300/60",
    glow: "shadow-[0_0_18px_rgba(200,200,200,0.35)]",
    bg: "from-gray-400/25 via-gray-400/10 to-transparent",
    border: "border-gray-400/50",
  },
  3: {
    height: "h-20 sm:h-28",
    icon: Award,
    iconColor: "text-[#E67E22]",
    ringColor: "ring-[#E67E22]/60",
    glow: "shadow-[0_0_18px_rgba(230,126,34,0.35)]",
    bg: "from-[#E67E22]/25 via-[#E67E22]/10 to-transparent",
    border: "border-[#E67E22]/50",
  },
};

export default function TopWinners() {
  const [top3, setTop3] = useState(initialTop3);
  const [winners, setWinners] = useState(initialVisible);
  const [highlightRank, setHighlightRank] = useState(null);
  const [highlightTop3Rank, setHighlightTop3Rank] = useState(null);

  const usedTop3Names = useRef(new Set(initialTop3.map((w) => w.name)));
  const usedTop3Avatars = useRef(new Set(initialTop3.map((w) => w.avatar)));
  const usedNames = useRef(new Set(initialVisible.map((w) => w.name)));

  // --- rotate top 3 ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTop3((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const current = prev[idx];

        let nameCandidates = top3NamePool.filter(
          (n) => !usedTop3Names.current.has(n),
        );
        if (nameCandidates.length === 0) nameCandidates = top3NamePool;
        const newName =
          nameCandidates[Math.floor(Math.random() * nameCandidates.length)];

        let avatarCandidates = avatarPool
          .map((_, i) => i)
          .filter((i) => !usedTop3Avatars.current.has(i));
        if (avatarCandidates.length === 0)
          avatarCandidates = avatarPool.map((_, i) => i);
        const newAvatarIdx =
          avatarCandidates[Math.floor(Math.random() * avatarCandidates.length)];

        usedTop3Names.current.delete(current.name);
        usedTop3Names.current.add(newName);
        usedTop3Avatars.current.delete(current.avatar);
        usedTop3Avatars.current.add(newAvatarIdx);

        const baseAmount = parseInt(current.amount.replace(/[₹,]/g, ""), 10);
        const jitter = Math.round(baseAmount * (0.97 + Math.random() * 0.04));

        const updated = [...prev];
        updated[idx] = {
          ...current,
          name: newName,
          avatar: newAvatarIdx,
          amount: formatINR(jitter),
        };

        setHighlightTop3Rank(updated[idx].rank);
        setTimeout(() => setHighlightTop3Rank(null), 900);

        return updated;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // --- rotate 4-10 ---
  useEffect(() => {
    const interval = setInterval(() => {
      setWinners((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const current = prev[idx];

        const visibleIds = new Set(prev.map((w) => w.poolId));
        const candidates = winnersPool.filter((w) => !visibleIds.has(w.id));
        const pick = candidates.length
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : winnersPool[Math.floor(Math.random() * winnersPool.length)];

        const jitter = Math.round(pick.amount * (0.95 + Math.random() * 0.08));

        usedNames.current.delete(current.name);
        usedNames.current.add(pick.name);

        const updated = [...prev];
        updated[idx] = {
          ...current,
          poolId: pick.id,
          name: pick.name,
          amount: jitter,
        };

        setHighlightRank(updated[idx].rank);
        setTimeout(() => setHighlightRank(null), 900);

        return updated;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  // Sort top3 for podium: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="w-full bg-[#0B0410] px-3 py-5 sm:px-4 sm:py-6">
      <style>{`
        @keyframes rowFlash {
          0% { background-color: rgba(155, 89, 182, 0.3); transform: scale(1.015); }
          100% { background-color: transparent; transform: scale(1); }
        }
        .row-flash { animation: rowFlash 0.9s ease-out; border-radius: 8px; }

        @keyframes fadeSwap {
          0% { opacity: 0; transform: translateY(-3px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-swap { animation: fadeSwap 0.4s ease-out; }

        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .live-dot { animation: livePulse 1.4s ease-in-out infinite; }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(241, 196, 15, 0.4); }
          50% { box-shadow: 0 0 30px rgba(241, 196, 15, 0.7); }
        }
        .crown-glow { animation: glowPulse 2.5s ease-in-out infinite; }

        @keyframes riseUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .rise-up { animation: riseUp 0.6s ease-out; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75)] flex items-center justify-center">
              <Trophy className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-wide uppercase leading-tight">
                Top Winners
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-tight">
                Live leaderboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] live-dot" />
            <span className="text-[10px] font-semibold text-[#00E676] tracking-wide">
              LIVE
            </span>
          </div>
        </div>

        {/* ================= PODIUM (TOP 3) ================= */}
        <div className="mb-4 sm:mb-5 rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="text-center py-2.5 border-b border-[#2a1b3d] bg-[#12061C]">
            <span className="text-[#F1C40F] font-black text-[11px] sm:text-xs tracking-widest">
              🏆 TOP 3 WINNERS
            </span>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 px-3 sm:px-6 pt-6 pb-4">
            {podiumOrder.map((w) => {
              if (!w) return null;
              const config = podiumConfig[w.rank];
              const RankIcon = config.icon;
              const isHighlighted = highlightTop3Rank === w.rank;

              return (
                <div
                  key={w.rank}
                  className={`flex flex-col items-center rise-up ${
                    isHighlighted ? "row-flash" : ""
                  }`}
                >
                  {/* Rank Icon Crown */}
                  <RankIcon
                    size={w.rank === 1 ? 24 : 20}
                    className={`${config.iconColor} mb-1 ${
                      w.rank === 1 ? "crown-glow" : ""
                    }`}
                    strokeWidth={2.5}
                  />

                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ${config.ringColor} ${config.glow} bg-[#2a1b3d]`}
                    >
                      <img
                        key={w.avatar}
                        src={avatarPool[w.avatar]}
                        alt={w.name}
                        loading="lazy"
                        className="w-full h-full object-cover fade-swap"
                      />
                    </div>
                    {/* Rank Badge */}
                    <div
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-sm font-black ${rankBadgeStyle[w.rank]} shadow-lg border-2 border-[#1C0F2B]`}
                    >
                      {w.rank}
                    </div>
                  </div>

                  {/* Podium Block */}
                  <div
                    className={`w-full mt-2 rounded-t-xl bg-gradient-to-b ${config.bg} border ${config.border} border-b-0 ${config.height} flex flex-col items-center justify-end pb-2 px-1`}
                  >
                    <span
                      key={w.name}
                      className="text-[10px] sm:text-xs font-bold text-white truncate w-full text-center fade-swap"
                    >
                      {w.name}
                    </span>
                    <span
                      key={w.amount}
                      className={`text-[10px] sm:text-sm font-black ${config.iconColor} whitespace-nowrap fade-swap mt-0.5`}
                    >
                      {w.amount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 4-10 RANK WINNERS ================= */}
        <div className="rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-[#2a1b3d] bg-[#12061C]">
            <span className="text-[#9B59B6] font-black text-[11px] sm:text-xs tracking-widest">
              ⭐ 4 - 10 RANK WINNERS
            </span>
            <span className="text-[10px] text-gray-500">Live updates</span>
          </div>

          <div className="divide-y divide-[#2a1b3d]">
            {winners.map((w) => {
              const isHighlighted = highlightRank === w.rank;
              return (
                <div
                  key={w.rank}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#2a1b3d]/30 transition-colors ${
                    isHighlighted ? "row-flash" : ""
                  }`}
                >
                  {/* Rank Number */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#12061C] border border-[#2a1b3d] flex items-center justify-center text-[11px] sm:text-xs font-black text-gray-400 flex-shrink-0">
                    {w.rank}
                  </div>

                  {/* Name */}
                  <span
                    key={w.name}
                    className="flex-1 min-w-0 text-gray-200 font-semibold text-xs sm:text-sm truncate fade-swap"
                  >
                    {w.name}
                  </span>

                  {/* Amount */}
                  <span
                    key={w.amount}
                    className="text-[#B45CFF] font-black text-xs sm:text-sm whitespace-nowrap fade-swap"
                  >
                    {formatINR(w.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
