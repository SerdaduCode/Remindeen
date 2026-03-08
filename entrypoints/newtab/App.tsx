import Prayers from "@/components/remindeen/Prayers";
import Time from "@/components/remindeen/Time";
import Verse from "@/components/remindeen/Verse";
import fetchPicture from "@/components/remindeen/Background";

function App() {
  const [backgroundUrl, setBackgroundUrl] = useState("");

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
          zIndex: -999,
        }}
      >
        <div className="text-white">
          <div className="flex flex-col justify-between min-h-[100vh]">
            <header className="flex justify-between flex-col md:flex-row">
              <div className="p-8 md:w-[300px]">
                <Prayers />
              </div>
              <div className="hidden md:block md:text-right px-8 text-sm pt-2">
                <Time />
              </div>
            </header>
            <main className="flex-1">
              <Verse />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
