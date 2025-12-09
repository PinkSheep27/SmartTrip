import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const googleToken = request.cookies.get('google_provider_token')?.value;

  if (!googleToken) {
    console.error("Missing Google Provider Token");
    return NextResponse.json({ error: "Google Calendar connection missing. Please sign out and sign in again." }, { status: 401 });
  }

  const timeMin = new Date().toISOString(); 
  
  try {
    const googleRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=20`,
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!googleRes.ok) {
        const errorData = await googleRes.json();
        console.error("Google Calendar API Error:", errorData);
        if (googleRes.status === 401) {
             return NextResponse.json({ error: "Google token expired" }, { status: 401 });
        }
        throw new Error("Failed to fetch from Google Calendar");
    }

    const data = await googleRes.json();
    return NextResponse.json(data.items);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}