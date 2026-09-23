import { useEffect, useState } from "react";
import { FaCrown, FaSpinner } from "react-icons/fa";
import { GiMineExplosion } from "react-icons/gi";
import { MdPlayCircle, MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6">
        {/* HEADER */}
        <div className="mx-auto mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl">
              <GiMineExplosion className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Mines</h1>
          </div>
          <p className="text-gray-400">
            Strategic risk-taking with explosive rewards
          </p>
        </div>

        {/* GRID */}
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {minesGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handlePlay(game)}
              onMouseEnter={() => setHoveredId(game.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative cursor-pointer bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-300"
            >
              {/* IMAGE */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={game.icon}
                  alt={game.game_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* BADGES */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {game.is_featured && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full">
                      <FaCrown className="text-white text-xs" />
                      <span className="text-white text-xs font-bold">
                        FEATURED
                      </span>
                    </div>
                  )}
                  <div className="px-2 py-1 bg-gray-900/80 rounded-full border border-gray-700/50">
                    <span className="text-white text-xs font-bold">
                      {game.game_type}
                    </span>
                  </div>
                </div>

                {/* PLAY OVERLAY */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredId === game.id
                      ? "bg-black/70 opacity-100"
                      : "bg-black/40 opacity-100 sm:opacity-0"
                  }`}
                >
                  {launchLoading ? (
                    <FaSpinner className="animate-spin text-4xl text-white" />
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full">
                      <MdPlayCircle className="text-4xl text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* INFO */}
              <div className="p-5">
                <div className="flex justify-between mb-2">
                  <h3 className="text-white font-bold text-xl">
                    {game.game_name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <MdStar className="text-yellow-400" />
                    <span className="text-white font-bold">{game.rating}</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">{game.description}</p>
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
