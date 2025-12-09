import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // 1. Get the current user session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.provider_token) {
    return NextResponse.json({ error: "No Google provider token found. Please sign in with Google." }, { status: 401 });
  }

  // 2. Fetch Events from Google Calendar API
  // We look for the 'primary' calendar of the logged-in user
  const timeMin = new Date().toISOString(); // Fetch events from now onwards
  
  try {
    const googleRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=20`,
      {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!googleRes.ok) {
        const errorData = await googleRes.json();
        console.error("Google Calendar API Error:", errorData);
        throw new Error("Failed to fetch from Google Calendar");
    }

    const data = await googleRes.json();
    return NextResponse.json(data.items); // Return the array of events

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}