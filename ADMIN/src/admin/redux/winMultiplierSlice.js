import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// ======================================================
// GET WIN MULTIPLIERS
// ======================================================
export const getWinMultipliers = createAsyncThunk(
  "winMultiplier/getWinMultipliers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/win-multipliers");

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch win multipliers"
      );
    }
  }
);

// ======================================================
// UPDATE ALL MULTIPLIERS
// ======================================================
export const updateWinMultipliers = createAsyncThunk(
  "winMultiplier/updateWinMultipliers",
  async (multipliers, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/win-multipliers", {
        multipliers,
      });

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update win multipliers"
      );
    }
  }
);

// ======================================================
// UPDATE SINGLE MULTIPLIER
// ======================================================
export const updateSingleMultiplier = createAsyncThunk(
  "winMultiplier/updateSingleMultiplier",
  async ({ gameType, name, value }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/win-multipliers/${gameType}`,
        {
          name,
          value,
        }
      );

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update multiplier"
      );
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  multipliers: {},
  loading: false,
  updateLoading: false,
  error: null,
  success: false,
};

// ======================================================
// SLICE
// ======================================================
const winMultiplierSlice = createSlice({
  name: "winMultiplier",

  initialState,

  reducers: {
    clearWinMultiplierMessage: (state) => {
      state.error = null;
      state.success = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==================================================
      // GET
      // ==================================================
      .addCase(getWinMultipliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getWinMultipliers.fulfilled, (state, action) => {
        state.loading = false;
        state.multipliers = action.payload?.multipliers || {};
      })

      .addCase(getWinMultipliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================================================
      // UPDATE ALL
      // ==================================================
      .addCase(updateWinMultipliers.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateWinMultipliers.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.multipliers =
          action.payload?.multipliers || {};
      })

      .addCase(updateWinMultipliers.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // ==================================================
      // UPDATE SINGLE
      // ==================================================
      .addCase(updateSingleMultiplier.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateSingleMultiplier.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.multipliers =
          action.payload?.multipliers || {};
      })

      .addCase(updateSingleMultiplier.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearWinMultiplierMessage,
} = winMultiplierSlice.actions;

export default winMultiplierSlice.reducer;