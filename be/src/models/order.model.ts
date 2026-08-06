import { ExecuteValues, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../config/db";
import STATUS_CODES from "../contants/statusCode";
import { AppError } from "../utils/errors";
import {
    OrderItemRow,
    OrderRow,
    OrderStatus,
    OrderStatusHistoryRow,
    ShippingAddress,
} from "../types/models";

export interface NewOrderItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface NewOrder {
    orderNumber: string;
    buyerId: number;
    sellerId: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingAddress: ShippingAddress;
    items: NewOrderItem[];
}

export interface ListFilters {
    page: number;
    limit: number;
    q?: string;
    status?: OrderStatus;
    buyerId?: number;
    sellerId?: number;
    sortBy: "createdAt" | "total" | "status";
    sortOrder: "asc" | "desc";
}

export interface OrderListItem extends OrderRow {
    buyerName: string | null;
    sellerName: string | null;
    itemsCount: number;
}

export interface OrderDetail extends OrderListItem {
    items: OrderItemRow[];
    statusHistory: OrderStatusHistoryRow[];
}

const SORT_COLUMNS: Record<ListFilters["sortBy"], string> = {
    createdAt: "o.createdAt",
    total: "o.total",
    status: "o.status",
};

const normalizeOrder = <T extends OrderRow>(row: T): T => ({
    ...row,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shippingCost),
    tax: Number(row.tax),
    total: Number(row.total),
    shippingAddress:
        typeof row.shippingAddress === "string"
            ? (JSON.parse(row.shippingAddress) as ShippingAddress)
            : row.shippingAddress,
});

const normalizeItem = (row: OrderItemRow): OrderItemRow => ({
    ...row,
    unitPrice: Number(row.unitPrice),
});

const reserveStock = async (conn: PoolConnection, item: NewOrderItem) => {
    const [result] = await conn.execute<ResultSetHeader>(
        `UPDATE products
        SET stock = stock - ?
        WHERE id = ? AND stock >= ? AND status = 'approved'`,
        [item.quantity, item.productId, item.quantity]
    );
    if (result.affectedRows === 0) {
        throw new AppError(
            `${item.productName} is no longer available in the requested quantity`,
            STATUS_CODES.CONFLICT
        );
    }
};

const insertItems = async (conn: PoolConnection, orderId: number, items: NewOrderItem[]) => {
    const values = items.flatMap((item) => [
        orderId,
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
    ]);
    const placeholders = items.map(() => "(?, ?, ?, ?, ?)").join(", ");
    await conn.query(
        `INSERT INTO order_items (orderId, productId, productName, quantity, unitPrice)
         VALUES ${placeholders}`,
        values
    );
};

const insertStatusHistory = async (
    conn: PoolConnection,
    orderId: number,
    status: OrderStatus,
    userId: number | null
) => {
    await conn.execute(
        `INSERT INTO order_status_history (orderId, status, updatedBy) VALUES (?, ?, ?)`,
        [orderId, status, userId]
    );
};

const buildFilters = (filters: ListFilters) => {
    const conditions: string[] = [];
    const values: ExecuteValues[] = [];

    if (filters.status) {
        conditions.push("o.status = ?");
        values.push(filters.status);
    }
    if (filters.buyerId) {
        conditions.push("o.buyerId = ?");
        values.push(filters.buyerId);
    }
    if (filters.sellerId) {
        conditions.push("o.sellerId = ?");
        values.push(filters.sellerId);
    }
    if (filters.q) {
        conditions.push("o.orderNumber LIKE ?");
        values.push(`%${filters.q}%`);
    }

    return {
        where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        values,
    };
};

const OrderModel = {
    async saveMany(orders: NewOrder[], userId: number): Promise<{ id: number; orderNumber: string }[]> {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const created: { id: number; orderNumber: string }[] = [];

            for (const order of orders) {
                const [result] = await conn.execute<ResultSetHeader>(
                    `INSERT INTO
                    orders (orderNumber,
                    buyerId,
                    sellerId,
                    status,
                    subtotal,
                    shippingCost,
                    tax,
                    total,
                    shippingAddress)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        order.orderNumber,
                        order.buyerId,
                        order.sellerId,
                        "pending",
                        order.subtotal,
                        order.shippingCost,
                        order.tax,
                        order.total,
                        JSON.stringify(order.shippingAddress),
                    ]
                );
                const orderId = result.insertId;

                for (const item of order.items) await reserveStock(conn, item);
                await insertItems(conn, orderId, order.items);
                await insertStatusHistory(conn, orderId, "pending", userId);

                created.push({ id: orderId, orderNumber: order.orderNumber });
            }

            await conn.commit();
            return created;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    async updateStatus({
        id,
        status,
        userId,
        restoreStock = false,
    }: {
        id: number;
        status: OrderStatus;
        userId: number;
        restoreStock?: boolean;
    }): Promise<number> {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [result] = await conn.execute<ResultSetHeader>(
                `UPDATE orders SET status = ? WHERE id = ?`,
                [status, id]
            );
            if (result.affectedRows > 0) {
                if (restoreStock) {
                    await conn.execute(
                        `UPDATE products p
                        JOIN order_items oi ON oi.productId = p.id
                        SET p.stock = p.stock + oi.quantity
                        WHERE oi.orderId = ?`,
                        [id]
                    );
                }
                await insertStatusHistory(conn, id, status, userId);
            }
            await conn.commit();
            return result.affectedRows;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    async findById(id: number): Promise<OrderRow | null> {
        const [rows] = await pool.execute<(OrderRow & RowDataPacket)[]>(
            `SELECT * FROM orders WHERE id = ?`,
            [id]
        );
        return rows[0] ? normalizeOrder(rows[0]) : null;
    },

    async findDetailById(id: number): Promise<OrderDetail | null> {
        const [rows] = await pool.execute<(OrderListItem & RowDataPacket)[]>(
            `SELECT o.*,
                b.name AS buyerName,
                s.name AS sellerName,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.orderId = o.id) AS itemsCount
            FROM orders o
            LEFT JOIN users b ON b.id = o.buyerId
            LEFT JOIN users s ON s.id = o.sellerId
            WHERE o.id = ?`,
            [id]
        );
        if (!rows[0]) return null;

        const [items, statusHistory] = await Promise.all([
            OrderModel.findItemsByOrderId(id),
            OrderModel.findStatusHistoryByOrderId(id),
        ]);

        return {
            ...normalizeOrder(rows[0]),
            itemsCount: Number(rows[0].itemsCount ?? 0),
            items,
            statusHistory,
        };
    },

    async findItemsByOrderId(orderId: number): Promise<OrderItemRow[]> {
        const [rows] = await pool.execute<(OrderItemRow & RowDataPacket)[]>(
            `SELECT * FROM order_items WHERE orderId = ? ORDER BY id ASC`,
            [orderId]
        );
        return rows.map(normalizeItem);
    },

    async findStatusHistoryByOrderId(orderId: number): Promise<OrderStatusHistoryRow[]> {
        const [rows] = await pool.execute<(OrderStatusHistoryRow & RowDataPacket)[]>(
            `SELECT * FROM order_status_history
            WHERE orderId = ?
            ORDER BY createdAt ASC, id ASC`,
            [orderId]
        );
        return rows;
    },

    async find(filters: ListFilters): Promise<{ items: OrderListItem[]; total: number }> {
        const { where, values } = buildFilters(filters);
        const offset = (filters.page - 1) * filters.limit;
        const orderBy = `${SORT_COLUMNS[filters.sortBy]} ${filters.sortOrder === "asc" ? "ASC" : "DESC"}`;

        const [countRows] = await pool.query<(RowDataPacket & { total: number })[]>(
            `SELECT COUNT(*) AS total FROM orders o ${where}`,
            values
        );

        const [rows] = await pool.query<(OrderListItem & RowDataPacket)[]>(
            `SELECT o.*,
                b.name AS buyerName,
                s.name AS sellerName,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.orderId = o.id) AS itemsCount
            FROM orders o
            LEFT JOIN users b ON b.id = o.buyerId
            LEFT JOIN users s ON s.id = o.sellerId
            ${where}
            ORDER BY ${orderBy}, o.id DESC
            LIMIT ${filters.limit} OFFSET ${offset}`,
            values
        );

        return {
            items: rows.map((row) => ({
                ...normalizeOrder(row),
                itemsCount: Number(row.itemsCount ?? 0),
            })),
            total: Number(countRows[0]?.total ?? 0),
        };
    },

    async orderNumberExists(orderNumber: string): Promise<boolean> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT id FROM orders WHERE orderNumber = ? LIMIT 1`,
            [orderNumber]
        );
        return rows.length > 0;
    },
};

export default OrderModel;
