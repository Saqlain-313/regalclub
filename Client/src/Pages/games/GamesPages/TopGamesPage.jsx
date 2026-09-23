// src/pages/games/TopGamesPage.jsx
import { OriginalsGames } from "../../../Data/GamesData";
import GameGrid from "./GameGrid";
import PageHeader from "./PageHeader";
const dedupe = (arr) =>
  arr.filter(
    (game, i, self) =>
      i === self.findIndex((g) => g.game_name === game.game_name),
  );

export default function TopGamesPage() {
  const games = dedupe([...OriginalsGames]);

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Top Games"
          subtitle={`${games.length} top-rated games`}
          emoji="🏆"
        />
        <GameGrid games={games} emptyMessage="No top games available" />
      </div>
    </div>
  );
}
