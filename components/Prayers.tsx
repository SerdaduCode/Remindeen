import { useEffect, useState } from "react";
import Prayer from "./Prayer";
import Skeleton from "./Skeleton";

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};


const Prayers = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrayerTimes = async (latitude: number, longitude: number) => {
      try {
        const date = new Date().toISOString().split("T")[0];
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=20`
        );
        const data = await response.json();

        if (data && data.data && data.data.timings) {
          setPrayerTimes({
            Fajr: data.data.timings.Fajr,
            Dhuhr: data.data.timings.Dhuhr,
            Asr: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isha: data.data.timings.Isha,
          });
        } else {
          setError("Data waktu salat tidak ditemukan.");
        }
      } catch (error) {
        console.error("Error fetching prayer times", error);
        setError("Failed take Prayer times");
      } finally {
        setLoading(false);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchPrayerTimes(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location", error);
            setError("Gagal mendapatkan lokasi pengguna.");
            setLoading(false);
          }
        );
      } else {
        setError("Geolocation doesn't support this browser.");
        setLoading(false);
      }
    };

    getLocation();
  }, []);
  if (!prayerTimes) {
    return <Skeleton />;
  }

  return (
    <div className="flex flex-col gap-1 text-base md:text-xl">
      <Prayer name="Fajr" time={prayerTimes.Fajr} />
      <Prayer name="Dhuhr" time={prayerTimes.Dhuhr} />
      <Prayer name="Asr" time={prayerTimes.Asr} />
      <Prayer name="Maghrib" time={prayerTimes.Maghrib} />
      <Prayer name="Isha" time={prayerTimes.Isha} />
    </div>
  );
};

export default Prayers;
