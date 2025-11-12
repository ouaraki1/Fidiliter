import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

const SuperAdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: "/superadmin/dashboard", label: "Dashboard" },
    { path: "/superadmin/vendors", label: "Vendors" },
    { path: "/superadmin/vendors/pending", label: "Pending Vendors" },
    { path: "/superadmin/create-vendor", label: "Create Vendor" },
    { path: "/superadmin/settings", label: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-[#fcfaf8] font-[Inter]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1c140d] text-white flex flex-col p-5">
        <h1 className="text-2xl font-bold text-[#ef8624] mb-8">Fideliter</h1>
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 rounded-lg transition ${
                location.pathname === item.path
                  ? "bg-[#ef8624] text-[#1c140d]"
                  : "hover:bg-[#ef8624]/20"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <button className="mt-5 w-full bg-[#ef8624] text-[#1c140d] font-semibold py-2 rounded-lg hover:opacity-90 transition">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white border-b border-[#f3ede7] p-4 flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#1c140d]">
            Super Admin Panel
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[#1c140d] text-sm">Welcome, Admin</span>
            <img
              src="https://ui-avatars.com/api/?name=Admin"
              alt="avatar"
              className="w-9 h-9 rounded-full border border-[#ef8624]"
            />
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
