import asyncHandler from "../utils/asyncHandler";
import STATUS_CODES from "../contants/statusCode";
import CategoryService from "../services/category.service";
import { AuthUser } from "../types/models";

const CategoryController = {
    create: asyncHandler(async (req, res) => {
        const category = await CategoryService.create({
            ...req.body,
            userId: (req.user as AuthUser).id,
        });
        res.status(STATUS_CODES.CREATED).json({
            success: true,
            data: category,
        });
    }),
    update: asyncHandler(async (req, res) => {
        const category = await CategoryService.update({
            ...req.body,
            id: req.params.id as string,
            userId: (req.user as AuthUser).id,
        });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: category,
        });
    }),
    find: asyncHandler(async (req, res) => {
        const categories = await CategoryService.find();
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: categories,
        });
    }),
    findByParentId: asyncHandler(async (req, res) => {
        const categories = await CategoryService.findByParentId({ id: req.params.id as string });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: categories,
        });
    }),
};

export default CategoryController;
