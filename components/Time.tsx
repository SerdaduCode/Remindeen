const Time = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

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

    const interval = setInterval(updateClock, 1000);

    updateClock();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="justify-end  items-center">
      <div className="flex flex-col gap-0 md:gap-1">
        <h1 className="text-6xl">{time}</h1>
        <p className="md:text-[20px] text-xl">{date}</p>
        <p className="md:text-[20px] text-xl">Jakarta, Indonesia</p>
      </div>
    </div>
  );
};

export default Time;
