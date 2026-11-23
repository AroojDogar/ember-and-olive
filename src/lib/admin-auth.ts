
import "server-only";

import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/admin-session";

// EMBER & OLIVE — SERVER-SIDE ADMIN AUTH

export function requireAdminSession(
  request: NextRequest
): NextResponse | null {
  const token = request.cookies.get(
    ADMIN_SESSION_COOKIE
  )?.value;

  let authenticated = false;

  try {
    authenticated = verifyAdminSession(token);
  } catch {
    authenticated = false;
  }

  if (!authenticated) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Admin session expired. Please log in again.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // Check request origin for data-changing actions.
  if (
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    const origin = request.headers.get("origin");

    if (
      !origin ||
      origin !== request.nextUrl.origin
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Request origin is not allowed.",
        },
        { status: 403 }
      );
    }
  }

  return null;
}
