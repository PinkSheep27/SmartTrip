import Navbar from "../Navbar";
import { useState } from "react";
import Heading from "./Heading";
import RestaurantList from "./RestaurantList";

import type { prices } from "./RestaurantCard";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  price: prices;
  tags: string[];
  waitTime: string;
}

export default function DiningSelection() {
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const restaurants: Restaurant[] = [
    {
      id: "1",
      name: "Bella Napoli",
      cuisine: "Italian",
      rating: 4.8,
      distance: "0.8 mi",
      price: "$$",
      tags: ["Pizza", "Pasta", "Wine Bar"],
      waitTime: "5 min wait",
    },
    {
      id: "2",
      name: "Tokyo Drift",
      cuisine: "Asian",
      rating: 4.9,
      distance: "1.2 mi",
      price: "$$$",
      tags: ["Sushi", "Ramen", "Sake"],
      waitTime: "No wait",
    },
    {
      id: "3",
      name: "The Green Plate",
      cuisine: "Healthy",
      rating: 4.7,
      distance: "0.5 mi",
      price: "$$",
      tags: ["Vegan", "Organic", "Smoothies"],
      waitTime: "2 min wait",
    },
    {
      id: "4",
      name: "Burger Kingdom",
      cuisine: "American",
      rating: 4.6,
      distance: "1.5 mi",
      price: "$",
      tags: ["Burgers", "Fries", "Shakes"],
      waitTime: "8 min wait",
    },
    {
      id: "5",
      name: "Sweet Escape",
      cuisine: "Dessert",
      rating: 4.9,
      distance: "0.3 mi",
      price: "$$",
      tags: ["Cakes", "Ice Cream", "Coffee"],
      waitTime: "No wait",
    },
    {
      id: "6",
      name: "Spice Route",
      cuisine: "Asian",
      rating: 4.7,
      distance: "2.1 mi",
      price: "$$",
      tags: ["Indian", "Curry", "Tandoori"],
      waitTime: "12 min wait",
    },
  ];

  const filters = [
    { id: "all", label: "All Dining" },
    { id: "italian", label: "Italian" },
    { id: "asian", label: "Asian" },
    { id: "american", label: "American" },
    { id: "healthy", label: "Healthy" },
    { id: "dessert", label: "Desserts" },
  ];

  // Filtering logic
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Filter by cuisine category
    const matchesFilter =
      currentFilter === "all" ||
      restaurant.cuisine.toLowerCase() === currentFilter.toLowerCase();

    // Filter by search term (searches name, cuisine, and tags)
    const matchesSearch =
      searchTerm === "" ||
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br bg-[#94C3D2] p-5">
        <Navbar></Navbar>
        <div className="max-w-7xl mx-auto pt-4">
          <Heading></Heading>

          {/* Search and Filter Controls */}
          <div className="mb-8 animate-fade-in">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines, or dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                </div>

                <input
                  type="text"
                  placeholder="Enter city or zip code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300 text-gray-800 placeholder-gray-500 text-lg transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setCurrentFilter(filter.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                    currentFilter === filter.id
                      ? "bg-white text-amber-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {searchTerm && (
              <div className="mt-4 text-amber-50 text-sm">
                Found {filteredRestaurants.length} restaurant
                {filteredRestaurants.length !== 1 ? "s" : ""} matching "
                {searchTerm}"
              </div>
            )}
          </div>

          <RestaurantList restaurants={filteredRestaurants} />
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
