// src/components/BingoSection.jsx
import { BingoGames } from "../../Data/GamesData";
import GameSection from "./GameSection";

/**
 * BingoSection — TopX Purple Theme
 * Home page ke liye
 * Mobile: 6 games | Desktop: 12 games
 */
export default function BingoSection() {
  // Dedupe by game_name (extra safety)
  const bingoGames = BingoGames.filter(
    (game, i, self) =>
      i === self.findIndex((g) => g.game_name === game.game_name),
  );

  return (
    <GameSection
      title="Bingo Games"
      emoji="🎱"
      games={bingoGames}
      viewAllRoute="/games/bingo"
      mobileLimit={6}
      desktopLimit={12}
    />
  );
}
