import { AppError } from "../utils/errors";
import STATUS_CODES from "../contants/statusCode";
import CategoryModel from "../models/category.model";

interface CreateInput {
    userId: number;
    displayName: string;
    parentId?: number | null;
    imageUrl?: string | null;
    isActive: boolean;
}

interface UpdateInput {
    id: number | string;
    displayName?: string;
    isActive?: boolean;
    userId: number;
}

const CategoryService = {
    async create({ userId, displayName, parentId, imageUrl, isActive }: CreateInput) {
        const id = await CategoryModel.save({
            userId,
            displayName,
            parentId: parentId ?? null,
            imageUrl: imageUrl ?? null,
            isActive,
        });
        return { id };
    },
    async update({ id, displayName, isActive, userId }: UpdateInput) {
        const affectedRows = await CategoryModel.update({ id, displayName, isActive, userId });
        if (affectedRows === 0) throw new AppError("Category not found", STATUS_CODES.NOT_FOUND);
        return { id };
    },
    async find() {
        return CategoryModel.find();
    },
    async findByParentId({ id }: { id: number | string }) {
        return CategoryModel.findByParentId({ id });
    },
};

export default CategoryService;
