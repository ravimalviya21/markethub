import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token || null;
};

export const getAccessToken = () => accessToken;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // send httpOnly refresh-token cookie
    headers: {
        "Content-Type": "application/json",
    },
});

// A bare client (no interceptors) used for the refresh call itself to avoid loops.
const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    pendingQueue = [];
};

// Endpoints that must NOT trigger a refresh attempt
const AUTH_BYPASS = ["/auth/login", "/auth/signup", "/auth/refresh-token", "/auth/forget-password", "/auth/reset-password"];

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;

        if (!originalRequest || status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (AUTH_BYPASS.some((p) => originalRequest.url?.includes(p))) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await refreshClient.post("/auth/refresh-token");
            const newToken = data?.data?.accessToken;
            if (!newToken) throw new Error("No access token in refresh response");

            setAccessToken(newToken);
            processQueue(null, newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            setAccessToken(null);

            if (typeof window !== "undefined") {
                // Optional: route user to login on hard refresh failure
                // window.location.href = "/auth/login";
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;
