import asyncHandler from "../utils/asyncHandler";
import STATUS_CODES from "../contants/statusCode";
import UserService from "../services/user.service";
import { ListUsersQuery } from "../validations/user.validation";

const UserController = {
    create: asyncHandler(async (req, res) => {
        const user = await UserService.create(req.body);
        res.status(STATUS_CODES.CREATED).json({
            success: true,
            data: user,
        });
    }),
    find: asyncHandler(async (req, res) => {
        const result = await UserService.find(req.validatedQuery as ListUsersQuery);
        res.status(STATUS_CODES.OK).json({
            success: true,
            ...result,
        });
    }),
};

export default UserController;
