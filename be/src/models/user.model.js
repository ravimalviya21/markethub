const pool = require("../config/db");

const UserModel = {
    async findByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    async create({ email, name, hashedPassword, role = 'buyer' }) {
        const [result] = await pool.execute(
            `INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)`,
            [email, name, hashedPassword, role]
        );
        return result.insertId;
    },

    async updatePassword({ hashedPassword, id }) {
        const [result] = await pool.execute(
            `UPDATE users SET password_hash = ? WHERE id = ?`,
            [hashedPassword, id]
        );
        return result.affectedRows;
    },

    async markVerified(id) {
        const [result] = await pool.execute(
            `UPDATE users SET email_verified = TRUE WHERE id = ?`,
            [id]
        );
        return result.affectedRows;
    }
};

module.exports = UserModel;