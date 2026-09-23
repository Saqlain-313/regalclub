import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from './api';


// Get all results
export const getResults = createAsyncThunk(
  'result/getAll',
  async (params, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/results`, {
        params,
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get today's results
export const getTodayResults = createAsyncThunk(
  'result/getToday',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/results/today`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get result by ID
export const getResultById = createAsyncThunk(
  'result/getById',
  async (resultId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/results/${resultId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get result statistics
export const getResultStats = createAsyncThunk(
  'result/getStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/results/stats/overview`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  results: [],
  todayResults: [],
  currentResult: null,
  stats: null,
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

const resultSlice = createSlice({
  name: 'result',
  initialState,
  reducers: {
    clearResultError: (state) => {
      state.isError = false;
      state.message = '';
    },
    clearCurrentResult: (state) => {
      state.currentResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all results
      .addCase(getResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.data;
        state.pagination = action.payload.pagination;
        state.isError = false;
      })
      .addCase(getResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to get results';
      })
      // Get today results
      .addCase(getTodayResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTodayResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayResults = action.payload.data;
        state.isError = false;
      })
      .addCase(getTodayResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to get today results';
      })
      // Get result by ID
      .addCase(getResultById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResultById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResult = action.payload.data;
        state.isError = false;
      })
      .addCase(getResultById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to get result details';
      })
      // Get stats
      .addCase(getResultStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResultStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
        state.isError = false;
      })
      .addCase(getResultStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to get stats';
      });
  },
});

export const { clearResultError, clearCurrentResult } = resultSlice.actions;
export default resultSlice.reducer;