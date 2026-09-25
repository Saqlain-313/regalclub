// Homme.jsx
import CountriesSection from "../components/CountriesSection";
import FeatureBar from "../components/FeatureBar";
import Herosection from "../components/Herosection";
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

      {/* ✅ isHome={true} pass karein taaki modal auto-open na ho */}
      <ChickenGames isHome={true} />
      <MinesPage isHome={true} />
      <AviatorGames isHome={true} />
      <CasinoSlotGames isHome={true} limit={6} showViewAll={true} showSearch={false} />
      <Slotgame isHome={true} />

      <FeatureBar />
      <TopWinners />
      <StatsSection2 />
      <CountriesSection />
      <Footer />
    </main>
  );
};

export default Homme;