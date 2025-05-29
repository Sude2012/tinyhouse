"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5254/api/admin/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Kullanıcıları alırken hata oluştu:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <User className="text-blue-600 w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-800">Kullanıcılar</h1>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-700 text-lg">
          Sistemdeki kullanıcıları görüntüleyin.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user, i) => (
            <motion.div
              key={i}
              className="p-4 bg-gray-100 rounded-xl shadow-sm"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="text-gray-800 font-semibold">{user.username}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
