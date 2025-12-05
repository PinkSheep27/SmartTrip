"use client";

import { useState } from "react";
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  Search,
  ChevronRight,
  Ticket,
  Heart,
  Sparkles,
} from "lucide-react";

export interface Attraction {
  id: string;
  name: string;
  description: string;
  categories?: string[]; // multiple possible categories
  image?: string;
  formattedAddress?: string;
  location: [Number?, Number?]; //long, lati
}

export default function ExperiencePage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedType, setSelectedType] = useState("interesting_places");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [sortBy, setSortBy] = useState("recommended");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      getAttractions();
    }
  }

  async function getAttractions() {
    if (!searchLocation.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError("");
    setAttractions([]);

    try {
      const geoResponse = await fetch(
        `/api/geocode?address=${encodeURIComponent(searchLocation)}`
      );
      if (!geoResponse.ok) {
        throw new Error("Could not obtain geocode");
      }
      const geocodeData = await geoResponse.json();

      if (geocodeData.error || !geocodeData.location) {
        throw new Error(geocodeData.error || "Location not found");
      }

      const lat = geocodeData.location.lat;
      const lng = geocodeData.location.lng;

      const response = await fetch(
        `/api/ExperienceRoute?lat=${lat}&lon=${lng}&type=${selectedType}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attractions");
      }

      const data = await response.json();

      if (data.attractions && data.attractions.length > 0) {
        setAttractions(data.attractions);
      } else {
        setError("No attractions found in this location");
      }
    } catch (error) {
      console.log("Error: " + error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch attractions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#94C3D2] via-[#7FB3C4] to-[#6AA3B3]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Section */}
      <div className="relative pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white font-semibold text-sm">
              Discover Amazing Experiences
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Explore Local Attractions
          </h1>
          <p className="text-xl md:text-2xl text-cyan-100 max-w-3xl mx-auto">
            Find the best tours, activities, and experiences in your destination
          </p>
        </div>

        {/* Search Section */}
        <div className="relative max-w-4xl mx-auto px-6 pb-12">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transform hover:scale-[1.01] transition-all">
            <div className="space-y-6">
              {/* Location Input and Type Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Where do you want to explore?
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94C3D2] w-6 h-6 group-focus-within:scale-110 transition-transform" />
                    <input
                      onKeyDown={handleKeyDown}
                      type="text"
                      placeholder="Enter a city (e.g., New York, Paris, Tokyo)"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full pl-14 pr-4 py-5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#94C3D2] focus:ring-4 focus:ring-cyan-100 text-gray-800 font-medium transition-all hover:border-gray-300 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Kind
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#94C3D2] focus:ring-4 focus:ring-cyan-100 text-gray-800 font-medium cursor-pointer hover:border-gray-300 transition-all bg-white"
                  >
                    <option value="tourism">Interesting Places</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="leisure">Leisure</option>
                    <option value="recreation.park">Parks</option>
                    <option value="memorial">Memorials</option>
                    <option value="adult">Adult(21+)</option>
                    <option value="beach">Beaches</option>
                    <option value="nature">Nature</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={getAttractions}
                disabled={loading}
                className={`w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Search className="w-6 h-6" />
                <span>
                  {loading ? "Searching Activities..." : "Search Activities"}
                </span>
              </button>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm font-medium animate-fade-in">
                  <p className="font-bold mb-1">Error</p>
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {attractions.length > 0 && (
          <div className="relative max-w-7xl mx-auto px-6 pb-16">
            {/* Attractions List: one per row */}
            <div className="flex flex-col gap-6">
              {attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group transform hover:-translate-y-1"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Content Section */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#94C3D2] transition-colors line-clamp-1">
                              {attraction.name}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1.5 text-[#94C3D2]" />
                              <span className="text-sm font-medium">
                                {attraction.formattedAddress}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                          {attraction.description}
                        </p>
                      </div>
                    </div>
                    {/*View Details Button */}
                    <div className="h-16 mt-4 pt-4 border-t border-gray-100 flex justify-end pr-4">
                      <button className="px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-md flex items-center justify-center space-x-2 group">
                        <span>View Details &gt;</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="relative max-w-7xl mx-auto px-6 pb-16">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mb-4"></div>
              <p className="text-white font-semibold text-lg">
                Finding amazing experiences...
              </p>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          .delay-700 {
            animation-delay: 700ms;
          }
          .delay-1000 {
            animation-delay: 1000ms;
          }
        `}</style>
      </div>
    </div>
  );
}
