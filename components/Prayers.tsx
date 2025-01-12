import { useEffect, useState } from "react";
import Prayer from "./Prayer";

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

const Prayers = () => {
  const [location, setLocation] = useState("Jakarta, Indonesia");
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
        setError("Gagal mengambil data waktu salat.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLocationName = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=YOUR_API_KEY`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const city = data[0].name;
          const country = data[0].country;
          setLocation(`${city}, ${country}`);
        } else {
          setError("Nama lokasi tidak ditemukan.");
        }
      } catch (error) {
        console.error("Error fetching location name", error);
        setError("Gagal mengambil nama lokasi.");
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchPrayerTimes(latitude, longitude);
            fetchLocationName(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location", error);
            setError("Gagal mendapatkan lokasi pengguna.");
            setLoading(false);
          }
        );
      } else {
        setError("Geolokasi tidak didukung oleh browser ini.");
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  if (loading) {
    return <div>Memuat waktu salat...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!prayerTimes) {
    return <div>Waktu salat tidak tersedia.</div>;
  }

  return (
    <div className="flex flex-col gap-1 text-base md:text-xl">
      <p className="md:text-[32px] text-xl">{location}</p>
      <Prayer name="Fajr" time={prayerTimes.Fajr} />
      <Prayer name="Dhuhr" time={prayerTimes.Dhuhr} />
      <Prayer name="Asr" time={prayerTimes.Asr} />
      <Prayer name="Maghrib" time={prayerTimes.Maghrib} />
      <Prayer name="Isha" time={prayerTimes.Isha} />
    </div>
  );
};

export default Prayers;
