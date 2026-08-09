import { CartItem } from "@/services/cart.service";
import { FLAT_SHIPPING_COST, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/contants/checkout";

export interface SellerGroup {
    sellerId: number;
    sellerName: string | null;
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
}

export interface CheckoutPricing {
    groups: SellerGroup[];
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    mrpTotal: number;
    productDiscount: number;
    shippingCost: number;
    tax: number;
    total: number;
}

const money = (value: number) => Math.round(value * 100) / 100;

const priceGroup = (items: CartItem[]) => {
    const subtotal = money(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
    const tax = money(subtotal * TAX_RATE);
    return { subtotal, shippingCost, tax, total: money(subtotal + shippingCost + tax) };
};

export const groupBySeller = (items: CartItem[]): SellerGroup[] => {
    const groups = new Map<number, CartItem[]>();

    items.forEach((item) => {
        const existing = groups.get(item.sellerId);
        if (existing) existing.push(item);
        else groups.set(item.sellerId, [item]);
    });

    return Array.from(groups.entries()).map(([sellerId, groupItems]) => ({
        sellerId,
        sellerName: groupItems[0]?.sellerName ?? null,
        items: groupItems,
        ...priceGroup(groupItems),
    }));
};

export const computeCheckoutPricing = (items: CartItem[]): CheckoutPricing => {
    const purchasable = items.filter((item) => item.available);
    const groups = groupBySeller(purchasable);

    const mrpTotal = purchasable.reduce((sum, item) => sum + item.lineMrpTotal, 0);
    const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);

    return {
        groups,
        itemCount: purchasable.length,
        totalQuantity: purchasable.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: money(subtotal),
        mrpTotal: money(mrpTotal),
        productDiscount: money(Math.max(0, mrpTotal - subtotal)),
        shippingCost: money(groups.reduce((sum, group) => sum + group.shippingCost, 0)),
        tax: money(groups.reduce((sum, group) => sum + group.tax, 0)),
        total: money(groups.reduce((sum, group) => sum + group.total, 0)),
    };
};

export const toOrderItems = (items: CartItem[]) =>
    items
        .filter((item) => item.available)
        .map((item) => ({ productId: item.productId, quantity: item.quantity }));
