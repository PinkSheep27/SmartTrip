// app/api/searchFlights/route.ts
import { NextResponse } from "next/server";
import { Duffel } from "@duffel/api";

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

function simplifyFlights(offers: any[]) {
  if (!offers) return [];

  return offers.map((offer: any) => {
    const firstSlice = offer.slices[0];
    const firstSegment = firstSlice.segments[0];
    const lastSegment = firstSlice.segments[firstSlice.segments.length - 1];

    return {
      airline: offer.owner.name, 
      
      price: offer.total_amount,
      departAirport: firstSegment.origin.iata_code,
      arriveAirport: lastSegment.destination.iata_code,
      departureTime: firstSegment.departing_at,
      arrivalTime: lastSegment.arriving_at,
      duration: firstSlice.duration,
    };
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams;

  const tripType = search.get("tripType") || "oneway";
  const departing = search.get("departing")!;
  const arriving = search.get("arriving")!;
  const departureDate = search.get("departureDate")!;
  const returnDate = search.get("returnDate") || "";

  if (!arriving || arriving.length !== 3) {
    return NextResponse.json({ flights: [], error: "Arrival airport must be a 3-letter code" }, { status: 400 });
  }

  if (tripType === "roundtrip" && !returnDate) {
    return NextResponse.json({ flights: [], error: "Return date required for roundtrip" }, { status: 400 });
  }

  try {
    const slices: any[] = [
      {
        origin: departing,
        destination: arriving,
        departure_date: departureDate,
      },
    ];

    if (tripType === "roundtrip") {
      slices.push({
        origin: arriving,
        destination: departing,
        departure_date: returnDate,
      });
    }

    // Call Duffel API
    const offerRequest = await duffel.offerRequests.create({
      // 2. Add 'as any' here to bypass the strict type check
      slices: slices as any,
      passengers: [{ type: "adult" }],
      cabin_class: "economy",
      return_offers: true,
    });

    const simplified = simplifyFlights(offerRequest.data.offers);
    return NextResponse.json({ flights: simplified });
  } catch (err) {
    console.error("Duffel Flight Error:", err);
    return NextResponse.json({ error: "Server failed to fetch flights" }, { status: 500 });
  }
}