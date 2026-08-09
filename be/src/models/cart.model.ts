import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../config/db";
import { CartItemRow, ProductStatus } from "../types/models";

export interface CartItemDetail {
    id: number;
    productId: number;
    quantity: number;
    name: string;
    slug: string;
    price: number;
    mrp: number | null;
    stock: number;
    status: ProductStatus;
    sellerId: number;
    sellerName: string | null;
    primaryImageUrl: string | null;
}

const CART_SELECT = `SELECT ci.id, ci.productId, ci.quantity,
    p.name, p.slug, p.price, p.mrp, p.stock, p.status, p.sellerId,
    u.name AS sellerName,
    (SELECT pi.url
        FROM product_images pi
        WHERE pi.productId = p.id
        ORDER BY pi.sortOrder ASC, pi.id ASC
        LIMIT 1) AS primaryImageUrl
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.productId
    LEFT JOIN users u ON u.id = p.sellerId`;

const normalizeItem = (row: CartItemDetail): CartItemDetail => ({
    ...row,
    price: Number(row.price),
    mrp: row.mrp == null ? null : Number(row.mrp),
});

const CartModel = {
    async findByUserId(userId: number): Promise<CartItemDetail[]> {
        const [rows] = await pool.execute<(CartItemDetail & RowDataPacket)[]>(
            `${CART_SELECT}
            WHERE ci.userId = ?
            ORDER BY ci.createdAt DESC, ci.id DESC`,
            [userId]
        );
        return rows.map(normalizeItem);
    },

    async findItem(userId: number, productId: number): Promise<CartItemRow | null> {
        const [rows] = await pool.execute<(CartItemRow & RowDataPacket)[]>(
            `SELECT * FROM cart_items WHERE userId = ? AND productId = ?`,
            [userId, productId]
        );
        return rows[0] || null;
    },

    async setQuantity({
        userId,
        productId,
        quantity,
    }: {
        userId: number;
        productId: number;
        quantity: number;
    }): Promise<void> {
        await pool.execute<ResultSetHeader>(
            `INSERT INTO cart_items (userId, productId, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = ?`,
            [userId, productId, quantity, quantity]
        );
    },

    async remove(userId: number, productId: number): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `DELETE FROM cart_items WHERE userId = ? AND productId = ?`,
            [userId, productId]
        );
        return result.affectedRows;
    },

    async removeMany(userId: number, productIds: number[]): Promise<number> {
        if (!productIds.length) return 0;
        const placeholders = productIds.map(() => "?").join(", ");
        const [result] = await pool.query<ResultSetHeader>(
            `DELETE FROM cart_items WHERE userId = ? AND productId IN (${placeholders})`,
            [userId, ...productIds]
        );
        return result.affectedRows;
    },

    async clear(userId: number): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `DELETE FROM cart_items WHERE userId = ?`,
            [userId]
        );
        return result.affectedRows;
    },
};

export default CartModel;
