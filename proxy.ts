import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/questions",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/api/auth",
  "/api/questions",
];

// Define admin-only routes
const adminRoutes = [
  "/admin",
  "/api/admin",
];

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // 🔒 Cloudflare AI Content Protection (Global)
  response.headers.set(
    "Content-Signal",
    "search=yes, ai-train=no, ai-input=no"
  );
  response.headers.set("X-Robots-Tag", "noai, noimageai");

  // Check if the path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the path is admin-only
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // For API routes, let them handle their own auth
  if (pathname.startsWith("/api/")) {
    return;
  }

  // Check for auth cookie or session
  const hasSession = request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  // Redirect unauthenticated users from protected routes
  if (!hasSession && !isPublicRoute) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For admin routes, we'll do optimistic checking and let the page handle proper verification
  if (isAdminRoute && hasSession) {
    // In Next.js 16, proxy does optimistic checks
    // The actual role verification will happen on the page/API level
    // This prevents unnecessary redirects for users who might have admin access
    return;
  }

  // Redirect authenticated users from auth pages to dashboard
  if (hasSession && pathname.startsWith("/auth")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
