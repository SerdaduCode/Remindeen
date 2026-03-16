import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Skeleton from "./Skeleton";
import { Prayer } from "./Prayer";

type PrayerTimes = {
  Imsak: string;
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

const Prayers = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [timeRemainingText, setTimeRemainingText] = useState<string>("");
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);

  const getCurrentPrayer = (times: PrayerTimes | null) => {
    if (!times) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let lastPrayer = "Fajr";

    for (const [prayer, time] of Object.entries(times)) {
      const [hours, minutes] = time.split(":").map(Number);
      if (currentTime >= hours * 60 + minutes) {
        lastPrayer = prayer;
      } else {
        break;
      }
    }
    return lastPrayer;
  };

  const formatRemainingTime = (minutesLeft: number) => {
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
    if (hours > 0) return `${hours} hr`;
    return `${minutes} min`;
  };

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

    const [fajrH, fajrM] = times.Fajr.split(":").map(Number);
    const fajrTime = fajrH * 60 + fajrM + 24 * 60;
    return {
      prayer: "Fajr",
      time: times.Fajr,
      remainingText: formatRemainingTime(fajrTime - currentTime),
    };
  };

  const minutesToTime = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

  const [nextPrayer, setNextPrayer] = useState(getNextPrayer(prayerTimes));

  useEffect(() => {
    const fetchPrayerTimes = async (latitude: number, longitude: number) => {
      try {
        const date = new Date().toISOString().split("T")[0];
        const response = await fetch(
          `${import.meta.env.VITE_API_PRAYER_TIMES}/${date}?latitude=${latitude}&longitude=${longitude}&method=20`,
        );
        const data = await response.json();

        if (data?.data?.timings) {
          const newTimes: PrayerTimes = {
            Imsak: data.data.timings.Imsak,
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
          setCurrentPrayer(getCurrentPrayer(newTimes));
        } else {
          setError("Data waktu salat tidak ditemukan.");
        }
      } catch (err) {
        console.error("Error fetching prayer times", err);
        setError("Failed to fetch Prayer times");
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude),
          (err) => {
            console.error("Error getting location", err);
            setError("Gagal mendapatkan lokasi pengguna.");
          },
        );
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const next = getNextPrayer(prayerTimes);
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      if (minutesToTime(currentTime) === next.time) {
        await browser.notifications.create("", {
          type: "basic",
          iconUrl: "/wxt.svg",
          title: "Remindeen",
          message: next.prayer,
          eventTime: 50000,
        });
      }

      setNextPrayer(next);
      setTimeRemainingText(next.remainingText);
    }, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  if (error)
    return (
      <p
        className="text-xs italic px-1"
        style={{
          color: "rgba(176,169,122,0.55)",
          fontFamily: "'Raleway', sans-serif",
        }}
      >
        {error}
      </p>
    );

  if (!prayerTimes) return <Skeleton />;

  return (
    <>
      <div
        className="flex flex-col gap-2 w-full"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        <div
          className="next-btn cursor-pointer rounded-xl px-4 py-3 bg-[#2e2a1a] hover:bg-[#2e2a1a]"
          style={{
            border: "1.5px solid rgba(176,169,122,0.32)",
          }}
          onClick={() => setHidden(!hidden)}
        >
          <Prayer name={nextPrayer?.prayer} time={nextPrayer?.time} isNext>
            <ChevronDown
              size={15}
              style={{
                color: "#B0A97A",
                transition: "transform 0.35s ease",
                transform: hidden ? "rotate(0deg)" : "rotate(180deg)",
              }}
            />
          </Prayer>

          <div className="flex justify-end mt-1">
            <span
              className="text-[11px] tracking-widest px-3 py-0.5 rounded-full"
              style={{
                background: "rgba(176,169,122,0.13)",
                border: "1px solid rgba(176,169,122,0.25)",
                color: "#B0A97A",
              }}
            >
              {timeRemainingText}
            </span>
          </div>
        </div>

        {!hidden && (
          <div className="prayer-list-enter flex flex-col gap-0.5">
            {Object.entries(prayerTimes).map(([prayer, time], i) => (
              <div
                key={prayer}
                className="prayer-row-hover transition-all duration-200"
                style={{
                  animationDelay: `${i * 50}ms`,
                  borderRadius: 8,
                }}
              >
                <Prayer
                  name={prayer}
                  time={time}
                  isActive={prayer === currentPrayer}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Prayers;
