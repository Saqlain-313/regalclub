import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {api} from "./api";

// ==========================
// Get Deposit Methods
// ==========================
export const getDepositMethods = createAsyncThunk(
  "deposit/getMethods",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/deposit-settings/user/methods");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// ==========================
// Create Deposit
// ==========================
export const createDeposit = createAsyncThunk(
  "deposit/create",
  async (formData, thunkAPI) => {
    try {
      const { data } = await api.post(
        "/deposit/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// ==========================
// Deposit History
// ==========================
export const getMyDeposits = createAsyncThunk(
  "deposit/history",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/deposit/my");
      return data.deposits;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Something went wrong"
      );
    }
  }
);

const initialState = {

  methods: [],

  deposits: [],

  loading: false,

  success: false,

  message: "",

  error: null,

};

const depositSlice = createSlice({

  name: "deposit",

  initialState,

  reducers: {

    clearDepositState: (state) => {

      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";

    },

  },

  extraReducers: (builder) => {

    builder

      // ==================
      // Get Methods
      // ==================

      .addCase(getDepositMethods.pending, (state) => {

        state.loading = true;

      })

      .addCase(getDepositMethods.fulfilled, (state, action) => {

        state.loading = false;

        state.methods = action.payload.methods;

      })

      .addCase(getDepositMethods.rejected, (state, action) => {

        state.loading = false;

        state.error = action.payload;

      })

      // ==================
      // Create Deposit
      // ==================

      .addCase(createDeposit.pending, (state) => {

        state.loading = true;

      })

      .addCase(createDeposit.fulfilled, (state, action) => {

        state.loading = false;

        state.success = true;

        state.message = action.payload.message;

      })

      .addCase(createDeposit.rejected, (state, action) => {

        state.loading = false;

        state.error = action.payload;

      })

      // ==================
      // History
      // ==================

      .addCase(getMyDeposits.pending, (state) => {

        state.loading = true;

      })

      .addCase(getMyDeposits.fulfilled, (state, action) => {

        state.loading = false;

        state.deposits = action.payload;

      })

      .addCase(getMyDeposits.rejected, (state, action) => {

        state.loading = false;

        state.error = action.payload;

      });

  },

});

export const {
  clearDepositState,
} = depositSlice.actions;

export default depositSlice.reducer;