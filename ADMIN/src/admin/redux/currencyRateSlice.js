import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
        error.response?.data?.message || "Failed to fetch currency rates"
      );
    }
  }
);

// ==========================
// Create Currency
// ==========================
export const createCurrencyRate = createAsyncThunk(
  "currency/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/currency", formData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create currency"
      );
    }
  }
);

// ==========================
// Update Currency
// ==========================
export const updateCurrencyRate = createAsyncThunk(
  "currency/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/currency/${id}`, formData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update currency"
      );
    }
  }
);

// ==========================
// Delete Currency
// ==========================
export const deleteCurrencyRate = createAsyncThunk(
  "currency/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/currency/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete currency"
      );
    }
  }
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
      })

      // Create
      .addCase(createCurrencyRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCurrencyRate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currencies.push(action.payload.data);
      })
      .addCase(createCurrencyRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateCurrencyRate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const index = state.currencies.findIndex(
          (item) => item._id === action.payload.data._id
        );

        if (index !== -1) {
          state.currencies[index] = action.payload.data;
        }
      })
      .addCase(updateCurrencyRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCurrencyRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteCurrencyRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCurrencyRate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currencies = state.currencies.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteCurrencyRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCurrencyState } = currencyRateSlice.actions;

export default currencyRateSlice.reducer;