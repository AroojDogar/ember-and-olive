
import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isValidImage(
  bytes: Uint8Array,
  type: string
): boolean {
  if (type === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (type === "image/png") {
    const signature = [
      137, 80, 78, 71, 13, 10, 26, 10,
    ];

    return signature.every(
      (value, index) => bytes[index] === value
    );
  }

  if (type === "image/webp") {
    const header = new TextDecoder().decode(
      bytes.slice(0, 4)
    );

    const format = new TextDecoder().decode(
      bytes.slice(8, 12)
    );

    return header === "RIFF" && format === "WEBP";
  }

  return false;
}

// UPLOAD PHOTO AND SAVE URL TO NEONDB
export async function POST(request: NextRequest) {
  // ADMIN LOGIN SESSION VERIFICATION
  const authError = requireAdminSession(request);

  if (authError) {
    return authError;
  }

  try {
    // VERIFY BLOB STORAGE CONFIGURATION
    if (
      !process.env.BLOB_STORE_ID &&
      !process.env.BLOB_READ_WRITE_TOKEN
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Blob Storage is not configured.",
        },
        { status: 503 }
      );
    }

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload request.",
        },
        { status: 400 }
      );
    }

    const rawId = formData.get("dishId");
    const file = formData.get("file");

    // VALIDATE DISH ID
    if (
      typeof rawId !== "string" ||
      !/^[1-9]\d*$/.test(rawId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid dish ID.",
        },
        { status: 400 }
      );
    }

    const dishId = Number(rawId);

    if (!Number.isSafeInteger(dishId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid dish ID.",
        },
        { status: 400 }
      );
    }

    // VALIDATE FILE
    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a photo.",
        },
        { status: 400 }
      );
    }

    const extension = allowedTypes[file.type];

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    if (
      file.size === 0 ||
      file.size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be 3 MB or smaller.",
        },
        { status: 400 }
      );
    }

    // VERIFY IMAGE SIGNATURE
    const header = new Uint8Array(
      await file.slice(0, 12).arrayBuffer()
    );

    if (!isValidImage(header, file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image file.",
        },
        { status: 400 }
      );
    }

    // CHECK DISH EXISTS
    const existing = await sql`
      SELECT id
      FROM menu_items
      WHERE id = ${dishId}
      LIMIT 1
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Dish not found.",
        },
        { status: 404 }
      );
    }

    // UPLOAD IMAGE TO VERCEL BLOB
    const blob = await put(
      `menu/dish-${dishId}-${Date.now()}.${extension}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      }
    );

    // SAVE IMAGE URL TO NEONDB
    try {
      const updated = await sql`
        UPDATE menu_items
        SET image_url = ${blob.url}
        WHERE id = ${dishId}
        RETURNING
          id,
          name,
          description,
          price::text AS price,
          category,
          image_url,
          is_available
      `;

      if (updated.length === 0) {
        await del(blob.url).catch(console.error);

        return NextResponse.json(
          {
            success: false,
            message: "Dish no longer exists.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Dish photo saved successfully.",
          image_url: blob.url,
          item: updated[0],
        },
        { status: 201 }
      );
    } catch (error) {
      await del(blob.url).catch(console.error);
      throw error;
    }
  } catch (error) {
    console.error("Upload dish image error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Photo upload failed. Check Blob credentials and server logs.",
      },
      { status: 500 }
    );
  }
}
