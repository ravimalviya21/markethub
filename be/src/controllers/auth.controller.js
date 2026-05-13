const asyncHandler = require("../utils/asyncHandler");
const AuthService = require("../services/auth.service");
const STATUS_CODES = require("../contants/statusCode");
const { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } = require("../utils/cookies");
const UserModel = require("../models/user.model");
const hash = require("../utils/hash");

const AuthController = {
    register: asyncHandler(async (req, res) => {
        const response = await AuthService.register(req.body);
        setRefreshCookie(res, response.refreshToken);
        res.status(STATUS_CODES.CREATED).json({
            success: true,
            data: {
                accessToken: response.accessToken
            }
        })
    }),
    verifyEmail: asyncHandler(async (req, res) => {
        const response = await AuthService.verifyEmail({ id: req.query.id, token: req.query.token });
        // res.status(STATUS_CODES.OK).json({
        //     success: true,
        //     data: {
        //         message: "Email has been varified successfully"
        //     }
        // })
        res.redirect(`${process.env.CORS_ORIGIN}/auth/verify-email-sent?email=${response?.email}`)
    }),
    findOrCreateWithGoogle: asyncHandler(async (req, res) => {
        const profile = req.user?.profile;
        const { accessToken, refreshToken } = await AuthService.findOrCreateWithGoogle({ profile });
        setRefreshCookie(res, refreshToken);

        const redirectUrl = process.env.OAUTH_SUCCESS_REDIRECT;
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
        setRefreshCookie(res, response.refreshToken);
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                accessToken: response.accessToken
            }
        })

    }),
    refreshToken: asyncHandler(async (req, res) => {
        const token = req.cookies?.[REFRESH_COOKIE_NAME];
        const response = await AuthService.refreshToken({ refreshToken: token });
        setRefreshCookie(res, response.refreshToken);
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                accessToken: response.accessToken
            }
        });
    }),
    forgetPassword: asyncHandler(async (req, res) => {
        const response = await AuthService.forgetPassword({ email: req?.body?.email });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                message: "Reset passoword link sent"
            }
        })
    }),
    resetPassword: asyncHandler(async (req, res) => {
        const response = await AuthService.resetPassword({ id: req.cookies?.['id'], password: req?.body?.password });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                message: "Password update successfully! Please login again.."
            }
        })
    }),
    logout: asyncHandler(async (req, res) => {
        const token = req.cookies?.[REFRESH_COOKIE_NAME];
        await AuthService.logout({ refreshToken: token });
        clearRefreshCookie(res);
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: { message: "Logged out" }
        });
    }),
    getMe: asyncHandler(async (req, res) => {

    })
}

module.exports = AuthController;