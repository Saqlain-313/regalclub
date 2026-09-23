import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from "./api";



// Get active markets for user
export const getActiveMarkets = createAsyncThunk(
  'market/getActive',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/markets/active`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get market by ID
export const getMarketById = createAsyncThunk(
  'market/getById',
  async (marketId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/markets/${marketId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get all markets with filters
export const getAllMarkets = createAsyncThunk(
  'market/getAll',
  async (params, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/markets`, {
        params,
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  markets: [],
  activeMarkets: [],
  currentMarket: null,
  isLoading: false,
  isError: false,
  message: '',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    clearMarketError: (state) => {
      state.isError = false;
      state.message = '';
    },
    clearCurrentMarket: (state) => {
      state.currentMarket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get active markets
      .addCase(getActiveMarkets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActiveMarkets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeMarkets = action.payload.data;
        state.isError = false;
      })
      .addCase(getActiveMarkets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to get active markets';
      })
      // Get all markets
      .addCase(getAllMarkets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllMarkets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.markets = action.payload.data;
        state.pagination = action.payload.pagination;
        state.isError = false;
      })
      .addCase(getAllMarkets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to get markets';
      })
      // Get market by ID
      .addCase(getMarketById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMarketById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMarket = action.payload.data;
        state.isError = false;
      })
      .addCase(getMarketById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to get market details';
      });
  },
});

export const { clearMarketError, clearCurrentMarket } = marketSlice.actions;
export default marketSlice.reducer;