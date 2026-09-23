// src/pages/games/CrashGamesPage.jsx
import { AllData } from "../../../Data/GamesData";
import GameGrid from "./GameGrid";
import PageHeader from "./PageHeader";

export default function CrashGamesPage() {
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
  }).filter(
    (game, i, self) =>
      i === self.findIndex((g) => g.game_name === game.game_name),
  );

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Crash Games"
          subtitle={`${games.length} crash games`}
          emoji="🚀"
        />
        <GameGrid games={games} emptyMessage="No crash games available" />
      </div>
    </div>
  );
}
