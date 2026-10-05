import React from "react";
import { Routes, Route } from "react-router-dom";
import { Provider, useSelector } from "react-redux";

import store from "./Redux/store";

import TradeChart from "./Pages/TradeChart";
import PasswordRecovery from "./Pages/PasswordRecovery";
import Withdraw from "./Pages/Withdraw";
import Deposite from "./Pages/Deposite";
import TradePair from "./components/TradePair";
import PrivateRoute from "./PrivateRoute";
import BonusPage from "./Pages/BouncePage";
import DepositPayment from "./Pages/DepositPayment";
import SupportModal from "./Pages/Support";
import Home from "./Pages/Home";
import "./trading.css";

/* ============================================================
   TRADING APP — merged from the trading subdomain
   (lottery_regalclub) into the main site at /trading.

   Runs with its OWN Redux store (nested <Provider>), so its
   auth/bet/payment slices never collide with the main app's.
   All routes are mounted under /trading/* by the main router.
============================================================ */

const TradeApp = () => {
  return (
    <Provider store={store}>
      <div className="trade-root">
      {/* Navigation comes from the MAIN site navbar — the trading
          subdomain's own Header/MobileFooter are intentionally not
          rendered here. */}

      <Routes>
        {/* Trading home = chart */}
        <Route path="/" element={<TradeChart />} />

        {/* PROTECTED TRADE ROUTES */}
        <Route element={<PrivateRoute />}>
          <Route path="/TradeChart" element={<TradeChart />} />
          <Route path="/SideNavbar" element={<TradeChart />} />
          <Route path="/Withdraw" element={<Withdraw />} />
          <Route path="/Deposite" element={<Deposite />} />
          <Route path="/TradePair" element={<TradePair />} />
          <Route path="/bounce-page" element={<BonusPage />} />
          <Route path="/deposit-payment" element={<DepositPayment />} />
          <Route path="/support" element={<SupportModal />} />
        </Route>

        {/* PUBLIC */}
        <Route path="/PasswordRecovery" element={<PasswordRecovery />} />

        {/* Fallback — unknown trading paths go back to the chart */}
        <Route path="*" element={<Home />} />
      </Routes>

       {/* Mobile footer removed — the main site's bottom navigation is used */}

     </div>
    </Provider>
  );
};

export default TradeApp;
