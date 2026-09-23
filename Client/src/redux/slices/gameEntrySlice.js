import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// ================= CREATE GAME ENTRY =================
export const createGameEntry = createAsyncThunk(
  "gameEntry/create",
  async (formData, { rejectWithValue }) => {
    try {
      const countryAliases = {
        // INDIA
        india: "india",
        in: "india",

        // AUSTRALIA
        australia: "australia",
        au: "australia",

        // PAKISTAN
        pakistan: "pakistan",
        pk: "pakistan",

        // BANGLADESH
        bangladesh: "bangladesh",
        bd: "bangladesh",
        bangla: "bangladesh",

        // NEPAL
        nepal: "nepal",
        np: "nepal",

        // UAE
        uae: "uae",
        ae: "uae",
        dubai: "uae",
      };

      const rawCountry =
        formData?.country ||
        formData?.countryName ||
        "";

      const country =
        countryAliases[
          String(rawCountry)
            .trim()
            .toLowerCase()
        ];

      if (!country) {
        return rejectWithValue(
          "Valid country is required for game entry."
        );
      }

      console.log(
        "GAME ENTRY COUNTRY:",
        country
      );

      console.log(
        "GAME ENTRY FORM DATA:",
        formData
      );

      const { data } = await api.post(
        `/${country}/game-entry`,
        formData
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ================= GET MY GAME ENTRIES =================
export const getMyGameEntries = createAsyncThunk(
  "gameEntry/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams =
        new URLSearchParams();

      if (params.page) {
        queryParams.append(
          "page",
          params.page
        );
      }

      if (params.limit) {
        queryParams.append(
          "limit",
          params.limit
        );
      }

      if (params.status) {
        queryParams.append(
          "status",
          params.status
        );
      }

      if (params.country) {
        queryParams.append(
          "country",
          params.country
        );
      }

      const queryString =
        queryParams.toString();

      const url = queryString
        ? `/game-entry?${queryString}`
        : "/game-entry";

      const { data } =
        await api.get(url);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ================= GET SINGLE GAME ENTRY =================
export const getSingleGameEntry =
  createAsyncThunk(
    "gameEntry/getSingle",
    async (id, { rejectWithValue }) => {
      try {
        const { data } =
          await api.get(
            `/game-entry/${id}`
          );

        return data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Something went wrong."
        );
      }
    }
  );

// ================= GET ENTRY RESULTS =================
export const getEntryResults =
  createAsyncThunk(
    "gameEntry/getResults",
    async (id, { rejectWithValue }) => {
      try {
        const { data } =
          await api.get(
            `/game-entry/${id}/results`
          );

        return data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Something went wrong."
        );
      }
    }
  );

// ================= DELETE ENTRY =================
export const deleteGameEntry =
  createAsyncThunk(
    "gameEntry/delete",
    async (id, { rejectWithValue }) => {
      try {
        await api.delete(
          `/game-entry/${id}`
        );

        return id;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Something went wrong."
        );
      }
    }
  );

// ================= CANCEL ENTRY (WITH REFUND) =================
export const cancelGameEntry =
  createAsyncThunk(
    "gameEntry/cancel",
    async (id, { rejectWithValue }) => {
      try {
        const { data } =
          await api.put(
            `/game-entry/${id}/cancel`
          );

        return data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Something went wrong."
        );
      }
    }
  );

// ================= GET USER credit =================
export const getUsercredit =
  createAsyncThunk(
    "gameEntry/getcredit",
    async (_, { rejectWithValue }) => {
      try {
        const { data } =
          await api.get(
            "/game-entry/credit/me"
          );

        return data.credit;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Something went wrong."
        );
      }
    }
  );

// ================= GET ENTRIES BY COUNTRY =================
export const getEntriesByCountry =
  createAsyncThunk(
    "gameEntry/getByCountry",
    async (country, { rejectWithValue }) => {
      try {
        const countryAliases = {
          india: "india",
          in: "india",

          australia: "australia",
          au: "australia",

          pakistan: "pakistan",
          pk: "pakistan",

          bangladesh: "bangladesh",
          bd: "bangladesh",
          bangla: "bangladesh",

          nepal: "nepal",
          np: "nepal",

          uae: "uae",
          ae: "uae",
          dubai: "uae",
        };

        const normalizedCountry =
          countryAliases[
            String(country || "")
              .trim()
              .toLowerCase()
          ];

        if (!normalizedCountry) {
          return rejectWithValue(
            "Valid country is required."
          );
        }

        const { data } =
          await api.get(
            `/game-entry/country/${normalizedCountry}`
          );

        return data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Something went wrong."
        );
      }
    }
  );

// ======================================================
// INITIAL STATE
// ======================================================

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
    pages: 0,
  },

  filters: {
    country: null,
    status: null,
  },
};

// ======================================================
// SLICE
// ======================================================

const gameEntrySlice = createSlice({
  name: "gameEntry",

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

    setCountryFilter: (
      state,
      action
    ) => {
      state.filters.country =
        action.payload;
    },

    setStatusFilter: (
      state,
      action
    ) => {
      state.filters.status =
        action.payload;
    },

    clearFilters: (state) => {
      state.filters.country = null;
      state.filters.status = null;
    },

    updatePagination: (
      state,
      action
    ) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
  },

  extraReducers: (builder) => {
    builder

      // ==================================================
      // CREATE GAME ENTRY
      // ==================================================

      .addCase(
        createGameEntry.pending,
        (state) => {
          state.loading = true;
          state.success = false;
          state.error = null;
        }
      )

      .addCase(
        createGameEntry.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.entry =
            action.payload?.data?.pool ||
            null;

          state.message =
            action.payload?.message ||
            "Entry created successfully";

          if (
            action.payload?.data?.pool
          ) {
            state.entries.unshift(
              action.payload.data.pool
            );
          }

          if (
            action.payload?.credit
          ) {
            state.credit =
              action.payload.credit.amount;
          }
        }
      )

      .addCase(
        createGameEntry.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;
          state.error =
            action.payload;
        }
      )

      // ==================================================
      // GET ALL ENTRIES
      // ==================================================

      .addCase(
        getMyGameEntries.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getMyGameEntries.fulfilled,
        (state, action) => {
          state.loading = false;

          state.entries =
            Array.isArray(
              action.payload?.data
            )
              ? action.payload.data
              : [];

          if (
            action.payload?.pagination
          ) {
            state.pagination =
              action.payload.pagination;
          }

          if (
            action.payload?.filter
          ) {
            state.filters = {
              ...state.filters,
              ...action.payload.filter,
            };
          }
        }
      )

      .addCase(
        getMyGameEntries.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
          state.entries = [];
        }
      )

      // ==================================================
      // GET SINGLE ENTRY
      // ==================================================

      .addCase(
        getSingleGameEntry.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getSingleGameEntry.fulfilled,
        (state, action) => {
          state.loading = false;
          state.selectedEntry =
            action.payload;

          if (
            action.payload?.result
          ) {
            state.results =
              action.payload.result;

            state.winningNumbers =
              action.payload.winningNumbers;
          }
        }
      )

      .addCase(
        getSingleGameEntry.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
          state.selectedEntry = null;
        }
      )

      // ==================================================
      // GET RESULTS
      // ==================================================

      .addCase(
        getEntryResults.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getEntryResults.fulfilled,
        (state, action) => {
          state.loading = false;

          state.results =
            action.payload;

          state.winningNumbers =
            action.payload
              ?.winningNumbers ||
            null;

          state.selectedEntry =
            action.payload?.entry ||
            null;
        }
      )

      .addCase(
        getEntryResults.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;

          state.results = null;
          state.winningNumbers = null;
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

          state.entries =
            state.entries.filter(
              (item) =>
                item._id !==
                  action.payload &&
                item.poolId !==
                  action.payload
            );

          if (
            state.selectedEntry?._id ===
              action.payload ||
            state.selectedEntry?.poolId ===
              action.payload
          ) {
            state.selectedEntry = null;
            state.results = null;
            state.winningNumbers = null;
          }

          state.message =
            "Entry deleted successfully";
        }
      )

      .addCase(
        deleteGameEntry.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
        }
      )

      // ==================================================
      // CANCEL ENTRY
      // ==================================================

      .addCase(
        cancelGameEntry.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        cancelGameEntry.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.message =
            action.payload?.message ||
            "Entry cancelled successfully";

          if (
            action.payload?.data?.poolId
          ) {
            state.entries =
              state.entries.filter(
                (item) =>
                  item._id !==
                    action.payload.data.poolId &&
                  item.poolId !==
                    action.payload.data.poolId
              );
          }

          if (
            action.payload?.credit
          ) {
            state.credit =
              action.payload.credit.amount;
          }

          if (
            state.selectedEntry
          ) {
            state.selectedEntry = null;
            state.results = null;
            state.winningNumbers = null;
          }
        }
      )

      .addCase(
        cancelGameEntry.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
        }
      )

      // ==================================================
      // GET credit
      // ==================================================

      .addCase(
        getUsercredit.fulfilled,
        (state, action) => {
          state.credit =
            action.payload;
        }
      )

      .addCase(
        getUsercredit.rejected,
        (state) => {
          state.credit = 0;
        }
      )

      // ==================================================
      // GET ENTRIES BY COUNTRY
      // ==================================================

      .addCase(
        getEntriesByCountry.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getEntriesByCountry.fulfilled,
        (state, action) => {
          state.loading = false;

          state.entries =
            Array.isArray(
              action.payload
            )
              ? action.payload
              : [];

          state.filters.country =
            action.meta.arg;
        }
      )

      .addCase(
        getEntriesByCountry.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
          state.entries = [];
        }
      );
  },
});

// ======================================================
// ACTIONS
// ======================================================

export const {
  resetGameEntryState,
  clearSelectedEntry,
  clearGameEntryError,
  setCountryFilter,
  setStatusFilter,
  clearFilters,
  updatePagination,
} = gameEntrySlice.actions;

// ======================================================
// SELECTORS
// ======================================================

export const selectAllEntries = (
  state
) => state.gameEntry.entries;

export const selectSelectedEntry = (
  state
) => state.gameEntry.selectedEntry;

export const selectEntryResults = (
  state
) => state.gameEntry.results;

export const selectWinningNumbers = (
  state
) => state.gameEntry.winningNumbers;

export const selectcredit = (
  state
) => state.gameEntry.credit;

export const selectGameEntryLoading = (
  state
) => state.gameEntry.loading;

export const selectGameEntrySuccess = (
  state
) => state.gameEntry.success;

export const selectGameEntryError = (
  state
) => state.gameEntry.error;

export const selectGameEntryMessage = (
  state
) => state.gameEntry.message;

export const selectPagination = (
  state
) => state.gameEntry.pagination;

export const selectFilters = (
  state
) => state.gameEntry.filters;

export const selectEntriesByCountry = (
  state,
  country
) => {
  const normalizedCountry =
    String(country || "")
      .trim()
      .toLowerCase();

  return state.gameEntry.entries.filter(
    (entry) =>
      String(entry.country || "")
        .trim()
        .toLowerCase() ===
      normalizedCountry
  );
};

export const selectEntriesByStatus = (
  state,
  status
) =>
  state.gameEntry.entries.filter(
    (entry) =>
      entry.poolStatus === status
  );

export default gameEntrySlice.reducer;