import { Router } from "express";
import AuthController from "../../controllers/auth.controller";
import validate from "../../middleware/validate";
import passport from "../../utils/passport";
import authenticate from "../../middleware/auth";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../../validations/auth.validation";

const route = Router();

// login , register, forget password, resetPassord , refrsh token - public token
route.post("/signup", validate(registerSchema), AuthController.register);
route.get("/verify-email", AuthController.verifyEmail);
route.post("/login", validate(loginSchema), AuthController.login);
route.post("/refresh-token", AuthController.refreshToken);
route.post("/forget-password", validate(forgotPasswordSchema), AuthController.forgetPassword);
route.get("/password-redirect", AuthController.redirectPassword);
route.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

route.get("/google", passport.authenticate("google", { session: false, scope: ["profile", "email"] }));
route.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: process.env.OAUTH_FAILURE_REDIRECT || "/api/v1/auth/google/failure",
    }),
    AuthController.findOrCreateWithGoogle
);

// protected routes
route.post("/logout", authenticate, AuthController.logout);
route.get("/get-me", authenticate, AuthController.getMe);

export default route;
