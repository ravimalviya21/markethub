import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

import { getDashboardForRole } from '@/utils/auth';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const PUBLIC_AUTH_ROUTES = ['/auth/reset-password', '/auth/verify-email-sent', '/auth/email-verified'];

const BUYER_HOME = '/buyer/dashboard';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get('accessToken')?.value;

    const isAdminRoute = pathname.startsWith('/admin');
    const isSellerRoute = pathname.startsWith('/seller');
    const isAuthRoute = pathname.startsWith('/auth') && !PUBLIC_AUTH_ROUTES.some((p) => pathname.startsWith(p));
    const isProtectedRoute = isAdminRoute || isSellerRoute || pathname.startsWith('/account');

    let payload = null;
    if (accessToken) {
        try {
            const verified = await jwtVerify(accessToken, secret);
            payload = verified.payload;
        } catch {}
    }

    if (!payload) {
        if (isProtectedRoute) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (pathname === '/') {
            return NextResponse.redirect(new URL(BUYER_HOME, request.url));
        }
        return NextResponse.next();
    }

    if (isAuthRoute || pathname === '/') {
        return NextResponse.redirect(new URL(getDashboardForRole(payload.role), request.url));
    }

    if (isAdminRoute && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (isSellerRoute && payload.role !== 'seller' && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/auth/:path*', '/admin/:path*', '/seller/:path*', '/account/:path*'],
};
