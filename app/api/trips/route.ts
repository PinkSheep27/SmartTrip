import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, trips, participants, carts } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm"; // <-- Added 'and' here!

// ==========================================
// GET: Fetch all trips for the logged-in user
// ==========================================
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email));
    if (!currentUser) return NextResponse.json([]);

    // 1. Only fetch trips where the user has ACCEPTED the invite (or is the owner)
    const userParticipations = await db.select({ tripId: participants.tripId })
      .from(participants)
      .where(and(
        eq(participants.userId, currentUser.id),
        eq(participants.status, 'accepted')
      ));

    const tripIds = userParticipations.map(p => p.tripId);
    if (tripIds.length === 0) return NextResponse.json([]);

    // 2. Fetch the base trips and their active carts
    const myTrips = await db
      .select({
        id: trips.id,
        name: trips.name,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        cartId: carts.id,
      })
      .from(trips)
      .leftJoin(carts, eq(trips.id, carts.tripId))
      .where(inArray(trips.id, tripIds));

    // 3. Fetch all accepted participants for these trips so the UI can show avatars
    const allParticipants = await db
      .select({
        tripId: participants.tripId,
        userId: participants.userId,
        role: participants.role,
        userName: users.name,
        userEmail: users.email
      })
      .from(participants)
      .leftJoin(users, eq(participants.userId, users.id))
      .where(and(
        inArray(participants.tripId, tripIds),
        eq(participants.status, 'accepted')
      ));

    // 4. Stitch the participants into the trip objects
    const tripsWithParticipants = myTrips.map(trip => ({
      ...trip,
      participants: allParticipants
        .filter(p => p.tripId === trip.id)
        .map(p => ({
          id: p.userId,
          name: p.userName || p.userEmail,
          role: p.role
        }))
    }));

    return NextResponse.json(tripsWithParticipants);
  } catch (error) {
    console.error("Trips API GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

// ==========================================
// POST: Create a new trip & empty cart
// ==========================================
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, destination } = body;

    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email));
    if (!currentUser) return NextResponse.json({ error: "User not found in DB" }, { status: 404 });

    const [newTrip] = await db.insert(trips).values({
      name: name || "My New Trip",
      destination: destination || "TBD",
      userId: currentUser.id,
    }).returning();

    await db.insert(participants).values({
      userId: currentUser.id,
      tripId: newTrip.id,
      role: "owner",
    });

    const [newCart] = await db.insert(carts).values({
      tripId: newTrip.id,
    }).returning();

    return NextResponse.json({ success: true, trip: newTrip, cart: newCart });
  } catch (error) {
    console.error("Trips API POST Error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}

// ==========================================
// PUT: Update an existing trip
// ==========================================
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, destination, startDate, endDate } = body;

    if (!id) return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });

    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email));
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [participation] = await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.tripId, Number(id)), // Forced to Number for safety
          eq(participants.userId, currentUser.id)
        )
      );

    if (!participation) {
      return NextResponse.json({ error: "Unauthorized to edit this trip" }, { status: 403 });
    }

    const [updatedTrip] = await db.update(trips)
      .set({
        name,
        destination,
        startDate: startDate ? String(startDate) : null,
        endDate: endDate ? String(endDate) : null,
      })
      .where(eq(trips.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, trip: updatedTrip });
  } catch (error) {
    console.error("Trips API PUT Error:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete a trip entirely
// ==========================================
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });

    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email));
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [participation] = await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.tripId, Number(id)),
          eq(participants.userId, currentUser.id)
        )
      );

    if (!participation || participation.role !== 'owner') {
      return NextResponse.json({ error: "Only the owner can delete this trip" }, { status: 403 });
    }

    await db.delete(trips).where(eq(trips.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trips API DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}