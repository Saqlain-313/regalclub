import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from './api';



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
            return rejectWithValue(error.response?.data?.message || "Failed to fetch levels");
        }
    }
);

// ======================================================
// UPDATE SINGLE LEVEL (FIXED)
// ======================================================

export const updateReferralLevel = createAsyncThunk(
    "referralLevel/updateReferralLevel",
    async ({ level, data }, { rejectWithValue }) => {
        try {
            // Make sure level is a number
            const levelNumber = parseInt(level);
            if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 8) {
                throw new Error("Level must be between 1 and 8");
            }
            
            const response = await api.put(`${"/admin/referral-levels"}/${levelNumber}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to update level"
            );
        }
    }
);

// ======================================================
// UPDATE ALL LEVELS
// ======================================================

export const updateAllReferralLevels = createAsyncThunk(
    "referralLevel/updateAllReferralLevels",
    async (levels, { rejectWithValue }) => {
        try {
            const response = await api.put("/admin/referral-levels", { levels });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update levels"
            );
        }
    }
);

// ======================================================
// RESET LEVELS
// ======================================================

export const resetReferralLevels = createAsyncThunk(
    "referralLevel/resetReferralLevels",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post(`${"/admin/referral-levels"}/reset`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to reset levels"
            );
        }
    }
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
            })
            
            // UPDATE SINGLE
            .addCase(updateReferralLevel.pending, (state) => {
                state.updating = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateReferralLevel.fulfilled, (state, action) => {
                state.updating = false;
                state.success = true;
                state.message = action.payload.message || "Level updated successfully";
                // Update the levels array with the updated level
                const updatedLevel = action.payload.level;
                if (updatedLevel) {
                    const index = state.levels.findIndex(l => l.level === updatedLevel.level);
                    if (index !== -1) {
                        state.levels[index] = updatedLevel;
                    }
                }
                state.error = null;
            })
            .addCase(updateReferralLevel.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
                state.success = false;
            })
            
            // UPDATE ALL
            .addCase(updateAllReferralLevels.pending, (state) => {
                state.updating = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateAllReferralLevels.fulfilled, (state, action) => {
                state.updating = false;
                state.success = true;
                state.message = action.payload.message || "All levels updated successfully";
                state.levels = action.payload.levels || state.levels;
                state.error = null;
            })
            .addCase(updateAllReferralLevels.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
                state.success = false;
            })
            
            // RESET
            .addCase(resetReferralLevels.pending, (state) => {
                state.resetting = true;
                state.error = null;
                state.success = false;
            })
            .addCase(resetReferralLevels.fulfilled, (state, action) => {
                state.resetting = false;
                state.success = true;
                state.message = action.payload.message || "Levels reset successfully";
                state.levels = action.payload.levels || [];
                state.error = null;
            })
            .addCase(resetReferralLevels.rejected, (state, action) => {
                state.resetting = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export const { clearReferralLevelMessage } = referralLevelSlice.actions;
export default referralLevelSlice.reducer;