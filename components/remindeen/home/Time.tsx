import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";

interface LocationState {
  status: 'loading' | 'error' | 'success';
  key?: string;
  data?: {
    city: string;
    country: string;
  };
}

const Time = () => {
  const { t, lang } = useTranslation();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [locationState, setLocationState] = useState<LocationState>({
    status: "loading",
    key: "location.loading",
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      setDate(now.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", options));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, [lang]);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `${
                  import.meta.env.VITE_API_GET_LOCATION
                }?format=json&lat=${latitude}&lon=${longitude}&accept-language=${lang}`
              );
              const data = await response.json();
              if (data && data.address) {
                const city =
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  "location.unknown_city";
                const country = data.address.country || "location.unknown_country";
                setLocationState({
                  status: "success",
                  data: { city, country },
                });
              } else {
                setLocationState({
                  status: "error",
                  key: "location.not_found",
                });
              }
            } catch (error) {
              console.error("Error getting location data", error);
              setLocationState({
                status: "error",
                key: "location.failed",
              });
            }
          },
          (error) => {
            console.error("Error getting Location", error);
            setLocationState({
              status: "error",
              key: "location.allow",
            });
          }
        );
      } else {
        setLocationState({
          status: "error",
          key: "location.not_supported",
        });
      }
    };

    getLocation();
  }, []);

  const displayLocation = locationState.status === "success" && locationState.data
    ? `${
        locationState.data.city.startsWith("location.")
          ? t(locationState.data.city)
          : locationState.data.city
      }, ${
        locationState.data.country.startsWith("location.")
          ? t(locationState.data.country)
          : locationState.data.country
      }`
    : t(locationState.key || "");

  return (
    <div className="justify-end items-center">
      <div className="flex flex-col gap-0 md:gap-1">
        <h1 className="text-6xl drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)]">{time}</h1>
        <p className="md:text-[20px] text-xl drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">{date}</p>
        <p className="md:text-[20px] text-xl drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">{displayLocation}</p>
      </div>
    </div>
  );
};

export default Time;