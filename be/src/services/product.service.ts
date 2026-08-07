import { AppError } from "../utils/errors";
import STATUS_CODES from "../contants/statusCode";
import ProductModel, { ListFilters } from "../models/product.model";
import CategoryModel from "../models/category.model";
import UserModel from "../models/user.model";
import { AuthUser, ProductRow, ProductStatus, UserRole } from "../types/models";
import { ListProductsQuery, ProductFeedQuery, ProductImageInput } from "../validations/product.validation";

interface Viewer {
    id?: number;
    role?: UserRole;
}

interface CreateInput {
    name: string;
    sellerId?: number;
    categoryId?: number | null;
    description?: string;
    price: number;
    mrp?: number | null;
    stock: number;
    status: ProductStatus;
    images?: ProductImageInput[];
    userId: number;
    role: UserRole;
}

interface UpdateInput {
    id: number;
    name?: string;
    categoryId?: number | null;
    description?: string;
    price?: number;
    mrp?: number | null;
    stock?: number;
    images?: ProductImageInput[];
    userId: number;
    role: UserRole;
}

interface UpdateStatusInput {
    id: number;
    status: ProductStatus;
    userId: number;
    role: UserRole;
}

const SELLER_ALLOWED_STATUSES: ProductStatus[] = ["draft", "pending", "archived"];
const SELLER_ALLOWED_CREATE_STATUSES: ProductStatus[] = ["draft", "pending"];

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 200);

const buildUniqueSlug = async (name: string) => {
    const base = slugify(name) || "product";
    let slug = base;
    let attempt = 1;
    while (await ProductModel.slugExists(slug)) {
        attempt += 1;
        slug = `${base}-${attempt}`;
    }
    return slug;
};

const assertCategoryExists = async (categoryId?: number | null) => {
    if (categoryId == null) return;
    const category = await CategoryModel.findById(categoryId);
    if (!category) throw new AppError("Category not found", STATUS_CODES.BAD_REQUEST);
};

const resolveSellerId = async ({ role, userId, sellerId }: { role: UserRole; userId: number; sellerId?: number }) => {
    if (role !== "admin") return userId;
    if (!sellerId) throw new AppError("sellerId is required", STATUS_CODES.BAD_REQUEST);
    const seller = await UserModel.findById(sellerId);
    if (!seller || seller.role !== "seller") {
        throw new AppError("Seller not found", STATUS_CODES.BAD_REQUEST);
    }
    return sellerId;
};

const assertCanManage = (product: ProductRow, { id, role }: Viewer) => {
    if (role === "admin") return;
    if (product.sellerId !== id) {
        throw new AppError("You can only manage your own products", STATUS_CODES.FORBIDDEN);
    }
};

const visibilityFor = (viewer: Viewer): Pick<ListFilters, "visibleStatuses" | "ownSellerId"> => {
    if (viewer.role === "admin") return {};
    if (viewer.role === "seller" && viewer.id) {
        return { visibleStatuses: ["approved"], ownSellerId: viewer.id };
    }
    return { visibleStatuses: ["approved"] };
};

const ProductService = {
    async create({ userId, role, sellerId, name, categoryId, description, price, mrp, stock, status, images }: CreateInput) {
        const resolvedSellerId = await resolveSellerId({ role, userId, sellerId });
        if (role !== "admin" && !SELLER_ALLOWED_CREATE_STATUSES.includes(status)) {
            throw new AppError(
                "A new product can only be saved as draft or submitted for review",
                STATUS_CODES.FORBIDDEN
            );
        }
        await assertCategoryExists(categoryId);

        const id = await ProductModel.save({
            name,
            slug: await buildUniqueSlug(name),
            sellerId: resolvedSellerId,
            categoryId: categoryId ?? null,
            description: description ?? null,
            price,
            mrp: mrp ?? null,
            stock,
            status,
            images,
            userId,
        });
        return { id };
    },

    async update({ id, userId, role, categoryId, ...patch }: UpdateInput) {
        const existing = await ProductModel.findById(id);
        if (!existing) throw new AppError("Product not found", STATUS_CODES.NOT_FOUND);
        assertCanManage(existing, { id: userId, role });

        if (categoryId !== undefined) await assertCategoryExists(categoryId);

        const effectivePrice = patch.price ?? existing.price;
        const effectiveMrp = patch.mrp !== undefined ? patch.mrp : existing.mrp;
        if (effectiveMrp != null && effectiveMrp < effectivePrice) {
            throw new AppError("mrp cannot be lower than price", STATUS_CODES.BAD_REQUEST);
        }

        const affectedRows = await ProductModel.update({ id, categoryId, ...patch, userId });
        if (affectedRows === 0) throw new AppError("Product not found", STATUS_CODES.NOT_FOUND);
        return { id };
    },

    async updateStatus({ id, status, userId, role }: UpdateStatusInput) {
        const existing = await ProductModel.findById(id);
        if (!existing) throw new AppError("Product not found", STATUS_CODES.NOT_FOUND);
        assertCanManage(existing, { id: userId, role });

        if (role !== "admin" && !SELLER_ALLOWED_STATUSES.includes(status)) {
            throw new AppError(
                "Only an admin can approve, reject or flag a product",
                STATUS_CODES.FORBIDDEN
            );
        }

        const affectedRows = await ProductModel.updateStatus({ id, status, userId });
        if (affectedRows === 0) throw new AppError("Product not found", STATUS_CODES.NOT_FOUND);
        return { id, status };
    },

    async find(query: ListProductsQuery, viewer: Viewer) {
        const { page, limit } = query;
        const { items, total } = await ProductModel.find({
            ...query,
            ...visibilityFor(viewer),
        });

        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        };
    },

    async getFeed({ type, limit, categoryId, days }: ProductFeedQuery) {
        if (type === "deals") return ProductModel.findDeals({ limit, categoryId });
        if (type === "popular") return ProductModel.findPopular({ limit, categoryId });

        const trending = await ProductModel.findTrending({ limit, categoryId, days });
        if (trending.length >= limit) return trending;

        const filler = await ProductModel.findRecentWellRated({
            limit: limit - trending.length,
            categoryId,
            excludeIds: trending.map((product) => product.id),
        });
        return [...trending, ...filler];
    },

    async findById(id: number, viewer: Viewer) {
        const product = await ProductModel.findDetailById(id);
        if (!product) throw new AppError("Product not found", STATUS_CODES.NOT_FOUND);

        const isOwner = viewer.role === "seller" && product.sellerId === viewer.id;
        if (viewer.role !== "admin" && !isOwner && product.status !== "approved") {
            throw new AppError("Product not found", STATUS_CODES.NOT_FOUND);
        }
        return product;
    },
};

export const productViewer = (user?: AuthUser): Viewer => ({ id: user?.id, role: user?.role });

export default ProductService;
