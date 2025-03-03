const About = () => {
  return (
    <div className="w-screen md:w-[600px] bg-black/60 px-2 md:px-0 md:ml-4 rounded-lg">
      <div className="rounded-lg shadow-md py-2 md:py-4 px-3">
        <h1 className="md:text-3xl text-xl mb-1 font-semibold">Remindeen</h1>
        <hr />
        <div className="my-4 flex gap-3 md:gap-8 px-10">
          <img
            src="/icon/logo.png"
            className="cursor-pointer w-24 h-24 md:w-36 md:h-36 rounded-md hover:drop-shadow-[0_0_2em_#3c9934e0] transition duration-300 ease-in-out"
            loading="lazy"
          />
          <p className="text-justify text-xs md:text-sm">
            Remindeen is a browser extension specifically designed to be a
            prayer reminder and source of inspiration for Muslims in carrying
            out their daily activities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
