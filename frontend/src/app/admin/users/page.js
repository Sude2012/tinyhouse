"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5254/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  const toggleStatus = async (email) => {
    try {
      const res = await fetch(
        "http://localhost:5254/api/admin/users/toggle-status",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (res.ok) {
        await fetchUsers(); // durumu güncelle
      } else {
        alert("Durum değiştirme başarısız.");
      }
    } catch (err) {
      console.error("Durum değiştirilemedi:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isActiveCheck = (value) => {
    return value === true || value === 1 || value === "1" || value === "true";
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <User className="text-[#906668] w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-800">Kullanıcılar</h1>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-700 text-lg">
          Tüm kullanıcılar aşağıda listelenmektedir.
        </p>

        <div className="mt-4 space-y-4">
          {users.length === 0 ? (
            <p className="text-gray-500">Kayıtlı kullanıcı bulunamadı.</p>
          ) : (
            users.map((user, i) => (
              <motion.div
                key={i}
                className="p-4 bg-gray-100 rounded-xl shadow-sm flex justify-between items-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <p className="text-gray-800 font-semibold">{user.username}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isActiveCheck(user.isActive)
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isActiveCheck(user.isActive) ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    onClick={() => toggleStatus(user.email)}
                    className="text-sm px-3 py-1 bg-[#C99297] text-white rounded-md hover:bg-[#b5787f]"
                  >
                    {isActiveCheck(user.isActive)
                      ? "Pasifleştir"
                      : "Aktifleştir"}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
