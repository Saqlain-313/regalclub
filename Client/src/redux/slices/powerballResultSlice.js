import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

const initialState = {
  results: [],
  loading: false,
  error: null,
  selectedCountry: "india",
};

export const getAllPowerballResults = createAsyncThunk(
  "powerballResult/getAll",
  async (country = "india", { rejectWithValue }) => {
    try {
      const normalizedCountry = String(country).toLowerCase();

      const res = await api.get(
        `/public/${normalizedCountry}/powerball-results`
      );

      return {
        country: normalizedCountry,
        data: res.data,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong."
      );
    }
  }
);

const powerballResultSlice = createSlice({
  name: "powerballResult",
  initialState,

  reducers: {
    clearPowerballResults: (state) => {
      state.results = [];
      state.error = null;
    },

    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllPowerballResults.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.selectedCountry =
          action.meta.arg || "india";
      })

      .addCase(getAllPowerballResults.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.results =
          action.payload?.data?.results ||
          action.payload?.data ||
          [];

        state.selectedCountry =
          action.payload?.country || "india";
      })

      .addCase(getAllPowerballResults.rejected, (state, action) => {
        state.loading = false;
        state.results = [];
        state.error =
          action.payload || "Something went wrong.";
      });
  },
});

export const {
  clearPowerballResults,
  setSelectedCountry,
} = powerballResultSlice.actions;

export default powerballResultSlice.reducer;