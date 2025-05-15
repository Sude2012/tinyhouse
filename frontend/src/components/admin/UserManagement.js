import { Edit2, Trash2 } from "lucide-react";

export default function UserManagement() {
  const users = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      email: "ahmet@example.com",
      status: "Aktif",
    },
    {
      id: 2,
      name: "Mehmet Korkmaz",
      email: "mehmet@example.com",
      status: "Pasif",
    },
    {
      id: 3,
      name: "Zeynep Aksoy",
      email: "zeynep@example.com",
      status: "Aktif",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-6 text-left">Ad</th>
            <th className="py-3 px-6 text-left">E-posta</th>
            <th className="py-3 px-6 text-left">Durum</th>
            <th className="py-3 px-6 text-center">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-3 px-6">{user.name}</td>
              <td className="py-3 px-6">{user.email}</td>
              <td className="py-3 px-6">
                <span
                  className={`px-2 py-1 rounded-full ${
                    user.status === "Aktif"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td className="py-3 px-6 text-center">
                <button className="text-blue-600 hover:text-blue-800 mr-2">
                  <Edit2 size={18} />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
