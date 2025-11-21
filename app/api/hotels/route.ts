import { NextRequest, NextResponse } from "next/server";

// Token caching
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Amadeus API credentials not configured");
  }

  const response = await fetch(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: apiKey,
        client_secret: apiSecret,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Failed to get token");
  }

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;

  return cachedToken;
}

// Obtains all hotelIds within a given location
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lng = Number(searchParams.get("lng"));
  const lat = Number(searchParams.get("lat"));
  const radius = searchParams.get("radius") || "25";

  if (isNaN(lng) || isNaN(lat)) {
    return NextResponse.json(
      { error: "Missing required parameters: lng, lat" },
      { status: 400 }
    );
  }

  try {
    const token = await getAccessToken();

    // Fetch nearby hotels
    const hotelsUrl = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${lat}&longitude=${lng}&radius=${radius}&radiusUnit=KM`;

    const hotelsResponse = await fetch(hotelsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!hotelsResponse.ok) {
      let body;
      try {
        body = await hotelsResponse.json();
      } catch {
        body = {};
      }
      throw new Error(body.errors?.[0]?.detail || "Failed to fetch hotels");
    }

    const hotelsData = await hotelsResponse.json();
    const rawHotels = Array.isArray(hotelsData.data) ? hotelsData.data : [];

    // Extract just the hotel IDs and basic info
    const allHotels = hotelsData.data.map((hotel: any) => {
      return {
        id: hotel.hotelId,
        name: hotel.name,
        image: `https://via.placeholder.com/800x600?text=${encodeURIComponent(
          hotel.name
        )}`,
        location: hotel.address?.cityName || "Unknown location",
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      };
    });
    console.log(`Found ${allHotels.length} hotels in the area`);
    const allHotelIds = allHotels.map((hotel: any) => hotel.id);

    return NextResponse.json({
      allHotels,
      totalHotels: allHotels.length,
      allHotelIds,
    });
  } catch (error) {
    console.error("Hotels search error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to search hotels",
      },
      { status: 500 }
    );
  }
}
