
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../layout/navItems";
import { useProfile } from "../context/ProfileContext";

const DEFAULT_AVATAR =
  "https://randomuser.me/api/portraits/men/32.jpg";

function findTitle(pathname) {
  for (const item of navItems) {
    if (item.to && pathname.startsWith(item.to)) {
      return item.label;
    }
    if (item.children) {
      const child = item.children.find(c =>
        pathname.startsWith(c.to)
      );
      if (child) return child.label;
    }
  }
  return "Dashboard";
}

export default function Topbar({ onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, username, loading } = useProfile();
  const [openSearch, setOpenSearch] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);
  const title = useMemo(
    () => findTitle(location.pathname),
    [location.pathname]
  );

  /* -------------------- CLICK OUTSIDE -------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------------------- LOGOUT -------------------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login", { replace: true });
  };

  /* -------------------- SAFE DATA EXTRACTION -------------------- */
  const profileImage =
    profile?.profileImage?.url || DEFAULT_AVATAR;


  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 rounded-lg flex items-center px-2 sticky top-0 z-30">
        {/* ===== Left ===== */}
        <div className="flex items-center gap-2 min-w-0 p-4">
          {onMenu && (
            <button
              onClick={onMenu}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
          )}
          <h1 className="text-lg font-semibold text-slate-800">
            {title}
          </h1>
        </div>

        {/* ===== Center Search ===== */}
        <div className="hidden md:flex flex-1 justify-center p-4">
          <div className="flex items-center w-full max-w-md bg-slate-100 rounded-xl px-4 py-2">
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search here..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* ===== Right ===== */}
        <div className="flex items-center gap-4 min-w-0 justify-end p-4">
          <button
            onClick={() => setOpenSearch(true)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100"
          >
            <Search size={18} />
          </button>

          <button className="hidden sm:flex items-center gap-1 text-sm text-slate-600">
            Eng (US)
            <ChevronDown size={14} />
          </button>

          <button className="h-9 w-9 flex items-center justify-center rounded-lg text-yellow-600 bg-yellow-100">
            <Bell size={18} />
          </button>

          {/* ===== Profile Dropdown ===== */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setOpenProfile(p => !p)}
              className="flex items-center gap-2 cursor-pointer rounded-lg p-1 hover:bg-slate-100 select-none"
            >
              <img
                src={profileImage}
                alt="Admin"
                className="h-9 w-9 rounded-lg object-cover"
              />

              <div className="hidden md:block leading-tight">
                <p className="text-sm font-medium text-slate-800">
                  {loading ? "Loading..." : username?.slice(0, 10) || ""}
                </p>
                <p className="text-xs text-slate-500">
                  {role || "Admin"}
                </p>
              </div>

              <ChevronDown
                size={14}
                className={`hidden md:block transition-transform ${openProfile ? "rotate-180" : ""
                  }`}
              />
            </div>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== Mobile Search Overlay ===== */}
      {openSearch && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start p-4 md:hidden"
          onClick={() => setOpenSearch(false)}
        >
          <div
            className="bg-white w-full rounded-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search here..."
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
