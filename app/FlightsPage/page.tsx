"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const FlightPage: React.FC = () => {
  const router = useRouter();

  // Trip type
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("roundtrip");

  // Airports
  const [departing, setDeparting] = useState("");
  const [arriving, setArriving] = useState("");

  // Dates
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  // Handle search
  const handleSearch = () => {
    // Basic validation
    if (!departing) {
      alert("ERROR: Please enter a departing airport.");
      return;
    }

    if (tripType === "roundtrip" && !arriving) {
      alert("ERROR: Please enter an arriving airport.");
      return;
    }

    if (!departureDate) {
      alert("ERROR: Please select a departure date.");
      return;
    }

    if (tripType === "roundtrip" && returnDate < departureDate) {
      alert("ERROR: Return date cannot be before departure date.");
      return;
    }

    // Build URL params
    const params = new URLSearchParams({
      tripType,
      departing,
      arriving: tripType === "roundtrip" ? arriving : "",
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : "",
    });

    router.push(`/flights/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#94C3D2] flex flex-col items-center pt-20">
      {/* Trip Type Selector */}
      <div className="flex gap-6 mb-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tripType"
            value="oneway"
            checked={tripType === "oneway"}
            onChange={() => setTripType("oneway")}
          />
          One-way
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tripType"
            value="roundtrip"
            checked={tripType === "roundtrip"}
            onChange={() => setTripType("roundtrip")}
          />
          Round-trip
        </label>
      </div>

      {/* Airports Input */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Departing Airport"
          value={departing}
          onChange={(e) => setDeparting(e.target.value)}
          className="p-3 border rounded-lg w-56"
        />

        {tripType === "roundtrip" && (
          <>
            <span className="text-2xl">→</span>
            <input
              type="text"
              placeholder="Arriving Airport"
              value={arriving}
              onChange={(e) => setArriving(e.target.value)}
              className="p-3 border rounded-lg w-56"
            />
          </>
        )}
      </div>

      {/* Dates Input */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          className="p-3 border rounded-lg w-56"
          min={today}
        />

        {tripType === "roundtrip" && (
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="p-3 border rounded-lg w-56"
            min={departureDate || today}
          />
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Search Flights
      </button>
    </div>
  );
};

export default FlightPage;
