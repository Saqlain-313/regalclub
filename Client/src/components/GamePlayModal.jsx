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

  // =========================================================
  // AUTH
  // =========================================================

  const { isAuthenticated, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  // =========================================================
  // GAME STATE
  // =========================================================

  const {
    gamecredit = 0,
    transferLoading = false,
    iscreditLoading = false,
  } = useSelector((state) => state.game);

  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // =========================================================
  // REFS
  // =========================================================

  const iframeRef = useRef(null);

  // Currently mounted URL
  const mountedUrlRef = useRef("");

  // Prevent duplicate close
  const closingRef = useRef(false);

  // Prevent duplicate opening
  const openingRef = useRef(false);

  // =========================================================
  // RESOLVE GAME URL
  // =========================================================

  const resolvedGameUrl =
    typeof gameUrl === "string"
      ? gameUrl
      : gameUrl?.launch_view_url ||
        gameUrl?.launch_url ||
        gameUrl?.game_url ||
        gameUrl?.url ||
        "";

  // =========================================================
  // DEBUG
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    console.log("====================================");
    console.log("🎮 GAME MODAL OPEN");
    console.log("Game:", gameData?.game_name);
    console.log("Provider:", gameData?.provider);
    console.log("Game URL:", resolvedGameUrl);
    console.log("Mobile:", window.innerWidth <= 768);
    console.log("Viewport:", window.innerWidth, window.innerHeight);
    console.log("====================================");
  }, [
    isOpen,
    resolvedGameUrl,
    gameData?.game_name,
    gameData?.provider,
  ]);

  // =========================================================
  // AUTH REDIRECT
  // =========================================================

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [authLoading, isAuthenticated]);

  // =========================================================
  // MOBILE VIEWPORT HEIGHT
  // Fixes mobile browser address-bar height issues
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const setViewportHeight = () => {
      const height = window.visualViewport?.height || window.innerHeight;

      document.documentElement.style.setProperty(
        "--game-vh",
        `${height}px`
      );
    };

    setViewportHeight();

    window.addEventListener("resize", setViewportHeight);

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        setViewportHeight
      );
    }

    return () => {
      window.removeEventListener("resize", setViewportHeight);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          setViewportHeight
        );
      }

      document.documentElement.style.removeProperty("--game-vh");
    };
  }, [isOpen]);

  // =========================================================
  // GAME URL / IFRAME INITIALIZATION
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    // No URL yet
    if (!resolvedGameUrl) {
      setIframeLoading(false);
      setIframeError(null);
      return;
    }

    // Same URL already mounted
    // DO NOT reload provider session
    if (mountedUrlRef.current === resolvedGameUrl) {
      return;
    }

    // Prevent duplicate initialization
    if (openingRef.current) {
      return;
    }

    openingRef.current = true;

    console.log("🎮 Opening game:", {
      game: gameData?.game_name,
      provider: gameData?.provider,
      url: resolvedGameUrl,
    });

    mountedUrlRef.current = resolvedGameUrl;

    setIframeLoading(true);
    setIframeError(null);
    setShowTransferModal(false);

    const timer = setTimeout(() => {
      openingRef.current = false;
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [
    isOpen,
    resolvedGameUrl,
    gameData?.game_name,
    gameData?.provider,
  ]);

  // =========================================================
  // ESC + FULLSCREEN
  // =========================================================

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

    // Prevent background page scrolling
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

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
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // =========================================================
  // FULLSCREEN
  // =========================================================

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const element =
          document.getElementById("game-container");

        if (element?.requestFullscreen) {
          await element.requestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("❌ Fullscreen error:", error);
    }
  };

  // =========================================================
  // REFRESH
  // DO NOT RELOAD IFRAME
  // =========================================================

  const handleRefresh = () => {
    console.log(
      "⚠️ Game refresh disabled to protect provider session."
    );

    setIframeError(null);
  };

  // =========================================================
  // TRANSFER
  // =========================================================

  const handleTransfer = async () => {
    // Keep your existing transfer logic here.
    console.log("💰 Transfer clicked");
  };

  // =========================================================
  // DEPOSIT
  // =========================================================

  const handleDeposit = () => {
    window.location.href = "/deposit";
  };

  // =========================================================
  // CLOSE GAME
  // =========================================================

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
      // Get latest game balance before destroying session
      await dispatch(checkGamecredit()).unwrap();
    } catch (error) {
      console.error(
        "❌ checkGamecredit failed:",
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
        "❌ Fullscreen close error:",
        error
      );
    }

    // Clear game URL FIRST
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

    // Reset Redux
    dispatch(resetGameState());

    // Close parent modal
    onClose();

    setTimeout(() => {
      closingRef.current = false;
    }, 500);
  };

  // =========================================================
  // CLOSED
  // =========================================================

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // LOADING
  // =========================================================

  const actualLoading =
    iframeLoading ||
    launchLoading ||
    iscreditLoading;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      id="game-container"
      className="fixed inset-0 z-[99999] bg-black flex flex-col overflow-hidden"
      style={{
        height: "var(--game-vh, 100dvh)",
        minHeight: "100dvh",
        width: "100%",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex-shrink-0
          h-16
          min-h-16
          flex
          items-center
          justify-between
          px-2
          sm:px-5
          bg-gray-950
          border-b
          border-gray-800
          relative
          z-[100]
        "
      >
        {/* LEFT */}

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={closingRef.current}
            className="
              w-10
              h-10
              flex
              flex-shrink-0
              items-center
              justify-center
              rounded-lg
              hover:bg-gray-800
              active:bg-gray-700
              text-white
              disabled:opacity-50
              touch-manipulation
            "
            aria-label="Back"
          >
            <MdArrowBack className="text-xl" />
          </button>

          <div className="min-w-0">
            <h1
              className="
                text-white
                font-bold
                truncate
                text-sm
                sm:text-base
                max-w-[130px]
                sm:max-w-[300px]
              "
            >
              {gameData?.game_name || "Game"}
            </h1>

            {gameData?.provider && (
              <span className="text-[10px] sm:text-xs text-gray-400 truncate block">
                {gameData.provider}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* DESKTOP TRANSFER */}

          {Number(gamecredit) > 0 && (
            <button
              type="button"
              onClick={() =>
                setShowTransferModal(true)
              }
              className="
                hidden
                sm:flex
                items-center
                gap-1
                px-3
                py-2
                rounded-lg
                bg-yellow-600
                hover:bg-yellow-500
                text-white
                text-sm
                touch-manipulation
              "
            >
              <FaExchangeAlt />
              Transfer
            </button>
          )}

          {/* DESKTOP DEPOSIT */}

          <button
            type="button"
            onClick={handleDeposit}
            className="
              hidden
              sm:flex
              items-center
              gap-1
              px-3
              py-2
              rounded-lg
              bg-green-600
              hover:bg-green-500
              text-white
              text-sm
              touch-manipulation
            "
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
              className="
                sm:hidden
                w-9
                h-9
                flex
                items-center
                justify-center
                rounded-lg
                bg-yellow-600
                active:bg-yellow-500
                text-white
                touch-manipulation
              "
              aria-label="Transfer"
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
            className="
              w-9
              h-9
              sm:w-10
              sm:h-10
              flex
              items-center
              justify-center
              rounded-lg
              hover:bg-gray-800
              active:bg-gray-700
              text-white
              touch-manipulation
            "
            aria-label="Mute"
          >
            {isMuted ? (
              <MdVolumeOff />
            ) : (
              <MdVolumeUp />
            )}
          </button>

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            className="
              w-10
              h-10
              hidden
              sm:flex
              items-center
              justify-center
              rounded-lg
              hover:bg-gray-800
              text-white
            "
            title="Refresh disabled to protect game session"
          >
            <span className="text-xl">↻</span>
          </button>

          {/* FULLSCREEN */}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="
              w-9
              h-9
              sm:w-10
              sm:h-10
              flex
              items-center
              justify-center
              rounded-lg
              hover:bg-gray-800
              active:bg-gray-700
              text-white
              touch-manipulation
            "
            aria-label="Fullscreen"
          >
            {isFullscreen ? (
              <FaCompress />
            ) : (
              <FaExpand />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          GAME AREA
      ===================================================== */}

      <div
        className="
          relative
          flex-1
          min-h-0
          w-full
          bg-black
          overflow-hidden
        "
        style={{
          height: "calc(var(--game-vh, 100dvh) - 64px)",
          minHeight: 0,
        }}
      >
        {/* ===================================================
            LOADING
        =================================================== */}

        {actualLoading && (
          <div
            className="
              absolute
              inset-0
              z-20
              flex
              items-center
              justify-center
              bg-black
            "
          >
            <div className="flex flex-col items-center gap-3">
              <FaSpinner className="text-white text-4xl animate-spin" />

              <span className="text-gray-300 text-sm">
                Loading{" "}
                {gameData?.game_name || "game"}...
              </span>
            </div>
          </div>
        )}

        {/* ===================================================
            LAUNCH ERROR
        =================================================== */}

        {launchError && (
          <div
            className="
              absolute
              inset-0
              z-30
              flex
              items-center
              justify-center
              bg-black
              px-5
            "
          >
            <div className="text-center max-w-md">
              <MdError className="text-red-500 text-6xl mx-auto mb-4" />

              <h2 className="text-white text-xl font-bold mb-2">
                Unable to launch game
              </h2>

              <p className="text-gray-400 text-sm mb-6 break-words">
                {launchError}
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-gray-700
                  hover:bg-gray-600
                  active:bg-gray-500
                  text-white
                  touch-manipulation
                "
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            NO GAME URL
        =================================================== */}

        {!resolvedGameUrl &&
          !actualLoading &&
          !launchError && (
            <div
              className="
                absolute
                inset-0
                z-20
                flex
                items-center
                justify-center
                bg-black
                px-5
              "
            >
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
                  className="
                    px-5
                    py-2.5
                    rounded-lg
                    bg-gray-700
                    hover:bg-gray-600
                    active:bg-gray-500
                    text-white
                    touch-manipulation
                  "
                >
                  Back
                </button>
              </div>
            </div>
          )}

        {/* ===================================================
            GAME IFRAME
        =================================================== */}

        {resolvedGameUrl && !launchError && (
          <iframe
            ref={iframeRef}
            id="game-iframe"
            src={resolvedGameUrl}
            title={gameData?.game_name || "Game"}
            className="
              absolute
              inset-0
              w-full
              h-full
              min-h-0
              border-0
              bg-black
              block
            "
            style={{
              width: "100%",
              height: "100%",
              minWidth: "100%",
              minHeight: "100%",
              display: "block",
              border: "0",
              backgroundColor: "#000",
              WebkitOverflowScrolling: "touch",
              touchAction: "manipulation",
            }}
            allow="
              autoplay;
              fullscreen;
              gamepad;
              payment;
              clipboard-read;
              clipboard-write;
              accelerometer;
              gyroscope;
              magnetometer;
              camera;
              microphone;
              orientation-lock
            "
            allowFullScreen
            referrerPolicy="origin"
            scrolling="yes"
            onLoad={() => {
              console.log(
                "===================================="
              );

              console.log(
                "✅ GAME IFRAME LOADED"
              );

              console.log(
                "Game:",
                gameData?.game_name
              );

              console.log(
                "Provider:",
                gameData?.provider
              );

              console.log(
                "URL:",
                resolvedGameUrl
              );

              console.log(
                "Mobile:",
                window.innerWidth <= 768
              );

              console.log(
                "===================================="
              );

              setIframeLoading(false);
              setIframeError(null);
            }}
            onError={(error) => {
              console.error(
                "❌ GAME IFRAME ERROR:",
                error
              );

              setIframeLoading(false);
              setIframeError(
                "Game failed to load."
              );
            }}
          />
        )}

        {/* ===================================================
            IFRAME ERROR
        =================================================== */}

        {iframeError && (
          <div
            className="
              absolute
              inset-0
              z-30
              flex
              items-center
              justify-center
              bg-black
              px-5
            "
          >
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
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-gray-700
                  hover:bg-gray-600
                  active:bg-gray-500
                  text-white
                  touch-manipulation
                "
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          TRANSFER MODAL
      ===================================================== */}

      {showTransferModal && (
        <div
          className="
            fixed
            inset-0
            z-[100000]
            flex
            items-center
            justify-center
            bg-black/80
            px-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              bg-gray-900
              border
              border-gray-700
              rounded-2xl
              p-5
              sm:p-6
            "
          >
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
                className="
                  flex-1
                  py-3
                  rounded-xl
                  bg-gray-700
                  active:bg-gray-600
                  text-white
                  touch-manipulation
                "
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
                className="
                  flex-1
                  py-3
                  rounded-xl
                  bg-green-600
                  active:bg-green-500
                  disabled:opacity-50
                  text-white
                  font-semibold
                  touch-manipulation
                "
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