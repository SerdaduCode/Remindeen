import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

const Time = () => {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("Mengambil lokasi...");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setHours(String(now.getHours()).padStart(2, "0"));
      setMinutes(String(now.getMinutes()).padStart(2, "0"));

      const days = [
        "Ahad",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      setDate(
        `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      );
    };

    const getLocation = () => {
      if (!navigator.geolocation) {
        setLocation("Geolocation tidak didukung");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_GET_LOCATION}?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();
            if (data?.address) {
              const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                "Kota tidak diketahui";
              const country = data.address.country || "Negara tidak diketahui";
              setLocation(`${city}, ${country}`);
            } else {
              setLocation("Lokasi tidak ditemukan");
            }
          } catch {
            setLocation("Gagal mendapatkan lokasi");
          }
        },
        () => setLocation("Izinkan akses lokasi"),
      );
    };

    updateClock();
    getLocation();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="flex flex-col gap-1 text-right p-6"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        {/* Big clock */}
        <h1
          className="time-fade-up leading-none"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "clamp(44px, 7vw, 64px)",
            fontWeight: 600,
            color: "#EDE8D2",
            textShadow: "0 2px 24px rgba(0,0,0,0.45)",
            letterSpacing: "-1px",
          }}
        >
          {hours}
          <span className="colon-blink" style={{ color: "#B0A97A" }}>
            :
          </span>
          {minutes}
        </h1>

        {/* Date */}
        <p
          className="time-fade-up time-delay-1 font-light tracking-widest uppercase"
          style={{
            fontSize: "clamp(11px, 1.5vw, 15px)",
            color: "#EDE8D2",
            fontWeight: 600,
          }}
        >
          {date}
        </p>

        {/* Location */}
        <p
          className="time-fade-up time-delay-2 flex items-center justify-end gap-1 italic"
          style={{
            fontSize: "clamp(10px, 1.2vw, 12px)",
          }}
        >
          <MapPin size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
          {location}
        </p>
      </div>
    </>
  );
};

export default Time;
