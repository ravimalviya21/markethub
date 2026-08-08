import { z } from "zod";

export const MAX_CART_ITEM_QUANTITY = 50;

export const addCartItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(MAX_CART_ITEM_QUANTITY).optional().default(1),
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(0).max(MAX_CART_ITEM_QUANTITY),
});

export const cartItemParamSchema = z.object({
    productId: z.coerce.number().int().positive(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
