// master v1 route

import { Router } from "express";
import AuthRoutes from "./auth.routes";
import CategoryRoutes from "./category.routes";

const route = Router();

route.use("/auth", AuthRoutes);
route.use("/", CategoryRoutes);

export default route;
