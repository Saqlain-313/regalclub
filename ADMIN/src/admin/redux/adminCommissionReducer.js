import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// GET /commission-get
export const getAdminCommission = createAsyncThunk(
  "adminCommission/getAdminCommission",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/commission-get");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to get commission",
          status: false,
        }
      );
    }
  }
);

// POST /commission-admin
export const tradeAdminCommission = createAsyncThunk(
  "adminCommission/tradeAdminCommission",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/commission-admin", {});

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to process commission",
          status: false,
        }
      );
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  tradeLoading: false,
  error: null,
  success: false,
  message: "",
};

const adminCommissionSlice = createSlice({
  name: "adminCommission",
  initialState,

  reducers: {
    clearCommissionState: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // GET COMMISSION
      // =========================
      .addCase(getAdminCommission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAdminCommission.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.data || [];
        state.message = action.payload?.message || "";
        state.success = action.payload?.status ?? true;
      })

      .addCase(getAdminCommission.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to get commission";
        state.success = false;
      })

      // =========================
      // TRADE COMMISSION
      // =========================
      .addCase(tradeAdminCommission.pending, (state) => {
        state.tradeLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(tradeAdminCommission.fulfilled, (state, action) => {
        state.tradeLoading = false;
        state.message =
          action.payload?.message ||
          "Commission successfully transferred";

        state.success = action.payload?.status ?? true;

        if (action.payload?.status) {
          state.users = [];
        }
      })

      .addCase(tradeAdminCommission.rejected, (state, action) => {
        state.tradeLoading = false;
        state.error =
          action.payload?.message ||
          "Failed to process commission";
        state.success = false;
      });
  },
});

export const { clearCommissionState } =
  adminCommissionSlice.actions;

export default adminCommissionSlice.reducer;
