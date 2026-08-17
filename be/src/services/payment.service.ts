import { createHmac, timingSafeEqual } from "crypto";
import pool from "../config/db";
import { AppError } from "../utils/errors";
import STATUS_CODES from "../contants/statusCode";
import PaymentModel from "../models/payment.model";
import OrderModel from "../models/order.model";
import CartModel from "../models/cart.model";
import { PaymentStatus } from "../types/models";
import {
    RAZORPAY_CURRENCY,
    getRazorpayClient,
    getRazorpayKeyId,
    getRazorpayKeySecret,
    getRazorpayWebhookSecret,
    isRazorpayConfigured,
    toPaise,
} from "../config/razorpay";

export interface PaymentIntent {
    provider: "razorpay";
    razorpayOrderId: string;
    keyId: string;
    amount: number;
    amountInPaise: number;
    currency: string;
}

interface CreatedOrderRef {
    id: number;
    orderNumber: string;
    total: number;
}

const safeCompare = (a: string, b: string) => {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
};

export const signCheckout = (razorpayOrderId: string, razorpayPaymentId: string) =>
    createHmac("sha256", getRazorpayKeySecret())
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

const assertConfigured = () => {
    if (!isRazorpayConfigured()) {
        throw new AppError(
            "Online payments are not configured on this server",
            STATUS_CODES.SERVICE_UNAVAILABLE
        );
    }
};

type SettleOutcome = "confirm" | "fail";

interface SettleResult {
    found: boolean;
    changed: boolean;
    status?: PaymentStatus;
    orderIds: number[];
    buyerId?: number;
}

const isTerminal = (status: PaymentStatus) => status === "succeeded" || status === "failed";

const settle = async ({
    razorpayOrderId,
    outcome,
    userId,
    razorpayPaymentId,
    razorpaySignature,
}: {
    razorpayOrderId: string;
    outcome: SettleOutcome;
    userId?: number;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
}): Promise<SettleResult> => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const records = await PaymentModel.lockByRazorpayOrderId(conn, razorpayOrderId);
        if (!records.length) {
            await conn.commit();
            return { found: false, changed: false, orderIds: [] };
        }

        const orderIds = records.map((record) => record.orderId);
        let buyerId = userId;

        for (const record of records) {
            const order = await OrderModel.findByIdWithin(conn, record.orderId);
            if (!order) throw new AppError("Order not found", STATUS_CODES.NOT_FOUND);
            if (userId != null && order.buyerId !== userId) {
                throw new AppError("Payment not found", STATUS_CODES.NOT_FOUND);
            }
            buyerId = order.buyerId;
        }

        const target: PaymentStatus = outcome === "confirm" ? "succeeded" : "failed";

        if (records.every((record) => record.status === target)) {
            await conn.commit();
            return { found: true, changed: false, status: target, orderIds, buyerId };
        }

        const settledOpposite = records.find(
            (record) => isTerminal(record.status) && record.status !== target
        );
        if (settledOpposite) {
            await conn.rollback();
            return { found: true, changed: false, status: settledOpposite.status, orderIds, buyerId };
        }

        await PaymentModel.markStatus(
            { razorpayOrderId, status: target, razorpayPaymentId, razorpaySignature },
            conn
        );

        const productIds: number[] = [];
        for (const orderId of orderIds) {
            const affected = await OrderModel.applyStatus(conn, {
                id: orderId,
                status: outcome === "confirm" ? "confirmed" : "cancelled",
                expectedStatus: "pending",
                userId: buyerId ?? 0,
                restoreStock: outcome === "fail",
            });
            if (outcome === "confirm" && affected > 0) {
                const items = await OrderModel.findItemsByOrderId(orderId);
                items.forEach((item) => productIds.push(item.productId));
            }
        }

        await conn.commit();

        if (outcome === "confirm" && buyerId != null && productIds.length) {
            await CartModel.removeMany(buyerId, Array.from(new Set(productIds)));
        }

        return { found: true, changed: true, status: target, orderIds, buyerId };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const PaymentService = {
    async createIntent({
        orders,
        userId,
        receipt,
    }: {
        orders: CreatedOrderRef[];
        userId: number;
        receipt: string;
    }): Promise<PaymentIntent> {
        assertConfigured();

        const amount = Math.round(orders.reduce((sum, order) => sum + order.total, 0) * 100) / 100;
        if (amount <= 0) {
            throw new AppError("Nothing to pay for", STATUS_CODES.BAD_REQUEST);
        }

        const razorpayOrder = await getRazorpayClient().orders.create({
            amount: toPaise(amount),
            currency: RAZORPAY_CURRENCY,
            receipt: receipt.slice(0, 40),
            notes: {
                buyerId: String(userId),
                orderNumbers: orders.map((order) => order.orderNumber).join(","),
            },
        });

        await PaymentModel.saveMany(
            orders.map((order) => ({
                orderId: order.id,
                razorpayOrderId: razorpayOrder.id,
                amount: order.total,
                currency: RAZORPAY_CURRENCY,
            }))
        );

        return {
            provider: "razorpay",
            razorpayOrderId: razorpayOrder.id,
            keyId: getRazorpayKeyId(),
            amount,
            amountInPaise: toPaise(amount),
            currency: RAZORPAY_CURRENCY,
        };
    },

    async verify({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        userId,
    }: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        userId: number;
    }) {
        assertConfigured();

        if (!safeCompare(signCheckout(razorpayOrderId, razorpayPaymentId), razorpaySignature)) {
            await settle({ razorpayOrderId, outcome: "fail", userId });
            throw new AppError("Payment verification failed", STATUS_CODES.BAD_REQUEST);
        }

        const result = await settle({
            razorpayOrderId,
            outcome: "confirm",
            userId,
            razorpayPaymentId,
            razorpaySignature,
        });
        if (!result.found) {
            throw new AppError("Payment not found", STATUS_CODES.NOT_FOUND);
        }
        if (result.status !== "succeeded") {
            throw new AppError(
                "This payment could no longer be confirmed",
                STATUS_CODES.CONFLICT
            );
        }

        return {
            razorpayOrderId,
            status: "succeeded" as const,
            orderIds: result.orderIds,
        };
    },

    async fail({ razorpayOrderId, userId }: { razorpayOrderId: string; userId: number }) {
        const result = await settle({ razorpayOrderId, outcome: "fail", userId });
        if (!result.found) {
            throw new AppError("Payment not found", STATUS_CODES.NOT_FOUND);
        }
        if (result.status === "succeeded") {
            throw new AppError("This payment has already succeeded", STATUS_CODES.CONFLICT);
        }

        return { razorpayOrderId, status: "failed" as const };
    },

    async handleWebhook(rawBody: Buffer, signature: string | undefined) {
        const webhookSecret = getRazorpayWebhookSecret();
        if (!webhookSecret) {
            throw new AppError("Webhooks are not configured", STATUS_CODES.SERVICE_UNAVAILABLE);
        }
        const expected = createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");
        if (!signature || !safeCompare(expected, signature)) {
            throw new AppError("Invalid webhook signature", STATUS_CODES.BAD_REQUEST);
        }

        const event = JSON.parse(rawBody.toString("utf8"));
        const payment = event?.payload?.payment?.entity;
        const razorpayOrderId: string | undefined = payment?.order_id;
        if (!razorpayOrderId) return { handled: false };

        if (event.event === "payment.captured") {
            const result = await settle({
                razorpayOrderId,
                outcome: "confirm",
                razorpayPaymentId: payment.id,
            });
            return { handled: result.found, event: event.event };
        }

        if (event.event === "payment.failed") {
            const result = await settle({
                razorpayOrderId,
                outcome: "fail",
                razorpayPaymentId: payment.id,
            });
            return { handled: result.found, event: event.event };
        }

        return { handled: false, event: event.event };
    },
};

export default PaymentService;
