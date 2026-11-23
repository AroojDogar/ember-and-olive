
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/admin-session";

// EMBER & OLIVE — ADMIN ROUTE PROTECTION

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow access to the login page.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Read the secure session cookie.
  const token = request.cookies.get(
    ADMIN_SESSION_COOKIE
  )?.value;

  let authenticated = false;

  try {
    authenticated = verifyAdminSession(token);
  } catch {
    authenticated = false;
  }

  // Block unauthenticated visitors.
  if (!authenticated) {
    const loginUrl = new URL(
      "/admin/login",
      request.url
    );

    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated admins.
  return NextResponse.next();
}

// Protect admin pages only.
// API routes have their own authorization checks.

export const config = {
  matcher: ["/admin/:path*"],
};
