const Time = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
        "_blank"
      );
      setSearchQuery("");
    }
  };

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
    <div className="justify-center text-center items-center">
      <div className="flex flex-col gap-0 md:gap-3">
        <h1 className="text-2xl md:text-8xl">{time}</h1>
        <p className="md:text-[32px] text-xl">{date}</p>
        <p className="md:text-[32px] text-xl">Jakarta, Indonesia</p>
      </div>
      <div className="flex justify-center mt-5">
        <form onSubmit={handleSearch} className="w-full max-w-[400px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Google..."
            className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-500 border border-gray-500"
          />
        </form>
      </div>
    </div>
  );
};

export default Time;
