import { NextRequest, NextResponse } from "next/server";
import { Attractions } from "@/app/ExperiencePage/page";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = params.get("lat");
  const lon = params.get("lon");
  const type = params.get("type") || "interesting_places";

  const format = "json";

  //Empty Input Validation
  if (!lat || !lon || !type) {
    return NextResponse.json(
      { error: "Missing lat or lon parameters" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEOAPIFY_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.geoapify.com/v2/places?categories=${type}&filter=circle:${lon},${lat},3000&limit=20
    &apiKey=${apiKey}
`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Geoapify API error:", errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("______________________________________________________");
    console.log(data);
    console.log("______________________________________________________");
    if (!data.features || !Array.isArray(data.features)) {
      return NextResponse.json([], { status: 200 });
    }

    const attractions: Attractions[] = data.features.map((feature: any) => {
      const p = feature.properties;
      return {
        id:
          p.place_id ||
          p.name?.replace(/\s+/g, "_") ||
          Math.random().toString(),

        name: p.name || "Unknown Attraction",

        description: p.formatted || "",

        categories: p.categories || [],

        image: "", // Geoapify Places API does NOT provide images

        formattedAddress: p.formatted || "",

        location: [
          feature.geometry.coordinates[0], // longitude
          feature.geometry.coordinates[1], // latitude
        ],
      };
    });

    console.log(attractions);
    return NextResponse.json({ attractions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching attractions:", error);
    return NextResponse.json(
      { error: "Failed to fetch attractions" },
      { status: 500 }
    );
  }
}
