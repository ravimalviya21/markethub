// API endpoint constants
export const AUTH_ENDPOINTS = {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forget-password",
    RESET_PASSWORD: "/auth/reset-password",
    GET_ME: "/auth/get-me",
    GOOGLE: "/auth/google",
    GOOGLE_CALLBACK: "/auth/google/callback",
};

// React Query keys
export const QUERY_KEYS = {
    ME: ["auth", "me"],
};
