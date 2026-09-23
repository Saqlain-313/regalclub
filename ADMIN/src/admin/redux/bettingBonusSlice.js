import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// ======================================================
// GET BETTING BONUS
// ======================================================
export const getBettingBonus = createAsyncThunk(
  "bettingBonus/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/betting-bonus");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch betting bonus"
      );
    }
  }
);

// ======================================================
// UPDATE BETTING BONUS
// ======================================================
export const updateBettingBonus = createAsyncThunk(
  "bettingBonus/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put("/betting-bonus", data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update betting bonus"
      );
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  bonus: null,
  loading: false,
  updating: false,
  error: null,
  success: false,
};

// ======================================================
// SLICE
// ======================================================
const bettingBonusSlice = createSlice({
  name: "bettingBonus",
  initialState,

  reducers: {
    clearBettingBonusMessage: (state) => {
      state.error = null;
      state.success = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==================================================
      // GET
      // ==================================================
      .addCase(getBettingBonus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getBettingBonus.fulfilled, (state, action) => {
        state.loading = false;
        state.bonus = action.payload?.data || null;
      })

      .addCase(getBettingBonus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================================================
      // UPDATE
      // ==================================================
      .addCase(updateBettingBonus.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateBettingBonus.fulfilled, (state, action) => {
        state.updating = false;
        state.success = true;
        state.bonus = action.payload?.data || state.bonus;
      })

      .addCase(updateBettingBonus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearBettingBonusMessage } =
  bettingBonusSlice.actions;

export default bettingBonusSlice.reducer;