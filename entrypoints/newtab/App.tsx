import Prayers from "@/components/remindeen/Prayers";
import Time from "@/components/remindeen/Time";
import Verse from "@/components/remindeen/Verse";
import SearchBar from "@/components/remindeen/SearchBar";
import fetchPicture from "@/components/remindeen/Background";
import { useSettings } from "@/hooks/use-settings";
import { useCounterZoom } from "@/hooks/use-counter-zoom";

function App() {
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const { system } = useSettings();
  const zoom = useCounterZoom();

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
    <>
      {/* Fixed so the background always covers the viewport, even when content overflows (e.g. 150% zoom) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.0), rgba(0,0,0,0.1)), url(${backgroundUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: -999,
        }}
      />
      {/* Counter-zoomed so the layout looks the same at any browser zoom level.
          Exactly one viewport tall; scrolls (scrollbar hidden) only if the content truly cannot fit */}
      <div
        className="no-scrollbar overflow-y-auto text-white"
        style={{
          zoom: zoom.scale,
          width: zoom.width,
          height: zoom.height,
          visibility: zoom.ready ? "visible" : "hidden",
        }}
      >
        <div className="flex flex-col min-h-full">
          <header className="flex justify-between flex-col md:flex-row shrink-0">
            <div className="p-8 md:w-[300px]">
              <Prayers />
            </div>
            <div className="hidden md:block md:text-right px-8 text-sm pt-2">
              <Time />
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-16">
            <Verse />
            {system.showSearchBar && <SearchBar />}
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
