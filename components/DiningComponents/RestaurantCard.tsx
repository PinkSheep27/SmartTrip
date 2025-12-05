import { Star } from "lucide-react";

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
  address?: string;
  photo?: string | null;
  isOpen?: boolean;
}

export default function RestaurantCard({
  id,
  name,
  cuisine,
  rating,
  price,
  waitTime,
  tags,
  address,
  photo,
  isOpen,
}: RestaurantCardProps) {
  function toTitleCase(str: string) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <div className="bg-[#E8F3E8] rounded-3xl overflow-hidden shadow-lg hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-500 cursor-pointer flex flex-col">
      {/* Image/Header Section */}
      <div className="h-56 relative bg-gray-200 overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold text-indigo-600 shadow-sm">
          {price}
        </div>

        {/* Open/Closed badge */}
        {isOpen !== undefined && (
          <div
            className={`absolute bottom-4 left-4 px-3 py-1 text-xs font-semibold rounded-full ${
              isOpen ? "bg-green-600 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isOpen ? "Open Now" : "Closed"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5 relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {toTitleCase(name)}
          </h3>
          <div className="flex items-center gap-1 bg-green-100 px-2.5 py-1 rounded-full font-semibold text-gray-700 text-sm shadow-sm">
            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
            {rating}
          </div>
        </div>

        {waitTime && (
          <div className="flex items-center gap-1.5">⏱ {waitTime}</div>
        )}

        {address && (
          <div className="mt-auto pt-3 text-sm text-gray-700 border-t border-gray-200/50 flex items-start">
            <span className="truncate">{address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
