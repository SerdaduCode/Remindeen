const Search = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
          window.open(
            `${import.meta.env.VITE_API_SEARCH}?q=${encodeURIComponent(
              searchQuery
            )}`,
            "_blank"
          );
          setSearchQuery("");
        }
      };

    return (
        <div className="flex justify-center">
            <form
            onSubmit={handleSearch}
            className="flex items-center w-full max-w-md bg-white shadow rounded-full p-2 border border-gray-300 shadow-slate-300"
            >
            <img
                src="/icon/search.png"
                alt="Search Icon"
                className="text-gray-500 ml-3 w-5 h-5 cursor-pointer"
                onClick={(e: any) => handleSearch(e)}
            />
            <input
                type="text"
                placeholder="Search Google or type a URL"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-4 text-gray-500 outline-none text-sm italic"
            />
            </form>
        </div>
    )
}

export default Search;