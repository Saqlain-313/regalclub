


import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdFullscreen,
  MdFullscreenExit,
  MdVolumeUp,
  MdVolumeOff,
  MdRefresh,
} from "react-icons/md";

export default function GamePlay() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const games = {
    worli3: {
      name: "Worli 3",
      iframeUrl: "https://sitethemedata.com/casino_icons/lc/worli3.gif",
    },
    teenpattioneday62: {
      name: "Teen Patti 62",
      iframeUrl: "https://sitethemedata.com/casino_icons/lc/teen62.gif",
    },
  };

  const game = games[gameId];

  if (!game) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Game not found
      </div>
    );
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    iframeRef.current?.contentWindow.postMessage(
      { type: "SET_VOLUME", volume: isMuted ? 100 : 0 },
      "*"
    );
  };

  const reloadGame = () => {
    iframeRef.current.src = iframeRef.current.src;
  };

  return (
    <div
      ref={containerRef}
      className="bg-black min-h-screen flex flex-col"
    >
      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 bg-gray-900/90 backdrop-blur border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/casino")}
            className="flex items-center gap-1 text-primary-400 hover:text-primary-300"
          >
            <MdArrowBack className="text-xl" />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>

          <h1 className="text-white text-sm sm:text-lg font-semibold truncate">
            {game.name}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
          >
            {isMuted ? <MdVolumeOff /> : <MdVolumeUp />}
          </button>

          <button
            onClick={reloadGame}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
          >
            <MdRefresh />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
          </button>
        </div>
      </header>

      {/* ================= GAME IFRAME ================= */}
      <main className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={game.iframeUrl}
          title={game.name}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{ border: "none", background: "#000" }}
        />
      </main>
    </div>
  );
}
