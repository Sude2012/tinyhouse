// src/app/houses/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function HouseDetailPage() {
  const { id } = useParams();
  const [house, setHouse] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5254/api/houses/${id}`)
      .then((res) => res.json())
      .then((data) => setHouse(data))
      .catch((err) => console.error("Ev detayları alınamadı", err));
  }, [id]);

  if (!house) return <div className="p-4">Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        {house.city}, {house.country}
      </h1>
      <img
        src={`http://localhost:5254${house.coverImageUrl}`}
        alt="Kapak"
        className="w-full h-96 object-cover rounded-lg mb-4"
      />
      <p className="text-gray-700 mb-2">{house.description}</p>
      <div className="flex gap-4 text-sm text-gray-600 mb-2">
        <span>🛏️ {house.bedroomCount} Yatak</span>
        <span>🛁 {house.bathroomCount} Banyo</span>
      </div>
      <div className="text-lg font-semibold">₺{house.pricePerNight}/gece</div>
    </div>
  );
}
