import React from "react";

const Dashboard = () => {
  const stats = [
    { title: "Total Vendors", value: "128", icon: "🏪" },
    { title: "Pending Requests", value: "12", icon: "⏳" },
    { title: "Total Clients", value: "540", icon: "👥" },
    { title: "Revenue", value: "$24,350", icon: "💰" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#1c140d]">Dashboard Overview</h1>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-2xl p-5 border border-[#f3ede7] flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <p className="text-sm text-[#9b714b] font-medium">{stat.title}</p>
              <h2 className="text-2xl font-bold text-[#1c140d]">
                {stat.value}
              </h2>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Recent Vendors */}
      <div className="bg-white border border-[#f3ede7] shadow-sm rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#1c140d] mb-4">
          Recent Vendor Registrations
        </h2>

        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#f3ede7] text-[#9b714b] text-sm">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f3ede7] hover:bg-[#fcfaf8] transition">
              <td className="py-2 font-medium text-[#1c140d]">Coffee Spot</td>
              <td className="py-2 text-[#9b714b]">coffee@example.com</td>
              <td className="py-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                  Active
                </span>
              </td>
            </tr>
            <tr className="border-b border-[#f3ede7] hover:bg-[#fcfaf8] transition">
              <td className="py-2 font-medium text-[#1c140d]">Pizza Nova</td>
              <td className="py-2 text-[#9b714b]">nova@example.com</td>
              <td className="py-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-semibold">
                  Pending
                </span>
              </td>
            </tr>
            <tr className="hover:bg-[#fcfaf8] transition">
              <td className="py-2 font-medium text-[#1c140d]">Sweet Garden</td>
              <td className="py-2 text-[#9b714b]">sweet@example.com</td>
              <td className="py-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                  Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
