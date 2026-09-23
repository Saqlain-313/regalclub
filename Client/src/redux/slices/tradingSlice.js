// tradingSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// =====================================================
// CREATE ROUND
// =====================================================

export const createTradingRound = createAsyncThunk(
  "trading/createRound",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/trading/round/create");
      return response.data.round;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create round",
      );
    }
  },
);

// =====================================================
// GET CURRENT ROUND
// =====================================================

export const getCurrentTradingRound = createAsyncThunk(
  "trading/getCurrentRound",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/trading/round/current");
      return response.data.round;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "No active round",
      );
    }
  },
);

// =====================================================
// COMPLETE ROUND
// =====================================================

export const completeTradingRound = createAsyncThunk(
  "trading/completeRound",
  async (roundId, { rejectWithValue }) => {
    try {
      const response = await api.post("/trading/round/complete", {
        roundId,
      });
      return response.data.round;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to complete round",
      );
    }
  },
);

// =====================================================
// ✅ GET MY ACTIVE TRADE (ADD THIS)
// =====================================================

export const getMyActiveTrade = createAsyncThunk(
  "trading/getMyActiveTrade",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/trading/trade/active");
      return response.data.trade;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "No active trade",
      );
    }
  },
);

// =====================================================
// ✅ PLACE TRADING TRADE (ADD THIS)
// =====================================================

export const placeTradingTrade = createAsyncThunk(
  "trading/placeTrade",
  async ({ roundId, amount, direction }, { rejectWithValue }) => {
    try {
      const response = await api.post("/trading/trade/place", {
        roundId,
        amount,
        direction,
      });
      return response.data.trade;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to place trade",
      );
    }
  },
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  round: null,
  roundId: null,
  startValue: 0,
  currentValue: 0,
  finalValue: null,
  previousValue: 0,
  direction: "same",
  endsAt: null,
  status: "idle",
  loading: false,
  error: null,
  connected: false,

  // ✅ Add these for trading
  tradeLoading: false,
  tradeError: null,
  activeTrade: null,
};

// =====================================================
// SLICE
// =====================================================

const tradingSlice = createSlice({
  name: "trading",
  initialState,
  reducers: {
    // ===============================================
    // SOCKET CONNECTED
    // ===============================================
    socketConnected: (state) => {
      state.connected = true;
    },

    // ===============================================
    // SOCKET DISCONNECTED
    // ===============================================
    socketDisconnected: (state) => {
      state.connected = false;
    },

    // ===============================================
    // SOCKET ROUND RECEIVED
    // ===============================================
    socketRoundReceived: (state, action) => {
      const round = action.payload;
      if (!round) return;

      state.round = round;
      state.roundId = round.roundId ?? round._id ?? null;
      state.startValue = Number(round.startValue ?? 0);
      state.currentValue = Number(round.currentValue ?? round.startValue ?? 0);
      state.previousValue = Number(round.currentValue ?? round.startValue ?? 0);
      state.finalValue = round.finalValue ?? null;
      state.endsAt = round.endsAt ?? null;
      state.status = round.status ?? "active";
      state.direction = "same";
    },

    // ===============================================
    // SOCKET VALUE RECEIVED
    // ===============================================
    socketValueReceived: (state, action) => {
      const data = action.payload;
      if (!data) return;

      state.previousValue = Number(
        data.previousValue ?? state.currentValue ?? 0,
      );
      state.currentValue = Number(data.value ?? state.currentValue ?? 0);
      state.direction = data.direction ?? "same";
      state.roundId = data.roundId ?? state.roundId;
      state.endsAt = data.endsAt ?? state.endsAt;
      state.status = "active";
    },

    // ===============================================
    // SOCKET ROUND COMPLETED
    // ===============================================
    socketRoundCompleted: (state, action) => {
      const data = action.payload;
      if (!data) return;

      state.finalValue = Number(data.finalValue ?? 0);
      state.currentValue = Number(data.finalValue ?? 0);
      state.status = "completed";

      if (state.round) {
        state.round.finalValue = data.finalValue;
        state.round.status = "completed";
      }
    },

    // ===============================================
    // CLEAR ERROR
    // ===============================================
    clearTradingError: (state) => {
      state.error = null;
      state.tradeError = null;
    },

    // ===============================================
    // RESET
    // ===============================================
    resetTrading: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // =============================================
      // CREATE ROUND
      // =============================================
      .addCase(createTradingRound.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTradingRound.fulfilled, (state, action) => {
        state.loading = false;
        const round = action.payload;
        if (!round) return;

        state.round = round;
        state.roundId = round.roundId ?? round._id ?? null;
        state.startValue = Number(round.startValue ?? 0);
        state.currentValue = Number(
          round.currentValue ?? round.startValue ?? 0,
        );
        state.previousValue = Number(
          round.currentValue ?? round.startValue ?? 0,
        );
        state.finalValue = round.finalValue ?? null;
        state.endsAt = round.endsAt ?? null;
        state.status = round.status ?? "active";
        state.direction = "same";
      })
      .addCase(createTradingRound.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create round";
      })

      // =============================================
      // GET CURRENT ROUND
      // =============================================
      .addCase(getCurrentTradingRound.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentTradingRound.fulfilled, (state, action) => {
        state.loading = false;
        const round = action.payload;
        if (!round) return;

        state.round = round;
        state.roundId = round.roundId ?? round._id ?? null;
        state.startValue = Number(round.startValue ?? 0);
        state.currentValue = Number(
          round.currentValue ?? round.startValue ?? 0,
        );
        state.previousValue = Number(
          round.currentValue ?? round.startValue ?? 0,
        );
        state.finalValue = round.finalValue ?? null;
        state.endsAt = round.endsAt ?? null;
        state.status = round.status ?? "active";
        state.direction = "same";
      })
      .addCase(getCurrentTradingRound.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Round not found";
      })

      // =============================================
      // COMPLETE ROUND
      // =============================================
      .addCase(completeTradingRound.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTradingRound.fulfilled, (state, action) => {
        state.loading = false;
        const round = action.payload;
        if (!round) return;

        state.round = round;
        state.roundId = round.roundId ?? round._id ?? state.roundId;
        state.finalValue = Number(round.finalValue ?? 0);
        state.currentValue = Number(round.finalValue ?? 0);
        state.status = "completed";
        state.direction = "same";
      })
      .addCase(completeTradingRound.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to complete round";
      })

      // =============================================
      // ✅ GET MY ACTIVE TRADE
      // =============================================
      .addCase(getMyActiveTrade.pending, (state) => {
        state.tradeLoading = true;
        state.tradeError = null;
      })
      .addCase(getMyActiveTrade.fulfilled, (state, action) => {
        state.tradeLoading = false;
        state.activeTrade = action.payload || null;
      })
      .addCase(getMyActiveTrade.rejected, (state, action) => {
        state.tradeLoading = false;
        state.activeTrade = null;
        state.tradeError = action.payload || "Failed to get active trade";
      })

      // =============================================
      // ✅ PLACE TRADING TRADE
      // =============================================
      .addCase(placeTradingTrade.pending, (state) => {
        state.tradeLoading = true;
        state.tradeError = null;
      })
      .addCase(placeTradingTrade.fulfilled, (state, action) => {
        state.tradeLoading = false;
        state.activeTrade = action.payload || null;
      })
      .addCase(placeTradingTrade.rejected, (state, action) => {
        state.tradeLoading = false;
        state.tradeError = action.payload || "Failed to place trade";
      });
  },
});

// =====================================================
// ✅ ACTIONS
// =====================================================

export const {
  socketConnected,
  socketDisconnected,
  socketRoundReceived,
  socketValueReceived,
  socketRoundCompleted,
  clearTradingError,
  resetTrading,
} = tradingSlice.actions;

// =====================================================
// ✅ SELECTORS
// =====================================================

export const selectTrading = (state) => state.trading;
export const selectTradingRound = (state) => state.trading.round;
export const selectTradingCurrentValue = (state) => state.trading.currentValue;
export const selectTradingDirection = (state) => state.trading.direction;
export const selectTradingConnected = (state) => state.trading.connected;
export const selectTradingLoading = (state) => state.trading.loading;
export const selectTradingError = (state) => state.trading.error;
export const selectTradeLoading = (state) => state.trading.tradeLoading;
export const selectTradeError = (state) => state.trading.tradeError;
export const selectActiveTrade = (state) => state.trading.activeTrade;

// =====================================================
// ✅ REDUCER
// =====================================================

export default tradingSlice.reducer;
