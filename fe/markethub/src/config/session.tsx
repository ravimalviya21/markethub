import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { decodeJwt } from "jose";

import {
    bootstrapAuth,
    getAccessToken,
    resetAuthBootstrap,
    setAccessToken,
    subscribeToAccessToken,
} from "@/config/axios";
import { HeaderRole } from "@/components/layout/Header/config";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export interface SessionUser {
    id: number;
    name: string;
    email: string;
    role: Exclude<HeaderRole, "guest">;
}

interface SessionContextValue {
    user: SessionUser | null;
    role: HeaderRole;
    status: SessionStatus;
    isAuthenticated: boolean;
    signIn: (accessToken: string) => void;
    signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const userFromToken = (token: string | null): SessionUser | null => {
    if (!token) return null;
    try {
        const claims = decodeJwt(token);
        if (typeof claims.id !== "number" || typeof claims.role !== "string") return null;
        return {
            id: claims.id,
            name: typeof claims.name === "string" ? claims.name : "",
            email: typeof claims.email === "string" ? claims.email : "",
            role: claims.role as SessionUser["role"],
        };
    } catch {
        return null;
    }
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [status, setStatus] = useState<SessionStatus>("loading");

    useEffect(() => {
        let active = true;

        const unsubscribe = subscribeToAccessToken((token) => {
            if (!active) return;
            const resolved = userFromToken(token);
            setUser(resolved);
            setStatus(resolved ? "authenticated" : "anonymous");
        });

        bootstrapAuth().then((token) => {
            if (!active) return;
            const resolved = userFromToken(token);
            setUser(resolved);
            setStatus(resolved ? "authenticated" : "anonymous");
        });

        return () => {
            active = false;
            unsubscribe();
        };
    }, []);

    const value = useMemo<SessionContextValue>(
        () => ({
            user,
            role: user?.role ?? "guest",
            status,
            isAuthenticated: status === "authenticated",
            signIn: (accessToken: string) => {
                setAccessToken(accessToken);
                const resolved = userFromToken(accessToken);
                setUser(resolved);
                setStatus(resolved ? "authenticated" : "anonymous");
            },
            signOut: () => {
                setAccessToken(null);
                resetAuthBootstrap();
                setUser(null);
                setStatus("anonymous");
            },
        }),
        [user, status]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextValue => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used inside a SessionProvider");
    }
    return context;
};

export const readAccessTokenUser = () => userFromToken(getAccessToken());
