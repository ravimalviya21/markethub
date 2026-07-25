import { CookieOptions, Response } from "express";

export const REFRESH_COOKIE_NAME = "refreshToken";
export const ACCESS_COOKIE_NAME = "accessToken";

const baseCookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // Root path so the Next.js proxy can read these on page navigations,
    // and so they survive the /api/proxy/* rewrite prefix.
    path: "/",
});

const refreshCookieOptions = (): CookieOptions => {
    const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
    return {
        ...baseCookieOptions(),
        maxAge: days * 24 * 60 * 60 * 1000,
    };
};

// Mirrors the access token's own `expiresIn` in utils/tokens.ts — keep them in sync.
const accessCookieOptions = (): CookieOptions => {
    const minutes = Number(process.env.ACCESS_TOKEN_MINUTES || 15);
    return {
        ...baseCookieOptions(),
        maxAge: minutes * 60 * 1000,
    };
};

export const setRefreshCookie = (res: Response, token: string): void => {
    res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
};

export const setAccessCookie = (res: Response, token: string): void => {
    res.cookie(ACCESS_COOKIE_NAME, token, accessCookieOptions());
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);
};

export const clearRefreshCookie = (res: Response): void => {
    const { maxAge, ...opts } = refreshCookieOptions();
    res.clearCookie(REFRESH_COOKIE_NAME, opts);
};

export const clearAccessCookie = (res: Response): void => {
    const { maxAge, ...opts } = accessCookieOptions();
    res.clearCookie(ACCESS_COOKIE_NAME, opts);
};

export const clearAuthCookies = (res: Response): void => {
    clearAccessCookie(res);
    clearRefreshCookie(res);
};
