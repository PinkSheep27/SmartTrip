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

// Search provided hotel IDs for prices
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hotelIds = searchParams.get("hotelIds");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const adults = searchParams.get("adults") || "2";

  if (!hotelIds || !checkInDate || !checkOutDate) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const token = await getAccessToken();

    const offersUrl = `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${adults}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;

    console.log(`Fetching offers for hotels...`);

    const offersResponse = await fetch(offersUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const offersData = await offersResponse.json();

    if (!offersResponse.ok) {
      console.warn("Offers API error:", offersData.errors);
      return NextResponse.json({ hotels: [] });
    }

    if (!offersData.data || offersData.data.length === 0) {
      console.warn("No offers returned for these hotels");
      return NextResponse.json({ hotels: [] });
    }

    console.log(`✅ Found ${offersData.data.length} hotels with offers`);

    // Only return hotels that have valid offers with prices
    const hotels = offersData.data
      .filter((hotelOffer: any) => {
        const offer = hotelOffer.offers?.[0];
        return offer && offer.price && offer.price.total;
      })
      .map((hotelOffer: any) => {
        const hotel = hotelOffer.hotel;
        const offer = hotelOffer.offers[0];

        return {
          id: hotel.hotelId,
          name: hotel.name,
          image: `https://via.placeholder.com/800x600?text=${encodeURIComponent(
            hotel.name
          )}`,
          rating: hotel.rating || 0,
          reviews: 0,
          price: Math.round(parseFloat(offer.price.total)),
          location: hotel.address?.cityName || "Unknown location",
          amenities: hotel.amenities || [],
          distance: hotel.address?.lines?.[0] || "Location available",
          latitude: hotel.latitude,
          longitude: hotel.longitude,
          currency: offer.price.currency || "USD",
          offerId: offer.id,
        };
      });

    console.log(`📦 Returning ${hotels.length} hotels with valid prices`);

    return NextResponse.json({ hotels });
  } catch (error) {
    console.error("Hotels price search error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to search hotel offers",
      },
      { status: 500 }
    );
  }
}