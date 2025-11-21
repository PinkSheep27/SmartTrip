"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Star,
  Wifi,
  Users,
  Calendar,
  Search,
  Heart,
  ChevronRight,
} from "lucide-react";

interface Hotels {
  id: string;
  name: string;
  price: number;
  rating: number;
  location: string;
  amenities: string[];
  distance?: string;
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
  const [hotelsInfo, setHotelsInfo] = useState<Hotels[]>([]);
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
    setHotelsInfo([]);
    setStart(0);
    setHotelsLoaded(50);
    setMoreHotels(true);

    try {
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

      const hotelsResponse = await fetch(`/api/hotels?lat=${lat}&lng=${lng}`);

      if (!hotelsResponse.ok) {
        const errorData = await hotelsResponse.json();
        throw new Error(errorData.error || "Failed to search hotels");
      }

      const hotelsData = await hotelsResponse.json();

      if (!hotelsData.allHotels || hotelsData.allHotels.length === 0) {
        setError("No hotels found in this location");
        setLoading(false);
        return;
      }

      console.log(`Found ${hotelsData.allHotels.length} total hotels`);

      setHotelsInfo(hotelsData.allHotels);

      const ids = hotelsData.allHotels.map((hotel: Hotels) => hotel.id);
      setHotelIds(ids);

      await loadFirstBatch(ids, hotelsData.allHotels);
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

  async function loadFirstBatch(ids: string[], baseHotels: Hotels[]) {
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
        const merged = mergeHotelData(baseHotels, data.hotels);
        setHotels(merged);
        setStart(50);
        setHotelsLoaded(100);
      } else {
        if (ids.length > 50) {
          await loadNextBatch(ids, baseHotels, 50, 100);
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
    baseHotels: Hotels[],
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
        const merged = mergeHotelData(baseHotels, data.hotels);
        setHotels((prev) => [...prev, ...merged]);
        setStart(endIdx);
        setHotelsLoaded(endIdx + 50);
      } else if (endIdx < ids.length) {
        await loadNextBatch(ids, baseHotels, endIdx, endIdx + 50);
      } else {
        setMoreHotels(false);
      }
    } catch (err) {
      console.error("Error loading batch:", err);
    }
  }

  function mergeHotelData(baseHotels: Hotels[], hotelPrices: any[]): Hotels[] {
    const hotelMap = new Map(baseHotels.map((h) => [h.id, h]));

    const merged = hotelPrices
      .map((priceHotel) => {
        const baseHotel = hotelMap.get(priceHotel.id);
        if (!baseHotel) return null;

        return {
          ...baseHotel,
          price: priceHotel.price,
          currency: priceHotel.currency,
          rating: priceHotel.rating || baseHotel.rating,
          amenities: priceHotel.amenities || baseHotel.amenities,
        };
      })
      .filter((hotel): hotel is Hotels => hotel !== null);

    return merged;
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
      await loadNextBatch(hotelIds, hotelsInfo, start, hotelsLoaded);
    } catch (err) {
      console.error("Error loading more hotels:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    hotelIds,
    hotelsInfo,
    start,
    hotelsLoaded,
    moreHotels,
    loadingMore,
    checkIn,
    checkOut,
    guests,
  ]);

  useEffect(() => {
    // Skip running the effect on the first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!loadMoreRef.current || hotels.length === 0) return;

    //Observer for constant hotel searching/Rendering
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
      {/* Modern Hero Section */}
      <div className="relative text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl text-white">
              Search, compare, and book hotels worldwide
            </p>
          </div>

          {/* Modern Search Card */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Location */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Where
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94C3D2] w-5 h-5" />
                    <input
                      onKeyDown={handleKeyDown}
                      type="text"
                      placeholder="City, hotel, or destination"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#94C3D2] text-gray-800 font-medium transition-all hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Check-in */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Check-in
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94C3D2] w-5 h-5" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#94C3D2] text-gray-800 font-medium transition-all hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Check-out
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94C3D2] w-5 h-5" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#94C3D2] text-gray-800 font-medium transition-all hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94C3D2] w-5 h-5" />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#94C3D2] text-gray-800 font-medium transition-all appearance-none bg-white cursor-pointer hover:border-gray-300"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5+</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={getHotels}
                disabled={loading}
                className={`w-full mt-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-5 rounded-2xl font-bold text-lg hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-[1.01] shadow-lg flex items-center justify-center space-x-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Search className="w-6 h-6" />
                <span>{loading ? "Searching Hotels..." : "Search Hotels"}</span>
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hotels.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Sticky Filter Bar */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 z-10 border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sortedHotels.length} hotels available
                </h2>
                <p className="text-gray-600 mt-1">
                  {searchLocation || "Your destination"} • {checkIn} to{" "}
                  {checkOut}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#94C3D2] text-gray-800 font-medium cursor-pointer hover:border-gray-300 transition-all"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hotel Cards*/}
          <div className="space-y-6">
            {sortedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Hotel Image */}
                  <div className="relative md:w-80 h-64 md:h-auto flex-shrink-0 bg-gradient-to-br from-[#94C3D2] to-[#7FB3C4]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold text-center px-4">
                        {hotel.name}
                      </span>
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#94C3D2] transition-colors">
                            {hotel.name}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-1.5 text-[#94C3D2]" />
                            <span className="text-sm font-medium">
                              {hotel.location}
                            </span>
                          </div>
                          {hotel.distance && (
                            <p className="text-sm text-gray-500 mb-3">
                              {hotel.distance}
                            </p>
                          )}
                        </div>

                        {/* Rating Badge */}
                        {hotel.rating > 0 && (
                          <div className="flex flex-col items-end ml-4">
                            <div className="flex items-center bg-[#94C3D2] text-white px-3 py-2 rounded-xl shadow-md mb-1">
                              <Star className="w-4 h-4 mr-1 fill-current" />
                              <span className="font-bold text-lg">
                                {hotel.rating}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              Excellent
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.slice(0, 5).map((amenity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-1.5 bg-cyan-50 text-[#94C3D2] px-3 py-1.5 rounded-lg text-sm font-medium"
                            >
                              <Wifi className="w-3.5 h-3.5" />
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Starting from
                        </p>
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-gray-900">
                            ${hotel.price}
                          </span>
                          <span className="text-gray-600 ml-2 font-medium">
                            /night
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Includes taxes & fees
                        </p>
                      </div>

                      <button className="px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 group">
                        <span>View Deal</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loadingMore && (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-[#94C3D2]"></div>
                  <p className="text-gray-600 font-medium">
                    Loading more hotels...
                  </p>
                </div>
              </div>
            )}

            {/* Intersection Observer Trigger */}
            {moreHotels && !loadingMore && (
              <div ref={loadMoreRef} className="h-px"></div>
            )}

            {/* No More Hotels Message */}
            {!moreHotels && hotels.length > 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2 bg-gray-100 px-6 py-3 rounded-full">
                  <span className="text-gray-600 font-medium">
                    All hotels loaded
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelsPage;
