import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// =====================================================
// ERROR HANDLER
// =====================================================

const handleError = (error, fallback) =>
  error.response?.data || {
    success: false,
    message: error.message || fallback,
  };

// =====================================================
// GET ALL BETS
// =====================================================

export const getAllBet = createAsyncThunk(
  "betAdmin/getAllBet",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/bet-admin/allBet", {
        params,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to get bets")
      );
    }
  }
);

// =====================================================
// GET COMPLETED / WON / LOST BETS
// =====================================================

export const getBetList = createAsyncThunk(
  "betAdmin/getBetList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/bet-admin/betlist", {
        params,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to get bet list")
      );
    }
  }
);

// =====================================================
// GET PENDING BETS
// =====================================================

export const getPendingBetList = createAsyncThunk(
  "betAdmin/getPendingBetList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(
        "/admin/bet-admin/pendingBetlist",
        {
          params,
        }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to get pending bets")
      );
    }
  }
);

// =====================================================
// GET BETS OF PARTICULAR USER
// =====================================================

export const getUserBet = createAsyncThunk(
  "betAdmin/getUserBet",
  async ({ userId, ...params }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/admin/bet-admin/admin/userBet",
        { userId },
        {
          params,
        }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to get user bets")
      );
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  allBet: [],
  betList: [],
  pendingBetList: [],
  userBet: [],

  allBetLength: 0,
  betListLength: 0,
  pendingBetLength: 0,
  userBetLength: 0,

  totalMoney: 0,
  totalMoneyDown: 0,
  totalMoneyUp: 0,

  loading: false,
  error: null,
  success: false,
};

// =====================================================
// SLICE
// =====================================================

const betAdminSlice = createSlice({
  name: "betAdmin",

  initialState,

  reducers: {
    clearBetError: (state) => {
      state.error = null;
    },

    clearBetData: (state) => {
      state.allBet = [];
      state.betList = [];
      state.pendingBetList = [];
      state.userBet = [];

      state.allBetLength = 0;
      state.betListLength = 0;
      state.pendingBetLength = 0;
      state.userBetLength = 0;

      state.totalMoney = 0;
      state.totalMoneyDown = 0;
      state.totalMoneyUp = 0;

      state.error = null;
      state.success = false;
    },
  },

  // ===================================================
  // EXTRA REDUCERS
  // ===================================================

  extraReducers: (builder) => {
    builder

      // =================================================
      // ALL BET
      // =================================================

      .addCase(getAllBet.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(getAllBet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.allBet = action.payload?.data || [];
        state.allBetLength = action.payload?.length || 0;
      })

      .addCase(getAllBet.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload?.message ||
          "Failed to get bets";
      })

      // =================================================
      // BET LIST
      // =================================================

      .addCase(getBetList.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(getBetList.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.betList = action.payload?.data || [];
        state.betListLength =
          action.payload?.length || 0;
      })

      .addCase(getBetList.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload?.message ||
          "Failed to get bet list";
      })

      // =================================================
      // PENDING BET LIST
      // =================================================

      .addCase(getPendingBetList.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(
        getPendingBetList.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.pendingBetList =
            action.payload?.data || [];

          state.pendingBetLength =
            action.payload?.length || 0;

          state.totalMoney =
            action.payload?.totalMoney || 0;

          state.totalMoneyDown =
            action.payload?.totalMoneyDown || 0;

          state.totalMoneyUp =
            action.payload?.totalMoneyUp || 0;
        }
      )

      .addCase(
        getPendingBetList.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;

          state.error =
            action.payload?.message ||
            "Failed to get pending bets";
        }
      )

      // =================================================
      // USER BET
      // =================================================

      .addCase(getUserBet.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(getUserBet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.userBet = action.payload?.data || [];

        state.userBetLength =
          action.payload?.length || 0;
      })

      .addCase(getUserBet.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload?.message ||
          "Failed to get user bets";
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  clearBetError,
  clearBetData,
} = betAdminSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default betAdminSlice.reducer;