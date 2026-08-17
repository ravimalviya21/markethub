ALTER TABLE payment_records
    DROP INDEX uq_stripe_payment_intent,
    CHANGE COLUMN stripePaymentIntentId razorpayOrderId VARCHAR(255) NOT NULL,
    ADD COLUMN provider VARCHAR(32) NOT NULL DEFAULT 'razorpay' AFTER orderId,
    ADD COLUMN razorpayPaymentId VARCHAR(255) NULL AFTER razorpayOrderId,
    ADD COLUMN razorpaySignature VARCHAR(255) NULL AFTER razorpayPaymentId,
    MODIFY COLUMN currency CHAR(3) NOT NULL DEFAULT 'INR',
    ADD UNIQUE KEY uq_payment_order (orderId),
    ADD INDEX idx_razorpay_order (razorpayOrderId);
