export type UserRole = "buyer" | "seller" | "admin";

export interface UserRow {
    id: number;
    email: string;
    name: string;
    password: string;
    role: UserRole;
    isEmailVerified: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface VerificationTokenRow {
    id: number;
    user_id: number;
    token: string;
    type: string;
    expiresAt: Date;
    used: boolean;
    created_at?: Date;
}

export interface CategoryRow {
    id: number;
    parentId: number | null;
    displayName: string;
    imageUrl: string | null;
    isActive: boolean;
    createdBy: number;
    updatedBy: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BannerRow {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    displayOrder: number;
    categoryId: number | null;
    createdBy: number;
    updatedBy: number;
    createdAt?: Date;
    updatedAt?: Date;
    isActive: boolean;
}

export type ProductStatus = "draft" | "pending" | "approved" | "flagged" | "rejected" | "archived";

export interface ProductRow {
    id: number;
    name: string;
    sellerId: number;
    categoryId: number | null;
    description: string | null;
    slug: string;
    price: number;
    mrp: number | null;
    stock: number;
    status: ProductStatus;
    averageRating: number;
    reviewsCount: number;
    createdBy: number;
    updatedBy: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductImageRow {
    id: number;
    productId: number;
    url: string;
    thumbnailUrl: string | null;
    altText: string | null;
    sortOrder: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface ShippingAddress {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type PaymentMethod = "cod" | "razorpay";

export interface PaymentRecordRow {
    id: number;
    orderId: number;
    provider: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    razorpaySignature: string | null;
    amount: number;
    currency: string;
    status: PaymentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CartItemRow {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OrderRow {
    id: number;
    orderNumber: string;
    buyerId: number;
    sellerId: number;
    status: OrderStatus;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingAddress: ShippingAddress;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OrderItemRow {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OrderStatusHistoryRow {
    id: number;
    orderId: number;
    status: OrderStatus;
    updatedBy: number | null;
    createdAt?: Date;
}

export interface AuthUser {
    id: number;
    name?: string;
    email?: string;
    role?: UserRole;
}
