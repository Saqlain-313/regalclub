import CountriesSection from "../components/CountriesSection";
import FeatureBar from "../components/FeatureBar";
import Herosection from "../components/Herosection";
import PopularGames from "../components/PopularGames";
import StatsSection2 from "../components/StatsSection2";
import TopWinners from "../components/TopWinners";
import Footer from "../Pages/Footer";

import AviatorGames from "../Pages/games/AviatorGames.jsx";
import CasinoSlotGames from "../Pages/games/CasinoGames.jsx";
import ChickenGames from "../Pages/games/ChickenGames.jsx";
import MinesPage from "../Pages/games/Mines.jsx";
import Slotgame from "../Pages/games/Slotgame.jsx";

import PopularGamesCards from "./PopularGamesCards";

const Homme = () => {
  return (
    <main className="pb-11 md:pb-0">
      <Herosection />

      <PopularGamesCards />

      {/* Games Sections */}
      <AviatorGames />
      <ChickenGames />
      <MinesPage />
      <CasinoSlotGames
        isHome={true}
        limit={6}
        showViewAll={true}
        showSearch={false}
      />

      <Slotgame />
      <PopularGames />

      {/* Other Sections */}
      <FeatureBar />

      <TopWinners />

      <StatsSection2 />

      <CountriesSection />

      <Footer />
    </main>
  );
};

export default Homme;
