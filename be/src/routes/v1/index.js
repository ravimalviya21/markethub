// master v1 route

const route = require("express").Router();
const AuthRoutes = require("./auth.routes");

route.use("/auth", AuthRoutes);

module.exports = route;