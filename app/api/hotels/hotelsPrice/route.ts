import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hotelIdsStr = searchParams.get("hotelIds");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const adultsStr = searchParams.get("adults") || "1";

  if (!hotelIdsStr || !checkInDate || !checkOutDate) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    // Keep the limit of 5 for now to protect your 500 requests/mo limit
    const ids = hotelIdsStr.split(",").slice(0, 5);

    const hotelPromises = ids.map(async (id) => {
      try {
        // Updated to your specific host and endpoint structure
        const res = await fetch(
          `https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelDetails?hotel_id=${id}&arrival_date=${checkInDate}&departure_date=${checkOutDate}&adults=${adultsStr}&children_age=1%2C17&room_qty=1&languagecode=en-us&currency_code=USD`,
          {
            headers: {
              'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
              'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
            }
          }
        );
        
        const json = await res.json();
        const data = json.data;

        if (!data) return null;

        return {
          id: id,
          name: data.hotel_name || "Hotel Details",
          image: data.main_photo_url || data.rooms?.[0]?.photos?.[0]?.url_maxres || `https://via.placeholder.com/800x600?text=Hotel`,
          rating: data.review_score || 4.0,
          
          // REAL PRICE: Pulling from the product_price or composite price field
          // We default to 0 if neither exists so you can clearly see if a price is missing
          price: Math.round(data.product_price?.item?.amount_rounded || data.composite_price_breakdown?.all_inclusive_amount?.value || 0),
          
          location: data.city || "City Center",
          latitude: data.latitude,
          longitude: data.longitude,
          currency: "USD",
        };
      } catch (e) {
        console.error(`Error fetching hotel ${id}:`, e);
        return null;
      }
    });

    const hotels = (await Promise.all(hotelPromises)).filter(Boolean);

    return NextResponse.json({ hotels });
    
  } catch (error) {
    console.error("Hotels price search error:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}