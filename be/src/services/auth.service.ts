import { Queue } from "bullmq";
import crypto from "crypto";
import { Profile } from "passport-google-oauth20";
import { AppError } from "../utils/errors";
import UserModel from "../models/user.model";
import hash from "../utils/hash";
import * as tokenGen from "../utils/tokens";
import TokenModel from "../models/token.model";
import STATUS_CODES from "../contants/statusCode";
import redis from "../config/redis";
import passport from "../utils/passport";
import { UserRole } from "../types/models";
import dotenv from "dotenv";
dotenv.config();

const refreshTokenExpiresAt = (): Date =>
    new Date(Date.now() + Number(process.env.REFRESH_TOKEN_DAYS || 7) * 24 * 60 * 60 * 1000);

const emailQueueConnection = () => ({
    connection: {
        host: redis.options.host,
        port: redis.options.port,
        password: redis.options.password,
    },
});

interface RegisterInput {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

interface LoginInput {
    email: string;
    password: string;
}

const AuthService = {
    async register({ name, email, password, role }: RegisterInput) {
        console.log(name, email, passport, role);
        const isExist = await UserModel.findByEmail(email);
        if (isExist) throw new AppError("User already exist", STATUS_CODES.CONFLICT);

        const hashedPassword = await hash.hashPassword(password);

        const userId = await UserModel.create({
            name,
            email,
            hashedPassword,
        });

        const accessToken = tokenGen.generateAccessToken({ id: userId, name, email, role });
        const refreshToken = tokenGen.generateRefreshToken({ id: userId, name, email, role });
        const expiresAt = refreshTokenExpiresAt();

        // proccess job queue
        const emailQueue = new Queue("email", emailQueueConnection());

        await emailQueue.add("send-email", {
            to: email,
            template: "email-verification",
            data: {
                name,
                verificationUrl: `${process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3003}`}/api/v1/auth/verify-email?id=${userId}&token=${accessToken}`,
            },
        });

        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId, expiresAt });

        return { refreshToken, accessToken };
    },
    async verifyEmail({ token }: { token: string }) {
        const isTokenVerified = tokenGen.verifyToken(token);

        if (!isTokenVerified) throw new AppError("Unauthorized - token expired", STATUS_CODES.UNAUTHORIZED);

        const decoded = tokenGen.decodeToken(token);
        const { id } = decoded as { id: number };

        const isExist = await UserModel.findById(id);
        if (!isExist) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        await UserModel.markVerified(id);

        return isExist;
    },
    async login({ email, password }: LoginInput) {
        const isExist = await UserModel.findByEmail(email);

        if (!isExist) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const isPasswordCorrect = await hash.verifyPassword(password, isExist.password);

        if (!isPasswordCorrect) throw new AppError("Invalid credentials", STATUS_CODES.BAD_REQUEST);

        const accessToken = tokenGen.generateAccessToken({
            id: isExist.id,
            name: isExist.name,
            email: isExist.email,
            role: isExist.role,
        });
        const refreshToken = tokenGen.generateRefreshToken({
            id: isExist.id,
            name: isExist.name,
            email: isExist.email,
            role: isExist.role,
        });
        const expiresAt = refreshTokenExpiresAt();

        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId: isExist.id, expiresAt });

        return { refreshToken, accessToken };
    },
    async findOrCreateWithGoogle({ profile }: { profile?: Profile }) {
        const email = profile?.emails?.[0]?.value;
        if (!email) throw new AppError("Google account has no email", STATUS_CODES.BAD_REQUEST);

        let user = await UserModel.findByEmail(email);

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString("hex");
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

        if (!user) throw new AppError("Unable to create user", STATUS_CODES.BAD_REQUEST);

        const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
        const accessToken = tokenGen.generateAccessToken(payload);
        const refreshToken = tokenGen.generateRefreshToken(payload);
        const expiresAt = refreshTokenExpiresAt();

        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId: user.id, expiresAt });

        return { accessToken, refreshToken, user };
    },
    async rotateToken({ token }: { token?: string }) {
        if (!token) throw new AppError("Unauthorized - token expired", STATUS_CODES.UNAUTHORIZED);

        const isValid = tokenGen.verifyToken(token);

        if (!isValid) throw new AppError("Unauthorized - token expired", STATUS_CODES.UNAUTHORIZED);

        const userToken = await TokenModel.find({ token, type: "refresh_token" });

        const user = await UserModel.findById(userToken?.user_id as number);
        if (!user) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const payload = { id: user.id, name: user.name, email: user.email, role: user.role };

        const accessToken = tokenGen.generateAccessToken(payload);
        const refreshToken = tokenGen.generateRefreshToken(payload);
        const expiresAt = refreshTokenExpiresAt();

        await TokenModel.markUsed(token);
        await TokenModel.save({ token: refreshToken, type: "refresh_token", userId: user.id, expiresAt });

        return { accessToken, refreshToken };
    },

    // this will trigger an email
    async forgetPassword({ email }: { email: string }) {
        const isUserExist = await UserModel.findByEmail(email);
        if (!isUserExist) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const { id, name } = isUserExist;

        // proccess job queue
        const emailQueue = new Queue("email", emailQueueConnection());

        await emailQueue.add("send-email", {
            to: email,
            template: "forget-password",
            data: {
                name,
                resetUrl: `${process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3003}`}/api/v1/auth/password-redirect?id=${id}`,
            },
        });
        return true;
    },
    async redirectPassword({ id }: { id: number | string }) {
        const user = await UserModel.findById(id);
        if (!user) throw new AppError("User not exist", STATUS_CODES.NOT_FOUND);

        const accessToken = tokenGen.generateAccessToken(user);

        return { id: user.id, accessToken };
    },
    async resetPassword({ password, id, token }: { password: string; id: number | string; token: string }) {
        const isValid = tokenGen.verifyToken(token);
        if (!isValid) throw new AppError("Unauthorized - token expired", STATUS_CODES.UNAUTHORIZED);

        const hashedPassword = await hash.hashPassword(password);
        await UserModel.updatePassword({ hashedPassword, id });
        return true;
    },

    async logout(refreshToken?: string) {},
};

export default AuthService;
export { passport };
