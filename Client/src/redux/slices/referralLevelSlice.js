import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// ======================================================
// GET ALL LEVELS
// ======================================================

export const getReferralLevels = createAsyncThunk(
  "referralLevel/getReferralLevels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/referral-levels");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch levels",
      );
    }
  },
);

// ======================================================
// SLICE
// ======================================================

const initialState = {
  levels: [],
  loading: false,
  updating: false,
  resetting: false,
  error: null,
  success: false,
  message: null,
};

const referralLevelSlice = createSlice({
  name: "referralLevel",
  initialState,
  reducers: {
    clearReferralLevelMessage: (state) => {
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL
      .addCase(getReferralLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReferralLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.levels = action.payload.levels || [];
        state.error = null;
      })
      .addCase(getReferralLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReferralLevelMessage } = referralLevelSlice.actions;
export default referralLevelSlice.reducer;
