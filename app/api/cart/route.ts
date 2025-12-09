import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST: Add an item to the cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, category, externalId, data } = body;

    // Basic validation
    if (!cartId || !category || !data) {
      return NextResponse.json(
        { error: "Missing required fields: cartId, category, or data" },
        { status: 400 }
      );
    }

    // Insert into Supabase via Drizzle
    const [newItem] = await db
      .insert(cartItems)
      .values({
        cartId,
        category,
        externalId,
        data,
      })
      .returning();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an item from the cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    // Delete from Supabase via Drizzle
    await db.delete(cartItems).where(eq(cartItems.id, Number(id)));

    return NextResponse.json({ success: true, message: "Item removed" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
