import { useEffect, useState } from "react";
import { FaCrown, FaFire, FaSpinner } from "react-icons/fa";
import { GiChicken } from "react-icons/gi";
import { MdGamepad, MdPlayCircle, MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

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
    (state) => state.game,
  );

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

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

  useEffect(() => {
    if (!isHome) {
      dispatch(resetGameState());
    }
  }, [dispatch, isHome]);

  useEffect(() => {
    if (!isHome && gameUrl) setIsGameModalOpen(true);
  }, [gameUrl, isHome]);

  // ✅ AUTO LAUNCH
  useEffect(() => {
    if (!isHome && location.state?.autoLaunch && location.state?.gameUid) {
      const game = chickenGames.find(
        (g) => g.game_uid === location.state.gameUid,
      );
      if (game) {
        setSelectedGame(game);
        dispatch(launchGame({ gameId: game.game_uid }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, isHome]);

  const handlePlay = async (game) => {
    if (isHome) {
      navigate("/chicken", {
        state: {
          autoLaunch: true,
          gameUid: game.game_uid,
        },
      });
      return;
    }

    try {
      setSelectedGame(game);
      await dispatch(launchGame({ gameId: game.game_uid })).unwrap();
    } catch (err) {
      alert("Failed to launch game");
    }
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);
    dispatch(clearGameUrl());
  };

  return (
    <>
      <div className="bg-[#0B0410] px-3 py-4 sm:px-2 sm:py-6">
        <div className="mx-auto mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-1">
            <div className={`p-2 sm:p-2.5 rounded-lg ${purpleGradient}`}>
              <GiChicken className="text-white text-lg sm:text-xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Recomended Games
            </h1>
          </div>
          <p className="text-gray-400 text-xs sm:hidden md:block">
            Fast-paced racing action with the craziest chickens!
          </p>
        </div>

        <div className="max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 sm:-mt-4">
          {chickenGames.map((game) => (
            <div
              key={game.game_uid}
              onClick={() => handlePlay(game)}
              className="group cursor-pointer bg-[#1C0F2B]
                         rounded-2xl overflow-hidden border border-[#2a1b3d]
                         hover:border-[#B45CFF]/60 hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)]
                         hover:scale-[1.02]
                         transition-all duration-300 flex flex-row sm:flex-col"
            >
              <div className="relative w-32 sm:w-full h-32 sm:h-[9rem] overflow-hidden flex-shrink-0">
                <img
                  src={game.icon}
                  alt={game.game_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/40 to-transparent" />

                <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1">
                  {game.is_featured && (
                    <span
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold text-white ${purpleGradient}`}
                    >
                      <FaCrown className="text-[7px] sm:text-[9px]" /> HOT
                    </span>
                  )}
                  {game.is_new && (
                    <span className="px-1.5 py-0.5 bg-[#00E676] rounded-full text-[8px] sm:text-[10px] font-bold text-[#0B0410]">
                      NEW
                    </span>
                  )}
                </div>

                <div
                  className="absolute inset-0 flex items-center justify-center
                             bg-black/30 opacity-100 sm:bg-black/40 sm:opacity-0
                             sm:group-hover:opacity-100 transition"
                >
                  {launchLoading && selectedGame?.game_uid === game.game_uid ? (
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

                {/* <p className="text-gray-400 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-2 mb-1.5 sm:mb-3">
                  {game.description}
                </p> */}

                <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-xs text-gray-500">
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
