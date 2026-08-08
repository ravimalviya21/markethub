import { ExecuteValues, ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { CategoryRow } from "../types/models";

interface SaveInput {
    parentId?: number | null;
    displayName: string;
    imageUrl?: string | null;
    isActive: boolean;
    userId: number;
}

interface UpdateInput {
    id: number | string;
    displayName?: string;
    isActive?: boolean;
    userId: number;
}

const CategoryModel = {
    async save({ parentId, displayName, imageUrl, isActive, userId }: SaveInput): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO
            categories (parentId,
            displayName,
            imageUrl,
            isActive,
            createdBy,
            updatedBy)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [parentId ?? null, displayName, imageUrl ?? null, isActive, userId, userId]
        );
        return result.insertId;
    },
    async update({ id, displayName, isActive, userId }: UpdateInput): Promise<number> {
        const fields: string[] = [];
        const values: ExecuteValues[] = [];
        if (displayName !== undefined) {
            fields.push("displayName = ?");
            values.push(displayName);
        }
        if (isActive !== undefined) {
            fields.push("isActive = ?");
            values.push(isActive);
        }
        fields.push("updatedBy = ?");
        values.push(userId);
        values.push(id);

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE categories
            SET ${fields.join(", ")}
            WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },
    async findById(id: number | string): Promise<CategoryRow | null> {
        const [rows] = await pool.execute<(CategoryRow & RowDataPacket)[]>(
            `SELECT * from categories
            WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },
    async find(): Promise<CategoryRow[]> {
        const [rows] = await pool.execute<(CategoryRow & RowDataPacket)[]>(`
            SELECT * from categories`);
        return rows;
    },
    async findSubtreeIds(id: number | string): Promise<number[]> {
        const [rows] = await pool.query<(RowDataPacket & { id: number })[]>(
            `WITH RECURSIVE subtree (id) AS (
                SELECT id FROM categories WHERE id = ?
                UNION ALL
                SELECT c.id FROM categories c
                INNER JOIN subtree s ON c.parentId = s.id
            )
            SELECT id FROM subtree`,
            [id]
        );
        return rows.map((row) => row.id);
    },
    async findByParentId({ id }: { id: number | string }): Promise<CategoryRow[]> {
        const [rows] = await pool.execute<(CategoryRow & RowDataPacket)[]>(
            `SELECT * from categories
            WHERE parentId = ?`,
            [id]
        );
        return rows;
    },
};

export default CategoryModel;
