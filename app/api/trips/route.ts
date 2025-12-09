import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, trips, participants } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = user.email;

  try {
    // 1. Find the current user in our public 'users' table
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail));

    if (!currentUser) {
        return NextResponse.json([]);
    }

    // 2. Find all Trip IDs this user is a participant of
    const userParticipations = await db
      .select({ tripId: participants.tripId })
      .from(participants)
      .where(eq(participants.userId, currentUser.id));

    const tripIds = userParticipations.map(p => p.tripId);

    if (tripIds.length === 0) {
      return NextResponse.json([]);
    }

    // 3. Fetch the Trip details
    const myTrips = await db
      .select()
      .from(trips)
      .where(inArray(trips.id, tripIds));

    // 4. Fetch ALL participants for these trips to display "Shared with..."
    const allParticipants = await db
      .select({
        tripId: participants.tripId,
        userName: users.name,
        userEmail: users.email,
        role: participants.role,
      })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(inArray(participants.tripId, tripIds));

    // 5. Combine data
    const tripsWithContributors = myTrips.map(trip => {
        const contributors = allParticipants.filter(p => p.tripId === trip.id);
        return {
            ...trip,
            contributors: contributors
        };
    });

    return NextResponse.json(tripsWithContributors);

  } catch (error) {
    console.error("Trips API Error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}