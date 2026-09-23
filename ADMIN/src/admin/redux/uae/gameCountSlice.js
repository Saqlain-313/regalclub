import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

const initialState = {
  gameCounts: [],
  gameCount: null,
  loading: false,
  error: null,
};

// Get All
export const getGameCounts = createAsyncThunk(
  "uaeGameCount/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/uae/game-count");
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get One
export const getGameCount = createAsyncThunk(
  "uaeGameCount/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/uae/game-count/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create
export const createGameCount = createAsyncThunk(
  "uaeGameCount/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/uae/game-count", payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update
export const updateGameCount = createAsyncThunk(
  "uaeGameCount/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/uae/game-count/${id}`, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete
export const deleteGameCount = createAsyncThunk(
  "uaeGameCount/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/uae/game-count/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const slice = createSlice({
  name: "uaeGameCount",
  initialState,
  reducers: {
    resetGameCountState: (state) => {
      state.error = null;
      state.gameCount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGameCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGameCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.gameCounts = action.payload;
      })
      .addCase(getGameCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getGameCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGameCount.fulfilled, (state, action) => {
        state.loading = false;
        state.gameCount = action.payload;
      })
      .addCase(getGameCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createGameCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGameCount.fulfilled, (state, action) => {
        state.loading = false;
        state.gameCounts.unshift(action.payload);
      })
      .addCase(createGameCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateGameCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGameCount.fulfilled, (state, action) => {
        state.loading = false;
        state.gameCounts = state.gameCounts.map((x) =>
          x._id === action.payload._id ? action.payload : x
        );
        if (state.gameCount?._id === action.payload._id) {
          state.gameCount = action.payload;
        }
      })
      .addCase(updateGameCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteGameCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGameCount.fulfilled, (state, action) => {
        state.loading = false;
        state.gameCounts = state.gameCounts.filter(
          (x) => x._id !== action.payload
        );
        if (state.gameCount?._id === action.payload) {
          state.gameCount = null;
        }
      })
      .addCase(deleteGameCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetGameCountState } = slice.actions;

export default slice.reducer;