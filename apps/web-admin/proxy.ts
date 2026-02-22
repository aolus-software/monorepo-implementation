import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_TOKEN_KEY } from "./lib/constants/auth";

const PUBLIC_ROUTES = ["/"] as const;
const PROTECTED_ROUTE_PREFIXES = ["/dashboard"] as const;

export function proxy(request: NextRequest): NextResponse {
	const { pathname } = request.nextUrl;
	const tokenCookie = request.cookies.get(AUTH_TOKEN_KEY);
	const isAuthenticated =
		tokenCookie !== undefined && tokenCookie.value.length > 0;

	const isPublicRoute = (PUBLIC_ROUTES as readonly string[]).includes(pathname);
	const isProtectedRoute = (PROTECTED_ROUTE_PREFIXES as readonly string[]).some(
		(prefix) => pathname.startsWith(prefix),
	);

	if (isPublicRoute && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (isProtectedRoute && !isAuthenticated) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
