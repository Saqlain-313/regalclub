import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// ==========================
// Get All Currency Rates
// ==========================
export const getCurrencyRates = createAsyncThunk(
  "currency/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/currency");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch currency rates",
      );
    }
  },
);

const initialState = {
  currencies: [],
  loading: false,
  error: null,
  success: false,
};

const currencyRateSlice = createSlice({
  name: "currencyRate",
  initialState,
  reducers: {
    resetCurrencyState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder

      // Get
      .addCase(getCurrencyRates.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrencyRates.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies = action.payload.data;
      })
      .addCase(getCurrencyRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCurrencyState } = currencyRateSlice.actions;

export default currencyRateSlice.reducer;
