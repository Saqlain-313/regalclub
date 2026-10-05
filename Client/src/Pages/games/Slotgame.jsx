import { useEffect, useMemo, useRef, useState } from "react";
import { FaSpinner, FaArrowLeft, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdPlayCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";

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

  const { gamesByGameType, loading, gameUrl, launchLoading, launchError } =
    useSelector((state) => state.game);

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hasRequestedGames, setHasRequestedGames] = useState(false);

  /* Search + pagination (view-all page — Casino & Live Games style) */
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(24);

  // Prevent duplicate auto launch
  const autoLaunchStarted = useRef(false);

  // Double-click guard — no new dispatch while a launch is in progress
  const launchingRef = useRef(false);

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
      }),
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
   * SEARCH + PAGINATION (view-all page — Casino style)
   * ============================================================
   */
  const filteredGames = useMemo(() => {
    if (!searchTerm.trim()) return sourceGames;

    return sourceGames.filter((game) =>
      game.game_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, sourceGames]);

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  /*
   * ============================================================
   * DISPLAY GAMES
   * Home section shows 12; the /slots view-all page shows
   * paginated games from the API (game_type: "Slot Game")
   * ============================================================
   */
  const displayGames = useMemo(() => {
    return isHome ? sourceGames.slice(0, 12) : currentGames;
  }, [sourceGames, isHome, currentGames]);

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

    const game = sourceGames.find((g) => g.game_uid === location.state.gameUid);

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
  }, [dispatch, isHome, location.state, sourceGames]);

  /*
   * ============================================================
   * OPEN GAME MODAL WHEN GAME URL ARRIVES
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
   * Platform recommendation style — launch directly on home,
   * no navigation needed.
   */
  const handlePlay = async (game) => {
    if (launchingRef.current) return;
    launchingRef.current = true;

    try {
      setSelectedGame(game);

      await dispatch(
        launchGame({
          gameId: game.game_uid,
        }),
      ).unwrap();
    } catch {
      // No alert/error popup on launch failure —
      // the modal stays in its loading state and the user can go back
    } finally {
      launchingRef.current = false;
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
    hasRequestedGames && loading && displayGames.length === 0;

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
   * Opening /slots directly will never show this loader.
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
      <div className="bg-[#0B0410] px-4 py-6 sm:px-3">
        {/* HEADER */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back button — only on the /slots view-all page (Casino style) */}
              {!isHome && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-bold transition-colors bg-[#1C0F2B] border border-[#2a1b3d] hover:bg-[#2a1b3d] hover:border-[#9B59B6]/50 px-4 py-2 rounded-xl flex-shrink-0"
                >
                  <FaArrowLeft /> Back
                </button>
              )}
              {/* Rounded bar icon — Platform recommendation style */}
              <span className="w-2 h-6 rounded-full bg-gradient-to-b from-[#B45CFF] to-[#7418F5] flex-shrink-0" />
              <h2 className="text-lg font-extrabold tracking-tight text-white sm:text-xl leading-tight">
                Slot Games
              </h2>
            </div>
            {/* View All — only on the home section, same size as the
                Casino & Live Games page view-all */}
            {isHome && (
              <Link
                to="/slots"
                className="flex items-center gap-1 text-xs font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-xl hover:bg-[#2a1b3d] hover:text-white transition-all flex-shrink-0"
              >
                View all
                <span className="text-lg">›</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search bar — below the heading, view-all page only */}
        {!isHome && (
          <div className="relative w-full md:w-80 mb-4">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search slot games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#12061C] border border-[#2a1b3d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/20 transition-all"
            />
          </div>
        )}

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
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3  ">
                {displayGames.map((game, index) => {
                  // Home preview hides games 7+ on mobile;
                  // the /slots view-all page shows everything (Casino style)
                  const hideOnMobile = isHome && index >= 6;

                  return (
                    <div
                      key={game.game_uid || game.id || index}
                      onClick={() => handlePlay(game)}
                      className={`group relative
    w-full
    aspect-[3/4]
    cursor-pointer
    overflow-hidden
    rounded-2xl
    border border-[#2a1b3d]
    bg-[#1C0F2B]
    shadow-[0_4px_12px_rgba(0,0,0,0.5)]
    transition-all duration-300
    hover:border-[#B45CFF]/60
    hover:shadow-[0_8px_20px_rgba(155,89,182,0.3)]
    ${hideOnMobile ? "hidden md:block" : ""}`}
                    >
                      {/* IMAGE */}
                      <img
                        src={game.img || game.icon}
                        alt={game.game_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* PLAY OVERLAY */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#0B0410] via-[#0B0410]/60 to-transparent transition-opacity duration-300 ${
                          launchLoading &&
                          selectedGame?.game_uid === game.game_uid
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
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
                        {/* <h3 className="truncate text-sm font-semibold text-white">
                          {game.game_name}
                        </h3> */}

                        <div className="mt-1 flex items-center justify-between">
                          {/* <span className="rounded border border-[#2a1b3d] bg-[#12061C]/80 px-2 py-1 text-xs text-gray-300">
                            {game.provider || "Slots"}
                          </span> */}

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
                    {searchTerm
                      ? `No results for "${searchTerm}"`
                      : "No games found"}
                  </h3>

                  <p className="text-gray-400">
                    {searchTerm
                      ? "Try a different game name"
                      : "No games available"}
                  </p>
                </div>
              )}

              {/* PAGINATION — view-all page only (Casino style) */}
              {!isHome && filteredGames.length > gamesPerPage && (
                <div className="mt-10">
                  <div className="hidden sm:flex flex-col md:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 bg-[#12061C] border border-[#2a1b3d] rounded-lg hover:bg-[#2a1b3d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <FaChevronLeft className="text-xs" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {renderPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? `${purpleGradient} text-white`
                              : "bg-[#12061C] text-gray-300 border border-[#2a1b3d] hover:bg-[#2a1b3d] hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 bg-[#12061C] border border-[#2a1b3d] rounded-lg hover:bg-[#2a1b3d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>

                  <div className="sm:hidden flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-[#12061C] border border-[#2a1b3d] rounded-lg hover:bg-[#2a1b3d] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft /> Prev
                    </button>

                    <span className="text-white font-medium">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-[#12061C] border border-[#2a1b3d] rounded-lg hover:bg-[#2a1b3d] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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

export default Slotgame;
