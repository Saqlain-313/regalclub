import { OriginalsGames, SlotsGames } from "../../Data/GamesData";
import GameSection from "./GameSection";

/**
 * Aviator Section — TopX Purple Theme
 *
 * Data se Aviator + related crash games filter karta hai
 * Aviator, Aviamasters, Crash, Limbo, Hilo, etc.
 */
export default function AviatorSection() {
  // Combine all potential sources
  const allSources = [...SlotsGames, ...OriginalsGames];

  // Filter Aviator + crash-style games
  const aviatorGames = allSources.filter((game) => {
    const name = (game.game_name || "").toLowerCase();
    const type = (game.game_type || "").toLowerCase();
    return (
      name.includes("aviator") ||
      name.includes("aviamaster") ||
      name.includes("crash") ||
      name.includes("limbo") ||
      name.includes("hilo") ||
      name.includes("jetx") ||
      name.includes("rocket") ||
      name.includes("spaceman") ||
      type.includes("crash")
    );
  });

  // Remove duplicates by game_name
  const uniqueGames = aviatorGames.filter(
    (game, index, self) =>
      index === self.findIndex((g) => g.game_name === game.game_name),
  );

  return (
    <GameSection
      title="Aviator Games"
      emoji="✈️"
      games={uniqueGames}
      viewAllRoute="/games/aviator"
      mobileLimit={6}
      desktopLimit={12}
    />
  );
}
