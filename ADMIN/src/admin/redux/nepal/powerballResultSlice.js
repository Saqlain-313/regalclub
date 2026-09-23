import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

// ==========================================
// Create Powerball Result
// ==========================================
export const createPowerballResult = createAsyncThunk(
  "nepalPowerballResult/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/admin/nepal/powerball-results/create",
        data
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get All Results
// ==========================================
export const getAllPowerballResults = createAsyncThunk(
  "nepalPowerballResult/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(
        "/admin/nepal/powerball-results"
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get Result By ID
// ==========================================
export const getPowerballResultById = createAsyncThunk(
  "nepalPowerballResult/getById",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Result ID is required."
        );
      }

      const res = await api.get(
        `/admin/nepal/powerball-results/${id}`
      );

      return res.data.result;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ==========================================
// Delete Result
// ==========================================
export const deletePowerballResult = createAsyncThunk(
  "nepalPowerballResult/delete",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Result ID is required."
        );
      }

      await api.delete(
        `/admin/nepal/powerball-results/${id}`
      );

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get All Pending Games
// ==========================================
export const getAllPendingGames = createAsyncThunk(
  "nepalPowerballResult/getAllPendingGames",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(
        "/admin/nepal/powerball-results/pending-games/all"
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get Pending Game by Player ID
// ==========================================
export const getPendingGameByPlayerId = createAsyncThunk(
  "nepalPowerballResult/getPendingGame",
  async (playerId, { rejectWithValue }) => {
    try {
      if (!playerId) {
        return rejectWithValue(
          "Player ID is required."
        );
      }

      const res = await api.get(
        `/admin/nepal/powerball-results/pending-game/${playerId}`
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get Game Pool Details by Pool ID
// ==========================================
export const getGamePoolDetails = createAsyncThunk(
  "nepalPowerballResult/getGamePoolDetails",
  async (poolId, { rejectWithValue }) => {
    try {
      if (!poolId) {
        return rejectWithValue(
          "Pool ID is required."
        );
      }

      const res = await api.get(
        `/admin/nepal/powerball-results/game-pool/${poolId}`
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get Unselected Powerball Numbers
// ==========================================
//
// Example:
//
// dispatch(
//   getUnselectedPowerballNumbers({
//     gamePoolId: poolId
//   })
// );
//
// OR
//
// dispatch(
//   getUnselectedPowerballNumbers({
//     country: "Nepal"
//   })
// );
//
// ==========================================
export const getUnselectedPowerballNumbers =
  createAsyncThunk(
    "nepalPowerballResult/getUnselectedNumbers",

    async (
      { gamePoolId, country } = {},
      { rejectWithValue }
    ) => {
      try {
        if (!gamePoolId && !country) {
          return rejectWithValue(
            "gamePoolId or country is required."
          );
        }

        const params = {};

        if (gamePoolId) {
          params.gamePoolId = gamePoolId;
        }

        if (country) {
          params.country = country;
        }

        const res = await api.get(
          "/admin/nepal/powerball-results/unselected-numbers",
          {
            params,
          }
        );

        return res.data;
      } catch (err) {
        return rejectWithValue(
          err.response?.data?.message ||
            "Failed to fetch unselected numbers."
        );
      }
    }
  );

// ==========================================
// Slice
// ==========================================
const nepalPowerballResultSlice = createSlice({
  name: "nepalPowerballResult",

  initialState: {
    // ========================================
    // RESULTS
    // ========================================

    results: [],
    result: null,

    // ========================================
    // PENDING GAMES
    // ========================================

    pendingGames: [],
    selectedGame: null,
    selectedPool: null,
    selectedDrawNo: null,

    // ========================================
    // SELECTED NUMBERS
    // ========================================

    selectedNumbers: {
      mainNumbers: [],
      powerballs: [],
    },

    // ========================================
    // UNSELECTED NUMBERS
    // ========================================

    unselectedNumbers: {
      mainNumbers: [],
      powerballs: [],
    },

    // ========================================
    // COUNTS
    // ========================================

    unselectedCounts: {
      selectedMainNumbers: 0,
      unselectedMainNumbers: 0,
      selectedPowerballs: 0,
      unselectedPowerballs: 0,
    },

    // ========================================
    // META
    // ========================================

    unselectedCountry: null,
    unselectedGamePoolId: null,
    unselectedDrawNo: null,

    // ========================================
    // LOADING
    // ========================================

    loading: false,
    createLoading: false,
    deleteLoading: false,
    pendingGamesLoading: false,
    unselectedNumbersLoading: false,

    // ========================================
    // STATUS
    // ========================================

    success: false,
    error: null,
    message: "",
  },

  // ========================================
  // REDUCERS
  // ========================================

  reducers: {
    // ======================================
    // CLEAR RESULT STATE
    // ======================================

    clearPowerballResultState: (state) => {
      state.loading = false;
      state.createLoading = false;
      state.deleteLoading = false;
      state.pendingGamesLoading = false;
      state.unselectedNumbersLoading = false;

      state.success = false;
      state.error = null;
      state.message = "";

      state.result = null;
    },

    // ======================================
    // CLEAR PENDING GAMES
    // ======================================

    clearPendingGames: (state) => {
      state.pendingGames = [];

      state.selectedDrawNo = null;
      state.selectedGame = null;
      state.selectedPool = null;

      state.pendingGamesLoading = false;
    },

    // ======================================
    // CLEAR SELECTED GAME
    // ======================================

    clearSelectedGame: (state) => {
      state.selectedGame = null;
      state.selectedDrawNo = null;
    },

    // ======================================
    // CLEAR SELECTED POOL
    // ======================================

    clearSelectedPool: (state) => {
      state.selectedPool = null;
    },

    // ======================================
    // CLEAR UNSELECTED NUMBERS
    // ======================================

    clearUnselectedPowerballNumbers: (state) => {
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

      state.unselectedNumbersLoading = false;
    },
  },

  // ========================================
  // EXTRA REDUCERS
  // ========================================

  extraReducers: (builder) => {
    builder

      // ======================================
      // CREATE
      // ======================================

      .addCase(
        createPowerballResult.pending,
        (state) => {
          state.createLoading = true;
          state.error = null;
          state.success = false;
          state.message = "";
        }
      )

      .addCase(
        createPowerballResult.fulfilled,
        (state, action) => {
          state.createLoading = false;
          state.success = true;
          state.error = null;

          state.message =
            action.payload?.message ||
            "Powerball result created successfully.";

          if (action.payload?.result) {
            state.results.unshift(
              action.payload.result
            );
          }

          state.pendingGames = [];
          state.selectedDrawNo = null;
          state.selectedGame = null;
          state.selectedPool = null;

          // Clear old number data
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
        }
      )

      .addCase(
        createPowerballResult.rejected,
        (state, action) => {
          state.createLoading = false;
          state.success = false;

          state.error =
            action.payload ||
            "Failed to create Powerball result.";
        }
      )

      // ======================================
      // GET ALL
      // ======================================

      .addCase(
        getAllPowerballResults.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getAllPowerballResults.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.results =
            Array.isArray(
              action.payload?.results
            )
              ? action.payload.results
              : [];
        }
      )

      .addCase(
        getAllPowerballResults.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch Powerball results.";
        }
      )

      // ======================================
      // GET BY ID
      // ======================================

      .addCase(
        getPowerballResultById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getPowerballResultById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.result =
            action.payload || null;
        }
      )

      .addCase(
        getPowerballResultById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch Powerball result.";

          state.result = null;
        }
      )

      // ======================================
      // DELETE
      // ======================================

      .addCase(
        deletePowerballResult.pending,
        (state) => {
          state.deleteLoading = true;
          state.error = null;
        }
      )

      .addCase(
        deletePowerballResult.fulfilled,
        (state, action) => {
          state.deleteLoading = false;
          state.error = null;

          state.results =
            state.results.filter(
              (item) =>
                item._id !== action.payload
            );

          state.pendingGames = [];
          state.selectedDrawNo = null;
          state.selectedGame = null;
          state.selectedPool = null;
        }
      )

      .addCase(
        deletePowerballResult.rejected,
        (state, action) => {
          state.deleteLoading = false;

          state.error =
            action.payload ||
            "Failed to delete Powerball result.";
        }
      )

      // ======================================
      // GET ALL PENDING GAMES
      // ======================================

      .addCase(
        getAllPendingGames.pending,
        (state) => {
          state.pendingGamesLoading = true;
          state.error = null;
        }
      )

      .addCase(
        getAllPendingGames.fulfilled,
        (state, action) => {
          state.pendingGamesLoading = false;
          state.error = null;

          state.pendingGames =
            Array.isArray(
              action.payload?.games
            )
              ? action.payload.games
              : [];
        }
      )

      .addCase(
        getAllPendingGames.rejected,
        (state, action) => {
          state.pendingGamesLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch pending games.";

          state.pendingGames = [];
        }
      )

      // ======================================
      // GET PENDING GAME BY PLAYER ID
      // ======================================

      .addCase(
        getPendingGameByPlayerId.pending,
        (state) => {
          state.pendingGamesLoading = true;
          state.error = null;
        }
      )

      .addCase(
        getPendingGameByPlayerId.fulfilled,
        (state, action) => {
          state.pendingGamesLoading = false;
          state.error = null;

          state.selectedGame =
            action.payload?.game ||
            null;

          if (action.payload?.game) {
            state.selectedDrawNo =
              action.payload.game.drawNo;
          } else {
            state.selectedDrawNo = null;
          }
        }
      )

      .addCase(
        getPendingGameByPlayerId.rejected,
        (state, action) => {
          state.pendingGamesLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch pending game.";

          state.selectedGame = null;
          state.selectedDrawNo = null;
        }
      )

      // ======================================
      // GET GAME POOL DETAILS
      // ======================================

      .addCase(
        getGamePoolDetails.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getGamePoolDetails.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.selectedPool =
            action.payload?.pool ||
            null;
        }
      )

      .addCase(
        getGamePoolDetails.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch game pool details.";

          state.selectedPool = null;
        }
      )

      // ======================================
      // GET UNSELECTED NUMBERS
      // ======================================

      .addCase(
        getUnselectedPowerballNumbers.pending,
        (state) => {
          state.unselectedNumbersLoading =
            true;

          state.error = null;
        }
      )

      .addCase(
        getUnselectedPowerballNumbers.fulfilled,
        (state, action) => {
          state.unselectedNumbersLoading =
            false;

          state.error = null;

          const data =
            action.payload || {};

          // ====================================
          // COUNTRY
          // ====================================

          state.unselectedCountry =
            data.country || null;

          // ====================================
          // GAME POOL ID
          // ====================================

          state.unselectedGamePoolId =
            data.gamePoolId || null;

          // ====================================
          // DRAW NO
          // ====================================

          state.unselectedDrawNo =
            data.drawNo ?? null;

          // ====================================
          // SELECTED NUMBERS
          // ====================================

          state.selectedNumbers = {
            mainNumbers:
              Array.isArray(
                data.selected
                  ?.mainNumbers
              )
                ? data.selected.mainNumbers
                : [],

            powerballs:
              Array.isArray(
                data.selected
                  ?.powerballs
              )
                ? data.selected.powerballs
                : [],
          };

          // ====================================
          // UNSELECTED NUMBERS
          // ====================================

          state.unselectedNumbers = {
            mainNumbers:
              Array.isArray(
                data.unselected
                  ?.mainNumbers
              )
                ? data.unselected.mainNumbers
                : [],

            powerballs:
              Array.isArray(
                data.unselected
                  ?.powerballs
              )
                ? data.unselected.powerballs
                : [],
          };

          // ====================================
          // COUNTS
          // ====================================

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
        getUnselectedPowerballNumbers.rejected,
        (state, action) => {
          state.unselectedNumbersLoading =
            false;

          state.error =
            action.payload ||
            "Failed to fetch unselected numbers.";

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
  clearPowerballResultState,
  clearPendingGames,
  clearSelectedGame,
  clearSelectedPool,
  clearUnselectedPowerballNumbers,
} = nepalPowerballResultSlice.actions;

// ============================================================
// SELECTORS
// ============================================================

export const selectNepalPowerballResults = (
  state
) =>
  state.nepalPowerballResult
    ?.results || [];

// ============================================================

export const selectNepalPowerballResult = (
  state
) =>
  state.nepalPowerballResult
    ?.result || null;

// ============================================================

export const selectNepalPowerballPendingGames = (
  state
) =>
  state.nepalPowerballResult
    ?.pendingGames || [];

// ============================================================

export const selectNepalPowerballSelectedGame = (
  state
) =>
  state.nepalPowerballResult
    ?.selectedGame || null;

// ============================================================

export const selectNepalPowerballSelectedPool = (
  state
) =>
  state.nepalPowerballResult
    ?.selectedPool || null;

// ============================================================

export const selectNepalPowerballSelectedDrawNo = (
  state
) =>
  state.nepalPowerballResult
    ?.selectedDrawNo || null;

// ============================================================
// SELECTED NUMBERS
// ============================================================

export const selectNepalPowerballSelectedNumbers = (
  state
) =>
  state.nepalPowerballResult
    ?.selectedNumbers || {
    mainNumbers: [],
    powerballs: [],
  };

// ============================================================
// UNSELECTED NUMBERS
// ============================================================

export const selectNepalPowerballUnselectedNumbers = (
  state
) =>
  state.nepalPowerballResult
    ?.unselectedNumbers || {
    mainNumbers: [],
    powerballs: [],
  };

// ============================================================
// UNSELECTED COUNTS
// ============================================================

export const selectNepalPowerballUnselectedCounts = (
  state
) =>
  state.nepalPowerballResult
    ?.unselectedCounts || {
    selectedMainNumbers: 0,
    unselectedMainNumbers: 0,
    selectedPowerballs: 0,
    unselectedPowerballs: 0,
  };

// ============================================================
// UNSELECTED LOADING
// ============================================================

export const selectNepalPowerballUnselectedNumbersLoading = (
  state
) =>
  state.nepalPowerballResult
    ?.unselectedNumbersLoading ||
  false;

// ============================================================
// UNSELECTED COUNTRY
// ============================================================

export const selectNepalPowerballUnselectedCountry = (
  state
) =>
  state.nepalPowerballResult
    ?.unselectedCountry || null;

// ============================================================
// UNSELECTED GAME POOL ID
// ============================================================

export const selectNepalPowerballUnselectedGamePoolId = (
  state
) =>
  state.nepalPowerballResult
    ?.unselectedGamePoolId || null;

// ============================================================
// UNSELECTED DRAW NO
// ============================================================

export const selectNepalPowerballUnselectedDrawNo = (
  state
) =>
  state.nepalPowerballResult
    ?.unselectedDrawNo || null;

// ============================================================
// LOADING
// ============================================================

export const selectNepalPowerballLoading = (
  state
) =>
  state.nepalPowerballResult
    ?.loading || false;

// ============================================================
// CREATE LOADING
// ============================================================

export const selectNepalPowerballCreateLoading = (
  state
) =>
  state.nepalPowerballResult
    ?.createLoading || false;

// ============================================================
// DELETE LOADING
// ============================================================

export const selectNepalPowerballDeleteLoading = (
  state
) =>
  state.nepalPowerballResult
    ?.deleteLoading || false;

// ============================================================
// PENDING GAMES LOADING
// ============================================================

export const selectNepalPowerballPendingGamesLoading = (
  state
) =>
  state.nepalPowerballResult
    ?.pendingGamesLoading || false;

// ============================================================
// ERROR
// ============================================================

export const selectNepalPowerballError = (
  state
) =>
  state.nepalPowerballResult
    ?.error || null;

// ============================================================
// SUCCESS
// ============================================================

export const selectNepalPowerballSuccess = (
  state
) =>
  state.nepalPowerballResult
    ?.success || false;

// ============================================================
// MESSAGE
// ============================================================

export const selectNepalPowerballMessage = (
  state
) =>
  state.nepalPowerballResult
    ?.message || "";

// ============================================================
// DEFAULT REDUCER
// ============================================================

export default nepalPowerballResultSlice.reducer;