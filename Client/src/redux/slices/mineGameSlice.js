import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// ============================================================
// GET ALL MINE GAMES - ADMIN
// ============================================================

export const getAllMineGames = createAsyncThunk(
  "mineGame/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/mine-games");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch mine games"
      );
    }
  }
);

// ============================================================
// GET ACTIVE MINE GAMES
// ============================================================

export const getActiveMineGames = createAsyncThunk(
  "mineGame/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/mine-games/active");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch active mine games"
      );
    }
  }
);

// ============================================================
// GET SINGLE MINE GAME
// ============================================================

export const getMineGameById = createAsyncThunk(
  "mineGame/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/mine-games/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch mine game"
      );
    }
  }
);

// ============================================================
// CREATE
// ============================================================

export const createMineGame = createAsyncThunk(
  "mineGame/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/mine-games/create", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create mine game"
      );
    }
  }
);

// ============================================================
// UPDATE
// ============================================================

export const updateMineGame = createAsyncThunk(
  "mineGame/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/mine-games/${id}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update mine game"
      );
    }
  }
);

// ============================================================
// DELETE
// ============================================================

export const deleteMineGame = createAsyncThunk(
  "mineGame/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/mine-games/${id}`);

      return {
        id,
        ...res.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete mine game"
      );
    }
  }
);

// ============================================================
// TOGGLE
// ============================================================

export const toggleMineGame = createAsyncThunk(
  "mineGame/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/mine-games/${id}/toggle`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle mine game"
      );
    }
  }
);

// ============================================================
// SLICE
// ============================================================

const initialState = {
  games: [],
  activeGames: [],
  selectedGame: null,

  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  error: null,
  success: false,
  message: "",
};

const mineGameSlice = createSlice({
  name: "mineGame",

  initialState,

  reducers: {
    clearMineGameError: (state) => {
      state.error = null;
    },

    clearMineGameMessage: (state) => {
      state.message = "";
      state.success = false;
    },

    clearSelectedMineGame: (state) => {
      state.selectedGame = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ======================================================
      // GET ALL
      // ======================================================

      .addCase(getAllMineGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAllMineGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload?.games || [];
      })

      .addCase(getAllMineGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================================================
      // GET ACTIVE
      // ======================================================

      .addCase(getActiveMineGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getActiveMineGames.fulfilled, (state, action) => {
        state.loading = false;
        state.activeGames = action.payload?.games || [];
      })

      .addCase(getActiveMineGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================================================
      // GET BY ID
      // ======================================================

      .addCase(getMineGameById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getMineGameById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGame = action.payload?.game || null;
      })

      .addCase(getMineGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================================================
      // CREATE
      // ======================================================

      .addCase(createMineGame.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createMineGame.fulfilled, (state, action) => {
        state.creating = false;
        state.success = true;
        state.message =
          action.payload?.message || "Mine game created successfully";

        if (action.payload?.game) {
          state.games.unshift(action.payload.game);
        }
      })

      .addCase(createMineGame.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // ======================================================
      // UPDATE
      // ======================================================

      .addCase(updateMineGame.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateMineGame.fulfilled, (state, action) => {
        state.updating = false;
        state.success = true;

        state.message =
          action.payload?.message || "Mine game updated successfully";

        const updatedGame = action.payload?.game;

        if (updatedGame) {
          const index = state.games.findIndex(
            (game) => game._id === updatedGame._id
          );

          if (index !== -1) {
            state.games[index] = updatedGame;
          }

          state.selectedGame = updatedGame;
        }
      })

      .addCase(updateMineGame.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // ======================================================
      // DELETE
      // ======================================================

      .addCase(deleteMineGame.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })

      .addCase(deleteMineGame.fulfilled, (state, action) => {
        state.deleting = false;
        state.success = true;

        state.message =
          action.payload?.message || "Mine game deleted successfully";

        state.games = state.games.filter(
          (game) => game._id !== action.payload.id
        );
      })

      .addCase(deleteMineGame.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // ======================================================
      // TOGGLE
      // ======================================================

      .addCase(toggleMineGame.pending, (state) => {
        state.error = null;
      })

      .addCase(toggleMineGame.fulfilled, (state, action) => {
        state.success = true;

        state.message =
          action.payload?.message || "Mine game status updated";

        const updatedGame = action.payload?.game;

        if (updatedGame) {
          const index = state.games.findIndex(
            (game) => game._id === updatedGame._id
          );

          if (index !== -1) {
            state.games[index] = updatedGame;
          }
        }
      })

      .addCase(toggleMineGame.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearMineGameError,
  clearMineGameMessage,
  clearSelectedMineGame,
} = mineGameSlice.actions;

export default mineGameSlice.reducer;