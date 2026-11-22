
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

type CartItem = {
  id: number;
  quantity: number;
};

// ==========================================
// EMBER & OLIVE — CUSTOMER ORDER API
// ==========================================

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;

    try {
      const parsed: unknown = await request.json();

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        throw new Error("Invalid request");
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order request.",
        },
        { status: 400 }
      );
    }

    // CUSTOMER DETAILS
    const customerName =
      typeof body.customerName === "string"
        ? body.customerName.trim()
        : "";

    const customerPhone =
      typeof body.customerPhone === "string"
        ? body.customerPhone.trim()
        : "";

    const orderType = body.orderType;

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : "";

    if (
      !customerName ||
      customerName.length > 150
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid customer name.",
        },
        { status: 400 }
      );
    }

    const phoneDigits =
      customerPhone.replace(/\D/g, "");

    if (
      customerPhone.length > 30 ||
      !/^[+()\d\s-]+$/.test(customerPhone) ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid phone number.",
        },
        { status: 400 }
      );
    }

    if (
      orderType !== "pickup" &&
      orderType !== "dine-in"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Select a valid order type.",
        },
        { status: 400 }
      );
    }

    if (notes.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "Order notes are too long.",
        },
        { status: 400 }
      );
    }

    // VALIDATE CART
    const rawItems = body.items;

    if (
      !Array.isArray(rawItems) ||
      rawItems.length === 0 ||
      rawItems.length > 20
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart must contain 1–20 dishes.",
        },
        { status: 400 }
      );
    }

    const items: CartItem[] = [];
    const seenIds = new Set<number>();

    for (const rawItem of rawItems) {
      if (
        !rawItem ||
        typeof rawItem !== "object" ||
        Array.isArray(rawItem)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid cart item.",
          },
          { status: 400 }
        );
      }

      const raw = rawItem as Record<string, unknown>;

      const id =
        typeof raw.id === "number" ||
        (typeof raw.id === "string" &&
          /^[1-9]\d*$/.test(raw.id))
          ? Number(raw.id)
          : NaN;

      const quantity = raw.quantity;

      if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10 ||
        seenIds.has(id)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid dish or quantity.",
          },
          { status: 400 }
        );
      }

      seenIds.add(id);
      items.push({ id, quantity });
    }

    // ======================================
    // CREATE ORDER ATOMICALLY IN NEONDB
    // ======================================
    // Prices are taken from the database.
    // Order and order_items are inserted
    // within the same SQL statement.

    const cartJson = JSON.stringify(items);

    const result = await sql`
      WITH requested_items AS (
        SELECT
          (entry ->> 'id')::bigint AS menu_item_id,
          (entry ->> 'quantity')::integer AS quantity
        FROM jsonb_array_elements(
          ${cartJson}::jsonb
        ) AS entry
      ),

      valid_items AS (
        SELECT
          m.id,
          m.name,
          m.price,
          r.quantity
        FROM requested_items r
        JOIN menu_items m
          ON m.id = r.menu_item_id
        WHERE m.is_available = TRUE
      ),

      order_totals AS (
        SELECT
          COUNT(*)::integer AS item_count,
          SUM(price * quantity) AS total
        FROM valid_items
      ),

      created_order AS (
        INSERT INTO orders (
          customer_name,
          customer_phone,
          order_type,
          total_amount,
          status,
          notes
        )
        SELECT
          ${customerName},
          ${customerPhone},
          ${orderType},
          total,
          'pending',
          ${notes}
        FROM order_totals
        WHERE item_count = ${items.length}
          AND total > 0
          AND total <= 99999999.99
        RETURNING
          id,
          total_amount,
          status,
          created_at
      ),

      created_order_items AS (
        INSERT INTO order_items (
          order_id,
          menu_item_id,
          item_name,
          quantity,
          unit_price
        )
        SELECT
          o.id,
          v.id,
          v.name,
          v.quantity,
          v.price
        FROM created_order o
        CROSS JOIN valid_items v
        RETURNING id
      )

      SELECT
        o.id,
        o.total_amount::text AS total_amount,
        o.status,
        o.created_at,
        (
          SELECT COUNT(*)::integer
          FROM created_order_items
        ) AS saved_items
      FROM created_order o
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Some dishes are unavailable or the order total is invalid. Please refresh your cart.",
        },
        { status: 409 }
      );
    }

    const order = result[0];

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        order: {
          id: String(order.id),
          total: order.total_amount,
          status: order.status,
          itemsCount: order.saved_items,
          createdAt: order.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to place order.",
      },
      { status: 500 }
    );
  }
}
