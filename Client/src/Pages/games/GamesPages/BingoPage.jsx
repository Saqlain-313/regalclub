// src/pages/games/BingoPage.jsx
import { BingoGames } from "../../../Data/GamesData";
import GameGrid from "./GameGrid";
import PageHeader from "./PageHeader";

const dedupe = (arr) =>
  arr.filter(
    (game, i, self) =>
      i === self.findIndex((g) => g.game_name === game.game_name),
  );

export default function BingoPage() {
  const games = dedupe([...BingoGames]);

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Bingo Games"
          subtitle={`${games.length} bingo games`}
          emoji="🎱"
        />
        <GameGrid games={games} emptyMessage="No bingo games available" />
      </div>
    </div>
  );
}
