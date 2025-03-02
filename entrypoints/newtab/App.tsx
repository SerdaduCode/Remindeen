import About from "@/components/About";
import Footer from "@/components/Footer";
import Prayers from "@/components/Prayers";
import Time from "@/components/Time";
import Verse from "@/components/Verse";
import fetchPicture from "@/components/Background";
import Search from "@/components/Search";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");

  const updateShowModal = () => {
    setShowModal((prev) => !prev);
  };

  useEffect(() => {
    const getBackgroundImage = async () => {
      const picture = await fetchPicture();
      if (picture) {
        setBackgroundUrl(picture.url); // Set the image URL from API response
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
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${backgroundUrl})`
          ,
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
              <div className=" hidden md:block md:text-right px-8 text-sm py-4">
                <Time />
              </div>
            </header>
            <main className="flex-1">
              <Verse />
              <Search />
            </main>
            {showModal && <About />}
            <Footer updateShowModal={updateShowModal} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
