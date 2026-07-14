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
    createdBy: string;
    updatedBy: string;
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
    createdBy: string;
    updatedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
    isActive: boolean;
}

export interface AuthUser {
    id: number;
    name?: string;
    email?: string;
    role?: UserRole;
}
