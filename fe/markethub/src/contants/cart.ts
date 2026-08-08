export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 49;

export type CouponType = "percent" | "flat" | "shipping";

export interface Coupon {
    code: string;
    description: string;
    type: CouponType;
    value: number;
    minOrder?: number;
    maxDiscount?: number;
}

export const CART_COUPONS: Coupon[] = [
    {
        code: "WELCOME10",
        description: "10% off your first order",
        type: "percent",
        value: 10,
        maxDiscount: 500,
    },
    {
        code: "SAVE200",
        description: "Flat ₹200 off on orders above ₹1,999",
        type: "flat",
        value: 200,
        minOrder: 1999,
    },
    {
        code: "FREESHIP",
        description: "Free shipping on any order",
        type: "shipping",
        value: 0,
    },
];
