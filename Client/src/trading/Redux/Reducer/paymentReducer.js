import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";



export const Withdrawl = createAsyncThunk(
  "user/withdrawal",
  async ( {amount, type, usdt}, { rejectWithValue }) => {
    try {
      const response = await api.post('/withdrawal', {amount, type, usdt}, {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

export const Recharge = createAsyncThunk(
  "user/recharge",
  async ( {amount, type, utrNo, image,bonus}, { rejectWithValue }) => {
    try {
      const response = await api.post('/recharge', { amount, type, utrNo, image,bonus}, {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);


export const RechargeSunPay = createAsyncThunk(
  "user/handleRecharge",
  async ( {amount, type}, { rejectWithValue }) => {
    try {
      const response = await api.post('/handleRecharge', { amount, type}, {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

export const WithdrawlHistory = createAsyncThunk(
  "user/withdraw-history",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/withdraw-history', {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);
export const usePromocode = createAsyncThunk(
  "user/usePromocode",
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.post('/usePromocode',{code:code}, {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);





// Initial state
const initialState = {
  withdraw: null,
  withdrawhistory: null,
  loading: false,
  error: null,
  singleadmin: null,
  useraddress: null,
  userDetail: null,
  message: null,
};

// User slice
const betSlice = createSlice({
  name: "bet",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user by ID
      .addCase(Withdrawl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(Withdrawl.fulfilled, (state, action) => {
        state.loading = false;
        state.withdraw = action.payload.data;
      })
      .addCase(Recharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(Recharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(Recharge.fulfilled, (state, action) => {
        state.loading = false;
        state.withdraw = action.payload.data;
      })
      
      .addCase(RechargeSunPay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(RechargeSunPay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(RechargeSunPay.fulfilled, (state, action) => {
        state.loading = false;
        state.withdraw = action.payload.data;
      })


      .addCase(Withdrawl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(WithdrawlHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(WithdrawlHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawhistory = action.payload.withdrawhistory;
      })
      .addCase(WithdrawlHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(usePromocode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(usePromocode.fulfilled, (state, action) => {
        state.loading = false;
          // state.withdrawhistory = action.payload.withdrawhistory;
      })
      .addCase(usePromocode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearError } = betSlice.actions;

export default betSlice.reducer;
