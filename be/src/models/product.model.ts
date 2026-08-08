import { ExecuteValues, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../config/db";
import { ProductImageRow, ProductRow, ProductStatus } from "../types/models";
import { ProductImageInput } from "../validations/product.validation";

interface SaveInput {
    name: string;
    slug: string;
    sellerId: number;
    categoryId?: number | null;
    description?: string | null;
    price: number;
    mrp?: number | null;
    stock: number;
    status: ProductStatus;
    images?: ProductImageInput[];
    userId: number;
}

interface UpdateInput {
    id: number;
    name?: string;
    categoryId?: number | null;
    description?: string | null;
    price?: number;
    mrp?: number | null;
    stock?: number;
    images?: ProductImageInput[];
    userId: number;
}

export interface FeedFilters {
    limit: number;
    categoryIds?: number[];
    days?: number;
    excludeIds?: number[];
}

export interface ListFilters {
    page: number;
    limit: number;
    q?: string;
    status?: ProductStatus;
    categoryIds?: number[];
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy: "createdAt" | "price" | "name" | "averageRating";
    sortOrder: "asc" | "desc";
    visibleStatuses?: ProductStatus[];
    ownSellerId?: number;
}

export interface ProductListItem extends ProductRow {
    categoryName: string | null;
    sellerName: string | null;
    primaryImageUrl: string | null;
}

const SORT_COLUMNS: Record<ListFilters["sortBy"], string> = {
    createdAt: "p.createdAt",
    price: "p.price",
    name: "p.name",
    averageRating: "p.averageRating",
};

const normalizeProduct = <T extends ProductRow>(row: T): T => ({
    ...row,
    price: Number(row.price),
    mrp: row.mrp == null ? null : Number(row.mrp),
    averageRating: Number(row.averageRating),
});

const FEED_SELECT = `SELECT p.*,
    c.displayName AS categoryName,
    u.name AS sellerName,
    (SELECT pi.url
        FROM product_images pi
        WHERE pi.productId = p.id
        ORDER BY pi.sortOrder ASC, pi.id ASC
        LIMIT 1) AS primaryImageUrl`;

const FEED_JOINS = `LEFT JOIN categories c ON c.id = p.categoryId
    LEFT JOIN users u ON u.id = p.sellerId`;

const BAYESIAN_MINIMUM_REVIEWS = 5;
const FALLBACK_MEAN_RATING = 3.5;

const buildFeedFilters = ({ categoryIds, excludeIds }: FeedFilters) => {
    const conditions = ["p.status = 'approved'", "p.stock > 0"];
    const values: ExecuteValues[] = [];

    if (categoryIds?.length) {
        conditions.push(`p.categoryId IN (${categoryIds.map(() => "?").join(", ")})`);
        values.push(...categoryIds);
    }
    if (excludeIds?.length) {
        conditions.push(`p.id NOT IN (${excludeIds.map(() => "?").join(", ")})`);
        values.push(...excludeIds);
    }

    return { where: conditions.join(" AND "), values };
};

const insertImages = async (
    conn: PoolConnection,
    productId: number,
    images: ProductImageInput[]
) => {
    if (!images.length) return;
    const values = images.flatMap((image, index) => [
        productId,
        image.url,
        image.thumbnailUrl ?? null,
        image.altText ?? null,
        image.sortOrder ?? index,
    ]);
    const placeholders = images.map(() => "(?, ?, ?, ?, ?)").join(", ");
    await conn.query(
        `INSERT INTO product_images (productId, url, thumbnailUrl, altText, sortOrder)
         VALUES ${placeholders}`,
        values
    );
};

const buildFilters = (filters: ListFilters) => {
    const conditions: string[] = [];
    const values: ExecuteValues[] = [];

    if (filters.visibleStatuses?.length) {
        const placeholders = filters.visibleStatuses.map(() => "?").join(", ");
        if (filters.ownSellerId) {
            conditions.push(`(p.status IN (${placeholders}) OR p.sellerId = ?)`);
            values.push(...filters.visibleStatuses, filters.ownSellerId);
        } else {
            conditions.push(`p.status IN (${placeholders})`);
            values.push(...filters.visibleStatuses);
        }
    }
    if (filters.status) {
        conditions.push("p.status = ?");
        values.push(filters.status);
    }
    if (filters.categoryIds?.length) {
        conditions.push(`p.categoryId IN (${filters.categoryIds.map(() => "?").join(", ")})`);
        values.push(...filters.categoryIds);
    }
    if (filters.sellerId) {
        conditions.push("p.sellerId = ?");
        values.push(filters.sellerId);
    }
    if (filters.minPrice != null) {
        conditions.push("p.price >= ?");
        values.push(filters.minPrice);
    }
    if (filters.maxPrice != null) {
        conditions.push("p.price <= ?");
        values.push(filters.maxPrice);
    }
    if (filters.q) {
        conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
        values.push(`%${filters.q}%`, `%${filters.q}%`);
    }

    return {
        where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        values,
    };
};

const ProductModel = {
    async save({
        name,
        slug,
        sellerId,
        categoryId,
        description,
        price,
        mrp,
        stock,
        status,
        images,
        userId,
    }: SaveInput): Promise<number> {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [result] = await conn.execute<ResultSetHeader>(
                `INSERT INTO
                products (name,
                slug,
                sellerId,
                categoryId,
                description,
                price,
                mrp,
                stock,
                status,
                createdBy,
                updatedBy)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    slug,
                    sellerId,
                    categoryId ?? null,
                    description ?? null,
                    price,
                    mrp ?? null,
                    stock,
                    status,
                    userId,
                    userId,
                ]
            );
            const productId = result.insertId;
            if (images?.length) await insertImages(conn, productId, images);
            await conn.commit();
            return productId;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    async update({
        id,
        name,
        categoryId,
        description,
        price,
        mrp,
        stock,
        images,
        userId,
    }: UpdateInput): Promise<number> {
        const fields: string[] = [];
        const values: ExecuteValues[] = [];
        if (name !== undefined) {
            fields.push("name = ?");
            values.push(name);
        }
        if (categoryId !== undefined) {
            fields.push("categoryId = ?");
            values.push(categoryId);
        }
        if (description !== undefined) {
            fields.push("description = ?");
            values.push(description);
        }
        if (price !== undefined) {
            fields.push("price = ?");
            values.push(price);
        }
        if (mrp !== undefined) {
            fields.push("mrp = ?");
            values.push(mrp);
        }
        if (stock !== undefined) {
            fields.push("stock = ?");
            values.push(stock);
        }
        fields.push("updatedBy = ?");
        values.push(userId, id);

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [result] = await conn.execute<ResultSetHeader>(
                `UPDATE products
                SET ${fields.join(", ")}
                WHERE id = ?`,
                values
            );
            if (images) {
                await conn.execute(`DELETE FROM product_images WHERE productId = ?`, [id]);
                await insertImages(conn, id, images);
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

    async updateStatus({
        id,
        status,
        userId,
    }: {
        id: number;
        status: ProductStatus;
        userId: number;
    }): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE products
            SET status = ?, updatedBy = ?
            WHERE id = ?`,
            [status, userId, id]
        );
        return result.affectedRows;
    },

    async findById(id: number): Promise<ProductRow | null> {
        const [rows] = await pool.execute<(ProductRow & RowDataPacket)[]>(
            `SELECT * FROM products WHERE id = ?`,
            [id]
        );
        return rows[0] ? normalizeProduct(rows[0]) : null;
    },

    async findByIds(ids: number[]): Promise<ProductRow[]> {
        if (!ids.length) return [];
        const placeholders = ids.map(() => "?").join(", ");
        const [rows] = await pool.query<(ProductRow & RowDataPacket)[]>(
            `SELECT * FROM products WHERE id IN (${placeholders})`,
            ids
        );
        return rows.map(normalizeProduct);
    },

    async findDetailById(id: number): Promise<(ProductListItem & { images: ProductImageRow[] }) | null> {
        const [rows] = await pool.execute<(ProductListItem & RowDataPacket)[]>(
            `SELECT p.*,
                c.displayName AS categoryName,
                u.name AS sellerName,
                NULL AS primaryImageUrl
            FROM products p
            LEFT JOIN categories c ON c.id = p.categoryId
            LEFT JOIN users u ON u.id = p.sellerId
            WHERE p.id = ?`,
            [id]
        );
        if (!rows[0]) return null;

        const images = await ProductModel.findImagesByProductId(id);
        return {
            ...normalizeProduct(rows[0]),
            primaryImageUrl: images[0]?.url ?? null,
            images,
        };
    },

    async findImagesByProductId(productId: number): Promise<ProductImageRow[]> {
        const [rows] = await pool.execute<(ProductImageRow & RowDataPacket)[]>(
            `SELECT * FROM product_images
            WHERE productId = ?
            ORDER BY sortOrder ASC, id ASC`,
            [productId]
        );
        return rows;
    },

    async find(filters: ListFilters): Promise<{ items: ProductListItem[]; total: number }> {
        const { where, values } = buildFilters(filters);
        const offset = (filters.page - 1) * filters.limit;
        const orderBy = `${SORT_COLUMNS[filters.sortBy]} ${filters.sortOrder === "asc" ? "ASC" : "DESC"}`;

        const [countRows] = await pool.query<(RowDataPacket & { total: number })[]>(
            `SELECT COUNT(*) AS total FROM products p ${where}`,
            values
        );

        const [rows] = await pool.query<(ProductListItem & RowDataPacket)[]>(
            `SELECT p.*,
                c.displayName AS categoryName,
                u.name AS sellerName,
                (SELECT pi.url
                    FROM product_images pi
                    WHERE pi.productId = p.id
                    ORDER BY pi.sortOrder ASC, pi.id ASC
                    LIMIT 1) AS primaryImageUrl
            FROM products p
            LEFT JOIN categories c ON c.id = p.categoryId
            LEFT JOIN users u ON u.id = p.sellerId
            ${where}
            ORDER BY ${orderBy}, p.id DESC
            LIMIT ${filters.limit} OFFSET ${offset}`,
            values
        );

        return {
            items: rows.map(normalizeProduct),
            total: Number(countRows[0]?.total ?? 0),
        };
    },

    async findDeals(filters: FeedFilters): Promise<ProductListItem[]> {
        const { where, values } = buildFeedFilters(filters);
        const [rows] = await pool.query<(ProductListItem & RowDataPacket)[]>(
            `${FEED_SELECT}
            FROM products p
            ${FEED_JOINS}
            WHERE ${where} AND p.mrp IS NOT NULL AND p.mrp > p.price
            ORDER BY ((p.mrp - p.price) / p.mrp) DESC, p.reviewsCount DESC, p.id DESC
            LIMIT ${filters.limit}`,
            values
        );
        return rows.map(normalizeProduct);
    },

    async findTrending(filters: FeedFilters): Promise<ProductListItem[]> {
        const { where, values } = buildFeedFilters(filters);
        const [rows] = await pool.query<(ProductListItem & RowDataPacket)[]>(
            `${FEED_SELECT}, sold.unitsSold
            FROM (
                SELECT oi.productId, SUM(oi.quantity) AS unitsSold
                FROM order_items oi
                JOIN orders o ON o.id = oi.orderId
                WHERE o.createdAt >= (NOW() - INTERVAL ? DAY)
                    AND o.status <> 'cancelled'
                GROUP BY oi.productId
            ) sold
            JOIN products p ON p.id = sold.productId
            ${FEED_JOINS}
            WHERE ${where}
            ORDER BY sold.unitsSold DESC, p.averageRating DESC, p.id DESC
            LIMIT ${filters.limit}`,
            [filters.days ?? 7, ...values]
        );
        return rows.map(normalizeProduct);
    },

    async findPopular(filters: FeedFilters): Promise<ProductListItem[]> {
        const { where, values } = buildFeedFilters(filters);
        const [rows] = await pool.query<(ProductListItem & RowDataPacket)[]>(
            `${FEED_SELECT}
            FROM products p
            ${FEED_JOINS}
            CROSS JOIN (
                SELECT COALESCE(AVG(averageRating), ?) AS meanRating
                FROM products
                WHERE status = 'approved' AND reviewsCount > 0
            ) g
            WHERE ${where}
            ORDER BY (
                (p.reviewsCount / (p.reviewsCount + ?)) * p.averageRating
                + (? / (p.reviewsCount + ?)) * g.meanRating
            ) DESC, p.reviewsCount DESC, p.id DESC
            LIMIT ${filters.limit}`,
            [
                FALLBACK_MEAN_RATING,
                ...values,
                BAYESIAN_MINIMUM_REVIEWS,
                BAYESIAN_MINIMUM_REVIEWS,
                BAYESIAN_MINIMUM_REVIEWS,
            ]
        );
        return rows.map(normalizeProduct);
    },

    async findRecentWellRated(filters: FeedFilters): Promise<ProductListItem[]> {
        const { where, values } = buildFeedFilters(filters);
        const [rows] = await pool.query<(ProductListItem & RowDataPacket)[]>(
            `${FEED_SELECT}
            FROM products p
            ${FEED_JOINS}
            WHERE ${where}
            ORDER BY p.averageRating DESC, p.createdAt DESC, p.id DESC
            LIMIT ${filters.limit}`,
            values
        );
        return rows.map(normalizeProduct);
    },

    async slugExists(slug: string): Promise<boolean> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT id FROM products WHERE slug = ? LIMIT 1`,
            [slug]
        );
        return rows.length > 0;
    },
};

export default ProductModel;
