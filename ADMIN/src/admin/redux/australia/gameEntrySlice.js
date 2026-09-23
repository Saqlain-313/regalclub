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
    today: {
      todayEntries: 0,
      todayRevenue: 0,
      todayPlayers: 0,
    },
    week: {
      weekEntries: 0,
      weekRevenue: 0,
      weekPlayers: 0,
    },
    month: {
      monthEntries: 0,
      monthRevenue: 0,
      monthPlayers: 0,
    },
  },

  statistics: {
    statusStats: [],
    ticketTypeStats: [],
    topUsers: [],
  },
};

// =====================================================
// FETCH ALL GAME ENTRIES
// =====================================================
export const fetchGameEntries = createAsyncThunk(
  "australiaGameEntry/fetchAll",
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const response = await api.get(
        `/admin/australia/game-entries?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// FETCH GAME ENTRY BY ID
// =====================================================
export const fetchGameEntryById = createAsyncThunk(
  "australiaGameEntry/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/australia/game-entries/${id}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// FETCH BY STATUS
// =====================================================
export const fetchGameEntriesByStatus = createAsyncThunk(
  "australiaGameEntry/fetchByStatus",
  async (
    { status, page = 1, limit = 10 },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
      });

      const response = await api.get(
        `/admin/australia/game-entries/status/${status}?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// SEARCH BY USER
// =====================================================
export const searchGameEntriesByUser = createAsyncThunk(
  "australiaGameEntry/searchByUser",
  async (
    { query, page = 1, limit = 10, status = "" },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        query,
        page,
        limit,
      });

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/admin/australia/game-entries/search?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// DASHBOARD ENTRIES
// =====================================================
export const fetchDashboardEntries = createAsyncThunk(
  "australiaGameEntry/fetchDashboard",
  async (
    { limit = 10, status = "" },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        limit,
      });

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/admin/australia/game-entries/dashboard?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// FETCH STATISTICS
// =====================================================
export const fetchGameEntryStatistics = createAsyncThunk(
  "australiaGameEntry/fetchStatistics",
  async (
    { startDate = "", endDate = "" },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      const query = params.toString();

      const response = await api.get(
        `/admin/australia/game-entries/statistics${
          query ? `?${query}` : ""
        }`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// FETCH SUMMARY
// =====================================================
export const fetchGameEntrySummary = createAsyncThunk(
  "australiaGameEntry/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        "/admin/australia/game-entries/summary"
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// UPDATE STATUS
// =====================================================
export const updateGameEntryStatus = createAsyncThunk(
  "australiaGameEntry/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/australia/game-entries/${id}/status`,
        { status }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// DELETE ENTRY
// =====================================================
export const deleteGameEntry = createAsyncThunk(
  "australiaGameEntry/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/admin/australia/game-entries/${id}`
      );

      return {
        id,
        ...response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// BULK UPDATE STATUS
// =====================================================
export const bulkUpdateGameEntryStatus = createAsyncThunk(
  "australiaGameEntry/bulkUpdateStatus",
  async ({ ids, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        "/admin/australia/game-entries/bulk/status",
        {
          ids,
          status,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// FETCH ENTRIES BY USER
// =====================================================
export const fetchGameEntriesByUser = createAsyncThunk(
  "australiaGameEntry/fetchByUser",
  async (
    { userId, page = 1, limit = 10, status = "" },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/admin/australia/game-entries/user/${userId}?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// PLAYER GAME DETAILS
// =====================================================
export const fetchPlayerGameDetails = createAsyncThunk(
  "australiaGameEntry/fetchPlayerDetails",
  async ({ poolId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/australia/game-entries/${poolId}/player/${userId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// =====================================================
// SLICE
// =====================================================
const gameEntrySlice = createSlice({
  name: "australiaGameEntry",

  initialState,

  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    resetFilters: (state) => {
      state.filters = {
        ...initialState.filters,
      };
    },

    clearSelectedEntry: (state) => {
      state.selectedEntry = null;
    },

    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },

    clearError: (state) => {
      state.error = null;
    },

    clearEntries: (state) => {
      state.entries = [];
    },
  },

  extraReducers: (builder) => {
    // =================================================
    // FETCH ALL
    // =================================================
    builder
      .addCase(fetchGameEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGameEntries.fulfilled, (state, action) => {
        state.loading = false;

        state.entries = action.payload?.data || [];

        if (action.payload?.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }

        if (action.payload?.stats) {
          state.stats = {
            ...state.stats,
            ...action.payload.stats,
          };
        }
      })

      .addCase(fetchGameEntries.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch game entries";
      });

    // =================================================
    // FETCH BY ID
    // =================================================
    builder
      .addCase(fetchGameEntryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGameEntryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEntry = action.payload?.data || null;
      })

      .addCase(fetchGameEntryById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch game entry";
      });

    // =================================================
    // STATUS
    // =================================================
    builder
      .addCase(fetchGameEntriesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGameEntriesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload?.data || [];

        if (action.payload?.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
      })

      .addCase(fetchGameEntriesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch entries by status";
      });

    // =================================================
    // SEARCH
    // =================================================
    builder
      .addCase(searchGameEntriesByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(searchGameEntriesByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload?.data || [];

        if (action.payload?.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
      })

      .addCase(searchGameEntriesByUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to search entries";
      });

    // =================================================
    // DASHBOARD
    // =================================================
    builder
      .addCase(fetchDashboardEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDashboardEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload?.data || [];
      })

      .addCase(fetchDashboardEntries.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch dashboard entries";
      });

    // =================================================
    // STATISTICS
    // =================================================
    builder
      .addCase(fetchGameEntryStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGameEntryStatistics.fulfilled, (state, action) => {
        state.loading = false;

        state.statistics =
          action.payload?.data || state.statistics;
      })

      .addCase(fetchGameEntryStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch statistics";
      });

    // =================================================
    // SUMMARY
    // =================================================
    builder
      .addCase(fetchGameEntrySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGameEntrySummary.fulfilled, (state, action) => {
        state.loading = false;

        const summary = action.payload?.data;

        if (summary) {
          state.summary = summary;
        }

        if (summary?.total) {
          const totalEntries =
            Number(summary.total.totalEntries) || 0;

          const totalRevenue =
            Number(summary.total.totalRevenue) || 0;

          state.stats = {
            totalRevenue,
            averagePrice:
              totalEntries > 0
                ? totalRevenue / totalEntries
                : 0,

            totalEntries,

            totalPlayers:
              Number(summary.total.totalPlayers) || 0,

            open:
              Number(summary.total.open) || 0,

            closed:
              Number(summary.total.closed) || 0,

            completed:
              Number(summary.total.completed) || 0,
          };
        }
      })

      .addCase(fetchGameEntrySummary.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch summary";
      });

    // =================================================
    // UPDATE STATUS
    // =================================================
    builder
      .addCase(updateGameEntryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateGameEntryStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updatedEntry = action.payload?.data;

        if (!updatedEntry) {
          return;
        }

        const updatedId =
          updatedEntry._id ||
          updatedEntry.id ||
          updatedEntry.poolId;

        const index = state.entries.findIndex(
          (entry) =>
            entry._id === updatedId ||
            entry.id === updatedId ||
            entry.poolId === updatedId
        );

        if (index !== -1) {
          state.entries[index] = {
            ...state.entries[index],
            ...updatedEntry,
            status: updatedEntry.status,
          };
        }

        if (state.selectedEntry) {
          const selectedId =
            state.selectedEntry._id ||
            state.selectedEntry.id ||
            state.selectedEntry.poolId;

          if (selectedId === updatedId) {
            state.selectedEntry = {
              ...state.selectedEntry,
              ...updatedEntry,
              status: updatedEntry.status,
            };
          }
        }
      })

      .addCase(updateGameEntryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to update status";
      });

    // =================================================
    // DELETE
    // =================================================
    builder
      .addCase(deleteGameEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteGameEntry.fulfilled, (state, action) => {
        state.loading = false;

        const deletedId = action.payload?.id;

        state.entries = state.entries.filter(
          (entry) =>
            entry._id !== deletedId &&
            entry.id !== deletedId &&
            entry.poolId !== deletedId
        );

        state.pagination.totalEntries = Math.max(
          0,
          state.pagination.totalEntries - 1
        );

        if (
          state.selectedEntry?._id === deletedId ||
          state.selectedEntry?.id === deletedId ||
          state.selectedEntry?.poolId === deletedId
        ) {
          state.selectedEntry = null;
        }
      })

      .addCase(deleteGameEntry.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to delete entry";
      });

    // =================================================
    // BULK STATUS
    // =================================================
    builder
      .addCase(bulkUpdateGameEntryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        bulkUpdateGameEntryStatus.fulfilled,
        (state, action) => {
          state.loading = false;

          const updatedEntries =
            action.payload?.data || [];

          if (Array.isArray(updatedEntries)) {
            updatedEntries.forEach((updatedEntry) => {
              const updatedId =
                updatedEntry._id ||
                updatedEntry.id ||
                updatedEntry.poolId;

              const index = state.entries.findIndex(
                (entry) =>
                  entry._id === updatedId ||
                  entry.id === updatedId ||
                  entry.poolId === updatedId
              );

              if (index !== -1) {
                state.entries[index] = {
                  ...state.entries[index],
                  ...updatedEntry,
                };
              }
            });
          }
        }
      )

      .addCase(
        bulkUpdateGameEntryStatus.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload?.message ||
            "Failed to bulk update status";
        }
      );

    // =================================================
    // BY USER
    // =================================================
    builder
      .addCase(fetchGameEntriesByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGameEntriesByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload?.data || [];

        if (action.payload?.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
      })

      .addCase(fetchGameEntriesByUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch user entries";
      });

    // =================================================
    // PLAYER DETAILS
    // =================================================
    builder
      .addCase(fetchPlayerGameDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchPlayerGameDetails.fulfilled,
        (state, action) => {
          state.loading = false;
          state.selectedEntry =
            action.payload?.data || null;
        }
      )

      .addCase(
        fetchPlayerGameDetails.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload?.message ||
            "Failed to fetch player details";
        }
      );
  },
});

// =====================================================
// ACTIONS
// =====================================================
export const {
  setFilters,
  resetFilters,
  clearSelectedEntry,
  setPage,
  setPagination,
  clearError,
  clearEntries,
} = gameEntrySlice.actions;

// =====================================================
// SELECTORS
// =====================================================
export const selectAllEntries = (state) =>
  state.australiaGameEntry.entries;

export const selectSelectedEntry = (state) =>
  state.australiaGameEntry.selectedEntry;

export const selectLoading = (state) =>
  state.australiaGameEntry.loading;

export const selectError = (state) =>
  state.australiaGameEntry.error;

export const selectPagination = (state) =>
  state.australiaGameEntry.pagination;

export const selectStats = (state) =>
  state.australiaGameEntry.stats;

export const selectFilters = (state) =>
  state.australiaGameEntry.filters;

export const selectSummary = (state) =>
  state.australiaGameEntry.summary;

export const selectStatistics = (state) =>
  state.australiaGameEntry.statistics;

export default gameEntrySlice.reducer;