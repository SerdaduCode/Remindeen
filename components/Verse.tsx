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

  return (
    <div className="my-3">
      <div className="no-scrollbar container mx-auto mb-8 max-h-[200px] max-w-[80%] overflow-y-auto">
        {error && <p>Error: {error.message}</p>}
        {quote ? (
          <div>
            <p className="md:text-4xl text-arabic text-sm mb-8 text-center">
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
              <div className="h-2.5 bg-gray-300 rounded-full max-w-[640px] md:max-w-[720px] mb-2.5 mx-auto" />
              <div className="h-2.5 bg-gray-300 rounded-full max-w-[640px] md:max-w-[720px] mb-2.5 mx-auto" />
              <div className="h-2.5 mx-auto bg-gray-300 rounded-full max-w-[540px]" />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Verse;
