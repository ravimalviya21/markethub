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

export const CATEGORY_ENDPOINTS = {
    LIST: "/category",
    CREATE: "/category",
    UPDATE: (id: number | string) => `/category/${id}`,
    CHILDREN: (id: number | string) => `/category/${id}/children`,
};

export const PRODUCT_ENDPOINTS = {
    LIST: "/product",
    FEED: "/product/feed",
    CREATE: "/product",
    DETAIL: (id: number | string) => `/product/${id}`,
    UPDATE: (id: number | string) => `/product/${id}`,
    UPDATE_STATUS: (id: number | string) => `/product/${id}/status`,
};

export const CART_ENDPOINTS = {
    LIST: "/cart",
    ADD: "/cart",
    CLEAR: "/cart",
    ITEM: (productId: number | string) => `/cart/${productId}`,
};

export const USER_ENDPOINTS = {
    LIST: "/user",
    CREATE: "/user",
};

// React Query keys
export const QUERY_KEYS = {
    ME: ["auth", "me"],
    CATEGORIES: ["categories"],
    CATEGORY_CHILDREN: (id: number | string) => ["categories", "children", id],
    PRODUCTS: ["products"],
    PRODUCT_LIST: (params: unknown) => ["products", "list", params],
    PRODUCT_FEED: (params: unknown) => ["products", "feed", params],
    PRODUCT_DETAIL: (id: number | string) => ["products", "detail", id],
    CART: ["cart"],
    USERS: ["users"],
    USER_LIST: (params: unknown) => ["users", "list", params],
};
