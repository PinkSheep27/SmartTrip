"use client";

import React, { useState } from "react";

const FlightPage: React.FC = () => {
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("roundtrip");
  const [departing, setDeparting] = useState("");
  const [arriving, setArriving] = useState("");

  return (
    <div className="min-h-screen bg-[#94C3D2]">
      <div className="flex flex-col items-center justify-center p-6">
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

        {/*Input Section */}
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

        <div className="flex gap-6">
          <div className="p-4 border rounded-lg w-40 text-center">
            <strong>From:</strong> {departing || "—"}
          </div>

          {tripType === "roundtrip" && (
            <div className="p-4 border rounded-lg w-40 text-center">
              <strong>To:</strong> {arriving || "—"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightPage;
