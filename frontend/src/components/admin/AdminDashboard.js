"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { User, CalendarCheck, CreditCard, Home } from "lucide-react";
import { motion } from "framer-motion";

const icons = {
  Users: <User className="text-[#906668]" />,
  Reservations: <CalendarCheck className="text-green-600" />,
  Payments: <CreditCard className="text-purple-600" />,
  Listings: <Home className="text-[#C99297]" />,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("http://localhost:5254/api/admin/dashboard");

        if (!res.ok) {
          const text = await res.text();
          console.error("Dashboard JSON hatası:", text);
          return;
        }

        const data = await res.json();
        setStats(data.stats || []);
        setChartData(data.chartData || []);
      } catch (err) {
        console.error("Dashboard verileri alınamadı:", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#fef6f7] p-6">
      <h1 className="text-3xl font-bold text-[#A0686D] mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            onClick={() => router.push(`/admin/${item.name.toLowerCase()}`)}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-md flex items-center justify-between cursor-pointer border hover:bg-[#fdf2f2] transition"
          >
            <div>
              <p className="text-sm text-gray-500">{item.name}</p>
              <p className="text-2xl font-bold text-[#C99297]">{item.count}</p>
            </div>
            <div className="text-3xl">{icons[item.name]}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold text-[#A0686D] mb-4">
          Rezervasyon Trendleri
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="reservations" fill="#C99297" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
