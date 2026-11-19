import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
  LogOut,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navItems } from "../layout/navItems";
import { useProfile } from "../context/ProfileContext";

export default function Topbar({ onMenu, onLogout }) {
  const navigate = useNavigate();
  const { role, username, loading } = useProfile();
  const [openSearch, setOpenSearch] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const allNavItems = useMemo(
    () =>
      navItems.flatMap((item) => [
        ...(item.to ? [{ label: item.label, to: item.to }] : []),
        ...(item.children || []).map((child) => ({
          label: child.label,
          to: child.to,
        })),
      ]),
    []
  );
  const filteredItems = searchQuery.trim()
    ? allNavItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAdminId = () => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "{}");
      return admin.id || "";
    } catch (error) {
      console.error("Failed to get admin ID:", error);
      return "";
    }
  };

  const navigateTo = (path) => {
    const adminId = getAdminId();
    navigate(adminId ? `${path}?id=${adminId}` : path);
    setSearchQuery("");
    setOpenSearch(false);
    setOpenProfile(false);
  };

  const handleProfileNavigate = () => {
    const adminId = getAdminId();
    if (adminId) navigateTo(`/admin/profile`);
  };

  const displayName = loading
    ? "Loading..."
    : username?.trim() || "Anugraha Admin";
  const displayRole =
    role === "SUPER_ADMIN"
      ? "Anugraha Admin"
      : role
        ? role.replace(/_/g, " ")
        : "Anugraha Admin";
  const avatarInitial = displayName === "Loading..." ? "A" : displayName[0];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-initial">
          <button
            type="button"
            onClick={onMenu}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-900 transition-colors hover:bg-[#d4a13f]/10 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={21} />
          </button>

          <div
            className="relative hidden w-full max-w-[500px] lg:block"
            ref={searchRef}
          >
            <div className="flex items-center rounded-full border border-slate-300 bg-white px-4 py-2.5 transition-colors focus-within:border-[#d4a13f]">
              <Search size={18} className="mr-3 shrink-0 text-[#b8860b]" />
              <input
                type="search"
                placeholder="Search pages..."
                aria-label="Search pages"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            {filteredItems.length > 0 && (
              <div className="absolute top-full z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {filteredItems.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => navigateTo(item.to)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition-colors hover:bg-[#d4a13f]/10"
                  >
                    <Search size={15} className="text-[#b8860b]" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setOpenSearch(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-900 transition-colors hover:bg-[#d4a13f]/10 lg:hidden"
            aria-label="Search pages"
          >
            <Search size={19} />
          </button>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-900 transition-colors hover:bg-[#d4a13f]/10"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d4a13f]" />
          </button>
          <span className="hidden h-8 w-px bg-slate-200 sm:block" />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setOpenProfile((open) => !open)}
              className="flex items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-[#d4a13f]/10 sm:gap-3"
              aria-expanded={openProfile}
              aria-label="Open admin profile menu"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4a13f] font-serif text-lg text-white">
                {avatarInitial}
              </span>
              <span className="hidden min-w-0 md:block">
                <span className="block max-w-40 truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </span>
                <span className="block max-w-40 truncate text-xs text-slate-600">
                  {displayRole}
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`hidden text-slate-800 transition-transform md:block ${openProfile ? "rotate-180" : ""}`}
              />
            </button>

            {openProfile && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleProfileNavigate}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-900 transition-colors hover:bg-[#d4a13f]/10"
                >
                  <User size={16} className="text-[#b8860b]" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-900 transition-colors hover:bg-[#d4a13f]/10"
                >
                  <LogOut size={16} className="text-[#b8860b]" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {openSearch && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/30 lg:hidden"
          onClick={() => setOpenSearch(false)}
        >
          <section
            className="flex h-full flex-col bg-white"
            onClick={(event) => event.stopPropagation()}
            aria-label="Search pages"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 p-4">
              <Search size={19} className="text-[#b8860b]" />
              <input
                autoFocus
                type="search"
                placeholder="Search pages..."
                aria-label="Search pages"
                className="min-w-0 flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-500"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  setOpenSearch(false);
                  setSearchQuery("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-900 hover:bg-[#d4a13f]/10"
                aria-label="Close search"
              >
                <X size={19} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery.trim() ? (
                filteredItems.length ? (
                  <div className="divide-y divide-slate-200">
                    {filteredItems.map((item) => (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => navigateTo(item.to)}
                        className="flex w-full items-center gap-3 py-4 text-left text-sm text-slate-900"
                      >
                        <Search size={16} className="text-[#b8860b]" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-slate-700">
                    No matching pages.
                  </p>
                )
              ) : (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Quick access
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Dashboard", "Products", "Orders", "Customers"].map(
                      (label) => {
                        const item = allNavItems.find(
                          (navItem) => navItem.label === label
                        );
                        return item ? (
                          <button
                            key={label}
                            type="button"
                            onClick={() => navigateTo(item.to)}
                            className="rounded-full border border-[#d4a13f]/60 px-4 py-2 text-sm text-slate-900 transition-colors hover:bg-[#d4a13f]/10"
                          >
                            {label}
                          </button>
                        ) : null;
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
