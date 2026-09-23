// src/pages/games/RecommendedPage.jsx
import { AllData } from "../../../Data/GamesData";
import GameGrid from "./GameGrid";
import PageHeader from "./PageHeader";

const dedupe = (arr) =>
  arr.filter(
    (game, i, self) =>
      i === self.findIndex((g) => g.game_name === game.game_name),
  );

export default function RecommendedPage() {
  const games = dedupe([...AllData]);

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Recommended"
          subtitle={`${games.length} games picked for you`}
          emoji="⭐"
        />
        <GameGrid games={games} emptyMessage="No recommended games available" />
      </div>
    </div>
  );
}
