import { Router } from "express";
import OrderController from "../../controllers/order.controller";
import validate from "../../middleware/validate";
import authenticate from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
    createOrderSchema,
    updateOrderStatusSchema,
    listOrdersQuerySchema,
    orderIdParamSchema,
} from "../../validations/order.validation";

const route = Router();

route.post(
    "/order",
    authenticate,
    authorize("buyer"),
    validate(createOrderSchema),
    OrderController.create
);
route.patch(
    "/order/:id/status",
    authenticate,
    authorize("buyer", "seller", "admin"),
    validate(orderIdParamSchema, "params"),
    validate(updateOrderStatusSchema),
    OrderController.updateStatus
);

route.get(
    "/order",
    authenticate,
    validate(listOrdersQuerySchema, "query"),
    OrderController.find
);
route.get(
    "/order/:id",
    authenticate,
    validate(orderIdParamSchema, "params"),
    OrderController.findById
);

export default route;
