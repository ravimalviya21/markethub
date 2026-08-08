// master v1 route

import { Router } from "express";
import AuthRoutes from "./auth.routes";
import CategoryRoutes from "./category.routes";
import ProductRoutes from "./product.routes";
import UserRoutes from "./user.routes";
import OrderRoutes from "./order.routes";
import CartRoutes from "./cart.routes";

const route = Router();

route.use("/auth", AuthRoutes);
route.use("/", CategoryRoutes);
route.use("/", ProductRoutes);
route.use("/", UserRoutes);
route.use("/", OrderRoutes);
route.use("/", CartRoutes);

export default route;
