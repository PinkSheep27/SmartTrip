import { NextRequest, NextResponse } from "next/server";
interface Activity {}

//Obtain Attractions/Experiences from Rapid API
export async function GET(request: NextRequest) {
  //https://tripadvisor16.p.rapidapi.com/api/v1/attractions/list?latitude=${lat}&longitude=${lng}&distance=10&language=en_US,
  const params = request.nextUrl.searchParams;
  const lat = params.get("lat");
  const lng = params.get("lng");

  const response = await fetch(
    `https://tripadvisor16.p.rapidapi.com/api/v1/attractions/list?latitude=${lat}&longitude=${lng}&distance=10&language=en_US`,
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
        "X-RapidAPI-Host": "tripadvisor16.p.rapidapi.com",
      },
    }
  );
  const activities: Activity[] = [];
  if (!response.ok) {
    console.error("TripAdvisor error:", await response.text());
    return NextResponse.json(activities, { status: 200 });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
