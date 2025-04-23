const Support = () => {
  return (
    <div className="w-screen md:w-[400px] absolute bottom-12 right-5 bg-black/60 px-2 md:px-0 md:ml-4 rounded-lg">
      <div className="rounded-lg flex justify-center flex-col items-center shadow-md py-2 md:py-4 px-3">
        <h1 className="text-lg mb-1">Support</h1>
        <p className="text-xs mb-3 text-gray-200">
          Show your love by scanning the QR code below ❤️
        </p>
        <img src="/icon/support.jpeg" loading="lazy" width={250} height={250} />
      </div>
    </div>
  );
};

export default Support;
