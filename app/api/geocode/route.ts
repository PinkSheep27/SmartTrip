import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }
  //
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const location = data.results[0].geometry.location;

    return NextResponse.json({
      ok: true,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      formatted_address: data.results[0].formatted_address,
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
