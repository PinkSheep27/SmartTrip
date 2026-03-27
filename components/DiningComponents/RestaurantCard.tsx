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
  addToCart: () => void | Promise<void>;
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
  addToCart,
}: RestaurantCardProps) {
  function toTitleCase(str: string) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <div className="bg-[#E8F3E8] rounded-[clamp(1rem,2vw,1.5rem)] overflow-hidden shadow-lg hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-500 cursor-pointer flex flex-col">
      {/* Image/Header Section */}
      <div className="h-[clamp(12rem,15vh,16rem)] relative bg-gray-200 overflow-hidden">
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
        <div className="absolute top-[clamp(0.75rem,1.5vw,1rem)] right-[clamp(0.75rem,1.5vw,1rem)] bg-white/95 backdrop-blur-sm px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.25rem,0.5vh,0.5rem)] rounded-full text-[clamp(12px,1.2vw,14px)] font-semibold text-indigo-600 shadow-sm">
          {price}
        </div>

        {/* Open/Closed badge */}
        {isOpen !== undefined && (
          <div
            className={`absolute bottom-[clamp(0.75rem,1.5vw,1rem)] left-[clamp(0.75rem,1.5vw,1rem)] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vh,0.5rem)] text-[clamp(10px,1vw,12px)] font-semibold rounded-full ${
              isOpen ? "bg-green-600 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isOpen ? "Open Now" : "Closed"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-[clamp(1rem,2vw,1.5rem)] relative">
        <div className="flex justify-between items-start gap-2 mb-[clamp(0.5rem,1vh,0.75rem)]">
          <h3 className="text-[clamp(1.125rem,2vw,1.25rem)] font-bold text-gray-900 leading-tight">
            {toTitleCase(name)}
          </h3>
          <div className="shrink-0 flex items-center gap-1 bg-green-100 px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vh,0.5rem)] rounded-full font-semibold text-gray-700 text-[clamp(12px,1.2vw,14px)] shadow-sm">
            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
            {rating}
          </div>
        </div>

        {waitTime && (
          <div className="flex items-center gap-1.5 text-[clamp(13px,1.5vw,14px)] text-gray-700 mb-[clamp(0.75rem,2vh,1rem)]">
            ⏱ {waitTime}
          </div>
        )}

        <div className="mt-auto pt-[clamp(0.75rem,1.5vh,1rem)] border-t border-gray-200/50 flex justify-between items-center gap-2">
          {address && (
            <div className="text-[clamp(12px,1.2vw,14px)] text-gray-700 flex-1 min-w-0 truncate">
              {address}
            </div>
          )}
          <button
            onClick={addToCart}
            className="shrink-0 text-[clamp(12px,1.2vw,14px)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vh,0.75rem)] bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-[clamp(0.5rem,1vw,0.75rem)] font-bold hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-md flex items-center space-x-2 group"
          >
            <span>Add to Cart &gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
}