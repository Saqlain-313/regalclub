import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// =====================================================
// GET ADMIN BETS
// =====================================================
export const getAdminBets = createAsyncThunk(
  "adminBet/getAdminBets",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/bets-admin", {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          game: params.game || "all",
          status:
            params.status !== undefined
              ? params.status
              : "all",
          bet: params.bet || "all",
          mobile: params.mobile || "",
          period: params.period || "",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message:
            error.message || "Failed to fetch admin bets",
          status: false,
        }
      );
    }
  }
);

const initialState = {
  bets: [],

  loading: false,
  error: null,

  message: "",

  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },

  stats: {
    totalBets: 0,
    totalBetAmount: 0,
    totalFee: 0,
    totalWinningAmount: 0,
    pendingBets: 0,
    wonBets: 0,
    lostBets: 0,
  },

  filters: {
    game: "all",
    status: "all",
    bet: "all",
    mobile: "",
    period: "",
  },
};

const adminBetSlice = createSlice({
  name: "adminBet",
  initialState,

  reducers: {
    setBetFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    clearBetFilters: (state) => {
      state.filters = {
        game: "all",
        status: "all",
        bet: "all",
        mobile: "",
        period: "",
      };
    },

    clearBetError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // GET BETS - PENDING
      // =================================================
      .addCase(getAdminBets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // =================================================
      // GET BETS - SUCCESS
      // =================================================
      .addCase(getAdminBets.fulfilled, (state, action) => {
        state.loading = false;

        state.bets = action.payload?.data || [];

        state.pagination =
          action.payload?.pagination ||
          state.pagination;

        state.stats = {
          ...state.stats,
          ...(action.payload?.stats || {}),
        };

        state.message =
          action.payload?.message || "";

        state.error = null;
      })

      // =================================================
      // GET BETS - ERROR
      // =================================================
      .addCase(getAdminBets.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload?.message ||
          "Failed to fetch admin bets";

        state.bets = [];
      });
  },
});

export const {
  setBetFilters,
  clearBetFilters,
  clearBetError,
} = adminBetSlice.actions;

export default adminBetSlice.reducer;
