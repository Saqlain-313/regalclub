import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

const initialState = {
  entries: [],
  selectedEntry: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalEntries: 0,
    entriesPerPage: 10,
  },
  stats: {
    totalRevenue: 0,
    averagePrice: 0,
    totalEntries: 0,
    totalPlayers: 0,
    open: 0,
    closed: 0,
    completed: 0,
  },
  filters: {
    status: "",
    userName: "",
    ticketType: "",
    gameType: "",
    startDate: "",
    endDate: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
  },
  summary: {
    total: {
      totalEntries: 0,
      totalRevenue: 0,
      totalPlayers: 0,
      open: 0,
      closed: 0,
      completed: 0,
    },
    today: { todayEntries: 0, todayRevenue: 0, todayPlayers: 0 },
    week: { weekEntries: 0, weekRevenue: 0, weekPlayers: 0 },
    month: { monthEntries: 0, monthRevenue: 0, monthPlayers: 0 },
  },
  statistics: {
    statusStats: [],
    ticketTypeStats: [],
    topUsers: [],
  },
};

export const fetchGameEntries = createAsyncThunk(
  "indiaGameEntry/fetchAll",
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({ page, limit, ...filters }).toString();
      const response = await api.get(`/admin/india/game-entries?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGameEntryById = createAsyncThunk(
  "indiaGameEntry/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/india/game-entries/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGameEntriesByStatus = createAsyncThunk(
  "indiaGameEntry/fetchByStatus",
  async ({ status, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/india/game-entries/status/${status}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchGameEntriesByUser = createAsyncThunk(
  "indiaGameEntry/searchByUser",
  async ({ query, page = 1, limit = 10, status = "" }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/india/game-entries/search?query=${query}&page=${page}&limit=${limit}&status=${status}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDashboardEntries = createAsyncThunk(
  "indiaGameEntry/fetchDashboard",
  async ({ limit = 10, status = "" }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/india/game-entries/dashboard?limit=${limit}&status=${status}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGameEntryStatistics = createAsyncThunk(
  "indiaGameEntry/fetchStatistics",
  async ({ startDate = "", endDate = "" }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/india/game-entries/statistics?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGameEntrySummary = createAsyncThunk(
  "indiaGameEntry/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/india/game-entries/summary");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateGameEntryStatus = createAsyncThunk(
  "indiaGameEntry/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/india/game-entries/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteGameEntry = createAsyncThunk(
  "indiaGameEntry/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/india/game-entries/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateGameEntryStatus = createAsyncThunk(
  "indiaGameEntry/bulkUpdateStatus",
  async ({ ids, status }, { rejectWithValue }) => {
    try {
      const response = await api.put("/admin/india/game-entries/bulk/status", { ids, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGameEntriesByUser = createAsyncThunk(
  "indiaGameEntry/fetchByUser",
  async ({ userId, page = 1, limit = 10, status = "" }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);
      const response = await api.get(`/admin/india/game-entries/user/${userId}?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPlayerGameDetails = createAsyncThunk(
  "indiaGameEntry/fetchPlayerDetails",
  async ({ poolId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/india/game-entries/${poolId}/player/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const gameEntrySlice = createSlice({
  name: "indiaGameEntry",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedEntry: (state) => {
      state.selectedEntry = null;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearEntries: (state) => {
      state.entries = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGameEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.stats = action.payload.stats || state.stats;
      })
      .addCase(fetchGameEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch game entries";
      })

      .addCase(fetchGameEntryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameEntryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEntry = action.payload.data;
      })
      .addCase(fetchGameEntryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch game entry";
      })

      .addCase(fetchGameEntriesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameEntriesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchGameEntriesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch entries by status";
      })

      .addCase(searchGameEntriesByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchGameEntriesByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(searchGameEntriesByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to search entries";
      })

      .addCase(fetchDashboardEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.data || [];
      })
      .addCase(fetchDashboardEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch dashboard entries";
      })

      .addCase(fetchGameEntryStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameEntryStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload.data || state.statistics;
      })
      .addCase(fetchGameEntryStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch statistics";
      })

      .addCase(fetchGameEntrySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameEntrySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data || state.summary;
        if (action.payload.data?.total) {
          state.stats = {
            totalRevenue: action.payload.data.total.totalRevenue || 0,
            averagePrice: action.payload.data.total.totalEntries > 0
              ? action.payload.data.total.totalRevenue / action.payload.data.total.totalEntries
              : 0,
            totalEntries: action.payload.data.total.totalEntries || 0,
            totalPlayers: action.payload.data.total.totalPlayers || 0,
            open: action.payload.data.total.open || 0,
            closed: action.payload.data.total.closed || 0,
            completed: action.payload.data.total.completed || 0,
          };
        }
      })
      .addCase(fetchGameEntrySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch summary";
      })

      .addCase(updateGameEntryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGameEntryStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEntry = action.payload.data;
        const index = state.entries.findIndex(entry => entry.poolId === updatedEntry._id);
        if (index !== -1) {
          state.entries[index] = { ...state.entries[index], status: updatedEntry.status };
        }
        if (state.selectedEntry && state.selectedEntry.poolId === updatedEntry._id) {
          state.selectedEntry = { ...state.selectedEntry, status: updatedEntry.status };
        }
      })
      .addCase(updateGameEntryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update status";
      })

      .addCase(deleteGameEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGameEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = state.entries.filter(entry => entry.poolId !== action.payload.id);
        state.pagination.totalEntries = Math.max(0, state.pagination.totalEntries - 1);
      })
      .addCase(deleteGameEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete entry";
      })

      .addCase(bulkUpdateGameEntryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateGameEntryStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkUpdateGameEntryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to bulk update status";
      })

      .addCase(fetchGameEntriesByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameEntriesByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchGameEntriesByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch user entries";
      })

      .addCase(fetchPlayerGameDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerGameDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEntry = action.payload.data;
      })
      .addCase(fetchPlayerGameDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch player details";
      });
  },
});

export const {
  setFilters,
  resetFilters,
  clearSelectedEntry,
  setPage,
  setPagination,
  clearError,
  clearEntries,
} = gameEntrySlice.actions;

export const selectAllEntries = (state) => state.indiaGameEntry.entries;
export const selectSelectedEntry = (state) => state.indiaGameEntry.selectedEntry;
export const selectLoading = (state) => state.indiaGameEntry.loading;
export const selectError = (state) => state.indiaGameEntry.error;
export const selectPagination = (state) => state.indiaGameEntry.pagination;
export const selectStats = (state) => state.indiaGameEntry.stats;
export const selectFilters = (state) => state.indiaGameEntry.filters;
export const selectSummary = (state) => state.indiaGameEntry.summary;
export const selectStatistics = (state) => state.indiaGameEntry.statistics;

export default gameEntrySlice.reducer;