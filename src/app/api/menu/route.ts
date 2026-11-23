
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";


// =============================================
// EMBER & OLIVE — RESTAURANT MENU API
// Next.js App Router + NeonDB PostgreSQL
// =============================================

type RequestBody = Record<string, unknown>;

type DishData = {
  name: string;
  description: string;
  category: string;
  price: string;
};

// ---------------------------------------------
// HELPER: ADMIN AUTHORIZATION
// ---------------------------------------------


function checkAdmin(request: NextRequest): NextResponse | null {
  return requireAdminSession(request);
}



// ---------------------------------------------
// HELPER: READ REQUEST BODY
// ---------------------------------------------

async function readBody(
  request: Request
): Promise<RequestBody | null> {
  try {
    const body: unknown = await request.json();

    if (
      body === null ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return null;
    }

    return body as RequestBody;
  } catch {
    return null;
  }
}

// ---------------------------------------------
// HELPER: VALIDATE DISH DETAILS
// ---------------------------------------------

function validateDish(
  body: RequestBody
): DishData | null {
  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  const description =
    typeof body.description === "string"
      ? body.description.trim()
      : "";

  const category =
    typeof body.category === "string" &&
    body.category.trim()
      ? body.category.trim()
      : "Signature";

  const priceValue =
    typeof body.price === "string" ||
    typeof body.price === "number"
      ? Number(body.price)
      : NaN;

  if (
    !name ||
    name.length > 150 ||
    !description ||
    description.length > 1000 ||
    !category ||
    category.length > 100 ||
    !Number.isFinite(priceValue) ||
    priceValue <= 0 ||
    priceValue > 99999999.99
  ) {
    return null;
  }

  const price = priceValue.toFixed(2);

  if (Number(price) < 0.01) {
    return null;
  }

  return {
    name,
    description,
    category,
    price,
  };
}

// ---------------------------------------------
// HELPER: VALIDATE MENU ITEM ID
// ---------------------------------------------

function validateId(value: unknown): number | null {
  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return null;
  }

  if (
    typeof value === "string" &&
    !/^[1-9]\d*$/.test(value)
  ) {
    return null;
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

// =============================================
// 1. GET — DISPLAY ALL MENU ITEMS
// =============================================

export async function GET() {
  try {
    const items = await sql`
      SELECT
        id,
        name,
        description,
        price::text AS price,
        category,
        image_url,
        is_available
      FROM menu_items
      ORDER BY id DESC
    `;

    return NextResponse.json(
      {
        success: true,
        items,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Fetch menu error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load menu items.",
      },
      { status: 500 }
    );
  }
}

// =============================================
// 2. POST — ADD NEW MENU ITEM
// =============================================


export async function POST(request: NextRequest) {
  try {
    const authError = checkAdmin(request);

    if (authError) {
      return authError;
    }

    const body = await readBody(request);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    const dish = validateDish(body);

    if (!dish) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter valid dish name, price, description and category.",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO menu_items (
        name,
        description,
        price,
        category,
        is_available
      )
      VALUES (
        ${dish.name},
        ${dish.description},
        ${dish.price},
        ${dish.category},
        TRUE
      )
      RETURNING
        id,
        name,
        description,
        price::text AS price,
        category,
        image_url,
        is_available
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Dish added successfully.",
        item: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add menu item error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add menu item.",
      },
      { status: 500 }
    );
  }
}

// =============================================
// 3. PATCH — UPDATE EXISTING MENU ITEM
// =============================================

export async function PATCH(request: NextRequest) {
  try {
    const authError = checkAdmin(request);

    if (authError) {
      return authError;
    }

    const body = await readBody(request);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    const id = validateId(body.id);
    const dish = validateDish(body);

    if (id === null || !dish) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid dish ID or dish details.",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE menu_items
      SET
        name = ${dish.name},
        description = ${dish.description},
        price = ${dish.price},
        category = ${dish.category}
      WHERE id = ${id}
      RETURNING
        id,
        name,
        description,
        price::text AS price,
        category,
        image_url,
        is_available
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Dish not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Dish updated successfully.",
        item: result[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update dish error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update dish.",
      },
      { status: 500 }
    );
  }
}

// =============================================
// 4. DELETE — REMOVE EXISTING MENU ITEM
// =============================================

export async function DELETE(request: NextRequest) {
  try {
    const authError = checkAdmin(request);

    if (authError) {
      return authError;
    }

    const body = await readBody(request);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    const id = validateId(body.id);

    if (id === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid dish ID.",
        },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM menu_items
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Dish not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Dish deleted successfully.",
        deletedId: id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete dish error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete dish.",
      },
      { status: 500 }
    );
  }
}
