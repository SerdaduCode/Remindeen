import { useEffect, useState } from "react";
import Prayers from "@/components/remindeen/home/Prayers";
import Time from "@/components/remindeen/home/Time";
import Verse from "@/components/remindeen/home/Verse";
import SearchBar from "@/components/remindeen/home/SearchBar";
import fetchPicture from "@/components/remindeen/home/Background";
import { useSettings } from "@/hooks/use-settings";

function HomePage() {
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const { system } = useSettings();

  useEffect(() => {
    const getBackgroundImage = async () => {
      const picture = await fetchPicture();
      if (picture) {
        setBackgroundUrl(picture.url);
      }
    };

    getBackgroundImage();
  }, []);

  return (
    <div
      style={{
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.0), rgba(0,0,0,0.1)), url(${backgroundUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="text-white">
        <div className="flex flex-col justify-evenly min-h-[100vh]">
          <header className="flex justify-between flex-col md:flex-row">
            <div className="p-8 md:w-[300px]">
              <Prayers />
            </div>
            <div className="hidden md:block md:text-right px-8 text-sm pt-2">
              <Time />
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center gap-12 px-4">
            <Verse />
            {system.showSearchBar && <SearchBar />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
