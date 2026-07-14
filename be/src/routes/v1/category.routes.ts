import { Router } from "express";
import CategoryController from "../../controllers/category.controller";
import validate from "../../middleware/validate";
import authenticate from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
    createCategorySchema,
    updateCategorySchema,
    categoryIdParamSchema,
} from "../../validations/category.validation";

const route = Router();

// Admin
route.post("/category", authenticate, authorize("admin"), validate(createCategorySchema), CategoryController.create);
route.patch(
    "/category/:id",
    authenticate,
    authorize("admin"),
    validate(categoryIdParamSchema, "params"),
    validate(updateCategorySchema),
    CategoryController.update
);

// public
route.get("/category", CategoryController.find);
route.get("/category/:id/children", validate(categoryIdParamSchema, "params"), CategoryController.findByParentId);

export default route;
