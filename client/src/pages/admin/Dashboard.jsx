import { useEffect, useState } from "react";
import axios from "axios";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const statusStyle = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const [summary, setSummary] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    suppliers: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const [summaryRes, ordersRes, supplierRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/sales-summary`),

        axios.get(`${API_URL}/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: 1,
            limit: 5,
            sort: "newest",
          },
        }),

        axios.get(`${API_URL}/suppliers/active-count`),
      ]);
      const dashboardData = summaryRes.data?.data;

      setSummary({
        revenue: dashboardData?.sales?.total || 0,
        orders: dashboardData?.orders?.total || 0,
        products: dashboardData?.products?.total || 0,
        suppliers: supplierRes.data?.count || 0,
      });

      setRecentOrders(
        Array.isArray(ordersRes.data?.orders)
          ? ordersRes.data.orders
          : []
      );
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "—";

  const cards = [
    {
      title: "Total Revenue",
      value: formatPrice(summary.revenue),
      icon: IndianRupee,
    },
    {
      title: "Total Orders",
      value: summary.orders,
      icon: ShoppingBag,
    },
    {
      title: "Total Products",
      value: summary.products,
      icon: Package,
    },
    {
      title: "Active Suppliers",
      value: summary.suppliers,
      icon: Users,
    },
  ];

  return (
    <div className="p-2 bg-slate-50 min-h-screen space-y-6">

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ title, value, icon: Icon }) => (
          <div
            key={title}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5"
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
              <Icon
                size={28}
                className="text-amber-600"
              />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                {title}
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mt-1">
                {loading ? "..." : value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Orders
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Latest customer orders
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">

            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 text-left">
                  Order ID
                </th>

                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-center">
                  Date
                </th>

                <th className="p-4 text-center">
                  Amount
                </th>

                <th className="p-4 text-center">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-slate-400"
                  >
                    No recent orders
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-indigo-700">
                      #{order.orderId}
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-slate-800">
                        {order.customerId?.name || "—"}
                      </div>

                      <div className="text-xs text-slate-400">
                        {order.customerId?.email || ""}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="p-4 text-center font-semibold">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[order.orderStatus] ||
                          "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}