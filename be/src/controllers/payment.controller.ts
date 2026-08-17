import asyncHandler from "../utils/asyncHandler";
import STATUS_CODES from "../contants/statusCode";
import PaymentService from "../services/payment.service";
import { isRazorpayConfigured } from "../config/razorpay";
import { AuthUser } from "../types/models";

const PaymentController = {
    config: asyncHandler(async (_req, res) => {
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: { provider: "razorpay", enabled: isRazorpayConfigured() },
        });
    }),

    verify: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const result = await PaymentService.verify({
            razorpayOrderId: req.body.razorpayOrderId,
            razorpayPaymentId: req.body.razorpayPaymentId,
            razorpaySignature: req.body.razorpaySignature,
            userId: user.id,
        });
        res.status(STATUS_CODES.OK).json({ success: true, data: result });
    }),

    fail: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const result = await PaymentService.fail({
            razorpayOrderId: req.body.razorpayOrderId,
            userId: user.id,
        });
        res.status(STATUS_CODES.OK).json({ success: true, data: result });
    }),

    webhook: asyncHandler(async (req, res) => {
        const signature = req.headers["x-razorpay-signature"];
        const result = await PaymentService.handleWebhook(
            req.body as Buffer,
            typeof signature === "string" ? signature : undefined
        );
        res.status(STATUS_CODES.OK).json({ success: true, data: result });
    }),
};

export default PaymentController;
