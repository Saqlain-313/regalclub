import { useEffect, useRef, useState } from "react";
import { FaCrown, FaFire, FaSpinner } from "react-icons/fa";
import { GiChicken } from "react-icons/gi";
import { MdGamepad, MdPlayCircle, MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import GamePlayModal from "../../components/GamePlayModal";

import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const ChickenGames = ({ isHome = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { gameUrl, launchLoading, launchError } = useSelector(
    (state) => state.game
  );

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // Prevent duplicate auto launch
  const autoLaunchStarted = useRef(false);

  const chickenGames = [
    {
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
      description:
        "The ultimate chicken racing experience with enhanced graphics and new obstacles",
    },
    {
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
      description: "Classic chicken racing game with fast-paced action",
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
   * Chicken click
   *   ↓
   * /chicken
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

    const game = chickenGames.find(
      (g) => g.game_uid === location.state.gameUid
    );

    if (!game) {
      return;
    }

    autoLaunchStarted.current = true;

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
   * PLAY GAME
   * ============================================================
   */
  const handlePlay = async (game) => {
    /*
     * HOME -> CHICKEN
     */
    if (isHome) {
      navigate("/chicken", {
        state: {
          autoLaunch: true,
          gameUid: game.game_uid,
        },
      });

      return;
    }

    /*
     * NORMAL CHICKEN PAGE
     */
    try {
      setSelectedGame(game);

      await dispatch(
        launchGame({
          gameId: game.game_uid,
        })
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
   * Home -> /chicken
   * +
   * autoLaunch true
   * +
   * gameUrl not received
   *
   * Direct /chicken open = NO LOADER
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
            {/* CHICKEN ICON */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 animate-ping rounded-full bg-[#B45CFF]/20" />

              <div
                className={`relative flex h-20 w-20 items-center justify-center rounded-full ${purpleGradient}`}
              >
                <GiChicken className="text-4xl text-white" />
              </div>
            </div>

            {/* TITLE */}
            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">
              Loading Chicken Game...
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
          CHICKEN GAMES
          ======================================================== */}
      <div className="bg-[#0B0410] px-3 py-4 sm:px-6 sm:py-6">
        {/* HEADER */}
        <div className="mx-auto mb-4 sm:mb-6">
          <div className="mb-1 flex items-center gap-2 sm:gap-2.5">
            <div className={`rounded-lg p-2 sm:p-2.5 ${purpleGradient}`}>
              <GiChicken className="text-lg text-white sm:text-xl" />
            </div>

            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Recomended Games
            </h1>
          </div>

          <p className="text-xs text-gray-400 sm:text-sm">
            Fast-paced racing action with the craziest chickens!
          </p>
        </div>

        {/* GRID */}
        <div className="max-w-6xl grid grid-cols-1 gap-3 sm:grid-cols-2 sm:-mt-4 sm:gap-5 lg:grid-cols-3">
          {chickenGames.map((game) => (
            <div
              key={game.game_uid}
              onClick={() => handlePlay(game)}
              className="group flex cursor-pointer flex-row overflow-hidden rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] transition-all duration-300 hover:scale-[1.02] hover:border-[#B45CFF]/60 hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)] sm:flex-col"
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 transition sm:bg-black/40 sm:opacity-0 sm:group-hover:opacity-100">
                  {launchLoading &&
                  selectedGame?.game_uid === game.game_uid ? (
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
                </p>

                <div className="flex items-center gap-2 text-[9px] text-gray-500 sm:gap-4 sm:text-xs">
                  <span className="flex items-center gap-0.5">
                    <MdGamepad className="text-[10px] sm:text-xs" />
                    {game.players}
                  </span>

                  <span className="flex items-center gap-0.5 text-[#B45CFF]">
                    <FaFire className="text-[9px] sm:text-xs" />
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

export default ChickenGames;