// redux/features/deposit/depositSettingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from './api';

// ===============================
// Async Thunks
// ===============================

// Get all deposit settings (Admin)
export const getAllDepositSettings = createAsyncThunk(
  'depositSettings/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/deposit-settings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Get single country settings (Admin)
export const getDepositSettingsByCountry = createAsyncThunk(
  'depositSettings/getByCountry',
  async (country, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/deposit-settings/${country}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Save/Update deposit settings (Admin)
export const saveDepositSettings = createAsyncThunk(
  'depositSettings/save',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/deposit-settings', settingsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Delete deposit settings (Admin)
export const deleteDepositSettings = createAsyncThunk(
  'depositSettings/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/deposit-settings/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ===============================
// Initial State
// ===============================

const initialState = {
  settings: [],
  currentSettings: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
  success: false,
  message: null,
};

// ===============================
// Slice
// ===============================

const depositSettingsSlice = createSlice({
  name: 'depositSettings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearCurrentSettings: (state) => {
      state.currentSettings = null;
    },
    resetDepositSettings: (state) => {
      state.settings = [];
      state.currentSettings = null;
      state.loading = false;
      state.saving = false;
      state.deleting = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Settings
      .addCase(getAllDepositSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDepositSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.data || [];
      })
      .addCase(getAllDepositSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch settings';
        state.settings = [];
      })
      
      // Get By Country
      .addCase(getDepositSettingsByCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDepositSettingsByCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSettings = action.payload.data;
      })
      .addCase(getDepositSettingsByCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch country settings';
        state.currentSettings = null;
      })
      
      // Save Settings
      .addCase(saveDepositSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.success = false;
      })
      .addCase(saveDepositSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.success = true;
        state.message = action.payload.message || 'Settings saved successfully';
        
        const data = action.payload.data;
        const index = state.settings.findIndex(
          (s) => s.country === data.country
        );
        if (index !== -1) {
          state.settings[index] = data;
        } else {
          state.settings.push(data);
        }
        state.currentSettings = data;
      })
      .addCase(saveDepositSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || 'Failed to save settings';
        state.success = false;
      })
      
      // Delete Settings
      .addCase(deleteDepositSettings.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDepositSettings.fulfilled, (state, action) => {
        state.deleting = false;
        state.settings = state.settings.filter(
          (s) => s._id !== action.payload.id
        );
        if (state.currentSettings?._id === action.payload.id) {
          state.currentSettings = null;
        }
      })
      .addCase(deleteDepositSettings.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.message || 'Failed to delete settings';
      });
  },
});

// ===============================
// Actions
// ===============================

export const {
  clearError,
  clearSuccess,
  clearCurrentSettings,
  resetDepositSettings,
} = depositSettingsSlice.actions;

// ===============================
// Selectors
// ===============================

export const selectAllSettings = (state) => state.depositSettings.settings;
export const selectCurrentSettings = (state) => state.depositSettings.currentSettings;
export const selectSettingsLoading = (state) => state.depositSettings.loading;
export const selectSettingsSaving = (state) => state.depositSettings.saving;
export const selectSettingsDeleting = (state) => state.depositSettings.deleting;
export const selectSettingsError = (state) => state.depositSettings.error;
export const selectSettingsSuccess = (state) => state.depositSettings.success;
export const selectSettingsMessage = (state) => state.depositSettings.message;

export default depositSettingsSlice.reducer;