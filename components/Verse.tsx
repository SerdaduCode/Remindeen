import React, { useEffect, useState } from "react";

interface Hadith {
  arabic: string;
  english: string;
  reference: string;
}

const Verse: React.FC = () => {
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_LENGTH = 100; // Batas maksimum panjang teks (contoh: 300 karakter)

  useEffect(() => {
    const fetchHadith = async () => {
      try {
        // Fetch semua koleksi hadith
        const collectionsResponse = await fetch(`https://hadis-api-id.vercel.app/hadith`);
        const collections = await collectionsResponse.json();
        console.log("Collections Response:", collections);

        if (collections.length === 0) {
          throw new Error("No collections available");
        }

        // Pilih koleksi acak
        const randomCollectionIndex = Math.floor(Math.random() * collections.length);
        const selectedCollection = collections[randomCollectionIndex];
        
        const totalHadith = selectedCollection.total;
        const collectionSlug = selectedCollection.slug;
        console.log("Selected Collection:", selectedCollection);

        let validHadith = null;

        while (!validHadith) {
          // Pilih nomor hadith acak dari koleksi yang dipilih
          const randomHadithNumber = Math.floor(Math.random() * totalHadith) + 1;

          // Fetch hadith secara acak dari koleksi
          const response = await fetch(`https://hadis-api-id.vercel.app/hadith/${collectionSlug}/${randomHadithNumber}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("API Response:", data);

          if (data && data.arab && data.id) {
            const arabicTextLength = data.arab.length;
            const englishTextLength = data.id.length;

            // Cek apakah panjang teks terlalu panjang
            if (arabicTextLength <= MAX_LENGTH && englishTextLength <= MAX_LENGTH) {
              validHadith = {
                arabic: data.arab,
                english: data.id,
                reference: `Hadith ${data.name} nomor ${data.number}`,
              };
            } else {
              console.log("Text too long, fetching another hadith...");
            }
          } else {
            throw new Error("Invalid data structure");
          }
        }

        setHadith(validHadith);
        setError(null);
      } catch (error) {
        console.error("Error fetching hadith:", error);
        setError(error.message);
      }
    };

    fetchHadith();
  }, []);

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {hadith ? (
        <>
          <p className="md:text-[32px] text-sm mb-8">{hadith.arabic}</p>
          <p className="md:text-2xl text-sm mb-5">"{hadith.english}"</p>
          <p className="md:text-2xl text-sm">{hadith.reference}</p>
        </>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
};

export default Verse;
