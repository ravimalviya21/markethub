// master v1 route

const route = require("express").Router();
const AuthRoutes = require("./auth.routes");

route.use("/v1/auth", AuthRoutes);