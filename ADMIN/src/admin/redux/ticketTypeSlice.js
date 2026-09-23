// src/redux/slices/ticketTypeSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {api} from "./api";

// =======================
// CREATE
// =======================

export const createTicketType = createAsyncThunk(
  "ticketType/create",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/admin/ticket-types", data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =======================
// GET ALL
// =======================

export const getTicketTypes = createAsyncThunk(
  "ticketType/getAll",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/admin/ticket-types");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =======================
// GET SINGLE
// =======================

export const getTicketType = createAsyncThunk(
  "ticketType/getOne",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/admin/ticket-types/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =======================
// UPDATE
// =======================

export const updateTicketType = createAsyncThunk(
  "ticketType/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.put(`/admin/ticket-types/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =======================
// DELETE
// =======================

export const deleteTicketType = createAsyncThunk(
  "ticketType/delete",
  async (id, thunkAPI) => {
    try {
      const res = await api.delete(`/admin/ticket-types/${id}`);
      return { ...res.data, id };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const initialState = {
  ticketTypes: [],
  ticketType: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

const ticketTypeSlice = createSlice({
  name: "ticketType",
  initialState,

  reducers: {
    resetTicketTypeState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder

      // Create
      .addCase(createTicketType.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTicketType.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.ticketTypes.push(action.payload.ticketType);
      })
      .addCase(createTicketType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All
      .addCase(getTicketTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTicketTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.ticketTypes = action.payload.ticketTypes;
      })
      .addCase(getTicketTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get One
      .addCase(getTicketType.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTicketType.fulfilled, (state, action) => {
        state.loading = false;
        state.ticketType = action.payload.ticketType;
      })
      .addCase(getTicketType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateTicketType.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTicketType.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;

        state.ticketTypes = state.ticketTypes.map((item) =>
          item._id === action.payload.ticketType._id
            ? action.payload.ticketType
            : item
        );

        state.ticketType = action.payload.ticketType;
      })
      .addCase(updateTicketType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteTicketType.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTicketType.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;

        state.ticketTypes = state.ticketTypes.filter(
          (item) => item._id !== action.payload.id
        );
      })
      .addCase(deleteTicketType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetTicketTypeState } = ticketTypeSlice.actions;

export default ticketTypeSlice.reducer;