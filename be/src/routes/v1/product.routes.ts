import { Router } from "express";
import ProductController from "../../controllers/product.controller";
import validate from "../../middleware/validate";
import authenticate from "../../middleware/auth";
import optionalAuthenticate from "../../middleware/optionalAuth";
import authorize from "../../middleware/authorize";
import {
    createProductSchema,
    updateProductSchema,
    updateProductStatusSchema,
    listProductsQuerySchema,
    productFeedQuerySchema,
    productIdParamSchema,
} from "../../validations/product.validation";

const route = Router();

route.post(
    "/product",
    authenticate,
    authorize("seller", "admin"),
    validate(createProductSchema),
    ProductController.create
);
route.patch(
    "/product/:id",
    authenticate,
    authorize("seller", "admin"),
    validate(productIdParamSchema, "params"),
    validate(updateProductSchema),
    ProductController.update
);
route.patch(
    "/product/:id/status",
    authenticate,
    authorize("seller", "admin"),
    validate(productIdParamSchema, "params"),
    validate(updateProductStatusSchema),
    ProductController.updateStatus
);

route.get(
    "/product",
    optionalAuthenticate,
    validate(listProductsQuerySchema, "query"),
    ProductController.find
);
route.get("/product/feed", validate(productFeedQuerySchema, "query"), ProductController.feed);

route.get(
    "/product/:id",
    optionalAuthenticate,
    validate(productIdParamSchema, "params"),
    ProductController.findById
);

export default route;
