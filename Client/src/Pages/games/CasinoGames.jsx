import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import { MdPlayCircle, MdWarning } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

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
  const { gamesByGameType, loading } = useSelector((state) => state.game);
  const { gameUrl, launchLoading, launchError } = useSelector(
    (state) => state.game,
  );
  const { user } = useSelector((state) => state.auth);

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(24);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const MIN_CREDIT_TO_PLAY = 0;
  const hasDeposited = true;
  const credit = Number(user?.credit || 0);
  const needsRecharge = !hasDeposited || credit < MIN_CREDIT_TO_PLAY;

  // ✅ Sirf tab reset karein jab Home page par na ho
  useEffect(() => {
    if (!isHome) {
      dispatch(resetGameState());
    }
  }, [dispatch, isHome]);

  useEffect(() => {
    dispatch(
      getGamesByGameType({ page: 1, limit: 1000, game_type: "CasinoLive" }),
    );
  }, [dispatch]);

  // ✅ Sirf tab modal open karein jab Home page par na ho
  useEffect(() => {
    if (!isHome && gameUrl) {
      setIsGameModalOpen(true);
    }
  }, [gameUrl, isHome]);

  const filteredGames = useMemo(() => {
    const sourceGames =
      Array.isArray(gamesByGameType) && gamesByGameType.length > 0
        ? gamesByGameType
        : liveCasino;

    const limitedGames = limit ? sourceGames.slice(0, limit) : sourceGames;

    if (!searchTerm.trim()) return limitedGames;

    return limitedGames.filter((game) =>
      game.game_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, gamesByGameType, limit]);

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePlay = async (game) => {
    if (needsRecharge) {
      setSelectedGame(game);
      setShowRechargeModal(true);
      return;
    }

    try {
      setSelectedGame(game);
      await dispatch(launchGame({ gameId: game.game_uid })).unwrap();
    } catch (err) {
      alert(err || "Failed to launch game");
    }
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);
    dispatch(clearGameUrl());
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        if (start > 2) pageNumbers.push("...");
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <>
      <div className="bg-[#0B0410] p-4 md:p-6">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <FaSpinner className="animate-spin text-4xl text-[#B45CFF]" />
          </div>
        )}
        <div className="mx-auto">
          {!isHome && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-bold transition-colors bg-[#1C0F2B] border border-[#2a1b3d] hover:bg-[#2a1b3d] hover:border-[#9B59B6]/50 px-4 py-2 rounded-xl"
                >
                  <FaArrowLeft /> Back
                </button>

                <h1 className="text-lg md:text-xl font-bold text-white">
                  Live Casino Games
                </h1>

                {showViewAll && (
                  <Link
                    to="/casino"
                    className="flex items-center gap-1 text-sm font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition-all ml-auto md:ml-2"
                  >
                    View all
                    <span className="text-lg">›</span>
                  </Link>
                )}
              </div>

              {showSearch && (
                <div className="relative w-full md:w-80">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search live casino games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#12061C] border border-[#2a1b3d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/20 transition-all"
                  />
                </div>
              )}
            </div>
          )}

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
                  className="flex items-center gap-1 text-sm font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition-all"
                >
                  View all
                  <span className="text-lg">›</span>
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {currentGames.map((game) => (
              <div
                key={game.game_uid || game.id}
                onClick={() => handlePlay(game)}
                className="relative cursor-pointer rounded-xl overflow-hidden aspect-[3/4] bg-[#1C0F2B] group shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)] transition-all duration-300 border border-[#2a1b3d] hover:border-[#B45CFF]/60"
              >
                <img
                  src={game.img || game.icon}
                  alt={game.game_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/60 to-transparent 
                            opacity-0 group-hover:opacity-100 flex items-center 
                            justify-center transition-opacity duration-300"
                >
                  {launchLoading && selectedGame?.game_uid === game.game_uid ? (
                    <FaSpinner className="animate-spin text-3xl text-white" />
                  ) : (
                    <MdPlayCircle className="text-4xl md:text-5xl text-white opacity-90 group-hover:scale-110 transition-transform" />
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0B0410] to-transparent">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {game.game_name}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-300 bg-[#12061C]/80 border border-[#2a1b3d] px-2 py-1 rounded">
                      {game.provider || "BF Gaming"}
                    </span>
                    <span className="text-xs text-[#F1C40F] font-medium">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentGames.length === 0 && (
            <div className="text-center py-16 bg-[#1C0F2B] rounded-2xl border border-dashed border-[#2a1b3d] mt-10">
              <FaSearch className="text-4xl text-gray-500 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">
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

          {!isHome && showSearch && filteredGames.length > gamesPerPage && (
            <div className="mt-10">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 bg-[#12061C] border border-[#2a1b3d] rounded-lg hover:bg-[#2a1b3d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? `${purpleGradient} text-white`
                              : "bg-[#12061C] text-gray-300 border border-[#2a1b3d] hover:bg-[#2a1b3d] hover:text-white"
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
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 bg-[#12061C] border border-[#2a1b3d] rounded-lg hover:bg-[#2a1b3d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>

              <div className="md:hidden flex items-center justify-center gap-4 mt-6">
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
        </div>
      </div>

      {showRechargeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#1C0F2B] border border-[#9B59B6]/40 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.7)] text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/40">
              <MdWarning className="text-4xl text-[#C77AFF]" />
            </div>
            <div className="text-xl font-bold text-white mb-2">
              Recharge Required
            </div>
            <p className="text-sm text-gray-300 mb-2">
              {!hasDeposited
                ? "You need to make at least one deposit before you can play."
                : `You need a minimum credit of ₹${MIN_CREDIT_TO_PLAY} to play this game.`}
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Current credit: ₹{credit.toLocaleString()}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#12061C] border border-[#2a1b3d] text-gray-300 hover:bg-[#2a1b3d] hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRechargeModal(false);
                  navigate("/deposit");
                }}
                className={`flex-1 px-4 py-3 rounded-xl ${purpleGradient} text-white font-bold transition-all active:scale-[0.98]`}
              >
                Recharge Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ GAME MODAL — sirf tab render karein jab Home page par na ho */}
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