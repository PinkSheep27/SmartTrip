"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

const FlightResultsPage: React.FC = () => {
  const params = useSearchParams();

  const departing = params.get("departing") || "—";
  const arriving = params.get("arriving") || "—";
  const tripType = params.get("tripType");

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
          {/* Mock flight cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition-shadow"
            >
              <div>
                <h3 className="text-lg font-semibold">Flight Option {i}</h3>
                <p className="text-gray-600">
                  Airline • Departure Time • Duration
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">$350</p>
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightResultsPage;