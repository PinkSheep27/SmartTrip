import { NextRequest, NextResponse } from "next/server";

// Token caching
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  // Reuse token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Amadeus API credentials not configured");
  }
  //Request token
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

//Obtain hotels within an area, not checking if it has a price or not
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lng = Number(searchParams.get("lng"));
  const lat = Number(searchParams.get("lat"));
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const adults = searchParams.get("adults") || "2";
  const radius = searchParams.get("radius") || "25";

  if (!lng || !lat || !checkInDate || !checkOutDate) {
    return NextResponse.json(
      {
        error:
          "Missing required parameters: lng, lat, checkInDate, checkOutDate",
      },
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

    const hotelsData = await hotelsResponse.json();

    if (!hotelsResponse.ok) {
      throw new Error(
        hotelsData.errors?.[0]?.detail || "Failed to fetch hotels"
      );
    }

    const allHotelIds =
      hotelsData.data?.map((hotel: any) => hotel.hotelId) || [];
    if (!allHotelIds.length) {
      return NextResponse.json({ hotels: [] });
    }

    console.log(
      `Found ${allHotelIds.length} hotels. Fetching offers in chunks...`
    );

    // Split hotel IDs into chunks of 50 (Amadeus limit)
    const MAX_PER_BATCH = 50;
    const chunks: string[][] = [];
    for (let i = 0; i < allHotelIds.length; i += MAX_PER_BATCH) {
      chunks.push(allHotelIds.slice(i, i + MAX_PER_BATCH));
    }

    const offerRequests = chunks.map((chunk, index) => {
      const hotelIds = chunk.join(",");
      const offersUrl = `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${adults}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;

      console.log(
        `🔹 Fetching batch ${index + 1}/${chunks.length} (${
          chunk.length
        } hotels)...`
      );

      return fetch(offersUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.data) {
            console.warn(`⚠️ Batch ${index + 1} returned no offers`);
            return [];
          }
          console.log(
            `✅ Batch ${index + 1}: received ${data.data.length} offers`
          );
          return data.data;
        })
        .catch((err) => {
          console.warn(`⚠️ Batch ${index + 1} failed`, err);
          return [];
        });
    });

    // Run all API calls in parallel
    const allOffersArrays = await Promise.all(offerRequests);

    // Flatten into a single array
    const allOffers = allOffersArrays.flat();

    // for (const [index, chunk] of chunks.entries()) {
    //   const hotelIds = chunk.join(",");
    //   const offersUrl = `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${adults}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;

    //   console.log(
    //     `🔹 Fetching batch ${index + 1}/${chunks.length} (${
    //       chunk.length
    //     } hotels)...`
    //   );

    //   const offersResponse = await fetch(offersUrl, {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });

    //   const offersData = await offersResponse.json();

    //   if (!offersResponse.ok) {
    //     console.warn(
    //       `⚠️ Batch ${index + 1} failed:`,
    //       offersData.errors?.[0]?.detail || offersData
    //     );
    //     continue;
    //   }

    //   if (offersData.data) {
    //     allOffers = allOffers.concat(offersData.data);
    //     console.log(
    //       `✅ Batch ${index + 1}: received ${offersData.data.length} offers`
    //     );
    //   } else {
    //     console.log(`⚠️ Batch ${index + 1}: no offers found`);
    //   }
    // }

    console.log(`🎯 Total offers fetched: ${allOffers.length}`);

    const hotels = allOffers.map((hotelOffer: any) => {
      const hotel = hotelOffer.hotel;
      const offer = hotelOffer.offers?.[0];

      return {
        id: hotel.hotelId,
        name: hotel.name,
        image: `https://via.placeholder.com/800x600?text=${encodeURIComponent(
          hotel.name
        )}`,
        rating: hotel.rating || 0,
        reviews: 0,
        price: offer ? Math.round(parseFloat(offer.price.total)) : 0,
        location: hotel.address?.cityName || "Unknown location",
        amenities: hotel.amenities?.slice(0, 5) || [],
        distance:
          hotel.latitude && hotel.longitude
            ? calculateDistance(lat, lng, hotel.latitude, hotel.longitude)
            : "Location available",
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        currency: offer?.price?.currency || "USD",
        offerId: offer?.id,
      };
    });

    return NextResponse.json({ hotels });
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

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance < 1
    ? `${Math.round(distance * 1000)}m away`
    : `${distance.toFixed(1)} km away`;
}
