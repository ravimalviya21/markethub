import { z } from "zod";

export const createCategorySchema = z.object({
    parentId: z.number().int().positive().nullable().optional(),
    displayName: z.string().min(1).max(50),
    imageUrl: z.string().url().max(255).optional(),
    isActive: z.boolean().optional().default(false),
});

export const updateCategorySchema = z
    .object({
        displayName: z.string().min(1).max(50).optional(),
        isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const categoryIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});
