import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api/proxy";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface PendingRequest {
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
}

let accessToken: string | null = null;

type TokenListener = (token: string | null) => void;
const tokenListeners = new Set<TokenListener>();

export const setAccessToken = (token: string | null) => {
    accessToken = token || null;
    tokenListeners.forEach((listener) => listener(accessToken));
};

export const subscribeToAccessToken = (listener: TokenListener) => {
    tokenListeners.add(listener);
    return () => {
        tokenListeners.delete(listener);
    };
};

export const getAccessToken = () => accessToken;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

let bootstrapPromise: Promise<string | null> | null = null;

const runRefresh = async (): Promise<string | null> => {
    try {
        const { data } = await refreshClient.post("/auth/refresh-token");
        setAccessToken(data?.data?.accessToken ?? null);
    } catch {
        setAccessToken(null);
    }
    return accessToken;
};

export const bootstrapAuth = (): Promise<string | null> => {
    if (!bootstrapPromise) bootstrapPromise = runRefresh();
    return bootstrapPromise;
};

export const resetAuthBootstrap = () => {
    bootstrapPromise = null;
};

axiosInstance.interceptors.request.use(
    async (config) => {
        if (typeof window !== "undefined" && bootstrapPromise) await bootstrapPromise;

        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    pendingQueue = [];
};

const AUTH_BYPASS = ["/auth/login", "/auth/signup", "/auth/refresh-token", "/auth/forget-password", "/auth/reset-password"];

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
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
            resetAuthBootstrap();
            const newToken = await bootstrapAuth();
            if (!newToken) throw new Error("No access token in refresh response");

            processQueue(null, newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            setAccessToken(null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

if (typeof window !== "undefined") bootstrapAuth();

export default axiosInstance;
