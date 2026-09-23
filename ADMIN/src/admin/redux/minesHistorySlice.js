import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API = "http://localhost:8097/api/mines/admin/history";

// Fetch Mines History
export const fetchMinesHistory = createAsyncThunk(
  "minesHistory/fetchMinesHistory",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to fetch mines history");
      }

      return data.games || [];
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  },
);

const initialState = {
  games: [],
  loading: false,
  error: null,
};

const minesHistorySlice = createSlice({
  name: "minesHistory",
  initialState,

  reducers: {
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
        state.games = action.payload;
        state.error = null;
      })

      .addCase(fetchMinesHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load mines history";
      });
  },
});

export const { clearMinesHistory } = minesHistorySlice.actions;

export default minesHistorySlice.reducer;
