import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { api } from "../api";

const COUNTRY = "india";

// ======================================================
// GET GAME COUNTS
// ======================================================
export const getGameCounts = createAsyncThunk(
  "indiaGameCount/getGameCounts",

  async (payload = {}, thunkAPI) => {
    try {
      // =================================================
      // SUPPORT ALL THESE:
      //
      // dispatch(getGameCounts())
      //
      // dispatch(getGameCounts("standard"))
      //
      // dispatch(
      //   getGameCounts({
      //     ticketType: "standard"
      //   })
      // )
      //
      // dispatch(
      //   getGameCounts({
      //     ticketid: "665..."
      //   })
      // )
      // =================================================

      let ticketType = "";

      if (typeof payload === "string") {
        ticketType = payload.trim();
      } else if (payload && typeof payload === "object") {
        ticketType =
          payload.ticketType ??
          payload.ticketid ??
          payload.ticketId ??
          payload.ticket_type ??
          "";
      }

      // =================================================
      // CLEAN VALUE
      // =================================================
      ticketType =
        typeof ticketType === "string"
          ? ticketType.trim()
          : ticketType
            ? String(ticketType).trim()
            : "";

      // =================================================
      // QUERY PARAMS
      // =================================================
      const params = {};

      if (ticketType) {
        params.ticketType = ticketType;
      }

      console.log(
        "================================="
      );
      console.log(
        "GAME COUNT API REQUEST"
      );
      console.log(
        "COUNTRY:",
        COUNTRY
      );
      console.log(
        "TICKET TYPE:",
        ticketType || "ALL"
      );
      console.log(
        "QUERY PARAMS:",
        params
      );
      console.log(
        "================================="
      );

      // =================================================
      // API
      // =================================================
      const response = await api.get(
        `/${COUNTRY}/game-counts`,
        {
          params,
        }
      );

      const data = response?.data;

      console.log(
        "GAME COUNT API RESPONSE:",
        data
      );

      // =================================================
      // SAFE RESPONSE
      // =================================================
      let gameCounts = [];

      if (Array.isArray(data)) {
        gameCounts = data;
      } else if (
        Array.isArray(data?.data)
      ) {
        gameCounts = data.data;
      } else if (
        Array.isArray(data?.gameCounts)
      ) {
        gameCounts = data.gameCounts;
      } else if (
        Array.isArray(
          data?.data?.gameCounts
        )
      ) {
        gameCounts =
          data.data.gameCounts;
      }

      return {
        data: gameCounts,
        count: gameCounts.length,
        ticketType:
          ticketType || null,
      };
    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "GET GAME COUNTS ERROR"
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "RESPONSE:",
        error?.response?.data
      );

      console.error(
        "MESSAGE:",
        error?.message
      );

      console.error(
        "================================="
      );

      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch game counts"
      );
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  loading: false,

  gameCounts: [],

  count: 0,

  selectedTicketType: null,

  error: null,

  success: false,
};

// ======================================================
// SLICE
// ======================================================
const indiaGameCountSlice =
  createSlice({
    name: "indiaGameCount",

    initialState,

    reducers: {
      // -----------------------------------------------
      // CLEAR ERROR
      // -----------------------------------------------
      clearGameCountError: (
        state
      ) => {
        state.error = null;
      },

      // -----------------------------------------------
      // CLEAR DATA
      // -----------------------------------------------
      clearGameCounts: (
        state
      ) => {
        state.gameCounts = [];
        state.count = 0;
        state.error = null;
      },

      // -----------------------------------------------
      // RESET
      // -----------------------------------------------
      resetGameCountState: (
        state
      ) => {
        state.loading = false;
        state.gameCounts = [];
        state.count = 0;
        state.selectedTicketType =
          null;
        state.error = null;
        state.success = false;
      },
    },

    extraReducers: (
      builder
    ) => {
      builder

        // ============================================
        // PENDING
        // ============================================
        .addCase(
          getGameCounts.pending,
          (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
          }
        )

        // ============================================
        // SUCCESS
        // ============================================
        .addCase(
          getGameCounts.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;
            state.success = true;

            const payload =
              action.payload || {};

            state.gameCounts =
              Array.isArray(
                payload.data
              )
                ? payload.data
                : [];

            state.count =
              state.gameCounts.length;

            state.selectedTicketType =
              payload.ticketType ||
              null;

            state.error = null;
          }
        )

        // ============================================
        // ERROR
        // ============================================
        .addCase(
          getGameCounts.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;
            state.success = false;

            state.error =
              action.payload ||
              "Failed to fetch game counts";

            // IMPORTANT:
            // Old data ko unnecessarily destroy
            // nahi karenge.
          }
        );
    },
  });

// ======================================================
// ACTIONS
// ======================================================
export const {
  clearGameCountError,
  clearGameCounts,
  resetGameCountState,
} =
  indiaGameCountSlice.actions;

// ======================================================
// SELECTORS
// ======================================================
export const selectGameCounts =
  (state) =>
    state?.indiaGameCount
      ?.gameCounts || [];

export const selectGameCount =
  (state) =>
    state?.indiaGameCount
      ?.count || 0;

export const selectGameCountLoading =
  (state) =>
    state?.indiaGameCount
      ?.loading || false;

export const selectGameCountError =
  (state) =>
    state?.indiaGameCount
      ?.error || null;

export const selectGameCountSuccess =
  (state) =>
    state?.indiaGameCount
      ?.success || false;

export const selectSelectedTicketType =
  (state) =>
    state?.indiaGameCount
      ?.selectedTicketType || null;

// ======================================================
// EXPORT
// ======================================================
export default
  indiaGameCountSlice.reducer;