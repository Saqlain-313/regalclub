import { Hotgame } from "../../Data/GamesData";
import GameSection from "./GameSection";

/**
 * Trending — Hot games (already shuffled in Hotgame export)
 */
export default function TrendingGames() {
  const games = Hotgame.slice(0, 12);

  return (
    <GameSection
      title="Trending"
      emoji="🔥"
      games={games}
      viewAllRoute="/games/trending"
    />
  );
}
