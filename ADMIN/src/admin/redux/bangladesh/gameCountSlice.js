import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

const initialState = {
  gameCounts: [],
  gameCount: null,
  loading: false,
  error: null,
};

// =====================================================
// GET ALL GAME COUNTS
// =====================================================
export const getGameCounts = createAsyncThunk(
  "bangladeshGameCount/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        "/admin/bangladesh/game-count"
      );

      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =====================================================
// GET SINGLE GAME COUNT
// =====================================================
export const getGameCount = createAsyncThunk(
  "bangladeshGameCount/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/admin/bangladesh/game-count/${id}`
      );

      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =====================================================
// CREATE GAME COUNT
// =====================================================
export const createGameCount = createAsyncThunk(
  "bangladeshGameCount/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/admin/bangladesh/game-count",
        payload
      );

      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =====================================================
// UPDATE GAME COUNT
// =====================================================
export const updateGameCount = createAsyncThunk(
  "bangladeshGameCount/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/admin/bangladesh/game-count/${id}`,
        formData
      );

      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =====================================================
// DELETE GAME COUNT
// =====================================================
export const deleteGameCount = createAsyncThunk(
  "bangladeshGameCount/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(
        `/admin/bangladesh/game-count/${id}`
      );

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =====================================================
// SLICE
// =====================================================
const slice = createSlice({
  name: "bangladeshGameCount",

  initialState,

  reducers: {
    resetGameCountState: (state) => {
      state.error = null;
      state.gameCount = null;
    },
  },

  extraReducers: (builder) => {
    // =================================================
    // GET ALL
    // =================================================
    builder
      .addCase(getGameCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getGameCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.gameCounts = action.payload || [];
      })

      .addCase(getGameCounts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch game counts";
      });

    // =================================================
    // GET ONE
    // =================================================
    builder
      .addCase(getGameCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getGameCount.fulfilled, (state, action) => {
        state.loading = false;
        state.gameCount = action.payload || null;
      })

      .addCase(getGameCount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch game count";
      });

    // =================================================
    // CREATE
    // =================================================
    builder
      .addCase(createGameCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createGameCount.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload) {
          state.gameCounts.unshift(action.payload);
        }
      })

      .addCase(createGameCount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to create game count";
      });

    // =================================================
    // UPDATE
    // =================================================
    builder
      .addCase(updateGameCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateGameCount.fulfilled, (state, action) => {
        state.loading = false;

        if (!action.payload) return;

        const index = state.gameCounts.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          state.gameCounts[index] = action.payload;
        }

        // Update selected game count also
        if (
          state.gameCount &&
          state.gameCount._id === action.payload._id
        ) {
          state.gameCount = action.payload;
        }
      })

      .addCase(updateGameCount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to update game count";
      });

    // =================================================
    // DELETE
    // =================================================
    builder
      .addCase(deleteGameCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteGameCount.fulfilled, (state, action) => {
        state.loading = false;

        state.gameCounts = state.gameCounts.filter(
          (item) => item._id !== action.payload
        );

        // Clear selected item if deleted
        if (
          state.gameCount &&
          state.gameCount._id === action.payload
        ) {
          state.gameCount = null;
        }
      })

      .addCase(deleteGameCount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to delete game count";
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================
export const {
  resetGameCountState,
} = slice.actions;

// =====================================================
// SELECTORS
// =====================================================
export const selectBangladeshGameCounts = (state) =>
  state.bangladeshGameCount.gameCounts;

export const selectBangladeshGameCount = (state) =>
  state.bangladeshGameCount.gameCount;

export const selectBangladeshGameCountLoading = (state) =>
  state.bangladeshGameCount.loading;

export const selectBangladeshGameCountError = (state) =>
  state.bangladeshGameCount.error;

export default slice.reducer;