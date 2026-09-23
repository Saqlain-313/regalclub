import { configureStore } from "@reduxjs/toolkit";

import adminAuthReducer from "../admin/redux/adminAuthSlice";
import depositSettingsReducer from "../admin/redux/depositSettingsSlice";
import depositsReducer from "../admin/redux/depositSlice";
import withdrawalReducer from "../admin/redux/withdrawalSlice";
import withdrawalSettingsReducer from "../admin/redux/withdrawalSettingsSlice";
import bannerReducer from "../admin/redux/bannerSlice";
import ticketTypeReducer from "../admin/redux/ticketTypeSlice";

import adminMarketReducer from "../admin/redux/adminMarketSlice";
import adminBidReducer from "../admin/redux/adminBidSlice";
import adminResultReducer from "../admin/redux/adminResultSlice";
import currencyRateReducer from "../admin/redux/currencyRateSlice";
import betAdminReducer from "../admin/redux/betAdminReducer";
import adminCommissionReducer from "../admin/redux/adminCommissionReducer";
import adminBetReducer from "../admin/redux/adminBetReducer";

// ========================================
// AUSTRALIA
// ========================================
import australiaGameCountReducer from "../admin/redux/australia/gameCountSlice";
import australiaGameEntryReducer from "../admin/redux/australia/gameEntrySlice";
import australiaPowerballResultReducer from "../admin/redux/australia/powerballResultSlice";
import australiaPowerballDivisionReducer from "../admin/redux/australia/AustraliaPowerballDivisionSlice";

// ========================================
// PAKISTAN
// ========================================
import pakistanGameCountReducer from "../admin/redux/pakistan/gameCountSlice";
import pakistanGameEntryReducer from "../admin/redux/pakistan/gameEntrySlice";
import pakistanPowerballResultReducer from "../admin/redux/pakistan/powerballResultSlice";
import pakistanPowerballDivisionReducer from "../admin/redux/pakistan/PakistanPowerballDivisionSlice";

// ========================================
// BANGLADESH
// ========================================
import bangladeshGameCountReducer from "../admin/redux/bangladesh/gameCountSlice";
import bangladeshGameEntryReducer from "../admin/redux/bangladesh/gameEntrySlice";
import bangladeshPowerballResultReducer from "../admin/redux/bangladesh/powerballResultSlice";
import bangladeshPowerballDivisionReducer from "../admin/redux/bangladesh/bangladeshPowerballDivisionSlice";

// ========================================
// INDIA
// ========================================
import indiaGameCountReducer from "../admin/redux/india/gameCountSlice";
import indiaGameEntryReducer from "../admin/redux/india/gameEntrySlice";
import indiaPowerballResultReducer from "../admin/redux/india/powerballResultSlice";
import indiaPowerballDivisionReducer from "../admin/redux/india/IndiaPowerballDivisionSlice";

// ========================================
// NEPAL
// ========================================
import nepalGameCountReducer from "../admin/redux/nepal/gameCountSlice";
import nepalGameEntryReducer from "../admin/redux/nepal/gameEntrySlice";
import nepalPowerballResultReducer from "../admin/redux/nepal/powerballResultSlice";
import nepalPowerballDivisionReducer from "../admin/redux/nepal/NepalPowerballDivisionSlice";

// ========================================
// UAE
// ========================================
import uaeGameCountReducer from "../admin/redux/uae/gameCountSlice";
import uaeGameEntryReducer from "../admin/redux/uae/gameEntrySlice";
import uaePowerballResultReducer from "../admin/redux/uae/powerballResultSlice";
import uaePowerballDivisionReducer from "../admin/redux/uae/UaePowerballDivisionSlice";

// ========================================
// OTHER ADMIN
// ========================================
import referralLevelReducer from "../admin/redux/referralLevelSlice";
import bettingBonusReducer from "../admin/redux/bettingBonusSlice";
import winMultiplierReducer from "../admin/redux/winMultiplierSlice";
import powerballDivisionReducer from "../admin/redux/powerballDivisionSlice";
import powerballResultReducer from "../admin/redux/powerballResultSlice";
import minesAdminReducer from "../admin/redux/minesAdminSlice";


// ========================================
// STORE
// ========================================
export const store = configureStore({
  reducer: {
    // ========================================
    // ADMIN
    // ========================================
    adminAuth: adminAuthReducer,
    depositSettings: depositSettingsReducer,
    deposits: depositsReducer,
    withdrawals: withdrawalReducer,
    withdrawalSettings: withdrawalSettingsReducer,
    banner: bannerReducer,
    ticketType: ticketTypeReducer,
    bettingBonus: bettingBonusReducer,

    // ========================================
    // AUSTRALIA
    // ========================================
    australiaGameCount: australiaGameCountReducer,
    australiaGameEntries: australiaGameEntryReducer,
    australiaPowerballResult: australiaPowerballResultReducer,
    australiaPowerballDivision:
      australiaPowerballDivisionReducer,

    // ========================================
    // PAKISTAN
    // ========================================
    pakistanGameCount: pakistanGameCountReducer,
    pakistanGameEntries: pakistanGameEntryReducer,
    pakistanPowerballResult:
      pakistanPowerballResultReducer,
    pakistanPowerballDivision:
      pakistanPowerballDivisionReducer,

    // ========================================
    // BANGLADESH
    // ========================================
    bangladeshGameCount: bangladeshGameCountReducer,
    bangladeshGameEntry: bangladeshGameEntryReducer,
    bangladeshPowerballResult:
      bangladeshPowerballResultReducer,
    bangladeshPowerballDivision:
      bangladeshPowerballDivisionReducer,

    // ========================================
    // INDIA
    // ========================================
    indiaGameCount: indiaGameCountReducer,
    indiaGameEntries: indiaGameEntryReducer,
    indiaPowerballResult: indiaPowerballResultReducer,
    indiaPowerballDivision:
      indiaPowerballDivisionReducer,

    // ========================================
    // NEPAL
    // ========================================
    nepalGameCount: nepalGameCountReducer,
    nepalGameEntries: nepalGameEntryReducer,
    nepalPowerballResult:
      nepalPowerballResultReducer,
    nepalPowerballDivision:
      nepalPowerballDivisionReducer,

    // ========================================
    // UAE
    // ========================================
    uaeGameCount: uaeGameCountReducer,
    uaeGameEntries: uaeGameEntryReducer,
    uaePowerballResult: uaePowerballResultReducer,
    uaePowerballDivision:
      uaePowerballDivisionReducer,

    // ========================================
    // OTHER ADMIN
    // ========================================
    adminMarket: adminMarketReducer,
    adminBid: adminBidReducer,
    adminResult: adminResultReducer,
    currencyRate: currencyRateReducer,
    referralLevel: referralLevelReducer,
    winMultiplier: winMultiplierReducer,
    powerballDivision: powerballDivisionReducer,
    powerballResult: powerballResultReducer,
    minesAdmin: minesAdminReducer,
    betAdmin: betAdminReducer,
    adminCommission: adminCommissionReducer,
    adminBet: adminBetReducer,



  },
});