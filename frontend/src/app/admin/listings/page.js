"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Trash2 } from "lucide-react";

export default function ListingsPage() {
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5254/api/admin/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data))
      .catch((err) => console.error("Hata:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;

    const res = await fetch(`http://localhost:5254/api/admin/houses/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();
    if (res.ok) {
      alert("İlan silindi.");
      setHouses((prev) => prev.filter((h) => h.id !== id));
    } else {
      alert(result.message || "Silme işlemi başarısız.");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <Home className="text-yellow-600 w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-800">İlanlar</h1>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {houses.map((house) => (
            <motion.div
              key={house.id}
              className="p-4 bg-gray-100 rounded-xl shadow-sm flex justify-between items-start"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-gray-800 font-semibold">
                  {house.city}, {house.country}
                </p>
                <p className="text-gray-500 text-sm">
                  {house.bedroomCount} yatak • {house.bathroomCount} banyo
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Sahibi: {house.ownerName}
                </p>
              </div>
              <button
                onClick={() => handleDelete(house.id)}
                className="text-red-600 hover:text-red-800 transition"
                title="Sil"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
