import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {api} from "./api";

export const getGameCounts = createAsyncThunk(
  "gameCount/getGameCounts",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/game-counts");
      return data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

const gameCountSlice = createSlice({
  name: "gameCount",

  initialState: {
    loading: false,
    gameCounts: [],
    error: null,
  },

  reducers: {},

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
      });
  },
});

export default gameCountSlice.reducer;