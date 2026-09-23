import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

// ======================================================
// BASE URL
// ======================================================
const BASE_URL = "/uae/powerball/divisions";

// ======================================================
// GET ALL DIVISIONS
// ======================================================
export const getAllDivisions = createAsyncThunk(
  "UaePowerballDivision/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(BASE_URL, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch Powerball divisions."
      );
    }
  }
);

// ======================================================
// GET ACTIVE DIVISIONS
// ======================================================
export const getActiveDivisions = createAsyncThunk(
  "UaePowerballDivision/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${BASE_URL}/active`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch active Powerball divisions."
      );
    }
  }
);

// ======================================================
// GET DIVISION BY ID
// ======================================================
export const getDivisionById = createAsyncThunk(
  "UaePowerballDivision/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch Powerball division."
      );
    }
  }
);

// ======================================================
// CREATE DIVISION
// ======================================================
export const createDivision = createAsyncThunk(
  "UaePowerballDivision/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(BASE_URL, data, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create Powerball division."
      );
    }
  }
);

// ======================================================
// UPDATE DIVISION
// ======================================================
export const updateDivision = createAsyncThunk(
  "UaePowerballDivision/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, data, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update Powerball division."
      );
    }
  }
);

// ======================================================
// DELETE DIVISION
// ======================================================
export const deleteDivision = createAsyncThunk(
  "UaePowerballDivision/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`, {
        withCredentials: true,
      });

      return {
        ...response.data,
        deletedId: id,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete Powerball division."
      );
    }
  }
);

// ======================================================
// TOGGLE STATUS
// ======================================================
export const toggleDivisionStatus = createAsyncThunk(
  "UaePowerballDivision/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `${BASE_URL}/${id}/toggle`,
        {},
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to change division status."
      );
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  divisions: [],
  selectedDivision: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

// ======================================================
// SLICE
// ======================================================
const powerballDivisionSlice = createSlice({
  name: "uaePowerballDivision",
  initialState,

  reducers: {
    // ==================================================
    // CLEAR MESSAGE
    // ==================================================
    clearDivisionMessage: (state) => {
      state.error = null;
      state.message = "";
      state.success = false;
    },

    // ==================================================
    // CLEAR SELECTED DIVISION
    // ==================================================
    clearSelectedDivision: (state) => {
      state.selectedDivision = null;
    },

    // ==================================================
    // RESET STATE
    // ==================================================
    resetDivisionState: () => initialState,
  },

  extraReducers: (builder) => {
    // ==================================================
    // GET ALL
    // ==================================================
    builder
      .addCase(getAllDivisions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAllDivisions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.divisions = Array.isArray(action.payload?.divisions)
          ? action.payload.divisions
          : [];

        state.message = action.payload?.message || "";
      })

      .addCase(getAllDivisions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch Powerball divisions.";
      })

      // ==================================================
      // GET ACTIVE
      // ==================================================
      .addCase(getActiveDivisions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getActiveDivisions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.divisions = Array.isArray(action.payload?.divisions)
          ? action.payload.divisions
          : [];

        state.message = action.payload?.message || "";
      })

      .addCase(getActiveDivisions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch active Powerball divisions.";
      })

      // ==================================================
      // GET BY ID
      // ==================================================
      .addCase(getDivisionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getDivisionById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.selectedDivision =
          action.payload?.division || null;

        state.message = action.payload?.message || "";
      })

      .addCase(getDivisionById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch Powerball division.";
      })

      // ==================================================
      // CREATE
      // ==================================================
      .addCase(createDivision.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(createDivision.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;

        state.message =
          action.payload?.message ||
          "Powerball division created successfully.";

        const newDivision = action.payload?.division;

        if (newDivision) {
          const exists = state.divisions.some(
            (item) => item._id === newDivision._id
          );

          if (!exists) {
            state.divisions.push(newDivision);
          }

          state.divisions.sort(
            (a, b) => Number(a.division) - Number(b.division)
          );
        }
      })

      .addCase(createDivision.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to create Powerball division.";
      })

      // ==================================================
      // UPDATE
      // ==================================================
      .addCase(updateDivision.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(updateDivision.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;

        state.message =
          action.payload?.message ||
          "Powerball division updated successfully.";

        const updatedDivision = action.payload?.division;

        if (updatedDivision) {
          const index = state.divisions.findIndex(
            (item) => item._id === updatedDivision._id
          );

          if (index !== -1) {
            state.divisions[index] = updatedDivision;
          } else {
            state.divisions.push(updatedDivision);
          }

          state.divisions.sort(
            (a, b) => Number(a.division) - Number(b.division)
          );

          state.selectedDivision = updatedDivision;
        }
      })

      .addCase(updateDivision.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to update Powerball division.";
      })

      // ==================================================
      // DELETE
      // ==================================================
      .addCase(deleteDivision.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(deleteDivision.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;

        state.message =
          action.payload?.message ||
          "Powerball division deleted successfully.";

        const deletedId = action.payload?.deletedId;

        state.divisions = state.divisions.filter(
          (item) => item._id !== deletedId
        );

        if (state.selectedDivision?._id === deletedId) {
          state.selectedDivision = null;
        }
      })

      .addCase(deleteDivision.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to delete Powerball division.";
      })

      // ==================================================
      // TOGGLE
      // ==================================================
      .addCase(toggleDivisionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(toggleDivisionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;

        state.message =
          action.payload?.message ||
          "Division status updated successfully.";

        const updatedDivision = action.payload?.division;

        if (updatedDivision) {
          const index = state.divisions.findIndex(
            (item) => item._id === updatedDivision._id
          );

          if (index !== -1) {
            state.divisions[index] = updatedDivision;
          } else {
            state.divisions.push(updatedDivision);
          }

          if (
            state.selectedDivision?._id ===
            updatedDivision._id
          ) {
            state.selectedDivision = updatedDivision;
          }
        }
      })

      .addCase(toggleDivisionStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to change division status.";
      });
  },
});

// ======================================================
// ACTIONS
// ======================================================
export const {
  clearDivisionMessage,
  clearSelectedDivision,
  resetDivisionState,
} = powerballDivisionSlice.actions;

// ======================================================
// REDUCER
// ======================================================
export default powerballDivisionSlice.reducer;