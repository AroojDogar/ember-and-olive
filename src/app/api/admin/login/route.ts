
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  createAdminSession,
} from "@/lib/admin-session";

// COMPARE PASSWORDS SAFELY
function passwordsMatch(
  supplied: string,
  expected: string
): boolean {
  const suppliedHash = createHash("sha256")
    .update(supplied)
    .digest();

  const expectedHash = createHash("sha256")
    .update(expected)
    .digest();

  return timingSafeEqual(suppliedHash, expectedHash);
}

// ADMIN LOGIN
export async function POST(request: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret =
      process.env.ADMIN_SESSION_SECRET;

    if (
      !adminPassword ||
      !sessionSecret ||
      sessionSecret.length < 32
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin login is not configured.",
        },
        { status: 503 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login request.",
        },
        { status: 400 }
      );
    }

    const password =
      body &&
      typeof body === "object" &&
      "password" in body
        ? body.password
        : undefined;

    if (
      typeof password !== "string" ||
      password.length === 0 ||
      password.length > 256 ||
      !passwordsMatch(password, adminPassword)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admin credentials.",
        },
        { status: 401 }
      );
    }

    const token = createAdminSession();

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION_SECONDS,
      }
    );

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete login.",
      },
      { status: 500 }
    );
  }
}
