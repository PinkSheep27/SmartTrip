"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";


const airlineLookup: { [code: string]: string } = {
  "AA": "American Airlines",
  "AS": "Alaska Airlines",
  "B6": "JetBlue Airways",
  "DL": "Delta Air Lines",
  "F9": "Frontier Airlines",
  "HA": "Hawaiian Airlines",
  "NK": "Spirit Airlines",
  "OO": "SkyWest Airlines",
  "UA": "United Airlines",
  "WN": "Southwest Airlines",
  "YX": "Republic Airline",
  "EV": "ExpressJet Airlines",
  "MQ": "Envoy Air",
  "9E": "Endeavor Air",
  "G7": "GoJet Airlines",
  "OH": "PSA Airlines",
  // add more codes as needed
};

type Flight = {
  airline: string;
  departAirport: string;
  arriveAirport: string;
  departureTime: string;
  duration: string;
  price: number | string;
};

const FlightResultsContent: React.FC = () => {
  const params = useSearchParams();

  //Initial Read Params from URL
  const tripType = params.get("tripType") || "";
  const departing = params.get("departing") || "";
  const arriving = params.get("arriving") || "";
  const departureDate = params.get("departureDate") || "";
  const returnDate = params.get("returnDate") || "";

  // Editable state for user input
  const [tripTypeState, setTripTypeState] = React.useState(tripType);
  const [departingState, setDepartingState] = React.useState(departing);
  const [arrivingState, setArrivingState] = React.useState(arriving);
  const [departureDateState, setDepartureDateState] = React.useState(departureDate);
  const [returnDateState, setReturnDateState] = React.useState(returnDate);

  const [Flights, setFlights] = React.useState<Flight[]>([]);
  const [page, setPage] = React.useState(1);          // current page
  const [hasMore, setHasMore] = React.useState(true); // flag if more results exist
  const [loading, setLoading] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"" | "price" | "departure" | "duration" | "airline">("")  
  const [airlineFilter, setAirlineFilter] = React.useState("");
  
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  
  const filteredFlights = Flights.filter(f => airlineFilter === "" || f.airline === airlineFilter);
  const sortedFlights = sortFlights(Flights, sortBy);

  function formatShortDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    // Example → "6:29 AM"
  }

  

  React.useEffect(() => {
    async function fetchFlights(reset = false) {
      if (loading) return;
      setLoading(true);

      const query: { [key: string]: string } = {
      tripType: tripTypeState,
      departing: departingState,
      departureDate: departureDateState,
      page: page.toString(),
      limit: "10",
    };

    // Only include arriving and returnDate for roundtrip
    if (tripTypeState === "roundtrip") {
      query.arriving = arrivingState;
      query.returnDate = returnDateState;
    }

    const searchParams = new URLSearchParams(query);

    try {
      const res = await fetch(`/api/searchFlights?${searchParams.toString()}`);
      const data = await res.json();

      const newFlights: Flight[] = (data.flights || []).map((flight: any) => ({
        ...flight,
        airline: airlineLookup[flight.airline] || flight.airline,
      }));

      setFlights(prev => reset ? newFlights : [...prev, ...newFlights]);
      setHasMore(newFlights.length > 0);
    } catch (err) {
      console.error("Error fetching flights:", err);
      setFlights([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

    fetchFlights(page === 1); //reset if on first page
  }, [tripTypeState, departingState, arrivingState, departureDateState, returnDateState, page]);

  function sortFlights(flights: Flight[], sortBy: string) {
  if (sortBy === "") return flights;

  const sorted = [...flights];

  switch (sortBy) {
    case "price":
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
      break;

    case "departure":
      sorted.sort(
        (a, b) =>
          new Date(a.departureTime).getTime() -
          new Date(b.departureTime).getTime()
      );
      break;

    case "duration":
      sorted.sort((a, b) => {
        const toMinutes = (d: string) => {
          const hours = d.match(/(\d+)H/)?.[1] ?? 0;
          const minutes = d.match(/(\d+)M/)?.[1] ?? 0;
          return Number(hours) * 60 + Number(minutes);
        };
        return toMinutes(a.duration) - toMinutes(b.duration);
      });
      break;

    case "airline":
      sorted.sort((a, b) => a.airline.localeCompare(b.airline));
      break;
  }

  return sorted;
}

  const uniqueAirlines = Array.from(new Set(Flights.map(f => f.airline)));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-40">

      {/* Top Filter / Info Bar */}
      <div className="bg-white shadow-md rounded-xl p-4 flex justify-around items-center m-6">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-gray-600">From:</span>
          <span className="text-lg">{departingState}</span>
        </div>

        
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-600">To:</span>
            <span className="text-lg">{arrivingState}</span>
          </div>
        

        <div className="flex flex-col items-center">
          <span className="font-semibold text-gray-600">Depart:</span>
          <span className="text-lg">{departureDateState}</span>
        </div>

        {tripTypeState === "roundtrip" && (
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-600">Return:</span>
            <span className="text-lg">{returnDateState}</span>
          </div>
        )}
      </div>
  
  {/* Editable Departure / Arrival Inputs */}
      <div className="flex justify-center space-x-4 mb-6">
        <input
          type="text"
          value={departingState}
          onChange={e => setDepartingState(e.target.value)}
          placeholder="Departing Airport"
          className="border rounded px-3 py-1"
        />
        
        <input
          type="text"
          value={arrivingState}
          onChange={e => setArrivingState(e.target.value)}
          placeholder="Arrival Airport"
          className="border rounded px-3 py-1"
        />

        <input
          type="date"
          value={departureDateState}
          onChange={e => setDepartureDateState(e.target.value)}
          className="border rounded px-3 py-1"
          min={today}
        />
        {tripTypeState === "roundtrip" && (
        <input
          type="date"
          value={returnDateState}
          onChange={e => setReturnDateState(e.target.value)}
          className="border rounded px-3 py-1"
          min={departureDateState || today} 
        />
  )}
        
        <button
          onClick={() => setPage(1)} // triggers useEffect to refetch
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>
  {/* Editable Trip type selection */}
    <div className="flex gap-6 mb-4 justify-center">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="tripType"
        value="oneway"
        checked={tripTypeState === "oneway"}
        onChange={() => setTripTypeState("oneway")}
      />
      One-way
    </label>

    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="tripType"
        value="roundtrip"
        checked={tripTypeState === "roundtrip"}
        onChange={() => setTripTypeState("roundtrip")}
      />
      Round-trip
    </label>
  </div>

      {/* Main Content */}
      <div className="flex flex-1">

    {/* Sort & Filter Bar */}
    <div className="flex flex-col items-center mb-6">
        <div className="bg-white shadow-md rounded-xl p-4 flex items-center space-x-4">
          <span className="font-semibold text-gray-700">Sort by:</span>
          <select
            className="border rounded px-2 py-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="">None</option>
            <option value="departure">Departure</option>
            <option value="price">Price</option>
            <option value="duration">Duration</option>
            <option value="airline">Airline</option>
          </select>

        <span className="font-semibold text-gray-700">Airline:</span>
          <select
            className="border rounded px-2 py-1"
            value={airlineFilter}
            onChange={(e) => setAirlineFilter(e.target.value)}
          >
            <option value="">All</option>
            {uniqueAirlines.map((airline) => (
              <option key={airline} value={airline}>{airline}</option>
            ))}
          </select>
        </div>
        </div>

        {/* Flight Cards Section */}
        <div className="flex-1 m-6 space-y-6">

          {Flights.length === 0 && !loading && (
            <p className="text-gray-600 text-lg">No flights found.</p>
          )}
          {Flights.length === 0 && loading && (
            <p className="text-gray-600 text-lg">Loading flights...</p>
          )}

          {sortedFlights.map((flight: any, i: number) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition-shadow"
            >
              {/* LEFT: Airline + Route + Times */}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{flight.airline}</h3>

                <p className="text-gray-600">
                  <span className="font-medium">{flight.departAirport}</span> →{" "}
                  <span className="font-medium">{flight.arriveAirport}</span>
                </p>

                <p className="text-gray-500 text-sm">
                  {formatShortDate(flight.departureTime)} •{" "}
                  {formatTime(flight.departureTime)}
                </p>
              </div>

              {/* RIGHT: Price + Button */}
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">${flight.price}</p>
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Select
                </button>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const FlightResultsPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading search results...</div>}>
      <FlightResultsContent />
    </Suspense>
  );
};

export default FlightResultsPage;