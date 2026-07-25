import { decodeJwt } from "jose";

export type UserRole = "admin" | "seller" | "buyer";

export const getDashboardForRole = (role: unknown): string => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "seller") return "/seller/dashboard";
    return "/buyer/dashboard";
};

export const getRoleFromToken = (token: string | null | undefined): string | null => {
    if (!token) return null;
    try {
        const { role } = decodeJwt(token);
        return typeof role === "string" ? role : null;
    } catch {
        return null;
    }
};

export const safeInternalPath = (value: string | string[] | undefined): string | null => {
    const path = Array.isArray(value) ? value[0] : value;
    if (!path) return null;
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    return path;
};
