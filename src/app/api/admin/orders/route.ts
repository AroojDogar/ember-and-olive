
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { sql } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// EMBER & OLIVE — PROTECTED ORDER MANAGEMENT

const allowedTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

// ========================================
// GET — FETCH ALL CUSTOMER ORDERS
// ========================================

export async function GET(request: NextRequest) {
  const authError = requireAdminSession(request);

  if (authError) {
    return authError;
  }

  try {
    const orders = await sql`
      SELECT
        o.id::text AS id,
        o.customer_name,
        o.customer_phone,
        o.order_type,
        o.total_amount::text AS total_amount,
        o.status,
        o.notes,
        o.created_at,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', oi.id::text,
                'name', oi.item_name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price::text,
                'subtotal',
                (oi.quantity * oi.unit_price)::text
              )
              ORDER BY oi.id
            )
            FROM order_items oi
            WHERE oi.order_id = o.id
          ),
          '[]'::json
        ) AS items

      FROM orders o
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT 100
    `;

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Fetch admin orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load customer orders.",
      },
      { status: 500 }
    );
  }
}

// ========================================
// PATCH — UPDATE ORDER STATUS
// ========================================

export async function PATCH(request: NextRequest) {
  const authError = requireAdminSession(request);

  if (authError) {
    return authError;
  }

  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order details.",
        },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const rawId = data.id;

    const orderId =
      typeof rawId === "string" &&
      /^[1-9]\d*$/.test(rawId)
        ? rawId
        : typeof rawId === "number" &&
            Number.isSafeInteger(rawId) &&
            rawId > 0
          ? String(rawId)
          : null;

    const nextStatus =
      typeof data.status === "string"
        ? data.status.trim().toLowerCase()
        : "";

    if (
      !orderId ||
      !Object.prototype.hasOwnProperty.call(
        allowedTransitions,
        nextStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID or status.",
        },
        { status: 400 }
      );
    }

    // CHECK CURRENT ORDER STATUS
    const existing = await sql`
      SELECT status
      FROM orders
      WHERE id = ${orderId}::bigint
      LIMIT 1
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    const currentStatus = String(
      existing[0].status
    );

    const permitted =
      allowedTransitions[currentStatus] ?? [];

    if (!permitted.includes(nextStatus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order status change is not allowed.",
        },
        { status: 409 }
      );
    }

    // PREVENT CONFLICTING STATUS UPDATES
    const updated = await sql`
      UPDATE orders
      SET status = ${nextStatus}
      WHERE id = ${orderId}::bigint
        AND status = ${currentStatus}
      RETURNING
        id::text AS id,
        status,
        customer_name,
        total_amount::text AS total_amount
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order was updated elsewhere. Refresh and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      order: updated[0],
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update order status.",
      },
      { status: 500 }
    );
  }
}
