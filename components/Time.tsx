import { useEffect, useState } from "react";
const Time = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("Takes Location....");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);

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
      setDate(`${dayName}, ${day} ${month} ${year}`);
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
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
                  "Unknow City";
                const country = data.address.country || "Unknow Coutry";
                setLocation(`${city}, ${country}`);
              } else {
                setLocation("Location doesn't found");
              }
            } catch (error) {
              console.error("Error getting location data", error);
              setLocation("Failed get Location");
            }
          },
          (error) => {
            console.error("Error getting Location", error);
            setLocation("Please Allow Location");
          }
        );
      } else {
        setLocation("Geolocation doesn't support this browser");
      }
    };

    updateClock();
    getLocation();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="justify-end  items-center">
      <div className="flex flex-col gap-0 md:gap-1">
        <h1 className="text-6xl">{time}</h1>
        <p className="md:text-[20px] text-xl">{date}</p>
        <p className="md:text-[20px] text-xl">{location}</p>
      </div>
    </div>
  );
};

export default Time;
