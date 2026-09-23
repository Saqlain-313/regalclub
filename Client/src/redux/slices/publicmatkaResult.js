import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// ==========================================================
// GET ALL RESULTS
// GET /api/results
// ==========================================================

export const getAllResults = createAsyncThunk(
  "results/getAllResults",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/results/results");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch results",
      );
    }
  },
);

// ==========================================================
// INITIAL STATE
// ==========================================================

const initialState = {
  results: [],
  loading: false,
  error: null,
};

// ==========================================================
// SLICE
// ==========================================================

const resultSlice = createSlice({
  name: "results",
  initialState,

  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ----------------------------------------------------
      // PENDING
      // ----------------------------------------------------

      .addCase(getAllResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // ----------------------------------------------------
      // SUCCESS
      // ----------------------------------------------------

      .addCase(getAllResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload?.data || [];
      })

      // ----------------------------------------------------
      // ERROR
      // ----------------------------------------------------

      .addCase(getAllResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch results";
      });
  },
});

export const { clearResults } = resultSlice.actions;

export default resultSlice.reducer;
