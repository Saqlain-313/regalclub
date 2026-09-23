import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

// ======================================================
// INITIAL STATE
// ======================================================
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

// ======================================================
// ERROR HELPER
// ======================================================
const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// ======================================================
// GET ALL GAME ENTRIES
// ======================================================
export const fetchGameEntries = createAsyncThunk(
  "bangladeshGameEntry/fetchAll",
  async (
    {
      page = 1,
      limit = 10,
      filters = {},
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.set("page", page);
      queryParams.set("limit", limit);

      Object.entries(filters || {}).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            queryParams.set(key, value);
          }
        }
      );

      const response = await api.get(
        `/admin/bangladesh/game-entries?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: getErrorMessage(
            error,
            "Failed to fetch game entries"
          ),
        }
      );
    }
  }
);

// ======================================================
// GET GAME ENTRY BY ID
// ======================================================
export const fetchGameEntryById = createAsyncThunk(
  "bangladeshGameEntry/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue({
          message: "Game entry ID is required",
        });
      }

      const response = await api.get(
        `/admin/bangladesh/game-entries/${id}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: getErrorMessage(
            error,
            "Failed to fetch game entry"
          ),
        }
      );
    }
  }
);

// ======================================================
// GET GAME ENTRIES BY STATUS
// ======================================================
export const fetchGameEntriesByStatus =
  createAsyncThunk(
    "bangladeshGameEntry/fetchByStatus",
    async (
      {
        status,
        page = 1,
        limit = 10,
      } = {},
      { rejectWithValue }
    ) => {
      try {
        const params = new URLSearchParams();

        params.set("page", page);
        params.set("limit", limit);

        if (status) {
          params.set("status", status);
        }

        const response = await api.get(
          `/admin/bangladesh/game-entries/status/${encodeURIComponent(
            status
          )}?${params.toString()}`
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to fetch entries by status"
            ),
          }
        );
      }
    }
  );

// ======================================================
// SEARCH GAME ENTRIES BY USER
// ======================================================
export const searchGameEntriesByUser =
  createAsyncThunk(
    "bangladeshGameEntry/searchByUser",
    async (
      {
        query = "",
        page = 1,
        limit = 10,
        status = "",
      } = {},
      { rejectWithValue }
    ) => {
      try {
        const params = new URLSearchParams();

        params.set("query", query);
        params.set("page", page);
        params.set("limit", limit);

        if (status) {
          params.set("status", status);
        }

        const response = await api.get(
          `/admin/bangladesh/game-entries/search?${params.toString()}`
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to search entries"
            ),
          }
        );
      }
    }
  );

// ======================================================
// DASHBOARD ENTRIES
// ======================================================
export const fetchDashboardEntries =
  createAsyncThunk(
    "bangladeshGameEntry/fetchDashboard",
    async (
      {
        limit = 10,
        status = "",
      } = {},
      { rejectWithValue }
    ) => {
      try {
        const params = new URLSearchParams();

        params.set("limit", limit);

        if (status) {
          params.set("status", status);
        }

        const response = await api.get(
          `/admin/bangladesh/game-entries/dashboard?${params.toString()}`
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to fetch dashboard entries"
            ),
          }
        );
      }
    }
  );

// ======================================================
// GAME ENTRY STATISTICS
// ======================================================
export const fetchGameEntryStatistics =
  createAsyncThunk(
    "bangladeshGameEntry/fetchStatistics",
    async (
      {
        startDate = "",
        endDate = "",
      } = {},
      { rejectWithValue }
    ) => {
      try {
        const params = new URLSearchParams();

        if (startDate) {
          params.set("startDate", startDate);
        }

        if (endDate) {
          params.set("endDate", endDate);
        }

        const query = params.toString();

        const response = await api.get(
          `/admin/bangladesh/game-entries/statistics${
            query ? `?${query}` : ""
          }`
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to fetch statistics"
            ),
          }
        );
      }
    }
  );

// ======================================================
// GAME ENTRY SUMMARY
// ======================================================
export const fetchGameEntrySummary =
  createAsyncThunk(
    "bangladeshGameEntry/fetchSummary",
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.get(
          "/admin/bangladesh/game-entries/summary"
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to fetch summary"
            ),
          }
        );
      }
    }
  );

// ======================================================
// UPDATE GAME ENTRY STATUS
// ======================================================
export const updateGameEntryStatus =
  createAsyncThunk(
    "bangladeshGameEntry/updateStatus",
    async (
      { id, status },
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          return rejectWithValue({
            message: "Game entry ID is required",
          });
        }

        if (!status) {
          return rejectWithValue({
            message: "Status is required",
          });
        }

        const response = await api.put(
          `/admin/bangladesh/game-entries/${id}/status`,
          {
            status,
          }
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to update status"
            ),
          }
        );
      }
    }
  );

// ======================================================
// DELETE GAME ENTRY
// ======================================================
export const deleteGameEntry =
  createAsyncThunk(
    "bangladeshGameEntry/delete",
    async (id, { rejectWithValue }) => {
      try {
        if (!id) {
          return rejectWithValue({
            message: "Game entry ID is required",
          });
        }

        const response = await api.delete(
          `/admin/bangladesh/game-entries/${id}`
        );

        return {
          id,
          ...response.data,
        };
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to delete entry"
            ),
          }
        );
      }
    }
  );

// ======================================================
// BULK UPDATE STATUS
// ======================================================
export const bulkUpdateGameEntryStatus =
  createAsyncThunk(
    "bangladeshGameEntry/bulkUpdateStatus",
    async (
      { ids, status },
      { rejectWithValue }
    ) => {
      try {
        if (!Array.isArray(ids) || ids.length === 0) {
          return rejectWithValue({
            message: "At least one entry ID is required",
          });
        }

        if (!status) {
          return rejectWithValue({
            message: "Status is required",
          });
        }

        const response = await api.put(
          "/admin/bangladesh/game-entries/bulk/status",
          {
            ids,
            status,
          }
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to bulk update status"
            ),
          }
        );
      }
    }
  );

// ======================================================
// GET ENTRIES BY USER
// ======================================================
export const fetchGameEntriesByUser =
  createAsyncThunk(
    "bangladeshGameEntry/fetchByUser",
    async (
      {
        userId,
        page = 1,
        limit = 10,
        status = "",
      } = {},
      { rejectWithValue }
    ) => {
      try {
        if (!userId) {
          return rejectWithValue({
            message: "User ID is required",
          });
        }

        const params = new URLSearchParams();

        params.set("page", page);
        params.set("limit", limit);

        if (status) {
          params.set("status", status);
        }

        const response = await api.get(
          `/admin/bangladesh/game-entries/user/${userId}?${params.toString()}`
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to fetch user entries"
            ),
          }
        );
      }
    }
  );

// ======================================================
// PLAYER GAME DETAILS
// ======================================================
export const fetchPlayerGameDetails =
  createAsyncThunk(
    "bangladeshGameEntry/fetchPlayerDetails",
    async (
      { poolId, userId },
      { rejectWithValue }
    ) => {
      try {
        if (!poolId || !userId) {
          return rejectWithValue({
            message:
              "Pool ID and User ID are required",
          });
        }

        const response = await api.get(
          `/admin/bangladesh/game-entries/${poolId}/player/${userId}`
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data || {
            message: getErrorMessage(
              error,
              "Failed to fetch player details"
            ),
          }
        );
      }
    }
  );

// ======================================================
// SLICE
// ======================================================
const gameEntrySlice = createSlice({
  name: "bangladeshGameEntry",

  initialState,

  reducers: {
    // ==================================================
    // SET FILTERS
    // ==================================================
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    // ==================================================
    // RESET FILTERS
    // ==================================================
    resetFilters: (state) => {
      state.filters = {
        ...initialState.filters,
      };
    },

    // ==================================================
    // CLEAR SELECTED ENTRY
    // ==================================================
    clearSelectedEntry: (state) => {
      state.selectedEntry = null;
    },

    // ==================================================
    // SET PAGE
    // ==================================================
    setPage: (state, action) => {
      state.pagination.currentPage =
        action.payload;
    },

    // ==================================================
    // SET PAGINATION
    // ==================================================
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },

    // ==================================================
    // CLEAR ERROR
    // ==================================================
    clearError: (state) => {
      state.error = null;
    },

    // ==================================================
    // CLEAR ENTRIES
    // ==================================================
    clearEntries: (state) => {
      state.entries = [];
    },
  },

  extraReducers: (builder) => {
    // ==================================================
    // GET ALL
    // ==================================================
    builder
      .addCase(
        fetchGameEntries.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchGameEntries.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.entries = Array.isArray(
            action.payload?.data
          )
            ? action.payload.data
            : [];

          state.pagination =
            action.payload?.pagination ||
            state.pagination;

          state.stats =
            action.payload?.stats ||
            state.stats;
        }
      )

      .addCase(
        fetchGameEntries.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to fetch game entries";
        }
      )

      // ==================================================
      // GET BY ID
      // ==================================================
      .addCase(
        fetchGameEntryById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchGameEntryById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.selectedEntry =
            action.payload?.data || null;
        }
      )

      .addCase(
        fetchGameEntryById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to fetch game entry";
        }
      )

      // ==================================================
      // BY STATUS
      // ==================================================
      .addCase(
        fetchGameEntriesByStatus.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchGameEntriesByStatus.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.entries = Array.isArray(
            action.payload?.data
          )
            ? action.payload.data
            : [];

          state.pagination =
            action.payload?.pagination ||
            state.pagination;
        }
      )

      .addCase(
        fetchGameEntriesByStatus.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to fetch entries by status";
        }
      )

      // ==================================================
      // SEARCH
      // ==================================================
      .addCase(
        searchGameEntriesByUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        searchGameEntriesByUser.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.entries = Array.isArray(
            action.payload?.data
          )
            ? action.payload.data
            : [];

          state.pagination =
            action.payload?.pagination ||
            state.pagination;
        }
      )

      .addCase(
        searchGameEntriesByUser.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to search entries";
        }
      )

      // ==================================================
      // DASHBOARD
      // ==================================================
      .addCase(
        fetchDashboardEntries.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchDashboardEntries.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.entries = Array.isArray(
            action.payload?.data
          )
            ? action.payload.data
            : [];
        }
      )

      .addCase(
        fetchDashboardEntries.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to fetch dashboard entries";
        }
      )

      // ==================================================
      // STATISTICS
      // ==================================================
      .addCase(
        fetchGameEntryStatistics.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchGameEntryStatistics.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.statistics =
            action.payload?.data ||
            state.statistics;
        }
      )

      .addCase(
        fetchGameEntryStatistics.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to fetch statistics";
        }
      )

      // ==================================================
      // SUMMARY
      // ==================================================
      .addCase(
        fetchGameEntrySummary.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchGameEntrySummary.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const summary =
            action.payload?.data;

          if (summary) {
            state.summary = summary;

            if (summary.total) {
              const totalEntries =
                Number(
                  summary.total.totalEntries
                ) || 0;

              const totalRevenue =
                Number(
                  summary.total.totalRevenue
                ) || 0;

              state.stats = {
                totalRevenue,
                averagePrice:
                  totalEntries > 0
                    ? totalRevenue /
                      totalEntries
                    : 0,
                totalEntries,
                totalPlayers:
                  Number(
                    summary.total.totalPlayers
                  ) || 0,
                open:
                  Number(
                    summary.total.open
                  ) || 0,
                closed:
                  Number(
                    summary.total.closed
                  ) || 0,
                completed:
                  Number(
                    summary.total.completed
                  ) || 0,
              };
            }
          }
        }
      )

      .addCase(
        fetchGameEntrySummary.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to fetch summary";
        }
      )

      // ==================================================
      // UPDATE STATUS
      // ==================================================
      .addCase(
        updateGameEntryStatus.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        updateGameEntryStatus.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const updatedEntry =
            action.payload?.data;

          if (!updatedEntry) {
            return;
          }

          const updatedId =
            updatedEntry._id ||
            updatedEntry.poolId;

          const index =
            state.entries.findIndex(
              (entry) =>
                entry._id === updatedId ||
                entry.poolId === updatedId
            );

          if (index !== -1) {
            state.entries[index] = {
              ...state.entries[index],
              ...updatedEntry,
              status:
                updatedEntry.status ||
                state.entries[index].status,
            };
          }

          if (
            state.selectedEntry &&
            (
              state.selectedEntry._id ===
                updatedId ||
              state.selectedEntry.poolId ===
                updatedId
            )
          ) {
            state.selectedEntry = {
              ...state.selectedEntry,
              ...updatedEntry,
            };
          }
        }
      )

      .addCase(
        updateGameEntryStatus.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to update status";
        }
      )

      // ==================================================
      // DELETE
      // ==================================================
      .addCase(
        deleteGameEntry.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        deleteGameEntry.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const deletedId =
            action.payload?.id;

          state.entries =
            state.entries.filter(
              (entry) =>
                entry._id !== deletedId &&
                entry.poolId !== deletedId
            );

          state.pagination.totalEntries =
            Math.max(
              0,
              Number(
                state.pagination.totalEntries
              ) - 1
            );

          if (
            state.selectedEntry &&
            (
              state.selectedEntry._id ===
                deletedId ||
              state.selectedEntry.poolId ===
                deletedId
            )
          ) {
            state.selectedEntry = null;
          }
        }
      )

      .addCase(
        deleteGameEntry.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to delete entry";
        }
      )

      // ==================================================
      // BULK UPDATE
      // ==================================================
      .addCase(
        bulkUpdateGameEntryStatus.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        bulkUpdateGameEntryStatus.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const updatedEntries =
            action.payload?.data;

          if (Array.isArray(updatedEntries)) {
            updatedEntries.forEach(
              (updatedEntry) => {
                const updatedId =
                  updatedEntry._id ||
                  updatedEntry.poolId;

                const index =
                  state.entries.findIndex(
                    (entry) =>
                      entry._id ===
                        updatedId ||
                      entry.poolId ===
                        updatedId
                  );

                if (index !== -1) {
                  state.entries[index] = {
                    ...state.entries[index],
                    ...updatedEntry,
                  };
                }
              }
            );
          }
        }
      )

      .addCase(
        bulkUpdateGameEntryStatus.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to bulk update status";
        }
      )

      // ==================================================
      // BY USER
      // ==================================================
      .addCase(
        fetchGameEntriesByUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchGameEntriesByUser.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.entries = Array.isArray(
            action.payload?.data
          )
            ? action.payload.data
            : [];

          state.pagination =
            action.payload?.pagination ||
            state.pagination;
        }
      )

      .addCase(
        fetchGameEntriesByUser.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.payload ||
            "Failed to fetch user entries";
        }
      )

      // ==================================================
      // PLAYER DETAILS
      // ==================================================
      .addCase(
        fetchPlayerGameDetails.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchPlayerGameDetails.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

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
            action.payload ||
            "Failed to fetch player details";
        }
      );
  },
});

// ======================================================
// ACTIONS
// ======================================================
export const {
  setFilters,
  resetFilters,
  clearSelectedEntry,
  setPage,
  setPagination,
  clearError,
  clearEntries,
} = gameEntrySlice.actions;

// ======================================================
// SELECTORS
// ======================================================
export const selectAllEntries = (state) =>
  state.bangladeshGameEntry?.entries || [];

export const selectSelectedEntry = (state) =>
  state.bangladeshGameEntry?.selectedEntry || null;

export const selectLoading = (state) =>
  state.bangladeshGameEntry?.loading || false;

export const selectError = (state) =>
  state.bangladeshGameEntry?.error || null;

export const selectPagination = (state) =>
  state.bangladeshGameEntry?.pagination ||
  initialState.pagination;

export const selectStats = (state) =>
  state.bangladeshGameEntry?.stats ||
  initialState.stats;

export const selectFilters = (state) =>
  state.bangladeshGameEntry?.filters ||
  initialState.filters;

export const selectSummary = (state) =>
  state.bangladeshGameEntry?.summary ||
  initialState.summary;

export const selectStatistics = (state) =>
  state.bangladeshGameEntry?.statistics ||
  initialState.statistics;

// ======================================================
// REDUCER
// ======================================================
export default gameEntrySlice.reducer;