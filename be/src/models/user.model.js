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
            `INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)`,
            [email, name, hashedPassword, role]
        );
        return result.insertId;
    },

    async updatePassword({ hashedPassword, id }) {
        console.log("checkPass", hashedPassword, id)
        const [result] = await pool.execute(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, id]
        );
        return result.affectedRows;
    },

    async markVerified(id) {
        const [result] = await pool.execute(
            `UPDATE users SET isEmailVerified = TRUE WHERE id = ?`,
            [id]
        );
        return result.affectedRows;
    }
};

module.exports = UserModel;