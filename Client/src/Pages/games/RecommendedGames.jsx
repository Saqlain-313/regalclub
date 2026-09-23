import { AllData } from "../../Data/GamesData";
import GameSection from "./GameSection";

/**
 * Recommended — Top 12 games (already deduped in AllData)
 */
export default function RecommendedGames() {
  const games = AllData.slice(0, 12);

  return (
    <GameSection
      title="Recommended"
      emoji="⭐"
      games={games}
      viewAllRoute="/games/recommended"
    />
  );
}
