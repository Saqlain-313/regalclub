import { useEffect, useState } from "react";
import { FaCrown, FaFire, FaSpinner } from "react-icons/fa";
import { MdGamepad, MdPlayCircle, MdStar, MdWarning } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // ✅ ADD
import { GiAirplane } from "react-icons/gi";
import GamePlayModal from "../../components/GamePlayModal";
import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const AviatorGames = ({ isHome = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ ADD

  const { gameUrl, launchLoading, launchError } = useSelector(
    (state) => state.game,
  );

  const { user } = useSelector((state) => state.auth);

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const MIN_CREDIT_TO_PLAY = 0;
  const hasDeposited = true;
  const credit = Number(user?.credit || 0);
  const needsRecharge = !hasDeposited || credit < MIN_CREDIT_TO_PLAY;

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const aviatorGame = {
    game_name: "Aviator",
    game_uid: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
    game_type: "Casino Table",
    provider: "SPB",
    icon: "http://files.worldcasinoonline.com/Document/Game/Aviator_1697879631441.088.png",
    rating: 4.9,
    players: "5.6K",
    volatility: "High",
    min_bet: 10,
    max_bet: 10000,
    is_featured: true,
    is_new: false,
    description:
      "The legendary crash game where timing is everything. Cash out before the plane flies away!",
  };

  useEffect(() => {
    if (!isHome) {
      dispatch(resetGameState());
    }
  }, [dispatch, isHome]);

  useEffect(() => {
    if (!isHome && gameUrl) setIsGameModalOpen(true);
  }, [gameUrl, isHome]);

  const handlePlay = async () => {
    // ✅ Home page par click → apne route par navigate karein
    if (isHome) {
      navigate("/aviator");
      return;
    }

    if (needsRecharge) {
      setSelectedGame(aviatorGame);
      setShowRechargeModal(true);
      return;
    }

    try {
      setSelectedGame(aviatorGame);
      await dispatch(launchGame({ gameId: aviatorGame.game_uid })).unwrap();
    } catch {
      alert("Failed to launch Aviator");
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
        <div className="max-w-6xl mb-4 sm:mb-6 sm:hidden md:block">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-1">
            <div className={`p-2 sm:p-2.5 rounded-lg ${purpleGradient}`}>
              <GiAirplane className="text-white text-lg sm:text-xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Aviator
            </h1>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            High-risk, high-reward crash game loved by millions
          </p>
        </div>

        <div className=" max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 sm:-mt-4">
          <div
            onClick={handlePlay}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative cursor-pointer
                       bg-[#1C0F2B]
                       rounded-2xl overflow-hidden
                       border border-[#2a1b3d]
                       hover:border-[#B45CFF]/60
                       hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)]
                       hover:scale-[1.02]
                       transition-all duration-300
                       flex flex-row sm:flex-col"
          >
            <div className="relative w-32 sm:w-full h-32 sm:h-[9rem] overflow-hidden bg-[#12061C] flex-shrink-0">
              <img
                src={aviatorGame.icon}
                alt="Aviator"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/40 to-transparent pointer-events-none" />

              <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 right-1.5 flex flex-wrap items-center gap-1">
                {aviatorGame.is_featured && (
                  <div
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${purpleGradient}`}
                  >
                    <FaCrown className="text-white text-[8px] sm:text-[10px]" />
                    <span className="text-white text-[8px] sm:text-[10px] font-bold leading-none">
                      HOT
                    </span>
                  </div>
                )}
                <div className="hidden sm:block px-1.5 py-0.5 bg-[#0B0410]/80 backdrop-blur-sm rounded-full border border-[#2a1b3d]">
                  <span className="text-white text-[10px] font-bold leading-none">
                    {aviatorGame.game_type}
                  </span>
                </div>
              </div>

              <div
                className={`
                  absolute inset-0 flex items-center justify-center
                  transition-all duration-300
                  ${
                    hovered
                      ? "bg-black/70 opacity-100"
                      : "bg-black/30 opacity-100 sm:bg-black/40 sm:opacity-0"
                  }
                `}
              >
                {launchLoading ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <FaSpinner className="animate-spin text-2xl sm:text-4xl text-white" />
                    <span className="text-white text-[10px] sm:text-sm">
                      Launching...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <div
                      className={`p-2 sm:p-4 rounded-full ${purpleGradient}`}
                    >
                      <MdPlayCircle className="text-2xl sm:text-4xl text-white" />
                    </div>
                    <span className="hidden sm:inline text-white text-sm font-bold bg-black/50 px-3 py-1.5 rounded-full">
                      PLAY NOW
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-2.5 sm:p-4 flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <h3 className="text-white font-bold text-sm sm:text-lg truncate">
                  {aviatorGame.game_name}
                </h3>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <MdStar className="text-[#F1C40F] text-xs sm:text-sm" />
                  <span className="text-white font-bold text-[10px] sm:text-sm">
                    {aviatorGame.rating}
                  </span>
                </div>
              </div>

              <p className="text-gray-400 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-2 mb-1.5 sm:mb-3">
                {aviatorGame.description}
              </p>

              <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-xs text-gray-500">
                <span className="flex items-center gap-0.5">
                  <MdGamepad className="text-[10px] sm:text-xs" />
                  {aviatorGame.players}
                </span>
                <span className="flex items-center gap-0.5 text-[#B45CFF]">
                  <FaFire className="text-[9px] sm:text-xs" />
                  {aviatorGame.volatility}
                </span>
              </div>
            </div>

            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#B45CFF]/40 rounded-2xl pointer-events-none" />
          </div>
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
                  window.location.href = "/deposit";
                }}
                className={`flex-1 px-4 py-3 rounded-xl ${purpleGradient} text-white font-bold transition-all active:scale-[0.98]`}
              >
                Recharge Now
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AviatorGames;