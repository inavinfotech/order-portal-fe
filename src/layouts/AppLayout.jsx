import React from "react";
import {
  ShoppingBag,
  LayoutDashboard,
  GitMerge,
  Settings,
  Bell,
  User,
  LogOut,
  Box,
  Layers,
  Globe,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

const AppLayout = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/order/dashboard", icon: LayoutDashboard },
    { name: "Applications", path: "/order/apps", icon: Box },
    { name: "Orders", path: "/order/orders", icon: ShoppingBag },
    { name: "Workflow", path: "/order/workflow", icon: GitMerge },
    { name: "Settings", path: "/order/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate("/order/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar flex flex-col shadow-xl z-20 print:hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight tracking-tight uppercase">
              Central Order
            </h1>
            <p className="text-xs text-primary-400 font-semibold tracking-widest uppercase opacity-75">
              Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                  isActive
                    ? "bg-sidebar-active text-white shadow-md shadow-primary-600/20"
                    : "text-gray-400 hover:bg-sidebar-hover hover:text-white",
                )
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group text-sm font-medium"
          >
            <LogOut className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 z-10 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
                Order Management System
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none truncate max-w-[120px]">
                  {auth?.email || "Admin"}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-wider">
                  Session Managed
                </p>
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 ring-2 ring-gray-50">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50 print:overflow-visible print:p-0 print:bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
