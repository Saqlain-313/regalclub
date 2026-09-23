import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdPlayCircle } from "react-icons/md";
import { FaSearch, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import {
  OriginalsGames,
  liveCasino,
  Sexy,
  Exclusivegame,
  Hotgame,
  Toppicker,
  GameShowdata,
  TableGames,
  SlotsGames,
  BingoGames,
} from "../../Data/GamesData";

import {
  getAllGames,
  launchGame,
  checkGamecredit,
  resetGameState,
  clearGameUrl,
} from "../../reducer/gameSlice";
import GamePlayModal from "../../components/GamePlayModal";

const Gamesections = () => {
  const { gameKey } = useParams(); // Changed from providerId to gameKey
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allGamesdata, launchLoading, gameUrl, launchError } = useSelector(
    (state) => state.game,
  );
  const { userInfo } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const gamesPerPage = 20;

  // Fetch all games
  useEffect(() => {
    dispatch(getAllGames());
    dispatch(checkGamecredit());
    dispatch(resetGameState());
  }, [dispatch]);

  // Auto open modal when gameUrl is available
  useEffect(() => {
    if (gameUrl) {
      setIsGameModalOpen(true);
    }
  }, [gameUrl]);

  /* ===========================
     GAME CATEGORIES BY KEY
  =========================== */
  const gamesByCategory = {
    liveCasino, // Key: "liveCasino"
    slots: SlotsGames, // Key: "slots" (to match your route path)
    OriginalsGames,
    Sexy,
    Exclusivegame,
    Hotgame,
    Toppicker,
    GameShowdata,
    TableGames,
    BingoGames,
  };

  const staticAllGames = useMemo(
    () => [
      ...OriginalsGames,
      ...liveCasino,
      ...Sexy,
      ...Exclusivegame,
      ...Hotgame,
      ...Toppicker,
      ...GameShowdata,
      ...TableGames,
      ...SlotsGames,
      ...BingoGames,
    ],
    [],
  );

  // Map URL keys to display names
  const categoryNames = {
    liveCasino: "Live Casino",
    slots: "Slot Games", // Updated to match route
    OriginalsGames: "Originals",
    Sexy: "Sexy Games",
    Exclusivegame: "Exclusive Games",
    Hotgame: "Hot Games",
    Toppicker: "Top Picker",
    GameShowdata: "Game Shows",
    TableGames: "Table Games",
    SlotsGames: "Slot Games",
    BingoGames: "Bingo Games",
  };

  const apiGames = allGamesdata?.data || [];
  const allGames = apiGames.length > 0 ? apiGames : staticAllGames;

  // Get games based on category key
  const baseGames =
    gameKey && gamesByCategory[gameKey] ? gamesByCategory[gameKey] : allGames;

  /* ===========================
     FILTER - BY CATEGORY KEY
  =========================== */
  const filteredGames = useMemo(() => {
    return baseGames.filter((game) => {
      // If specific category is selected
      if (gameKey && gamesByCategory[gameKey]) {
        // Filter by the games in that category
        const categoryGames = gamesByCategory[gameKey];
        return categoryGames.some(
          (catGame) =>
            catGame.game_uid === game.game_uid || catGame.id === game.id,
        );
      }

      // General search filter
      const matchesSearch = game.game_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [baseGames, gameKey, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [gameKey, searchTerm]);

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const currentGames = filteredGames.slice(
    (currentPage - 1) * gamesPerPage,
    currentPage * gamesPerPage,
  );

  /* ===========================
     GAME CLICK HANDLER
  =========================== */
  const handlePlayGame = async (game) => {
    if (!userInfo) {
      navigate("/login", {
        state: { redirectTo: `/games/${gameKey || ""}` },
      });
      return;
    }

    try {
      setSelectedGame(game);
      await dispatch(launchGame({ gameId: game.game_uid || game.id })).unwrap();
    } catch (err) {
      alert(err || "Failed to launch game");
    }
  };

  /* ===========================
     MODAL CLOSE HANDLER
  =========================== */
  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);
    dispatch(clearGameUrl());
  };

  /* ===========================
     UI - DARK THEME VERSION
  =========================== */
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-700 mb-8 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-bold transition-colors"
              >
                <FaArrowLeft /> Back
              </button>

              <h2 className="text-sm md:text-lg font-black uppercase tracking-wider text-red-500">
                {gameKey
                  ? `${categoryNames[gameKey] || gameKey.replace(/([A-Z])/g, " $1")}`
                  : "All Games"}
              </h2>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          {/* Game Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {currentGames.map((game) => (
              <div
                key={game.id || game.game_uid}
                onClick={() => handlePlayGame(game)}
                className="relative cursor-pointer rounded-2xl overflow-hidden aspect-[3/4] bg-gray-800 group shadow-2xl hover:shadow-red-500/20 transition-all duration-300 border border-gray-700 hover:border-red-500/50"
              >
                {/* Game Image */}
                <img
                  src={game.img || game.icon}
                  alt={game.game_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Hover Overlay with Play Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  {launchLoading &&
                  selectedGame?.game_uid === (game.game_uid || game.id) ? (
                    <FaSpinner className="animate-spin text-4xl text-white" />
                  ) : (
                    <MdPlayCircle className="text-5xl text-white opacity-90 group-hover:scale-110 transition-transform" />
                  )}
                </div>

                {/* Provider Tag */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                  {game.provider || "Live"}
                </div>

                {/* Game Name Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white font-bold text-sm truncate">
                    {game.game_name}
                  </h3>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-1">
                    {game.category || gameKey || "Live Casino"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentGames.length === 0 && (
            <div className="py-20 text-center bg-gray-900/50 rounded-2xl border border-dashed border-gray-700 mt-10">
              <p className="text-gray-400 font-medium text-lg">
                No games found matching your search.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try a different search term
              </p>
            </div>
          )}

          {/* Pagination - Dark Theme */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                {/* Previous Button */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-300 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  PREV
                </button>

                {/* Current Page */}
                <button className="w-12 h-12 rounded-xl text-sm font-bold bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20">
                  {currentPage}
                </button>

                {/* Next Page */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="w-12 h-12 rounded-xl text-sm font-bold bg-gray-800 text-gray-300 border border-gray-700 hover:border-red-500 hover:text-white transition-all"
                  >
                    {currentPage + 1}
                  </button>
                )}

                {/* Ellipsis */}
                {currentPage < totalPages - 1 && (
                  <span className="px-2 text-gray-500 text-sm font-bold">
                    ...
                  </span>
                )}

                {/* Last Page */}
                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-12 h-12 rounded-xl text-sm font-bold bg-gray-800 text-gray-300 border border-gray-700 hover:border-red-500 hover:text-white transition-all"
                  >
                    {totalPages}
                  </button>
                )}

                {/* Next Button */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-300 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  NEXT
                </button>
              </div>

              {/* Page Info */}
              <p className="text-gray-400 text-sm">
                Showing {currentGames.length} of {filteredGames.length} games
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Game Play Modal */}
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

export default Gamesections;
