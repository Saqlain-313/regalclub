import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

const COUNTRIES = new Set([
  "india",
  "uae",
  "nepal",
  "pakistan",
  "australia",
  "bangladesh",
]);

const normalizeCountry = (country) => {
  const value = String(country || "").trim().toLowerCase();
  return COUNTRIES.has(value) ? value : "india";
};

const getUrl = (country, suffix = "") =>
  `/admin/${normalizeCountry(country)}/powerball/divisions${suffix}`;

const initialState = {
  divisions: [],
  selectedDivision: null,
  loading: false,
  error: null,
  success: false,
  message: "",
  country: "india",
};

export const getAllDivisions = createAsyncThunk(
  "powerballDivision/getAll",
  async (country = "india", { rejectWithValue }) => {
    try {
      const { data } = await api.get(getUrl(country));
      return { ...data, country: normalizeCountry(country) };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch Powerball divisions."
      );
    }
  }
);

export const getActiveDivisions = createAsyncThunk(
  "powerballDivision/getActive",
  async (country = "india", { rejectWithValue }) => {
    try {
      const { data } = await api.get(getUrl(country, "/active"));
      return { ...data, country: normalizeCountry(country) };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch active divisions."
      );
    }
  }
);

export const getDivisionById = createAsyncThunk(
  "powerballDivision/getById",
  async ({ country = "india", id }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(getUrl(country, `/${id}`));
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch division."
      );
    }
  }
);

export const createDivision = createAsyncThunk(
  "powerballDivision/create",
  async ({ country = "india", data: payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(getUrl(country), payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create division."
      );
    }
  }
);

export const updateDivision = createAsyncThunk(
  "powerballDivision/update",
  async ({ country = "india", id, data: payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(getUrl(country, `/${id}`), payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update division."
      );
    }
  }
);

export const deleteDivision = createAsyncThunk(
  "powerballDivision/delete",
  async ({ country = "india", id }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(getUrl(country, `/${id}`));
      return { ...data, deletedId: id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete division."
      );
    }
  }
);

export const toggleDivisionStatus = createAsyncThunk(
  "powerballDivision/toggle",
  async ({ country = "india", id }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(getUrl(country, `/${id}/toggle`));
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to change division status."
      );
    }
  }
);

const slice = createSlice({
  name: "powerballDivision",
  initialState,
  reducers: {
    clearDivisionMessage: (state) => {
      state.error = null;
      state.message = "";
      state.success = false;
    },
    clearSelectedDivision: (state) => {
      state.selectedDivision = null;
    },
    resetDivisionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllDivisions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDivisions.fulfilled, (state, action) => {
        state.loading = false;
        state.country = action.payload.country;
        state.divisions = Array.isArray(action.payload?.divisions)
          ? action.payload.divisions
          : [];
        state.message = action.payload?.message || "";
      })
      .addCase(getAllDivisions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch divisions.";
      })

      .addCase(getActiveDivisions.fulfilled, (state, action) => {
        state.loading = false;
        state.country = action.payload.country;
        state.divisions = Array.isArray(action.payload?.divisions)
          ? action.payload.divisions
          : [];
      })

      .addCase(getDivisionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDivision = action.payload?.division || null;
      })

      .addCase(createDivision.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createDivision.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Division created successfully.";
        if (action.payload?.division) {
          state.divisions.push(action.payload.division);
          state.divisions.sort((a, b) => Number(a.division) - Number(b.division));
        }
      })
      .addCase(createDivision.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateDivision.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Division updated successfully.";
        const item = action.payload?.division;
        if (item) {
          const index = state.divisions.findIndex((x) => x._id === item._id);
          if (index >= 0) state.divisions[index] = item;
          else state.divisions.push(item);
          state.divisions.sort((a, b) => Number(a.division) - Number(b.division));
          state.selectedDivision = item;
        }
      })
      .addCase(updateDivision.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteDivision.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Division deleted successfully.";
        state.divisions = state.divisions.filter(
          (x) => x._id !== action.payload?.deletedId
        );
      })
      .addCase(deleteDivision.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(toggleDivisionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Division status updated.";
        const item = action.payload?.division;
        if (item) {
          const index = state.divisions.findIndex((x) => x._id === item._id);
          if (index >= 0) state.divisions[index] = item;
        }
      })
      .addCase(toggleDivisionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearDivisionMessage,
  clearSelectedDivision,
  resetDivisionState,
} = slice.actions;

export default slice.reducer;
