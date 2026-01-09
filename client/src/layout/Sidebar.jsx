

import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, X, ChevronDown, LayoutGrid } from "lucide-react";
import logo from "../assets/Imgaes/full.png";
import { navItems } from "./navItems";

export default function Sidebar({ onClose, onLogout }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const adminId = admin?.id;

  const withAdminId = (path) =>
    adminId ? `${path}?id=${adminId}` : path;


  useEffect(() => {
    const activeParent = navItems.find(item =>
      item.children?.some(child => location.pathname === child.to)
    );
    if (activeParent) setOpenMenu(activeParent.label);
  }, [location.pathname]);

  const toggleMenu = (label) => {
    setOpenMenu(prev => (prev === label ? null : label));
  };

  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col">

      {/* ================= TOP ================= */}
      <header className="h-16 flex items-center justify-center px-4 relative">
        <img
          src={logo}
          alt="Dokan"
          className="h-17 w-auto object-contain"
        />

        <button
          onClick={onClose}
          className="absolute right-4 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </header>

      {/* ================= MIDDLE ================= */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenu === item.label;
          const hasActiveChild = item.children?.some(
            c => c.to === location.pathname
          );

          if (!item.children) {
            return (
              <NavLink
                key={item.label}
                to={withAdminId(item.to)}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  ${isActive
                    ? "bg-[#162A78] text-white"
                    : "text-slate-500 hover:bg-slate-100"}
                `
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          }

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                  text-sm font-medium
                  ${hasActiveChild
                    ? "bg-[#162A78] text-white"
                    : "text-slate-500 hover:bg-slate-100"}
                `}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.children.map(child => (
                    <NavLink
                      key={child.label}
                      to={withAdminId(child.to)}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `
                        block px-3 py-2 rounded-md text-sm
                        ${isActive
                          ? "bg-slate-100 text-[#162A78] font-medium"
                          : "text-slate-500 hover:bg-slate-100"}
                      `
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={onLogout}
          className="mt-3 w-full flex items-center gap-3 px-4 py-2.5
                     text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </nav>

      {/* ================= BOTTOM ================= */}
      <footer className="mt-auto p-4">
        <div className="rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b]
                        p-4 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
              <LayoutGrid size={20} />
            </div>
          </div>

          <h4 className="text-sm font-semibold">Dokan Pro</h4>
          <p className="text-xs text-slate-300 mt-1">
            Get access to all features on premium
          </p>

          <button className="mt-3 w-full bg-white text-slate-900
                             text-xs font-semibold py-2 rounded-md">
            Get Pro
          </button>
        </div>
      </footer>

    </aside>
  );
}

