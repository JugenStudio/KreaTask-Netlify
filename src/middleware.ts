import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasPermission } from "@/lib/auth/permissions";
import { UserRole } from "./lib/types";

// Define which actions are required for which API paths.
const PROTECTED_API_ROUTES = [
  { path: "/api/users", action: "manage_users" },
  { path: "/api/settings", action: "manage_settings" },
  // Add other protected API routes here
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Define public paths that don't require authentication
  const publicPaths = ["/landing", "/signin", "/signup", "/api/auth"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // 2. Get user token for all other routes
  const token = await getToken({ req });

  // 3. If no token, redirect to signin
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }
  
  // 4. Check for API route permissions
  const matchedApiRoute = PROTECTED_API_ROUTES.find((r) =>
    pathname.startsWith(r.path)
  );

  if (matchedApiRoute) {
    const userRole = (token.role || UserRole.UNASSIGNED) as UserRole;
    const allowed = await hasPermission(userRole, matchedApiRoute.action);

    if (!allowed) {
      return NextResponse.json(
        { error: "Access Denied: You do not have permission to perform this action." },
        { status: 403 }
      );
    }
  }

  // 5. If all checks pass, continue to the requested page/api
  return NextResponse.next();
}

// Configure the middleware to run on all paths except for static files and framework internals.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /sounds (public audio files)
     * - /google.svg (public image)
     */
    "/((?!_next/static|_next/image|favicon.ico|sounds/.*|google.svg).*)",
  ],
};
