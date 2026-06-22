import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
}

const SearchBar = ({ className = "" }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Allow Ctrl+K / Cmd+K shortcut to focus the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Detect if the query is a URL
    const isUrl =
      /^(https?:\/\/)/i.test(trimmed) ||
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed);

    if (isUrl) {
      const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      window.location.href = url;
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
    }
  };

  return (
    <div className={`w-full max-w-[780px] mx-auto my-5 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center rounded-full
            transition-all duration-300 ease-out
            ${
              isFocused
                ? "bg-white/20 backdrop-blur-xl shadow-[0_16px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/30 scale-[1.02]"
                : "bg-white/20 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.15)] ring-1 ring-white/15 hover:bg-white/15 hover:ring-white/25"
            }
          `}
        >
          <Search
            className={`absolute left-4 h-[18px] w-[18px] transition-colors duration-200 ${
              isFocused ? "text-white" : "text-white/60"
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search Google or type a URL"
            className="
              w-full bg-transparent py-3.5 pl-11 pr-16
              text-white text-[16px] font-medium tracking-wide
              placeholder:text-white/60
              outline-none border-none
              caret-white/80
            "
            autoComplete="off"
            spellCheck={false}
          />
          <div className={`absolute right-4 text-[16px] font-medium tracking-wider pointer-events-none select-none hidden md:block ${
              isFocused ? "text-white" : "text-white/60"
            }`}>
            ⌘K
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
