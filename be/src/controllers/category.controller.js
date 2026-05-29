const asyncHandler = require("../utils/asyncHandler");
const STATUS_CODES = require("../contants/statusCode");
const CategoryService = require("../services/category.service");

const CategoryController = {
    create: asyncHandler(async (req, res) => {
        const category = await CategoryService.create({ ...req.body, userId: req.user.id });
        res.status(STATUS_CODES.CREATED).json({
            success: true,
            data: category,
        });
    }),
    update: asyncHandler(async (req, res) => {
        const category = await CategoryService.update({
            ...req.body,
            id: req.params.id,
            userId: req.user.id,
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
        const categories = await CategoryService.findByParentId({ id: req.params.id });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: categories,
        });
    })
}

module.exports = CategoryController;