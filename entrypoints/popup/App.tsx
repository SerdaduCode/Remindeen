import "./App.css";
import React from "react";

const Popup: React.FC = () => {
  return (
    <div className="bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-lg font-semibold">Remindeen</h1>
      <img
        src="/icon/logo.png"
        width={80}
        height={60}
        className="logo mx-auto round"
      />
      <p className="textJustify">
        Remindeen is a browser extension specifically designed to serve as a
        reminder and source of inspiration for Muslims in their daily
        activities. Its main feature is an accurate prayer schedule based on the
        user's location, ensuring that worship is always performed on time.
        Additionally, Remindeen displays short Islamic teachings in the form of
        selected Quranic verses and hadiths that provide motivation and bring
        peace to the heart.
      </p>
    </div>
  );
};

export default Popup;
