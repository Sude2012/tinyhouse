"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5254/api/admin/payments");
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error("Ödemeler alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <CreditCard className="text-purple-600 w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-800">Ödemeler</h1>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-700 text-lg mb-4">
          Son yapılan ödemeler burada listelenir.
        </p>

        <div className="space-y-4">
          {payments.map((odeme, i) => (
            <motion.div
              key={i}
              className="p-4 bg-gray-100 rounded-xl shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-gray-800 font-semibold">
                {odeme.email} - ₺{odeme.amount}
              </p>
              <p className="text-gray-500 text-sm">
                {odeme.location} •{" "}
                {new Date(odeme.startDate).toLocaleDateString()} -{" "}
                {new Date(odeme.endDate).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
