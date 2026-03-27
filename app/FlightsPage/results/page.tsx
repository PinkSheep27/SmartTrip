"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AutocompleteInput, { Suggestion } from "@/components/FlightComponents/AutocompleteInput";
import FlightSelectionModal from "@/components/FlightComponents/FlightSelectionModal";
import { Plane, Clock, PlaneTakeoff, PlaneLanding, Search } from "lucide-react";

const airlineLookup: { [code: string]: string } = {
  AA: "American Airlines", AS: "Alaska Airlines", B6: "JetBlue Airways",
  DL: "Delta Air Lines", F9: "Frontier Airlines", HA: "Hawaiian Airlines",
  NK: "Spirit Airlines", OO: "SkyWest Airlines", UA: "United Airlines",
  WN: "Southwest Airlines", YX: "Republic Airline", EV: "ExpressJet Airlines",
  MQ: "Envoy Air", "9E": "Endeavor Air", G7: "GoJet Airlines", OH: "PSA Airlines",
};

type Flight = {
  airline: string; departAirport: string; arriveAirport: string;
  departureTime: string; duration: string; price: number | string;
};

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const FlightResultsContent: React.FC = () => {
  const params = useSearchParams();

  const tripType = params.get("tripType") || "";
  const departing = params.get("departing") || "";
  const arriving = params.get("arriving") || "";
  const departureDate = params.get("departureDate") || "";
  const returnDate = params.get("returnDate") || "";

  const [tripTypeState, setTripTypeState] = React.useState(tripType);
  const [departingState, setDepartingState] = React.useState(departing);
  const [arrivingState, setArrivingState] = React.useState(arriving);
  const [departureDateState, setDepartureDateState] = React.useState(departureDate);
  const [returnDateState, setReturnDateState] = React.useState(returnDate);

  const [Flights, setFlights] = React.useState<Flight[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"" | "price" | "departure" | "duration" | "airline">("");
  const [airlineFilter, setAirlineFilter] = React.useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const handleSelectTicket = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFlight(null);
  };

  const today = new Date().toISOString().split("T")[0];

  const [departingSuggestions, setDepartingSuggestions] = React.useState<Suggestion[]>([]);
  const [arrivingSuggestions, setArrivingSuggestions] = React.useState<Suggestion[]>([]);
  const [focusedInput, setFocusedInput] = React.useState<"departing" | "arriving" | null>(null);

  const fetchSuggestions = React.useCallback(
    debounce(async (keyword: string, inputType: "departing" | "arriving") => {
      if (keyword.length < 2) {
        inputType === "departing" ? setDepartingSuggestions([]) : setArrivingSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/airportAutocomplete?keyword=${keyword}`);
        const data = await res.json();
        const setSuggestions = inputType === "departing" ? setDepartingSuggestions : setArrivingSuggestions;
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300), []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, inputType: "departing" | "arriving") => {
    const value = e.target.value;
    if (inputType === "departing") {
      setDepartingState(value);
      setArrivingSuggestions([]);
    } else {
      setArrivingState(value);
      setDepartingSuggestions([]);
    }
    fetchSuggestions(value, inputType);
  };

  const handleSelectSuggestion = (suggestion: Suggestion, inputType: "departing" | "arriving") => {
    const code = suggestion.code;
    if (inputType === "departing") {
      setDepartingState(code);
      setDepartingSuggestions([]);
    } else {
      setArrivingState(code);
      setArrivingSuggestions([]);
    }
    setFocusedInput(null);
  };

  const filteredFlights = Flights.filter((f) => airlineFilter === "" || f.airline === airlineFilter);
  const sortedFlights = sortFlights(filteredFlights, sortBy);

  function formatShortDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  function formatDuration(durationString: string): string {
    const hoursMatch = durationString.match(/(\d+)H/);
    const minutesMatch = durationString.match(/(\d+)M/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    let formatted = "";
    if (hours > 0) formatted += `${hours} hr`;
    if (minutes > 0) formatted += formatted.length > 0 ? ` ${minutes} min` : `${minutes} min`;
    return formatted || "Unknown duration";
  }

  async function addToCart(flight: Flight) {
    try {
      const uniqueId = `${flight.airline}-${flight.departAirport}-${flight.departureTime}`;
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: 1, category: "Flight", externalId: uniqueId, data: flight,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }
      alert("✅ Flight added to cart!");
    } catch (error) {
      console.error("Error adding flight:", error);
      alert("❌ Error adding flight. Check console.");
    }
  }

  React.useEffect(() => {
    async function fetchFlights(reset = false) {
      if (loading) return;
      setLoading(true);

      const query: { [key: string]: string } = {
        tripType: tripTypeState, departing: departingState, arriving: arrivingState,
        departureDate: departureDateState, page: page.toString(), limit: "10",
      };

      if (tripTypeState === "roundtrip") {
        query.arriving = arrivingState;
        query.returnDate = returnDateState;
      }

      const searchParams = new URLSearchParams(query);
      try {
        const res = await fetch(`/api/searchFlights?${searchParams.toString()}`);
        const data = await res.json();
        const newFlights: Flight[] = (data.flights || []).map((flight: any) => ({
          ...flight, airline: airlineLookup[flight.airline] || flight.airline,
        }));
        setFlights((prev) => (reset ? newFlights : [...prev, ...newFlights]));
        setHasMore(newFlights.length > 0);
      } catch (err) {
        console.error("Error fetching flights:", err);
        setFlights([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    fetchFlights(page === 1);
  }, [tripTypeState, departingState, arrivingState, departureDateState, returnDateState, page]);

  function sortFlights(flights: Flight[], sortBy: string) {
    if (sortBy === "") return flights;
    const sorted = [...flights];
    switch (sortBy) {
      case "price": sorted.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "departure":
        sorted.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()); break;
      case "duration":
        sorted.sort((a, b) => {
          const toMinutes = (d: string) => {
            const hours = d.match(/(\d+)H/)?.[1] ?? 0;
            const minutes = d.match(/(\d+)M/)?.[1] ?? 0;
            return Number(hours) * 60 + Number(minutes);
          };
          return toMinutes(a.duration) - toMinutes(b.duration);
        });
        break;
      case "airline": sorted.sort((a, b) => a.airline.localeCompare(b.airline)); break;
    }
    return sorted;
  }

  const uniqueAirlines = Array.from(new Set(Flights.map((f) => f.airline)));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[clamp(6rem,10vh,8rem)] pb-[clamp(2rem,4vh,4rem)] overflow-hidden">

      {/* Top Filter Bar */}
      <div className="max-w-7xl mx-auto px-[clamp(1rem,4vw,2rem)] w-full">
        <div className="bg-white rounded-[clamp(1rem,2vw,1.5rem)] shadow-md p-[clamp(1rem,3vw,1.5rem)] mb-[clamp(1.5rem,4vh,2rem)] border border-gray-100">

          <div className="flex flex-col lg:flex-row gap-[clamp(0.5rem,1.5vw,1rem)] mb-[clamp(1rem,2vh,1.5rem)]">
            <div className="flex-[1.5] min-w-[200px] relative">
              <PlaneTakeoff className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <AutocompleteInput
                value={departingState}
                placeholder="Departing"
                inputType="departing"
                onChange={handleInputChange}
                onSelect={handleSelectSuggestion}
                suggestions={departingSuggestions}
                isFocused={focusedInput === "departing"}
                onFocus={() => setFocusedInput("departing")}
                onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
                className="w-full pl-10 pr-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white text-[16px] lg:text-[clamp(13px,1.5vw,16px)] text-ellipsis"
              />
            </div>

            <div className="flex-[1.5] min-w-[200px] relative">
              <PlaneLanding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <AutocompleteInput
                value={arrivingState}
                placeholder="Arrival"
                inputType="arriving"
                onChange={handleInputChange}
                onSelect={handleSelectSuggestion}
                suggestions={arrivingSuggestions}
                isFocused={focusedInput === "arriving"}
                onFocus={() => setFocusedInput("arriving")}
                onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
                className="w-full pl-10 pr-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white text-[16px] lg:text-[clamp(13px,1.5vw,16px)] text-ellipsis"
              />
            </div>

            <div className="flex-1 min-w-[140px] relative">
              <input
                type="date"
                value={departureDateState}
                onChange={(e) => setDepartureDateState(e.target.value)}
                className="w-full px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white cursor-pointer text-[16px] lg:text-[clamp(13px,1.5vw,16px)]"
                min={today}
              />
            </div>

            {tripTypeState === "roundtrip" && (
              <div className="flex-1 min-w-[140px] relative">
                <input
                  type="date"
                  value={returnDateState}
                  onChange={(e) => setReturnDateState(e.target.value)}
                  className="w-full px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white cursor-pointer text-[16px] lg:text-[clamp(13px,1.5vw,16px)]"
                  min={departureDateState || today}
                />
              </div>
            )}

            <button
              onClick={() => setPage(1)}
              className="relative bg-gradient-to-r from-[#94C3D2] to-[#7FB3C4] text-white rounded-[clamp(0.5rem,1vw,0.75rem)] hover:shadow-lg transition-all font-bold min-w-[140px] cursor-pointer"
            >
              <div className="flex items-center justify-center px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vh,1rem)] opacity-0 pointer-events-none">
                <Search className="w-5 h-5 mr-2" /> Search
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center text-[clamp(14px,1.5vw,16px)]">
                  <Search className="w-5 h-5 mr-2" /> Search
                </div>
              </div>
            </button>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 border-t border-gray-100 pt-[clamp(1rem,2vh,1.5rem)]">
            <div className="flex gap-[clamp(1rem,2vw,1.5rem)]">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-[#94C3D2] transition-colors text-[clamp(14px,1.5vw,16px)]">
                <input
                  type="radio" name="tripType" value="oneway"
                  checked={tripTypeState === "oneway"}
                  onChange={() => setTripTypeState("oneway")}
                  className="w-4 h-4 text-[#94C3D2] focus:ring-[#94C3D2] cursor-pointer"
                /> One-way
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-[#94C3D2] transition-colors text-[clamp(14px,1.5vw,16px)]">
                <input
                  type="radio" name="tripType" value="roundtrip"
                  checked={tripTypeState === "roundtrip"}
                  onChange={() => setTripTypeState("roundtrip")}
                  className="w-4 h-4 text-[#94C3D2] focus:ring-[#94C3D2] cursor-pointer"
                /> Round-trip
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                className="border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vh,0.75rem)] text-[clamp(13px,1.5vw,14px)] font-medium focus:outline-none focus:border-[#94C3D2] cursor-pointer hover:border-gray-300 transition-colors"
                value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="">Sort by: None</option>
                <option value="price">Price: Low to High</option>
                <option value="departure">Earliest Departure</option>
                <option value="duration">Shortest Duration</option>
                <option value="airline">Airline</option>
              </select>
              <select
                className="border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vh,0.75rem)] text-[clamp(13px,1.5vw,14px)] font-medium focus:outline-none focus:border-[#94C3D2] cursor-pointer hover:border-gray-300 transition-colors max-w-[200px] text-ellipsis"
                value={airlineFilter} onChange={(e) => setAirlineFilter(e.target.value)}
              >
                <option value="">All Airlines</option>
                {uniqueAirlines.map((airline) => (
                  <option key={airline} value={airline}>{airline}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Flight Results */}
        <div className="space-y-[clamp(1rem,2.5vh,1.5rem)]">
          {Flights.length === 0 && !loading && (
            <div className="text-center py-[clamp(3rem,6vh,4rem)] bg-white rounded-[clamp(1rem,2vw,1.5rem)] shadow-sm border border-gray-100">
              <p className="text-gray-500 text-[clamp(1.125rem,2vw,1.25rem)] font-medium">No flights found for this route.</p>
            </div>
          )}
          {Flights.length === 0 && loading && (
            <div className="flex justify-center py-[clamp(3rem,6vh,4rem)]">
              <div className="animate-spin rounded-full h-[clamp(2.5rem,4vw,3rem)] w-[clamp(2.5rem,4vw,3rem)] border-4 border-cyan-200 border-t-[#94C3D2]"></div>
            </div>
          )}

          {sortedFlights.map((flight: any, i: number) => (
            <div
              key={i}
              className="bg-white rounded-[clamp(0.75rem,1.5vw,1rem)] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col lg:flex-row"
            >
              <div className="flex-1 p-[clamp(1rem,3vw,1.5rem)] flex flex-col justify-between min-w-0">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-[clamp(1rem,2vh,1.5rem)]">
                  <div className="min-w-0">
                    <h3 className="text-[clamp(1.125rem,2vw,1.25rem)] font-bold text-gray-900 group-hover:text-[#94C3D2] transition-colors flex items-center truncate">
                      <Plane className="w-5 h-5 mr-2 shrink-0 text-[#94C3D2]" /> {flight.airline}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="bg-blue-50 text-[#94C3D2] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vh,0.5rem)] rounded-lg text-[clamp(12px,1.2vw,14px)] font-bold flex items-center">
                      <Clock className="w-4 h-4 mr-1 shrink-0" /> {formatDuration(flight.duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 gap-2">
                  <div className="text-center min-w-[60px]">
                    <p className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-bold text-gray-800 leading-none mb-1">{formatTime(flight.departureTime)}</p>
                    <p className="text-[clamp(12px,1.2vw,14px)] font-bold text-gray-500">{flight.departAirport}</p>
                    <p className="text-[clamp(10px,1vw,12px)] text-gray-400 mt-0.5">{formatShortDate(flight.departureTime)}</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-[clamp(0.5rem,2vw,1.5rem)]">
                    <div className="w-full h-px bg-gray-300 relative">
                      <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 bg-white px-1" />
                    </div>
                    <p className="text-[clamp(10px,1vw,12px)] text-gray-500 mt-2 font-medium">Direct</p>
                  </div>

                  <div className="text-center min-w-[60px]">
                    <p className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-bold text-gray-800 leading-none mb-1">--:--</p>
                    <p className="text-[clamp(12px,1.2vw,14px)] font-bold text-gray-500">{flight.arriveAirport}</p>
                    <p className="text-[clamp(10px,1vw,12px)] text-gray-400 mt-0.5">{formatShortDate(flight.departureTime)}</p>
                  </div>
                </div>
              </div>

              {/* Price & Action Section */}
              <div className="bg-gray-50 p-[clamp(1rem,3vw,1.5rem)] flex flex-col justify-center items-center lg:items-end border-t lg:border-t-0 lg:border-l border-gray-100 min-w-[200px] shrink-0">
                <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500 mb-1">Price per traveler</p>
                <div className="flex items-baseline mb-[clamp(0.75rem,1.5vh,1rem)]">
                  <span className="text-[clamp(1.75rem,3vw,2.25rem)] font-bold text-gray-900 leading-none">${flight.price}</span>
                </div>
                <button
                  onClick={() => handleSelectTicket(flight)}
                  className="w-full px-[clamp(1rem,2vw,2rem)] py-[clamp(0.75rem,1.5vh,1rem)] bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-[clamp(0.5rem,1vw,0.75rem)] font-bold hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-md flex items-center justify-center cursor-pointer text-[clamp(14px,1.5vw,16px)]"
                >
                  Select &gt;
                </button>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center mt-[clamp(1.5rem,3vh,2rem)] pb-[clamp(1.5rem,3vh,2rem)]">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="bg-white border-2 border-gray-200 text-gray-700 font-bold px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vh,1rem)] rounded-[clamp(0.5rem,1vw,0.75rem)] hover:border-[#94C3D2] hover:text-[#94C3D2] transition-all cursor-pointer text-[clamp(14px,1.5vw,16px)]"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More Flights"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedFlight && (
        <FlightSelectionModal
          flight={selectedFlight}
          onClose={handleCloseModal}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

const FlightResultsPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-[clamp(2rem,5vw,4rem)] text-center text-[clamp(14px,1.5vw,16px)] text-gray-500 font-medium">Loading search results...</div>}>
      <FlightResultsContent />
    </Suspense>
  );
}

export default FlightResultsPage;