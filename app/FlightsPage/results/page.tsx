"use client";

import React from "react";
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

const FlightResultsPage: React.FC = () => {
  const params = useSearchParams();

  const tripType = params.get("tripType") || "";
  const departing = params.get("departing") || "";
  const arriving = params.get("arriving") || "";
  const departureDate = params.get("departureDate") || "";
  const returnDate = params.get("returnDate") || "";

  const [Flights, setFlights] = React.useState([]);
  const [page, setPage] = React.useState(1);          // current page
  const [hasMore, setHasMore] = React.useState(true); // flag if more results exist
  const [loading, setLoading] = React.useState(false);


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

  async function fetchFlights(reset = false) {
    if (loading) return;
    setLoading(true);

    const query = new URLSearchParams({
      tripType,
      departing,
      arriving,
      departureDate,
      returnDate,
      page: page.toString(),
      limit: "10", // number of flights per batch
    });

    const res = await fetch(`/api/searchFlights?${query.toString()}`);
    const data = await res.json();
    const newFlights = (data.flights || []).map((flight: any) => ({
      ...flight,
      airline: airlineLookup[flight.airline] || flight.airline,
    }));

    setFlights(prev => (reset ? newFlights : [...prev, ...newFlights]));
    setHasMore(newFlights.length > 0);
    setLoading(false);
  }

  React.useEffect(() => {
    async function fetchFlights(reset = false) {
      if (loading) return;
      setLoading(true);

      const query = new URLSearchParams({
        tripType,
        departing,
        arriving,
        departureDate,
        returnDate,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/searchFlights?${query.toString()}`);
      const data = await res.json();

      const newFlights = (data.flights || []).map((flight: any) => ({
        ...flight,
        airline: airlineLookup[flight.airline] || flight.airline,
      }));

      setFlights(prev => reset ? newFlights : [...prev, ...newFlights]);
      setHasMore(newFlights.length > 0);
      setLoading(false);
    }

    fetchFlights(page === 1); //reset if on first page
  }, [tripType, departing, arriving, departureDate, returnDate, page]);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top Filter / Info Bar */}
      <div className="bg-white shadow-md rounded-xl p-4 flex justify-around items-center m-6">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-gray-600">From:</span>
          <span className="text-lg">{departing}</span>
        </div>

        {tripType === "roundtrip" && (
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-600">To:</span>
            <span className="text-lg">{arriving}</span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <span className="font-semibold text-gray-600">Depart:</span>
          <span className="text-lg">{departureDate}</span>
        </div>

        {tripType === "roundtrip" && (
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-600">Return:</span>
            <span className="text-lg">{returnDate}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1">

        {/* Sorting Sidebar */}
        <div className="w-1/5 bg-white m-6 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Sorting Options</h2>
          <ul className="space-y-3 text-gray-700">
            <li>🕓 Departure Time</li>
            <li>💰 Price</li>
            <li>⏱ Duration</li>
          </ul>
        </div>

        {/* Flight Cards Section */}
        <div className="flex-1 m-6 space-y-6">

          {Flights.length === 0 && !loading && (
            <p className="text-gray-600 text-lg">No flights found.</p>
          )}
          {Flights.length === 0 && loading && (
            <p className="text-gray-600 text-lg">Loading flights...</p>
          )}

          {Flights.map((flight: any, i: number) => (
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

export default FlightResultsPage;