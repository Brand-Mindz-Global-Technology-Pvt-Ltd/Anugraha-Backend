import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";


/* ---------------- Lazy Imports ---------------- */
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Customers = lazy(() => import("../pages/admin/Customers"));
const ProductList = lazy(() => import("../pages/admin/products/ProductList"));
const ProductCreate = lazy(() => import("../pages/admin/products/ProductCreate"));
const OrderList = lazy(() => import("../pages/admin/orders/OrderList"));
const Inventory = lazy(() => import("../pages/admin/Inventory"));
const HomeSlider = lazy(() => import("../pages/admin/cms/HomeSlider"));
const Banners = lazy(() => import("../pages/admin/cms/Banners"));
const BlogManagement = lazy(() => import("../pages/admin/cms/BlogManagement"));
const Profile = lazy(() => import("../pages/admin/Profile/Profile"));
const Supplier = lazy(() => import("../pages/admin/Supplier/Supplier.jsx"));
const OfflineOrders = lazy(() => import("../pages/admin/offline-orders/OfflineOrders.jsx"));
const Setting = lazy(() => import("../pages/admin/Settings/Setting"));
const Category = lazy(() => import("../pages/admin/category/Categorypage.jsx"))

import { SliderProvider } from "../context/SliderContext";
import { BannerProvider } from "../context/BannerContext";
import { InventoryProvider } from "../context/InventoryContext";
import { DashboardProvider } from "../context/Dashboardcontext.jsx";
import { OrderProvider } from "../context/OrderContext.jsx";
import { CustomerProvider } from '../context/CustomerContext.jsx';
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
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <DashboardProvider>
            <Dashboard />
          </DashboardProvider>} />
        <Route path="customer" element={
          <CustomerProvider>
            <Customers />
          </CustomerProvider>

        } />
        <Route path="category" element={<Category />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductCreate />} />
        <Route path="orders" element={
          <OrderProvider>
            <OrderList />
          </OrderProvider>

        } />
        <Route path="offline-orders" element={<OfflineOrders />} />
        <Route path="inventory" element={
          <InventoryProvider>
            <Inventory />
          </InventoryProvider>
        } />
        <Route path="supplier" element={<Supplier />} />
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
        <Route path="cms/blogs" element={<BlogManagement />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Setting />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
