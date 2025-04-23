import About from "@/components/About";
import Footer from "@/components/Footer";
import Prayers from "@/components/Prayers";
import Time from "@/components/Time";
import Verse from "@/components/Verse";
import fetchPicture from "@/components/Background";
import Support from "@/components/support";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");

  const updateShowModal = () => {
    if (showSupport) setShowSupport(false);
    setShowModal((prev) => !prev);
  };

  const updateShowSupport = () => {
    if (showModal) setShowModal(false);
    setShowSupport((prev) => !prev);
  };

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
            {showModal && <About />}
            {showSupport && <Support />}
            <Footer
              updateShowModal={updateShowModal}
              updateShowSupport={updateShowSupport}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
