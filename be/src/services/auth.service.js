const { AppError } = require("../utils/errors");
const UserModel = require("../models/user.model");
const hash = require("../utils/hash");
const tokenGen = require("../utils/tokens");
const TokenModel = require("../models/token.model");
const STATUS_CODES = require("../contants/statusCode");
const { Queue } = require('bullmq');
const redis = require('../config/redis');
require("dotenv").config();

const AuthService = {
    async register({ name, email, password, role }) {
        const isExist = await UserModel.findByEmail(email);
        if (isExist) throw new AppError("User already exist", STATUS_CODES.CONFLICT);

        const hashedPassword = await hash.hashPassword(password);

        const userId = await UserModel.create({
            name,
            email,
            hashedPassword,
        })

        const accessToken = await tokenGen.generateAccessToken({ id: userId, name, email, role });
        const refreshToken = await tokenGen.generateRefreshToken({ id: userId, name, email, role });
        const expiresAt = new Date(Date.now() + process.env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

        // proccess job queue
        const emailQueue = new Queue('email', {
            connection: {
                host: redis.options.host,
                port: redis.options.port,
                password: redis.options.password,
            },
        });

        await emailQueue.add('send-email', {
            to: email,
            template: 'email-verification',
            data: {
                name,
                verificationUrl: `${process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3003}`}/api/v1/auth/verify-email?id=${userId}&token=${accessToken}`,
            },
        });


        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId, expiresAt });

        return { refreshToken, accessToken };
    },
    async verifyEmail({ id, token }) {
        const isExist = await UserModel.findById(id);
        if (!isExist) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const isTokenVerified = await tokenGen.verifyToken(token);

        if (!isTokenVerified) throw new AppError("Unauthorized - token expired", STATUS_CODES.UNAUTHORIZED)

        await UserModel.markVerified(id);

        return true;
    },
    async login({ email, password }) {
        const isExist = await UserModel.findByEmail(email);

        if (!isExist) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const isPasswordCorrect = await hash.verifyPassword(password, isExist.password);


        const accessToken = await tokenGen.generateAccessToken({ id: isExist?.id, name: isExist?.name, email: isExist?.email, role: isExist?.role });
        const refreshToken = await tokenGen.generateRefreshToken({ id: isExist?.id, name: isExist?.name, email: isExist?.email, role: isExist?.role });
        const expiresAt = new Date(Date.now() + process.env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId: isExist?.id, expiresAt });

        return { refreshToken, accessToken };
    },

    async refreshToken() {

    },

    // this will trigger an email
    async forgetPassword() {

    },
    async resetPassword() {

    },

    async logout() {

    }

}

module.exports = AuthService;