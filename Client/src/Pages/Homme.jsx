import CasinoSlotGames from "../components/CasinoSlotGames";
import CountriesSection from "../components/CountriesSection";
import FeatureBar from "../components/FeatureBar";
import Herosection from "../components/Herosection";
import PopularGames from "../components/PopularGames";
import StatsSection2 from "../components/StatsSection2";
import TopWinners from "../components/TopWinners";
import Footer from "../Pages/Footer";
import AviatorSection from "./games/AviatorSection";
import CasinoSection from "./games/CasinoSection";
// import ChickenGamesSection from "./games/ChickenGamesSection";
import BingoSection from "./games/BingoSection";
import CrashGames from "./games/CrashGames";
import DesiKhel from "./games/DesiKhel";
import RecommendedGames from "./games/RecommendedGames";
import TopGames from "./games/TopGames";
import TrendingGames from "./games/TrendingGames";
import PopularGamesCards from "./PopularGamesCards";

const Homme = () => {
  return (
    <main className="pb-11 md:pb-0">
      <Herosection />
      {/* <StatsSection /> */}
      <PopularGamesCards />
      <CasinoSlotGames />
      <RecommendedGames />
      <AviatorSection />
      <BingoSection />
      <TrendingGames />
      <DesiKhel />
      <TopGames />
      <CrashGames />
      {/* <ChickenGamesSection /> */}
      <CasinoSection />
      {/* <PublicBidResults /> */}
      <PopularGames />
      {/* <PowerballPublicResult /> */}
      <FeatureBar />
      <TopWinners />
      <StatsSection2 />
      <CountriesSection />
      <Footer />
    </main>
  );
};

export default Homme;
