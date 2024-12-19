import Bahasa from "@/components/Bahasa";
import Footer from "@/components/Footer";
import Prayers from "@/components/Prayers";
import Time from "@/components/Time";
import Verse from "@/components/Verse";

function App() {
  return (
    <>
      <div
        style={{
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url('https://images.photowall.com/products/55234/orient-mosque.jpg?h=699&q=85')`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: -999,
        }}
      ></div>
      <div className="text-white">
        <div className="flex flex-col justify-between min-h-[100vh]">
          <div className="flex justify-between flex-col md:flex-row">
            <div className="p-8 md:w-[300px]">
              <Prayers />
            </div>
            <div className="py-14 md:hidden">
              <Time />
            </div>
            <div className="md:flex-1 md:text-right px-8 text-sm py-4">
              <Bahasa />
              <Verse />
            </div>
          </div>
          <div className="hidden md:block">
            <Time />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
