import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// 👇 Data imports — component calls ki jagah
import { AllData, liveCasino, SlotsGames, TableGames } from "../Data/GamesData";

// ======================================================
// TABS
// ======================================================

const tabs = [
  { id: "all", label: "All" },
  { id: "slots", label: "Slots" },
  { id: "live", label: "Live Casino" },
  { id: "table", label: "Table Games" },
];

// ======================================================
// REUSABLE GAME GRID (same card design as your "all" tab)
// ======================================================

function GameGrid({ games = [], mobileLimit = 6, desktopLimit = 12 }) {
  const displayGames = games.slice(0, desktopLimit);

  if (displayGames.length === 0) {
    return (
      <div className="text-center py-16 bg-[#1C0F2B] rounded-2xl border border-dashed border-[#2a1b3d]">
        <p className="text-gray-400 text-sm">No games available</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-6 grid-cols-3 gap-3 md:gap-4">
      {displayGames.map((game, index) => {
        const hideOnMobile = index >= mobileLimit;

        return (
          <Link
            key={game.game_uid || game.id || index}
            to={`/game/${game.game_uid || game.id}`}
            className={`group relative rounded-2xl overflow-hidden bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-300 hover:border-[#9B59B6]/50 hover:shadow-[0_6px_18px_rgba(155,89,182,0.2)] ${
              hideOnMobile ? "hidden md:block" : ""
            }`}
          >
            {/* Game Image */}
            <div className="relative aspect-square w-full overflow-hidden">
              <img
                src={game.img || game.icon}
                alt={game.game_name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Badge */}
              {game.badge && (
                <span
                  className={`absolute top-2 right-2 ${
                    game.badge === "HOT" ? "bg-[#E74C3C]" : "bg-[#00E676]"
                  } text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md`}
                >
                  {game.badge}
                </span>
              )}

              {/* Gradient Overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/70 to-transparent"></div>

              {/* Game Name + Provider over image */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <h3 className="text-sm font-bold text-white leading-tight truncate">
                  {game.game_name}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                  {game.provider || "Casino"}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function CasinoSlotGames() {
  const [activeTab, setActiveTab] = useState("all");
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  const tabsWrapRef = useRef(null);
  const tabRefs = useRef({});

  // Deduplicate helper
  const dedupe = (arr) =>
    arr.filter(
      (game, index, self) =>
        index === self.findIndex((g) => g.game_name === game.game_name),
    );

  // ============================================================
  // GAMES PER TAB (from data files)
  // ============================================================

  const gamesByTab = {
    all: dedupe([...AllData]).slice(0, 12),
    slots: dedupe([...SlotsGames]).slice(0, 12),
    live: dedupe([...liveCasino]).slice(0, 12),
    table: dedupe([...TableGames]).slice(0, 12),
  };

  // Measure & move the sliding pill
  const updateSlider = () => {
    const activeEl = tabRefs.current[activeTab];
    const wrapEl = tabsWrapRef.current;
    if (!activeEl || !wrapEl) return;

    setSliderStyle({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
    });
  };

  // Reposition whenever active tab changes
  useLayoutEffect(() => {
    updateSlider();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Reposition on window resize
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="w-full bg-[#0B0410] px-4 py-5 sm:px-6">
      {/* ================= HEADER ================= */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[22px]">🎰</span>
          <h2 className="text-[20px] font-extrabold tracking-tight text-white sm:text-[24px]">
            Casino & Slot Games
          </h2>
        </div>
        <Link
          to="/casino"
          className="flex items-center gap-1 text-sm font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition-all sm:text-base"
        >
          View all
          <span className="text-lg">›</span>
        </Link>
      </div>

      {/* ================= TABS ================= */}
      <div
        ref={tabsWrapRef}
        className="relative mb-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        <div
          className="absolute top-0 h-[38px] rounded-full border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] transition-all duration-300 ease-out"
          style={{
            left: sliderStyle.left,
            width: sliderStyle.width,
          }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors duration-300 ${
              activeTab === tab.id
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB CONTENT ================= */}

      {/* ALL TAB */}
      {activeTab === "all" && (
        <GameGrid games={gamesByTab.all} mobileLimit={6} desktopLimit={12} />
      )}

      {/* SLOTS TAB — data se */}
      {activeTab === "slots" && (
        <GameGrid games={gamesByTab.slots} mobileLimit={6} desktopLimit={12} />
      )}

      {/* LIVE CASINO TAB — data se */}
      {activeTab === "live" && (
        <GameGrid games={gamesByTab.live} mobileLimit={6} desktopLimit={12} />
      )}

      {/* TABLE GAMES TAB — data se */}
      {activeTab === "table" && (
        <GameGrid games={gamesByTab.table} mobileLimit={6} desktopLimit={12} />
      )}
    </section>
  );
}
