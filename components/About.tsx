const About = () => {
  return (
    <div className="w-[600px] bg-black/60 ml-4 rounded-lg">
      <div className="py-10 px-3 text-center">
        <h1 className="text-2xl mb-1">About Us</h1>
        <hr className="w-1/2 mx-auto " />
        <img
          src="/icon/serdadu.png"
          width={80}
          height={60}
          className="mx-auto rounded-md mt-4 hover:shadow-md hover:shadow-emerald-300"
        />
        <p className="my-2">Reach Your Dream, Rich Your Mind</p>
        <p className="text-justify mx-2">
          This IT community focuses on skill development through collaboration,
          training and knowledge sharing. With a commitment to open source
          research and development projects, our goal is to expand our portfolio
          and build a reputation in the technology industry. We believe that the
          best innovations come from collaboration and the spirit of sharing is
          the cornerstone of every initiative.
        </p>
      </div>
    </div>
  );
};

export default About;
