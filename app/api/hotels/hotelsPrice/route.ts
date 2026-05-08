import { NextRequest, NextResponse } from "next/server";
import { Duffel } from "@duffel/api";

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hotelIdsStr = searchParams.get("hotelIds");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const adultsStr = searchParams.get("adults") || "2";

  if (!hotelIdsStr || !checkInDate || !checkOutDate) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const ids = hotelIdsStr.split(",").slice(0, 50);

    // 1. Intercept our fallback mock IDs so they don't break the Duffel API
    if (ids[0].startsWith("mock_hotel")) {
      const mockHotels = ids.map((id, i) => ({
        id,
        name: id === "mock_hotel_1" ? "The Grand Skyline Hotel" : "Metropolis Boutique Suites",
        image: id === "mock_hotel_1" 
          ? "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" 
          : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        price: 180 + (i * 45), // Generate a realistic fake price
        location: "City Center",
        latitude: 0,
        longitude: 0,
        currency: "USD",
      }));
      return NextResponse.json({ hotels: mockHotels });
    }

    // 2. If it's a real Duffel ID, fetch the live price
    const guests = Array(Number(adultsStr)).fill({ type: "adult" });

    const response = await duffel.stays.search({
      accommodation: { ids },
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      rooms: 1,
      guests,
    });

    const results = response.data.results || [];
    
    const hotels = results
      .filter((result: any) => result.cheapest_rate_total_amount)
      .map((result: any) => {
        const hotel = result.accommodation;
        return {
          id: hotel.id,
          // Match the consistent naming format from the first route
          name: hotel.name.includes("Duffel") ? "Plaza Hotel & Suites" : hotel.name,
          image: hotel.photos?.[0]?.url || `https://via.placeholder.com/800x600?text=${encodeURIComponent(hotel.name)}`,
          rating: hotel.rating || 4, // Default to a 4-star rating if missing
          price: Math.round(parseFloat(result.cheapest_rate_total_amount)),
          location: hotel.location?.address?.city_name || "City Center",
          latitude: hotel.location?.geographic_coordinates?.latitude,
          longitude: hotel.location?.geographic_coordinates?.longitude,
          currency: result.cheapest_rate_currency || "USD",
        };
      });

    return NextResponse.json({ hotels });
  } catch (error) {
    console.error("Hotels price search error:", error);
    return NextResponse.json({ error: "Failed to search hotel offers" }, { status: 500 });
  }
}