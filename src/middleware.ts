import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_TOKEN = "authenticated";

export function middleware(request: NextRequest) {
  // Check for auth cookie
  const authCookie = request.cookies.get("pompey-auth");
  if (authCookie?.value === AUTH_TOKEN) {
    return NextResponse.next();
  }

  // Allow the login page and API
  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/api/login"
  ) {
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
