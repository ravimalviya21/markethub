import { AppError } from "../utils/errors";
import STATUS_CODES from "../contants/statusCode";
import CartModel, { CartItemDetail } from "../models/cart.model";
import ProductModel from "../models/product.model";
import { MAX_CART_ITEM_QUANTITY } from "../validations/cart.validation";

export interface CartLine extends CartItemDetail {
    available: boolean;
    lineTotal: number;
    lineMrpTotal: number;
}

export interface CartSummary {
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    mrpTotal: number;
    productDiscount: number;
    unavailableCount: number;
}

const toLine = (item: CartItemDetail): CartLine => {
    const available = item.status === "approved" && item.stock > 0;
    const quantity = available ? Math.min(item.quantity, item.stock) : item.quantity;
    const unitMrp = item.mrp != null && item.mrp > item.price ? item.mrp : item.price;

    return {
        ...item,
        available,
        lineTotal: available ? item.price * quantity : 0,
        lineMrpTotal: available ? unitMrp * quantity : 0,
    };
};

const summarize = (lines: CartLine[]): CartSummary => {
    const available = lines.filter((line) => line.available);
    const subtotal = available.reduce((sum, line) => sum + line.lineTotal, 0);
    const mrpTotal = available.reduce((sum, line) => sum + line.lineMrpTotal, 0);

    return {
        itemCount: lines.length,
        totalQuantity: available.reduce((sum, line) => sum + line.quantity, 0),
        subtotal,
        mrpTotal,
        productDiscount: Math.max(0, mrpTotal - subtotal),
        unavailableCount: lines.length - available.length,
    };
};

const buildCart = async (userId: number) => {
    const lines = (await CartModel.findByUserId(userId)).map(toLine);
    return { items: lines, summary: summarize(lines) };
};

const assertPurchasable = async (productId: number) => {
    const product = await ProductModel.findById(productId);
    if (!product || product.status !== "approved") {
        throw new AppError("Product not found", STATUS_CODES.NOT_FOUND);
    }
    if (product.stock <= 0) {
        throw new AppError("This product is out of stock", STATUS_CODES.BAD_REQUEST);
    }
    return product;
};

const CartService = {
    async get(userId: number) {
        return buildCart(userId);
    },

    async add({
        userId,
        productId,
        quantity,
    }: {
        userId: number;
        productId: number;
        quantity: number;
    }) {
        const product = await assertPurchasable(productId);
        const existing = await CartModel.findItem(userId, productId);
        const requested = (existing?.quantity ?? 0) + quantity;
        const nextQuantity = Math.min(requested, product.stock, MAX_CART_ITEM_QUANTITY);

        await CartModel.setQuantity({ userId, productId, quantity: nextQuantity });
        return buildCart(userId);
    },

    async updateQuantity({
        userId,
        productId,
        quantity,
    }: {
        userId: number;
        productId: number;
        quantity: number;
    }) {
        const existing = await CartModel.findItem(userId, productId);
        if (!existing) throw new AppError("Item not in cart", STATUS_CODES.NOT_FOUND);

        if (quantity === 0) {
            await CartModel.remove(userId, productId);
            return buildCart(userId);
        }

        const product = await assertPurchasable(productId);
        await CartModel.setQuantity({
            userId,
            productId,
            quantity: Math.min(quantity, product.stock, MAX_CART_ITEM_QUANTITY),
        });
        return buildCart(userId);
    },

    async remove(userId: number, productId: number) {
        const affectedRows = await CartModel.remove(userId, productId);
        if (affectedRows === 0) throw new AppError("Item not in cart", STATUS_CODES.NOT_FOUND);
        return buildCart(userId);
    },

    async clear(userId: number) {
        await CartModel.clear(userId);
        return buildCart(userId);
    },
};

export default CartService;
