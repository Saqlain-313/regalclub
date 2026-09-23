import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

const initialState = {
  game: null,
  loading: false,
  message: "",
  error: null,
};

export const startMinesGame = createAsyncThunk(
  "mines/startGame",
  async ({ minesCount = 15, virtualStake }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mine-games/start", {
        minesCount,
        virtualStake,
      });

      const data = response.data;

      if (!data?.success) {
        return rejectWithValue(data?.message || "Unable to start game");
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start game",
      );
    }
  },
);

export const revealMine = createAsyncThunk(
  "mines/reveal",
  async ({ gameId, cell }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/mine-games/${gameId}/reveal`, {
        cell,
      });

      const data = response.data;

      if (!data?.success) {
        return rejectWithValue(data?.message || "Unable to reveal cell");
      }

      return { ...data, cell };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to reveal cell",
      );
    }
  },
);

export const cashoutMines = createAsyncThunk(
  "mines/cashout",
  async ({ gameId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/mine-games/${gameId}/cashout`);

      const data = response.data;

      if (!data?.success) {
        return rejectWithValue(data?.message || "Cashout failed");
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Cashout failed",
      );
    }
  },
);

const minesSlice = createSlice({
  name: "mines",
  initialState,

  reducers: {
    clearMinesMessage: (state) => {
      state.message = "";
      state.error = null;
    },

    resetMinesGame: (state) => {
      state.game = null;
      state.loading = false;
      state.message = "";
      state.error = null;
    },

    syncMinesSocketUpdate: (state, action) => {
      if (!state.game) return;

      state.game = {
        ...state.game,
        ...action.payload,
      };
    },

    syncMinesSocketCashout: (state, action) => {
      if (!state.game) return;

      state.game = {
        ...state.game,
        ...action.payload,
      };
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // START GAME
      // =========================
      .addCase(startMinesGame.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })

      .addCase(startMinesGame.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload;

        state.game = {
          ...data.game,
          credit: Number(data.credit || 0),
          entryAmount: Number(
            data.game?.entryAmount || data.game?.virtualStake || 0,
          ),
        };

        state.message = data.existingGame
          ? "Active game restored"
          : `₹${Number(
              data.game?.entryAmount || data.game?.virtualStake || 0,
            ).toFixed(2)} entry deducted`;
      })

      .addCase(startMinesGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to start game";
        state.message = state.error;
      })

      // =========================
      // REVEAL CELL
      // =========================
      .addCase(revealMine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(revealMine.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload;
        const result = data.result || {};

        if (state.game) {
          state.game = {
            ...state.game,
            ...result,
            credit: result.credit ?? state.game.credit,
          };
        }

        if (result.status === "lost") {
          state.message = "💣 Mine hit! You lost this game.";
        } else if (result.status === "won") {
          state.message = `🎉 You won ₹${Number(result.virtualWin || 0).toFixed(
            2,
          )}`;
        } else {
          state.message = "";
        }
      })

      .addCase(revealMine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to reveal cell";
        state.message = state.error;
      })

      // =========================
      // CASHOUT
      // =========================
      .addCase(cashoutMines.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })

      .addCase(cashoutMines.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload;

        if (state.game) {
          state.game = {
            ...state.game,
            ...data,
            credit: Number(data.credit ?? state.game.credit ?? 0),
            entryAmount: Number(
              data.entryAmount ??
                state.game.entryAmount ??
                state.game.virtualStake ??
                0,
            ),
          };
        }

        state.message = `💰 You won ₹${Number(data.virtualWin || 0).toFixed(
          2,
        )}`;
      })

      .addCase(cashoutMines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Cashout failed";
        state.message = state.error;
      });
  },
});

export const {
  clearMinesMessage,
  resetMinesGame,
  syncMinesSocketUpdate,
  syncMinesSocketCashout,
} = minesSlice.actions;

export default minesSlice.reducer;
