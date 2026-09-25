import { useEffect, useRef, useState } from "react";
import { FaCrown, FaFire, FaSpinner } from "react-icons/fa";
import { GiAirplane } from "react-icons/gi";
import { MdGamepad, MdPlayCircle, MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { GiAirplane } from "react-icons/gi";

import GamePlayModal from "../../components/GamePlayModal";

import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const AviatorGames = ({ isHome = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { gameUrl, launchLoading, launchError } = useSelector(
    (state) => state.game
  );

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hovered, setHovered] = useState(false);

  // Prevent duplicate auto launch
  const autoLaunchStarted = useRef(false);

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const aviatorGame = {
    game_name: "Aviator",
    game_uid: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
    game_type: "Casino Table",
    provider: "SPB",
    icon: "http://files.worldcasinoonline.com/Document/Game/Aviator_1697879631441.088.png",
    rating: 4.9,
    players: "5.6K",
    volatility: "High",
    min_bet: 10,
    max_bet: 10000,
    is_featured: true,
    is_new: false,
    description:
      "The legendary crash game where timing is everything. Cash out before the plane flies away!",
  };

  /*
   * ============================================================
   * RESET GAME STATE
   * ============================================================
   *
   * Home page par reset nahi karna.
   * Sirf actual /aviator page par initial state reset hoga.
   */
  useEffect(() => {
    if (!isHome) {
      dispatch(resetGameState());
    }
  }, [dispatch, isHome]);

  /*
   * ============================================================
   * AUTO LAUNCH
   * ============================================================
   *
   * Sirf:
   *
   * Home
   *   ↓
   * click
   *   ↓
   * /aviator
   *   ↓
   * autoLaunch: true
   *
   * tab chalega.
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

    const game = {
      ...aviatorGame,
      game_uid: location.state.gameUid,
    };

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
   *
   * Important:
   * gameUrl aane ka matlab launch successful ho gaya.
   * Iske baad GamePlayModal open hoga.
   */
  useEffect(() => {
    if (!isHome && gameUrl && selectedGame) {
      setIsGameModalOpen(true);
    }
  }, [gameUrl, isHome, selectedGame]);

  /*
   * ============================================================
   * HOME CLICK
   * ============================================================
   */
  const handlePlay = () => {
    if (isHome) {
      navigate("/aviator", {
        state: {
          autoLaunch: true,
          gameUid: aviatorGame.game_uid,
        },
      });

      return;
    }

    /*
     * Normal play from Aviator page
     */
    setSelectedGame(aviatorGame);

    dispatch(
      launchGame({
        gameId: aviatorGame.game_uid,
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
   * HOME -> AVIATOR AUTO LAUNCH LOADER
   * ============================================================
   *
   * Loader ONLY when:
   *
   * !isHome
   * + autoLaunch true
   * + gameUrl not received yet
   *
   * So direct /aviator open par loader nahi chalega.
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
          FULL SCREEN AUTO LAUNCH LOADER
          ======================================================== */}
      {isAutoLaunching && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center px-6 text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 animate-ping rounded-full bg-[#B45CFF]/20" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] shadow-[0_0_30px_rgba(180,92,255,0.6)]">
                <GiAirplane className="text-4xl text-white" />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">
              Loading Aviator...
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Please wait while the game is opening
            </p>

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
          AVIATOR PAGE
          ======================================================== */}
      <div className="bg-[#0B0410] px-3 py-4 sm:px-6 sm:py-6">
        {/* HEADER */}
        <div className="max-w-6xl mb-4 sm:mb-6 sm:hidden md:block">
          <div className="mb-1 flex items-center gap-2 sm:gap-2.5">
            <div className={`rounded-lg p-2 sm:p-2.5 ${purpleGradient}`}>
              <GiAirplane className="text-lg text-white sm:text-xl" />
            </div>

            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Aviator
            </h1>
          </div>

          <p className="text-xs text-gray-400 sm:text-sm">
            High-risk, high-reward crash game loved by millions
          </p>
        </div>

        {/* GRID */}
        <div className="max-w-6xl grid grid-cols-1 gap-3 sm:grid-cols-2 sm:-mt-4 sm:gap-5 lg:grid-cols-3">
          <div
            onClick={handlePlay}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative flex cursor-pointer flex-row overflow-hidden rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] transition-all duration-300 hover:scale-[1.02] hover:border-[#B45CFF]/60 hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)] sm:flex-col"
          >
            {/* IMAGE */}
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden bg-[#12061C] sm:h-[9rem] sm:w-full">
              <img
                src={aviatorGame.icon}
                alt="Aviator"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/40 to-transparent" />

              {/* BADGES */}
              <div className="absolute left-1.5 right-1.5 top-1.5 flex flex-wrap items-center gap-1 sm:left-2.5 sm:top-2.5">
                {aviatorGame.is_featured && (
                  <div
                    className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${purpleGradient}`}
                  >
                    <FaCrown className="text-[8px] text-white sm:text-[10px]" />

                    <span className="text-[8px] font-bold leading-none text-white sm:text-[10px]">
                      HOT
                    </span>
                  </div>
                )}

                <div className="hidden rounded-full border border-[#2a1b3d] bg-[#0B0410]/80 px-1.5 py-0.5 backdrop-blur-sm sm:block">
                  <span className="text-[10px] font-bold leading-none text-white">
                    {aviatorGame.game_type}
                  </span>
                </div>
              </div>

              {/* PLAY OVERLAY */}
              <div
                className={`
                  absolute inset-0 flex items-center justify-center
                  transition-all duration-300
                  ${
                    hovered
                      ? "bg-black/70 opacity-100"
                      : "bg-black/30 opacity-100 sm:bg-black/40 sm:opacity-0"
                  }
                `}
              >
                {launchLoading ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <FaSpinner className="animate-spin text-2xl text-white sm:text-4xl" />

                    <span className="text-[10px] text-white sm:text-sm">
                      Launching...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <div
                      className={`rounded-full p-2 sm:p-4 ${purpleGradient}`}
                    >
                      <MdPlayCircle className="text-2xl text-white sm:text-4xl" />
                    </div>

                    <span className="hidden rounded-full bg-black/50 px-3 py-1.5 text-sm font-bold text-white sm:inline">
                      PLAY NOW
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex min-w-0 flex-1 flex-col justify-center p-2.5 sm:p-4">
              <div className="mb-1 flex items-center justify-between gap-1.5">
                <h3 className="truncate text-sm font-bold text-white sm:text-lg">
                  {aviatorGame.game_name}
                </h3>

                <div className="flex flex-shrink-0 items-center gap-0.5">
                  <MdStar className="text-xs text-[#F1C40F] sm:text-sm" />

                  <span className="text-[10px] font-bold text-white sm:text-sm">
                    {aviatorGame.rating}
                  </span>
                </div>
              </div>

              <p className="mb-1.5 line-clamp-1 text-[10px] text-gray-400 sm:mb-3 sm:line-clamp-2 sm:text-xs">
                {aviatorGame.description}
              </p> */}

              <div className="flex items-center gap-2 text-[9px] text-gray-500 sm:gap-4 sm:text-xs">
                <span className="flex items-center gap-0.5">
                  <MdGamepad className="text-[10px] sm:text-xs" />

                  {aviatorGame.players}
                </span>

                <span className="flex items-center gap-0.5 text-[#B45CFF]">
                  <FaFire className="text-[9px] sm:text-xs" />

                  {aviatorGame.volatility}
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#B45CFF]/40" />
          </div>
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

export default AviatorGames;
