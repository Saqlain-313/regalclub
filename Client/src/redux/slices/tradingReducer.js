import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

export const getPeriod = createAsyncThunk(
  "user/get-periodid",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/get-periodid?page=${page}&limit=${limit}`,
        {
          withCredentials: true,
        },
      );
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" },
      );
    }
  },
);
export const betHistory = createAsyncThunk(
  "user/bets-history",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bets-history`, {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" },
      );
    }
  },
);
export const pendingHistory = createAsyncThunk(
  "user/pending-history",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pending-history`, {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" },
      );
    }
  },
);

export const placebet = createAsyncThunk(
  "user/placeBet",
  async ({ bet, tradeType, amount, period }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/placeBet",
        { bet, tradeType, amount, period },
        {
          withCredentials: true,
        },
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" },
      );
    }
  },
);

export const getBetGrapgResult = createAsyncThunk(
  "user/get-bet-result",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/get-periodid`, {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" },
      );
    }
  },
);

// Initial state
const initialState = {
  period: null,
  betResult: null,
  allTrade: null,
  pendingResult: null,
  bet: null,
  traderhistory: null,
  loading: false,
  error: null,
  singleadmin: null,
  useraddress: null,
  userDetail: null,
  message: null,
};

// User slice
const betSlice = createSlice({
  name: "bet",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user by ID
      .addCase(getPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.period = action.payload.lastTrade;
      })
      .addCase(getPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get user by ID
      .addCase(getBetGrapgResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBetGrapgResult.fulfilled, (state, action) => {
        state.loading = false;
        state.betResult = action.payload.betResult;
        state.allTrade = action.payload.allTrade;
      })
      .addCase(getBetGrapgResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(pendingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pendingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingResult = action.payload.data;
      })
      .addCase(pendingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(placebet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placebet.fulfilled, (state, action) => {
        state.loading = false;
        state.bet = action.payload.message;
      })
      .addCase(placebet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(betHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(betHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.traderhistory = action.payload.data;
      })
      .addCase(betHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = betSlice.actions;

export default betSlice.reducer;
