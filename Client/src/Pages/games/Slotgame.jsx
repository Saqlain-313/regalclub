import { useEffect, useMemo, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { MdPlayCircle, MdWarning } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // ✅ ADD

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
  const navigate = useNavigate(); // ✅ ADD
  const { userprofile, stats } = useSelector((state) => state.auth);
  const { gamesByGameType, loading, gameUrl, launchLoading, launchError } =
    useSelector((state) => state.game);

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hasRequestedGames, setHasRequestedGames] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const MIN_CREDIT_TO_PLAY = 0;
  const hasDeposited = (stats?.totalDeposits || 0) > 0;
  const credit = Number(userprofile?.credit || 0);
  const needsRecharge = !hasDeposited || credit < MIN_CREDIT_TO_PLAY;

  useEffect(() => {
    if (!isHome) {
      dispatch(resetGameState());
    }
  }, [dispatch, isHome]);

  useEffect(() => {
    if (!isHome && gameUrl) {
      setIsGameModalOpen(true);
    }
  }, [gameUrl, isHome]);

  useEffect(() => {
    dispatch(
      getGamesByGameType({ page: 1, limit: 1000, game_type: "Slot Game" }),
    );
    setHasRequestedGames(true);
  }, [dispatch]);

  const sourceGames = useMemo(() => {
    const apiGames =
      Array.isArray(gamesByGameType) && gamesByGameType.length > 0
        ? gamesByGameType
        : null;

    if (apiGames) return apiGames;
    return SlotsGames;
  }, [gamesByGameType]);

  const displayGames = useMemo(() => {
    return sourceGames.slice(0, 12);
  }, [sourceGames]);

  const handlePlay = async (game) => {
    // ✅ Home page par click → apne route par navigate karein
    if (isHome) {
      navigate("/slots");
      return;
    }

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

  const showGamesLoader =
    hasRequestedGames && loading && displayGames.length === 0;

  return (
    <>
      <div className="bg-[#0B0410] px-4 py-5 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[22px]">🎰</span>
            <h2 className="text-[20px] font-extrabold tracking-tight text-white sm:text-[24px]">
              Slot Games
            </h2>
          </div>
        </div>

        <div className="mx-auto">
          {showGamesLoader ? (
            <div className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-20 text-center">
              <FaSpinner className="animate-spin text-4xl text-[#B45CFF] mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">
                Loading slot games...
              </h3>
              <p className="text-gray-400 text-sm">
                Please wait while we fetch latest games
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {displayGames.map((game, index) => {
                  const hideOnMobile = index >= 6;

                  return (
                    <div
                      key={game.game_uid || game.id || index}
                      onClick={() => handlePlay(game)}
                      className={`relative cursor-pointer rounded-xl overflow-hidden 
                        aspect-[3/4] bg-[#1C0F2B] group shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_6px_18px_rgba(155,89,182,0.25)] transition-all duration-300 border border-[#2a1b3d] hover:border-[#B45CFF]/60 ${
                          hideOnMobile ? "hidden md:block" : ""
                        }`}
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
                        {launchLoading &&
                        selectedGame?.game_uid === game.game_uid ? (
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
                            {game.provider || "Slots"}
                          </span>
                          <span className="text-xs text-[#F1C40F] font-medium">
                            Live
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {displayGames.length === 0 && (
                <div className="text-center py-16 bg-[#1C0F2B] rounded-2xl border border-dashed border-[#2a1b3d] mt-10">
                  <h3 className="text-white text-lg font-semibold mb-2">
                    No games found
                  </h3>
                  <p className="text-gray-400">No games available</p>
                </div>
              )}
            </>
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

export default Slotgame;