import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { VerificationTokenRow } from "../types/models";

interface SaveInput {
    userId: number;
    token: string;
    type: string;
    expiresAt: Date;
}

interface FindInput {
    token: string;
    type: string;
}

const TokenModel = {
    async save({ userId, token, type, expiresAt }: SaveInput): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO verification_tokens (user_id, token, type, expiresAt)
             VALUES (?, ?, ?, ?)`,
            [userId, token, type, expiresAt]
        );
        return result.insertId;
    },
    async find({ token, type }: FindInput): Promise<VerificationTokenRow | null> {
        const [rows] = await pool.execute<(VerificationTokenRow & RowDataPacket)[]>(
            `SELECT * FROM verification_tokens
             WHERE token = ? AND type = ? AND used = FALSE AND expiresAt > NOW()
             LIMIT 1`,
            [token, type]
        );
        return rows[0] || null;
    },
    async markUsed(token: string): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE verification_tokens SET used = TRUE WHERE token = ?`,
            [token]
        );
        return result.affectedRows;
    },
    async revokeAll(userId: number, type: string): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE verification_tokens SET used = TRUE
             WHERE user_id = ? AND type = ? AND used = FALSE`,
            [userId, type]
        );
        return result.affectedRows;
    },
};

export default TokenModel;
