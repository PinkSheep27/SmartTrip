import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const location = searchParams.get("location") || "40.7128,-74.0060"; // Default: NYC
  const radius = searchParams.get("radius") || "3000"; // meters

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  //https://maps.googleapis.com/maps/api/place/nearbysearch/json
  try {
    console.log(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=${query}&key=${apiKey}`
    );
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=${query}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(data.error_message || "Failed to fetch restaurants");
    }

    // Transform data to match your Restaurant interface
    const restaurants = data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      cuisine: place.types?.[0] || "Restaurant",
      rating: place.rating || 0,
      distance: "Calculating...",
      price: "$".repeat(Math.min(3, place.price_level || 2)),
      tags: place.types?.slice(0, 3) || [],
      address: place.vicinity,
      photo: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
        : null,
      isOpen: place.opening_hours?.open_now,
    }));
    console.log(restaurants);
    return NextResponse.json(restaurants, { status: 200 });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}
