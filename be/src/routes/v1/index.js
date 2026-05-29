// master v1 route

const route = require("express").Router();
const AuthRoutes = require("./auth.routes");
const CategoryRoutes = require("./category.routes");

route.use("/auth", AuthRoutes);
route.use("/", CategoryRoutes);

module.exports = route;