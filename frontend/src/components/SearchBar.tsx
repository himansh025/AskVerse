import { Search } from "lucide-react";
import { useState } from "react";

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = () => {
    onSearch(searchQuery.trim());
  };

  return (
    <div className="w-full max-w-xl">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleClick();
            }
          }}
          placeholder="Search questions..."
          className="h-13 w-full rounded-full border border-white/70 bg-white/85 pl-11 pr-28 text-slate-800 shadow-[0_18px_50px_rgba(21,35,58,0.10)] outline-none backdrop-blur-md transition-all placeholder:text-slate-400 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[rgba(22,93,134,0.12)]"
        />

        <button
          onClick={handleClick}
          className="absolute bottom-1.5 right-1.5 top-1.5 inline-flex items-center rounded-full bg-[var(--color-brand)] px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(22,93,134,0.25)] transition-all hover:bg-[#124a6b]"
        >
          Search
        </button>
      </div>
    </div>
  );
};
