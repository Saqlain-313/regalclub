// src/components/GameGrid.jsx
import { Link } from "react-router-dom";

/**
 * Reusable GameGrid — TopX Purple Theme
 * Full page grid (mobile: 2 cols, tablet: 3-4, desktop: 6)
 */
export default function GameGrid({
  games = [],
  emptyMessage = "No games available",
}) {
  if (games.length === 0) {
    return (
      <div className="text-center py-20 bg-[#1C0F2B] rounded-2xl border border-dashed border-[#2a1b3d]">
        <p className="text-gray-400 text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
      {games.map((game, index) => (
        <Link
          key={game.game_uid || game.id || index}
          to={`/game/${game.game_uid || game.id}`}
          className="group relative rounded-2xl overflow-hidden bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-300 hover:border-[#9B59B6]/50 hover:shadow-[0_6px_18px_rgba(155,89,182,0.2)]"
        >
          <div className="relative aspect-square w-full h-48 overflow-hidden">
            <img
              src={game.img || game.icon}
              alt={game.game_name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              loading="lazy"
            />

            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0B0410] via-[#0B0410]/70 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-sm font-bold text-white leading-tight truncate">
                {game.game_name}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                {game.provider || "Casino"}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
