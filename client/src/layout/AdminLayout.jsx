import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import { useAuth } from "../context/Authcontext";
import { ProfileProvider } from "../context/ProfileContext";
import Breadcrumbs from "./Breadcrumbs";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-white text-slate-900">
      <aside className="hidden h-screen w-64 shrink-0 lg:block">
        <Sidebar onLogout={handleLogout} />
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!sidebarOpen}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-white">
        <ProfileProvider>
          <Topbar
            onMenu={() => setSidebarOpen(true)}
            onLogout={handleLogout}
          />
          <main className="w-full flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {location.pathname !== "/admin/dashboard" && <Breadcrumbs />}
            <Outlet />
          </main>
        </ProfileProvider>
      </div>
    </div>
  );
}
