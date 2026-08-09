export const FLAT_SHIPPING_COST = 49;
export const FREE_SHIPPING_THRESHOLD = 999;
export const TAX_RATE = 0.08;

export const DEFAULT_COUNTRY = "India";
export const SHIPPING_ADDRESS_STORAGE_KEY = "markethub.shippingAddress";

export const CHECKOUT_STEPS = ["Shipping address", "Review & pay"] as const;

export type PaymentMethod = "cod" | "card" | "upi";

export interface PaymentOption {
    value: PaymentMethod;
    label: string;
    description: string;
    disabled: boolean;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        value: "cod",
        label: "Cash on delivery",
        description: "Pay in cash when your order arrives",
        disabled: false,
    },
    {
        value: "card",
        label: "Card",
        description: "Online payments are coming soon",
        disabled: true,
    },
    {
        value: "upi",
        label: "UPI",
        description: "Online payments are coming soon",
        disabled: true,
    },
];

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
