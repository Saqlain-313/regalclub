import { AllData } from "../../Data/GamesData";
import GameSection from "./GameSection";

/**
 * Crash — Crash games filter
 * Data me game_type "Crash Game" ya game_name specific crash games
 */
export default function CrashGames() {
  const games = AllData.filter((game) => {
    const name = (game.game_name || "").toLowerCase();
    const type = (game.game_type || "").toLowerCase();
    return (
      type.includes("crash") ||
      name.includes("crash") ||
      name.includes("aviator") ||
      name.includes("limbo") ||
      name.includes("hilo") ||
      name.includes("mines") ||
      name.includes("keno") ||
      name.includes("wheel")
    );
  }).slice(0, 12);

  return (
    <GameSection
      title="Crash"
      emoji="🚀"
      games={games}
      viewAllRoute="/games/crash"
    />
  );
}
