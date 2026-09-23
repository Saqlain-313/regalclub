// store.js
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import bannerReducer from "./slices/bannerSlice";
import betReducer from "./slices/betSlice";
import currencyRateReducer from "./slices/currencyRateSlice";
import dailyClaimReducer from "./slices/dailyClaimSlice";
import depositReducer from "./slices/depositSlice";
import ticketTypeReducer from "./slices/ticketTypeSlice";
import withdrawalReducer from "./slices/withdrawalSlice";
import gameReducer from './slices/gameSlice'

// ========================================
// AUSTRALIA
// ========================================
import australiaGameCountReducer from "./slices/australia/gameCountSlice";
import australiaGameEntryReducer from "./slices/australia/gameEntrySlice";

// ========================================
// PAKISTAN
// ========================================
import pakistanGameCountReducer from "./slices/pakistan/gameCountSlice";
import pakistanGameEntryReducer from "./slices/pakistan/gameEntrySlice";

// ========================================
// BANGLADESH
// ========================================
import bangladeshGameCountReducer from "./slices/bangladesh/gameCountSlice";
import bangladeshGameEntryReducer from "./slices/bangladesh/gameEntrySlice";

// ========================================
// INDIA
// ========================================
import indiaGameCountReducer from "./slices/india/gameCountSlice";
import indiaGameEntryReducer from "./slices/india/gameEntrySlice";

// ========================================
// NEPAL
// ========================================
import nepalGameCountReducer from "./slices/nepal/gameCountSlice";
import nepalGameEntryReducer from "./slices/nepal/gameEntrySlice";

// ========================================
// UAE
// ========================================
import uaeGameCountReducer from "./slices/uae/gameCountSlice";
import uaeGameEntryReducer from "./slices/uae/gameEntrySlice";

// ========================================
// MATKA SLICES
// ========================================
import bidReducer from "./slices/bidSlice";
import marketReducer from "./slices/marketSlice";
import mineGameReducer from "./slices/mineGameSlice";
import minesReducer from "./slices/minesSlice";
import powerballResultReducer from "./slices/powerballResultSlice";
import publicBidReducer from "./slices/publicBidSlice";
import publicmatkaResultReducer from "./slices/publicmatkaResult";
import referralLevelReducer from "./slices/referralLevelSlice";
import resultReducer from "./slices/resultSlice";
import tradingReducer from "./slices/tradingReducer";

export const store = configureStore({
  reducer: {
    // ========================================
    // COMMON USER
    // ========================================
    auth: authReducer,
    dailyClaim: dailyClaimReducer,
    withdrawal: withdrawalReducer,
    deposit: depositReducer,
    banner: bannerReducer,
    ticketType: ticketTypeReducer,
    mineGame: mineGameReducer,
    currencyRate: currencyRateReducer,
    mines: minesReducer,
    bet: betReducer,
    trading: tradingReducer,
    publicmatkaResult: publicmatkaResultReducer,
    referralLevel: referralLevelReducer,
    // ========================================
    // AUSTRALIA
    // ========================================
    australiaGameCount: australiaGameCountReducer,
    australiaGameEntry: australiaGameEntryReducer,

    // ========================================
    // PAKISTAN
    // ========================================
    pakistanGameCount: pakistanGameCountReducer,
    pakistanGameEntry: pakistanGameEntryReducer,

    // ========================================
    // BANGLADESH
    // ========================================
    bangladeshGameCount: bangladeshGameCountReducer,
    bangladeshGameEntry: bangladeshGameEntryReducer,

    // ========================================
    // INDIA
    // ========================================
    indiaGameCount: indiaGameCountReducer,
    indiaGameEntry: indiaGameEntryReducer,

    // ========================================
    // NEPAL
    // ========================================
    nepalGameCount: nepalGameCountReducer,
    nepalGameEntry: nepalGameEntryReducer,

    // ========================================
    // UAE
    // ========================================
    uaeGameCount: uaeGameCountReducer,
    uaeGameEntry: uaeGameEntryReducer,

    // ========================================
    // MATKA
    // ========================================
    market: marketReducer,
    bid: bidReducer,
    result: resultReducer,
    publicBid: publicBidReducer,
    powerballResult: powerballResultReducer,
    game: gameReducer,

  },
});

export default store;
