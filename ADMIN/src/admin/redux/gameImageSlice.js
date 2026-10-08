// src/admin/redux/gameImageSlice.js
//
// Admin-changeable images for the client home page game cards
// (wingo / trading / mines / powerballs / matka).

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

export const GAME_IMAGE_KEYS = [
  { key: "wingo", label: "Wingo" },
  { key: "trading", label: "Trading" },
  { key: "mines", label: "Mines" },
  { key: "powerball_india", label: "Indian Powerball" },
  { key: "matka", label: "Matka" },
  { key: "powerball_australia", label: "Australian Powerball" },
];

// ================= GET IMAGES =================

export const getGameImages = createAsyncThunk(
  "gameImages/get",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/game-images");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch game images"
      );
    }
  }
);

// ================= UPDATE ONE IMAGE =================

export const updateGameImage = createAsyncThunk(
  "gameImages/update",
  async ({ key, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/game-images/${key}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update game image"
      );
    }
  }
);

// ================= SLICE =================

const gameImageSlice = createSlice({
  name: "gameImages",

  initialState: {
    images: {}, // key -> imageUrl
    loading: false,
    savingKey: null,
    error: null,
    message: "",
  },

  reducers: {
    clearGameImageState: (state) => {
      state.loading = false;
      state.savingKey = null;
      state.error = null;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getGameImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGameImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload?.data || {};
      })
      .addCase(getGameImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateGameImage.pending, (state, action) => {
        state.savingKey = action.meta.arg?.key || null;
      })
      .addCase(updateGameImage.fulfilled, (state, action) => {
        state.savingKey = null;
        state.message = action.payload?.message || "";
        const doc = action.payload?.data;
        if (doc?.key) {
          state.images[doc.key] = doc.imageUrl;
        }
      })
      .addCase(updateGameImage.rejected, (state, action) => {
        state.savingKey = null;
        state.error = action.payload;
      });
  },
});

export const { clearGameImageState } = gameImageSlice.actions;

export default gameImageSlice.reducer;
