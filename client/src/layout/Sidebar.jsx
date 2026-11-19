
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, X, ChevronDown } from "lucide-react";
import defaultLogo from "../assets/Imgaes/Anugraha logo.png";
import { navItems } from "./navItems";

export default function Sidebar({ onClose, onLogout }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const withAdminId = (path) =>
    admin.id ? `${path}?id=${admin.id}` : path;

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
    <aside className="flex h-screen w-full flex-col border-r border-slate-200 bg-white">
      <header className="relative flex h-28 shrink-0 items-center justify-center border-b border-slate-200 px-5">
        <img
          src={defaultLogo}
          alt="Anugraha Fashions"
          className="h-24 w-full max-w-[205px] object-contain"
        />
        <button
          onClick={onClose}
          className="absolute right-3 rounded-lg p-2 text-slate-800 transition-colors hover:bg-[#d4a13f]/10 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </header>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-1.5">
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
                    `group flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition-colors duration-200
                    ${isActive
                      ? "bg-[#d4a13f] text-white shadow-sm"
                      : "text-slate-800 hover:bg-[#d4a13f]/10"}`
                  }
                >
                  <Icon size={19} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            }

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium transition-colors duration-200
                    ${hasActiveChild
                      ? "bg-[#d4a13f] text-white shadow-sm"
                      : "text-slate-800 hover:bg-[#d4a13f]/10"}`}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <Icon size={19} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`ml-2 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="ml-8 mt-1 space-y-1 border-l border-[#d4a13f]/40 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        to={withAdminId(child.to)}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center rounded-md px-3 py-2.5 text-sm transition-colors
                          ${isActive
                            ? "bg-[#d4a13f]/10 font-medium text-slate-900"
                            : "text-slate-800 hover:bg-[#d4a13f]/10"}`
                        }
                      >
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={onLogout}
          className="group flex w-full items-center gap-3 rounded-lg border border-[#d4a13f]/60 px-3.5 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-[#d4a13f]/10"
        >
          <LogOut size={19} className="shrink-0 text-[#b8860b]" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}