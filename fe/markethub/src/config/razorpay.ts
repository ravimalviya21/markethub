export const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayFailureResponse {
    error?: { description?: string; reason?: string };
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
    theme?: { color?: string };
    handler: (response: RazorpaySuccessResponse) => void;
    modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

let loader: Promise<boolean> | null = null;

export const loadRazorpayScript = (): Promise<boolean> => {
    if (typeof window === "undefined") return Promise.resolve(false);
    if (window.Razorpay) return Promise.resolve(true);
    if (loader) return loader;

    loader = new Promise<boolean>((resolve) => {
        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
            loader = null;
            resolve(false);
        };
        document.body.appendChild(script);
    });

    return loader;
};

export type CheckoutOutcome =
    | { status: "success"; response: RazorpaySuccessResponse }
    | { status: "dismissed" }
    | { status: "failed"; reason: string };

export const openRazorpayCheckout = async (
    options: Omit<RazorpayOptions, "handler" | "modal">
): Promise<CheckoutOutcome> => {
    const ready = await loadRazorpayScript();
    if (!ready || !window.Razorpay) {
        return { status: "failed", reason: "Could not load the payment gateway" };
    }

    return new Promise<CheckoutOutcome>((resolve) => {
        let settled = false;
        const settle = (outcome: CheckoutOutcome) => {
            if (settled) return;
            settled = true;
            resolve(outcome);
        };

        const checkout = new window.Razorpay!({
            ...options,
            handler: (response) => settle({ status: "success", response }),
            modal: { ondismiss: () => settle({ status: "dismissed" }) },
        });

        checkout.on("payment.failed", (response) =>
            settle({
                status: "failed",
                reason: response?.error?.description || "Payment failed",
            })
        );

        checkout.open();
    });
};
