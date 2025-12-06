// app/api/airportAutocomplete/route.ts
import { NextResponse } from "next/server";

const AMADEUS_AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_LOCATION_URL = "https://test.api.amadeus.com/v1/reference-data/locations";

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

// Map the complex Amadeus response to a simple format
function mapSuggestions(data: any) {
  if (!data.data) return [];
  
  // 1. Create a Map to store unique suggestions. 
  // The key will be the location code (e.g., "JFK" or "NYC").
  const uniqueSuggestions = new Map<string, any>(); 

  data.data.forEach((location: any) => {
    // Determine the IATA/City code
    const code = location.iataCode || location.address?.cityCode; 

    // 2. Skip if the code is missing OR if we have already added this code
    if (!code || uniqueSuggestions.has(code)) {
      return; 
    }

    // 3. Construct the suggestion object
    const suggestion = {
      code: code, 
      name: `${location.name} (${code})`,
      type: location.subType, // 'AIRPORT' or 'CITY'
    };
    
    // 4. Add the unique suggestion to the map
    uniqueSuggestions.set(code, suggestion);
  });

  // 5. Return the unique suggestions as an array
  return Array.from(uniqueSuggestions.values());
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const keyword = url.searchParams.get("keyword");

  if (!keyword || keyword.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      keyword: keyword,
      subType: "CITY,AIRPORT", // Search for both cities and airports
      view: "LIGHT", // Optimized response size
      "page[limit]": "10",
    });

    const res = await fetch(
      `${AMADEUS_LOCATION_URL}?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Amadeus Autocomplete Error:", data);
      // Return a 500 error, but suppress the detailed Amadeus error
      return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
    }

    const suggestions = mapSuggestions(data);
    return NextResponse.json({ suggestions });

  } catch (err) {
    console.error("Server Error in Autocomplete:", err);
    return NextResponse.json({ error: "Server failed to process request" }, { status: 500 });
  }
}