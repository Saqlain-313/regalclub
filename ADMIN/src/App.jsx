// App.js
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import Deposits from "./admin/pages/Deposits";
import Withdrawals from "./admin/pages/Withdrawals";
import Transactions from "./admin/pages/Transactions";
import Reports from "./admin/pages/Reports";
import Notifications from "./admin/pages/Notifications";
import Settings from "./admin/pages/Settings";
import DepositSettingsAdmin from "./admin/pages/DepositSettingsAdmin";
import WithdrawalSettings from "./admin/pages/WithdrawalSettings";
import CreateWithdrawalSettings from "./admin/pages/createWithdrawalSettings";
import Banners from "./admin/pages/Banners";

import PrivateRoute from "./admin/routes/PrivateRoute";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminTicketType from "./admin/pages/AdminTicketType";

import AdminMarkets from "./admin/pages/AdminMarkets";
import AdminBids from "./admin/pages/AdminBids";
import AdminResults from "./admin/pages/AdminResults";
import AdminCurrencyRates from "./admin/pages/AdminCurrencyRates";
import AdminBets from "./admin/pages/AdminBets";

// ========================================
// AUSTRALIA
// ========================================
import AdminAustraliaGameCount from "./admin/pages/australia/AdminAustraliaGameCount";
import AdminAustraliaGameEntries from "./admin/pages/australia/AdminAustraliaGameEntries";
import AdminAustraliaPowerballResult from "./admin/pages/australia/AdminAustraliaPowerballResult";
import AdminAustraliaPowerballDivision from "./admin/pages/australia/AustraliaPowerballDivisions";

// ========================================
// PAKISTAN
// ========================================
import AdminPakistanGameCount from "./admin/pages/pakistan/AdminPakistanGameCount";
import AdminPakistanGameEntries from "./admin/pages/pakistan/AdminPakistanGameEntries";
import AdminPakistanPowerballResult from "./admin/pages/pakistan/AdminPakistanPowerballResult";
import AdminPakistanPowerballDivision from "./admin/pages/pakistan/PakistanPowerballDivisions";

// ========================================
// BANGLADESH
// ========================================
import AdminBangladeshGameCount from "./admin/pages/bangladesh/AdminGameCount";
import AdminBangladeshGameEntries from "./admin/pages/bangladesh/AdminBangladeshGameEntries";
import AdminBangladeshPowerballResult from "./admin/pages/bangladesh/AdminBangladeshPowerballResult";
import AdminBangladeshPowerballDivision from "./admin/pages/bangladesh/BangladeshPowerballDivisions";

// ========================================
// INDIA
// ========================================
import AdminIndiaGameCount from "./admin/pages/india/AdminIndiaGameCount";
import AdminIndiaGameEntries from "./admin/pages/india/AdminIndiaGameEntries";
import AdminIndiaPowerballResult from "./admin/pages/india/AdminIndiaPowerballResult";
import AdminIndiaPowerballDivision from "./admin/pages/india/IndiaPowerballDivisions";

// ========================================
// NEPAL
// ========================================
import AdminNepalGameCount from "./admin/pages/nepal/AdminNepalGameCount";
import AdminNepalGameEntries from "./admin/pages/nepal/AdminNepalGameEntries";
import AdminNepalPowerballResult from "./admin/pages/nepal/AdminNepalPowerballResult";
import AdminNepalPowerballDivision from "./admin/pages/nepal/NepalPowerballDivisions";

// ========================================
// UAE
// ========================================
import AdminUAEGameCount from "./admin/pages/uae/AdminUAEGameCount";
import AdminUAEGameEntries from "./admin/pages/uae/AdminUAEGameEntries";
import AdminUAEPowerballResult from "./admin/pages/uae/AdminUAEPowerballResult";
import AdminUAEPowerballDivision from "./admin/pages/uae/UaePowerballDivisions";

import ReferralLevels from "./admin/pages/ReferralLevels";
import AdminBettingBonus from "./admin/pages/AdminBettingBonus";
import AdminWinMultipliers from "./admin/pages/AdminWinMultipliers";
import MinesAdmin from "./admin/pages/MinesAdmin";
import BetAdmin from "./admin/pages/BetAdmin";
import AdminCommission from "./admin/pages/AdminCommission";

function App() {
  return (
    <Routes>
      {/* ========================================
          ROOT
      ======================================== */}
      <Route
        path="/"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />

      {/* ========================================
          LOGIN
      ======================================== */}
      <Route
        path="/admin/login"
        element={<Login />}
      />

      {/* ========================================
          PRIVATE ADMIN ROUTES
      ======================================== */}
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>

          {/* ========================================
              GENERAL ADMIN
          ======================================== */}
          <Route
            path="/admin/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/admin/users"
            element={<Users />}
          />

          <Route
            path="/admin/deposits"
            element={<Deposits />}
          />

          <Route
            path="/admin/withdrawals"
            element={<Withdrawals />}
          />

          <Route
            path="/admin/transactions"
            element={<Transactions />}
          />

          <Route
            path="/admin/reports"
            element={<Reports />}
          />

          <Route
            path="/admin/notifications"
            element={<Notifications />}
          />

          <Route
            path="/admin/settings"
            element={<Settings />}
          />

          <Route
            path="/admin/ticketsetiings"
            element={<AdminTicketType />}
          />

          <Route
            path="/admin/deposit-settings"
            element={<DepositSettingsAdmin />}
          />

          <Route
            path="/admin/withdrawal-settings"
            element={<WithdrawalSettings />}
          />

          <Route
            path="/admin/withdrawal-settings/create"
            element={<CreateWithdrawalSettings />}
          />

          <Route
            path="/admin/currency-rates"
            element={<AdminCurrencyRates />}
          />

          <Route
            path="/admin/banners"
            element={<Banners />}
          />

          <Route
            path="/admin/markets"
            element={<AdminMarkets />}
          />

          <Route
            path="/admin/bids"
            element={<AdminBids />}
          />

          <Route
            path="/admin/results"
            element={<AdminResults />}
          />

          {/* ========================================
              AUSTRALIA - POWERBALL RESULT
          ======================================== */}
          <Route
            path="/admin/australia/powerball-result"
            element={<AdminAustraliaPowerballResult />}
          />

          {/* ========================================
              PAKISTAN - POWERBALL RESULT
          ======================================== */}
          <Route
            path="/admin/pakistan/powerball-result"
            element={<AdminPakistanPowerballResult />}
          />

          {/* ========================================
              BANGLADESH - POWERBALL RESULT
          ======================================== */}
          <Route
            path="/admin/bangladesh/powerball-result"
            element={<AdminBangladeshPowerballResult />}
          />

          {/* ========================================
              INDIA - POWERBALL RESULT
          ======================================== */}
          <Route
            path="/admin/india/powerball-result"
            element={<AdminIndiaPowerballResult />}
          />

          {/* ========================================
              NEPAL - POWERBALL RESULT
          ======================================== */}
          <Route
            path="/admin/nepal/powerball-result"
            element={<AdminNepalPowerballResult />}
          />

          {/* ========================================
              UAE - POWERBALL RESULT
          ======================================== */}
          <Route
            path="/admin/uae/powerball-result"
            element={<AdminUAEPowerballResult />}
          />

          {/* ========================================
              POWERBALL DIVISIONS
          ======================================== */}

          <Route
            path="/admin/australia/powerball-divisions"
            element={<AdminAustraliaPowerballDivision />}
          />

          <Route
            path="/admin/pakistan/powerball-divisions"
            element={<AdminPakistanPowerballDivision />}
          />

          <Route
            path="/admin/bangladesh/powerball-divisions"
            element={<AdminBangladeshPowerballDivision />}
          />

          <Route
            path="/admin/india/powerball-divisions"
            element={<AdminIndiaPowerballDivision />}
          />

          <Route
            path="/admin/nepal/powerball-divisions"
            element={<AdminNepalPowerballDivision />}
          />

          <Route
            path="/admin/uae/powerball-divisions"
            element={<AdminUAEPowerballDivision />}
          />

          {/* ========================================
              GAME COUNTS
          ======================================== */}

          <Route
            path="/admin/australia/gamecounts"
            element={<AdminAustraliaGameCount />}
          />

          <Route
            path="/admin/pakistan/gamecounts"
            element={<AdminPakistanGameCount />}
          />

          <Route
            path="/admin/bangladesh/gamecounts"
            element={<AdminBangladeshGameCount />}
          />

          <Route
            path="/admin/india/gamecounts"
            element={<AdminIndiaGameCount />}
          />

          <Route
            path="/admin/nepal/gamecounts"
            element={<AdminNepalGameCount />}
          />

          <Route
            path="/admin/uae/gamecounts"
            element={<AdminUAEGameCount />}
          />

          {/* ========================================
              GAME ENTRIES
          ======================================== */}

          <Route
            path="/admin/australia/gameEntries"
            element={<AdminAustraliaGameEntries />}
          />

          <Route
            path="/admin/pakistan/gameEntries"
            element={<AdminPakistanGameEntries />}
          />

          <Route
            path="/admin/bangladesh/gameEntries"
            element={<AdminBangladeshGameEntries />}
          />

          <Route
            path="/admin/india/gameEntries"
            element={<AdminIndiaGameEntries />}
          />

          <Route
            path="/admin/nepal/gameEntries"
            element={<AdminNepalGameEntries />}
          />

          <Route
            path="/admin/uae/gameEntries"
            element={<AdminUAEGameEntries />}
          />

          {/* ========================================
              OTHER ADMIN
          ======================================== */}

          <Route
            path="/admin/referral-levels"
            element={<ReferralLevels />}
          />

          <Route
            path="/admin/wingo-commission"
            element={<AdminCommission />}
          />

          <Route
            path="/admin/admin-wingo-bets"
            element={<AdminBets />}
          />

          <Route
            path="/admin/betting-bonus"
            element={<AdminBettingBonus />}
          />

          <Route
            path="/admin/win-multipliers"
            element={<AdminWinMultipliers />}
          />

          <Route
            path="/admin/mines"
            element={<MinesAdmin />}
          />
          <Route
            path="/admin/bet-admin"
            element={<BetAdmin />}
          />

        </Route>
      </Route>
    </Routes>
  );
}

export default App;