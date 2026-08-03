// master v1 route

import { Router } from "express";
import AuthRoutes from "./auth.routes";
import CategoryRoutes from "./category.routes";
import ProductRoutes from "./product.routes";

const route = Router();

route.use("/auth", AuthRoutes);
route.use("/", CategoryRoutes);
route.use("/", ProductRoutes);

export default route;
