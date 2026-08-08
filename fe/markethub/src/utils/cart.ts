import { CartSummary } from "@/services/cart.service";
import { CART_COUPONS, Coupon, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/contants/cart";

export { CART_COUPONS };
export type { Coupon };

export interface CartTotals {
    totalQuantity: number;
    subtotal: number;
    mrpTotal: number;
    productDiscount: number;
    couponDiscount: number;
    shipping: number;
    total: number;
    totalSavings: number;
}

const couponDiscountFor = (coupon: Coupon | null, subtotal: number) => {
    if (!coupon || subtotal <= 0) return 0;
    if (coupon.minOrder && subtotal < coupon.minOrder) return 0;

    if (coupon.type === "percent") {
        const raw = Math.round((subtotal * coupon.value) / 100);
        return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    }
    if (coupon.type === "flat") return Math.min(coupon.value, subtotal);
    return 0;
};

export const computeCartTotals = (
    summary: CartSummary | undefined,
    coupon: Coupon | null
): CartTotals => {
    const totalQuantity = summary?.totalQuantity ?? 0;
    const subtotal = summary?.subtotal ?? 0;
    const mrpTotal = summary?.mrpTotal ?? 0;
    const productDiscount = summary?.productDiscount ?? 0;

    const couponDiscount = couponDiscountFor(coupon, subtotal);
    const freeShipping = coupon?.type === "shipping" && subtotal > 0;
    const shipping =
        subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && !freeShipping ? SHIPPING_FEE : 0;

    return {
        totalQuantity,
        subtotal,
        mrpTotal,
        productDiscount,
        couponDiscount,
        shipping,
        total: Math.max(0, subtotal - couponDiscount + shipping),
        totalSavings: productDiscount + couponDiscount,
    };
};
