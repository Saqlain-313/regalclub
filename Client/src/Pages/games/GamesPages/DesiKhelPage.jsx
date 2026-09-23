// src/pages/games/DesiKhelPage.jsx
import { AllData } from "../../../Data/GamesData";
import GameGrid from "./GameGrid";
import PageHeader from "./PageHeader";

export default function DesiKhelPage() {
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
  }).filter(
    (game, i, self) =>
      i === self.findIndex((g) => g.game_name === game.game_name),
  );

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Desi Khel"
          subtitle={`${games.length} Indian games`}
          emoji="🇮🇳"
        />
        <GameGrid
          games={games}
          emptyMessage="No desi games available right now"
        />
      </div>
    </div>
  );
}
