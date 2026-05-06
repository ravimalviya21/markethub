const AppError = require("../utils/errors");
const UserModel = require("../models/user.model");
const hash = require("../utils/hash");
const tokenGen = require("../utils/tokens");
const TokenModel = require("../models/token.model");
const { Queue } = require('bullmq');
const redis = require('../config/redis');
require("dotenv").config();

const AuthService = {
    async register({ name, email, password, role }) {
        const isExist = await UserModel.findByEmail(email);
        if (isExist) throw new AppError("User already exist", 409);

        const hashedPassword = await hash.hashPassword(password);

        const userId = await UserModel.create({
            name,
            email,
            hashedPassword,
        })

        const accessToken = await tokenGen.generateAccessToken({ name, email, role });
        const refreshToken = await tokenGen.generateRefreshToken({ name, email, role });
        const expiresAt = new Date(Date.now() + process.env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

        // proccess job queue
        const emailQueue = new Queue('email', {
            connection: {
                host: redis.options.host,
                port: redis.options.port,
            },
        });

        await emailQueue.add('send-email', {
            to: email,
            template: 'email-verification',
            data: {
                name,
                verificationUrl: `http://localhost:3000/api/v1/auth/verify-email?id=${userId}&token=${accessToken}`,
            },
        });


        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId, expiresAt });

        return { refreshToken, accessToken };
    },
    async verifyEmail({ id, token }) {
        const isExist = await UserModel.findById(id);
        if (!isExist) throw new AppError("User not exist", 404);

        const isTokenVerified = await tokenGen.verifyToken(token);

        if (!isTokenVerified) throw new AppError("Unauthorized - token expired", 401)

        await UserModel.markVerified(id);

        return true;
    },
    async login() {

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