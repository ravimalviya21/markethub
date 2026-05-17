const { AppError } = require("../utils/errors");
const UserModel = require("../models/user.model");
const hash = require("../utils/hash");
const tokenGen = require("../utils/tokens");
const TokenModel = require("../models/token.model");
const STATUS_CODES = require("../contants/statusCode");
const { Queue } = require('bullmq');
const redis = require('../config/redis');
const passport = require("../utils/passport");
require("dotenv").config();

const AuthService = {
    async register({ name, email, password, role }) {
        console.log(name, email, passport, role)
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

        return isExist;
    },
    async login({ email, password }) {
        const isExist = await UserModel.findByEmail(email);

        if (!isExist) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const isPasswordCorrect = await hash.verifyPassword(password, isExist.password);

        if (!isPasswordCorrect) throw new AppError("Invalid credentials", STATUS_CODES.BAD_REQUEST);

        const accessToken = await tokenGen.generateAccessToken({ id: isExist?.id, name: isExist?.name, email: isExist?.email, role: isExist?.role });
        const refreshToken = await tokenGen.generateRefreshToken({ id: isExist?.id, name: isExist?.name, email: isExist?.email, role: isExist?.role });
        const expiresAt = new Date(Date.now() + process.env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId: isExist?.id, expiresAt });

        return { refreshToken, accessToken };
    },
    async findOrCreateWithGoogle({ profile }) {
        const email = profile?.emails?.[0]?.value;
        if (!email) throw new AppError("Google account has no email", STATUS_CODES.BAD_REQUEST);

        let user = await UserModel.findByEmail(email);

        if (!user) {
            const randomPassword = require("crypto").randomBytes(32).toString("hex");
            const hashedPassword = await hash.hashPassword(randomPassword);
            const userId = await UserModel.create({
                email,
                name: profile.displayName || email.split("@")[0],
                hashedPassword,
            });
            await UserModel.markVerified(userId);
            user = await UserModel.findById(userId);
        } else if (!user.isEmailVerified) {
            await UserModel.markVerified(user.id);
        }

        const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
        const accessToken = await tokenGen.generateAccessToken(payload);
        const refreshToken = await tokenGen.generateRefreshToken(payload);
        const expiresAt = new Date(Date.now() + process.env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId: user.id, expiresAt });

        return { accessToken, refreshToken, user };
    },
    async rotateToken({ token }) {
        const isValid = await tokenGen.verifyToken(token);

        if (!isValid) throw new AppError("Unauthorized - token expired", STATUS_CODES.UNAUTHORIZED);

        const userToken = await TokenModel.find({ token, type: "refresh_token" });

        const user = await UserModel.findById(userToken?.user_id);

        const payload = { id: user.id, name: user.name, email: user.email, role: user.role };

        const accessToken = await tokenGen.generateAccessToken(payload);
        const refreshToken = await tokenGen.generateRefreshToken(payload);
        const expiresAt = new Date(Date.now() + process.env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId: user.id, expiresAt });

        return { accessToken, refreshToken };
    },

    // this will trigger an email
    async forgetPassword({ email }) {
        const isUserExist = await UserModel.findByEmail(email);
        if (!isUserExist) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const { id, name } = isUserExist;

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
            template: 'forget-password',
            data: {
                name,
                resetUrl: `${process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3003}`}/api/v1/auth/password-redirect?id=${id}`,
            },
        });
        return true
    },
    async redirectPassword({ id }) {
        const user = await UserModel.findById(id);
        if (!user) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const accessToken = await tokenGen.generateAccessToken(user);

        return { id: user?.id, accessToken }
    },
    async resetPassword({ password, id, token }) {
        const isValid = tokenGen.verifyToken(token);
        if (!isValid) throw new AppError("Unauthorized - token expired", STATUS_CODES.UNAUTHORIZED);

        const hashedPassword = await hash.hashPassword(password);
        const user = await UserModel.updatePassword({ hashedPassword, id });
        return true;
    },

    async logout() {

    }

}

module.exports = AuthService;
module.exports.passport = passport;