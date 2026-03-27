"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";

export interface Attractions {
  id: string;
  name: string;
  description: string;
  categories?: string[]; 
  image?: string;
  formattedAddress?: string;
  location: [Number?, Number?];
}

export default function ExperiencePage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedType, setSelectedType] = useState("tourism.attraction");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [attractions, setAttractions] = useState<Attractions[]>([]);

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

    setHasSearched(true);
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

  async function addToCart(event: Attractions) {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: 1, 
          category: "Attraction",
          externalId: event.id,
          data: event, 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }

      alert("✅ Event added to cart!");
    } catch (error) {
      console.log(error);
      alert("❌ Error adding Experience. Check console.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[clamp(6rem,10vh,8rem)] overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-[clamp(1rem,4vw,2rem)] w-full">
        
        {/* Hero Text */}
        <div 
          className={`text-center transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-end ${
            hasSearched ? 'opacity-0 scale-95 h-0 mb-0' : 'opacity-100 scale-100 h-[180px] mb-[clamp(1.5rem,4vh,2.5rem)]'
          }`}
        >
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold mb-[clamp(0.5rem,2vh,1rem)] tracking-tight text-gray-900">
            Explore Local Attractions
          </h1>
          <p className="text-[clamp(1.125rem,2vw,1.5rem)] text-gray-600">
            Find the best tours, activities, and experiences
          </p>
        </div>

        {/* Horizontal Search Bar */}
        <div className={`bg-white rounded-[clamp(1rem,2vw,1.5rem)] p-[clamp(1rem,3vw,1.5rem)] border border-gray-100 transition-all duration-700 ${
          hasSearched ? 'shadow-lg' : 'shadow-md'
        }`}>
          
          <div className="flex flex-col md:flex-row gap-[clamp(0.5rem,1.5vw,1rem)]">
            
            {/* Location */}
            <div className="flex-[2] min-w-[200px] relative">
               <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
               <input
                  onKeyDown={handleKeyDown}
                  type="text"
                  placeholder="Enter a city (e.g., New York, Paris)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-10 pr-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white text-[16px]"
                />
            </div>
            
            {/* Kind */}
            <div className="flex-1 min-w-[160px] relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white cursor-pointer text-[16px] md:text-[clamp(14px,1.5vw,16px)] text-ellipsis"
              >
                <option value="tourism.attraction">Interesting Places</option>
                <option value="entertainment">Entertainment</option>
                <option value="leisure.park">Parks</option>
                <option value="memorial">Memorials</option>
                <option value="adult">Adult (21+)</option>
                <option value="beach">Beaches</option>
                <option value="natural">Nature</option>
              </select>
            </div>
            
            {/* Search Button */}
            <button
              onClick={getAttractions}
              className="relative bg-gradient-to-r from-[#94C3D2] to-[#7FB3C4] text-white rounded-[clamp(0.5rem,1vw,0.75rem)] hover:shadow-lg transition-all font-bold min-w-[140px] cursor-pointer"
            >
              <div className="flex items-center justify-center px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vh,1rem)] opacity-0 pointer-events-none">
                <Search className="w-5 h-5 mr-2" /> Search
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <div className="flex items-center">
                    <Search className="w-5 h-5 mr-2" /> Search
                  </div>
                )}
              </div>
            </button>
          </div>

          {error && (
            <div className="mt-[clamp(1rem,2vh,1.5rem)] p-[clamp(0.75rem,1.5vh,1rem)] bg-red-50 border border-red-200 text-red-600 rounded-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(14px,1.5vw,16px)] font-medium animate-fade-in">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="max-w-7xl mx-auto px-[clamp(1rem,4vw,2rem)] py-[clamp(1.5rem,4vh,2.5rem)] w-full transition-all duration-700 animate-fade-in">
          
          {attractions.length > 0 ? (
            <>
              <div className="mb-[clamp(1rem,2vh,1.5rem)]">
                <h2 className="text-[clamp(1.125rem,2vw,1.25rem)] font-bold text-gray-900">
                  {attractions.length} experiences found
                </h2>
              </div>

              <div className="flex flex-col gap-[clamp(1rem,2.5vh,1.5rem)]">
                {attractions.map((attraction) => (
                  <div
                    key={attraction.id}
                    className="w-full bg-white rounded-[clamp(0.75rem,1.5vw,1rem)] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-[clamp(1rem,3vw,1.5rem)] flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-[clamp(1.125rem,2vw,1.25rem)] font-bold text-gray-900 mb-2 group-hover:text-[#94C3D2] transition-colors">
                                {attraction.name}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-1.5 text-[#94C3D2]" />
                                <span className="font-medium text-[clamp(14px,1.5vw,16px)]">
                                  {attraction.formattedAddress}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-[clamp(1rem,3vw,1.5rem)] border-t md:border-t-0 md:border-l border-gray-100 flex items-center justify-center md:justify-end min-w-[200px]">
                        <button
                          onClick={() => addToCart(attraction)}
                          className="w-full px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-[clamp(0.5rem,1vw,0.75rem)] font-bold hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-md flex items-center justify-center cursor-pointer text-[clamp(14px,1.5vw,16px)]"
                        >
                          <span>Add to Cart &gt;</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : loading ? (
             <div className="flex justify-center py-[clamp(3rem,8vh,5rem)]">
               <div className="animate-spin rounded-full h-[clamp(2.5rem,4vw,3rem)] w-[clamp(2.5rem,4vw,3rem)] border-4 border-cyan-200 border-t-[#94C3D2]"></div>
             </div>
          ) : null}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}