const asyncHandler = require("../utils/asyncHandler");
const AuthService = require("../services/auth.service");
const AuthController = {
    register: asyncHandler(async (req, res) => {
        const response = await AuthService.register(req);
        res.status(201).json({
            success: true,
            data: {
                refreshToken: response.refreshToken,
                accessToken: response.accessToken
            }
        })
    }),
    verifyEmail: asyncHandler(async (req, res) => {
        const response = await AuthService.verifyEmail({ id: req.query.id, token: req.query.token });
        res.status(200).json({
            success: true,
            data: {
                message: "Email has been varified successfully"
            }
        })
    }),
    login: asyncHandler(async (req, res) => {

    }),
    refreshToken: asyncHandler(async (req, res) => {

    }),
    forgetPassword: asyncHandler(async (req, res) => {

    }),
    resetPassword: asyncHandler(async (req, res) => {

    }),
    logout: asyncHandler(async (req, res) => {

    }),
    getMe: asyncHandler(async (req, res) => {

    })
}

module.exports = AuthController;