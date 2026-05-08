import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lng = Number(searchParams.get("lng"));
  const lat = Number(searchParams.get("lat"));

  if (isNaN(lng) || isNaN(lat)) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // ---------------------------------------------------------
    // STEP 1: Convert Map Coordinates to a City Name (Free)
    // ---------------------------------------------------------
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "SmartTripApp/1.0" } }
    );
    const geoData = await geoRes.json();
    
    // Extract the city, town, or default to a safe fallback
    const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || "New York";

    // ---------------------------------------------------------
    // STEP 2: Get the dest_id from RapidAPI
    // ---------------------------------------------------------
    const destRes = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(cityName)}`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      }
    );
    const destData = await destRes.json();
    
    // Grab the first valid destination ID
    const firstDest = destData?.data?.[0];
    if (!firstDest || !firstDest.dest_id) {
      return NextResponse.json({ error: "Could not find a valid destination ID" }, { status: 404 });
    }

    const destId = firstDest.dest_id;
    const searchType = firstDest.search_type || "CITY";

    // ---------------------------------------------------------
    // STEP 3: Search Hotels with the dest_id and Mock Dates
    // ---------------------------------------------------------
    // Generate fallback dates (+7 and +8 days) to ensure Booking.com returns availability
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 8);
    const checkInStr = checkIn.toISOString().split("T")[0];
    const checkOutStr = checkOut.toISOString().split("T")[0];

    const hotelsRes = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=${destId}&search_type=${searchType}&arrival_date=${checkInStr}&departure_date=${checkOutStr}&adults=1&room_qty=1&currency_code=USD`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      }
    );
    const hotelsData = await hotelsRes.json();

    // ---------------------------------------------------------
    // DATA MAPPING
    // ---------------------------------------------------------
    // RapidAPI wrappers nest data differently. This safely checks multiple common paths.
    const resultsArray = hotelsData?.data?.hotels || hotelsData?.data || [];

    const allHotels = resultsArray.map((hotel: any) => {
      // Handle the "property" nested object if the API uses it, otherwise fall back to top-level
      const prop = hotel.property || hotel; 
      
      return {
        id: prop.hotel_id?.toString() || prop.id?.toString(),
        name: prop.hotel_name || prop.name || "Unknown Hotel",
        image: prop.max_photo_url || prop.photoUrls?.[0] || `https://via.placeholder.com/800x600?text=Hotel`,
        location: cityName,
        latitude: prop.latitude || lat,
        longitude: prop.longitude || lng,
        price: prop.min_total_price || prop.priceBreakdown?.grossPrice?.value || null,
      };
    });

    return NextResponse.json({
      allHotels,
      totalHotels: allHotels.length,
      allHotelIds: allHotels.map((h: any) => h.id),
    });

  } catch (error) {
    console.error("RapidAPI Chained Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }
}