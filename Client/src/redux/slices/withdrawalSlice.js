// redux/slices/withdrawalSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// ================= ASYNC THUNKS =================

// @desc    Fetch withdrawal settings for user's country
export const fetchWithdrawalSettings = createAsyncThunk(
  "withdrawal/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/withdrawals/settings");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load withdrawal settings",
      );
    }
  },
);

// @desc    Fetch withdrawal history
export const fetchWithdrawalHistory = createAsyncThunk(
  "withdrawal/fetchHistory",
  async ({ page = 1, limit = 10, status = "" } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
      });
      const response = await api.get(`/withdrawals/history?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load withdrawal history",
      );
    }
  },
);

// @desc    Request a withdrawal
export const requestWithdrawal = createAsyncThunk(
  "withdrawal/request",
  async (withdrawalData, { rejectWithValue }) => {
    try {
      const response = await api.post("/withdrawals", withdrawalData);
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const detailedMessage =
        data?.errors?.length > 0
          ? data.errors.join(", ")
          : data?.message || "Failed to process withdrawal";

      return rejectWithValue(detailedMessage);
    }
  },
);

// @desc    Cancel a pending withdrawal
export const cancelWithdrawal = createAsyncThunk(
  "withdrawal/cancel",
  async (withdrawalId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/withdrawals/${withdrawalId}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel withdrawal",
      );
    }
  },
);

// @desc    Get withdrawal details
export const getWithdrawalDetails = createAsyncThunk(
  "withdrawal/getDetails",
  async (withdrawalId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/withdrawals/${withdrawalId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get withdrawal details",
      );
    }
  },
);

// ================= ADMIN THUNKS =================

// @desc    Get all withdrawals (admin)
export const adminGetAllWithdrawals = createAsyncThunk(
  "withdrawal/adminGetAll",
  async (
    { page = 1, limit = 20, status = "", country = "", search = "" } = {},
    { rejectWithValue },
  ) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(country && { country }),
        ...(search && { search }),
      });
      const response = await api.get(`/admin/withdrawals?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load withdrawals",
      );
    }
  },
);

// @desc    Update withdrawal status (admin)
export const adminUpdateWithdrawalStatus = createAsyncThunk(
  "withdrawal/adminUpdateStatus",
  async ({ withdrawalId, statusData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/withdrawals/${withdrawalId}`,
        statusData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update withdrawal status",
      );
    }
  },
);

// @desc    Get withdrawal stats (admin)
export const adminGetWithdrawalStats = createAsyncThunk(
  "withdrawal/adminGetStats",
  async ({ country = "", period = "30d" } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        ...(country && { country }),
        period,
      });
      const response = await api.get(`/admin/withdrawals/stats?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load withdrawal stats",
      );
    }
  },
);

// ================= INITIAL STATE =================

const initialState = {
  // Settings
  settings: null,
  settingsLoading: false,
  settingsError: null,

  // History
  history: [],
  historyLoading: false,
  historyError: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  summary: [],

  // Current withdrawal request
  currentWithdrawal: null,
  requestLoading: false,
  requestError: null,
  requestSuccess: false,

  // Withdrawal details
  withdrawalDetails: null,
  detailsLoading: false,
  detailsError: null,

  // Admin
  adminWithdrawals: [],
  adminLoading: false,
  adminError: null,
  adminPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  adminStats: null,
  adminStatsLoading: false,
  adminStatsError: null,

  // Cancel
  cancelLoading: false,
  cancelError: null,
  cancelSuccess: false,

  // Update status (admin)
  updateLoading: false,
  updateError: null,
  updateSuccess: false,

  // General
  error: null,
  message: null,
};

// ================= SLICE =================

const withdrawalSlice = createSlice({
  name: "withdrawal",
  initialState,
  reducers: {
    clearWithdrawalError: (state) => {
      state.error = null;
      state.requestError = null;
      state.settingsError = null;
      state.historyError = null;
      state.adminError = null;
      state.cancelError = null;
      state.updateError = null;
    },
    clearWithdrawalMessage: (state) => {
      state.message = null;
    },
    clearWithdrawalSuccess: (state) => {
      state.requestSuccess = false;
      state.cancelSuccess = false;
      state.updateSuccess = false;
    },
    clearCurrentWithdrawal: (state) => {
      state.currentWithdrawal = null;
      state.withdrawalDetails = null;
    },
    resetWithdrawalState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ============ FETCH SETTINGS ============
      .addCase(fetchWithdrawalSettings.pending, (state) => {
        state.settingsLoading = true;
        state.settingsError = null;
      })
      .addCase(fetchWithdrawalSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.settings = action.payload.data.settings;
        state.summary = action.payload.data.summary || [];
        state.message = action.payload.message;
      })
      .addCase(fetchWithdrawalSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.settingsError = action.payload;
        state.error = action.payload;
      })

      // ============ FETCH HISTORY ============
      .addCase(fetchWithdrawalHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchWithdrawalHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload.data.withdrawals;
        state.pagination = action.payload.data.pagination;
        state.summary = action.payload.data.summary || state.summary;
      })
      .addCase(fetchWithdrawalHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
        state.error = action.payload;
      })

      // ============ REQUEST WITHDRAWAL ============
      .addCase(requestWithdrawal.pending, (state) => {
        state.requestLoading = true;
        state.requestError = null;
        state.requestSuccess = false;
      })
      .addCase(requestWithdrawal.fulfilled, (state, action) => {
        state.requestLoading = false;
        state.requestSuccess = true;
        state.currentWithdrawal = action.payload.data;
        state.message = action.payload.message;
        // Update user credit in auth slice will happen via auth/loadUser
      })
      .addCase(requestWithdrawal.rejected, (state, action) => {
        state.requestLoading = false;
        state.requestError = action.payload;
        state.requestSuccess = false;
        // state.error hata diya
      })

      // ============ CANCEL WITHDRAWAL ============
      .addCase(cancelWithdrawal.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
        state.cancelSuccess = false;
      })
      .addCase(cancelWithdrawal.fulfilled, (state, action) => {
        state.cancelLoading = false;
        state.cancelSuccess = true;
        state.message = action.payload.message;
        // Update the withdrawal in history
        const updatedWithdrawal = action.payload.data.withdrawal;
        const index = state.history.findIndex(
          (w) => w._id === updatedWithdrawal._id,
        );
        if (index !== -1) {
          state.history[index] = updatedWithdrawal;
        }
      })
      .addCase(cancelWithdrawal.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload;
        state.error = action.payload;
        state.cancelSuccess = false;
      })

      // ============ GET WITHDRAWAL DETAILS ============
      .addCase(getWithdrawalDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(getWithdrawalDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.withdrawalDetails = action.payload.data;
      })
      .addCase(getWithdrawalDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload;
        state.error = action.payload;
      })

      // ============ ADMIN: GET ALL WITHDRAWALS ============
      .addCase(adminGetAllWithdrawals.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(adminGetAllWithdrawals.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminWithdrawals = action.payload.data.withdrawals;
        state.adminPagination = action.payload.data.pagination;
        state.adminStats = action.payload.data.stats;
      })
      .addCase(adminGetAllWithdrawals.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
        state.error = action.payload;
      })

      // ============ ADMIN: UPDATE WITHDRAWAL STATUS ============
      .addCase(adminUpdateWithdrawalStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(adminUpdateWithdrawalStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.message = action.payload.message;
        // Update the withdrawal in admin list
        const updatedWithdrawal = action.payload.data;
        const index = state.adminWithdrawals.findIndex(
          (w) => w._id === updatedWithdrawal._id,
        );
        if (index !== -1) {
          state.adminWithdrawals[index] = updatedWithdrawal;
        }
        // Also update in history if present
        const historyIndex = state.history.findIndex(
          (w) => w._id === updatedWithdrawal._id,
        );
        if (historyIndex !== -1) {
          state.history[historyIndex] = updatedWithdrawal;
        }
      })
      .addCase(adminUpdateWithdrawalStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.error = action.payload;
        state.updateSuccess = false;
      })

      // ============ ADMIN: GET WITHDRAWAL STATS ============
      .addCase(adminGetWithdrawalStats.pending, (state) => {
        state.adminStatsLoading = true;
        state.adminStatsError = null;
      })
      .addCase(adminGetWithdrawalStats.fulfilled, (state, action) => {
        state.adminStatsLoading = false;
        state.adminStats = action.payload.data;
      })
      .addCase(adminGetWithdrawalStats.rejected, (state, action) => {
        state.adminStatsLoading = false;
        state.adminStatsError = action.payload;
        state.error = action.payload;
      });
  },
});

// ================= EXPORT ACTIONS =================

export const {
  clearWithdrawalError,
  clearWithdrawalMessage,
  clearWithdrawalSuccess,
  clearCurrentWithdrawal,
  resetWithdrawalState,
} = withdrawalSlice.actions;

// ================= SELECTORS =================

// Settings selectors
export const selectWithdrawalSettings = (state) => state.withdrawal.settings;
export const selectSettingsLoading = (state) =>
  state.withdrawal.settingsLoading;
export const selectSettingsError = (state) => state.withdrawal.settingsError;

// History selectors
export const selectWithdrawalHistory = (state) => state.withdrawal.history;
export const selectHistoryLoading = (state) => state.withdrawal.historyLoading;
export const selectHistoryError = (state) => state.withdrawal.historyError;
export const selectPagination = (state) => state.withdrawal.pagination;
export const selectSummary = (state) => state.withdrawal.summary;

// Request selectors
export const selectCurrentWithdrawal = (state) =>
  state.withdrawal.currentWithdrawal;
export const selectRequestLoading = (state) => state.withdrawal.requestLoading;
export const selectRequestError = (state) => state.withdrawal.requestError;
export const selectRequestSuccess = (state) => state.withdrawal.requestSuccess;

// Details selectors
export const selectWithdrawalDetails = (state) =>
  state.withdrawal.withdrawalDetails;
export const selectDetailsLoading = (state) => state.withdrawal.detailsLoading;

// Cancel selectors
export const selectCancelLoading = (state) => state.withdrawal.cancelLoading;
export const selectCancelSuccess = (state) => state.withdrawal.cancelSuccess;

// Admin selectors
export const selectAdminWithdrawals = (state) =>
  state.withdrawal.adminWithdrawals;
export const selectAdminLoading = (state) => state.withdrawal.adminLoading;
export const selectAdminPagination = (state) =>
  state.withdrawal.adminPagination;
export const selectAdminStats = (state) => state.withdrawal.adminStats;
export const selectAdminStatsLoading = (state) =>
  state.withdrawal.adminStatsLoading;

// Update selectors
export const selectUpdateLoading = (state) => state.withdrawal.updateLoading;
export const selectUpdateSuccess = (state) => state.withdrawal.updateSuccess;

// General selectors
export const selectWithdrawalError = (state) => state.withdrawal.error;
export const selectWithdrawalMessage = (state) => state.withdrawal.message;

export default withdrawalSlice.reducer;
