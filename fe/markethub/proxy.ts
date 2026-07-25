import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // edge-compatible JWT library
import { NextRequest } from 'next/server';

import { getDashboardForRole } from '@/utils/auth';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Auth pages a signed-in user may still open: they carry their own one-time
// token in the URL, or just confirm something that already happened.
const PUBLIC_AUTH_ROUTES = ['/auth/reset-password', '/auth/verify-email-sent', '/auth/email-verified'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get('accessToken')?.value;

    const isAdminRoute = pathname.startsWith('/admin');
    const isSellerRoute = pathname.startsWith('/seller');
    const isAuthRoute = pathname.startsWith('/auth') && !PUBLIC_AUTH_ROUTES.some((p) => pathname.startsWith(p));
    const isProtectedRoute =
        isAdminRoute || isSellerRoute || pathname.startsWith('/buyer') || pathname.startsWith('/profile');

    let payload = null;
    if (accessToken) {
        try {
            const verified = await jwtVerify(accessToken, secret);
            payload = verified.payload; // { id, name, email, role, exp, ... }
        } catch {
            // Token invalid or expired — payload stays null
        }
    }

    if (!payload) {
        if (isProtectedRoute) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        // "/" is a dispatcher, not a page — no session means the login form.
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        return NextResponse.next();
    }

    // Signed in: keep them off the login/signup forms, send "/" to their home.
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
    matcher: ['/', '/auth/:path*', '/admin/:path*', '/seller/:path*', '/buyer/:path*', '/profile/:path*'],
};
