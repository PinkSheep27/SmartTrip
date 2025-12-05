"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AutocompleteInput, { Suggestion } from '@/components/AutocompleteInput';

const debounce = (func: Function, delay: number) => {
  // ... (implementation)
  let timeoutId: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const FlightPage: React.FC = () => {
  const router = useRouter();

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
      setArrivingSuggestions([]); // Clear other list when typing
    } else {
      setArriving(value);
      setDepartingSuggestions([]); // Clear other list
    }
    
    fetchSuggestions(value, inputType);
  };

  const handleSelectSuggestion = (suggestion: Suggestion, inputType: "departing" | "arriving") => {
    // Set the state to the IATA code (e.g., "JFK")
    const code = suggestion.code; 
    
    if (inputType === "departing") {
      setDeparting(code);
      setDepartingSuggestions([]);
    } else {
      setArriving(code);
      setArrivingSuggestions([]);
    }
    setFocusedInput(null); // Clear focus
  };
  
  // Handle search
  const handleSearch = () => {
    // Basic validation
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

    // Build URL params
    const params = new URLSearchParams({
      tripType,
      departing,
      arriving,
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : "",
    });

    router.push(`/FlightsPage/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#94C3D2] flex flex-col items-center pt-20">
      
      {/* Airports Input */}
      <div className="flex items-center gap-4 mt-10">
        
        {/* REPLACED with AutocompleteInput */}
        <AutocompleteInput
          value={departing}
          placeholder="Departing Airport/City"
          inputType="departing"
          onChange={handleInputChange}
          onSelect={handleSelectSuggestion}
          suggestions={departingSuggestions}
          isFocused={focusedInput === "departing"}
          onFocus={() => setFocusedInput("departing")}
          onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
          className="p-3 border rounded-lg w-56" // Pass your custom styling
        />
        
        <span className="text-2xl">→</span>

        {/* REPLACED with AutocompleteInput */}
        <AutocompleteInput
          value={arriving}
          placeholder="Arriving Airport/City"
          inputType="arriving"
          onChange={handleInputChange}
          onSelect={handleSelectSuggestion}
          suggestions={arrivingSuggestions}
          isFocused={focusedInput === "arriving"}
          onFocus={() => setFocusedInput("arriving")}
          onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
          className="p-3 border rounded-lg w-56" // Pass your custom styling
        />
      
      </div>

      {/* Dates Input */}
      <div className="flex items-center gap-4 mt-6">
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          className="p-3 border rounded-lg w-56"
          min={today}
        />

        {tripType === "roundtrip" && (
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="p-3 border rounded-lg w-56"
            min={departureDate || today}
          />
        )}
      </div>

        {/* Trip Type Selector */}
      <div className="flex gap-6 mt-8">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tripType"
            value="oneway"
            checked={tripType === "oneway"}
            onChange={() => setTripType("oneway")}
          />
          One-way
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tripType"
            value="roundtrip"
            checked={tripType === "roundtrip"}
            onChange={() => setTripType("roundtrip")}
          />
          Round-trip
        </label>
      </div>
      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Search Flights
      </button>
    </div>
  );
};

export default FlightPage;
