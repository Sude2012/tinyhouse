"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Home, Plus, Edit, Star, User } from "lucide-react";

import HomeList from "../../components/host/HomeList";
import AddHouseForm from "../../components/host/AddHouseForm";
import EditHouse from "../../components/host/EditHouse";
import Reviews from "../../components/host/Reviews";
import Profile from "../../components/host/Profile";

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState("homes");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: "homes", label: "Evlerim 🏠", icon: <Home /> },
    { id: "add", label: "Ev Ekle ➕", icon: <Plus /> },
    { id: "edit", label: "Ev Güncelle/Sil ✏️", icon: <Edit /> },
    { id: "reviews", label: "Yorumlar ⭐", icon: <Star /> },
    { id: "profile", label: "Profilim 👤", icon: <User /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "homes":
        return <HomeList />;
      case "add":
        return <AddHouseForm />;
      case "edit":
        return <EditHouse />;
      case "reviews":
        return <Reviews />;
      case "profile":
        return <Profile />;
      default:
        return <HomeList />;
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* Hamburger Menu (Mobile only) */}
      <button
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={30} />
      </button>

      {/* Overlay (when sidebar is open) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-[#CDBEAF] text-white w-64 p-4 fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Menü</h2>
          {/* Close Button */}
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center w-full text-left py-2 px-4 rounded hover:bg-black ${
                activeTab === tab.id ? "bg-black" : ""
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
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
