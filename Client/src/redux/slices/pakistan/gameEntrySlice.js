import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";


const COUNTRY = "pakistan";
// ================= CREATE GAME ENTRY =================
export const createGameEntry = createAsyncThunk(
  "pakistanGameEntry/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/" + COUNTRY + "/game-entry", formData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ================= GET MY GAME ENTRIES =================
export const getMyGameEntries = createAsyncThunk(
  "pakistanGameEntry/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.country) queryParams.append('country', params.country);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/pakistan/game-entry?${queryString}` : "/" + COUNTRY + "/game-entry";
      
      const { data } = await api.get(url);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ================= GET SINGLE GAME ENTRY =================
export const getSingleGameEntry = createAsyncThunk(
  "pakistanGameEntry/getSingle",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/${COUNTRY}/game-entry/${id}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ================= GET ENTRY RESULTS =================
export const getEntryResults = createAsyncThunk(
  "pakistanGameEntry/getResults",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/${COUNTRY}/game-entry/${id}/results`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ================= DELETE ENTRY =================
export const deleteGameEntry = createAsyncThunk(
  "pakistanGameEntry/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/${COUNTRY}/game-entry/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ================= CANCEL ENTRY (WITH REFUND) =================
export const cancelGameEntry = createAsyncThunk(
  "pakistanGameEntry/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/${COUNTRY}/game-entry/${id}/cancel`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ================= GET USER credit =================
export const getUsercredit = createAsyncThunk(
  "pakistanGameEntry/getcredit",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/pakistan/game-entry/credit/me");
      return data.credit;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ================= GET ENTRIES BY COUNTRY =================
export const getEntriesByCountry = createAsyncThunk(
  "pakistanGameEntry/getByCountry",
  async (country, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/${COUNTRY}/game-entry/country/${country}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong."
      );
    }
  }
);

const initialState = {
  entries: [],
  selectedEntry: null,
  results: null,
  winningNumbers: null,
  credit: 0,
  loading: false,
  success: false,
  error: null,
  message: "",
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  filters: {
    country: null,
    status: null
  }
};

const pakistanGameEntrySlice = createSlice({
  name: "pakistanGameEntry",
  initialState,
  reducers: {
    resetGameEntryState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
      state.results = null;
      state.winningNumbers = null;
    },
    clearSelectedEntry: (state) => {
      state.selectedEntry = null;
      state.results = null;
      state.winningNumbers = null;
    },
    clearGameEntryError: (state) => {
      state.error = null;
    },
    setCountryFilter: (state, action) => {
      state.filters.country = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    clearFilters: (state) => {
      state.filters.country = null;
      state.filters.status = null;
    },
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // ================= CREATE GAME ENTRY =================
      .addCase(createGameEntry.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createGameEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.entry = action.payload?.data?.pool || null;
        state.message = action.payload?.message || "Entry created successfully";
        // Add new entry to the list
        if (action.payload?.data?.pool) {
          state.entries.unshift(action.payload.data.pool);
        }
        // Update credit
        if (action.payload?.credit) {
          state.credit = action.payload.credit.amount;
        }
      })
      .addCase(createGameEntry.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // ================= GET ALL ENTRIES =================
      .addCase(getMyGameEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyGameEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = Array.isArray(action.payload?.data) ? action.payload.data : [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
        if (action.payload?.filter) {
          state.filters = { ...state.filters, ...action.payload.filter };
        }
      })
      .addCase(getMyGameEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.entries = [];
      })

      // ================= GET SINGLE ENTRY =================
      .addCase(getSingleGameEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleGameEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEntry = action.payload;
        // Update results if available
        if (action.payload?.result) {
          state.results = action.payload.result;
          state.winningNumbers = action.payload.winningNumbers;
        }
      })
      .addCase(getSingleGameEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedEntry = null;
      })

      // ================= GET RESULTS =================
      .addCase(getEntryResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEntryResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.winningNumbers = action.payload?.winningNumbers || null;
        state.selectedEntry = action.payload?.entry || null;
      })
      .addCase(getEntryResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.results = null;
        state.winningNumbers = null;
      })

      // ================= DELETE =================
      .addCase(deleteGameEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGameEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = state.entries.filter(
          (item) => item._id !== action.payload && item.poolId !== action.payload
        );
        if (state.selectedEntry?._id === action.payload || 
            state.selectedEntry?.poolId === action.payload) {
          state.selectedEntry = null;
          state.results = null;
          state.winningNumbers = null;
        }
        state.message = "Entry deleted successfully";
      })
      .addCase(deleteGameEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= CANCEL ENTRY =================
      .addCase(cancelGameEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelGameEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Entry cancelled successfully";
        // Remove from entries list
        if (action.payload?.data?.poolId) {
          state.entries = state.entries.filter(
            item => item._id !== action.payload.data.poolId && 
                    item.poolId !== action.payload.data.poolId
          );
        }
        // Update credit
        if (action.payload?.credit) {
          state.credit = action.payload.credit.amount;
        }
        if (state.selectedEntry) {
          state.selectedEntry = null;
          state.results = null;
          state.winningNumbers = null;
        }
      })
      .addCase(cancelGameEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= GET credit =================
      .addCase(getUsercredit.fulfilled, (state, action) => {
        state.credit = action.payload;
      })
      .addCase(getUsercredit.rejected, (state) => {
        state.credit = 0;
      })

      // ================= GET ENTRIES BY COUNTRY =================
      .addCase(getEntriesByCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEntriesByCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = Array.isArray(action.payload) ? action.payload : [];
        state.filters.country = action.meta.arg;
      })
      .addCase(getEntriesByCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.entries = [];
      });
  },
});

export const { 
  resetGameEntryState, 
  clearSelectedEntry,
  clearGameEntryError,
  setCountryFilter,
  setStatusFilter,
  clearFilters,
  updatePagination
} = pakistanGameEntrySlice.actions;

// ================= SELECTORS =================
export const selectAllEntries = (state) => state.pakistanGameEntries.entries;
export const selectSelectedEntry = (state) => state.pakistanGameEntries.selectedEntry;
export const selectEntryResults = (state) => state.pakistanGameEntries.results;
export const selectWinningNumbers = (state) => state.pakistanGameEntries.winningNumbers;
export const selectcredit = (state) => state.pakistanGameEntries.credit;
export const selectGameEntryLoading = (state) => state.pakistanGameEntries.loading;
export const selectGameEntrySuccess = (state) => state.pakistanGameEntries.success;
export const selectGameEntryError = (state) => state.pakistanGameEntries.error;
export const selectGameEntryMessage = (state) => state.pakistanGameEntries.message;
export const selectPagination = (state) => state.pakistanGameEntries.pagination;
export const selectFilters = (state) => state.pakistanGameEntries.filters;
export const selectEntriesByCountry = (state, country) => 
  state.pakistanGameEntries.entries.filter(entry => entry.country === country);
export const selectEntriesByStatus = (state, status) => 
  state.pakistanGameEntries.entries.filter(entry => entry.poolStatus === status);

export default pakistanGameEntrySlice.reducer;
