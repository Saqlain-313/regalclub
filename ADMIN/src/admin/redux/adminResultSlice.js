import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// ============================================================
// DECLARE RESULT
// ============================================================

export const declareResult = createAsyncThunk(
  "adminResult/declare",
  async (resultData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/results/declare",
        resultData
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to declare result"
      );
    }
  }
);

// ============================================================
// GET ALL RESULTS - ADMIN
// ============================================================

export const getAdminResults = createAsyncThunk(
  "adminResult/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        "/results",
        { params }
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to get results"
      );
    }
  }
);

// ============================================================
// GET RESULT STATS - ADMIN
// ============================================================

export const getAdminResultStats = createAsyncThunk(
  "adminResult/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        "/results/stats/overview"
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to get stats"
      );
    }
  }
);

// ============================================================
// GET RESULT BY ID
// ============================================================

export const getResultById = createAsyncThunk(
  "adminResult/getById",
  async (resultId, { rejectWithValue }) => {
    try {
      if (!resultId) {
        return rejectWithValue(
          "Result ID is required"
        );
      }

      const { data } = await api.get(
        `/results/${resultId}`
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to get result details"
      );
    }
  }
);

// ============================================================
// GET UNSELECTED NUMBERS
// ============================================================
//
// Example:
//
// dispatch(
//   getUnselectedNumbers({
//     gamePoolId: selectedPool._id
//   })
// );
//
// ============================================================

export const getUnselectedNumbers =
  createAsyncThunk(
    "adminResult/getUnselectedNumbers",

    async (
      {
        gamePoolId,
        country,
      } = {},
      { rejectWithValue }
    ) => {
      try {
        if (!gamePoolId && !country) {
          return rejectWithValue(
            "gamePoolId or country is required"
          );
        }

        const params = {};

        if (gamePoolId) {
          params.gamePoolId =
            gamePoolId;
        }

        if (country) {
          params.country =
            country;
        }

        const { data } = await api.get(
          "/results/unselected-numbers",
          {
            params,
          }
        );

        return data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to get unselected numbers"
        );
      }
    }
  );

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  // Results
  results: [],

  currentResult: null,

  // Stats
  stats: null,

  // ==========================================================
  // UNSELECTED NUMBERS
  // ==========================================================

  selectedNumbers: {
    mainNumbers: [],
    powerballs: [],
  },

  unselectedNumbers: {
    mainNumbers: [],
    powerballs: [],
  },

  unselectedCounts: {
    selectedMainNumbers: 0,
    unselectedMainNumbers: 0,
    selectedPowerballs: 0,
    unselectedPowerballs: 0,
  },

  unselectedCountry: null,
  unselectedGamePoolId: null,
  unselectedDrawNo: null,

  // Loading
  loading: false,
  unselectedNumbersLoading: false,

  // Status
  error: null,
  message: "",
  success: false,

  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// ============================================================
// SLICE
// ============================================================

const adminResultSlice = createSlice({
  name: "adminResult",

  initialState,

  reducers: {
    // ========================================================
    // CLEAR ERROR
    // ========================================================

    clearError: (state) => {
      state.error = null;
    },

    // ========================================================
    // CLEAR MESSAGE
    // ========================================================

    clearMessage: (state) => {
      state.message = "";
      state.success = false;
    },

    // ========================================================
    // CLEAR CURRENT RESULT
    // ========================================================

    clearCurrentResult: (state) => {
      state.currentResult = null;
    },

    // ========================================================
    // CLEAR UNSELECTED NUMBERS
    // ========================================================

    clearUnselectedNumbers: (state) => {
      state.selectedNumbers = {
        mainNumbers: [],
        powerballs: [],
      };

      state.unselectedNumbers = {
        mainNumbers: [],
        powerballs: [],
      };

      state.unselectedCounts = {
        selectedMainNumbers: 0,
        unselectedMainNumbers: 0,
        selectedPowerballs: 0,
        unselectedPowerballs: 0,
      };

      state.unselectedCountry = null;
      state.unselectedGamePoolId = null;
      state.unselectedDrawNo = null;

      state.unselectedNumbersLoading =
        false;
    },
  },

  // ==========================================================
  // EXTRA REDUCERS
  // ==========================================================

  extraReducers: (builder) => {
    builder

      // ======================================================
      // DECLARE RESULT
      // ======================================================

      .addCase(
        declareResult.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        declareResult.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;
          state.error = null;

          state.message =
            action.payload?.message ||
            "Result declared successfully";

          const newResult =
            action.payload?.data?.result;

          if (newResult) {
            state.results.unshift(
              newResult
            );
          }

          // Result declare hone ke baad
          // old unselected data clear karo

          state.selectedNumbers = {
            mainNumbers: [],
            powerballs: [],
          };

          state.unselectedNumbers = {
            mainNumbers: [],
            powerballs: [],
          };

          state.unselectedCounts = {
            selectedMainNumbers: 0,
            unselectedMainNumbers: 0,
            selectedPowerballs: 0,
            unselectedPowerballs: 0,
          };

          state.unselectedCountry =
            null;

          state.unselectedGamePoolId =
            null;

          state.unselectedDrawNo =
            null;
        }
      )

      .addCase(
        declareResult.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;

          state.error =
            action.payload ||
            "Failed to declare result";
        }
      )

      // ======================================================
      // GET ALL RESULTS
      // ======================================================

      .addCase(
        getAdminResults.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getAdminResults.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.results =
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
        }
      )

      .addCase(
        getAdminResults.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to get results";
        }
      )

      // ======================================================
      // GET RESULT STATS
      // ======================================================

      .addCase(
        getAdminResultStats.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getAdminResultStats.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.stats =
            action.payload?.data ||
            null;
        }
      )

      .addCase(
        getAdminResultStats.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to get stats";
        }
      )

      // ======================================================
      // GET RESULT BY ID
      // ======================================================

      .addCase(
        getResultById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getResultById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.currentResult =
            action.payload?.data ||
            null;
        }
      )

      .addCase(
        getResultById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to get result details";
        }
      )

      // ======================================================
      // GET UNSELECTED NUMBERS
      // ======================================================

      .addCase(
        getUnselectedNumbers.pending,
        (state) => {
          state.unselectedNumbersLoading =
            true;

          state.error = null;
        }
      )

      .addCase(
        getUnselectedNumbers.fulfilled,
        (state, action) => {
          state.unselectedNumbersLoading =
            false;

          state.error = null;

          const data =
            action.payload || {};

          // ==================================================
          // COUNTRY
          // ==================================================

          state.unselectedCountry =
            data.country ||
            null;

          // ==================================================
          // GAME POOL
          // ==================================================

          state.unselectedGamePoolId =
            data.gamePoolId ||
            null;

          // ==================================================
          // DRAW NO
          // ==================================================

          state.unselectedDrawNo =
            data.drawNo ??
            null;

          // ==================================================
          // SELECTED NUMBERS
          // ==================================================

          state.selectedNumbers = {
            mainNumbers:
              Array.isArray(
                data.selected
                  ?.mainNumbers
              )
                ? data.selected
                    .mainNumbers
                : [],

            powerballs:
              Array.isArray(
                data.selected
                  ?.powerballs
              )
                ? data.selected
                    .powerballs
                : [],
          };

          // ==================================================
          // UNSELECTED NUMBERS
          // ==================================================

          state.unselectedNumbers = {
            mainNumbers:
              Array.isArray(
                data.unselected
                  ?.mainNumbers
              )
                ? data.unselected
                    .mainNumbers
                : [],

            powerballs:
              Array.isArray(
                data.unselected
                  ?.powerballs
              )
                ? data.unselected
                    .powerballs
                : [],
          };

          // ==================================================
          // COUNTS
          // ==================================================

          state.unselectedCounts = {
            selectedMainNumbers:
              Number(
                data.counts
                  ?.selectedMainNumbers
              ) || 0,

            unselectedMainNumbers:
              Number(
                data.counts
                  ?.unselectedMainNumbers
              ) || 0,

            selectedPowerballs:
              Number(
                data.counts
                  ?.selectedPowerballs
              ) || 0,

            unselectedPowerballs:
              Number(
                data.counts
                  ?.unselectedPowerballs
              ) || 0,
          };
        }
      )

      .addCase(
        getUnselectedNumbers.rejected,
        (state, action) => {
          state.unselectedNumbersLoading =
            false;

          state.error =
            action.payload ||
            "Failed to get unselected numbers";

          state.selectedNumbers = {
            mainNumbers: [],
            powerballs: [],
          };

          state.unselectedNumbers = {
            mainNumbers: [],
            powerballs: [],
          };

          state.unselectedCounts = {
            selectedMainNumbers: 0,
            unselectedMainNumbers: 0,
            selectedPowerballs: 0,
            unselectedPowerballs: 0,
          };
        }
      );
  },
});

// ============================================================
// ACTIONS
// ============================================================

export const {
  clearError,
  clearMessage,
  clearCurrentResult,
  clearUnselectedNumbers,
} = adminResultSlice.actions;

// ============================================================
// SELECTORS
// ============================================================

export const selectAdminResults = (state) =>
  state.adminResult?.results || [];

export const selectCurrentResult = (state) =>
  state.adminResult?.currentResult ||
  null;

export const selectAdminResultStats = (state) =>
  state.adminResult?.stats || null;

export const selectAdminResultLoading = (
  state
) =>
  state.adminResult?.loading || false;

export const selectAdminResultError = (
  state
) =>
  state.adminResult?.error || null;

export const selectAdminResultSuccess = (
  state
) =>
  state.adminResult?.success || false;

export const selectAdminResultMessage = (
  state
) =>
  state.adminResult?.message || "";

export const selectAdminResultPagination = (
  state
) =>
  state.adminResult?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  };

// ============================================================
// SELECTED NUMBERS
// ============================================================

export const selectAdminSelectedNumbers = (
  state
) =>
  state.adminResult
    ?.selectedNumbers || {
    mainNumbers: [],
    powerballs: [],
  };

// ============================================================
// UNSELECTED NUMBERS
// ============================================================

export const selectAdminUnselectedNumbers = (
  state
) =>
  state.adminResult
    ?.unselectedNumbers || {
    mainNumbers: [],
    powerballs: [],
  };

// ============================================================
// UNSELECTED COUNTS
// ============================================================

export const selectAdminUnselectedCounts = (
  state
) =>
  state.adminResult
    ?.unselectedCounts || {
    selectedMainNumbers: 0,
    unselectedMainNumbers: 0,
    selectedPowerballs: 0,
    unselectedPowerballs: 0,
  };

// ============================================================
// UNSELECTED LOADING
// ============================================================

export const selectAdminUnselectedNumbersLoading = (
  state
) =>
  state.adminResult
    ?.unselectedNumbersLoading ||
  false;

// ============================================================
// COUNTRY
// ============================================================

export const selectAdminUnselectedCountry = (
  state
) =>
  state.adminResult
    ?.unselectedCountry || null;

// ============================================================
// GAME POOL ID
// ============================================================

export const selectAdminUnselectedGamePoolId = (
  state
) =>
  state.adminResult
    ?.unselectedGamePoolId || null;

// ============================================================
// DRAW NO
// ============================================================

export const selectAdminUnselectedDrawNo = (
  state
) =>
  state.adminResult
    ?.unselectedDrawNo || null;

// ============================================================
// DEFAULT
// ============================================================

export default adminResultSlice.reducer;