interface SearchBarProps {
  searchItem: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ searchItem, onChange }: SearchBarProp) {
  return (
    <div className="relative mb-6">
      <input
        type="text"
        value={searchItem}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search restaurants, cuisines, or dishes..."
        className="w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
      />
    </div>
  );
}
