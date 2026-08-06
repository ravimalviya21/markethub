import { z } from "zod";

export const PRODUCT_STATUSES = [
    "draft",
    "pending",
    "approved",
    "flagged",
    "rejected",
    "archived",
] as const;

const productImageSchema = z.object({
    url: z.string().url().max(500),
    thumbnailUrl: z.string().url().max(500).optional(),
    altText: z.string().max(255).optional(),
    sortOrder: z.number().int().min(0).optional(),
});

export const createProductSchema = z.object({
    name: z.string().trim().min(1).max(255),
    sellerId: z.number().int().positive().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    description: z.string().max(5000).optional(),
    price: z.number().nonnegative().max(99999999.99),
    stock: z.number().int().min(0).optional().default(0),
    status: z.enum(PRODUCT_STATUSES).optional().default("draft"),
    images: z.array(productImageSchema).max(10).optional(),
});

export const updateProductSchema = z
    .object({
        name: z.string().trim().min(1).max(255).optional(),
        categoryId: z.number().int().positive().nullable().optional(),
        description: z.string().max(5000).optional(),
        price: z.number().nonnegative().max(99999999.99).optional(),
        stock: z.number().int().min(0).optional(),
        images: z.array(productImageSchema).max(10).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const updateProductStatusSchema = z.object({
    status: z.enum(PRODUCT_STATUSES),
});

export const productIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const listProductsQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        q: z.string().trim().max(255).optional(),
        status: z.enum(PRODUCT_STATUSES).optional(),
        categoryId: z.coerce.number().int().positive().optional(),
        sellerId: z.coerce.number().int().positive().optional(),
        minPrice: z.coerce.number().nonnegative().optional(),
        maxPrice: z.coerce.number().nonnegative().optional(),
        sortBy: z.enum(["createdAt", "price", "name", "averageRating"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
    })
    .refine((data) => data.minPrice == null || data.maxPrice == null || data.minPrice <= data.maxPrice, {
        message: "minPrice cannot be greater than maxPrice",
        path: ["minPrice"],
    });

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
