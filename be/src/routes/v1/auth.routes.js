const route = require("express").Router();
const AuthController = require("../../controllers/auth.controller");
const validate = require("../../middleware/validate");
const passport = require("../../utils/passport");
const {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require("../../validations/auth.validation");

// login , register, forget password, resetPassord , refrsh token - public token
route.post("/signup", validate(registerSchema), AuthController.register);
route.get("/verify-email", AuthController.verifyEmail);
route.post("/login", validate(loginSchema), AuthController.login);
route.post("/refresh-token", validate(refreshTokenSchema), AuthController.refreshToken);
route.post("/forget-password", validate(forgotPasswordSchema), AuthController.forgetPassword);
route.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

// Google OAuth (stateless — no sessions)
route.get(
    "/google",
    passport.authenticate("google", {
        session: false,
        scope: ["profile", "email"],
    })
);
route.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: process.env.OAUTH_FAILURE_REDIRECT || "/api/v1/auth/google/failure",
    }),
    AuthController.findOrCreateWithGoogle
);

// protected routes
route.post("/logout", AuthController.logout);
route.get("/get-me", AuthController.getMe);

module.exports = route;
