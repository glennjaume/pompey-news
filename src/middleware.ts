import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;

  // If no password is set, allow access
  if (!password) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("pompey-auth");
  if (authCookie?.value === password) {
    return NextResponse.next();
  }

  // Check if this is a login attempt
  if (request.method === "POST" && request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  // Allow the login page
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  // Redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
