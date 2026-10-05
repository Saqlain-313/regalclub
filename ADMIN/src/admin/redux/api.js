import axios from "axios";

// const API_BASE_URL = "http://localhost:9099/api";
const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    // Do not set Content-Type here. Axios sets multipart/form-data
    // with the proper boundary for FormData requests automatically.

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

// =====================================================
// ADMIN AUTH HEADER
// Send the admin token as an Authorization header. Cookies are
// shared across localhost ports, so the admin panel must
// authenticate via the header - otherwise a stale adminToken
// cookie could hijack client-site requests (and vice versa).
// =====================================================

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = 'Bearer ' + adminToken;
  }
  return config;
});

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
      const isProfileCheck =
      error.config?.url?.includes("/auth/profile") ||
      error.config?.url?.includes("/auth/admin/profile");

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
