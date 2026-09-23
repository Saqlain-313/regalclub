import axios from "axios";

// const API_BASE_URL = "http://localhost:9099/api";
const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    // ❌ Content-Type: application/json yahan mat lagao
    // Axios FormData ke liye khud multipart/form-data
    // + boundary set karega.

    Accept: "application/json",

    // NO CACHE
    "Cache-Control": "no-cache, no-store, must-revalidate",

    Pragma: "no-cache",

    Expires: "0",
  },
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    // =================================================
    // FORM DATA CHECK
    // =================================================

    const isFormData = config.data instanceof FormData;

    if (isFormData) {
      // IMPORTANT:
      // Browser/Axios ko Content-Type khud set karne do.
      // Isse multipart boundary properly generate hogi.

      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else {
      // Normal JSON requests
      if (config.data !== undefined) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    // =================================================
    // NO CACHE
    // =================================================

    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";

    config.headers.Pragma = "no-cache";

    config.headers.Expires = "0";

    // =================================================
    // UNIQUE REQUEST PARAM
    // =================================================

    config.params = {
      ...(config.params || {}),
      _t: Date.now(),
    };

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      const isProfileCheck = error.config?.url?.includes("/auth/profile");

      if (
        !isProfileCheck &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// =====================================================
// HOST
// =====================================================

const host = "https://demo22.etsblokchain.live/";

export { api, host };
