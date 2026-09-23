// store/slices/depositSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from './api';

// ==========================================
// Async Thunks - Updated Routes
// ==========================================

// Get all deposits with filters
export const fetchAllDeposits = createAsyncThunk(
  'deposits/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/deposit/admin/all', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get pending deposits
export const fetchPendingDeposits = createAsyncThunk(
  'deposits/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/deposit/admin/pending');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Approve deposit
export const approveDeposit = createAsyncThunk(
  'deposits/approve',
  async ({ id, remark }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/deposit/admin/approve/${id}`, { remark });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Reject deposit
export const rejectDeposit = createAsyncThunk(
  'deposits/reject',
  async ({ id, remark }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/deposit/admin/reject/${id}`, { remark });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get deposit statistics
export const fetchDepositStats = createAsyncThunk(
  'deposits/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/deposit/admin/stats');
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
  deposits: [],
  pendingDeposits: [],
  stats: {
    totalDeposits: 0,
    pendingDeposits: 0,
    approvedDeposits: 0,
    rejectedDeposits: 0,
    approvedAmount: 0,
    pendingAmount: 0,
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
    methodType: '',
    search: '',
  },
};

// ==========================================
// Slice
// ==========================================
const depositSlice = createSlice({
  name: 'deposits',
  initialState,
  reducers: {
    clearDepositError: (state) => {
      state.error = null;
    },
    setFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
    },
    resetFilterParams: (state) => {
      state.filterParams = initialState.filterParams;
    },
    clearDeposits: (state) => {
      state.deposits = [];
      state.pendingDeposits = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== Fetch All Deposits =====
      .addCase(fetchAllDeposits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDeposits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deposits = action.payload.deposits;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchAllDeposits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch deposits';
      })

      // ===== Fetch Pending Deposits =====
      .addCase(fetchPendingDeposits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingDeposits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingDeposits = action.payload.deposits;
      })
      .addCase(fetchPendingDeposits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch pending deposits';
      })

      // ===== Approve Deposit =====
      .addCase(approveDeposit.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(approveDeposit.fulfilled, (state, action) => {
        state.isProcessing = false;
        const updatedDeposit = action.payload.deposit;
        
        // Update in deposits list
        const depositIndex = state.deposits.findIndex(
          (d) => d._id === updatedDeposit._id
        );
        if (depositIndex !== -1) {
          state.deposits[depositIndex] = updatedDeposit;
        }

        // Remove from pending deposits if exists
        state.pendingDeposits = state.pendingDeposits.filter(
          (d) => d._id !== updatedDeposit._id
        );

        // Update stats if available
        if (state.stats) {
          state.stats.pendingDeposits = Math.max(0, state.stats.pendingDeposits - 1);
          state.stats.approvedDeposits += 1;
          state.stats.approvedAmount += updatedDeposit.amount;
        }
      })
      .addCase(approveDeposit.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to approve deposit';
      })

      // ===== Reject Deposit =====
      .addCase(rejectDeposit.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(rejectDeposit.fulfilled, (state, action) => {
        state.isProcessing = false;
        const updatedDeposit = action.payload.deposit;
        
        // Update in deposits list
        const depositIndex = state.deposits.findIndex(
          (d) => d._id === updatedDeposit._id
        );
        if (depositIndex !== -1) {
          state.deposits[depositIndex] = updatedDeposit;
        }

        // Remove from pending deposits if exists
        state.pendingDeposits = state.pendingDeposits.filter(
          (d) => d._id !== updatedDeposit._id
        );

        // Update stats if available
        if (state.stats) {
          state.stats.pendingDeposits = Math.max(0, state.stats.pendingDeposits - 1);
          state.stats.rejectedDeposits += 1;
        }
      })
      .addCase(rejectDeposit.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to reject deposit';
      })

      // ===== Fetch Deposit Stats =====
      .addCase(fetchDepositStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepositStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDepositStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch statistics';
      });
  },
});

// ==========================================
// Exports
// ==========================================
export const {
  clearDepositError,
  setFilterParams,
  resetFilterParams,
  clearDeposits,
} = depositSlice.actions;

export default depositSlice.reducer;