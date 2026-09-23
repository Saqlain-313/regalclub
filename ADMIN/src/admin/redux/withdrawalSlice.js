// store/slices/withdrawalSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from './api';

// ==========================================
// Async Thunks
// ==========================================

// Get all withdrawals with filters
export const fetchAllWithdrawals = createAsyncThunk(
  'withdrawals/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/withdrawals', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update withdrawal status
export const updateWithdrawalStatus = createAsyncThunk(
  'withdrawals/updateStatus',
  async ({ id, status, rejectionReason, adminNotes, transactionId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/withdrawals/${id}`, {
        status,
        rejectionReason,
        adminNotes,
        transactionId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get withdrawal statistics
export const fetchWithdrawalStats = createAsyncThunk(
  'withdrawals/fetchStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/withdrawals/stats', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get withdrawal settings
export const fetchWithdrawalSettings = createAsyncThunk(
  'withdrawals/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/withdrawals/settings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create/Update withdrawal settings
export const saveWithdrawalSettings = createAsyncThunk(
  'withdrawals/saveSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/withdrawals/settings', settingsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ==========================================
// Initial State
// ==========================================
const initialState = {
  withdrawals: [],
  settings: [],
  stats: {
    stats: [],
    dailyTrends: [],
    period: '30d',
    startDate: null,
  },
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  isLoading: false,
  isProcessing: false,
  error: null,
  filterParams: {
    status: '',
    country: '',
    fromDate: '',
    toDate: '',
    search: '',
  },
};

// ==========================================
// Slice
// ==========================================
const withdrawalSlice = createSlice({
  name: 'withdrawals',
  initialState,
  reducers: {
    clearWithdrawalError: (state) => {
      state.error = null;
    },
    setFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
    },
    resetFilterParams: (state) => {
      state.filterParams = initialState.filterParams;
    },
    clearWithdrawals: (state) => {
      state.withdrawals = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== Fetch All Withdrawals =====
      .addCase(fetchAllWithdrawals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllWithdrawals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.withdrawals = action.payload.data.withdrawals;
        state.currentPage = action.payload.data.pagination.page;
        state.totalPages = action.payload.data.pagination.totalPages;
        state.totalRecords = action.payload.data.pagination.total;
      })
      .addCase(fetchAllWithdrawals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch withdrawals';
      })

      // ===== Update Withdrawal Status =====
      .addCase(updateWithdrawalStatus.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(updateWithdrawalStatus.fulfilled, (state, action) => {
        state.isProcessing = false;
        const updatedWithdrawal = action.payload.data;
        
        // Update in withdrawals list
        const index = state.withdrawals.findIndex(
          (w) => w._id === updatedWithdrawal._id
        );
        if (index !== -1) {
          state.withdrawals[index] = updatedWithdrawal;
        }
      })
      .addCase(updateWithdrawalStatus.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to update withdrawal status';
      })

      // ===== Fetch Withdrawal Stats =====
      .addCase(fetchWithdrawalStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawalStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchWithdrawalStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch statistics';
      })

      // ===== Fetch Withdrawal Settings =====
      .addCase(fetchWithdrawalSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawalSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload.data;
      })
      .addCase(fetchWithdrawalSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch settings';
      })

      // ===== Save Withdrawal Settings =====
      .addCase(saveWithdrawalSettings.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(saveWithdrawalSettings.fulfilled, (state, action) => {
        state.isProcessing = false;
        const updatedSetting = action.payload.data;
        const index = state.settings.findIndex(
          (s) => s.country === updatedSetting.country
        );
        if (index !== -1) {
          state.settings[index] = updatedSetting;
        } else {
          state.settings.push(updatedSetting);
        }
      })
      .addCase(saveWithdrawalSettings.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to save settings';
      });
  },
});

// ==========================================
// Exports
// ==========================================
export const {
  clearWithdrawalError,
  setFilterParams,
  resetFilterParams,
  clearWithdrawals,
} = withdrawalSlice.actions;

export default withdrawalSlice.reducer;