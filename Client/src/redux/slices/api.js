// api.js
import axios from "axios";

// const API_BASE_URL = "http://localhost:9099/api";
const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,

  withCredentials: true,

  headers: {
    // ❌ Content-Type yahan mat lagao
    // Axios FormData ke liye automatically
    // multipart/form-data + boundary set karega.

    // ✅ NO CACHE
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
    // FORM DATA REQUEST
    // =================================================

    if (config.data instanceof FormData) {
      // IMPORTANT:
      // JSON Content-Type remove karo.
      // Browser/Axios khud multipart boundary lagayega.

      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else {
      // Normal JSON requests ke liye
      // Content-Type set karo.
      if (config.headers) {
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
    // UNIQUE REQUEST
    // =================================================

    config.params = {
      ...(config.params || {}),
      _t: Date.now(),
    };

    return config;
  },

  (error) => Promise.reject(error),
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      // Ignore guest profile checks

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

// const host = "http://localhost:9099";
const host = "/";

export { api, host };
