import React, { useEffect, useState } from "react";

interface Quote {
  arabic: string;
  quote: string;
  author: string;
}

const Verse: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<any>();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
        "_blank"
      );
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Fetch quote dari API baru
        const response = await fetch("https://quotes.serdadu.dev/quotes/random");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Set data ke state
        setQuote({
          arabic: data.arabic || "", // Jika `arabic` kosong, set placeholder
          quote: data.quote,
          author: data.author,
        });

        setError(null);
      } catch (error) {
        console.error("Error fetching quote:", error);
        setError(error);
      }
    };

    fetchQuote();
  }, []);

  return (
    <div className="mt-20">
      <div className="no-scrollbar container mx-auto mb-8 max-h-[200px] max-w-[80%] overflow-y-auto">
        {error && <p>Error: {error.message}</p>}
        {quote ? (
          <div>
            <p className="md:text-xl text-sm mb-8 text-center">{quote.arabic}</p>
            <p className="md:text-xl text-sm mb-5 text-center">"{quote.quote}"</p>
            <p className="md:text-base text-sm flex justify-end">{quote.author}</p>
          </div>
        ) : (
          !error && <p>Loading...</p>
        )}
      </div>
      <div className="flex justify-center">
        <form
          onSubmit={handleSearch}
          className="w-full max-w-[400px] md:max-w-[600px] "
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Google..."
            className="w-full opacity-75 px-4 py-2 rounded-md bg-slate-100 text-slate-500 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50"
          />
        </form>
      </div>
    </div>
  );
};

export default Verse;
