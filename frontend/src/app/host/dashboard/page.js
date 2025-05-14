// app/host/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HostDashboard() {
  const router = useRouter();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:5254/api/houses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setHouses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hata:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏠 Ev Sahibi Paneli</h1>

      <button
        onClick={() => router.push("/host/add-house")}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        + Yeni Ev Ekle
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {houses.map((house) => (
          <div key={house.id} className="border rounded p-4 shadow">
            <h2 className="text-xl font-semibold">{house.title}</h2>
            <p>{house.description}</p>
            <p className="text-sm text-gray-600">Fiyat: {house.price}₺</p>
          </div>
        ))}
      </div>
    </div>
  );
}
