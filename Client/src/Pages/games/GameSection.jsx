import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { MdPlayCircle, MdWarning } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import GamePlayModal from "../../components/GamePlayModal";
import {
  clearGameUrl,
  launchGame,
  resetGameState,
} from "../../redux/slices/gameSlice";

const MIN_CREDIT_TO_PLAY = 0;

/**
 * GameSection — Reusable TopX Purple Theme Section
 *
 * Props:
 * - title: section ka heading
 * - emoji: heading ke saath emoji (🎰, 🔥, etc.)
 * - games: games array
 * - viewAllRoute: "View all" ka route (default: /games)
 * - mobileLimit: kitne games mobile pe dikhane (default: 6)
 * - desktopLimit: kitne games desktop pe (default: 12)
 *
 * Games now launch the same way as ChickenGames — via redux launchGame
 * thunk + GamePlayModal — instead of routing to a /game/:id page.
 */
export default function GameSection({
  title,
  emoji = "🎮",
  games = [],
  viewAllRoute = "/games",
  mobileLimit = 6,
  desktopLimit = 12,
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

  const displayGames = games.slice(0, desktopLimit);

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

  return (
    <section className="w-full bg-[#0B0410] px-4 py-5 sm:px-6">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[22px]">{emoji}</span>
          <h2 className="text-[20px] font-extrabold tracking-tight text-white sm:text-[24px]">
            {title}
          </h2>
        </div>

        <Link
          to={viewAllRoute}
          className="flex items-center gap-1 text-sm font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition-all sm:text-base"
        >
          View all
          <span className="text-lg">›</span>
        </Link>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {displayGames.map((game, index) => {
          // Hide games beyond mobileLimit on small screens
          const hideOnMobile = index >= mobileLimit;
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
              className={`group relative cursor-pointer rounded-2xl overflow-hidden bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-300 hover:border-[#9B59B6]/50 hover:shadow-[0_6px_18px_rgba(155,89,182,0.2)] ${
                hideOnMobile ? "hidden md:block" : ""
              }`}
            >
              <div className="relative aspect-square w-full h-48 md:h-auto overflow-hidden">
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

      {/* EMPTY STATE */}
      {displayGames.length === 0 && (
        <div className="text-center py-16 bg-[#1C0F2B] rounded-2xl border border-dashed border-[#2a1b3d]">
          <p className="text-gray-400 text-sm">No games available</p>
        </div>
      )}

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
    </section>
  );
}
