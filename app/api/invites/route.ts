import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, trips, participants, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST: Send an invite to a user
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { email, tripId } = await request.json();

    // 1. Validate Sender & Receiver
    const [sender] = await db.select().from(users).where(eq(users.email, user.email));
    if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });

    const [receiver] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (!receiver) {
        return NextResponse.json({ error: "User does not exist. Please check the email address." }, { status: 404 });
    }

    if (sender.id === receiver.id) {
        return NextResponse.json({ error: "You cannot invite yourself!" }, { status: 400 });
    }

    // 2. Check if they are already in the trip
    const [existing] = await db.select().from(participants)
      .where(and(eq(participants.tripId, tripId), eq(participants.userId, receiver.id)));
    
    if (existing) {
        return NextResponse.json({ error: `User is already ${existing.status} for this trip.` }, { status: 400 });
    }

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));

    // 3. Add to participants as 'pending'
    await db.insert(participants).values({
      userId: receiver.id,
      tripId: tripId,
      role: "member",
      status: "pending"
    });

    // 4. Send the notification to their inbox
    await db.insert(notifications).values({
      userId: receiver.id,
      senderId: sender.id,
      tripId: tripId,
      type: "trip_invite",
      message: `${sender.name || sender.email} invited you to join their trip: ${trip.name}.`,
      status: "unread"
    });

    return NextResponse.json({ success: true, message: "Invite sent successfully!" });
  } catch (error) {
    console.error("Invite POST Error:", error);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}

// PUT: Accept or Decline an invite
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { notificationId, action } = await request.json(); // action: 'accept' or 'decline'
    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email));

    const [notification] = await db.select().from(notifications).where(eq(notifications.id, notificationId));
    if (!notification || notification.userId !== currentUser.id) {
       return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    const tripId = notification.tripId;

    if (action === 'accept') {
      // 1. Update status to accepted
      await db.update(participants)
        .set({ status: 'accepted' })
        .where(and(eq(participants.tripId, tripId!), eq(participants.userId, currentUser.id)));

      // 2. Notify the original sender
      if (notification.senderId) {
         await db.insert(notifications).values({
            userId: notification.senderId,
            tripId: tripId,
            type: "invite_accepted",
            message: `${currentUser.name || currentUser.email} accepted your invite!`,
            status: "unread"
         });
      }
    } else if (action === 'decline') {
      // 1. Remove them from the participants table completely
      await db.delete(participants)
        .where(and(eq(participants.tripId, tripId!), eq(participants.userId, currentUser.id)));

       // 2. Notify the original sender
      if (notification.senderId) {
         await db.insert(notifications).values({
            userId: notification.senderId,
            tripId: tripId,
            type: "invite_declined",
            message: `${currentUser.name || currentUser.email} declined your invite.`,
            status: "unread"
         });
      }
    }

    // 3. Mark the original invite notification as 'actioned' so the buttons disappear
    await db.update(notifications).set({ status: 'actioned' }).where(eq(notifications.id, notificationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Invite PUT Error:", error);
    return NextResponse.json({ error: "Failed to process invite" }, { status: 500 });
  }
}