const { AppError } = require("../utils/errors");
const STATUS_CODES = require("../contants/statusCode");
const CategoryModel = require("../models/category.model");

const CategoryService = {
    async create({ userId, displayName, parentId, imageUrl, isActive }) {
        const id = await CategoryModel.save({
            userId,
            displayName,
            parentId: parentId ?? null,
            imageUrl: imageUrl ?? null,
            isActive,
        });
        return { id };
    },
    async update({ id, displayName, isActive, userId }) {
        const affectedRows = await CategoryModel.update({ id, displayName, isActive, userId });
        if (affectedRows === 0) throw new AppError("Category not found", STATUS_CODES.NOT_FOUND);
        return { id };
    },
    async find() {
        return CategoryModel.find();
    },
    async findByParentId({ id }) {
        return CategoryModel.findByParentId({ id });
    }
}
module.exports = CategoryService;