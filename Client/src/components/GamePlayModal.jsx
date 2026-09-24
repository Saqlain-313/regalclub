import { useEffect, useState } from "react";
import {
  FaCoins,
  FaCompress,
  FaExchangeAlt,
  FaExpand,
  FaSpinner,
} from "react-icons/fa";
import {
  MdArrowBack,
  MdError,
  MdMoney,
  MdRefresh,
  MdVolumeOff,
  MdVolumeUp,
  MdWarning,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import {
  checkGamecredit,
  clearGameUrl,
  resetGameState,
} from "../../../Client/src/redux/slices/gameSlice";

const GamePlayModal = ({
  isOpen,
  onClose,
  gameData,
  gameUrl,
  loading: launchLoading,
  launchError,
}) => {
  const dispatch = useDispatch();

  const { userprofile, isAuthenticated, loading } = useSelector(
    (state) => state.auth,
  );

  if (!isAuthenticated && !loading) {
    window.location.href = "/login";
  }

  // if (!userprofile && !loading) {
  //   window.location.href = "/profile";
  // }

  const resolvedGameUrl =
    typeof gameUrl === "string"
      ? gameUrl
      : gameUrl?.launch_view_url || gameUrl?.url || "";

  console.log("GamePlayModal Props:", {
    isOpen,
    gameData,
    gameUrl: resolvedGameUrl,
    launchLoading,
    launchError,
  });
  /* ===========================
     REDUX STATE
  =========================== */
  const { gamecredit, transferLoading, iscreditLoading } = useSelector(
    (state) => state.game,
  );

  /* ===========================
     LOCAL STATE
  =========================== */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  /* ===========================
     OPEN HANDLING
     (NO credit check here)
  =========================== */
  // useEffect(() => {
  //   if (!isOpen) return;

  //   setIframeLoading(Boolean(resolvedGameUrl));
  //   setIframeError(null);
  //   setShowTransferModal(false);

  //   if (!resolvedGameUrl) return;

  //   const timeoutId = window.setTimeout(() => {
  //     setIframeLoading(false);
  //     setIframeError(
  //       "Game iframe load nahi hua. Provider iframe block kar sakta hai.",
  //     );
  //   }, 12000);

  //   return () => window.clearTimeout(timeoutId);
  // }, [isOpen, resolvedGameUrl]);

  /* ===========================
     ESC + FULLSCREEN LISTENERS
  =========================== */
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          handleClose();
        }
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("keydown", handleEsc);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  /* ===========================
     ACTIONS
  =========================== */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };


  const reloadGame = () => {
    if (!resolvedGameUrl) return;
    setIframeLoading(true);
    const iframe = document.getElementById("game-iframe");
    if (iframe) iframe.src = iframe.src;
  };

  const handleTransfer = async () => {};

  const handleDeposit = () => {
    window.location.href = "/deposit";
  };

  const openGameInNewTab = () => {
    if (!resolvedGameUrl) return;
    window.open(resolvedGameUrl, "_blank", "noopener,noreferrer");
  };

  /* ===========================
     🔥 MAIN FIX — CLOSE HANDLER
     credit check ONLY here
  =========================== */
  const handleClose = async () => {
    // ✅ credit check AFTER game close
    await dispatch(checkGamecredit());

    dispatch(clearGameUrl());
    dispatch(resetGameState());
    onClose();

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (!isOpen) return null;

  const actualLoading = iframeLoading || launchLoading || iscreditLoading;

  /* ===========================
     UI
  =========================== */
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 to-black">
      {/* ================= TRANSFER MODAL ================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-yellow-500/30">
            <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <FaExchangeAlt className="text-yellow-500" />
              Transfer Winnings
            </h3>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="text-gray-400 text-sm mb-1">Game credit</div>
              <div className="text-white text-2xl font-bold flex items-center gap-2">
                <FaCoins className="text-yellow-500" />₹{gamecredit}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleTransfer}
                disabled={transferLoading || gamecredit <= 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {transferLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Transferring...
                  </>
                ) : (
                  "Transfer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOP BAR ================= */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <MdArrowBack className="text-xl text-white" />
          </button>

          <div>
            <h1 className="text-white font-bold">{gameData?.game_name}</h1>
            <span className="text-xs text-gray-400">{gameData?.provider}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gamecredit > 0 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg flex items-center gap-1"
            >
              <FaExchangeAlt />
              Transfer
            </button>
          )}

          <button
            onClick={handleDeposit}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg flex items-center gap-1"
          >
            <MdMoney />
            Deposit
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-gray-800 rounded-lg text-white"
          >
            {isMuted ? <MdVolumeOff /> : <MdVolumeUp />}
          </button>

          <button
            onClick={reloadGame}
            className="p-2 hover:bg-gray-800 rounded-lg text-white"
          >
            <MdRefresh />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-800 rounded-lg text-white"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* ================= GAME AREA ================= */}
      <div className="relative h-[calc(100vh-64px)]">
        {actualLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <FaSpinner className="text-white text-4xl animate-spin" />
          </div>
        )}

        {launchError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <MdError className="text-red-500 text-6xl mx-auto mb-4" />
              <p className="text-white mb-4">{launchError}</p>
              <button
                onClick={handleClose}
                className="bg-gray-700 px-4 py-2 text-white rounded-lg"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {!resolvedGameUrl && !actualLoading && !launchError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <MdWarning className="text-yellow-500 text-6xl mx-auto mb-4" />
              <p className="text-white mb-4">Game URL not available</p>
              <button
                onClick={handleClose}
                className="bg-gray-700 px-4 py-2 text-white rounded-lg"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {resolvedGameUrl && !launchError && (
          <iframe
            key={resolvedGameUrl}
            id="game-iframe"
            src={resolvedGameUrl}
            title={gameData?.game_name}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={() => setIframeLoading(false)}
            onError={() => {
              setIframeLoading(false);
              setIframeError("Failed to load game");
            }}
          />
        )}

        {iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <MdError className="text-red-500 text-6xl mx-auto mb-4" />
              <p className="text-white mb-4">{iframeError}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={reloadGame}
                  className="bg-gray-700 px-4 py-2 text-white rounded-lg"
                >
                  Retry
                </button>
                <button
                  onClick={openGameInNewTab}
                  className="bg-blue-600 px-4 py-2 text-white rounded-lg"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlayModal;
