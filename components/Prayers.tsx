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
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(true);

  const getNextPrayer = (times: PrayerTimes | null) => {
    if (!times) return { prayer: "Fajr", time: "00:00" };

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const [prayer, time] of Object.entries(times)) {
      const [hours, minutes] = time.split(":").map(Number);
      const prayerTime = hours * 60 + minutes;

      if (prayerTime > currentTime) {
        return { prayer, time };
      }
    }

    return { prayer: "Fajr", time: times.Fajr };
  };

  const [nextPrayer, setNextPrayer] = useState(getNextPrayer(prayerTimes));

  useEffect(() => {
    const fetchPrayerTimes = async (latitude: number, longitude: number) => {
      try {
        const date = new Date().toISOString().split("T")[0];
        const response = await fetch(
          `${
            import.meta.env.VITE_API_PRAYER_TIMES
          }/${date}?latitude=${latitude}&longitude=${longitude}&method=20`
        );
        const data = await response.json();

        if (data?.data?.timings) {
          const newTimes: PrayerTimes = {
            Fajr: data.data.timings.Fajr,
            Dhuhr: data.data.timings.Dhuhr,
            Asr: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isha: data.data.timings.Isha,
          };
          setPrayerTimes(newTimes);
          setNextPrayer(getNextPrayer(newTimes));
        } else {
          setError("Data waktu salat tidak ditemukan.");
        }
      } catch (error) {
        console.error("Error fetching prayer times", error);
        setError("Failed to fetch Prayer times");
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchPrayerTimes(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          (error) => {
            console.error("Error getting location", error);
            setError("Gagal mendapatkan lokasi pengguna.");
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextPrayer(getNextPrayer(prayerTimes));
    }, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  if (error) return <p>{error}</p>;
  if (!prayerTimes) return <Skeleton />;

  return (
    <div className="flex flex-col gap-2 text-base md:text-xl">
      <div
        className="bg-teal-500 text-slate-800 px-5 rounded-md cursor-pointer"
        onClick={() => setHidden(!hidden)}
      >
        <Prayer name={nextPrayer?.prayer} time={nextPrayer?.time}>
          <div
            className={`flex justify-end ${
              hidden ? "rotate-90" : "rotate-180"
            }`}
          >
            ^
          </div>
        </Prayer>
      </div>
      <div
        className={`flex flex-col gap-1 text-base md:text-xl
          ${hidden ? "opacity-0 duration-300" : "opacity-100 duration-300"}`}
      >
        <Prayer name="Fajr" time={prayerTimes.Fajr} />
        <Prayer name="Dhuhr" time={prayerTimes.Dhuhr} />
        <Prayer name="Asr" time={prayerTimes.Asr} />
        <Prayer name="Maghrib" time={prayerTimes.Maghrib} />
        <Prayer name="Isha" time={prayerTimes.Isha} />
      </div>
    </div>
  );
};

export default Prayers;
