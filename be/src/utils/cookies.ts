import { CookieOptions, Response } from "express";

export const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = (): CookieOptions => {
    const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/api/v1/auth",
        maxAge: days * 24 * 60 * 60 * 1000,
    };
};

export const setRefreshCookie = (res: Response, token: string): void => {
    res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
};

export const clearRefreshCookie = (res: Response): void => {
    const { maxAge, ...opts } = refreshCookieOptions();
    res.clearCookie(REFRESH_COOKIE_NAME, opts);
};
