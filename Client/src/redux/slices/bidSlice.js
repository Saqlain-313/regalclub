import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// Place a bid
export const placeBid = createAsyncThunk(
  "bid/place",
  async (bidData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.post(`/bids/place`, bidData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to place bid" },
      );
    }
  },
);

// Get user's bidding history
export const getBiddingHistory = createAsyncThunk(
  "bid/getHistory",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/bids/history`, {
        params,
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get bidding history" },
      );
    }
  },
);

// Get today's bids summary
export const getTodayBidsSummary = createAsyncThunk(
  "bid/getTodaySummary",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/bids/today-summary`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get today summary" },
      );
    }
  },
);

// Cancel bid
export const cancelBid = createAsyncThunk(
  "bid/cancel",
  async (bidId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.delete(`/bids/${bidId}/cancel`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to cancel bid" },
      );
    }
  },
);

// Get bid by ID
export const getBidById = createAsyncThunk(
  "bid/getById",
  async (bidId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/bids/${bidId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to get bid details" },
      );
    }
  },
);

// ================= INITIAL STATE =================
const initialState = {
  bids: [], // ✅ Array of bids
  currentBid: null, // Single bid details
  todaySummary: null, // Today's summary
  loading: false, // ✅ Changed from isLoading
  error: null, // ✅ Changed from isError
  message: "", // Success/error message
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  stats: {
    summary: [],
    gameTypeSummary: [],
  },
};

// ================= SLICE =================
const bidSlice = createSlice({
  name: "bid",
  initialState,
  reducers: {
    clearBidError: (state) => {
      state.error = null;
      state.message = "";
    },
    clearBidMessage: (state) => {
      state.message = "";
    },
    clearCurrentBid: (state) => {
      state.currentBid = null;
    },
    resetBidState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ========== PLACE BID ==========
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBid = action.payload?.data?.bid || null;
        state.error = null;
        state.message = action.payload?.message || "Bid placed successfully";
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to place bid";
        state.message = "";
      })

      // ========== GET BIDDING HISTORY ==========
      .addCase(getBiddingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBiddingHistory.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ FIX: Properly extract data from response
        const responseData = action.payload?.data || {};

        // Ensure bids is always an array
        state.bids = Array.isArray(responseData.bids) ? responseData.bids : [];

        // Set pagination
        state.pagination = responseData.pagination || {
          page: 1,
          limit: 10,
          total: state.bids.length,
          pages: Math.ceil(state.bids.length / 10) || 1,
        };

        // Set stats if available
        if (responseData.summary) {
          state.stats.summary = responseData.summary;
        }
        if (responseData.gameTypeSummary) {
          state.stats.gameTypeSummary = responseData.gameTypeSummary;
        }

        state.error = null;
      })
      .addCase(getBiddingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to get bidding history";
        state.bids = [];
      })

      // ========== GET TODAY SUMMARY ==========
      .addCase(getTodayBidsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTodayBidsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.todaySummary = action.payload?.data || null;
        state.error = null;
      })
      .addCase(getTodayBidsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to get today summary";
      })

      // ========== CANCEL BID ==========
      .addCase(cancelBid.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(cancelBid.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Bid cancelled successfully";

        // ✅ Update bid status in list
        const cancelledBidId = action.payload?.data?.bidId || action.meta?.arg;
        if (cancelledBidId) {
          const index = state.bids.findIndex((b) => b._id === cancelledBidId);
          if (index !== -1) {
            state.bids[index] = {
              ...state.bids[index],
              status: "cancelled",
            };
          }
        }
        state.error = null;
      })
      .addCase(cancelBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to cancel bid";
        state.message = "";
      })

      // ========== GET BID BY ID ==========
      .addCase(getBidById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBidById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBid = action.payload?.data || null;
        state.error = null;
      })
      .addCase(getBidById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to get bid details";
        state.currentBid = null;
      });
  },
});

// ================= EXPORT ACTIONS =================
export const {
  clearBidError,
  clearBidMessage,
  clearCurrentBid,
  resetBidState,
} = bidSlice.actions;

export default bidSlice.reducer;
