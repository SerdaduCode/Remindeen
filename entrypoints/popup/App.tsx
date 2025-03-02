import "./App.css";
import React from "react";

const Popup: React.FC = () => {
  return (
    <div className="px-3 text-center">
      <h1>About</h1>
      <img
        src="/icon/serdadu.png"
        width={80}
        height={60}
        className="logo round"
      />
      <p className="my-2">Reach Your Dream, Rich Your Mind</p>
      <hr />
      <p className="textJustify mx-2">
        This IT community focuses on skill development through collaboration,
        training and knowledge sharing. With a commitment to open source
        research and development projects, our goal is to expand our portfolio
        and build a reputation in the technology industry. We believe that the
        best innovations come from collaboration and the spirit of sharing is
        the cornerstone of every initiative.
      </p>
    </div>
  );
};

export default Popup;
