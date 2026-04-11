import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, trips, participants, carts } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

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

    const userParticipations = await db.select({ tripId: participants.tripId }).from(participants).where(eq(participants.userId, currentUser.id));
    const tripIds = userParticipations.map(p => p.tripId);

    if (tripIds.length === 0) return NextResponse.json([]);

    const myTrips = await db
      .select({
        id: trips.id,
        name: trips.name,
        destination: trips.destination,
        cartId: carts.id, // Now the frontend can see the Cart ID
      })
      .from(trips)
      .leftJoin(carts, eq(trips.id, carts.tripId))
      .where(inArray(trips.id, tripIds));

    const allParticipants = await db
      .select({ tripId: participants.tripId, userName: users.name, userEmail: users.email, role: participants.role })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(inArray(participants.tripId, tripIds));

      /*
    const tripsWithContributors = myTrips.map(trip => ({
      ...trip,
      contributors: allParticipants.filter(p => p.tripId === trip.id)
    }));
    */

    return NextResponse.json(myTrips);
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

    // 1. Get the current user
    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email));
    if (!currentUser) {
      return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
    }

    // 2. Create the new Trip
    const [newTrip] = await db.insert(trips).values({
      name: name || "My New Trip",
      destination: destination || "TBD",
      userId: currentUser.id,
    }).returning();

    // 3. Add the user to the Participants table
    await db.insert(participants).values({
      userId: currentUser.id,
      tripId: newTrip.id,
      role: "owner",
    });

    // 4. Create an empty Cart for this trip
    const [newCart] = await db.insert(carts).values({
      tripId: newTrip.id,
    }).returning();

    return NextResponse.json({ success: true, trip: newTrip, cart: newCart });
  } catch (error) {
    console.error("Trips API POST Error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}