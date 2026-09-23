// src/pages/games/ChickenGamesPage.jsx
import { AllData } from "../../../Data/GamesData";
import GameGrid from "./GameGrid";
import PageHeader from "./PageHeader";

export default function ChickenGamesPage() {
  const games = AllData.filter((game) => {
    const name = (game.game_name || "").toLowerCase();
    return (
      name.includes("chicken") ||
      name.includes("road") ||
      name.includes("cross")
    );
  }).filter(
    (game, i, self) =>
      i === self.findIndex((g) => g.game_name === game.game_name),
  );

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Chicken Games"
          subtitle={`${games.length} chicken games`}
          emoji="🐔"
        />
        <GameGrid
          games={games}
          emptyMessage="No chicken games available yet — coming soon!"
        />
      </div>
    </div>
  );
}
