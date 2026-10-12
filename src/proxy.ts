// src/proxy.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;

    const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup');

    // If logged in and visiting login/signup, send to dashboard
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', nextUrl));
    }

    // If not logged in and visiting protected routes, send to login
    if (!isAuthPage && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)"],
};