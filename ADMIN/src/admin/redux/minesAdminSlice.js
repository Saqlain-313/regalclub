import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

const API_URL = "/mine-games/admin";

export const fetchMinesHistory = createAsyncThunk(
  "minesAdmin/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/history`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load Mines history"
      );
    }
  }
);

const initialState = {
  games: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const minesAdminSlice = createSlice({
  name: "minesAdmin",

  initialState,

  reducers: {
    addGame: (state, action) => {
      const game = action.payload;

      const exists = state.games.some(
        (item) => String(item._id) === String(game.gameId || game._id)
      );

      if (!exists) {
        state.games.unshift({
          ...game,
          _id: game.gameId || game._id,
        });
      }

      state.lastUpdated = new Date().toISOString();
    },

    updateGame: (state, action) => {
      const update = action.payload;

      const gameId = String(update.gameId || update._id);

      const index = state.games.findIndex(
        (item) => String(item._id) === gameId
      );

      if (index !== -1) {
        state.games[index] = {
          ...state.games[index],
          ...update,
        };
      }

      state.lastUpdated = new Date().toISOString();
    },

    removeGame: (state, action) => {
      const gameId = String(action.payload);

      state.games = state.games.filter(
        (game) => String(game._id) !== gameId
      );
    },

    clearMinesHistory: (state) => {
      state.games = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMinesHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMinesHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload?.games || [];
        state.lastUpdated = new Date().toISOString();
      })

      .addCase(fetchMinesHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to load Mines history";
      });
  },
});

export const {
  addGame,
  updateGame,
  removeGame,
  clearMinesHistory,
} = minesAdminSlice.actions;

export default minesAdminSlice.reducer;