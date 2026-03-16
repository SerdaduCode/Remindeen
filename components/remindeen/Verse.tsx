import { Search } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

interface Quote {
  arabic: string;
  quote: string;
  author: string;
}

const Verse: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<any>(null);
  const isFetched = useRef(false);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    const expirationTime = 1000 * 60 * 60 * 12;
    const storedQuotes = localStorage.getItem("Quotes");
    const lastFetchTime = localStorage.getItem("LastFetchTime");

    const currentTime = new Date().getTime();

    if (storedQuotes && lastFetchTime) {
      const timeDifference = currentTime - Number(lastFetchTime);

      if (timeDifference < expirationTime) {
        const quotes = JSON.parse(storedQuotes);
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
      }
    } else {
      if (isFetched.current) return;
      isFetched.current = true;

      const fetchQuote = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_QUOTES}`);
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

          const data = await response.json();

          localStorage.setItem("Quotes", JSON.stringify(data));
          localStorage.setItem("LastFetchTime", currentTime.toString());

          const randomQuote = data[Math.floor(Math.random() * data.length)];
          setQuote(randomQuote);
        } catch (error) {
          console.error("Error fetching quote:", error);
          setError(error);
        }
      };

      fetchQuote();
    }
  }, []);

  const handleSearch = () => {
    const q = searchVal.trim();
    if (!q) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
      setSearchVal("");
    }
  };

  return (
    <div className="my-5">
      <div className="no-scrollbar container mx-auto mb-8 max-w-[80%]">
        {error && <p>Error: {error.message}</p>}
        {quote ? (
          <div>
            <p className="md:text-4xl/loose text-arabic text-sm text-[#EDE8D2] mb-8 text-center drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)] leading-relaxed">
              {quote.arabic}
            </p>
            <p className="md:text-xl text-sm mb-3 text-center text-[#EDE8D2] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">
              "{quote.quote}"
            </p>
            <span
              className="md:text-sm text-center text-sm flex justify-center mr-24 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)] max-w-40 px-3 py-0.5 rounded-full"
              style={{
                background: "#2e2a1a",
                border: "1px solid rgba(176,169,122,0.25)",
                color: "#B0A97A",
              }}
            >
              {quote.author}
            </span>
          </div>
        ) : (
          !error && (
            <div className="animate-pulse">
              <div className="h-2.5 bg-[#2e2a1a] opacity-60 rounded-full max-w-[640px] md:max-w-[720px] mb-2.5 mx-auto" />
              <div className="h-2.5 bg-[#2e2a1a] opacity-60 rounded-full max-w-[640px] md:max-w-[720px] mb-2.5 mx-auto" />
              <div className="h-2.5 mx-auto bg-[#2e2a1a] opacity-60 rounded-full max-w-[540px]" />
            </div>
          )
        )}
      </div>
      <div className="verse-fade-up verse-delay-3 w-full max-w-2xl mx-auto ">
        {/* Input row */}
        <div
          className="search-wrap flex items-center gap-3 rounded-full px-5 py-3 bg-[#2e2a1a]"
          style={{
            border: "1px solid rgba(176,169,122,0.24)",
          }}
        >
          <Search
            size={15}
            style={{ color: "#B0A97A", opacity: 0.5, flexShrink: 0 }}
          />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari di Google..."
            className="flex-1 bg-transparent outline-none border-none text-sm tracking-wide"
            style={{
              color: "#EDE8D2",
              caretColor: "#B0A97A",
              fontFamily: "'Raleway', sans-serif",
            }}
          />
          <button
            onClick={handleSearch}
            className="search-cta flex-shrink-0 text-xs tracking-widest uppercase px-4 py-1.5 rounded-full"
            style={{
              background: "rgba(176,169,122,0.18)",
              border: "1px solid rgba(176,169,122,0.3)",
              color: "#B0A97A",
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            Cari
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verse;
