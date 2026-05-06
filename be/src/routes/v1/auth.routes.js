const route = require("express").Router();
const AuthController = require("../../controllers/auth.controller");

// login , register, forget password, resetPassord , refrsh token - public token
route.post("/signup", AuthController.register);
route.post("/login", AuthController.login);
route.post("/forget-password", AuthController.forgetPassword);
route.post("/reset-password", AuthController.resetPassword);

// protected routes
route.post("/logout", AuthController.logout);
route.get("/get-me", AuthController.getMe);

module.exports = route;
