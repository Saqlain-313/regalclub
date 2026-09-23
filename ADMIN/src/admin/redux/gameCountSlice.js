import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {api} from "./api";

const getAdminCountry = () => {
  if (typeof window === "undefined") return "india";
  const match = window.location.pathname.match(
    /\/(india|uae|nepal|pakistan|australia|canada)(?:\/|$)/i
  );
  return match ? match[1].toLowerCase() : "india";
};



const initialState = {
  gameCounts: [],
  gameCount: null,
  loading: false,
  error: null,
};

// Get All
export const getGameCounts = createAsyncThunk(
  "gameCount/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/${getAdminCountry()}/game-count`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get One
export const getGameCount = createAsyncThunk(
  "gameCount/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/${getAdminCountry()}/game-count/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create
export const createGameCount = createAsyncThunk(
  "gameCount/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/admin/${getAdminCountry()}/game-count`, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update
export const updateGameCount = createAsyncThunk(
  "gameCount/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/${getAdminCountry()}/game-count/${id}`, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete
export const deleteGameCount = createAsyncThunk(
  "gameCount/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/${getAdminCountry()}/game-count/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const slice = createSlice({
  name: "gameCount",
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
      })
      .addCase(getGameCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.gameCounts = action.payload;
      })
      .addCase(getGameCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getGameCount.fulfilled, (state, action) => {
        state.gameCount = action.payload;
      })

      .addCase(createGameCount.fulfilled, (state, action) => {
        state.gameCounts.unshift(action.payload);
      })

      .addCase(updateGameCount.fulfilled, (state, action) => {
        state.gameCounts = state.gameCounts.map((x) =>
          x._id === action.payload._id ? action.payload : x
        );
      })

      .addCase(deleteGameCount.fulfilled, (state, action) => {
        state.gameCounts = state.gameCounts.filter(
          (x) => x._id !== action.payload
        );
      });
  },
});

export const { resetGameCountState } = slice.actions;

export default slice.reducer;