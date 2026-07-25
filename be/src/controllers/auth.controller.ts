import asyncHandler from "../utils/asyncHandler";
import AuthService from "../services/auth.service";
import STATUS_CODES from "../contants/statusCode";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE_NAME } from "../utils/cookies";
import { GoogleAuthPayload } from "../types/express";

const AuthController = {
    register: asyncHandler(async (req, res) => {
        const response = await AuthService.register(req.body);
        setAuthCookies(res, response.accessToken, response.refreshToken);
        res.status(STATUS_CODES.CREATED).json({
            success: true,
            data: {
                accessToken: response.accessToken,
            },
        });
    }),
    verifyEmail: asyncHandler(async (req, res) => {
        const response = await AuthService.verifyEmail({ token: req.query.token as string });
        // res.status(STATUS_CODES.OK).json({
        //     success: true,
        //     data: {
        //         message: "Email has been varified successfully"
        //     }
        // })
        res.redirect(`${process.env.CORS_ORIGIN}/auth/verify-email-sent?email=${response?.email}`);
    }),
    findOrCreateWithGoogle: asyncHandler(async (req, res) => {
        const profile = (req.user as GoogleAuthPayload | undefined)?.profile;
        const { accessToken, refreshToken } = await AuthService.findOrCreateWithGoogle({ profile });
        setAuthCookies(res, accessToken, refreshToken);

        const redirectUrl = process.env.CORS_ORIGIN;
        if (redirectUrl) {
            const url = new URL(redirectUrl);
            url.searchParams.set("accessToken", accessToken);
            return res.redirect(url.toString());
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: { accessToken },
        });
    }),
    login: asyncHandler(async (req, res) => {
        const response = await AuthService.login(req.body);
        setAuthCookies(res, response.accessToken, response.refreshToken);
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                accessToken: response.accessToken,
            },
        });
    }),
    refreshToken: asyncHandler(async (req, res) => {
        const token = req.cookies?.[REFRESH_COOKIE_NAME];
        const response = await AuthService.rotateToken({ token });
        setAuthCookies(res, response.accessToken, response.refreshToken);
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                accessToken: response.accessToken,
            },
        });
    }),
    forgetPassword: asyncHandler(async (req, res) => {
        await AuthService.forgetPassword({ email: req?.body?.email });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                message: "Reset passoword link sent",
            },
        });
    }),
    resetPassword: asyncHandler(async (req, res) => {
        await AuthService.resetPassword({
            id: req?.body?.id,
            password: req?.body?.password,
            token: req?.body?.token,
        });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                message: "Password update successfully! Please login again..",
            },
        });
    }),
    redirectPassword: asyncHandler(async (req, res) => {
        const response = await AuthService.redirectPassword({ id: req.query.id as string });
        res.redirect(`${process.env.CORS_ORIGIN}/auth/reset-password?id=${response?.id}&token=${response?.accessToken}`);
    }),
    logout: asyncHandler(async (req, res) => {
        const token = req.cookies?.[REFRESH_COOKIE_NAME];
        await AuthService.logout(token);
        clearAuthCookies(res);
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: { message: "Logged out" },
        });
    }),
    getMe: asyncHandler(async (req, res) => {}),
};

export default AuthController;
