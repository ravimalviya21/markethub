import { Router } from "express";
import PaymentController from "../../controllers/payment.controller";
import validate from "../../middleware/validate";
import authenticate from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import { failPaymentSchema, verifyPaymentSchema } from "../../validations/payment.validation";

const route = Router();

route.post("/payment/webhook", PaymentController.webhook);

route.get("/payment/config", PaymentController.config);

route.post(
    "/payment/verify",
    authenticate,
    authorize("buyer"),
    validate(verifyPaymentSchema),
    PaymentController.verify
);

route.post(
    "/payment/failed",
    authenticate,
    authorize("buyer"),
    validate(failPaymentSchema),
    PaymentController.fail
);

export default route;
