import { useEffect, useState, useRef } from "react";

// Fungsi untuk menghitung jarak antara dua titik koordinat menggunakan rumus Haversine
const distance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Jarak dalam km
  return d;
};

const Time = () => {
  const [time, setTime] = useState<string>(localStorage.getItem("time") || "");
  const [date, setDate] = useState<string>(localStorage.getItem("date") || "");
  const [location, setLocation] = useState<string>(
    localStorage.getItem("location") || "Takes Location...."
  );

  const lastPosition = useRef<{ lat: number; lon: number } | null>(null); // Menyimpan posisi terakhir

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;
      setTime(currentTime);
      localStorage.setItem("time", currentTime);

      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const currentDate = `${dayName}, ${day} ${month} ${year}`;
      setDate(currentDate);
      localStorage.setItem("date", currentDate);
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Cek apakah posisi sudah berubah jauh
            if (lastPosition.current) {
              const dist = distance(
                lastPosition.current.lat,
                lastPosition.current.lon,
                latitude,
                longitude
              );
              if (dist < 1) {
                // Jika jaraknya kurang dari 1 km, tidak fetch data lokasi
                return;
              }
            }

            try {
              const response = await fetch(
                `${
                  import.meta.env.VITE_API_GET_LOCATION
                }?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              if (data && data.address) {
                const city =
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  "Unknown City";
                const country = data.address.country || "Unknown Country";
                const locationString = `${city}, ${country}`;
                setLocation(locationString);
                localStorage.setItem("location", locationString); // Simpan ke localStorage

                lastPosition.current = { lat: latitude, lon: longitude }; // Simpan posisi terakhir
              } else {
                setLocation("Location not found");
                localStorage.setItem("location", "Location not found");
              }
            } catch (error) {
              console.error("Error getting location data", error);
              setLocation("Failed to get location");
              localStorage.setItem("location", "Failed to get location");
            }
          },
          (error) => {
            console.error("Error getting location", error);
            setLocation("Please allow location access");
            localStorage.setItem("location", "Please allow location access");
          }
        );
      } else {
        setLocation("Geolocation not supported");
        localStorage.setItem("location", "Geolocation not supported");
      }
    };

    updateClock();
    getLocation();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="justify-end items-center">
      <div className="flex flex-col gap-0 md:gap-1">
        <h1 className="text-6xl">{time}</h1>
        <p className="md:text-[20px] text-xl">{date}</p>
        <p className="md:text-[20px] text-xl">{location}</p>
      </div>
    </div>
  );
};

export default Time;
