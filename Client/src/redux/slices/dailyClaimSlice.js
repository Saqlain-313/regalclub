import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// ==============================
// GET DAILY CLAIM STATUS
// ==============================

export const getDailyClaimStatus = createAsyncThunk(
  "dailyClaim/getDailyClaimStatus",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/daily-claim/status");
      return data;
    } catch (error) {
      console.error("❌ Error fetching claim status:", error);
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch claim status" }
      );
    }
  }
);

// ==============================
// CLAIM DAILY BONUS
// ==============================

export const claimDailyBonus = createAsyncThunk(
  "dailyClaim/claimDailyBonus",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/daily-claim/claim");
      console.log("✅ Claim Response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error claiming bonus:", error);
      return rejectWithValue(
        error.response?.data || { message: "Failed to claim reward" }
      );
    }
  }
);

const initialState = {
  // Loading states
  loading: false,
  claimLoading: false,

  // Status flags — split so UI can distinguish "status loaded" vs "just claimed"
  statusLoaded: false,
  claimSuccess: false,

  error: null,

  // Claim state
  canClaim: false,
  currentDay: 1,   // The day the user will claim NEXT
  claimedDay: null, // The day that was just claimed (set after a successful claim)

  // Rewards
  reward: 0,        // Reward earned from the last claim
  rewards: {},      // Full rewards map { 1: 10, 2: 15, ... }

  // User stats
  totalClaims: 0,
  totalCredit: "0",
  lastClaimDate: null,
  lastClaimDateIST: null,

  // Timing helpers for countdown UI
  nextClaimTime: null,
  timeRemaining: {
    hours: 0,
    minutes: 0,
    total: 0,
  },
};

const dailyClaimSlice = createSlice({
  name: "dailyClaim",
  initialState,

  reducers: {
    clearDailyClaimError: (state) => {
      state.error = null;
    },

    // Reset transient claim state (call after showing success modal etc.)
    resetClaimSuccess: (state) => {
      state.claimSuccess = false;
      state.reward = 0;
      state.claimedDay = null;
    },

    setCanClaim: (state, action) => {
      state.canClaim = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================
      // GET STATUS
      // ==========================

      .addCase(getDailyClaimStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getDailyClaimStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.statusLoaded = true;

        state.canClaim = action.payload.canClaim ?? false;
        state.currentDay = action.payload.currentDay ?? 1;
        state.rewards = action.payload.rewards || {};
        state.totalClaims = action.payload.totalClaims ?? 0;
        state.lastClaimDate = action.payload.lastClaimDate ?? null;
        state.lastClaimDateIST = action.payload.lastClaimDateIST ?? null;

        // Timing data for countdown UI
        state.nextClaimTime = action.payload.nextClaimTime ?? null;
        state.timeRemaining = action.payload.timeRemaining ?? initialState.timeRemaining;

        // NOTE: totalCredit is NOT returned by the status endpoint.
        // It is only updated after a successful claim.

      })

      .addCase(getDailyClaimStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
        console.error("❌ Status fetch rejected:", state.error);
      })

      // ==========================
      // CLAIM BONUS
      // ==========================

      .addCase(claimDailyBonus.pending, (state) => {
        state.claimLoading = true;
        state.error = null;
      })

      .addCase(claimDailyBonus.fulfilled, (state, action) => {
        state.claimLoading = false;
        state.claimSuccess = true;

        // claimedDay = the day just awarded
        // nextDay    = the day the user will claim next (what currentDay should become)
        state.claimedDay = action.payload.claimedDay ?? state.currentDay;
        state.currentDay = action.payload.nextDay ?? state.currentDay;

        state.reward = action.payload.reward ?? 0;
        state.totalCredit = action.payload.totalCredit ?? state.totalCredit;

        // Use null if no lastClaimDate returned — don't default to "now"
        state.lastClaimDate = action.payload.lastClaimDate ?? null;
        state.lastClaimDateIST = action.payload.lastClaimDateIST ?? null;

        // User has just claimed — cannot claim again until tomorrow IST
        state.canClaim = false;
        state.nextClaimTime = action.payload.nextClaimTime ?? null;

        console.log("✅ Claim successful — Reward:", state.reward, "| Next day:", state.currentDay);
      })

      .addCase(claimDailyBonus.rejected, (state, action) => {
        state.claimLoading = false;
        state.error = action.payload?.message || "Something went wrong";
        console.error("❌ Claim rejected:", state.error);
      });
  },
});

export const {
  clearDailyClaimError,
  resetClaimSuccess,
  setCanClaim,
} = dailyClaimSlice.actions;

export default dailyClaimSlice.reducer;