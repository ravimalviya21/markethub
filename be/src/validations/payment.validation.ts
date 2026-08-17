import { z } from "zod";

export const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string().trim().min(1).max(255),
    razorpayPaymentId: z.string().trim().min(1).max(255),
    razorpaySignature: z.string().trim().min(1).max(255),
});

export const failPaymentSchema = z.object({
    razorpayOrderId: z.string().trim().min(1).max(255),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type FailPaymentInput = z.infer<typeof failPaymentSchema>;
