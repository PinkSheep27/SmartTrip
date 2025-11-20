import { NextResponse } from "next/server";

const AMADEUS_AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_FLIGHT_URL = "https://test.api.amadeus.com/v2/shopping/flight-offers";


async function getAccessToken() {
  const res = await fetch(AMADEUS_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_API_KEY!,
      client_secret: process.env.AMADEUS_API_SECRET!,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Amadeus Auth Error:", data);
    throw new Error("Failed to fetch Amadeus token");
  }

  return data.access_token;
}

// 🔹 Shape the Amadeus response into simple flight data
function simplifyFlights(data: any) {
  if (!data.data) return [];

  return data.data.map((offer: any) => {
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    return {
      airline: firstSegment.carrierCode,
      price: offer.price.total,
      departAirport: firstSegment.departure.iataCode,
      arriveAirport: lastSegment.arrival.iataCode,
      departureTime: firstSegment.departure.at,
      arrivalTime: lastSegment.arrival.at,
      duration: itinerary.duration,
    };
  });
}

// 🔹 API Route: searchFlights
export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams;

  const tripType = search.get("tripType") || "oneway";
  const departing = search.get("departing")!;
  const arriving = search.get("arriving")!;
  const departureDate = search.get("departureDate")!;
  const returnDate = search.get("returnDate") || "";
  const adults = "1";

  try {
    const token = await getAccessToken();

    // Build Amadeus query parameters
    const params: any = {
      originLocationCode: departing,
      destinationLocationCode: arriving,
      departureDate,
      adults,
      max: "10",
    };

    if (tripType === "roundtrip") {
      params.returnDate = returnDate;
    }

    // Call Amadeus API
    const res = await fetch(
      `${AMADEUS_FLIGHT_URL}?${new URLSearchParams(params).toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Amadeus Flight Error:", data);
      return NextResponse.json({ flights: [], error: data }, { status: 400 });
    }

    // Make the results usable for your frontend
    const simplified = simplifyFlights(data);

    return NextResponse.json({ flights: simplified });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Server failed" }, { status: 500 });
  }
}