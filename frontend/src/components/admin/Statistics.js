import { BarChart2, Users, Home } from "lucide-react";

export default function Statistics() {
  const data = {
    users: 1200,
    listings: 350,
    totalRevenue: "500,000 TL",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* User Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Kullanıcılar</h3>
          <p className="text-lg font-bold">{data.users}</p>
        </div>
        <Users size={40} className="text-blue-600" />
      </div>

      {/* Listings Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">İlanlar</h3>
          <p className="text-lg font-bold">{data.listings}</p>
        </div>
        <Home size={40} className="text-blue-600" />
      </div>

      {/* Revenue Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Toplam Gelir</h3>
          <p className="text-lg font-bold">{data.totalRevenue}</p>
        </div>
        <BarChart2 size={40} className="text-blue-600" />
      </div>
    </div>
  );
}
