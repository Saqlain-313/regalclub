import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

// ============================================================
// CREATE POWERBALL RESULT
// ============================================================

export const createPowerballResult = createAsyncThunk(
  "indiaPowerballResult/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/admin/india/powerball-results/create",
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

// ============================================================
// GET ALL RESULTS
// ============================================================

export const getAllPowerballResults = createAsyncThunk(
  "indiaPowerballResult/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(
        "/admin/india/powerball-results"
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

// ============================================================
// GET RESULT BY ID
// ============================================================

export const getPowerballResultById = createAsyncThunk(
  "indiaPowerballResult/getById",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Result ID is required."
        );
      }

      const res = await api.get(
        `/admin/india/powerball-results/${id}`
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

// ============================================================
// DELETE RESULT
// ============================================================

export const deletePowerballResult = createAsyncThunk(
  "indiaPowerballResult/delete",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Result ID is required."
        );
      }

      await api.delete(
        `/admin/india/powerball-results/${id}`
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

// ============================================================
// GET ALL PENDING GAMES
// ============================================================

export const getAllPendingGames = createAsyncThunk(
  "indiaPowerballResult/getAllPendingGames",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(
        "/admin/india/powerball-results/pending-games/all"
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

// ============================================================
// GET PENDING GAME BY PLAYER ID
// ============================================================

export const getPendingGameByPlayerId = createAsyncThunk(
  "indiaPowerballResult/getPendingGame",
  async (playerId, { rejectWithValue }) => {
    try {
      if (!playerId) {
        return rejectWithValue(
          "Player ID is required."
        );
      }

      const res = await api.get(
        `/admin/india/powerball-results/pending-game/${playerId}`
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

// ============================================================
// GET GAME POOL DETAILS BY POOL ID
// ============================================================

export const getGamePoolDetails = createAsyncThunk(
  "indiaPowerballResult/getGamePoolDetails",
  async (poolId, { rejectWithValue }) => {
    try {
      if (!poolId) {
        return rejectWithValue(
          "Pool ID is required."
        );
      }

      const res = await api.get(
        `/admin/india/powerball-results/game-pool/${poolId}`
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

// ============================================================
// GET UNSELECTED POWERBALL NUMBERS
// ============================================================
//
// gamePoolId:
// /unselected-numbers?gamePoolId=XXXXX
//
// country:
// /unselected-numbers?country=INDIA
//
// ============================================================

export const getUnselectedPowerballNumbers =
  createAsyncThunk(
    "indiaPowerballResult/getUnselectedNumbers",

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
          "/admin/india/powerball-results/unselected-numbers",
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

// ============================================================
// SLICE
// ============================================================

const indiaPowerballResultSlice = createSlice({
  name: "indiaPowerballResult",

  initialState: {
    // ========================================================
    // RESULTS
    // ========================================================

    results: [],
    result: null,

    // ========================================================
    // PENDING
    // ========================================================

    pendingGames: [],
    selectedGame: null,
    selectedPool: null,
    selectedDrawNo: null,

    // ========================================================
    // SELECTED NUMBERS
    // ========================================================

    selectedNumbers: {
      mainNumbers: [],
      powerballs: [],
    },

    // ========================================================
    // UNSELECTED NUMBERS
    // ========================================================

    unselectedNumbers: {
      mainNumbers: [],
      powerballs: [],
    },

    // ========================================================
    // COUNTS
    // ========================================================

    unselectedCounts: {
      selectedMainNumbers: 0,
      unselectedMainNumbers: 0,
      selectedPowerballs: 0,
      unselectedPowerballs: 0,
    },

    // ========================================================
    // META
    // ========================================================

    unselectedCountry: null,
    unselectedGamePoolId: null,
    unselectedDrawNo: null,

    // ========================================================
    // LOADING
    // ========================================================

    loading: false,
    createLoading: false,
    deleteLoading: false,
    pendingGamesLoading: false,
    unselectedNumbersLoading: false,

    // ========================================================
    // STATUS
    // ========================================================

    success: false,
    error: null,
    message: "",
  },

  // ==========================================================
  // REDUCERS
  // ==========================================================

  reducers: {
    // ========================================================
    // CLEAR RESULT STATE
    // ========================================================

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

    // ========================================================
    // CLEAR PENDING GAMES
    // ========================================================

    clearPendingGames: (state) => {
      state.pendingGames = [];

      state.selectedDrawNo = null;
      state.selectedGame = null;
      state.selectedPool = null;

      state.pendingGamesLoading = false;
    },

    // ========================================================
    // CLEAR SELECTED GAME
    // ========================================================

    clearSelectedGame: (state) => {
      state.selectedGame = null;
    },

    // ========================================================
    // CLEAR SELECTED POOL
    // ========================================================

    clearSelectedPool: (state) => {
      state.selectedPool = null;
    },

    // ========================================================
    // CLEAR UNSELECTED NUMBERS
    // ========================================================

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

  // ==========================================================
  // EXTRA REDUCERS
  // ==========================================================

  extraReducers: (builder) => {
    builder

      // ======================================================
      // CREATE
      // ======================================================

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

          // Clear old unselected numbers
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

      // ======================================================
      // GET ALL
      // ======================================================

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

      // ======================================================
      // GET BY ID
      // ======================================================

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

      // ======================================================
      // DELETE
      // ======================================================

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

      // ======================================================
      // GET ALL PENDING GAMES
      // ======================================================

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

      // ======================================================
      // GET PENDING GAME BY PLAYER ID
      // ======================================================

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
        }
      )

      // ======================================================
      // GET GAME POOL DETAILS
      // ======================================================

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

      // ======================================================
      // GET UNSELECTED NUMBERS
      // ======================================================

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

          // --------------------------------------------------
          // COUNTRY
          // --------------------------------------------------

          state.unselectedCountry =
            data.country || null;

          // --------------------------------------------------
          // GAME POOL ID
          // --------------------------------------------------

          state.unselectedGamePoolId =
            data.gamePoolId || null;

          // --------------------------------------------------
          // DRAW NO
          // --------------------------------------------------

          state.unselectedDrawNo =
            data.drawNo ?? null;

          // --------------------------------------------------
          // SELECTED NUMBERS
          // --------------------------------------------------

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

          // --------------------------------------------------
          // UNSELECTED NUMBERS
          // --------------------------------------------------

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

          // --------------------------------------------------
          // COUNTS
          // --------------------------------------------------

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
} = indiaPowerballResultSlice.actions;

// ============================================================
// SELECTORS
// ============================================================

export const selectIndiaPowerballResults = (
  state
) =>
  state.indiaPowerballResult
    ?.results || [];

// ============================================================

export const selectIndiaPowerballResult = (
  state
) =>
  state.indiaPowerballResult
    ?.result || null;

// ============================================================

export const selectIndiaPowerballPendingGames = (
  state
) =>
  state.indiaPowerballResult
    ?.pendingGames || [];

// ============================================================

export const selectIndiaPowerballSelectedGame = (
  state
) =>
  state.indiaPowerballResult
    ?.selectedGame || null;

// ============================================================

export const selectIndiaPowerballSelectedPool = (
  state
) =>
  state.indiaPowerballResult
    ?.selectedPool || null;

// ============================================================

export const selectIndiaPowerballSelectedDrawNo = (
  state
) =>
  state.indiaPowerballResult
    ?.selectedDrawNo || null;

// ============================================================
// SELECTED NUMBERS
// ============================================================

export const selectIndiaPowerballSelectedNumbers = (
  state
) =>
  state.indiaPowerballResult
    ?.selectedNumbers || {
    mainNumbers: [],
    powerballs: [],
  };

// ============================================================
// UNSELECTED NUMBERS
// ============================================================

export const selectIndiaPowerballUnselectedNumbers = (
  state
) =>
  state.indiaPowerballResult
    ?.unselectedNumbers || {
    mainNumbers: [],
    powerballs: [],
  };

// ============================================================
// UNSELECTED COUNTS
// ============================================================

export const selectIndiaPowerballUnselectedCounts = (
  state
) =>
  state.indiaPowerballResult
    ?.unselectedCounts || {
    selectedMainNumbers: 0,
    unselectedMainNumbers: 0,
    selectedPowerballs: 0,
    unselectedPowerballs: 0,
  };

// ============================================================
// UNSELECTED LOADING
// ============================================================

export const selectIndiaPowerballUnselectedNumbersLoading = (
  state
) =>
  state.indiaPowerballResult
    ?.unselectedNumbersLoading ||
  false;

// ============================================================
// UNSELECTED COUNTRY
// ============================================================

export const selectIndiaPowerballUnselectedCountry = (
  state
) =>
  state.indiaPowerballResult
    ?.unselectedCountry || null;

// ============================================================
// UNSELECTED GAME POOL ID
// ============================================================

export const selectIndiaPowerballUnselectedGamePoolId = (
  state
) =>
  state.indiaPowerballResult
    ?.unselectedGamePoolId || null;

// ============================================================
// UNSELECTED DRAW NO
// ============================================================

export const selectIndiaPowerballUnselectedDrawNo = (
  state
) =>
  state.indiaPowerballResult
    ?.unselectedDrawNo || null;

// ============================================================
// DEFAULT REDUCER
// ============================================================

export default indiaPowerballResultSlice.reducer;