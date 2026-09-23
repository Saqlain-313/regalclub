// features/bet/betSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api.js"; // betSlice.js ko redux/Slices/ folder mein hi rakhna, api.js ke sath

// ==================== THUNKS ====================

// POST /api/bet -> place a bet (wingo/trx, any typeid)
export const placeBet = createAsyncThunk(
  "bet/placeBet",
  async ({ typeid, join, x, money }, { rejectWithValue }) => {
    try {
      const res = await api.post("/bet", { typeid, join, x, money });

      if (!res?.data?.status) {
        return rejectWithValue(res?.data?.message || "Bet failed");
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "Bet failed",
      );
    }
  },
);

// POST /api/order-list -> period/history list (all users, current game)
export const getOrderList = createAsyncThunk(
  "bet/getOrderList",
  async ({ typeid, pageno, pageto }, { rejectWithValue }) => {
    try {
      const res = await api.post("/order-list", { typeid, pageno, pageto });

      if (!res?.data?.status) {
        return rejectWithValue(res?.data?.message || "No data");
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "Order list failed",
      );
    }
  },
);

// POST /api/my-bets -> logged-in user's own bet history
export const getMyBets = createAsyncThunk(
  "bet/getMyBets",
  async ({ typeid, pageno, pageto }, { rejectWithValue }) => {
    try {
      const res = await api.post("/my-bets", { typeid, pageno, pageto });

      if (!res?.data?.status) {
        return rejectWithValue(res?.data?.message || "No data");
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "My bets failed",
      );
    }
  },
);

// POST /api/commission-admin -> settle all pending commissions (admin action)
export const runCommissionAdmin = createAsyncThunk(
  "bet/runCommissionAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/commission-admin", {});

      if (!res?.data?.status) {
        return rejectWithValue(res?.data?.message || "Commission run failed");
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "Commission run failed",
      );
    }
  },
);

// GET /api/commission-get -> list of users with pending commission
export const getPendingCommission = createAsyncThunk(
  "bet/getPendingCommission",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/commission-get");

      if (!res?.data?.status) {
        return rejectWithValue(res?.data?.message || "No data");
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err.message ||
          "Commission fetch failed",
      );
    }
  },
);

// ==================== SLICE ====================

const initialState = {
  // placeBet
  betLoading: false,
  betError: null,
  lastBetResult: null, // { change, money } -> updated level/wallet after bet

  // order list (all players, current game history)
  orderList: [],
  orderPeriod: null,
  orderTime: null,
  orderPage: 1,
  orderLoading: false,
  orderError: null,

  // my bets (logged-in user history)
  myBets: [],
  myBetsPage: 1,
  myBetsLoading: false,
  myBetsError: null,

  // commission (admin)
  commissionUsers: [],
  commissionLoading: false,
  commissionError: null,
  commissionRunSuccess: false,
};

const betSlice = createSlice({
  name: "bet",
  initialState,
  reducers: {
    resetBetState: (state) => {
      state.betLoading = false;
      state.betError = null;
      state.lastBetResult = null;
    },
    resetCommissionRunStatus: (state) => {
      state.commissionRunSuccess = false;
      state.commissionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- placeBet --------
      .addCase(placeBet.pending, (state) => {
        state.betLoading = true;
        state.betError = null;
      })
      .addCase(placeBet.fulfilled, (state, action) => {
        state.betLoading = false;
        state.lastBetResult = {
          change: action.payload?.change ?? null,
          money: action.payload?.money ?? 0,
        };
      })
      .addCase(placeBet.rejected, (state, action) => {
        state.betLoading = false;
        state.betError = action.payload || "Bet failed";
      })

      // -------- getOrderList --------
      .addCase(getOrderList.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(getOrderList.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.orderList = action.payload?.data?.gameslist || [];
        state.orderPeriod = action.payload?.period ?? null;
        state.orderTime = action.payload?.time ?? null;
        state.orderPage = action.payload?.page ?? 1;
      })
      .addCase(getOrderList.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.payload || "Order list failed";
        state.orderList = [];
      })

      // -------- getMyBets --------
      .addCase(getMyBets.pending, (state) => {
        state.myBetsLoading = true;
        state.myBetsError = null;
      })
      .addCase(getMyBets.fulfilled, (state, action) => {
        state.myBetsLoading = false;
        state.myBets = action.payload?.data?.gameslist || [];
        state.myBetsPage = action.payload?.page ?? 1;
      })
      .addCase(getMyBets.rejected, (state, action) => {
        state.myBetsLoading = false;
        state.myBetsError = action.payload || "My bets failed";
        state.myBets = [];
      })

      // -------- runCommissionAdmin --------
      .addCase(runCommissionAdmin.pending, (state) => {
        state.commissionLoading = true;
        state.commissionError = null;
        state.commissionRunSuccess = false;
      })
      .addCase(runCommissionAdmin.fulfilled, (state) => {
        state.commissionLoading = false;
        state.commissionRunSuccess = true;
      })
      .addCase(runCommissionAdmin.rejected, (state, action) => {
        state.commissionLoading = false;
        state.commissionError = action.payload || "Commission run failed";
        state.commissionRunSuccess = false;
      })

      // -------- getPendingCommission --------
      .addCase(getPendingCommission.pending, (state) => {
        state.commissionLoading = true;
        state.commissionError = null;
      })
      .addCase(getPendingCommission.fulfilled, (state, action) => {
        state.commissionLoading = false;
        state.commissionUsers = action.payload?.data || [];
      })
      .addCase(getPendingCommission.rejected, (state, action) => {
        state.commissionLoading = false;
        state.commissionError = action.payload || "Commission fetch failed";
        state.commissionUsers = [];
      });
  },
});

export const { resetBetState, resetCommissionRunStatus } = betSlice.actions;
export default betSlice.reducer;
