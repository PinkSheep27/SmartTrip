"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Star,
  Wifi,
  Users,
  Calendar,
  Search,
  ChevronRight,
} from "lucide-react";

export default function ExperiencePage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      getAttractions();
    }
  }
  async function getAttractions() {
    setLoading(true);

    try {
      const geoResponse = await fetch(
        `/api/geocode?address=${encodeURIComponent(searchLocation)}`
      );
      if (!geoResponse.ok) {
        throw new Error("Count not obtain geocode");
      }
      const geocodeData = await geoResponse.json();

      if (geocodeData.error || !geocodeData.location) {
        throw new Error(geocodeData.error || "Location not found");
      }

      const lat = geocodeData.location.lat;
      const lng = geocodeData.location.lng;

      const data = await fetch(`/api/ExperienceRoute?lat=${lat}&lng=${lng}`);
    } catch (error) {
      console.log("Error: " + error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch restaurants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#94C3D2] py-32">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Location */}
            <div className="md:col-span-12">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Where
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94C3D2] w-5 h-5" />
                <input
                  onKeyDown={handleKeyDown}
                  type="text"
                  placeholder="Enter a City"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#94C3D2] text-gray-800 font-medium transition-all hover:border-gray-300"
                />
              </div>
            </div>

            <button
              onClick={getAttractions}
              disabled={loading}
              className={`md:col-span-12 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-4 px-6 rounded-2xl font-bold text-base hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-[1.01] shadow-lg flex items-center justify-center space-x-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Search className="w-6 h-6" />
              <span>
                {loading ? "Searching Activities..." : "Search Activities"}
              </span>
            </button>

            {error && (
              <div className="md:col-span-12 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
