import { useEffect, useState } from "react";
import { FaCrown, FaSpinner } from "react-icons/fa";
import { MdPlayCircle, MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import { GiMineExplosion } from "react-icons/gi";
import GamePlayModal from "../../components/GamePlayModal";
import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const Minesgame = () => {
  const dispatch = useDispatch();

  const { gameUrl, launchLoading, launchError } = useSelector(
    (state) => state.game,
  );

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // TopX Purple gradient
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
      description: "Fast-paced mines action with instant cash-out excitement.",
    },
  ];

  useEffect(() => {
    dispatch(resetGameState());
  }, [dispatch]);

  useEffect(() => {
    if (gameUrl) setIsGameModalOpen(true);
  }, [gameUrl]);

  const handlePlay = async (game) => {
    try {
      setSelectedGame(game);
      await dispatch(launchGame({ gameId: game.game_uid })).unwrap();
    } catch {
      alert("Failed to launch Mines");
    }
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);
    dispatch(clearGameUrl());
  };

  return (
    <>
      <div className="bg-[#0B0410] px-3 py-4 sm:px-6 sm:py-6">
        {/* HEADER — compact */}
        <div className="mx-auto mb-4 sm:mb-6 sm:hidden md:block">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-1">
            <div className={`p-2 sm:p-2.5 rounded-lg ${purpleGradient}`}>
              <GiMineExplosion className="text-white text-lg sm:text-xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Mines</h1>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            Strategic risk-taking with explosive rewards
          </p>
        </div>

        {/* GRID */}
        <div className="max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 sm:-mt-4">
          {minesGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handlePlay(game)}
              onMouseEnter={() => setHoveredId(game.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative cursor-pointer bg-[#1C0F2B] rounded-2xl overflow-hidden border border-[#2a1b3d] hover:border-[#B45CFF]/60 hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)] hover:scale-[1.02] transition-all duration-300 flex flex-row sm:flex-col"
            >
              {/* IMAGE — no aspect ratio, manual height */}
              <div className="relative w-32 sm:w-full h-32 sm:h-[9rem] overflow-hidden flex-shrink-0">
                <img
                  src={game.icon}
                  alt={game.game_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/40 to-transparent" />

                {/* BADGES */}
                <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1">
                  {game.is_featured && (
                    <div
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${purpleGradient}`}
                    >
                      <FaCrown className="text-white text-[8px] sm:text-[10px]" />
                      <span className="text-white text-[8px] sm:text-[10px] font-bold">
                        HOT
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:block px-1.5 py-0.5 bg-[#0B0410]/80 rounded-full border border-[#2a1b3d]">
                    <span className="text-white text-[10px] font-bold">
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
                    <FaSpinner className="animate-spin text-xl sm:text-3xl text-white" />
                  ) : (
                    <div
                      className={`p-1.5 sm:p-3 rounded-full ${purpleGradient}`}
                    >
                      <MdPlayCircle className="text-xl sm:text-3xl text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* INFO */}
              <div className="p-2.5 sm:p-4 flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start gap-1.5 mb-1">
                  <h3 className="text-white font-bold text-sm sm:text-lg truncate">
                    {game.game_name}
                  </h3>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <MdStar className="text-[#F1C40F] text-xs sm:text-sm" />
                    <span className="text-white font-bold text-[10px] sm:text-sm">
                      {game.rating}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-2 mb-1.5 sm:mb-3">
                  {game.description}
                </p>

                <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-xs text-gray-500">
                  <span className="flex items-center gap-0.5">
                    👥 {game.players}
                  </span>
                  <span className="flex items-center gap-0.5 text-[#B45CFF]">
                    🔥 {game.volatility}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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

export default Minesgame;
