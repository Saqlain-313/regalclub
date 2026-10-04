// redux/slices/paymentMethodSlice.js
//
// Saved withdrawal payment methods (bank / upi / usdt) — user CRUD

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

export const fetchPaymentMethods = createAsyncThunk(
  "paymentMethods/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/payment-methods");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load saved methods",
      );
    }
  },
);

export const addPaymentMethod = createAsyncThunk(
  "paymentMethods/add",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/payment-methods", payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to save method",
      );
    }
  },
);

export const updatePaymentMethod = createAsyncThunk(
  "paymentMethods/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/payment-methods/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update method",
      );
    }
  },
);

export const deletePaymentMethod = createAsyncThunk(
  "paymentMethods/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/payment-methods/${id}`);
      return { ...data, id };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete method",
      );
    }
  },
);

const paymentMethodSlice = createSlice({
  name: "paymentMethods",
  initialState: {
    methods: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.methods = action.payload?.methods || [];
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addPaymentMethod.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload?.method) state.methods.push(action.payload.method);
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      .addCase(updatePaymentMethod.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.methods.findIndex(
          (m) => m._id === action.payload?.method?._id,
        );
        if (idx !== -1 && action.payload?.method) {
          state.methods[idx] = action.payload.method;
        }
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      .addCase(deletePaymentMethod.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.saving = false;
        state.methods = state.methods.filter(
          (m) => m._id !== action.payload?.id,
        );
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectPaymentMethods = (state) => state.paymentMethods.methods;
export const selectPaymentMethodsLoading = (state) =>
  state.paymentMethods.loading;
export const selectPaymentMethodsSaving = (state) =>
  state.paymentMethods.saving;

export const selectMethodsByType = (type) => (state) =>
  state.paymentMethods.methods.filter((m) => m.type === type);

export default paymentMethodSlice.reducer;
