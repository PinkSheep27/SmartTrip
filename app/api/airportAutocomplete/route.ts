import { NextResponse } from "next/server";
import { Duffel } from "@duffel/api";

// Initialize Duffel with your test token
const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const keyword = url.searchParams.get("keyword");

  if (!keyword || keyword.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // CORRECTED: Use suggestions.list instead of places.suggest
    const response = await duffel.suggestions.list({ 
      query: keyword 
    });

    // Map Duffel's response format to match what your React components expect
    const suggestions = response.data
      .filter((place: any) => place.iata_code)
      .map((place: any) => ({
        code: place.iata_code,
        name: `${place.name} (${place.iata_code})`,
        type: place.type ? place.type.toUpperCase() : "AIRPORT",
      }));

    return NextResponse.json({ suggestions });

  } catch (err) {
    console.error("Server Error in Duffel Autocomplete:", err);
    return NextResponse.json({ error: "Server failed to process request" }, { status: 500 });
  }
}