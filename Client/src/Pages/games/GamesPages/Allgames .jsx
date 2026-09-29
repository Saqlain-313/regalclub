import { useEffect, useRef, useState } from "react";
import { FaCrown, FaFire, FaSpinner } from "react-icons/fa";
import { GiAirplane, GiChicken, GiMineExplosion } from "react-icons/gi";
import { MdGamepad, MdPlayCircle, MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import GamePlayModal from "../../../components/GamePlayModal";

import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../../redux/slices/gameSlice";

const purpleGradient =
  "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

/*
 * ============================================================
 * ALL GAMES DATA (Chicken + Mines + Aviator combined)
 * ============================================================
 * Har game object me `id` unique honi chahiye (launchLoading
 * ka per-card check isi se hota hai), aur `loaderIcon` +
 * `loaderTitle` auto-launch full-screen loader ke liye.
 */
const allGames = [
  {
    id: "chicken-1",
    category: "chicken",
    game_name: "Chicken Road 2.0",
    game_uid: "562b299961b0ec40f252a832453c67b0",
    game_type: "Instant",
    provider: "inout",
    icon: "https://i.ibb.co/bj8PLGRD/67ff9cb072aefa0252de1fcc-chiken-road-2-1.png",
    rating: 4.8,
    players: "2.4K",
    volatility: "Medium",
    min_bet: 10,
    max_bet: 5000,
    is_featured: true,
    is_new: false,
    loaderIcon: GiChicken,
    loaderTitle: "Loading Chicken Game...",
  },
  {
    id: "chicken-2",
    category: "chicken",
    game_name: "Chicken Road",
    game_uid: "2126c5c458316ba1f2df65b387b60408",
    game_type: "Instant",
    provider: "inout",
    icon: "https://i.ibb.co/Z62bz9HP/66158cf70716189b6ee244fc-CHICKEN-ROAD.png",
    rating: 4.5,
    players: "1.8K",
    volatility: "Low",
    min_bet: 5,
    max_bet: 2500,
    is_featured: false,
    is_new: true,
    loaderIcon: GiChicken,
    loaderTitle: "Loading Chicken Game...",
  },
  {
    id: "mines-1",
    category: "mines",
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
    is_new: false,
    loaderIcon: GiMineExplosion,
    loaderTitle: "Loading Mines...",
  },
  {
    id: "mines-2",
    category: "mines",
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
    is_new: false,
    loaderIcon: GiMineExplosion,
    loaderTitle: "Loading Mines...",
  },
  {
    id: "aviator-1",
    category: "aviator",
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
    loaderIcon: GiAirplane,
    loaderTitle: "Loading Aviator...",
  },
  {
    id: "7up7down-1",
    category: "instant",
    game_name: "7up7down",
    game_uid: "3aca3084a5c1a8c77c52d6147ee3d2ab",
    game_type: "Instant",
    provider: "jili",
    icon: "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/7up7down.png",
    rating: 4.6,
    players: "1.2K",
    volatility: "Low",
    min_bet: 10,
    max_bet: 5000,
    is_featured: true,
    is_new: true,
    // route nahi hai — home se click par direct modal launch
  },
];

const AllGames = ({ isHome = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { gameUrl, launchLoading, launchError } = useSelector(
    (state) => state.game,
  );

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Prevent duplicate auto launch
  const autoLaunchStarted = useRef(false);

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
   * Game click
   *   ↓
   * routePath (e.g. /games)
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

    const game = allGames.find((g) => g.game_uid === location.state.gameUid);

    if (!game) {
      return;
    }

    autoLaunchStarted.current = true;

    setSelectedGame(game);

    dispatch(
      launchGame({
        gameId: game.game_uid,
      }),
    );
  }, [dispatch, isHome, location.state]);

  /*
   * ============================================================
   * OPEN MODAL WHEN GAME URL ARRIVES
   * ============================================================
   */
  useEffect(() => {
    if (gameUrl && selectedGame) {
      setIsGameModalOpen(true);
    }
  }, [gameUrl, selectedGame]);

  /*
   * ============================================================
   * PLAY GAME
   * ============================================================
   */
  const handlePlay = async (game) => {
    /*
     * HOME -> GAME WITH DEDICATED ROUTE (/chicken, /mines, /aviator)
     */
    if (isHome && game.route) {
      navigate(game.route, {
        state: {
          autoLaunch: true,
          gameUid: game.game_uid,
        },
      });

      return;
    }

    /*
     * HOME -> GAME WITHOUT ROUTE (e.g. 7up7down) — direct modal launch
     * NORMAL PAGE (direct click, no home redirect) — same
     */
    try {
      setSelectedGame(game);

      await dispatch(
        launchGame({
          gameId: game.game_uid,
        }),
      ).unwrap();
    } catch (err) {
      alert(err || "Failed to launch game");
    }
  };

  /*
   * ============================================================
   * CLOSE GAME MODAL
   * ============================================================
   */
  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);

    dispatch(clearGameUrl());
  };

  /*
   * ============================================================
   * AUTO LAUNCH LOADER
   * ============================================================
   *
   * Loader ONLY when:
   *
   * Home -> routePath
   * +
   * autoLaunch true
   * +
   * gameUrl not received
   *
   * Direct routePath open = NO LOADER
   */
  const isAutoLaunching =
    !isHome &&
    location.state?.autoLaunch &&
    location.state?.gameUid &&
    !gameUrl &&
    (launchLoading || autoLaunchStarted.current);

  const LoaderIcon = selectedGame?.loaderIcon || GiChicken;

  return (
    <>
      {/* ========================================================
          FULL SCREEN AUTO LAUNCH LOADER
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
                <LoaderIcon className="text-4xl text-white" />
              </div>
            </div>

            {/* TITLE */}
            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">
              {selectedGame?.loaderTitle || "Loading Game..."}
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
          ALL GAMES (Chicken + Mines + Aviator)
          ======================================================== */}
      <div className="bg-[#0B0410] px-4 py-6 sm:px-3">
        {/* HEADER — Platform recommendation */}
        <div className="mx-auto mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FaFire className="w-5 h-5 text-[#B45CFF] flex-shrink-0" />
              <h2 className="text-lg font-extrabold tracking-tight text-white sm:text-xl leading-tight">
                Platform recommendation
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/chicken")}
              className="flex items-center gap-1 flex-shrink-0 text-xs font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-full hover:bg-[#2a1b3d] hover:text-white transition-all"
            >
              All {allGames.length}
              <span className="text-base leading-none">›</span>
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
          {allGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handlePlay(game)}
              onMouseEnter={() => setHoveredId(game.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.02] hover:border-[#B45CFF]/60 hover:shadow-[0_8px_20px_rgba(155,89,182,0.3)] w-full h-auto"
            >
              {/* IMAGE */}
              <div className="relative w-full aspect-[3/4] flex-shrink-0 overflow-hidden bg-[#1C0F2B]">
                <img
                  src={game.icon}
                  alt={game.game_name}
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    // Aviator image ke edges white hain — thoda zoom
                    // karke full-fit karo
                    game.id === "aviator-1" ? "scale-110" : ""
                  }`}
                />

                {/* BADGES */}
                <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1 sm:left-2 sm:top-2">
                  {game.is_featured && (
                    <span
                      className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white sm:text-[9px] ${purpleGradient}`}
                    >
                      <FaCrown className="text-[7px] sm:text-[9px]" />
                      HOT
                    </span>
                  )}

                  {game.is_new && (
                    <span className="rounded-full bg-[#00E676] px-1.5 py-0.5 text-[8px] font-bold text-[#0B0410] sm:text-[10px]">
                      NEW
                    </span>
                  )}
                </div>

                {/* PLAY OVERLAY */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition ${
                    hoveredId === game.id
                      ? "bg-black/40 opacity-100"
                      : "bg-black/30 opacity-100 sm:bg-black/40 sm:opacity-0"
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
                      className={`rounded-full p-1.5 sm:p-2.5 ${purpleGradient}`}
                    >
                      <MdPlayCircle className="text-lg text-white sm:text-2xl" />
                    </div>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 p-2">
                <div className="flex items-center justify-between gap-1.5">
                  <h3 className="truncate text-xs font-bold text-white sm:text-sm">
                    {game.game_name}
                  </h3>

                  <div className="flex flex-shrink-0 items-center gap-0.5">
                    <MdStar className="text-[10px] text-[#F1C40F] sm:text-xs" />
                    <span className="text-[10px] font-bold text-white sm:text-xs">
                      {game.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-gray-500 sm:text-[10px]">
                  {/* "X playing" sirf 7up7down par */}
                  {game.id === "7up7down-1" ? (
                    <span className="flex items-center gap-0.5">
                      <MdGamepad className="text-[10px]" />
                      {game.players} playing
                    </span>
                  ) : (
                    <span />
                  )}

                  <span className="flex items-center gap-0.5 text-[#B45CFF]">
                    <FaFire className="text-[9px]" />
                    {game.volatility}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          GAME MODAL
          ======================================================== */}
      <GamePlayModal
        isOpen={isGameModalOpen}
        onClose={closeGameModal}
        gameData={selectedGame}
        gameUrl={gameUrl}
        loading={launchLoading}
        launchError={launchError}
      />
    </>
  );
};

export default AllGames;
