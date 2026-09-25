import { useEffect, useRef, useState } from "react";
import { FaCrown, FaSpinner } from "react-icons/fa";
import { MdPlayCircle, MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { GiMineExplosion } from "react-icons/gi";
import GamePlayModal from "../../components/GamePlayModal";

import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const Minesgame = ({ isHome = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { gameUrl, launchLoading, launchError } = useSelector(
    (state) => state.game
  );

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Prevent duplicate auto launch
  const autoLaunchStarted = useRef(false);

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const minesGames = [
    {
      id: 1692,
      game_name: "Mines",
      game_uid: "5c4a12fb0a9b296d9b0d5f9e1cd41d65",
      game_type: "Casino Table",
      provider: "Spribe",
      icon: "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/811.png",
      rating: 4.7,
      players: "3.9K",
      volatility: "High",
      min_bet: 5,
      max_bet: 8000,
      is_featured: true,
      description:
        "A thrilling strategy game where every click could explode your winnings.",
    },
    {
      id: 757,
      game_name: "Mines",
      game_uid: "72ce7e04ce95ee94eef172c0dfd6dc17",
      game_type: "Crash Game",
      provider: "JILI",
      icon: "https://i.ibb.co/dsm8qBc6/3.png",
      rating: 4.5,
      players: "2.1K",
      volatility: "Medium",
      min_bet: 10,
      max_bet: 5000,
      is_featured: false,
      description:
        "Fast-paced mines action with instant cash-out excitement.",
    },
  ];

  /*
   * ============================================================
   * RESET GAME STATE
   * ============================================================
   */
  useEffect(() => {
    if (!isHome) {
      dispatch(resetGameState());
    }
  }, [dispatch, isHome]);

  /*
   * ============================================================
   * AUTO LAUNCH FROM HOME
   * ============================================================
   *
   * Home
   *   ↓
   * Mines click
   *   ↓
   * /mines
   *   ↓
   * autoLaunch: true
   *   ↓
   * launchGame()
   */
  useEffect(() => {
    if (
      isHome ||
      !location.state?.autoLaunch ||
      !location.state?.gameUid ||
      autoLaunchStarted.current
    ) {
      return;
    }

    autoLaunchStarted.current = true;

    const game = minesGames.find(
      (g) => g.game_uid === location.state.gameUid
    );

    if (!game) {
      autoLaunchStarted.current = false;
      return;
    }

    setSelectedGame(game);

    dispatch(
      launchGame({
        gameId: game.game_uid,
      })
    );
  }, [dispatch, isHome, location.state]);

  /*
   * ============================================================
   * OPEN MODAL WHEN GAME URL ARRIVES
   * ============================================================
   */
  useEffect(() => {
    if (!isHome && gameUrl && selectedGame) {
      setIsGameModalOpen(true);
    }
  }, [gameUrl, isHome, selectedGame]);

  /*
   * ============================================================
   * HOME GAME CLICK
   * ============================================================
   */
  const handlePlay = (game) => {
    if (isHome) {
      navigate("/mines", {
        state: {
          autoLaunch: true,
          gameUid: game.game_uid,
        },
      });

      return;
    }

    setSelectedGame(game);

    dispatch(
      launchGame({
        gameId: game.game_uid,
      })
    );
  };

  /*
   * ============================================================
   * CLOSE GAME
   * ============================================================
   */
  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);

    dispatch(clearGameUrl());
  };

  /*
   * ============================================================
   * FULL SCREEN AUTO LAUNCH LOADER
   * ============================================================
   *
   * Loader ONLY:
   *
   * Home se /mines aaye
   * +
   * autoLaunch true
   * +
   * gameUrl abhi nahi aaya
   *
   * Direct /mines open karne par loader nahi aayega.
   */
  const isAutoLaunching =
    !isHome &&
    location.state?.autoLaunch &&
    location.state?.gameUid &&
    !gameUrl &&
    (launchLoading || autoLaunchStarted.current);

  return (
    <>
      {/* ========================================================
          AUTO LAUNCH FULL SCREEN LOADER
          ======================================================== */}
      {isAutoLaunching && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center px-6 text-center">
            {/* ICON */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 animate-ping rounded-full bg-[#B45CFF]/20" />

              <div
                className={`relative flex h-20 w-20 items-center justify-center rounded-full ${purpleGradient}`}
              >
                <GiMineExplosion className="text-4xl text-white" />
              </div>
            </div>

            {/* TITLE */}
            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">
              Loading Mines...
            </h2>

            {/* DESCRIPTION */}
            <p className="mt-2 text-sm text-gray-400">
              Please wait while the game is opening
            </p>

            {/* SPINNER */}
            <div className="mt-5 flex items-center gap-2">
              <FaSpinner className="animate-spin text-lg text-[#B45CFF]" />

              <span className="text-sm font-medium text-gray-300">
                Launching game...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MINES PAGE
          ======================================================== */}
      <div className="bg-[#0B0410] px-3 py-4 sm:px-6 sm:py-6">
        {/* HEADER */}
        <div className="mx-auto mb-4 sm:mb-6 sm:hidden md:block">
          <div className="mb-1 flex items-center gap-2 sm:gap-2.5">
            <div className={`rounded-lg p-2 sm:p-2.5 ${purpleGradient}`}>
              <GiMineExplosion className="text-lg text-white sm:text-xl" />
            </div>

            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Mines
            </h1>
          </div>

          <p className="text-xs text-gray-400 sm:text-sm">
            Strategic risk-taking with explosive rewards
          </p>
        </div>

        {/* GRID */}
        <div className="max-w-6xl grid grid-cols-1 gap-3 sm:grid-cols-2 sm:-mt-4 sm:gap-5 lg:grid-cols-3">
          {minesGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handlePlay(game)}
              onMouseEnter={() => setHoveredId(game.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative flex cursor-pointer flex-row overflow-hidden rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] transition-all duration-300 hover:scale-[1.02] hover:border-[#B45CFF]/60 hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)] sm:flex-col"
            >
              {/* IMAGE */}
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden sm:h-[9rem] sm:w-full">
                <img
                  src={game.icon}
                  alt={game.game_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/40 to-transparent" />

                {/* BADGES */}
                <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1 sm:left-2.5 sm:top-2.5">
                  {game.is_featured && (
                    <div
                      className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${purpleGradient}`}
                    >
                      <FaCrown className="text-[8px] text-white sm:text-[10px]" />

                      <span className="text-[8px] font-bold text-white sm:text-[10px]">
                        HOT
                      </span>
                    </div>
                  )}

                  <div className="hidden rounded-full border border-[#2a1b3d] bg-[#0B0410]/80 px-1.5 py-0.5 sm:block">
                    <span className="text-[10px] font-bold text-white">
                      {game.game_type}
                    </span>
                  </div>
                </div>

                {/* PLAY OVERLAY */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredId === game.id
                      ? "bg-black/70 opacity-100"
                      : "bg-black/30 opacity-100 sm:opacity-0"
                  }`}
                >
                  {launchLoading && selectedGame?.id === game.id ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <FaSpinner className="animate-spin text-xl text-white sm:text-3xl" />

                      <span className="text-[10px] text-white sm:text-sm">
                        Launching...
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`rounded-full p-1.5 sm:p-3 ${purpleGradient}`}
                    >
                      <MdPlayCircle className="text-xl text-white sm:text-3xl" />
                    </div>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex min-w-0 flex-1 flex-col justify-center p-2.5 sm:p-4">
                <div className="mb-1 flex items-start justify-between gap-1.5">
                  <h3 className="truncate text-sm font-bold text-white sm:text-lg">
                    {game.game_name}
                  </h3>

                  <div className="flex flex-shrink-0 items-center gap-0.5">
                    <MdStar className="text-xs text-[#F1C40F] sm:text-sm" />

                    <span className="text-[10px] font-bold text-white sm:text-sm">
                      {game.rating}
                    </span>
                  </div>
                </div>

                <p className="mb-1.5 line-clamp-1 text-[10px] text-gray-400 sm:mb-3 sm:line-clamp-2 sm:text-xs">
                  {game.description}
                </p> */}

                <div className="flex items-center gap-2 text-[9px] text-gray-500 sm:gap-4 sm:text-xs">
                  <span className="flex items-center gap-0.5">
                    👥 {game.players}
                  </span>

                  <span className="flex items-center gap-0.5 text-[#B45CFF]">
                    🔥 {game.volatility}
                  </span>
                </div>
              </div>

              {/* BORDER */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#B45CFF]/40" />
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          GAME MODAL
          ======================================================== */}
      {!isHome && (
        <GamePlayModal
          isOpen={isGameModalOpen}
          onClose={closeGameModal}
          gameData={selectedGame}
          gameUrl={gameUrl}
          loading={launchLoading}
          launchError={launchError}
        />
      )}
    </>
  );
};

export default Minesgame;
