import { z } from "zod";

export const createBannerSchema = z.object({
    title: z.string().min(1).max(255),
    subtitle: z.string().min(1).max(255),
    imageUrl: z.string().url().max(255),
    ctaText: z.string().min(1).max(50),
    ctaLink: z.string().url().max(255),
    displayOrder: z.number().int().min(0).max(127).optional().default(0),
    categoryId: z.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional().default(false),
});

export const updateBannerSchema = z
    .object({
        title: z.string().min(1).max(255).optional(),
        subtitle: z.string().min(1).max(255).optional(),
        imageUrl: z.string().url().max(255).optional(),
        ctaText: z.string().min(1).max(50).optional(),
        ctaLink: z.string().url().max(255).optional(),
        displayOrder: z.number().int().min(0).max(127).optional(),
        categoryId: z.number().int().positive().nullable().optional(),
        isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const bannerIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});
