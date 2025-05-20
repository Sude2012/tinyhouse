"use client";

import React, { useState } from "react";

export default function NewHouseForm({ onNewHouseAdded }) {
  const [newHouse, setNewHouse] = useState({
    City: "",
    Country: "",
    BedroomCount: "",
    BathroomCount: "",
    PricePerNight: "",
    Rating: "",
    Image: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHouse({ ...newHouse, [name]: value });
  };

  const handleImageChange = (e) => {
    setNewHouse({ ...newHouse, Image: e.target.files[0] });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("City", newHouse.City);
    formData.append("Country", newHouse.Country);
    formData.append("BedroomCount", newHouse.BedroomCount);
    formData.append("BathroomCount", newHouse.BathroomCount);
    formData.append("PricePerNight", newHouse.PricePerNight);
    formData.append("Rating", newHouse.Rating);

    if (newHouse.Image) {
      formData.append("Image", newHouse.Image);
    }

    try {
      const res = await fetch("http://localhost:5254/api/houses", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Ev başarıyla eklendi!");
        onNewHouseAdded(data);
        setNewHouse({
          City: "",
          Country: "",
          BedroomCount: "",
          BathroomCount: "",
          PricePerNight: "",
          Rating: "",
          Image: null,
        });
      } else {
        alert("Hata: " + data.message);
      }
    } catch (error) {
      console.error("Sunucu hatası:", error);
      alert("Sunucu hatası!");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Yeni Ev Ekle</h2>

      <input
        name="City"
        placeholder="Şehir"
        value={newHouse.City}
        onChange={handleInputChange}
        className="p-3 border border-gray-300 rounded-md w-full"
      />
      <input
        name="Country"
        placeholder="Ülke"
        value={newHouse.Country}
        onChange={handleInputChange}
        className="p-3 border border-gray-300 rounded-md w-full"
      />
      <input
        name="BedroomCount"
        type="number"
        placeholder="Yatak Odası Sayısı"
        value={newHouse.BedroomCount}
        onChange={handleInputChange}
        className="p-3 border border-gray-300 rounded-md w-full"
      />
      <input
        name="BathroomCount"
        type="number"
        placeholder="Banyo Sayısı"
        value={newHouse.BathroomCount}
        onChange={handleInputChange}
        className="p-3 border border-gray-300 rounded-md w-full"
      />
      <input
        name="PricePerNight"
        type="number"
        placeholder="Gecelik Ücret"
        value={newHouse.PricePerNight}
        onChange={handleInputChange}
        className="p-3 border border-gray-300 rounded-md w-full"
      />
      <input
        name="Rating"
        type="number"
        step="0.1"
        min="0"
        max="5"
        placeholder="Puan (0-5)"
        value={newHouse.Rating}
        onChange={handleInputChange}
        className="p-3 border border-gray-300 rounded-md w-full"
      />
      <input
        type="file"
        name="Image"
        accept="image/*"
        onChange={handleImageChange}
        className="p-3 border border-gray-300 rounded-md w-full"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
      >
        Evi Kaydet
      </button>
    </div>
  );
}
