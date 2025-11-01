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
  isOpen?: boolean | undefined;
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
  return (
    <div className="bg-[#E8F3E8] rounded-3xl overflow-hidden shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 cursor-pointer">
      {/* Image/Header Section */}
      <div
        className="h-56 relative bg-cover bg-center"
        style={{
          backgroundImage: photo ? `url(${encodeURI(photo)})` : undefined,
        }}
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
        <h4 className="text-sm font-semibold text-gray-700 truncate mb-2">
          {cuisine}
        </h4>
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
          {waitTime && (
            <div className="flex items-center gap-1.5">{waitTime}</div>
          )}
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
