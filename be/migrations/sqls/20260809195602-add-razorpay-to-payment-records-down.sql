ALTER TABLE payment_records
    DROP INDEX idx_razorpay_order,
    DROP INDEX uq_payment_order,
    DROP COLUMN razorpaySignature,
    DROP COLUMN razorpayPaymentId,
    DROP COLUMN provider,
    CHANGE COLUMN razorpayOrderId stripePaymentIntentId VARCHAR(255) NOT NULL,
    MODIFY COLUMN currency CHAR(3) NOT NULL DEFAULT 'usd',
    ADD UNIQUE KEY uq_stripe_payment_intent (stripePaymentIntentId);
