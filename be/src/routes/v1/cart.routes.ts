import { Router } from "express";
import CartController from "../../controllers/cart.controller";
import validate from "../../middleware/validate";
import authenticate from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
    addCartItemSchema,
    cartItemParamSchema,
    updateCartItemSchema,
} from "../../validations/cart.validation";

const route = Router();

route.use("/cart", authenticate, authorize("buyer"));

route.get("/cart", CartController.get);
route.post("/cart", validate(addCartItemSchema), CartController.add);
route.delete("/cart", CartController.clear);

route.patch(
    "/cart/:productId",
    validate(cartItemParamSchema, "params"),
    validate(updateCartItemSchema),
    CartController.updateQuantity
);
route.delete(
    "/cart/:productId",
    validate(cartItemParamSchema, "params"),
    CartController.remove
);

export default route;
