import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  LayoutGrid,
  Package,
  Boxes,
  Settings2,
  Store,
  Truck,
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Customers", to: "/admin/customer", icon: Users },
  {
    label: "Category",
    icon: LayoutGrid,
    to: "/admin/category",
  },

  {
    label: "Products",
    to: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    to: "/admin/orders",
  },
  {
    label: "Offline Orders",
    to: "/admin/offline-orders",
    icon: Store,
  },
  { label: "Inventory", to: "/admin/inventory", icon: Boxes },
  { label: "Supplier", to: "/admin/supplier", icon: Truck },
  {
    label: "CMS",
    icon: LayoutGrid,
    children: [
      { label: "Home Slider", to: "/admin/cms/home-slider" },
      { label: "Banners", to: "/admin/cms/banners" },
      { label: "Blog Management", to: "/admin/cms/blogs" },
    ],

  },

  { label: "Profile", to: "/admin/profile", icon: Users },
  { label: "Settings", to: "/admin/settings", icon: Settings2 },
];
