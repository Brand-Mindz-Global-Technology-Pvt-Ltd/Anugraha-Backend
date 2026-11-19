import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const periods = {
  all: "All time",
  month: "This month",
  today: "Today",
};

const statusClass =
  "inline-flex min-w-[88px] justify-center rounded-full border border-[#d4a13f]/50 bg-[#d4a13f]/10 px-3 py-1 text-xs font-medium capitalize text-slate-900";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    revenue: { all: 0, month: 0, today: 0 },
    orders: { all: 0, month: 0, today: 0 },
    products: 0,
    suppliers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState("");
  const [reportPeriod, setReportPeriod] = useState("all");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [appliedReportFilter, setAppliedReportFilter] = useState({
    period: "all",
    from: "",
    to: "",
  });
  const [reportPage, setReportPage] = useState(1);
  const skipFirstReportFetch = useRef(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const [summaryRes, ordersRes, supplierRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard/sales-summary`, {
            params: { includeReport: true },
          }),
          axios.get(`${API_URL}/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: 1, limit: 5, sort: "newest" },
          }),
          axios.get(`${API_URL}/suppliers/active-count`),
        ]);
        const dashboardData = summaryRes.data?.data;
        setReport(dashboardData?.salesReport || null);

        setSummary({
          revenue: {
            all: dashboardData?.sales?.total || 0,
            month: dashboardData?.sales?.thisMonth || 0,
            today: dashboardData?.sales?.today || 0,
          },
          orders: {
            all: dashboardData?.orders?.total || 0,
            month: dashboardData?.orders?.thisMonth || 0,
            today: dashboardData?.orders?.today || 0,
          },
          products: dashboardData?.products?.total || 0,
          suppliers: supplierRes.data?.count || 0,
        });
        setRecentOrders(
          Array.isArray(ordersRes.data?.orders) ? ordersRes.data.orders : []
        );
      } catch (error) {
        console.error("Dashboard load error:", error);
        setReportError(
          error.response?.data?.message || "Unable to load sales report."
        );
      } finally {
        setLoading(false);
        setReportLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (skipFirstReportFetch.current) {
      skipFirstReportFetch.current = false;
      return;
    }

    let cancelled = false;

    const fetchSalesReport = async () => {
      setReportLoading(true);
      setReportError("");
      setReport(null);

      try {
        const params = {
          period: appliedReportFilter.period,
          page: reportPage,
          limit: 10,
          includeReport: true,
        };

        if (appliedReportFilter.period === "custom") {
          params.from = appliedReportFilter.from;
          params.to = appliedReportFilter.to;
        }

        const { data: response } = await axios.get(
          `${API_URL}/dashboard/sales-summary`,
          { params }
        );

        if (!response.success || !response.data?.salesReport) {
          throw new Error(response.message || "Unable to load sales report.");
        }

        if (!cancelled) {
          setReport(response.data.salesReport);
        }
      } catch (error) {
        if (!cancelled) {
          setReportError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load sales report."
          );
        }
      } finally {
        if (!cancelled) {
          setReportLoading(false);
        }
      }
    };

    fetchSalesReport();

    return () => {
      cancelled = true;
    };
  }, [appliedReportFilter, reportPage]);

  const handleReportFilterSubmit = (event) => {
    event.preventDefault();

    if (
      reportPeriod === "custom" &&
      (!reportFrom || !reportTo || reportFrom > reportTo)
    ) {
      setReportError("Select a valid custom date range.");
      return;
    }

    setReportError("");
    setReportPage(1);
    setAppliedReportFilter({
      period: reportPeriod,
      from: reportFrom,
      to: reportTo,
    });
  };

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const formatGrossProfit = (value) =>
    value === null || value === undefined
      ? "Unavailable"
      : formatPrice(value);

  const profitAvailability = (count) => {
    if (!report) return "Snapshot availability pending";
    return count > 0
      ? `Profit unavailable for ${count} order${count === 1 ? "" : "s"} without cost snapshots`
      : "Available for all eligible orders";
  };

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
      value: formatPrice(summary.revenue[period]),
      icon: IndianRupee,
    },
    {
      title: "Total Orders",
      value: summary.orders[period],
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

  const reportCards = [
    {
      title: "Total Sales",
      value: formatPrice(report?.totalSales),
      detail: "Online + offline",
    },
    {
      title: "Online Sales",
      value: formatPrice(report?.onlineSales),
      detail: `${report?.onlineOrdersCount || 0} orders`,
    },
    {
      title: "Offline Sales",
      value: formatPrice(report?.offlineSales),
      detail: `${report?.offlineOrdersCount || 0} orders`,
    },
    {
      title: "Total Orders",
      value: (report?.totalOrders || 0).toLocaleString("en-IN"),
      detail: "Eligible sales orders",
    },
    {
      title: "Online Orders",
      value: (report?.onlineOrdersCount || 0).toLocaleString("en-IN"),
      detail: "Captured, not cancelled",
    },
    {
      title: "Offline Orders",
      value: (report?.offlineOrdersCount || 0).toLocaleString("en-IN"),
      detail: "Completed",
    },
  ];

  const grossProfitCards = [
    {
      title: "Gross Profit (Basic)",
      value: formatGrossProfit(report?.totalGrossProfit),
      detail: profitAvailability(report?.profitUnavailableOrders?.total || 0),
    },
    {
      title: "Online Gross Profit",
      value: formatGrossProfit(report?.onlineGrossProfit),
      detail:
        report && report.onlineOrdersCount === 0
          ? "No eligible orders"
          : profitAvailability(report?.profitUnavailableOrders?.online || 0),
    },
    {
      title: "Offline Gross Profit",
      value: formatGrossProfit(report?.offlineGrossProfit),
      detail: profitAvailability(report?.profitUnavailableOrders?.offline || 0),
    },
  ];

  const reportTotalPages = Math.max(report?.pagination?.totalPages || 0, 1);
  const reportPeriodLabels = {
    all: "All time",
    today: "Today",
    yesterday: "Yesterday",
    thisMonth: "This month",
    lastMonth: "Last month",
    custom: "Custom date range",
  };
  const reportRangeDescription =
    report?.from && report?.to
      ? `${report.from} to ${report.to}`
      : reportPeriodLabels[appliedReportFilter.period];

  return (
    <div className="space-y-7 bg-white">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a87514]">
            Anugraha Fashions
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-700 sm:text-base">
            Welcome back. Here&apos;s what&apos;s happening with your store.
          </p>
          <div className="mt-4 h-[2px] w-16 bg-[#d4a13f]" />
        </div>

        <label className="relative inline-flex h-11 min-w-40 items-center gap-2 self-start rounded-full border border-slate-300 bg-white pl-4 pr-3 text-sm text-slate-900 transition-colors focus-within:border-[#d4a13f] sm:self-auto">
          <CalendarDays size={17} className="shrink-0 text-[#b8860b]" />
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-5 font-medium text-slate-900 outline-none"
            aria-label="Filter dashboard period"
          >
            {Object.entries(periods).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 text-slate-800"
          />
        </label>
      </section>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Store overview"
      >
        {cards.map(({ title, value, icon: Icon }) => (
          <article
            key={title}
            className="flex min-h-[142px] items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_5px_20px_rgba(15,23,42,0.07)] sm:gap-5 sm:p-6"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#d4a13f]/15 text-[#b8860b] sm:h-16 sm:w-16">
              <Icon size={27} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-700">{title}</p>
              <p className="mt-1 break-words font-serif text-3xl font-semibold leading-tight text-slate-950">
                {loading ? "—" : value}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-slate-950">
              Sales Report
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Combined online and offline sales · {reportRangeDescription}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleReportFilterSubmit}
          className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Date range
            <select
              value={reportPeriod}
              onChange={(event) => setReportPeriod(event.target.value)}
              className="h-11 min-w-48 rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-[#d4a13f]"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisMonth">This month</option>
              <option value="lastMonth">Last month</option>
              <option value="custom">Custom date range</option>
            </select>
          </label>

          {reportPeriod === "custom" && (
            <>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                From
                <input
                  type="date"
                  value={reportFrom}
                  onChange={(event) => setReportFrom(event.target.value)}
                  required
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-[#d4a13f]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                To
                <input
                  type="date"
                  value={reportTo}
                  onChange={(event) => setReportTo(event.target.value)}
                  required
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-[#d4a13f]"
                />
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={reportLoading}
            className="h-11 rounded-lg bg-[#d4a13f] px-5 font-medium text-slate-950 transition-colors hover:bg-[#bd8e32] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reportLoading ? "Loading..." : "Apply"}
          </button>
        </form>

        {reportError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {reportError}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {reportCards.map(({ title, value, detail }) => (
            <article
              key={title}
              className="rounded-xl border border-[#d4a13f]/30 bg-[#d4a13f]/5 p-4"
            >
              <p className="text-xs font-medium text-slate-700">{title}</p>
              <p className="mt-1 break-words text-lg font-bold text-slate-950">
                {reportLoading || reportError ? "—" : value}
              </p>
              <p className="mt-1 text-xs text-slate-600">{detail}</p>
            </article>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Gross Profit
          </h3>
          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grossProfitCards.map(({ title, value, detail }) => (
              <article
                key={title}
                className="flex h-full min-h-[148px] flex-col justify-between rounded-xl border border-[#d4a13f]/40 bg-[#d4a13f]/5 p-5 text-left shadow-sm sm:p-6"
              >
                <p className="min-h-10 text-sm font-medium leading-5 text-slate-700">
                  {title}
                </p>
                <p
                  className="mt-2 truncate text-xl font-bold leading-tight tracking-tight text-slate-950 sm:text-2xl"
                  title={reportLoading || reportError ? "—" : value}
                >
                  {reportLoading || reportError ? "—" : value}
                </p>
                <p className="mt-3 text-sm leading-5 text-slate-600">
                  {detail}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Payment</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Gross Profit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportLoading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-600">
                    Loading sales orders...
                  </td>
                </tr>
              ) : !report?.orders?.length ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-600">
                    {reportError
                      ? "Unable to load sales orders."
                      : "No eligible sales orders for this date range."}
                  </td>
                </tr>
              ) : (
                report.orders.map((order) => (
                  <tr
                    key={`${order.orderType}-${order._id}`}
                    className="transition-colors hover:bg-[#d4a13f]/5"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                      #{order.orderId}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {order.orderType}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <div>{order.customerName}</div>
                      {order.salesperson && (
                        <div className="mt-0.5 text-xs text-slate-500">
                          {order.salesperson}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-slate-800">
                      {order.paymentMethod}
                      {order.paymentStatus
                        ? ` · ${order.paymentStatus}`
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusClass}>{order.status}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-950">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-950">
                      {formatGrossProfit(order.grossProfit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {report?.pagination?.currentPage || 1} of {reportTotalPages} ·{" "}
            {report?.pagination?.totalOrders || 0} orders
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReportPage((page) => Math.max(page - 1, 1))}
              disabled={reportLoading || reportPage <= 1}
              className="rounded-lg border border-slate-300 bg-white p-2 disabled:opacity-50"
              aria-label="Previous sales report page"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() =>
                setReportPage((page) => Math.min(page + 1, reportTotalPages))
              }
              disabled={reportLoading || reportPage >= reportTotalPages}
              className="rounded-lg border border-slate-300 bg-white p-2 disabled:opacity-50"
              aria-label="Next sales report page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-11 w-1 shrink-0 rounded-full bg-[#d4a13f]" />
            <div>
              <h2 className="font-serif text-2xl font-semibold text-slate-950">
                Recent Orders
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                Latest customer orders
              </p>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-[#d4a13f] px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-[#d4a13f]/10 sm:self-auto"
          >
            View all orders
            <ArrowRight size={16} className="text-[#a87514]" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-white text-slate-900">
              <tr>
                <th className="rounded-l-lg px-4 py-3.5 text-left font-semibold">
                  Order ID
                </th>
                <th className="px-4 py-3.5 text-left font-semibold">
                  Customer
                </th>
                <th className="px-4 py-3.5 text-left font-semibold">Date</th>
                <th className="px-4 py-3.5 text-left font-semibold">Amount</th>
                <th className="rounded-r-lg px-4 py-3.5 text-center font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-700">
                    Loading recent orders...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-700">
                    No recent orders
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.orderId || order._id}
                    className="transition-colors hover:bg-[#d4a13f]/5"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-950">
                      #{order.orderId || order._id}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">
                        {order.customerId?.name || "—"}
                      </p>
                      {order.customerId?.email && (
                        <p className="mt-0.5 text-xs text-slate-600">
                          {order.customerId.email}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-900">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-950">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={statusClass}>
                        {order.orderStatus || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
