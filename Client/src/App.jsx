// src/App.jsx

import { useDispatch, useSelector } from "react-redux";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

// ========================================
// Common Components
// ========================================
import Activity from "./components/Activity.jsx";
import AppInitializer from "./components/AppInitializer.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import WithdrawalHistory from "./components/WithdrawalHistory.jsx";

// ========================================
// Common Pages
// ========================================
import Deposit from "./Pages/Deposit.jsx";
import DepositHistory from "./Pages/DepositHistory.jsx";
import GameCounts from "./Pages/GameCounts.jsx";
import Homme from "./Pages/Homme.jsx";
import Login from "./Pages/Login.jsx";
import ProfilePage from "./Pages/ProfilePage.jsx";
import PromoPage from "./Pages/Promo/PromoPage.jsx";
import Register from "./Pages/Register.jsx";
import WalletDashboard from "./Pages/WalletDashboard.jsx";
import Withdrawal from "./Pages/Withdrawal.jsx";

// ========================================
// Powerhit Pages
// ========================================
import Account from "./Pages/Account.jsx";
import DepositPayment from "./Pages/DepositPayment.jsx";

// ========================================
// Game Entry Result Pages
// ========================================
import GameEntryResultDetail from "./Pages/GameEntryResultDetail.jsx";
import GameEntryResultPage from "./Pages/GameEntryResultPage.jsx";

// ========================================
// Other Pages
// ========================================
import Maintenance from "./Pages/Maintenance.jsx";

// ========================================
// Matka Pages
// ========================================
import PowerballResults from "./components/PowerballResults.jsx";
import AllResultsPage from "./Pages/Allresultspage.jsx";
import MatkaChartAnalysis from "./Pages/Matkachartanalysis.jsx";
import BidsHistory from "./Pages/user/BidsHistory.jsx";
import MatkaDashboard from "./Pages/user/Dashboard.jsx";
import MatkaMarkets from "./Pages/user/Markets.jsx";
import PlaceBid from "./Pages/user/PlaceBid.jsx";
import MatkaResults from "./Pages/user/Results.jsx";

// ========================================
// Other Components / Games
// ========================================
import ChangePassword from "./components/ChangePassword.jsx";
import GamePlayModal from "./components/GamePlayModal.jsx";

import AviatorGames from "./Pages/games/AviatorGames.jsx";
import CasinoSlotGames from "./Pages/games/CasinoGames.jsx";
import ChickenGames from "./Pages/games/ChickenGames.jsx";
import MinesPage from "./Pages/games/Mines.jsx";
import Slotgame from "./Pages/games/Slotgame.jsx";

import MarketDetailedResults from "./Pages/MarketDetailedResults.jsx";
import MinesGame from "./Pages/MinesGame.jsx";

// ========================================
// Game Category Pages
// ========================================
import AviatorPage from "./Pages/games/GamesPages/AviatorPage.jsx";
import BingoPage from "./Pages/games/GamesPages/BingoPage.jsx";
import ChickenGamesPage from "./Pages/games/GamesPages/ChickenGamesPage.jsx";
import CrashGamesPage from "./Pages/games/GamesPages/CrashGamesPage.jsx";
import DesiKhelPage from "./Pages/games/GamesPages/DesiKhelPage.jsx";
import RecommendedPage from "./Pages/games/GamesPages/RecommendedPage.jsx";
import TopGamesPage from "./Pages/games/GamesPages/TopGamesPage.jsx";
import TrendingPage from "./Pages/games/GamesPages/TrendingPage.jsx";

// ========================================
// Other Pages
// ========================================
import PowerballpublickResults from "./Pages/PowerballpublickResults.jsx";
import Wingo from "./Pages/wingo/Wingo.jsx";

// ========================================
// Redux
// ========================================
import { getProfile, logout } from "./redux/slices/authSlice.js";

import {
  checkGamecredit,
  clearGameUrl,
  resetGameState,
} from "./redux/slices/gameSlice";

// ========================================
// Toast
// ========================================
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./styles/premium-toast.css";


// ========================================
// SCROLL TO TOP
// ========================================
function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}


// ========================================
// COUNTRY POWERHIT REDIRECT
// /powerhit -> user's country
// ========================================
function CountryPowerhitRedirect() {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // ========================================
    // ADMIN KO USER SIDE PAR ALLOW NAHI KARNA
    // ========================================
    if (user?.role?.toLowerCase() === "admin") {
      return;
    }

    // ========================================
    // COUNTRY MAPPING
    // ========================================
    const countryRoutes = {
      IN: "india",
      INDIA: "india",

      AU: "australia",
      AUSTRALIA: "australia",

      PK: "pakistan",
      PAKISTAN: "pakistan",

      CA: "canada",
      CANADA: "canada",

      NP: "nepal",
      NEPAL: "nepal",

      UAE: "uae",
      AE: "uae",
      UNITEDARABEMIRATES: "uae",
    };

    const rawCountry = user?.country;

    if (!rawCountry) {
      navigate("/india/powerhit", {
        replace: true,
      });

      return;
    }

    const normalizedCountry = String(rawCountry)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    const countryPath = countryRoutes[normalizedCountry];

    if (countryPath) {
      navigate(`/${countryPath}/powerhit`, {
        replace: true,
      });
    } else {
      navigate("/india/powerhit", {
        replace: true,
      });
    }
  }, [user, navigate]);

  return null;
}


// ========================================
// GAME ROUTE CHECKER
//
// In routes ko game routes maana jayega:
//
// /game/:gameId
// /aviator
// /chicken
// /casino
// /slots
// ========================================
const isGameRoute = (path) => {
  return (
    path.startsWith("/game/") ||
    path === "/aviator" ||
    path === "/chicken" ||
    path === "/casino" ||
    path === "/slots"
  );
};


// ========================================
// APP
// ========================================
function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ========================================
  // CURRENT LOCATION
  // ========================================
  const location = useLocation();

  // ========================================
  // PREVIOUS ROUTE
  // ========================================
  const previousPathRef = useRef(location.pathname);

  const {
    isAuthenticated,
    profileLoaded,
    isProfileLoading,
    user,
  } = useSelector((state) => state.auth);


  // ========================================
  // GET USER PROFILE
  // ========================================
  useEffect(() => {
    if (
      isAuthenticated &&
      !profileLoaded &&
      !isProfileLoading
    ) {
      dispatch(getProfile());
    }
  }, [
    isAuthenticated,
    profileLoaded,
    isProfileLoading,
    dispatch,
  ]);


  // ========================================
  // REFRESH GAME BALANCE
  //
  // User:
  //
  // /game/123
  //     ↓
  // BACK
  //     ↓
  // /casino
  //
  // OR
  //
  // /casino
  //     ↓
  // BACK
  //     ↓
  // /
  //
  // Tab game state clear hoga aur balance
  // refresh hoga.
  //
  // IMPORTANT:
  // Game route -> Game route par API call nahi hogi.
  // ========================================
  useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;

    const wasGameRoute = isGameRoute(previousPath);
    const isCurrentGameRoute = isGameRoute(currentPath);

    // ========================================
    // USER GAME SECTION SE BAHAR AA GAYA
    // ========================================
    if (wasGameRoute && !isCurrentGameRoute) {
      console.log(
        "🎮 User exited game:",
        previousPath,
        "→",
        currentPath
      );

      // ========================================
      // CLEAR GAME URL
      // ========================================
      dispatch(clearGameUrl());

      // ========================================
      // RESET GAME STATE
      // ========================================
      dispatch(resetGameState());

      // ========================================
      // GET LATEST GAME BALANCE
      // ========================================
      if (isAuthenticated) {
        dispatch(checkGamecredit());
      }
    }

    // ========================================
    // CURRENT ROUTE SAVE
    // ========================================
    previousPathRef.current = currentPath;
  }, [
    location.pathname,
    dispatch,
    isAuthenticated,
  ]);


  // ========================================
  // ADMIN PROTECTION
  // ========================================
  useEffect(() => {
    const role = user?.role
      ? String(user.role).trim().toLowerCase()
      : "";

    if (role !== "admin") {
      return;
    }

    // ========================================
    // REMOVE ADMIN TOKEN
    // ========================================
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");

    // ========================================
    // REMOVE USER TOKEN
    // ========================================
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // ========================================
    // REMOVE STORED USER DATA
    // ========================================
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    // ========================================
    // REDUX LOGOUT
    // ========================================
    dispatch(logout());

    // ========================================
    // REDIRECT
    // ========================================
    navigate("/login", {
      replace: true,
    });
  }, [
    user,
    dispatch,
    navigate,
  ]);


  // ========================================
  // RENDER
  // ========================================
  return (
    <>
      <ToastContainer
        position="top-center"
        newestOnTop
        limit={3}
      />

      <ScrollToTop />

      <AppInitializer>
        <Navbar>

          <Routes>

            {/* ========================================
                PUBLIC ROUTES
            ======================================== */}

            <Route
              path="/"
              element={<Homme />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/powerball-results"
              element={<PowerballpublickResults />}
            />


            {/* ========================================
                POWERHIT DEFAULT REDIRECT
            ======================================== */}

            <Route
              path="/powerhit"
              element={
                <ProtectedRoute>
                  <CountryPowerhitRedirect />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                POWERBALL RESULT
            ======================================== */}

            <Route
              path="/powerball/result"
              element={
                <ProtectedRoute>
                  <PowerballResults />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                COUNTRY POWERHIT
            ======================================== */}

            <Route
              path="/india/powerhit"
              element={
                <ProtectedRoute>
                  <GameCounts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/australia/powerhit"
              element={
                <ProtectedRoute>
                  <GameCounts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pakistan/powerhit"
              element={
                <ProtectedRoute>
                  <GameCounts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/canada/powerhit"
              element={
                <ProtectedRoute>
                  <GameCounts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/nepal/powerhit"
              element={
                <ProtectedRoute>
                  <GameCounts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/uae/powerhit"
              element={
                <ProtectedRoute>
                  <GameCounts />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                INDIA HISTORY
            ======================================== */}

            <Route
              path="/india/powerhit/history"
              element={
                <ProtectedRoute>
                  <GameEntryResultPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/india/game-entry-result/:entryId"
              element={
                <ProtectedRoute>
                  <GameEntryResultDetail />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                GAME LIST
            ======================================== */}

            <Route
              path="/casino"
              element={
                <ProtectedRoute>
                  <CasinoSlotGames />
                </ProtectedRoute>
              }
            />

            <Route
              path="/aviator"
              element={
                <ProtectedRoute>
                  <AviatorGames />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chicken"
              element={
                <ProtectedRoute>
                  <ChickenGames />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                GAME CATEGORY
            ======================================== */}

            <Route
              path="/games/recommended"
              element={<RecommendedPage />}
            />

            <Route
              path="/games/trending"
              element={<TrendingPage />}
            />

            <Route
              path="/games/desi-khel"
              element={<DesiKhelPage />}
            />

            <Route
              path="/games/top"
              element={<TopGamesPage />}
            />

            <Route
              path="/games/crash"
              element={<CrashGamesPage />}
            />

            <Route
              path="/games/chicken"
              element={<ChickenGamesPage />}
            />

            <Route
              path="/games/aviator"
              element={<AviatorPage />}
            />

            <Route
              path="/games/bingo"
              element={<BingoPage />}
            />


            {/* ========================================
                GAME PLAY
            ======================================== */}

            <Route
              path="/game/:gameId"
              element={
                <ProtectedRoute>
                  <GamePlayModal />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                SLOT GAMES
            ======================================== */}

            <Route
              path="/slots"
              element={
                <ProtectedRoute>
                  <Slotgame />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                MINES
            ======================================== */}

            <Route
              path="/minis"
              element={
                <ProtectedRoute>
                  <MinesPage />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                AUSTRALIA HISTORY
            ======================================== */}

            <Route
              path="/australia/powerhit/history"
              element={
                <ProtectedRoute>
                  <GameEntryResultPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/australia/game-entry-result/:entryId"
              element={
                <ProtectedRoute>
                  <GameEntryResultDetail />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                PAKISTAN HISTORY
            ======================================== */}

            <Route
              path="/pakistan/powerhit/history"
              element={
                <ProtectedRoute>
                  <GameEntryResultPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pakistan/game-entry-result/:entryId"
              element={
                <ProtectedRoute>
                  <GameEntryResultDetail />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                CANADA HISTORY
            ======================================== */}

            <Route
              path="/canada/powerhit/history"
              element={
                <ProtectedRoute>
                  <GameEntryResultPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/canada/game-entry-result/:entryId"
              element={
                <ProtectedRoute>
                  <GameEntryResultDetail />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                NEPAL HISTORY
            ======================================== */}

            <Route
              path="/nepal/powerhit/history"
              element={
                <ProtectedRoute>
                  <GameEntryResultPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/nepal/game-entry-result/:entryId"
              element={
                <ProtectedRoute>
                  <GameEntryResultDetail />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                UAE HISTORY
            ======================================== */}

            <Route
              path="/uae/powerhit/history"
              element={
                <ProtectedRoute>
                  <GameEntryResultPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/uae/game-entry-result/:entryId"
              element={
                <ProtectedRoute>
                  <GameEntryResultDetail />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                PUBLIC RESULT
            ======================================== */}

            <Route
              path="/publicresult"
              element={<AllResultsPage />}
            />


            {/* ========================================
                CHART
            ======================================== */}

            <Route
              path="/chartanalysis"
              element={<MatkaChartAnalysis />}
            />

            <Route
              path="/market-results/:marketId"
              element={<MarketDetailedResults />}
            />


            {/* ========================================
                PROMO
            ======================================== */}

            <Route
              path="/promo"
              element={
                <ProtectedRoute>
                  <PromoPage />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                PROFILE
            ======================================== */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                WALLET
            ======================================== */}

            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletDashboard />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                ACTIVITY
            ======================================== */}

            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <Activity />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                WITHDRAWAL
            ======================================== */}

            <Route
              path="/withdrawal"
              element={
                <ProtectedRoute>
                  <Withdrawal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            <Route
              path="/withdrawal-history/:page?"
              element={
                <ProtectedRoute>
                  <WithdrawalHistory />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                DEPOSIT
            ======================================== */}

            <Route
              path="/deposit"
              element={
                <ProtectedRoute>
                  <Deposit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/deposit/payment"
              element={
                <ProtectedRoute>
                  <DepositPayment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/deposit-history"
              element={
                <ProtectedRoute>
                  <DepositHistory />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                ACCOUNT
            ======================================== */}

            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                MATKA DASHBOARD
            ======================================== */}

            <Route
              path="/matka"
              element={
                <ProtectedRoute>
                  <MatkaDashboard />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                MATKA MARKETS
            ======================================== */}

            <Route
              path="/matka/markets"
              element={
                <ProtectedRoute>
                  <MatkaMarkets />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                MATKA PLACE BID
            ======================================== */}

            <Route
              path="/matka/place-bid/:marketId"
              element={
                <ProtectedRoute>
                  <PlaceBid />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                MATKA BIDS HISTORY
            ======================================== */}

            <Route
              path="/matka/bids-history"
              element={
                <ProtectedRoute>
                  <BidsHistory />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                MATKA RESULTS
            ======================================== */}

            <Route
              path="/matka/results"
              element={
                <ProtectedRoute>
                  <MatkaResults />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                MINES GAME
            ======================================== */}

            <Route
              path="/mine-games"
              element={
                <ProtectedRoute>
                  <MinesGame />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                WINGO
            ======================================== */}

            <Route
              path="/wingo"
              element={
                <ProtectedRoute>
                  <Wingo />
                </ProtectedRoute>
              }
            />


            {/* ========================================
                404 / MAINTENANCE
            ======================================== */}

            <Route
              path="*"
              element={<Maintenance />}
            />

          </Routes>

        </Navbar>
      </AppInitializer>
    </>
  );
}

export default App;
