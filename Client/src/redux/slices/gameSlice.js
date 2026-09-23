// redux/slices/gameSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

/* ===========================
   CHECK GAME credit
=========================== */
export const checkGamecredit = createAsyncThunk(
  "game/checkcredit",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/game/credit/transfer", {
        withCredentials: true,
      });
      return data; // ✅ FIXED
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "credit check failed" },
      );
    }
  },
);

/* ===========================
   TRANSFER credit
=========================== */
export const transferFromGame = createAsyncThunk(
  "game/transferFromGame",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/game/transfer-credit");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "credit transfer failed" },
      );
    }
  },
);

/* ===========================
   LAUNCH GAME
=========================== */
export const launchGame = createAsyncThunk(
  "game/launchGame",
  async ({ gameId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/game/get/game", { gameId });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Game launch failed",
      );
    }
  },
);

/* ===========================
   GET ALL GAMES
=========================== */
export const getAllGames = createAsyncThunk(
  "game/getAllGames",
  async ({ page, limit, game_type } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/game/docs/all?page=${page}&size=${limit}`,
      );

      console.log("API response for all games:", data); // Debug log to check the API response
      return data.data;
    } catch {
      return rejectWithValue("Failed to fetch games");
    }
  },
);
export const getGamesByGameType = createAsyncThunk(
  "game/getGamesByGameType",
  async ({ page, limit, game_type } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/game/docs/gameType?page=${page}&size=${limit}&game_type=${game_type || ""}`,
      );

      // console.log("API response for live casino games:", data); // Debug log to check the API response
      return data.data;
    } catch {
      return rejectWithValue("Failed to fetch games");
    }
  },
);

export const getGameHistory = createAsyncThunk(
  "game/getGameHistory",
  async ({ page, limit, from_date, to_date } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/game/history?page=${page}&size=${limit}&from_date=${from_date || ""}&to_date=${to_date || ""}`,
      );
      return data.data;
    } catch {
      return rejectWithValue("Failed to fetch game history");
    }
  },
);

/* ===========================
   SLICE
=========================== */
const gameSlice = createSlice({
  name: "game",
  initialState: {
    // Games
    allGames: [],
    gamesByGameType: [],
    allGamesdata: { data: [] },
    filteredGames: [],
    gameHistory: [],
    gameUrl: null,
    // credit
    gamecredit: 0,

    // Popup message
    creditMessage: "",
    creditStatus: null, // true / false

    // Loading
    loading: false,
    iscreditLoading: false,
    launchLoading: false,
    transferLoading: false,

    error: null,
    launchError: null,
    transferError: null,
  },

  reducers: {
    resetGameState: (state) => {
      state.gameUrl = null;
      state.launchError = null;
      state.transferError = null;
      state.error = null;
      state.creditMessage = "";
      state.creditStatus = null;
    },
    clearGameUrl: (state) => {
      state.gameUrl = null;
      state.launchLoading = false;
      state.launchError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== CHECK credit ===== */
      .addCase(checkGamecredit.pending, (state) => {
        state.iscreditLoading = true;
        state.creditMessage = "";
      })
      .addCase(checkGamecredit.fulfilled, (state, action) => {
        state.iscreditLoading = false;
        state.gamecredit = action.payload.credit || 0;
        state.creditStatus = action.payload.status;
        state.creditMessage = action.payload.message;
      })
      .addCase(checkGamecredit.rejected, (state, action) => {
        state.iscreditLoading = false;
        state.creditStatus = false;
        state.creditMessage =
          action.payload?.message || "credit check failed";
      })

      /* ===== TRANSFER FROM GAME ===== */
      .addCase(transferFromGame.pending, (state) => {
        state.transferLoading = true;
      })
      .addCase(transferFromGame.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.gamecredit = 0;
        state.creditStatus = true;
        state.creditMessage = action.payload.message;
      })
      .addCase(transferFromGame.rejected, (state, action) => {
        state.transferLoading = false;
        state.creditStatus = false;
        state.creditMessage = action.payload?.message || "Transfer failed";
      })

      /* ===== LAUNCH GAME ===== */
      .addCase(launchGame.pending, (state) => {
        state.launchLoading = true;
      })
      .addCase(launchGame.fulfilled, (state, action) => {
        state.launchLoading = false;
        console.log("LAUNCH GAME FULFILLED ACTION PAYLOAD 👉", action.payload);
        state.gameUrl = action.payload.launch_view_url;
      })
      .addCase(launchGame.rejected, (state, action) => {
        state.launchLoading = false;
        state.launchError = action.payload;
      })

      /* ===== GET ALL GAMES ===== */
      .addCase(getAllGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGames.fulfilled, (state, action) => {
        const games = action.payload || [];
        state.loading = false;
        state.allGames = games;
        state.allGamesdata = { data: games };
        state.filteredGames = games;
      })
      .addCase(getAllGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===== GET GAMES BY GAME TYPE ===== */
      .addCase(getGamesByGameType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGamesByGameType.fulfilled, (state, action) => {
        const games = action.payload || [];
        state.loading = false;
        state.gamesByGameType = games;
      })
      .addCase(getGamesByGameType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===== GET GAME HISTORY ===== */
      .addCase(getGameHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGameHistory.fulfilled, (state, action) => {
        const history = action.payload.data || [];
        state.loading = false;
        state.gameHistory = history;
      })
      .addCase(getGameHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGameUrl, resetGameState } = gameSlice.actions;
export default gameSlice.reducer;
