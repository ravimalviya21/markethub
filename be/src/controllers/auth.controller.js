const asyncHandler = require("../utils/asyncHandler");
const AuthService = require("../services/auth.service");
const STATUS_CODES = require("../contants/statusCode");
const { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } = require("../utils/cookies");

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
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                message: "Email has been varified successfully"
            }
        })
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

    }),
    resetPassword: asyncHandler(async (req, res) => {

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