import React, { useEffect, useState } from "react";

interface Hadith {
  arabic: string;
  english: string;
  reference: string;
}

const Verse: React.FC = () => {
  const [hadith, setHadith] = useState<Hadith | null>(null);
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
    const fetchHadith = async () => {
      try {
        // Fetch semua koleksi hadith
        const collectionsResponse = await fetch(
          `https://hadis-api-id.vercel.app/hadith`
        );
        const collections = await collectionsResponse.json();
        console.log("Collections Response:", collections);

        if (collections.length === 0) {
          throw new Error("No collections available");
        }

        // Pilih koleksi acak
        const randomCollectionIndex = Math.floor(
          Math.random() * collections.length
        );
        const selectedCollection = collections[randomCollectionIndex];

        const totalHadith = selectedCollection.total;
        const collectionSlug = selectedCollection.slug;
        console.log("Selected Collection:", selectedCollection);

        // Pilih nomor hadith acak dari koleksi yang dipilih
        const randomHadithNumber = Math.floor(Math.random() * totalHadith) + 1;

        // Fetch hadith secara acak dari koleksi
        const response = await fetch(
          `https://hadis-api-id.vercel.app/hadith/${collectionSlug}/${randomHadithNumber}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API Response:", data);

        if (data && data.arab && data.id) {
          const hadithData: Hadith = {
            arabic: data.arab,
            english: data.id,
            reference: `Hadith ${data.name} nomor ${data.number}`,
          };
          setHadith(hadithData);
          setError(null);
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (error) {
        console.error("Error fetching hadith:", error);
        setError(error);
      }
    };

    fetchHadith();
  }, []);

  return (
    <div className="mt-20">
      <div className="no-scrollbar container mx-auto mb-8 max-h-[200px] max-w-[80%] overflow-y-auto">
        {error && <p>Error: {error}</p>}
        {hadith ? (
          <div>
            <p className="md:text-xl text-sm mb-8 text-center">
              {hadith.arabic}
            </p>
            <p className="md:text-xl text-sm mb-5 text-center">
              "{hadith.english}"
            </p>
            <p className="md:text-base text-sm flex justify-end">
              {hadith.reference}
            </p>
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
