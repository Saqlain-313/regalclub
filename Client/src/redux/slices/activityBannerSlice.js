import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

/* ======================================================
   ACTIVITY CONTENT — /activity banners + referral share image
   (managed from the admin ActivityBanners panel)
===================================================== */

export const getActivityContent = createAsyncThunk(
  "activityBanner/get",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/activity-banners");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch activity content",
      );
    }
  },
);

const activityBannerSlice = createSlice({
  name: "activityBanner",
  initialState: {
    banners: [],
    referralShareImage: "",
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getActivityContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActivityContent.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload?.banners || [];
        state.referralShareImage = action.payload?.referralShareImage || "";
      })
      .addCase(getActivityContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch activity content";
      });
  },
});

export default activityBannerSlice.reducer;
