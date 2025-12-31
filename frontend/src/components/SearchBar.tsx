import { Search } from "lucide-react";
import { useState } from "react";

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = () => {
    onSearch(searchQuery.trim());
  };

  return (
    <div className="hidden md:block flex-1 max-w-md mx-8">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions..."
          className="w-full h-10 pl-10 pr-24 rounded-full bg-[#064070] text-blue-100 focus:outline-none"
        />

        <button
          onClick={handleClick}
          className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-[#3b3438ff] text-white flex items-center"
        >
          Search
        </button>
      </div>
    </div>
  );
};
