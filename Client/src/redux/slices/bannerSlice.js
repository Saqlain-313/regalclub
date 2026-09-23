// src/redux/bannerSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// ================= GET BANNERS =================

export const getBanners = createAsyncThunk(
  "banner/getBanners",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/banner");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch banners"
      );
    }
  }
);

// ================= UPLOAD BANNER =================

export const uploadBanner = createAsyncThunk(
  "banner/uploadBanner",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/banner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to upload banner"
      );
    }
  }
);

// ================= UPDATE BANNER =================

export const updateBanner = createAsyncThunk(
  "banner/updateBanner",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/banner/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update banner"
      );
    }
  }
);

// ================= DELETE BANNER =================

export const deleteBanner = createAsyncThunk(
  "banner/deleteBanner",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/banner/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete banner"
      );
    }
  }
);

// ================= SLICE =================

const bannerSlice = createSlice({
  name: "banner",

  initialState: {
    banners: [],
    loading: false,
    uploadLoading: false,
    updateLoading: false,
    deleteLoading: false,
    success: false,
    error: null,
    message: "",
  },

  reducers: {
    clearBannerState: (state) => {
      state.loading = false;
      state.uploadLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= GET =================

      .addCase(getBanners.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.data;
      })
      .addCase(getBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= UPLOAD =================

      .addCase(uploadBanner.pending, (state) => {
        state.uploadLoading = true;
      })
      .addCase(uploadBanner.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.success = true;
        state.message = action.payload.message;
        state.banners = action.payload.data.banners;
      })
      .addCase(uploadBanner.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      })

      // ================= UPDATE =================

      .addCase(updateBanner.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.message = action.payload.message;
        state.banners = action.payload.data.banners;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // ================= DELETE =================

      .addCase(deleteBanner.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.success = true;
        state.message = action.payload.message;
        state.banners = action.payload.data.banners;
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBannerState } = bannerSlice.actions;

export default bannerSlice.reducer;