import { AllData } from "../../Data/GamesData";
import GameSection from "./GameSection";

/**
 * Desi Khel — Indian games filter (Teen Patti, Andar Bahar, etc.)
 * Data me game_name ya game_type me "india", "teen patti", "andar bahar" keywords filter
 */
export default function DesiKhel() {
  const games = AllData.filter((game) => {
    const name = (game.game_name || "").toLowerCase();
    const type = (game.game_type || "").toLowerCase();
    return (
      name.includes("teen patti") ||
      name.includes("teenpatti") ||
      name.includes("andar bahar") ||
      name.includes("indian") ||
      name.includes("ak47") ||
      name.includes("poker") ||
      type.includes("india poker")
    );
  }).slice(0, 12);

  return (
    <GameSection
      title="Desi Khel"
      emoji="🇮🇳"
      games={games}
      viewAllRoute="/games/desi-khel"
    />
  );
}
