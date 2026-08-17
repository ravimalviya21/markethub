import Razorpay from "razorpay";

export const RAZORPAY_CURRENCY = "INR";

export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || "";
export const getRazorpayKeySecret = () => process.env.RAZORPAY_KEY_SECRET || "";
export const getRazorpayWebhookSecret = () => process.env.RAZORPAY_WEBHOOK_SECRET || "";

export const isRazorpayConfigured = () =>
    Boolean(getRazorpayKeyId() && getRazorpayKeySecret());

let client: Razorpay | null = null;
let clientKeyId = "";

export const getRazorpayClient = (): Razorpay => {
    if (!isRazorpayConfigured()) {
        throw new Error("Razorpay is not configured");
    }
    if (!client || clientKeyId !== getRazorpayKeyId()) {
        clientKeyId = getRazorpayKeyId();
        client = new Razorpay({ key_id: clientKeyId, key_secret: getRazorpayKeySecret() });
    }
    return client;
};

export const toPaise = (amount: number) => Math.round(amount * 100);
export const fromPaise = (amount: number) => Math.round(amount) / 100;
