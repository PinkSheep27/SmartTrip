"use client";

import { useTrip } from "@/context/TripContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Star, Wifi, Users, Calendar, Search } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";

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

  const { activeCartId } = useTrip();

  // Animation State
  const [hasSearched, setHasSearched] = useState(false);

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

    setHasSearched(true);
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

      const res = await fetch(
        `/api/hotels/hotelsPrice?hotelIds=${encodeURIComponent(
          idsParam
        )}&checkInDate=${checkIn}&checkOutDate=${checkOut}&adults=${guests}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch hotel offers");
      }

      const data = await res.json();

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

  async function addToCart(hotel: Hotels) {
  try {
    const nightsCount = (checkIn && checkOut) 
      ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn)) 
      : 0;

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartId: activeCartId,
        category: "hotel",
        externalId: hotel.id,
        data: {
          ...hotel,
          nights: nightsCount
        },
      }),
    });

    if (!response.ok) throw new Error("Failed to add to cart");
    alert("Hotel added to cart!");
  } catch (error) {
    console.error(error);
  }
}

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
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[clamp(6rem,10vh,8rem)] overflow-hidden">

      <div className="max-w-7xl mx-auto px-[clamp(1rem,4vw,2rem)] w-full">

        {/* Hero Text */}
        <div
          className={`text-center transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-end ${hasSearched ? 'opacity-0 scale-95 h-0 mb-0' : 'opacity-100 scale-100 h-[180px] mb-[clamp(1.5rem,4vh,2.5rem)]'
            }`}
        >
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold mb-[clamp(0.5rem,2vh,1rem)] tracking-tight text-gray-900">
            Find Your Perfect Stay
          </h1>
          <p className="text-[clamp(1.125rem,2vw,1.5rem)] text-gray-600">
            Search, compare, and book hotels worldwide
          </p>
        </div>

        {/* Horizontal Search Bar */}
        <div className={`bg-white rounded-[clamp(1rem,2vw,1.5rem)] p-[clamp(1rem,3vw,1.5rem)] border border-gray-100 transition-all duration-700 ${hasSearched ? 'shadow-lg' : 'shadow-md'
          }`}>

          <div className="flex flex-col lg:flex-row gap-[clamp(0.5rem,1.5vw,1rem)]">

            {/* Location */}
            <div className="flex-[1.5] min-w-[200px] relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="City or destination"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-10 pr-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white text-[16px] lg:text-[clamp(13px,1.5vw,16px)] text-ellipsis"
              />
            </div>

            {/* Check-in */}
            <div className="flex-1 min-w-[140px] relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full pl-10 pr-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white cursor-pointer text-[16px] lg:text-[clamp(13px,1.5vw,16px)] text-ellipsis"
              />
            </div>

            {/* Check-out */}
            <div className="flex-1 min-w-[140px] relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split("T")[0]}
                className="w-full pl-10 pr-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white cursor-pointer text-[16px] lg:text-[clamp(13px,1.5vw,16px)] text-ellipsis"
              />
            </div>

            {/* Guests */}
            <div className="flex-1 min-w-[140px] relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full pl-10 pr-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white cursor-pointer appearance-none text-[16px] lg:text-[clamp(13px,1.5vw,16px)] text-ellipsis"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
                <option value={5}>5+ Guests</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={getHotels}
              className="relative bg-gradient-to-r from-[#94C3D2] to-[#7FB3C4] text-white rounded-[clamp(0.5rem,1vw,0.75rem)] hover:shadow-lg transition-all font-bold min-w-[140px] cursor-pointer"
            >
              {/* Invisible placeholder forcing dimensions */}
              <div className="flex items-center justify-center px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vh,1rem)] opacity-0 pointer-events-none">
                <Search className="w-5 h-5 mr-2" /> Search
              </div>

              {/* Absolutely positioned active content */}
              <div className="absolute inset-0 flex items-center justify-center">
                {loading && !hotels.length ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <div className="flex items-center text-[clamp(14px,1.5vw,16px)]">
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

          {hotels.length > 0 ? (
            <>
              {/* Sticky Filter Bar */}
              <div className="bg-white rounded-[clamp(0.75rem,1.5vw,1rem)] shadow-sm p-[clamp(1rem,2vw,1.5rem)] mb-[clamp(1rem,2vh,1.5rem)] border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-[clamp(1.125rem,2vw,1.25rem)] font-bold text-gray-900">
                    {sortedHotels.length} hotels available
                  </h2>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[clamp(13px,1.5vw,14px)] font-semibold text-gray-700">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vh,0.75rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 text-[clamp(13px,1.5vw,14px)] font-medium cursor-pointer hover:border-gray-300 transition-all"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rating</option>
                  </select>
                </div>
              </div>

              {/* Hotel Cards */}
              <div className="space-y-[clamp(1rem,2.5vh,1.5rem)]">
                {sortedHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-white rounded-[clamp(0.75rem,1.5vw,1rem)] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Hotel Image */}
                      <div className="relative md:w-[clamp(16rem,25vw,20rem)] h-[clamp(12rem,20vh,16rem)] md:h-auto flex-shrink-0 bg-gradient-to-br from-[#94C3D2] to-[#7FB3C4]">
                        <div className="absolute inset-0 flex items-center justify-center p-[clamp(1rem,2vw,1.5rem)]">
                          <span className="text-white text-[clamp(1.125rem,2vw,1.25rem)] font-semibold text-center">
                            {hotel.name}
                          </span>
                        </div>
                      </div>

                      {/* Hotel Info */}
                      <div className="flex-1 p-[clamp(1rem,3vw,1.5rem)] flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-bold text-gray-900 mb-[clamp(0.25rem,1vh,0.5rem)] group-hover:text-[#94C3D2] transition-colors truncate">
                                {hotel.name}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-[clamp(0.5rem,1vh,0.75rem)]">
                                <MapPin className="w-4 h-4 mr-1.5 shrink-0 text-[#94C3D2]" />
                                <span className="text-[clamp(13px,1.5vw,14px)] font-medium truncate">
                                  {hotel.location}
                                </span>
                              </div>
                              {hotel.distance && (
                                <p className="text-[clamp(12px,1.2vw,13px)] text-gray-500 mb-[clamp(0.5rem,1vh,0.75rem)] truncate">
                                  {hotel.distance}
                                </p>
                              )}
                            </div>

                            {/* Rating Badge */}
                            {hotel.rating > 0 && (
                              <div className="flex flex-col items-end shrink-0 ml-4">
                                <div className="flex items-center bg-[#94C3D2] text-white px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vh,0.5rem)] rounded-[clamp(0.5rem,1vw,0.75rem)] shadow-md mb-1">
                                  <Star className="w-4 h-4 mr-1 fill-current" />
                                  <span className="font-bold text-[clamp(1rem,1.5vw,1.125rem)]">
                                    {hotel.rating}
                                  </span>
                                </div>
                                <span className="text-[clamp(10px,1vw,12px)] text-gray-600 font-medium">
                                  Excellent
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Amenities */}
                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-[clamp(0.75rem,2vh,1rem)]">
                              {hotel.amenities.slice(0, 5).map((amenity, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-1.5 bg-cyan-50 text-[#94C3D2] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vh,0.5rem)] rounded-lg text-[clamp(12px,1.2vw,14px)] font-medium"
                                >
                                  <Wifi className="w-3.5 h-3.5" />
                                  <span>{amenity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price and CTA */}
                        <div className="flex items-end justify-between pt-[clamp(0.75rem,1.5vh,1rem)] border-t border-gray-100 mt-auto gap-4">
                          <div className="min-w-0">
                            <p className="text-[clamp(12px,1.2vw,14px)] text-gray-600 mb-1">
                              Starting from
                            </p>
                            <div className="flex items-baseline flex-wrap">
                              <span className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold text-gray-900 leading-none">
                                ${hotel.price}
                              </span>
                              <span className="text-[clamp(13px,1.5vw,14px)] text-gray-600 ml-2 font-medium">
                                /night
                              </span>
                            </div>
                            <p className="text-[clamp(10px,1vw,12px)] text-gray-500 mt-1">
                              Includes taxes & fees
                            </p>
                          </div>

                          <button
                            onClick={() => addToCart(hotel)}
                            className="shrink-0 px-[clamp(1rem,2vw,2rem)] py-[clamp(0.75rem,1.5vh,1rem)] bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-[clamp(0.5rem,1vw,0.75rem)] font-bold hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-md flex items-center space-x-2 cursor-pointer text-[clamp(14px,1.5vw,16px)]"
                          >
                            <span>Add to Cart &gt;</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-[clamp(2rem,4vh,3rem)]">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-[clamp(2rem,3vw,2.5rem)] w-[clamp(2rem,3vw,2.5rem)] border-4 border-cyan-200 border-t-[#94C3D2]"></div>
                    </div>
                  </div>
                )}

                {/* Intersection Observer Trigger */}
                {moreHotels && !loadingMore && (
                  <div ref={loadMoreRef} className="h-px"></div>
                )}

                {/* No More Hotels Message */}
                {!moreHotels && hotels.length > 0 && (
                  <div className="text-center py-[clamp(2rem,4vh,3rem)]">
                    <span className="text-[clamp(13px,1.5vw,14px)] text-gray-500 font-medium">
                      All hotels loaded
                    </span>
                  </div>
                )}
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

export default HotelsPage;