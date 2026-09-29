// components/home/NoticeBar.jsx
// Banner ke niche swipe/marquee announcement bar
// — speaker icon + scrolling messages + Detail button
import { FaBullhorn } from "react-icons/fa";

const NOTICES = [
  "Welcome to RegalClub! Play your favorite games and win big every day.",
  "Deposit now and get instant bonus credited to your wallet.",
  "Fast withdrawals — processed within 24-48 hours.",
  "24x7 support available on WhatsApp & Telegram.",
];

const NoticeBar = () => {
  return (
    <div className="flex items-center gap-2 bg-[#1C0F2B] rounded-full border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] pl-3 pr-1.5 py-1.5 overflow-hidden">
      {/* Speaker icon */}
      <FaBullhorn className="w-4 h-4 text-[#B45CFF] flex-shrink-0" />

      {/* Swipe/marquee messages */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap animate-notice-marquee">
          {[...NOTICES, ...NOTICES].map((text, i) => (
            <span
              key={i}
              className="pr-16 text-[11px] sm:text-xs font-semibold text-gray-300"
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Detail button */}
      <button
        type="button"
        onClick={() => navigateToNotices()}
        className="flex items-center gap-1 flex-shrink-0 bg-gradient-to-r from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] text-white text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full shadow-[0_0_10px_rgba(139,43,255,0.5)] active:scale-95 transition-transform"
      >
        <FaBullhorn className="w-3 h-3" />
        Detail
      </button>
    </div>
  );
};

// Detail par promo page par le jao
const navigateToNotices = () => {
  window.location.href = "/promo";
};

const marqueeStyle = `
  @keyframes notice-marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-notice-marquee {
    animation: notice-marquee 22s linear infinite;
  }
`;

const NoticeBarWithStyles = () => (
  <>
    <style>{marqueeStyle}</style>
    <NoticeBar />
  </>
);

export default NoticeBarWithStyles;
