import { useEffect, useMemo, useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { MdPlayCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { SlotsGames } from "../../Data/GamesData";
import GamePlayModal from "../../components/GamePlayModal";

import {
  clearGameUrl,
  getGamesByGameType,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const Slotgame = ({ isHome = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    gamesByGameType,
    loading,
    gameUrl,
    launchLoading,
    launchError,
  } = useSelector((state) => state.game);

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hasRequestedGames, setHasRequestedGames] = useState(false);

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
   * GET SLOT GAMES
   * ============================================================
   */
  useEffect(() => {
    dispatch(
      getGamesByGameType({
        page: 1,
        limit: 1000,
        game_type: "Slot Game",
      })
    );

    setHasRequestedGames(true);
  }, [dispatch]);

  /*
   * ============================================================
   * SOURCE GAMES
   * ============================================================
   */
  const sourceGames = useMemo(() => {
    const apiGames =
      Array.isArray(gamesByGameType) && gamesByGameType.length > 0
        ? gamesByGameType
        : null;

    if (apiGames) {
      return apiGames;
    }

    return SlotsGames;
  }, [gamesByGameType]);

  /*
   * ============================================================
   * DISPLAY GAMES
   * ============================================================
   */
  const displayGames = useMemo(() => {
    return sourceGames.slice(0, 12);
  }, [sourceGames]);

  /*
   * ============================================================
   * AUTO LAUNCH FROM HOME
   * ============================================================
   *
   * Home
   *   ↓
   * Slot click
   *   ↓
   * /slots
   *   ↓
   * autoLaunch:true
   *   ↓
   * find game from API
   *   ↓
   * launchGame()
   */
  useEffect(() => {
    if (
      isHome ||
      !location.state?.autoLaunch ||
      !location.state?.gameUid ||
      !sourceGames?.length ||
      autoLaunchStarted.current
    ) {
      return;
    }

    const game = sourceGames.find(
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
  }, [dispatch, isHome, location.state, sourceGames]);

  /*
   * ============================================================
   * OPEN GAME MODAL WHEN GAME URL ARRIVES
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
     * HOME
     * ↓
     * Navigate to slots
     * ↓
     * Auto launch there
     */
    if (isHome) {
      navigate("/slots", {
        state: {
          autoLaunch: true,
          gameUid: game.game_uid,
        },
      });

      return;
    }

    /*
     * NORMAL SLOT PAGE
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
   * GAMES LOADER
   * ============================================================
   */
  const showGamesLoader =
    hasRequestedGames &&
    loading &&
    displayGames.length === 0;

  /*
   * ============================================================
   * AUTO LAUNCH FULL SCREEN LOADER
   * ============================================================
   *
   * ONLY:
   *
   * Home -> Slots
   * + autoLaunch
   * + gameUrl not received
   *
   * Direct /slots open par ye loader nahi chalega.
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
            {/* SLOT ICON */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 animate-ping rounded-full bg-[#B45CFF]/20" />

              <div
                className={`relative flex h-20 w-20 items-center justify-center rounded-full ${purpleGradient}`}
              >
                <span className="text-4xl">🎰</span>
              </div>
            </div>

            {/* TITLE */}
            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">
              Loading Slot Game...
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
          SLOT GAMES PAGE
          ======================================================== */}
      <div className="bg-[#0B0410] px-4 py-5 sm:px-6">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[22px]">🎰</span>

            <h2 className="text-[20px] font-extrabold tracking-tight text-white sm:text-[24px]">
              Slot Games
            </h2>
          </div>
        </div>

        <div className="mx-auto">
          {/* API LOADER */}
          {showGamesLoader ? (
            <div className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-20 text-center">
              <FaSpinner className="mx-auto mb-4 animate-spin text-4xl text-[#B45CFF]" />

              <h3 className="mb-2 text-lg font-semibold text-white">
                Loading slot games...
              </h3>

              <p className="text-sm text-gray-400">
                Please wait while we fetch latest games
              </p>
            </div>
          ) : (
            <>
              {/* GAME GRID */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
                {displayGames.map((game, index) => {
                  const hideOnMobile = index >= 6;

                  return (
                    <div
                      key={game.game_uid || game.id || index}
                      onClick={() => handlePlay(game)}
                      className={`group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#B45CFF]/60 hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)] ${
                        hideOnMobile ? "hidden md:block" : ""
                      }`}
                    >
                      {/* IMAGE */}
                      <img
                        src={game.img || game.icon}
                        alt={game.game_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* PLAY OVERLAY */}
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#0B0410] via-[#0B0410]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      >
                        {launchLoading &&
                        selectedGame?.game_uid === game.game_uid ? (
                          <FaSpinner className="animate-spin text-3xl text-white" />
                        ) : (
                          <MdPlayCircle className="text-4xl text-white opacity-90 transition-transform group-hover:scale-110 md:text-5xl" />
                        )}
                      </div>

                      {/* GAME INFO */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0410] to-transparent p-3">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {game.game_name}
                        </h3>

                        <div className="mt-1 flex items-center justify-between">
                          <span className="rounded border border-[#2a1b3d] bg-[#12061C]/80 px-2 py-1 text-xs text-gray-300">
                            {game.provider || "Slots"}
                          </span>

                          <span className="text-xs font-medium text-[#F1C40F]">
                            Live
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* NO GAMES */}
              {displayGames.length === 0 && (
                <div className="mt-10 rounded-2xl border border-dashed border-[#2a1b3d] bg-[#1C0F2B] py-16 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    No games found
                  </h3>

                  <p className="text-gray-400">
                    No games available
                  </p>
                </div>
              )}
            </>
          )}
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

export default Slotgame;