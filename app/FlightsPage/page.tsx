"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AutocompleteInput, { Suggestion } from '@/components/FlightComponents/AutocompleteInput';
import { PlaneTakeoff, PlaneLanding, Search } from "lucide-react";

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const FlightPage: React.FC = () => {
  const router = useRouter();

  // Animation state
  const [isSearching, setIsSearching] = useState(false);

  // Trip type
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("roundtrip");

  // Airports
  const [departing, setDeparting] = useState("");
  const [arriving, setArriving] = useState("");

  // Dates
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [departingSuggestions, setDepartingSuggestions] = useState<Suggestion[]>([]);
  const [arrivingSuggestions, setArrivingSuggestions] = useState<Suggestion[]>([]);
  const [focusedInput, setFocusedInput] = useState<"departing" | "arriving" | null>(null);

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  const fetchSuggestions = useCallback(
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
    }, 300), 
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, inputType: "departing" | "arriving") => {
    const value = e.target.value;
    
    if (inputType === "departing") {
      setDeparting(value);
      setArrivingSuggestions([]); 
    } else {
      setArriving(value);
      setDepartingSuggestions([]); 
    }
    
    fetchSuggestions(value, inputType);
  };

  const handleSelectSuggestion = (suggestion: Suggestion, inputType: "departing" | "arriving") => {
    const code = suggestion.code; 
    
    if (inputType === "departing") {
      setDeparting(code);
      setDepartingSuggestions([]);
    } else {
      setArriving(code);
      setArrivingSuggestions([]);
    }
    setFocusedInput(null);
  };
  
  const handleSearch = () => {
    if (!departing) {
      alert("ERROR: Please enter a departing airport.");
      return;
    }
    if (!arriving) {
      alert("ERROR: Please enter an arriving airport.");
      return;
    }
    if (!departureDate) {
      alert("ERROR: Please select a departure date.");
      return;
    }
    if (tripType === "roundtrip" && returnDate < departureDate) {
      alert("ERROR: Return date cannot be before departure date.");
      return;
    }

    const params = new URLSearchParams({
      tripType,
      departing,
      arriving,
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : "",
    });

    // Trigger animation, then delay the route push so the animation finishes
    setIsSearching(true);
    setTimeout(() => {
      router.push(`/FlightsPage/results?${params.toString()}`);
    }, 600); // 600ms matches the CSS transition duration
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[clamp(6rem,10vh,8rem)] overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-[clamp(1rem,4vw,2rem)] w-full">
        
        {/* Hero Text (Fades out and collapses its height on search) */}
        <div 
          className={`text-center transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-end ${
            isSearching ? 'opacity-0 scale-95 h-0 mb-0' : 'opacity-100 scale-100 h-[180px] mb-[clamp(1.5rem,4vh,2.5rem)]'
          }`}
        >
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold mb-[clamp(0.5rem,2vh,1rem)] tracking-tight text-gray-900">
            Find Your Perfect Flight
          </h1>
          <p className="text-[clamp(1.125rem,2vw,1.5rem)] text-gray-600">
            Search, compare, and book flights worldwide
          </p>
        </div>

        {/* Horizontal Search Bar */}
        <div className={`bg-white rounded-[clamp(1rem,2vw,1.5rem)] p-[clamp(1rem,3vw,1.5rem)] border border-gray-100 transition-all duration-700 ${
          isSearching ? 'shadow-lg' : 'shadow-md'
        }`}>
          
          <div className="flex flex-col lg:flex-row gap-[clamp(0.5rem,1.5vw,1rem)] mb-[clamp(1rem,2vh,1.5rem)]">
            <div className="flex-[1.5] min-w-[200px] relative">
               <PlaneTakeoff className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
               <AutocompleteInput
                  value={departing}
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
                  value={arriving}
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
            
            <div className="flex-1 min-w-[140px]">
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white cursor-pointer text-[16px] lg:text-[clamp(13px,1.5vw,16px)]"
                min={today}
              />
            </div>
            
            {tripType === "roundtrip" && (
              <div className="flex-1 min-w-[140px]">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.75rem,1.5vh,1rem)] border-2 border-gray-200 rounded-[clamp(0.5rem,1vw,0.75rem)] focus:outline-none focus:border-[#94C3D2] text-gray-800 transition-all bg-white cursor-pointer text-[16px] lg:text-[clamp(13px,1.5vw,16px)]"
                  min={departureDate || today}
                />
              </div>
            )}
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="relative bg-gradient-to-r from-[#94C3D2] to-[#7FB3C4] text-white rounded-[clamp(0.5rem,1vw,0.75rem)] hover:shadow-lg transition-all font-bold min-w-[140px] cursor-pointer"
            >
              {/* Invisible placeholder forcing the exact dimensions */}
              <div className="flex items-center justify-center px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vh,1rem)] opacity-0 pointer-events-none">
                <Search className="w-5 h-5 mr-2" /> Search
              </div>

              {/* Absolutely positioned active content */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <div className="flex items-center text-[clamp(14px,1.5vw,16px)]">
                    <Search className="w-5 h-5 mr-2" /> Search
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Radio Buttons Row */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-[clamp(1rem,2vh,1.5rem)]">
             <div className="flex gap-[clamp(1rem,2vw,1.5rem)]">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-[#94C3D2] transition-colors text-[clamp(14px,1.5vw,16px)]">
                  <input
                    type="radio" name="tripType" value="oneway"
                    checked={tripType === "oneway"}
                    onChange={() => setTripType("oneway")}
                    className="w-4 h-4 text-[#94C3D2] focus:ring-[#94C3D2] cursor-pointer"
                  /> One-way
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-[#94C3D2] transition-colors text-[clamp(14px,1.5vw,16px)]">
                  <input
                    type="radio" name="tripType" value="roundtrip"
                    checked={tripType === "roundtrip"}
                    onChange={() => setTripType("roundtrip")}
                    className="w-4 h-4 text-[#94C3D2] focus:ring-[#94C3D2] cursor-pointer"
                  /> Round-trip
                </label>
             </div>

             {/* Invisible spacer: pre-stretches this row to match the height of the dropdowns on the results page */}
             <div className="h-[44px] hidden md:block opacity-0 pointer-events-none" aria-hidden="true"></div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default FlightPage;