// src/redux/slices/authSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// ================= REGISTER =================

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/auth/register`, userData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// ================= LOGIN =================

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/auth/login`, userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

// ================= PROFILE =================

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/auth/profile`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load profile",
      );
    }
  },
);

// ================= UPDATE PROFILE =================

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/profile", formData, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

// ================= LOGOUT =================

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/auth/logout`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

// ================= FORGOT PASSWORD =================

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/auth/forgot-password`, {
        email,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

// ================= VERIFY OTP =================

export const verifyOTPAndReset = createAsyncThunk(
  "auth/verifyOTPAndReset",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/auth/verify-reset-password`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Reset password failed",
      );
    }
  },
);

// ================= CHANGE PASSWORD =================

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/auth/change-password`, passwordData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password change failed",
      );
    }
  },
);

// ================= INITIAL STATE =================

const initialState = {
  loading: false,
  success: false,
  error: null,
  message: "",
  user: null,
  referralStats: null, // ADDED
  recentJoinedMembers: [], // ADDED
  token: localStorage.getItem("powerhit") || null,
  isAuthenticated: !!localStorage.getItem("powerhit"),
  profileLoaded: false,
  isProfileLoading: false,
};

// ================= SLICE =================

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearMessage: (state) => {
      state.message = "";
      state.success = false;
    },

    resetProfileLoaded: (state) => {
      state.profileLoaded = false;
    },

    resetAuthState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
      state.user = null;
      state.referralStats = null; // ADDED
      state.recentJoinedMembers = []; // ADDED
      state.token = null;
      state.isAuthenticated = false;
      state.profileLoaded = false;
      state.isProfileLoading = false;
      localStorage.removeItem("powerhit");
    },
  },

  extraReducers: (builder) => {
    builder

      // ========== REGISTER ==========
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
        state.isAuthenticated = true;
        state.profileLoaded = false;
        state.isProfileLoading = false;

        localStorage.setItem("powerhit", action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.isProfileLoading = false;
      })

      // ========== LOGIN ==========
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
        state.isAuthenticated = true;
        state.profileLoaded = false;
        state.isProfileLoading = false;

        localStorage.setItem("powerhit", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.isProfileLoading = false;
      })

      // ========== GET PROFILE (FIXED) ==========
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isProfileLoading = false;
        state.user = action.payload.user;
        state.referralStats = action.payload.referralStats; // ADDED
        state.recentJoinedMembers = action.payload.recentJoinedMembers; // ADDED
        state.profileLoaded = true;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.isProfileLoading = false;
        state.error = action.payload;
        state.profileLoaded = true;

        const errorMessage = action.payload?.toLowerCase() || "";
        if (
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("powerhit") ||
          errorMessage.includes("invalid")
        ) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          localStorage.removeItem("powerhit");
        }
      })

      // ========== UPDATE PROFILE ==========
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.message = action.payload.message;
        state.profileLoaded = true;
        state.isProfileLoading = false;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.isProfileLoading = false;
      })

      // ========== CHANGE PASSWORD ==========
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // ========== LOGOUT ==========
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.referralStats = null; // ADDED
        state.recentJoinedMembers = []; // ADDED
        state.token = null;
        state.isAuthenticated = false;
        state.message = action.payload.message;
        state.profileLoaded = false;
        state.isProfileLoading = false;
        state.success = true;

        localStorage.removeItem("powerhit");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.referralStats = null; // ADDED
        state.recentJoinedMembers = []; // ADDED
        state.token = null;
        state.isAuthenticated = false;
        state.profileLoaded = false;
        state.isProfileLoading = false;
        localStorage.removeItem("powerhit");
      })

      // ========== FORGOT PASSWORD ==========
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // ========== VERIFY OTP ==========
      .addCase(verifyOTPAndReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyOTPAndReset.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(verifyOTPAndReset.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

// ================= EXPORT ACTIONS =================

export const { clearError, clearMessage, resetProfileLoaded, resetAuthState } =
  authSlice.actions;

export default authSlice.reducer;
