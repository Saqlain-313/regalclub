import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from './api';

export const fetchPublicBidResults = createAsyncThunk(
  'publicBid/fetchResults',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/public-bids', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

const initialState = {
  results: [],
  recentWins: [],
  markets: [],
  gameTypeStats: [],
  stats: {
    totalWonAmount: 0,
    totalWins: 0,
    totalBidAmount: 0
  },
  pagination: {
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  filters: {
    marketId: 'all',
    gameType: 'all',
    status: 'won',
    search: ''
  }
};

const publicBidSlice = createSlice({
  name: 'publicBid',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page on filter change
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearData: (state) => {
      state.results = [];
      state.recentWins = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicBidResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicBidResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.recentWins = action.payload.recentWins;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
        state.gameTypeStats = action.payload.gameTypeStats;
        state.markets = action.payload.markets;
      })
      .addCase(fetchPublicBidResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch results';
      });
  }
});

export const { setFilter, resetFilters, setPage, clearData } = publicBidSlice.actions;

// Selectors
export const selectPublicBidResults = (state) => state.publicBid;
export default publicBidSlice.reducer;