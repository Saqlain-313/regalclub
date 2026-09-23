import { AllData } from "../../Data/GamesData";
import GameSection from "./GameSection";

/**
 * Chicken — Chicken games filter
 * Data me "chicken", "road", "cross" keywords
 */
export default function ChickenGames() {
  const games = AllData.filter((game) => {
    const name = (game.game_name || "").toLowerCase();
    return (
      name.includes("chicken") ||
      name.includes("road") ||
      name.includes("cross")
    );
  }).slice(0, 12);

  return (
    <GameSection
      title="Chicken"
      emoji="🐔"
      games={games}
      viewAllRoute="/games/chicken"
    />
  );
}
