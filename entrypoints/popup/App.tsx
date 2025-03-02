import "./App.css";
import React from "react";

const Popup: React.FC = () => {
  return (
    <div className="bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-lg font-semibold">Remindeen</h1>
      <img src="/icon/logo.png" width={80} height={60} className="logo" />
      <p className="textJustify">
        Remindeen adalah sebuah browser extension yang dirancang khusus untuk
        menjadi pengingat dan sumber inspirasi bagi umat Muslim dalam menjalani
        aktivitas sehari-hari. Dengan fitur utama berupa jadwal salat yang
        akurat sesuai lokasi pengguna, Remindeen membantu memastikan ibadah kamu
        selalu tepat waktu. Selain itu, Remindeen juga menampilkan dakwah
        singkat berupa ayat-ayat Al-Qur'an dan hadits pilihan yang memberi
        motivasi dan menyejukkan hati.
      </p>
    </div>
  );
};

export default Popup;
