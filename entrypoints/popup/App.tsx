import "./App.css";

import React, { useState, useEffect } from "react";

const Popup: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Ambil status ekstensi dari storage saat komponen dimuat
    chrome.storage.local.get(["isEnabled"], (result) => {
      setIsEnabled(result.isEnabled || false);
    });
  }, []);

  const toggleExtension = () => {
    const newStatus = !isEnabled;
    setIsEnabled(newStatus);
    chrome.storage.local.set({ isEnabled: newStatus }, () => {
      setIsEnabled(newStatus);
    });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-lg font-semibold mb-4">Remindeen</h1>
      <button
        onClick={toggleExtension}
        className={`px-4 py-2 rounded ${
          isEnabled
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } text-white font-bold`}
      >
        {isEnabled ? "Turn Off" : "Turn On"}
      </button>
    </div>
  );
};

export default Popup;
