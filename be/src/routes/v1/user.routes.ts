import { Router } from "express";
import UserController from "../../controllers/user.controller";
import validate from "../../middleware/validate";
import authenticate from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import { createUserSchema, listUsersQuerySchema } from "../../validations/user.validation";

const route = Router();

route.post(
    "/user",
    authenticate,
    authorize("admin"),
    validate(createUserSchema),
    UserController.create
);

route.get(
    "/user",
    authenticate,
    authorize("admin"),
    validate(listUsersQuerySchema, "query"),
    UserController.find
);

export default route;
