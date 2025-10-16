import Navbar from "../Navbar";
import { useState } from "react";
import Heading from "./Heading";
import RestaurantList from "./RestaurantList";

export default function DiningSelection() {
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [moodMatch, setMoodMatch] = useState(false);
  const [liveAvailability, setLiveAvailability] = useState(false);
  const [groupDining, setGroupDining] = useState(false);

  const restaurants = [
    {
      name: "Bella Napoli",
      cuisine: "italian",
      rating: 4.8,
      distance: "0.8 mi",
      priceRange: "$$",
      time: "25-35 min",
      tags: ["Pizza", "Pasta", "Wine Bar"],
      gradient: "from-indigo-500 to-purple-600",
      mood: "Romantic",
      liveWait: "5 min wait",
      groupFriendly: true,
    },
    {
      name: "Tokyo Drift",
      cuisine: "asian",
      rating: 4.9,
      distance: "1.2 mi",
      priceRange: "$$$",
      time: "30-40 min",
      tags: ["Sushi", "Ramen", "Sake"],
      gradient: "from-pink-400 to-red-500",
      mood: "Adventurous",
      liveWait: "No wait",
      groupFriendly: true,
    },
    {
      name: "The Green Plate",
      cuisine: "healthy",
      rating: 4.7,
      distance: "0.5 mi",
      priceRange: "$$",
      time: "15-25 min",
      tags: ["Vegan", "Organic", "Smoothies"],
      gradient: "from-teal-300 to-pink-200",
      mood: "Energetic",
      liveWait: "2 min wait",
      groupFriendly: false,
    },
    {
      name: "Burger Kingdom",
      cuisine: "american",
      rating: 4.6,
      distance: "1.5 mi",
      priceRange: "$",
      time: "20-30 min",
      tags: ["Burgers", "Fries", "Shakes"],
      gradient: "from-orange-300 to-red-400",
      mood: "Casual",
      liveWait: "8 min wait",
      groupFriendly: true,
    },
    {
      name: "Sweet Escape",
      cuisine: "dessert",
      rating: 4.9,
      distance: "0.3 mi",
      priceRange: "$$",
      time: "10-20 min",
      tags: ["Cakes", "Ice Cream", "Coffee"],
      gradient: "from-yellow-300 to-orange-400",
      mood: "Happy",
      liveWait: "No wait",
      groupFriendly: false,
    },
    {
      name: "Spice Route",
      cuisine: "asian",
      rating: 4.7,
      distance: "2.1 mi",
      priceRange: "$$",
      time: "35-45 min",
      tags: ["Indian", "Curry", "Tandoori"],
      gradient: "from-pink-500 to-yellow-400",
      mood: "Adventurous",
      liveWait: "12 min wait",
      groupFriendly: true,
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

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesFilter =
      currentFilter === "all" || r.cuisine === currentFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesGroup = !groupDining || r.groupFriendly;
    return matchesFilter && matchesSearch && matchesGroup;
  });

  return (
    <div>
      <Navbar></Navbar>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
        <div className="max-w-7xl mx-auto">
          <Heading></Heading>

          {/* <ControlPanel
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            moodMatch={moodMatch}
            liveAvailability={liveAvailability}
            groupDining={groupDining}
          /> */}

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
