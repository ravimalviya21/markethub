import { randomBytes } from "crypto";
import { AppError } from "../utils/errors";
import STATUS_CODES from "../contants/statusCode";
import OrderModel, { ListFilters, NewOrder, NewOrderItem } from "../models/order.model";
import ProductModel from "../models/product.model";
import CartModel from "../models/cart.model";
import PaymentService from "./payment.service";
import { isRazorpayConfigured } from "../config/razorpay";
import { AuthUser, OrderRow, OrderStatus, PaymentMethod, ProductRow, UserRole } from "../types/models";
import { ListOrdersQuery, OrderItemInput, ShippingAddressInput } from "../validations/order.validation";

interface Viewer {
    id?: number;
    role?: UserRole;
}

interface CreateInput {
    items: OrderItemInput[];
    shippingAddress: ShippingAddressInput;
    paymentMethod: PaymentMethod;
    userId: number;
}

interface UpdateStatusInput {
    id: number;
    status: OrderStatus;
    userId: number;
    role: UserRole;
}

const FLAT_SHIPPING_COST = 49;
const FREE_SHIPPING_THRESHOLD = 999;
const TAX_RATE = 0.08;

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

const BUYER_ALLOWED_STATUSES: OrderStatus[] = ["cancelled"];

const money = (value: number) => Math.round(value * 100) / 100;

const buildOrderNumber = async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const orderNumber = `ORD-${today}-${randomBytes(4).toString("hex").toUpperCase()}`;
        if (!(await OrderModel.orderNumberExists(orderNumber))) return orderNumber;
    }
    throw new AppError("Could not generate an order number, please retry", STATUS_CODES.CONFLICT);
};

const resolveItems = async (items: OrderItemInput[], buyerId: number) => {
    const products = await ProductModel.findByIds(items.map((item) => item.productId));
    const byId = new Map<number, ProductRow>(products.map((product) => [product.id, product]));

    return items.map((item) => {
        const product = byId.get(item.productId);
        if (!product || product.status !== "approved") {
            throw new AppError(`Product ${item.productId} is not available`, STATUS_CODES.BAD_REQUEST);
        }
        if (product.sellerId === buyerId) {
            throw new AppError("You cannot order your own product", STATUS_CODES.BAD_REQUEST);
        }
        if (product.stock < item.quantity) {
            throw new AppError(
                `Only ${product.stock} unit(s) of ${product.name} are in stock`,
                STATUS_CODES.CONFLICT
            );
        }
        return {
            sellerId: product.sellerId,
            item: {
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.price,
            } as NewOrderItem,
        };
    });
};

const groupBySeller = (resolved: { sellerId: number; item: NewOrderItem }[]) => {
    const groups = new Map<number, NewOrderItem[]>();
    for (const { sellerId, item } of resolved) {
        const existing = groups.get(sellerId);
        if (existing) existing.push(item);
        else groups.set(sellerId, [item]);
    }
    return groups;
};

const priceOrder = (items: NewOrderItem[]) => {
    const subtotal = money(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
    const tax = money(subtotal * TAX_RATE);
    return { subtotal, shippingCost, tax, total: money(subtotal + shippingCost + tax) };
};

const assertCanView = (order: OrderRow, viewer: Viewer) => {
    if (viewer.role === "admin") return;
    if (viewer.role === "seller" && order.sellerId === viewer.id) return;
    if (order.buyerId === viewer.id) return;
    throw new AppError("Order not found", STATUS_CODES.NOT_FOUND);
};

const scopeFor = (viewer: Viewer, query: ListOrdersQuery): Pick<ListFilters, "buyerId" | "sellerId"> => {
    if (viewer.role === "admin") return { buyerId: query.buyerId, sellerId: query.sellerId };
    if (viewer.role === "seller") return { sellerId: viewer.id, buyerId: query.buyerId };
    return { buyerId: viewer.id };
};

const OrderService = {
    async create({ items, shippingAddress, paymentMethod, userId }: CreateInput) {
        if (paymentMethod === "razorpay" && !isRazorpayConfigured()) {
            throw new AppError(
                "Online payments are not configured on this server",
                STATUS_CODES.SERVICE_UNAVAILABLE
            );
        }

        const resolved = await resolveItems(items, userId);
        const grouped = groupBySeller(resolved);

        const orders: NewOrder[] = [];
        for (const [sellerId, sellerItems] of grouped) {
            orders.push({
                orderNumber: await buildOrderNumber(),
                buyerId: userId,
                sellerId,
                shippingAddress,
                items: sellerItems,
                ...priceOrder(sellerItems),
            });
        }

        const created = await OrderModel.saveMany(orders, userId);

        const byNumber = new Map(orders.map((order) => [order.orderNumber, order]));
        const summaries = created.map((order) => {
            const priced = byNumber.get(order.orderNumber);
            return {
                ...order,
                sellerId: priced?.sellerId,
                itemCount: priced?.items.length ?? 0,
                subtotal: priced?.subtotal ?? 0,
                shippingCost: priced?.shippingCost ?? 0,
                tax: priced?.tax ?? 0,
                total: priced?.total ?? 0,
            };
        });

        if (paymentMethod !== "razorpay") {
            await CartModel.removeMany(userId, items.map((item) => item.productId));
            return { orders: summaries, paymentMethod, payment: null };
        }

        try {
            const payment = await PaymentService.createIntent({
                orders: summaries,
                userId,
                receipt: summaries[0]?.orderNumber ?? `ORD-${Date.now()}`,
            });
            return { orders: summaries, paymentMethod, payment };
        } catch (err) {
            for (const order of created) {
                await OrderModel.updateStatus({
                    id: order.id,
                    status: "cancelled",
                    userId,
                    restoreStock: true,
                });
            }
            throw err;
        }
    },

    async updateStatus({ id, status, userId, role }: UpdateStatusInput) {
        const existing = await OrderModel.findById(id);
        if (!existing) throw new AppError("Order not found", STATUS_CODES.NOT_FOUND);
        assertCanView(existing, { id: userId, role });

        const isSellerOfOrder = role === "seller" && existing.sellerId === userId;
        if (role !== "admin" && !isSellerOfOrder && !BUYER_ALLOWED_STATUSES.includes(status)) {
            throw new AppError("You can only cancel this order", STATUS_CODES.FORBIDDEN);
        }
        if (!ALLOWED_TRANSITIONS[existing.status].includes(status)) {
            throw new AppError(
                `An order cannot move from ${existing.status} to ${status}`,
                STATUS_CODES.BAD_REQUEST
            );
        }

        const affectedRows = await OrderModel.updateStatus({
            id,
            status,
            userId,
            restoreStock: status === "cancelled",
        });
        if (affectedRows === 0) throw new AppError("Order not found", STATUS_CODES.NOT_FOUND);
        return { id, status };
    },

    async find(query: ListOrdersQuery, viewer: Viewer) {
        const { page, limit } = query;
        const { items, total } = await OrderModel.find({
            ...query,
            ...scopeFor(viewer, query),
        });

        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        };
    },

    async findById(id: number, viewer: Viewer) {
        const order = await OrderModel.findDetailById(id);
        if (!order) throw new AppError("Order not found", STATUS_CODES.NOT_FOUND);
        assertCanView(order, viewer);
        return order;
    },
};

export const orderViewer = (user: AuthUser): Viewer => ({ id: user.id, role: user.role });

export default OrderService;
