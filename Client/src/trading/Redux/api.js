import axios from "axios";

const api = axios.create({
    baseURL: "/api/trade",
    withCredentials: true,
});

// ============================================================
// GET TOKEN FROM CURRENT marinclub.site LOCAL STORAGE
// ============================================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        console.log("========== API AUTH ==========");
        console.log("CURRENT HOST:", window.location.hostname);
        console.log(
            "MARINCLUB TOKEN:",
            token ? "FOUND" : "NOT FOUND"
        );

        if (token) {
            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

            console.log(
                "AUTHORIZATION HEADER: SET"
            );
        }

        console.log("==============================");

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const host = "/";

export default api;