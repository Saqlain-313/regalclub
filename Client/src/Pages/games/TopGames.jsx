import { OriginalsGames } from "../../Data/GamesData";
import GameSection from "./GameSection";

/**
 * Top Games — Originals games (Limbo, Mines, Plinko, etc.)
 */
export default function TopGames() {
  const games = OriginalsGames.slice(0, 12);

  return (
    <GameSection
      title="Top Games"
      emoji="🏆"
      games={games}
      viewAllRoute="/games/top"
    />
  );
}
