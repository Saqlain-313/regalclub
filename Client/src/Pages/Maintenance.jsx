import { Clock, Coins, Home, MessageCircle, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

const Maintenance = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const glowShadow =
    "shadow-[0_4px_20px_-4px_rgba(155,89,182,0.35),0_2px_8px_-2px_rgba(139,43,255,0.25)]";
  const glowShadowSoft =
    "shadow-[0_2px_12px_-2px_rgba(155,89,182,0.25),0_1px_4px_-1px_rgba(139,43,255,0.15)]";

  return (
    <div className="min-h-screen bg-[#0B0410] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full text-center">
        {/* RegalClub Brand */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">
            RegalClub
          </h1>
          <p className="text-[10px] text-gray-500 font-medium tracking-widest">
            PLAY • WIN • REPEAT
          </p>
        </div>

        {/* Signature: spinning coin inside a glowing ring */}
        <div className="relative w-36 h-36 mx-auto mb-8">
          {/* pulsing outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#B45CFF]/40 to-[#7418F5]/40 blur-xl animate-pulse-slow" />
          {/* static ring */}
          <div
            className={`absolute inset-2 rounded-full bg-[#1C0F2B] border border-[#9B59B6]/40 ${glowShadow}`}
          />
          {/* spinning coin */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-16 h-16 rounded-full ${purpleGradient} flex items-center justify-center`}
              style={{
                animation: "spin-coin 2.4s linear infinite",
                transformStyle: "preserve-3d",
              }}
            >
              <Coins size={28} className="text-white" strokeWidth={2.2} />
            </div>
          </div>
          {/* wrench badge */}
          <div className="absolute -bottom-1 -right-1 bg-[#1C0F2B] rounded-full p-2 border border-[#9B59B6]/40 shadow-[0_2px_8px_-2px_rgba(155,89,182,0.4)]">
            <Wrench size={16} className="text-[#C77AFF]" strokeWidth={2.3} />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-xl font-black text-white mb-2">
          We're topping up the tables{dots}
        </h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          RegalClub is under scheduled maintenance. Your credit and bet history
          are safe — we'll be back shortly.
        </p>

        {/* Status card */}
        <div
          className={`bg-[#1C0F2B] rounded-2xl ${glowShadowSoft} border border-[#2a1b3d] p-4 mb-4 text-left`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#9B59B6]/15 p-1.5 rounded-lg border border-[#9B59B6]/40">
                <Clock size={14} className="text-[#C77AFF]" />
              </div>
              <span className="text-xs font-bold text-gray-300">
                Estimated time
              </span>
            </div>
            <span className="text-xs font-bold text-[#C77AFF]">~45 mins</span>
          </div>

          {/* progress bar */}
          <div className="w-full h-2 bg-[#12061C] rounded-full overflow-hidden border border-[#2a1b3d]">
            <div
              className="h-full bg-gradient-to-r from-[#B45CFF] via-[#7418F5] to-[#3A00C9] rounded-full shadow-[0_0_8px_#B45CFF]"
              style={{ width: "68%" }}
            />
          </div>
          <p className="text-[9px] text-gray-500 mt-1.5 font-medium tracking-wide">
            68% COMPLETE
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#12061C] rounded-xl border border-[#2a1b3d] text-gray-300 font-bold text-sm shadow-[0_2px_8px_-2px_rgba(155,89,182,0.25)] hover:bg-[#2a1b3d] hover:text-white hover:border-[#9B59B6]/50 transition-all"
          >
            <Home size={15} />
            Back to Home
          </a>
          <a
            href="/support-chat"
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 ${purpleGradient} rounded-xl text-white font-bold text-sm active:scale-[0.98] transition-all`}
          >
            <MessageCircle size={15} />
            Support
          </a>
        </div>

        {/* Footer */}
        <p className="mt-6 text-[10px] text-gray-500">
          Thanks for your patience — good things are worth the wait.
        </p>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.6s ease-in-out infinite;
        }
        @keyframes spin-coin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Maintenance;
