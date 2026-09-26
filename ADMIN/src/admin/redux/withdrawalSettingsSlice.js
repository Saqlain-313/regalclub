
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";


// ====================== CREATE ======================

export const createWithdrawalSettings = createAsyncThunk(
    "withdrawalSettings/create",
    async (data, thunkAPI) => {
        try {
            const res = await api.post("/withdrawal-settings", data);
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== GET ALL ======================

export const getAllWithdrawalSettings = createAsyncThunk(
    "withdrawalSettings/getAll",
    async (params = {}, thunkAPI) => {
        try {
            const res = await api.get("/withdrawal-settings", { params });
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== GET BY ID ======================

export const getWithdrawalSettingsById = createAsyncThunk(
    "withdrawalSettings/getById",
    async (id, thunkAPI) => {
        try {
            const res = await api.get(`/withdrawal-settings/${id}`);
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== GET BY COUNTRY ======================

export const getWithdrawalSettingsByCountry = createAsyncThunk(
    "withdrawalSettings/getByCountry",
    async (country, thunkAPI) => {
        try {
            const res = await api.get(
                `/withdrawal-settings/country/${country}`
            );
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== UPDATE ======================

export const updateWithdrawalSettings = createAsyncThunk(
    "withdrawalSettings/update",
    async ({ id, data }, thunkAPI) => {
        try {
            const res = await api.put(
                `/withdrawal-settings/${id}`,
                data
            );
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== PATCH ======================

export const partialUpdateWithdrawalSettings = createAsyncThunk(
    "withdrawalSettings/patch",
    async ({ id, data }, thunkAPI) => {
        try {
            const res = await api.patch(
                `/withdrawal-settings/${id}`,
                data
            );
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== DELETE ======================

export const deleteWithdrawalSettings = createAsyncThunk(
    "withdrawalSettings/delete",
    async (id, thunkAPI) => {
        try {
            const res = await api.delete(`/withdrawal-settings/${id}`);
            return {
                ...res.data,
                id,
            };
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== TOGGLE ======================

export const toggleWithdrawalSettingsStatus = createAsyncThunk(
    "withdrawalSettings/toggle",
    async (id, thunkAPI) => {
        try {
            const res = await api.patch(
                `/withdrawal-settings/${id}/toggle-status`
            );
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== CALCULATE FEE ======================

export const calculateFee = createAsyncThunk(
    "withdrawalSettings/calculateFee",
    async ({ id, amount }, thunkAPI) => {
        try {
            const res = await api.post(
                `/withdrawal-settings/${id}/calculate-fee`,
                { amount }
            );
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== VALIDATE ======================

export const validateWithdrawal = createAsyncThunk(
    "withdrawalSettings/validate",
    async ({ id, amount, userData }, thunkAPI) => {
        try {
            const res = await api.post(
                `/withdrawal-settings/${id}/validate`,
                {
                    amount,
                    userData,
                }
            );
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== BULK CREATE ======================

export const bulkCreateWithdrawalSettings = createAsyncThunk(
    "withdrawalSettings/bulkCreate",
    async (settingsList, thunkAPI) => {
        try {
            const res = await api.post(
                "/withdrawal-settings/bulk",
                {
                    settingsList,
                }
            );
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || { message: err.message }
            );
        }
    }
);

// ====================== SLICE ======================

const withdrawalSettingsSlice = createSlice({
    name: "withdrawalSettings",

    initialState: {
        settings: [],
        setting: null,
        fee: null,
        validation: null,
        pagination: null,

        loading: false,
        error: null,
        success: false,
        message: "",
    },

    reducers: {
        resetWithdrawalSettingsState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = "";
            state.fee = null;
            state.validation = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // ================= CASES =================

            .addCase(getAllWithdrawalSettings.fulfilled, (state, action) => {
                state.settings = action.payload.data;
                state.pagination = action.payload.pagination;
            })

            .addCase(getWithdrawalSettingsById.fulfilled, (state, action) => {
                state.setting = action.payload.data;
            })

            .addCase(getWithdrawalSettingsByCountry.fulfilled, (state, action) => {
                state.setting = action.payload.data;
            })

            .addCase(createWithdrawalSettings.fulfilled, (state, action) => {
                state.settings.unshift(action.payload.data);
                state.message = action.payload.message;
            })

            .addCase(updateWithdrawalSettings.fulfilled, (state, action) => {
                state.setting = action.payload.data;

                state.settings = state.settings.map((item) =>
                    item._id === action.payload.data._id ? action.payload.data : item
                );

                state.message = action.payload.message;
            })

            .addCase(partialUpdateWithdrawalSettings.fulfilled, (state, action) => {
                state.setting = action.payload.data;

                state.settings = state.settings.map((item) =>
                    item._id === action.payload.data._id ? action.payload.data : item
                );

                state.message = action.payload.message;
            })

            .addCase(deleteWithdrawalSettings.fulfilled, (state, action) => {
                state.settings = state.settings.filter(
                    (item) => item._id !== action.payload.id
                );

                state.message = action.payload.message;
            })

            .addCase(toggleWithdrawalSettingsStatus.fulfilled, (state, action) => {
                state.setting = action.payload.data;

                state.settings = state.settings.map((item) =>
                    item._id === action.payload.data._id ? action.payload.data : item
                );

                state.message = action.payload.message;
            })

            .addCase(calculateFee.fulfilled, (state, action) => {
                state.fee = action.payload.data;
            })

            .addCase(validateWithdrawal.fulfilled, (state, action) => {
                state.validation = action.payload.data;
            })

            .addCase(bulkCreateWithdrawalSettings.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })

            // ================= MATCHERS =================

            .addMatcher(
                (action) =>
                    action.type.startsWith("withdrawalSettings/") &&
                    action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.success = false;
                }
            )

            .addMatcher(
                (action) =>
                    action.type.startsWith("withdrawalSettings/") &&
                    action.type.endsWith("/fulfilled"),
                (state) => {
                    state.loading = false;
                    state.success = true;
                }
            )

            .addMatcher(
                (action) =>
                    action.type.startsWith("withdrawalSettings/") &&
                    action.type.endsWith("/rejected"),
                (state, action) => {
                    state.loading = false;
                    state.error =
                        action.payload?.message || action.error.message;
                }
            );
    }
});

export const { resetWithdrawalSettingsState } =
    withdrawalSettingsSlice.actions;

export default withdrawalSettingsSlice.reducer;