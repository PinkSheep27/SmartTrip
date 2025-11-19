"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Star, Wifi } from "lucide-react";

interface Hotels {
  id: string;
  name: string;
  price: number;
  rating: number;
  location: string;
  amenities: string[];
  distance: string;
  currency: string;
}

function HotelsPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const [start, setStart] = useState(0);
  const [hotelsLoaded, setHotelsLoaded] = useState(50);
  const [moreHotels, setMoreHotels] = useState(true);

  const [searchLocation, setSearchLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [sortBy, setSortBy] = useState("recommended");
  const [hotelIds, setHotelIds] = useState<string[]>([]);
  const [hotels, setHotels] = useState<Hotels[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      getHotels();
    }
  };

  async function getHotels() {
    if (!searchLocation || !checkIn || !checkOut) {
      setError("Please fill in all search fields");
      return;
    }

    setLoading(true);
    setError("");
    setHotels([]);
    setHotelIds([]);
    setStart(0);
    setHotelsLoaded(50);
    setMoreHotels(true);

    try {
      // Step 1: Get geocode
      const geocodeResponse = await fetch(
        `/api/geocode?address=${encodeURIComponent(searchLocation)}`
      );

      if (!geocodeResponse.ok) {
        throw new Error("Failed to find location");
      }

      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.location) {
        throw new Error("Location not found");
      }

      const { lat, lng } = geocodeData.location;

      // Step 2: Get all hotel IDs in the area
      const hotelsResponse = await fetch(`/api/hotels?lat=${lat}&lng=${lng}`);

      if (!hotelsResponse.ok) {
        const errorData = await hotelsResponse.json();
        throw new Error(errorData.error || "Failed to search hotels");
      }

      const hotelsData = await hotelsResponse.json();

      if (!hotelsData.allHotelIds || hotelsData.allHotelIds.length === 0) {
        setError("No hotels found in this location");
        setLoading(false);
        return;
      }

      console.log(`Found ${hotelsData.allHotelIds.length} total hotels`);
      setHotelIds(hotelsData.allHotelIds);

      // Step 3: Load first batch with prices
      await loadFirstBatch(hotelsData.allHotelIds);
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to search hotels. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadFirstBatch(ids: string[]) {
    if (ids.length === 0) return;

    try {
      const chunk = ids.slice(0, 50);
      const idsParam = chunk.join(",");

      console.log("Loading first batch of hotels with prices...");

      const res = await fetch(
        `/api/hotels/hotelsPrice?hotelIds=${encodeURIComponent(
          idsParam
        )}&checkInDate=${checkIn}&checkOutDate=${checkOut}&adults=${guests}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch hotel offers");
      }

      const data = await res.json();

      console.log(
        `First batch: ${data.hotels?.length || 0} hotels with prices`
      );

      if (data.hotels && data.hotels.length > 0) {
        setHotels(data.hotels);
        setStart(50);
        setHotelsLoaded(100);
      } else {
        // If no hotels in first batch, try next batch
        if (ids.length > 50) {
          await loadNextBatch(ids, 50, 100);
        } else {
          setMoreHotels(false);
          setError("No hotels available for the selected dates");
        }
      }
    } catch (err) {
      console.error("Error loading first batch:", err);
      setError("Failed to load hotels. Please try again.");
    }
  }

  async function loadNextBatch(
    ids: string[],
    startIdx: number,
    endIdx: number
  ) {
    const chunk = ids.slice(startIdx, endIdx);
    if (chunk.length === 0) {
      setMoreHotels(false);
      return;
    }

    const idsParam = chunk.join(",");

    try {
      const res = await fetch(
        `/api/hotels/hotelsPrice?hotelIds=${encodeURIComponent(
          idsParam
        )}&checkInDate=${checkIn}&checkOutDate=${checkOut}&adults=${guests}`
      );

      if (!res.ok) throw new Error("Failed to fetch hotel offers");

      const data = await res.json();

      if (data.hotels && data.hotels.length > 0) {
        setHotels((prev) => [...prev, ...data.hotels]);
        setStart(endIdx);
        setHotelsLoaded(endIdx + 50);
      } else if (endIdx < ids.length) {
        // No offers in this batch, try next one
        await loadNextBatch(ids, endIdx, endIdx + 50);
      } else {
        setMoreHotels(false);
      }
    } catch (err) {
      console.error("Error loading batch:", err);
    }
  }

  const loadMoreHotels = useCallback(async () => {
    if (
      hotelIds.length === 0 ||
      start >= hotelIds.length ||
      !moreHotels ||
      loadingMore
    ) {
      setMoreHotels(false);
      return;
    }

    setLoadingMore(true);

    try {
      await loadNextBatch(hotelIds, start, hotelsLoaded);
    } catch (err) {
      console.error("Error loading more hotels:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    hotelIds,
    start,
    hotelsLoaded,
    moreHotels,
    loadingMore,
    checkIn,
    checkOut,
    guests,
  ]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!loadMoreRef.current || hotels.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          moreHotels &&
          hotelIds.length > 0
        ) {
          console.log("Loading more hotels...");
          loadMoreHotels();
        }
      },
      {
        threshold: 0.5,
        rootMargin: "100px",
      }
    );

    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [loadMoreHotels, loadingMore, moreHotels, hotelIds.length, hotels.length]);

  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#94C3D2] py-16">
      <div className="bg-gradient-to-br from-[#94C3D2] to-[#7FB3C4] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-center mb-12 text-white/90">
            Discover comfortable hotels at the best prices
          </p>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    onKeyDown={handleKeyDown}
                    type="text"
                    placeholder="City or address"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94C3D2] text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94C3D2] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94C3D2] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94C3D2] text-gray-800"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                </select>
              </div>
            </div>

            <button
              onClick={getHotels}
              disabled={loading}
              className={`w-full mt-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-[1.02] shadow-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Searching..." : "Search Hotels"}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {hotels.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-gray-700 font-medium">
                {sortedHotels.length} hotels found
              </span>

              <div className="flex items-center space-x-3">
                <span className="text-gray-700 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94C3D2] text-gray-800"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-lg font-semibold text-center px-4">
                    {hotel.name}
                  </span>
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                    <span className="text-[#94C3D2] font-bold text-lg">
                      ${hotel.price}
                    </span>
                    <span className="text-gray-600 text-sm">/night</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{hotel.location}</span>
                      </div>
                    </div>
                    {hotel.rating > 0 && (
                      <div className="flex items-center bg-[#94C3D2] text-white px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span className="font-bold">{hotel.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    {hotel.distance}
                  </div>

                  {hotel.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities
                        .slice(0, 4)
                        .map((amenity: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-sm"
                          >
                            <Wifi className="w-4 h-4" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">
                        {hotel.currency}
                      </span>
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-orange-600 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {loadingMore && (
              <div className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            )}

            {moreHotels && !loadingMore && (
              <div ref={loadMoreRef} className="h-px col-span-full"></div>
            )}

            {!moreHotels && hotels.length > 0 && (
              <div className="col-span-full text-center py-8 text-gray-600">
                All available hotels loaded
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelsPage;
