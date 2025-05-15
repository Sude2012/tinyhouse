"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Home, BarChart, Users } from "lucide-react";

// Admin sayfası bileşenleri
import ManageListings from "../../components/admin/ManageListings";
import Statistics from "../../components/admin/Statistics";
import UserManagement from "../../components/admin/UserManagement";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("listings");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: "listings", label: "İlanlar", icon: <Home /> },
    { id: "statistics", label: "İstatistikler", icon: <BarChart /> },
    { id: "users", label: "Kullanıcılar", icon: <Users /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "listings":
        return <ManageListings />;
      case "statistics":
        return <Statistics />;
      case "users":
        return <UserManagement />;
      default:
        return <ManageListings />;
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <AdminSidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 p-6">
        <button
          className="md:hidden mb-4 text-gray-800 absolute right-6 top-6"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={30} />
        </button>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}
