import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// ======================================================
// ADMIN LOGIN
// ======================================================

export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", credentials);

      // ============================================
      // ROLE CHECK
      // ============================================
      if (data?.user?.role !== "admin") {
        return rejectWithValue(
          "Access denied. Only admin users can login."
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// ======================================================
// GET ADMIN PROFILE
// ======================================================

export const getAdminProfile = createAsyncThunk(
  "adminAuth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/profile");

      // ============================================
      // ROLE CHECK
      // ============================================
      const adminUser = data?.user || data;

      if (adminUser?.role !== "admin") {
        return rejectWithValue(
          "Access denied. Admin access required."
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load profile"
      );
    }
  }
);

// ======================================================
// UPDATE ADMIN PROFILE
// ======================================================

export const updateAdminProfile = createAsyncThunk(
  "adminAuth/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        "/auth/profile",
        payload
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Profile update failed"
      );
    }
  }
);

// ======================================================
// CHANGE ADMIN PASSWORD
// ======================================================

export const changeAdminPassword = createAsyncThunk(
  "adminAuth/changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        "/auth/change-password",
        payload
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Password change failed"
      );
    }
  }
);

// ======================================================
// GET ALL USERS
// ======================================================

export const getAllUsers = createAsyncThunk(
  "adminAuth/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        "/auth/admin/users"
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch users"
      );
    }
  }
);

// ======================================================
// UPDATE USER STATUS
// ======================================================

export const updateUserStatus = createAsyncThunk(
  "adminAuth/updateUserStatus",
  async (
    { userId, status },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(
        `/auth/admin/users/${userId}/status`,
        { status }
      );

      return {
        ...data,
        userId,
        status,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update user status"
      );
    }
  }
);

// ======================================================
// LOGOUT
// ======================================================

export const adminLogout = createAsyncThunk(
  "adminAuth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/auth/logout"
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Logout failed"
      );
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================

const initialState = {
  loading: false,
  success: false,
  error: null,
  message: "",

  // Logged-in admin/user
  admin: null,

  // Users
  users: [],
  userCount: 0,

  // Token
  token: localStorage.getItem("adminToken") || null,

  // Authentication
  isAuthenticated:
    !!localStorage.getItem("adminToken"),

  // Profile
  profileLoaded: false,
  isProfileLoading: false,
};

// ======================================================
// SLICE
// ======================================================

const adminAuthSlice = createSlice({
  name: "adminAuth",

  initialState,

  reducers: {
    // --------------------------------------------
    // CLEAR ERROR
    // --------------------------------------------

    clearError: (state) => {
      state.error = null;
    },

    // --------------------------------------------
    // CLEAR MESSAGE
    // --------------------------------------------

    clearMessage: (state) => {
      state.message = "";
      state.success = false;
    },

    // --------------------------------------------
    // RESET PROFILE LOADED
    // --------------------------------------------

    resetProfileLoaded: (state) => {
      state.profileLoaded = false;
    },

    // --------------------------------------------
    // RESET ADMIN STATE
    // --------------------------------------------

    resetAdminState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";

      state.admin = null;

      state.token = null;

      state.isAuthenticated = false;

      state.profileLoaded = false;

      state.isProfileLoading = false;

      localStorage.removeItem("adminToken");
    },
  },

  extraReducers: (builder) => {
    builder

      // ==================================================
      // ADMIN LOGIN
      // ==================================================

      .addCase(
        adminLogin.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
          state.message = "";
        }
      )

      .addCase(
        adminLogin.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          // Save admin user
          state.admin =
            action.payload.user;

          // Save token
          state.token =
            action.payload.token;

          state.message =
            action.payload.message || "";

          state.isAuthenticated = true;

          state.profileLoaded = true;

          state.isProfileLoading = false;

          // Save token
          localStorage.setItem(
            "adminToken",
            action.payload.token
          );
        }
      )

      .addCase(
        adminLogin.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;

          state.error =
            action.payload ||
            "Login failed";

          // ==========================================
          // IMPORTANT
          // Non-admin login ke case me sab clear
          // ==========================================

          state.admin = null;
          state.token = null;
          state.isAuthenticated = false;
          state.profileLoaded = false;

          localStorage.removeItem(
            "adminToken"
          );
        }
      )

      // ==================================================
      // GET ADMIN PROFILE
      // ==================================================

      .addCase(
        getAdminProfile.pending,
        (state) => {
          state.loading = true;
          state.isProfileLoading = true;
          state.error = null;
        }
      )

      .addCase(
        getAdminProfile.fulfilled,
        (state, action) => {
          state.loading = false;
          state.isProfileLoading = false;

          const adminUser =
            action.payload?.user ||
            action.payload;

          // ==========================================
          // ROLE CHECK
          // ==========================================

          if (
            adminUser?.role !== "admin"
          ) {
            state.admin = null;
            state.token = null;
            state.isAuthenticated = false;
            state.profileLoaded = true;

            localStorage.removeItem(
              "adminToken"
            );

            state.error =
              "Access denied. Admin access required.";

            return;
          }

          state.admin = adminUser;

          state.profileLoaded = true;

          state.isAuthenticated = true;

          state.error = null;
        }
      )

      .addCase(
        getAdminProfile.rejected,
        (state, action) => {
          state.loading = false;
          state.isProfileLoading = false;

          state.error =
            action.payload ||
            "Failed to load profile";

          state.profileLoaded = true;

          const errorMessage = String(
            action.payload || ""
          ).toLowerCase();

          if (
            errorMessage.includes(
              "unauthorized"
            ) ||
            errorMessage.includes(
              "token"
            ) ||
            errorMessage.includes(
              "invalid"
            ) ||
            errorMessage.includes(
              "access denied"
            ) ||
            errorMessage.includes(
              "admin access"
            )
          ) {
            state.admin = null;
            state.token = null;
            state.isAuthenticated = false;

            localStorage.removeItem(
              "adminToken"
            );
          }
        }
      )

      // ==================================================
      // GET ALL USERS
      // ==================================================

      .addCase(
        getAllUsers.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getAllUsers.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.users =
            action.payload?.users || [];

          state.userCount =
            action.payload?.count || 0;
        }
      )

      .addCase(
        getAllUsers.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;

          state.error =
            action.payload ||
            "Failed to fetch users";
        }
      )

      // ==================================================
      // UPDATE PROFILE
      // ==================================================

      .addCase(
        updateAdminProfile.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        updateAdminProfile.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.admin =
            action.payload?.admin ||
            action.payload?.user ||
            state.admin;

          state.message =
            action.payload?.message || "";

          state.profileLoaded = true;

          state.error = null;
        }
      )

      .addCase(
        updateAdminProfile.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;

          state.error =
            action.payload ||
            "Profile update failed";
        }
      )

      // ==================================================
      // CHANGE PASSWORD
      // ==================================================

      .addCase(
        changeAdminPassword.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        changeAdminPassword.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.message =
            action.payload?.message || "";

          state.error = null;
        }
      )

      .addCase(
        changeAdminPassword.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;

          state.error =
            action.payload ||
            "Password change failed";
        }
      )

      // ==================================================
      // UPDATE USER STATUS
      // ==================================================

      .addCase(
        updateUserStatus.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        updateUserStatus.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.message =
            action.payload?.message || "";

          const index =
            state.users.findIndex(
              (user) =>
                user._id ===
                action.payload.userId
            );

          if (index !== -1) {
            state.users[index].status =
              action.payload.status;
          }
        }
      )

      .addCase(
        updateUserStatus.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;

          state.error =
            action.payload ||
            "Failed to update user status";
        }
      )

      // ==================================================
      // LOGOUT
      // ==================================================

      .addCase(
        adminLogout.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        adminLogout.fulfilled,
        (state, action) => {
          state.loading = false;

          state.admin = null;

          state.token = null;

          state.isAuthenticated = false;

          state.profileLoaded = false;

          state.isProfileLoading = false;

          state.success = true;

          state.message =
            action.payload?.message ||
            "Logged out successfully";

          localStorage.removeItem(
            "adminToken"
          );
        }
      )

      .addCase(
        adminLogout.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Logout failed";

          // Logout failed hone par bhi
          // local frontend session clear karo

          state.admin = null;

          state.token = null;

          state.isAuthenticated = false;

          state.profileLoaded = false;

          state.isProfileLoading = false;

          localStorage.removeItem(
            "adminToken"
          );
        }
      );
  },
});

// ======================================================
// EXPORT ACTIONS
// ======================================================

export const {
  clearError,
  clearMessage,
  resetProfileLoaded,
  resetAdminState,
} = adminAuthSlice.actions;

// ======================================================
// EXPORT REDUCER
// ======================================================

export default adminAuthSlice.reducer;