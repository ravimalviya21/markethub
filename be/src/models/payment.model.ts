import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../config/db";
import { PaymentRecordRow, PaymentStatus } from "../types/models";

interface NewPaymentRecord {
    orderId: number;
    razorpayOrderId: string;
    amount: number;
    currency: string;
}

const normalize = (row: PaymentRecordRow): PaymentRecordRow => ({
    ...row,
    amount: Number(row.amount),
});

const PaymentModel = {
    async saveMany(records: NewPaymentRecord[]): Promise<number> {
        if (!records.length) return 0;
        const values = records.flatMap((record) => [
            record.orderId,
            "razorpay",
            record.razorpayOrderId,
            record.amount,
            record.currency,
            "pending",
        ]);
        const placeholders = records.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO payment_records
            (orderId, provider, razorpayOrderId, amount, currency, status)
            VALUES ${placeholders}
            ON DUPLICATE KEY UPDATE
                razorpayOrderId = VALUES(razorpayOrderId),
                amount = VALUES(amount),
                status = 'pending'`,
            values
        );
        return result.affectedRows;
    },

    async findByRazorpayOrderId(razorpayOrderId: string): Promise<PaymentRecordRow[]> {
        const [rows] = await pool.execute<(PaymentRecordRow & RowDataPacket)[]>(
            `SELECT * FROM payment_records WHERE razorpayOrderId = ?`,
            [razorpayOrderId]
        );
        return rows.map(normalize);
    },

    async lockByRazorpayOrderId(
        conn: PoolConnection,
        razorpayOrderId: string
    ): Promise<PaymentRecordRow[]> {
        const [rows] = await conn.execute<(PaymentRecordRow & RowDataPacket)[]>(
            `SELECT * FROM payment_records WHERE razorpayOrderId = ? FOR UPDATE`,
            [razorpayOrderId]
        );
        return rows.map(normalize);
    },

    async findByOrderId(orderId: number): Promise<PaymentRecordRow | null> {
        const [rows] = await pool.execute<(PaymentRecordRow & RowDataPacket)[]>(
            `SELECT * FROM payment_records WHERE orderId = ?`,
            [orderId]
        );
        return rows[0] ? normalize(rows[0]) : null;
    },

    async markStatus(
        {
            razorpayOrderId,
            status,
            razorpayPaymentId,
            razorpaySignature,
        }: {
            razorpayOrderId: string;
            status: PaymentStatus;
            razorpayPaymentId?: string | null;
            razorpaySignature?: string | null;
        },
        conn?: PoolConnection
    ): Promise<number> {
        const executor = conn ?? pool;
        const [result] = await executor.execute<ResultSetHeader>(
            `UPDATE payment_records
            SET status = ?,
                razorpayPaymentId = COALESCE(?, razorpayPaymentId),
                razorpaySignature = COALESCE(?, razorpaySignature)
            WHERE razorpayOrderId = ?`,
            [status, razorpayPaymentId ?? null, razorpaySignature ?? null, razorpayOrderId]
        );
        return result.affectedRows;
    },
};

export default PaymentModel;
