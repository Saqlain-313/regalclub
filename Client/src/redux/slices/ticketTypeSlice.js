import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {api} from "./api";

// ================= GET USER TICKET TYPES =================
export const getUserTicketTypes = createAsyncThunk(
  "ticketType/getUserTicketTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/ticket-types");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch ticket types"
      );
    }
  }
);

const initialState = {
  ticketTypes: [],
  loading: false,
  error: null,
};

const ticketTypeSlice = createSlice({
  name: "ticketType",
  initialState,
  reducers: {
    clearTicketTypeError: (state) => {
      state.error = null;
    },

    clearTicketTypes: (state) => {
      state.ticketTypes = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // GET
      .addCase(getUserTicketTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getUserTicketTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.ticketTypes = action.payload;
      })

      .addCase(getUserTicketTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ================= SELECTORS =================
export const selectAllTicketTypes = (state) =>
  state.ticketType.ticketTypes;

export const selectTicketTypesLoading = (state) =>
  state.ticketType.loading;

export const selectTicketTypesError = (state) =>
  state.ticketType.error;

// ================= ACTIONS =================
export const {
  clearTicketTypeError,
  clearTicketTypes,
} = ticketTypeSlice.actions;

// ================= REDUCER =================
export default ticketTypeSlice.reducer;