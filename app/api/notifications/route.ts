import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email));
    if (!currentUser) return NextResponse.json([]);

    // Get all notifications for this user, newest first
    const myNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, currentUser.id))
        .orderBy(desc(notifications.createdAt));

    return NextResponse.json(myNotifications);
  } catch(error) {
    console.error("Notifications API GET Error:", error);
    return NextResponse.json({error: "Failed to fetch notifications"}, {status: 500});
  }
}