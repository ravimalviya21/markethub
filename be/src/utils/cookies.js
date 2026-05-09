const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = () => {
    const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/api/v1/auth",
        maxAge: days * 24 * 60 * 60 * 1000,
    };
};

const setRefreshCookie = (res, token) => {
    res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
};

const clearRefreshCookie = (res) => {
    const { maxAge, ...opts } = refreshCookieOptions();
    res.clearCookie(REFRESH_COOKIE_NAME, opts);
};

module.exports = {
    REFRESH_COOKIE_NAME,
    setRefreshCookie,
    clearRefreshCookie,
};
