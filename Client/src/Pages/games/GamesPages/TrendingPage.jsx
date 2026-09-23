// src/pages/games/TrendingPage.jsx
import { Hotgame } from "../../../Data/GamesData";
import GameGrid from "./GameGrid";
import PageHeader from "./PageHeader";

const dedupe = (arr) =>
  arr.filter(
    (game, i, self) =>
      i === self.findIndex((g) => g.game_name === game.game_name),
  );

export default function TrendingPage() {
  const games = dedupe([...Hotgame]);

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Trending"
          subtitle={`${games.length} hot games right now`}
          emoji="🔥"
        />
        <GameGrid games={games} emptyMessage="No trending games available" />
      </div>
    </div>
  );
}
