"use client";

import { useState } from "react";
import Heading from "@/components/DiningComponents/Heading";
import RestaurantList from "@/components/DiningComponents/RestaurantList";

import type { prices } from "@/components/DiningComponents/RestaurantCard";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  price: prices;
  tags: string[];
  waitTime: string;
  address: string;
  photo?: string | null;
  isOpen?: boolean | undefined;
}

export default function DiningSelection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchRestaurants() {
    if (!searchLocation.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First, geocode the location to get coordinates
      const geocodeResponse = await fetch(
        `/api/geocode?address=${encodeURIComponent(searchLocation)}`
      );

      if (!geocodeResponse.ok) {
        throw new Error("Failed to find location");
      }

      const geocodeData = await geocodeResponse.json();

      if (geocodeData.error || !geocodeData.location) {
        throw new Error(geocodeData.error || "Location not found");
      }

      const { lat, lng } = geocodeData.location;

      // Now search for restaurants near this location
      const query = searchTerm.trim() || "restaurant";
      const response = await fetch(
        `/api/DiningRoute?query=${encodeURIComponent(
          query
        )}&location=${lat},${lng}&radius=3000`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }

      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch restaurants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Allow search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchRestaurants();
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br bg-[#94C3D2] p-5">
        <div className="max-w-7xl mx-auto pt-4">
          <Heading></Heading>

          {/* Search and Filter Controls */}
          <div className="mb-8 animate-fade-in">
            {/* Location Search */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-4 w-full max-w-3xl">
                <input
                  type="text"
                  placeholder="Enter city or zip code"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300 text-gray-800 placeholder-gray-500 text-lg transition-all"
                />
                <button
                  type="button"
                  onClick={searchRestaurants}
                  disabled={loading}
                  className={`px-6 py-4 rounded-2xl bg-amber-500 text-white font-semibold shadow-lg hover:bg-amber-600 transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines, or dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-6 py-4 pl-12 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300 text-gray-800 placeholder-gray-500 text-lg transition-all"
                  />

                  {/* Search Icon */}
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                  {/* Clear Button */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {!loading && <RestaurantList restaurants={restaurants} />}
        </div>
        <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease;
        }
      `}</style>
      </div>
    </div>
  );
}
