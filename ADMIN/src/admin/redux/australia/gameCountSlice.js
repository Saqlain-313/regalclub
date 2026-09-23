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
  "australiaGameCount/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        "/admin/australia/game-count"
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
  "australiaGameCount/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/admin/australia/game-count/${id}`
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
  "australiaGameCount/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/admin/australia/game-count",
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
  "australiaGameCount/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/admin/australia/game-count/${id}`,
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
  "australiaGameCount/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(
        `/admin/australia/game-count/${id}`
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
  name: "australiaGameCount",

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

        if (!action.payload) {
          return;
        }

        const index = state.gameCounts.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          state.gameCounts[index] = action.payload;
        }

        // Also update selected game count if same item
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
export const selectGameCounts = (state) =>
  state.australiaGameCount.gameCounts;

export const selectGameCount = (state) =>
  state.australiaGameCount.gameCount;

export const selectGameCountLoading = (state) =>
  state.australiaGameCount.loading;

export const selectGameCountError = (state) =>
  state.australiaGameCount.error;

export default slice.reducer;