import { z } from "zod";

export const listUsersQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().max(255).optional(),
    role: z.enum(["buyer", "seller", "admin"]).optional(),
});

export const createUserSchema = z.object({
    name: z.string().trim().min(2).max(255),
    email: z.string().trim().email().max(255).toLowerCase(),
    password: z.string().min(8).max(128),
    role: z.enum(["buyer", "seller", "admin"]).default("buyer"),
    isEmailVerified: z.boolean().optional().default(true),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
