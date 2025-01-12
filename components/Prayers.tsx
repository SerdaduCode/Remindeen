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

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const city = "Jakarta";
        const country = "ID";
        const date = new Date().toISOString().split("T")[0];

        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?date=${date}&city=${city}&country=${country}&method=20`
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
        }
      } catch (error) {
        console.error("Error fetching prayer times", error);
      }
    };
    fetchPrayerTimes();
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
