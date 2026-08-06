import { ExecuteValues, ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { UserRole, UserRow } from "../types/models";

export type PublicUser = Omit<UserRow, "password" | "updated_at">;

interface ListInput {
    role?: UserRole;
    q?: string;
    page: number;
    limit: number;
}

interface CreateInput {
    email: string;
    name: string;
    hashedPassword: string;
    role?: UserRole;
    isEmailVerified?: boolean;
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

    async create({
        email,
        name,
        hashedPassword,
        role = "buyer",
        isEmailVerified = false,
    }: CreateInput): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO users (email, name, password, role, isEmailVerified) VALUES (?, ?, ?, ?, ?)`,
            [email, name, hashedPassword, role, isEmailVerified]
        );
        return result.insertId;
    },

    async find({ role, q, page, limit }: ListInput): Promise<{ items: PublicUser[]; total: number }> {
        const conditions: string[] = [];
        const values: ExecuteValues[] = [];
        if (role) {
            conditions.push("role = ?");
            values.push(role);
        }
        if (q) {
            conditions.push("(name LIKE ? OR email LIKE ?)");
            values.push(`%${q}%`, `%${q}%`);
        }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const offset = (page - 1) * limit;

        const [countRows] = await pool.query<(RowDataPacket & { total: number })[]>(
            `SELECT COUNT(*) AS total FROM users ${where}`,
            values
        );
        const [rows] = await pool.query<(PublicUser & RowDataPacket)[]>(
            `SELECT id, name, email, role, isEmailVerified, created_at
            FROM users
            ${where}
            ORDER BY name ASC
            LIMIT ${limit} OFFSET ${offset}`,
            values
        );

        return { items: rows, total: Number(countRows[0]?.total ?? 0) };
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
