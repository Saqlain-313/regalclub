// src/components/GameGrid.jsx
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { MdPlayCircle, MdWarning } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import GamePlayModal from "../../../components/GamePlayModal";
import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../../redux/slices/gameSlice";

const MIN_CREDIT_TO_PLAY = 0;

/**
 * Reusable GameGrid — TopX Purple Theme
 * Full page grid (mobile: 2 cols, tablet: 3-4, desktop: 6)
 *
 * Games now launch the same way as ChickenGames — via redux launchGame
 * thunk + GamePlayModal — instead of routing to a /game/:id page.
 */
export default function GameGrid({
  games = [],
  emptyMessage = "No games available",
}) {
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

  const hasDeposited = true;
  const credit = Number(user?.credit || 0);
  const needsRecharge = !hasDeposited || credit < MIN_CREDIT_TO_PLAY;

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
    if (needsRecharge) {
      setSelectedGame(game);
      setShowRechargeModal(true);
      return;
    }

    try {
      setSelectedGame(game);
      await dispatch(launchGame({ gameId: game.game_uid || game.id })).unwrap();
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

  if (games.length === 0) {
    return (
      <div className="text-center py-20 bg-[#1C0F2B] rounded-2xl border border-dashed border-[#2a1b3d]">
        <p className="text-gray-400 text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {games.map((game, index) => {
          const gameKey = game.game_uid || game.id || index;
          const isLaunchingThis =
            launchLoading &&
            selectedGame &&
            (selectedGame.game_uid || selectedGame.id) ===
              (game.game_uid || game.id);

          return (
            <div
              key={gameKey}
              onClick={() => handlePlay(game)}
              className="group relative cursor-pointer rounded-2xl overflow-hidden bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-300 hover:border-[#9B59B6]/50 hover:shadow-[0_6px_18px_rgba(155,89,182,0.2)]"
            >
              <div className="relative aspect-square w-full h-48 overflow-hidden">
                <img
                  src={game.img || game.icon}
                  alt={game.game_name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/70 to-transparent"></div>

                {/* PLAY OVERLAY */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  {isLaunchingThis ? (
                    <FaSpinner className="animate-spin text-3xl text-white" />
                  ) : (
                    <div className="p-3 bg-[#9B59B6] rounded-full">
                      <MdPlayCircle className="text-3xl text-white" />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="text-sm font-bold text-white leading-tight truncate">
                    {game.game_name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                    {game.provider || "Casino"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECHARGE REQUIRED MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#1C0F2B] border border-[#9B59B6]/40 rounded-2xl p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/40">
              <MdWarning className="text-4xl text-[#9B59B6]" />
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
                className="flex-1 px-4 py-3 rounded-xl bg-[#2a1b3d] text-gray-300 hover:bg-[#3a2a4d] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRechargeModal(false);
                  window.location.href = "/deposit";
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-[#9B59B6] text-white font-bold hover:bg-[#8347a3] transition-all"
              >
                Recharge Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME MODAL */}
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
}
