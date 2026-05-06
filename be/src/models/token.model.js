const pool = require('../config/db');

const TokenModel = {
    async save({ userId, token, type, expiresAt }) {
        const [result] = await pool.execute(
            `INSERT INTO verification_tokens (user_id, token, type, expiresAt)
             VALUES (?, ?, ?, ?)`,
            [userId, token, type, expiresAt]
        );
        return result.insertId;
    },
    async find({ token, type }) {
        const [rows] = await pool.execute(
            `SELECT * FROM verification_tokens
             WHERE token = ? AND type = ? AND used = FALSE AND expiresAt > NOW()
             LIMIT 1`,
            [token, type]
        );
        return rows[0] || null;
    },
    async markUsed(token) {
        const [result] = await pool.execute(
            `UPDATE verification_tokens SET used = TRUE WHERE token = ?`,
            [token]
        );
        return result.affectedRows;
    },
    async revokeAll(userId, type) {
        const [result] = await pool.execute(
            `UPDATE verification_tokens SET used = TRUE
             WHERE user_id = ? AND type = ? AND used = FALSE`,
            [userId, type]
        );
        return result.affectedRows;
    }
};

module.exports = TokenModel;