export type prices = "$" | "$$" | "$$$";

export interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  price: prices;
  distance?: string;
  waitTime?: string;
  tags: string[];
}

export default function RestaurantCard({
  id,
  name,
  cuisine,
  rating,
  price,
  waitTime,
  tags,
}: RestaurantCardProps) {
  return (
    <div className="bg-[#E8F3E8] rounded-3xl overflow-hidden shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 cursor-pointer">
      {/* Image/Header Section */}
      <div
        className={`h-56 bg-gradient-to-br ${getGradientByCuisine(
          cuisine
        )} relative`}
      >
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-m font-semibold text-indigo-600">
          {price}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          <div className="flex items-center gap-1 bg-green-200 px-3 py-1 rounded-full font-semibold text-gray-600 text-sm">
            {rating}
          </div>
        </div>
        <div className="">
          <h4 className="text-sm font-semibold text-gray-700 truncate">
            {cuisine}
          </h4>
        </div>
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">{waitTime}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to get gradient based on cuisine type
function getGradientByCuisine(cuisine: string): string {
  const gradients: Record<string, string> = {
    italian: "from-indigo-500 to-purple-600",
    asian: "from-pink-400 to-red-500",
    healthy: "from-teal-300 to-pink-200",
    american: "from-orange-300 to-red-400",
    dessert: "from-yellow-300 to-orange-400",
  };

  return gradients[cuisine.toLowerCase()] || "from-gray-400 to-gray-600";
}
