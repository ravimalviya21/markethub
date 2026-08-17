import { z } from "zod";

export const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
] as const;

const shippingAddressSchema = z.object({
    fullName: z.string().trim().min(1).max(255),
    phone: z.string().trim().min(6).max(20),
    line1: z.string().trim().min(1).max(255),
    line2: z.string().trim().max(255).optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(3).max(20),
    country: z.string().trim().min(2).max(100),
});

const orderItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(100),
});

export const PAYMENT_METHODS = ["cod", "razorpay"] as const;

export const createOrderSchema = z.object({
    items: z
        .array(orderItemSchema)
        .min(1)
        .max(50)
        .refine(
            (items) => new Set(items.map((item) => item.productId)).size === items.length,
            { message: "A product can only appear once in an order" }
        ),
    shippingAddress: shippingAddressSchema,
    paymentMethod: z.enum(PAYMENT_METHODS).optional().default("cod"),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(ORDER_STATUSES),
});

export const orderIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const listOrdersQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().max(64).optional(),
    status: z.enum(ORDER_STATUSES).optional(),
    buyerId: z.coerce.number().int().positive().optional(),
    sellerId: z.coerce.number().int().positive().optional(),
    sortBy: z.enum(["createdAt", "total", "status"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
