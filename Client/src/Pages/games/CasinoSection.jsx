import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import { MdPlayCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { liveCasino } from "../../Data/GamesData";
import GamePlayModal from "../../components/GamePlayModal";

import {
  clearGameUrl,
  getGamesByGameType,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const CasinoGames = ({
  limit,
  showViewAll = false,
  showSearch = true,
  isHome = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { gamesByGameType, loading, gameUrl, launchLoading, launchError } =
    useSelector((state) => state.game);

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(24);

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
   * GET CASINO GAMES
   * ============================================================
   */
  useEffect(() => {
    dispatch(
      getGamesByGameType({
        page: 1,
        limit: 1000,
        game_type: "CasinoLive",
      }),
    );
  }, [dispatch]);

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
   * SOURCE GAMES
   * ============================================================
   */
  const sourceGames = useMemo(() => {
    if (Array.isArray(gamesByGameType) && gamesByGameType.length > 0) {
      return gamesByGameType;
    }

    return liveCasino;
  }, [gamesByGameType]);

  /*
   * ============================================================
   * AUTO LAUNCH FROM HOME
   * ============================================================
   *
   * Home
   *   ↓
   * Casino game click
   *   ↓
   * /casino
   *   ↓
   * autoLaunch: true
   *   ↓
   * games loaded
   *   ↓
   * find selected game
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
   * FILTER GAMES
   * ============================================================
   */
  const filteredGames = useMemo(() => {
    const limitedGames = limit ? sourceGames.slice(0, limit) : sourceGames;

    if (!searchTerm.trim()) {
      return limitedGames;
    }

    return limitedGames.filter((game) =>
      game.game_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, sourceGames, limit]);

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;

  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /*
   * ============================================================
   * PLAY GAME
   * ============================================================
   */
  const handlePlay = async (game) => {
    /*
     * HOME → CASINO
     */
    if (isHome) {
      navigate("/casino", {
        state: {
          autoLaunch: true,
          gameUid: game.game_uid,
        },
      });

      return;
    }

    /*
     * NORMAL CASINO PAGE
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
   * PAGE NAVIGATION
   * ============================================================
   */
  const goToPage = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ============================================================
   * PAGE NUMBERS
   * ============================================================
   */
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) {
        pageNumbers.push(1);

        if (start > 2) {
          pageNumbers.push("...");
        }
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pageNumbers.push("...");
        }

        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  /*
   * ============================================================
   * HOME → CASINO AUTO LAUNCH LOADER
   * ============================================================
   *
   * ONLY when:
   *
   * 1. Not Home
   * 2. autoLaunch = true
   * 3. gameUid exists
   * 4. gameUrl not received
   *
   * Direct /casino open:
   * NO auto-launch loader
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
            {/* CASINO ICON */}
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
              Loading Casino Game...
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
          MAIN CASINO PAGE
          ======================================================== */}
      <div className="bg-[#0B0410] p-4 md:p-6">
        {/* API LOADING */}
        {loading && (
          <div className="flex h-96 items-center justify-center">
            <FaSpinner className="animate-spin text-4xl text-[#B45CFF]" />
          </div>
        )}

        <div className="mx-auto">
          {/* ====================================================
              DESKTOP / FULL CASINO HEADER
              ==================================================== */}
          {!isHome && (
            <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex w-full items-center gap-4 md:w-auto">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] px-4 py-2 text-sm font-bold text-gray-300 transition-colors hover:border-[#9B59B6]/50 hover:bg-[#2a1b3d] hover:text-white"
                >
                  <FaArrowLeft />
                  Back
                </button>

                <h1 className="text-lg font-bold text-white md:text-xl">
                  Live Casino Games
                </h1>

                {showViewAll && (
                  <Link
                    to="/casino"
                    className="ml-auto flex items-center gap-1 rounded-lg border border-[#2a1b3d] bg-[#1C0F2B] px-3 py-1.5 text-sm font-bold text-gray-300 transition-all hover:bg-[#2a1b3d] hover:text-white md:ml-2"
                  >
                    View all
                    <span className="text-lg">›</span>
                  </Link>
                )}
              </div>

              {showSearch && (
                <div className="relative w-full md:w-80">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-500" />

                  <input
                    type="text"
                    placeholder="Search live casino games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-[#2a1b3d] bg-[#12061C] py-3 pl-12 pr-4 text-white placeholder-gray-500 transition-all focus:border-[#B45CFF]/60 focus:outline-none focus:ring-2 focus:ring-[#B45CFF]/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              HOME HEADER
              ==================================================== */}
          {isHome && (
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[22px]">🎰</span>

                <h2 className="text-[20px] font-extrabold tracking-tight text-white sm:text-[24px]">
                  Casino & Live Games
                </h2>
              </div>

              {showViewAll && (
                <Link
                  to="/casino"
                  className="flex items-center gap-1 rounded-lg border border-[#2a1b3d] bg-[#1C0F2B] px-3 py-1.5 text-sm font-bold text-gray-300 transition-all hover:bg-[#2a1b3d] hover:text-white"
                >
                  View all
                  <span className="text-lg">›</span>
                </Link>
              )}
            </div>
          )}

          {/* ====================================================
              GAMES GRID
              ==================================================== */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {currentGames.map((game) => (
              <div
                key={game.game_uid || game.id}
                onClick={() => handlePlay(game)}
                className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#B45CFF]/60 hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)]"
              >
                {/* IMAGE */}
                <img
                  src={game.img || game.icon}
                  alt={game.game_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* PLAY OVERLAY */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#0B0410] via-[#0B0410]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {launchLoading && selectedGame?.game_uid === game.game_uid ? (
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
                      {game.provider || "BF Gaming"}
                    </span>

                    <span className="text-xs font-medium text-[#F1C40F]">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ====================================================
              NO GAMES
              ==================================================== */}
          {currentGames.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-[#2a1b3d] bg-[#1C0F2B] py-16 text-center">
              <FaSearch className="mx-auto mb-4 text-4xl text-gray-500" />

              <h3 className="mb-2 text-lg font-semibold text-white">
                {loading ? "Loading games..." : "No games found"}
              </h3>

              <p className="text-gray-400">
                {loading
                  ? "Please wait while we fetch live casino games"
                  : searchTerm
                    ? `No results for "${searchTerm}"`
                    : "No games available"}
              </p>
            </div>
          )}

          {/* ====================================================
              PAGINATION
              ==================================================== */}
          {!isHome && showSearch && filteredGames.length > gamesPerPage && (
            <div className="mt-10">
              <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                {/* DESKTOP PAGINATION */}
                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 rounded-lg border border-[#2a1b3d] bg-[#12061C] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-[#2a1b3d] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaChevronLeft className="text-xs" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {renderPageNumbers().map((pageNum, index) =>
                      pageNum === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-2 text-gray-500"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? `${purpleGradient} text-white`
                              : "border border-[#2a1b3d] bg-[#12061C] text-gray-300 hover:bg-[#2a1b3d] hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 rounded-lg border border-[#2a1b3d] bg-[#12061C] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-[#2a1b3d] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>

                {/* MOBILE PAGINATION */}
                <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 rounded-lg border border-[#2a1b3d] bg-[#12061C] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#2a1b3d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaChevronLeft />
                    Prev
                  </button>

                  <span className="font-medium text-white">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 rounded-lg border border-[#2a1b3d] bg-[#12061C] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#2a1b3d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
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
          selectedGame={selectedGame}
          gameUrl={gameUrl}
          loading={launchLoading}
          launchError={launchError}
        />
      )}
    </>
  );
};

export default CasinoGames;
