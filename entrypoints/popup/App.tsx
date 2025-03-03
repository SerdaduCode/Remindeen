import "./App.css";
import React from "react";

const Popup: React.FC = () => {
  return (
    <div className="px-3 text-center">
      <h1>SerdaduCode</h1>
      <img
        loading="lazy"
        src="/icon/serdadu.png"
        width={80}
        height={60}
        className="logo round"
      />
      <p className="my-2 text-bold text-sub">
        Reach Your Dream, Rich Your Mind
      </p>
      <hr />
      <p className="textJustify mx-2">
        SerdaduCode is a research team focused on skill development through
        collaboration, training, and open-source projects. We aim to grow our
        portfolio while making a positive impact in the tech industry.
      </p>
    </div>
  );
};

export default Popup;
