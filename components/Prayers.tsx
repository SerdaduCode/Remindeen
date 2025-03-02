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
  const [timeRemainingText, setTimeRemainingText] = useState<string>("");

  const getNextPrayer = (times: PrayerTimes | null) => {
    if (!times)
      return { prayer: "Fajr", time: "00:00", remainingText: "0 menit lagi" };

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const [prayer, time] of Object.entries(times)) {
      const [hours, minutes] = time.split(":").map(Number);
      const prayerTime = hours * 60 + minutes;

      if (prayerTime > currentTime) {
        return {
          prayer,
          time,
          remainingText: formatRemainingTime(prayerTime - currentTime),
        };
      }
    }

    const [fajrHours, fajrMinutes] = times.Fajr.split(":").map(Number);
    const fajrTime = fajrHours * 60 + fajrMinutes + 24 * 60;
    return {
      prayer: "Fajr",
      time: times.Fajr,
      remainingText: formatRemainingTime(fajrTime - currentTime),
    };
  };

  const formatRemainingTime = (minutesLeft: number) => {
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} hr ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} hr`;
    } else {
      return `${minutes} min`;
    }
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
          const next = getNextPrayer(newTimes);
          setNextPrayer(next);
          setTimeRemainingText(next.remainingText);
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
      const next = getNextPrayer(prayerTimes);
      setNextPrayer(next);
      setTimeRemainingText(next.remainingText);
    }, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  if (error) return <p>{error}</p>;
  if (!prayerTimes) return <Skeleton />;

  return (
    <div className="flex flex-col gap-2 text-base md:text-xl">
      <div
        className="bg-emerald-400 text-slate-800 px-5 rounded-md cursor-pointer"
        onClick={() => setHidden(!hidden)}
      >
        <Prayer name={nextPrayer?.prayer} time={nextPrayer?.time}>
          <div className="flex flex-col justify-between items-center">
            <div
              className={`transition-transform ${
                hidden ? "rotate-90" : "rotate-180"
              }`}
            >
              ^
            </div>
          </div>
        </Prayer>
        <p className="text-xs text-end mr-5 italic">{timeRemainingText}</p>
      </div>
      <div
        className={`flex flex-col gap-1 text-base md:text-xl transition-opacity duration-300 ${
          hidden ? "opacity-0" : "opacity-100"
        }`}
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
