// src/pages/games/AviatorPage.jsx
import { AllData, OriginalsGames, SlotsGames } from "../../../Data/GamesData";
import GameGrid from "./GameGrid";
import PageHeader from "./PageHeader";

export default function AviatorPage() {
  const allSources = [...SlotsGames, ...OriginalsGames, ...AllData];

  const games = allSources
    .filter((game) => {
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
    })
    .filter(
      (game, i, self) =>
        i === self.findIndex((g) => g.game_name === game.game_name),
    );

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Aviator Games"
          subtitle={`${games.length} aviator & crash games`}
          emoji="✈️"
        />
        <GameGrid games={games} emptyMessage="No aviator games available" />
      </div>
    </div>
  );
}
