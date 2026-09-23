import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";

const COUNTRY = "bangladesh";

export const getGameCounts = createAsyncThunk(
  "bangladeshGameCount",
  async (payload = {}, thunkAPI) => {
    try {
      const ticketType =
        typeof payload === "string"
          ? payload
          : payload?.ticketType;

      const params = {};

      if (ticketType) {
        params.ticketType = ticketType;
      }

      const { data } = await api.get(
        "/" + COUNTRY + "/game-counts",
        { params }
      );

      return Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.gameCounts)
            ? data.gameCounts
            : Array.isArray(data?.data?.gameCounts)
              ? data.data.gameCounts
              : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch game counts"
      );
    }
  }
);

const bangladeshGameCountSlice = createSlice({
  name: "bangladeshGameCount",

  initialState: {
    loading: false,
    gameCounts: [],
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // ==========================================
      // GET GAME COUNTS
      // ==========================================
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
          action.payload ||
          "Failed to fetch game counts";
      });
  },
});

export default bangladeshGameCountSlice.reducer;