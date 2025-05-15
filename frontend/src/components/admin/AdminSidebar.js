import { X, Home, BarChart, Users } from "lucide-react";

export default function AdminSidebar({
  tabs,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <div
      className={`fixed top-0 right-0 z-50 bg-[#CDBEAF] text-white w-64 h-full transition-transform transform ${
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      } md:translate-x-0 md:relative md:flex md:flex-col md:w-64`}
    >
      <div className="flex justify-between items-center p-4">
        {/* Close button */}
        <button
          className="md:hidden text-white"
          onClick={() => setSidebarOpen(false)} // Menü kapatma
        >
          <X size={30} />
        </button>
      </div>

      {/* Sidebar Menu Items */}
      <nav>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
  );
}
