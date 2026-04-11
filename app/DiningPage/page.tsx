"use client";

import { useTrip } from "@/context/TripContext";
import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import type { prices } from "@/components/DiningComponents/RestaurantCard";
import RestaurantCard from "@/components/DiningComponents/RestaurantCard";

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
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { activeCartId } = useTrip();

  async function searchRestaurants() {
    if (!searchLocation.trim()) {
      setError("Please enter a location");
      return;
    }

    setHasSearched(true);
    setLoading(true);
    setError("");

    try {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchRestaurants();
    }
  };

  async function addToCart(event: Restaurant) {
    if (!activeCartId) {
    alert("Please select a trip in your cart (top right) before adding items!");
    return;
  }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: activeCartId,
          category: "Restaurant",
          externalId: event.id,
          data: event,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }

      alert("Restaurant added to cart!");
    } catch (error) {
      console.log(error);
      alert("Error adding Restaurant. Check console.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[clamp(6rem,10vh,8rem)] overflow-hidden">

      <div className="max-w-7xl mx-auto px-[clamp(1rem,4vw,2rem)] w-full">

        {/* Hero Text */}
        <div
          className={`text-center transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-end ${hasSearched ? 'opacity-0 scale-95 h-0 mb-0' : 'opacity-100 scale-100 h-[180px] mb-[clamp(1.5rem,4vh,2.5rem)]'
            }`}
        >
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold mb-[clamp(0.5rem,2vh,1rem)] tracking-tight text-gray-900">
            Find Your Next Meal
          </h1>
          <p className="text-[clamp(1.125rem,2vw,1.5rem)] text-gray-600">
            Search, discover, and book the best restaurants
          </p>
        </div>

        {/* Horizontal Search Bar */}
        <div className={`bg-white rounded-[clamp(1rem,2vw,1.5rem)] p-[clamp(1rem,3vw,1.5rem)] border border-gray-100 transition-all duration-700 ${hasSearched ? 'shadow-lg' : 'shadow-md'
          }`}>

          <div className="flex flex-col md:flex-row gap-[clamp(0.5rem,1.5vw,1rem)]">

            {/* Location Input */}
            <div className="flex-1 min-w-[200px] relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="Enter city or zip code"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white text-[16px] md:text-[clamp(13px,1.5vw,16px)] text-ellipsis"
              />
            </div>

            {/* Craving / Search Term Input */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="Craving anything specific? (Optional)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white text-[16px] md:text-[clamp(13px,1.5vw,16px)] text-ellipsis"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={searchRestaurants}
              className="relative bg-gradient-to-r from-[#94C3D2] to-[#7FB3C4] text-white rounded-[clamp(0.5rem,1vw,0.75rem)] hover:shadow-lg transition-all font-bold min-w-[140px] cursor-pointer"
            >
              <div className="flex items-center justify-center px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vh,1rem)] opacity-0 pointer-events-none">
                <Search className="w-5 h-5 mr-2" /> Search
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                {loading && !restaurants.length ? (
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
          {restaurants.length > 0 ? (
            <>
              <div className="mb-[clamp(1rem,2vh,1.5rem)] flex justify-between items-center">
                <h2 className="text-[clamp(1.125rem,2vw,1.25rem)] font-bold text-gray-900">
                  {restaurants.length} restaurants found
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(1rem,2.5vw,1.5rem)]">
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    name={restaurant.name}
                    id={restaurant.id}
                    cuisine={restaurant.cuisine}
                    rating={restaurant.rating}
                    price={restaurant.price}
                    waitTime={restaurant.waitTime}
                    address={restaurant.address}
                    tags={restaurant.tags}
                    isOpen={restaurant.isOpen}
                    photo={restaurant.photo}
                    addToCart={() => addToCart(restaurant)}
                  />
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