import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: Fetch events for a specific trip
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("tripId");

  if (!tripId) {
    return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
  }

  try {
    const tripEvents = await db
      .select()
      .from(events)
      .where(eq(events.tripId, Number(tripId)));

    return NextResponse.json(tripEvents);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST: Add a new event to the itinerary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.tripId || !body.title || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newEvent] = await db.insert(events).values({
      tripId: body.tripId,
      title: body.title,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      description: body.description || "",
      location: body.location || "",
      category: body.category || "activity",
    }).returning();

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}