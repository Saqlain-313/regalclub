import { Link } from "react-router-dom";

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
 */
export default function GameSection({
  title,
  emoji = "🎮",
  games = [],
  viewAllRoute = "/games",
  mobileLimit = 6,
  desktopLimit = 12,
}) {
  const displayGames = games.slice(0, desktopLimit);

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

          return (
            <Link
              key={game.game_uid || game.id || index}
              to={`/game/${game.game_uid || game.id}`}
              className={`group relative rounded-2xl overflow-hidden bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-300 hover:border-[#9B59B6]/50 hover:shadow-[0_6px_18px_rgba(155,89,182,0.2)] ${
                hideOnMobile ? "hidden md:block" : ""
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden">
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
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {displayGames.length === 0 && (
        <div className="text-center py-16 bg-[#1C0F2B] rounded-2xl border border-dashed border-[#2a1b3d]">
          <p className="text-gray-400 text-sm">No games available</p>
        </div>
      )}
    </section>
  );
}
