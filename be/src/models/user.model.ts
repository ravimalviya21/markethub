import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { UserRole, UserRow } from "../types/models";

interface CreateInput {
    email: string;
    name: string;
    hashedPassword: string;
    role?: UserRole;
}

interface UpdatePasswordInput {
    hashedPassword: string;
    id: number | string;
}

const UserModel = {
    async findByEmail(email: string): Promise<UserRow | null> {
        const [rows] = await pool.execute<(UserRow & RowDataPacket)[]>(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
        return rows[0] || null;
    },

    async findById(id: number | string): Promise<UserRow | null> {
        const [rows] = await pool.execute<(UserRow & RowDataPacket)[]>(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    async create({ email, name, hashedPassword, role = "buyer" }: CreateInput): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)`,
            [email, name, hashedPassword, role]
        );
        return result.insertId;
    },

    async updatePassword({ hashedPassword, id }: UpdatePasswordInput): Promise<number> {
        console.log("checkPass", hashedPassword, id);
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, id]
        );
        return result.affectedRows;
    },

    async markVerified(id: number | string): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE users SET isEmailVerified = TRUE WHERE id = ?`,
            [id]
        );
        return result.affectedRows;
    },
};

export default UserModel;
