"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch("http://localhost:5254/api/admin/reservations");
        const data = await res.json();
        setReservations(data);
      } catch (error) {
        console.error("Rezervasyonlar getirilemedi:", error);
      }
    };

    fetchReservations();
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <CalendarCheck className="text-green-600 w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-800">Rezervasyonlar</h1>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-700 text-lg">
          Tüm rezervasyonlar aşağıda listelenmektedir.
        </p>

        <div className="mt-4 space-y-4">
          {reservations.length === 0 ? (
            <p className="text-gray-500">Hiç rezervasyon bulunamadı.</p>
          ) : (
            reservations.map((res, i) => (
              <motion.div
                key={i}
                className="p-4 bg-gray-100 rounded-xl shadow-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-gray-800 font-semibold">
                  {res.email} • {res.houseLocation}
                </p>
                <p className="text-gray-500 text-sm">
                  {new Date(res.startDate).toLocaleDateString()} -{" "}
                  {new Date(res.endDate).toLocaleDateString()} • ₺
                  {res.totalPrice}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
