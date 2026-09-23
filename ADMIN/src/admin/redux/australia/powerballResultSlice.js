import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

// ==========================================
// Create Powerball Result
// ==========================================
export const createPowerballResult = createAsyncThunk(
  "australiaPowerballResult/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/admin/australia/powerball-results/create",
        data
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get All Results
// ==========================================
export const getAllPowerballResults = createAsyncThunk(
  "australiaPowerballResult/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(
        "/admin/australia/powerball-results"
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get Result By ID
// ==========================================
export const getPowerballResultById = createAsyncThunk(
  "australiaPowerballResult/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/admin/australia/powerball-results/${id}`
      );

      return res.data.result;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ==========================================
// Delete Result
// ==========================================
export const deletePowerballResult = createAsyncThunk(
  "australiaPowerballResult/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(
        `/admin/australia/powerball-results/${id}`
      );

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get All Pending Games
// ==========================================
export const getAllPendingGames = createAsyncThunk(
  "australiaPowerballResult/getAllPendingGames",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(
        "/admin/australia/powerball-results/pending-games/all"
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get Pending Game by Player ID
// ==========================================
export const getPendingGameByPlayerId = createAsyncThunk(
  "australiaPowerballResult/getPendingGame",
  async (playerId, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/admin/australia/powerball-results/pending-game/${playerId}`
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ==========================================
// Get Game Pool Details
// ==========================================
export const getGamePoolDetails = createAsyncThunk(
  "australiaPowerballResult/getGamePoolDetails",
  async (poolId, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/admin/australia/powerball-results/game-pool/${poolId}`
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong."
      );
    }
  }
);

// ==========================================
// GET UNSELECTED NUMBERS
// ==========================================
// gamePoolId OR country pass kar sakte ho
//
// Example:
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
//     country: "AUSTRALIA"
//   })
// );
// ==========================================
export const getUnselectedPowerballNumbers = createAsyncThunk(
  "australiaPowerballResult/getUnselectedNumbers",
  async ({ gamePoolId, country } = {}, { rejectWithValue }) => {
    try {
      const params = {};

      if (gamePoolId) {
        params.gamePoolId = gamePoolId;
      }

      if (country) {
        params.country = country;
      }

      const res = await api.get(
        "/admin/australia/powerball-results/unselected-numbers",
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
const australiaPowerballResultSlice = createSlice({
  name: "australiaPowerballResult",

  initialState: {
    results: [],
    result: null,

    pendingGames: [],
    selectedGame: null,
    selectedPool: null,
    selectedDrawNo: null,

    // ======================================
    // Unselected Numbers
    // ======================================
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

    // ======================================
    // Loading
    // ======================================
    loading: false,
    createLoading: false,
    deleteLoading: false,
    pendingGamesLoading: false,
    unselectedNumbersLoading: false,

    success: false,
    error: null,
    message: "",
  },

  reducers: {
    // ======================================
    // Clear Main State
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
    // Clear Pending Games
    // ======================================
    clearPendingGames: (state) => {
      state.pendingGames = [];
      state.selectedDrawNo = null;
      state.selectedGame = null;
      state.selectedPool = null;
      state.pendingGamesLoading = false;
    },

    // ======================================
    // Clear Selected Game
    // ======================================
    clearSelectedGame: (state) => {
      state.selectedGame = null;
    },

    // ======================================
    // Clear Selected Pool
    // ======================================
    clearSelectedPool: (state) => {
      state.selectedPool = null;
    },

    // ======================================
    // Clear Unselected Numbers
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

  extraReducers: (builder) => {
    builder

      // ==========================================
      // CREATE
      // ==========================================
      .addCase(
        createPowerballResult.pending,
        (state) => {
          state.createLoading = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        createPowerballResult.fulfilled,
        (state, action) => {
          state.createLoading = false;
          state.success = true;
          state.message = action.payload.message;

          if (action.payload.result) {
            state.results.unshift(
              action.payload.result
            );
          }

          state.pendingGames = [];
          state.selectedDrawNo = null;
          state.selectedGame = null;
          state.selectedPool = null;
        }
      )

      .addCase(
        createPowerballResult.rejected,
        (state, action) => {
          state.createLoading = false;
          state.error = action.payload;
        }
      )

      // ==========================================
      // GET ALL
      // ==========================================
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
          state.results =
            action.payload.results || [];
        }
      )

      .addCase(
        getAllPowerballResults.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // ==========================================
      // GET BY ID
      // ==========================================
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
          state.result = action.payload;
        }
      )

      .addCase(
        getPowerballResultById.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // ==========================================
      // DELETE
      // ==========================================
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
          state.error = action.payload;
        }
      )

      // ==========================================
      // GET ALL PENDING GAMES
      // ==========================================
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
          state.pendingGames =
            action.payload.games || [];
        }
      )

      .addCase(
        getAllPendingGames.rejected,
        (state, action) => {
          state.pendingGamesLoading = false;
          state.error = action.payload;
          state.pendingGames = [];
        }
      )

      // ==========================================
      // GET PENDING GAME BY PLAYER ID
      // ==========================================
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

          state.selectedGame =
            action.payload.game;

          if (action.payload.game) {
            state.selectedDrawNo =
              action.payload.game.drawNo;
          }
        }
      )

      .addCase(
        getPendingGameByPlayerId.rejected,
        (state, action) => {
          state.pendingGamesLoading = false;
          state.error = action.payload;
          state.selectedGame = null;
        }
      )

      // ==========================================
      // GET GAME POOL DETAILS
      // ==========================================
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
          state.selectedPool =
            action.payload.pool;
        }
      )

      .addCase(
        getGamePoolDetails.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.selectedPool = null;
        }
      )

      // ==========================================
      // GET UNSELECTED NUMBERS
      // ==========================================
      .addCase(
        getUnselectedPowerballNumbers.pending,
        (state) => {
          state.unselectedNumbersLoading = true;
          state.error = null;
        }
      )

      .addCase(
        getUnselectedPowerballNumbers.fulfilled,
        (state, action) => {
          state.unselectedNumbersLoading = false;
          state.error = null;

          const data = action.payload;

          state.unselectedCountry =
            data.country || null;

          state.unselectedGamePoolId =
            data.gamePoolId || null;

          state.unselectedDrawNo =
            data.drawNo ?? null;

          state.selectedNumbers = {
            mainNumbers:
              data.selected?.mainNumbers || [],

            powerballs:
              data.selected?.powerballs || [],
          };

          state.unselectedNumbers = {
            mainNumbers:
              data.unselected?.mainNumbers || [],

            powerballs:
              data.unselected?.powerballs || [],
          };

          state.unselectedCounts = {
            selectedMainNumbers:
              data.counts?.selectedMainNumbers || 0,

            unselectedMainNumbers:
              data.counts?.unselectedMainNumbers || 0,

            selectedPowerballs:
              data.counts?.selectedPowerballs || 0,

            unselectedPowerballs:
              data.counts?.unselectedPowerballs || 0,
          };
        }
      )

      .addCase(
        getUnselectedPowerballNumbers.rejected,
        (state, action) => {
          state.unselectedNumbersLoading = false;

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
        }
      );
  },
});

// ==========================================
// EXPORT ACTIONS
// ==========================================
export const {
  clearPowerballResultState,
  clearPendingGames,
  clearSelectedGame,
  clearSelectedPool,
  clearUnselectedPowerballNumbers,
} = australiaPowerballResultSlice.actions;

// ==========================================
// EXPORT REDUCER
// ==========================================
export default australiaPowerballResultSlice.reducer;