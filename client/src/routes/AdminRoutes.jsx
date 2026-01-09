

import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Categorypage from "../pages/admin/category/CategoryPage";

/* ---------------- Lazy Imports ---------------- */
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Customers = lazy(() => import("../pages/admin/Customers"));
const ProductList = lazy(() => import("../pages/admin/products/ProductList"));
const ProductCreate = lazy(() => import("../pages/admin/products/ProductCreate"));
const OrderList = lazy(() => import("../pages/admin/orders/OrderList"));
const Inventory = lazy(() => import("../pages/admin/Inventory"));
const HomeSlider = lazy(() => import("../pages/admin/cms/HomeSlider"));
const Banners = lazy(() => import("../pages/admin/cms/Banners"));
const Settings = lazy(() => import("../pages/admin/Settings"));
const Profile = lazy(() => import("../pages/admin/Profile/Profile"));

import { SliderProvider } from "../context/SliderContext";
import { BannerProvider } from "../context/BannerContext";



/* =================================================
   ADMIN ROUTES
================================================= */

export default function AdminRoutes() {
  const [searchParams] = useSearchParams();
  const adminIdFromUrl = searchParams.get("id");

  /* -------------------------------------------------
     Sync URL id -> localStorage admin object
  ------------------------------------------------- */
  useEffect(() => {
    if (!adminIdFromUrl) return;
    const storedAdmin = JSON.parse(
      localStorage.getItem("admin") || "{}"
    );
    // Update only if different
    if (storedAdmin.id !== adminIdFromUrl) {
      localStorage.setItem(
        "admin",
        JSON.stringify({
          ...storedAdmin,
          id: adminIdFromUrl,
        })
      );
    }
  }, [adminIdFromUrl]);

  /* -------------------------------------------------
     Auth Guard (basic – frontend only)
  ------------------------------------------------- */
  const admin = JSON.parse(localStorage.getItem("admin"));
  if (!admin?.id) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Customers */}
        <Route path="customer" element={<Customers />} />

        {/* Category */}
        <Route path="category" element={<Categorypage />} />

        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductCreate />} />

        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
      

        {/* Inventory */}
        <Route path="inventory" element={<Inventory />} />

        {/* CMS */}
        <Route path="cms/home-slider" element={
          <SliderProvider>
            <HomeSlider />
          </SliderProvider>
        } />
        <Route path="cms/banners" element={
          <BannerProvider>
            <Banners />
          </BannerProvider>
        } />

        {/* Settings & Profile */}
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
