import { PaymentMethod } from "@/services/order.service";

export const FLAT_SHIPPING_COST = 49;
export const FREE_SHIPPING_THRESHOLD = 999;
export const TAX_RATE = 0.08;

export const DEFAULT_COUNTRY = "India";
export const SHIPPING_ADDRESS_STORAGE_KEY = "markethub.shippingAddress";

export const CHECKOUT_STEPS = ["Shipping address", "Review & pay"] as const;

export interface PaymentOption {
    value: PaymentMethod;
    label: string;
    description: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        value: "razorpay",
        label: "Pay online",
        description: "Card, UPI, net banking or wallet via Razorpay",
    },
    {
        value: "cod",
        label: "Cash on delivery",
        description: "Pay in cash when your order arrives",
    },
];

export const RAZORPAY_BRAND_NAME = "MarketHub";
export const RAZORPAY_THEME_COLOR = "#1677ff";

export const INDIAN_STATES = [
    "Andhra Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Tamil Nadu",
    "Telangana",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
];
