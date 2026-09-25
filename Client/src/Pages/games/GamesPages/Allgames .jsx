import { useEffect, useRef, useState } from "react";
import { FaCrown, FaSpinner } from "react-icons/fa";
import { GiAirplane, GiChicken, GiMineExplosion } from "react-icons/gi";
import { MdGamepad, MdPlayCircle } from "react-icons/md";
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
    route: "/chicken",
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
    route: "/chicken",
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
    route: "/mines",
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
    route: "/mines",
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
    route: "/aviator",
    loaderIcon: GiAirplane,
    loaderTitle: "Loading Aviator...",
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
    if (!isHome && gameUrl && selectedGame) {
      setIsGameModalOpen(true);
    }
  }, [gameUrl, isHome, selectedGame]);

  /*
   * ============================================================
   * PLAY GAME
   * ============================================================
   */
  const handlePlay = async (game) => {
    /*
     * HOME -> GAME'S OWN ROUTE (/chicken, /mines, /aviator)
     */
    if (isHome) {
      navigate(game.route, {
        state: {
          autoLaunch: true,
          gameUid: game.game_uid,
        },
      });

      return;
    }

    /*
     * NORMAL PAGE (direct click, no home redirect)
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
      <div className="bg-[#0B0410] px-3 py-4 sm:px-3 sm:py-6">
        {/* HEADER */}
        <div className="mx-auto mb-4 sm:mb-6">
          <div className="mb-1 flex items-center gap-2 sm:gap-2.5">
            <div className={`rounded-lg p-2 sm:p-2.5 ${purpleGradient}`}>
              <GiChicken className="text-lg text-white sm:text-xl" />
            </div>

            <h1 className="text-xl font-bold text-white sm:text-2xl">
              All Games
            </h1>
          </div>

          <p className="text-xs text-gray-400 sm:text-sm">
            Chicken Road, Mines & Aviator — all your favorites in one place
          </p>
        </div>

        {/* GRID */}
        <div className="max-w-6xl grid grid-cols-1 gap-3 sm:grid-cols-3 sm:-mt-4 sm:gap-2">
          {allGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handlePlay(game)}
              onMouseEnter={() => setHoveredId(game.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group flex cursor-pointer flex-row overflow-hidden rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] transition-all duration-300 hover:scale-[1.02] hover:border-[#B45CFF]/60 hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)] sm:flex-col"
            >
              {/* IMAGE */}
              <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden sm:h-[9rem] sm:w-full">
                <img
                  src={game.icon}
                  alt={game.game_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/40 to-transparent" />

                {/* BADGES */}
                <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1 sm:left-2.5 sm:top-2.5">
                  {game.is_featured && (
                    <span
                      className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white sm:text-[10px] ${purpleGradient}`}
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
                      className={`rounded-full p-1.5 sm:p-3 ${purpleGradient}`}
                    >
                      <MdPlayCircle className="text-xl text-white sm:text-3xl" />
                    </div>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex min-w-0 flex-1 flex-col justify-center p-2.5 sm:p-1">
                <div className="mb-1 flex items-start justify-between gap-1.5">
                  <h3 className="truncate text-sm font-bold text-white sm:text-xs">
                    {game.game_name}
                  </h3>

                  {/* <div className="flex flex-shrink-0 items-center gap-0.5">
                    <MdStar className="text-xs text-[#F1C40F] sm:text-sm" />

                    <span className="text-[10px] font-bold text-white sm:text-sm">
                      {game.rating}
                    </span>
                  </div> */}
                </div>

                <div className="flex items-center gap-2 text-[9px] text-gray-500 sm:gap-4 sm:text-xs">
                  <span className="flex items-center gap-0.5">
                    <MdGamepad className="text-[10px] sm:text-xs" />
                    {game.players}
                  </span>

                  {/* <span className="flex items-center gap-0.5 text-[#B45CFF]">
                    <FaFire className="text-[9px] sm:text-xs" />
                    {game.volatility}
                  </span> */}
                </div>
              </div>
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

export default AllGames;
