const route = require("express").Router();
const CategoryController = require("../../controllers/category.controller");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");
const {
    createCategorySchema,
    updateCategorySchema,
    categoryIdParamSchema,
} = require("../../validations/category.validation");

// Admin
route.post("/category", authenticate, authorize("admin"), validate(createCategorySchema), CategoryController.create);
route.patch("/category/:id", authenticate, authorize("admin"), validate(categoryIdParamSchema, "params"), validate(updateCategorySchema), CategoryController.update);


// public
route.get("/category", CategoryController.find);
route.get("/category/:id/children", validate(categoryIdParamSchema, "params"), CategoryController.findByParentId);

module.exports = route;
