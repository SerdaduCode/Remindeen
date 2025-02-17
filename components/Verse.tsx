import React, { useEffect, useState } from "react";

interface Quote {
  arabic: string;
  quote: string;
  author: string;
}

const Verse: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<any>(null);
  const isFetched = useRef(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(
        `${import.meta.env.VITE_API_SEARCH}?q=${encodeURIComponent(
          searchQuery
        )}`,
        "_blank"
      );
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (isFetched.current) return; // Jangan fetch lagi jika sudah dilakukan
    isFetched.current = true; // Tandai fetch sudah dilakukan
    const fetchQuote = async () => {
      try {
        // Fetch quote dari API baru
        const response = await fetch(`${import.meta.env.VITE_API_QUOTES}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // Set data ke state
        setQuote({
          arabic: data.arabic || "", // Jika `arabic` kosong, set placeholder
          quote: data.quote,
          author: data.author,
        });
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
            <p className="md:text-xl text-sm mb-8 text-center">
              {quote.arabic}
            </p>
            <p className="md:text-xl text-sm mb-3 text-center">
              "{quote.quote}"
            </p>
            <p className="md:text-base text-sm flex justify-end mr-24">
              {quote.author}
            </p>
          </div>
        ) : (
          !error && (
            <div className="animate-pulse">
              <div className="h-2.5 bg-gray-300 rounded-full  max-w-[640px] md:max-w-[720px] mb-2.5 mx-auto" />
              <div className="h-2.5 bg-gray-300 rounded-full  max-w-[640px] md:max-w-[720px] mb-2.5 mx-auto" />
              <div className="h-2.5 mx-auto bg-gray-300 rounded-full  max-w-[540px]" />
            </div>
          )
        )}
      </div>
      <div className="flex justify-center">
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full max-w-md bg-white shadow rounded-full p-2 border border-gray-300 shadow-slate-300"
        >
          <img
            src="/icon/search.png"
            alt="Search Icon"
            className="text-gray-500 ml-3 w-5 h-5 cursor-pointer"
            onClick={(e: any) => handleSearch(e)}
          />
          <input
            type="text"
            placeholder="Search Google or type a URL"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow px-4 text-black outline-none text-sm italic"
          />
        </form>
      </div>
    </div>
  );
};

export default Verse;
