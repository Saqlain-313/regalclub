import { useEffect, useState } from "react";
import { FaCrown, FaFire, FaSpinner } from "react-icons/fa";
import { GiChicken } from "react-icons/gi";
import {
  MdGamepad,
  MdInfoOutline,
  MdPlayCircle,
  MdStar,
  MdWarning,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import GamePlayModal from "../../components/GamePlayModal";
import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const ChickenGames = () => {
  const dispatch = useDispatch();

  /* =======================
     REDUX STATE
  ======================= */
  const { gameUrl, launchLoading, launchError } = useSelector(
    (state) => state.game,
  );

  const { user } = useSelector((state) => state.auth);

  /* =======================
     LOCAL STATE
  ======================= */
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const MIN_CREDIT_TO_PLAY = 10;
  const hasDeposited = true;
  const credit = Number(user?.credit || 0);
  const needsRecharge = !hasDeposited || credit < MIN_CREDIT_TO_PLAY;

  /* =======================
     GAMES DATA
  ======================= */
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

  /* =======================
     RESET ON LOAD
  ======================= */
  useEffect(() => {
    dispatch(resetGameState());
  }, [dispatch]);

  /* =======================
     AUTO OPEN MODAL
  ======================= */
  useEffect(() => {
    if (gameUrl) setIsGameModalOpen(true);
  }, [gameUrl]);

  /* =======================
     PLAY HANDLER
  ======================= */
  const handlePlay = async (game) => {
    // Block game launch if user has no deposit or insufficient credit
    if (needsRecharge) {
      setSelectedGame(game);
      setShowRechargeModal(true);
      return;
    }

    try {
      setSelectedGame(game);
      await dispatch(launchGame({ gameId: game.game_uid })).unwrap();
    } catch (err) {
      alert("Failed to launch game");
    }
  };

  /* =======================
     CLOSE MODAL
  ======================= */
  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);
    dispatch(clearGameUrl());
  };

  /* =======================
     UI
  ======================= */
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4 py-6">
        {/* HEADER */}
        <div className=" mx-auto mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl">
              <GiChicken className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white">Chicken Games</h1>
          </div>
          <p className="text-gray-400">
            Fast-paced racing action with the craziest chickens!
          </p>
        </div>

        {/* GAMES GRID */}
        <div className=" mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {chickenGames.map((game) => (
            <div
              key={game.game_uid}
              onClick={() => handlePlay(game)}
              className="group cursor-pointer bg-gradient-to-br from-gray-800/60 to-gray-900/60
                         rounded-2xl overflow-hidden border border-gray-700/50
                         hover:border-orange-500/50 transition-all duration-300"
            >
              {/* IMAGE */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={game.icon}
                  alt={game.game_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* BADGES */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {game.is_featured && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-xs font-bold text-white">
                      <FaCrown /> FEATURED
                    </span>
                  )}
                  {game.is_new && (
                    <span className="px-2 py-1 bg-green-500 rounded-full text-xs font-bold text-white">
                      NEW
                    </span>
                  )}
                </div>

                {/* PLAY OVERLAY */}
                <div
                  className="absolute inset-0 flex items-center justify-center
                             bg-black/40 opacity-100 sm:opacity-0
                             sm:group-hover:opacity-100 transition"
                >
                  {launchLoading && selectedGame?.game_uid === game.game_uid ? (
                    <FaSpinner className="animate-spin text-4xl text-white" />
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full">
                      <MdPlayCircle className="text-4xl text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-bold text-lg truncate">
                    {game.game_name}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <MdStar />
                    <span className="text-white font-bold">{game.rating}</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2">
                  {game.description}
                </p>

                <div className="mt-4 flex justify-between text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <MdGamepad />
                    {game.players}
                  </div>
                  <div className="flex items-center gap-1 text-orange-400">
                    <FaFire />
                    {game.volatility}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-auto pt-4 flex justify-between items-center text-sm">
                  <span className="text-orange-400 font-bold">
                    ${game.min_bet} - ${game.max_bet}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MdInfoOutline />
                    {game.provider}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECHARGE REQUIRED MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-gray-900 border border-orange-500/40 rounded-2xl p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/15 border border-orange-500/40">
              <MdWarning className="text-4xl text-orange-400" />
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
                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRechargeModal(false);
                  window.location.href = "/deposit";
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-600 text-white font-bold hover:from-orange-600 hover:to-yellow-700 transition-all"
              >
                Recharge Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
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

export default ChickenGames;
