import { useEffect, useRef, useState } from "react";
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
  loading: launchLoading = false,
  launchError = null,
}) => {
  const dispatch = useDispatch();

  const { isAuthenticated, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  const {
    gamecredit = 0,
    transferLoading = false,
    iscreditLoading = false,
  } = useSelector((state) => state.game);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // --------------------------------------------------
  // IMPORTANT SESSION PROTECTION
  // --------------------------------------------------

  const iframeRef = useRef(null);

  // Currently mounted game URL
  const mountedUrlRef = useRef("");

  // Prevent double close
  const closingRef = useRef(false);

  // Prevent duplicate iframe/session initialization
  const openingRef = useRef(false);

  // --------------------------------------------------
  // Resolve URL
  // Supports different provider response formats
  // --------------------------------------------------

  const resolvedGameUrl =
    typeof gameUrl === "string"
      ? gameUrl
      : gameUrl?.launch_view_url ||
        gameUrl?.launch_url ||
        gameUrl?.game_url ||
        gameUrl?.url ||
        "";

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [authLoading, isAuthenticated]);

  // --------------------------------------------------
  // GAME URL HANDLER
  // --------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    if (!resolvedGameUrl) {
      setIframeLoading(false);
      setIframeError(null);
      return;
    }

    /*
      VERY IMPORTANT

      If same URL already mounted:
      DO NOT recreate iframe.
      DO NOT reload provider session.
    */

    if (mountedUrlRef.current === resolvedGameUrl) {
      return;
    }

    if (openingRef.current) {
      return;
    }

    openingRef.current = true;

    console.log("🎮 Opening game:", {
      game: gameData?.game_name,
      provider: gameData?.provider,
    });

    mountedUrlRef.current = resolvedGameUrl;

    setIframeLoading(true);
    setIframeError(null);
    setShowTransferModal(false);

    // Release lock after React has mounted iframe
    const timer = setTimeout(() => {
      openingRef.current = false;
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    isOpen,
    resolvedGameUrl,
    gameData?.game_name,
    gameData?.provider,
  ]);

  // --------------------------------------------------
  // ESC + FULLSCREEN
  // --------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        handleClose();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // --------------------------------------------------
  // FULLSCREEN
  // --------------------------------------------------

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // --------------------------------------------------
  // REFRESH
  //
  // DO NOT reload iframe.
  // Provider session can be killed by iframe reload.
  // --------------------------------------------------

  const handleRefresh = () => {
    console.log(
      "⚠️ Game refresh disabled to protect provider session."
    );

    setIframeError(null);
  };

  // --------------------------------------------------
  // TRANSFER
  // --------------------------------------------------

  const handleTransfer = async () => {
    // Your existing transfer logic can be placed here.
  };

  // --------------------------------------------------
  // DEPOSIT
  // --------------------------------------------------

  const handleDeposit = () => {
    window.location.href = "/deposit";
  };

  // --------------------------------------------------
  // CLOSE GAME
  // --------------------------------------------------

  const handleClose = async () => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;

    console.log(
      "🔴 Closing game:",
      gameData?.game_name
    );

    try {
      /*
        Get latest game balance before destroying
        the game session.
      */
      await dispatch(checkGamecredit()).unwrap();
    } catch (error) {
      console.error(
        "checkGamecredit failed:",
        error
      );
    }

    // Exit fullscreen
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen close error:",
        error
      );
    }

    /*
      Clear URL BEFORE closing modal.

      This causes iframe to unmount cleanly.
    */
    dispatch(clearGameUrl());

    // Reset references
    mountedUrlRef.current = "";
    openingRef.current = false;
    iframeRef.current = null;

    // Reset UI
    setIframeLoading(true);
    setIframeError(null);
    setShowTransferModal(false);
    setIsFullscreen(false);

    // Reset Redux state
    dispatch(resetGameState());

    // Close parent modal
    onClose();

    // Unlock
    setTimeout(() => {
      closingRef.current = false;
    }, 500);
  };

  // --------------------------------------------------
  // CLOSED
  // --------------------------------------------------

  if (!isOpen) {
    return null;
  }

  const actualLoading =
    iframeLoading ||
    launchLoading ||
    iscreditLoading;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex-shrink-0 h-16 flex items-center justify-between px-3 sm:px-5 bg-gray-950 border-b border-gray-800">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          <button
            type="button"
            onClick={handleClose}
            disabled={closingRef.current}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800 text-white disabled:opacity-50"
          >
            <MdArrowBack className="text-xl" />
          </button>

          <div className="min-w-0">

            <h1 className="text-white font-bold truncate max-w-[180px] sm:max-w-[300px]">
              {gameData?.game_name || "Game"}
            </h1>

            {gameData?.provider && (
              <span className="text-xs text-gray-400">
                {gameData.provider}
              </span>
            )}

          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* TRANSFER */}
          {Number(gamecredit) > 0 && (
            <button
              type="button"
              onClick={() =>
                setShowTransferModal(true)
              }
              className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm"
            >
              <FaExchangeAlt />
              Transfer
            </button>
          )}

          {/* DEPOSIT */}
          <button
            type="button"
            onClick={handleDeposit}
            className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm"
          >
            <MdMoney />
            Deposit
          </button>

          {/* MOBILE TRANSFER */}
          {Number(gamecredit) > 0 && (
            <button
              type="button"
              onClick={() =>
                setShowTransferModal(true)
              }
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-600 text-white"
            >
              <FaCoins />
            </button>
          )}

          {/* MUTE */}
          <button
            type="button"
            onClick={() =>
              setIsMuted((prev) => !prev)
            }
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800 text-white"
          >
            {isMuted ? (
              <MdVolumeOff />
            ) : (
              <MdVolumeUp />
            )}
          </button>

          {/* REFRESH
              Does NOT reload iframe
          */}
          <button
            type="button"
            onClick={handleRefresh}
            className="w-10 h-10 hidden sm:flex items-center justify-center rounded-lg hover:bg-gray-800 text-white"
            title="Refresh disabled to protect game session"
          >
            <span className="text-xl">↻</span>
          </button>

          {/* FULLSCREEN */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800 text-white"
          >
            {isFullscreen ? (
              <FaCompress />
            ) : (
              <FaExpand />
            )}
          </button>

        </div>
      </div>

      {/* ==================================================
          GAME AREA
      ================================================== */}

      <div className="relative flex-1 min-h-0 bg-black">

        {/* LOADING */}
        {actualLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-3">

              <FaSpinner className="text-white text-4xl animate-spin" />

              <span className="text-gray-300 text-sm">
                Loading{" "}
                {gameData?.game_name || "game"}...
              </span>

            </div>
          </div>
        )}

        {/* LAUNCH ERROR */}
        {launchError && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black px-5">

            <div className="text-center max-w-md">

              <MdError className="text-red-500 text-6xl mx-auto mb-4" />

              <h2 className="text-white text-xl font-bold mb-2">
                Unable to launch game
              </h2>

              <p className="text-gray-400 text-sm mb-6">
                {launchError}
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
              >
                Back
              </button>

            </div>
          </div>
        )}

        {/* NO URL */}
        {!resolvedGameUrl &&
          !actualLoading &&
          !launchError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black px-5">

              <div className="text-center">

                <MdWarning className="text-yellow-500 text-6xl mx-auto mb-4" />

                <h2 className="text-white text-xl font-bold mb-2">
                  Game URL not available
                </h2>

                <p className="text-gray-400 text-sm mb-6">
                  The game session could not be created.
                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Back
                </button>

              </div>
            </div>
          )}

        {/* ==================================================
            SINGLE IFRAME
            NO key={resolvedGameUrl}
            NO iframe.src = iframe.src
        ================================================== */}

        {resolvedGameUrl && !launchError && (
          <iframe
            ref={iframeRef}
            id="game-iframe"
            src={resolvedGameUrl}
            title={gameData?.game_name || "Game"}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad"
            allowFullScreen
            onLoad={() => {
              console.log(
                "✅ Game loaded:",
                gameData?.game_name
              );

              setIframeLoading(false);
              setIframeError(null);
            }}
            onError={() => {
              console.error(
                "❌ Game iframe error:",
                gameData?.game_name
              );

              setIframeLoading(false);
              setIframeError(
                "Game failed to load."
              );
            }}
          />
        )}

        {/* IFRAME ERROR */}
        {iframeError && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black px-5">

            <div className="text-center max-w-md">

              <MdError className="text-red-500 text-6xl mx-auto mb-4" />

              <h2 className="text-white text-xl font-bold mb-2">
                Game loading failed
              </h2>

              <p className="text-gray-400 text-sm mb-6">
                {iframeError}
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
              >
                Back
              </button>

            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          TRANSFER MODAL
      ================================================== */}

      {showTransferModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 px-4">

          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6">

            <h3 className="text-white text-xl font-bold mb-5 flex items-center gap-2">
              <FaExchangeAlt className="text-yellow-500" />
              Transfer Winnings
            </h3>

            <div className="bg-gray-800 rounded-xl p-4 mb-5">

              <div className="text-gray-400 text-sm mb-1">
                Game Credit
              </div>

              <div className="text-white text-2xl font-bold flex items-center gap-2">
                <FaCoins className="text-yellow-500" />
                ₹
                {Number(
                  gamecredit || 0
                ).toLocaleString()}
              </div>

            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowTransferModal(false)
                }
                className="flex-1 py-3 rounded-xl bg-gray-700 text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleTransfer}
                disabled={
                  transferLoading ||
                  Number(gamecredit) <= 0
                }
                className="flex-1 py-3 rounded-xl bg-green-600 disabled:opacity-50 text-white font-semibold"
              >
                {transferLoading
                  ? "Transferring..."
                  : "Transfer"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GamePlayModal;