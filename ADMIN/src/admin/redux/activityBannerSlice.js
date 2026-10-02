// src/admin/redux/activityBannerSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

/* ======================================================
   ACTIVITY BANNERS + REFERRAL SHARE IMAGE — admin CRUD
===================================================== */

export const getActivityContentAdmin = createAsyncThunk(
  "activityBannerAdmin/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/activity-banners/admin/all");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch activity content",
      );
    }
  },
);

export const uploadActivityBanner = createAsyncThunk(
  "activityBannerAdmin/upload",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/activity-banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to upload banner",
      );
    }
  },
);

export const updateActivityBanner = createAsyncThunk(
  "activityBannerAdmin/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/activity-banners/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update banner",
      );
    }
  },
);

export const deleteActivityBanner = createAsyncThunk(
  "activityBannerAdmin/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/activity-banners/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete banner",
      );
    }
  },
);

export const uploadReferralShareImage = createAsyncThunk(
  "activityBannerAdmin/uploadReferralImage",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        "/activity-banners/referral-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to upload referral share image",
      );
    }
  },
);

const activityBannerAdminSlice = createSlice({
  name: "activityBannerAdmin",
  initialState: {
    banners: [],
    referralShareImage: "",
    loading: false,
    uploadLoading: false,
    updateLoading: false,
    deleteLoading: false,
    referralUploadLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getActivityContentAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActivityContentAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload?.banners || [];
        state.referralShareImage = action.payload?.referralShareImage || "";
      })
      .addCase(getActivityContentAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPLOAD BANNER
      .addCase(uploadActivityBanner.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadActivityBanner.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.banners = action.payload?.banners || state.banners;
      })
      .addCase(uploadActivityBanner.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      })
      // UPDATE BANNER
      .addCase(updateActivityBanner.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateActivityBanner.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.banners = action.payload?.banners || state.banners;
      })
      .addCase(updateActivityBanner.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // DELETE BANNER
      .addCase(deleteActivityBanner.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteActivityBanner.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.banners = action.payload?.banners || state.banners;
      })
      .addCase(deleteActivityBanner.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      // REFERRAL SHARE IMAGE
      .addCase(uploadReferralShareImage.pending, (state) => {
        state.referralUploadLoading = true;
        state.error = null;
      })
      .addCase(uploadReferralShareImage.fulfilled, (state, action) => {
        state.referralUploadLoading = false;
        state.referralShareImage =
          action.payload?.referralShareImage || state.referralShareImage;
      })
      .addCase(uploadReferralShareImage.rejected, (state, action) => {
        state.referralUploadLoading = false;
        state.error = action.payload;
      });
  },
});

export default activityBannerAdminSlice.reducer;
