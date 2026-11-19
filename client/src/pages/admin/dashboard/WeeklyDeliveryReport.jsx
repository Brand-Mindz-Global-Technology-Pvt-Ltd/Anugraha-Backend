import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useDashboard } from "../../../context/Dashboardcontext.jsx";
import { Skeleton, ChartSkeleton } from "./Skeletons.jsx";
import * as XLSX from "xlsx";

const WeeklyDeliveryReport = () => {
  const { loading, data } = useDashboard();
  const isLoading        = loading.satisfaction;
  const satisfactionData = data.satisfaction;

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-4 sm:p-5 lg:p-6 shadow-lg" style={{ border: "1px solid #f1f5f9" }}>
        <Skeleton className="h-5 w-48 mb-4" />
        <ChartSkeleton height="220px" />
      </div>
    );
  }

  const chartData           = satisfactionData?.chartData          ?? [];
  const currentMonthRevenue = satisfactionData?.summary?.currentMonthRevenue ?? 0;
  const lastMonthRevenue    = satisfactionData?.summary?.lastMonthRevenue    ?? 0;
  const thisWeekTotal       = chartData.reduce((sum, d) => sum + (d.today    ?? 0), 0);
  const lastWeekTotal       = chartData.reduce((sum, d) => sum + (d.lastWeek ?? 0), 0);

  const weekChange = lastWeekTotal > 0
    ? (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(1)
    : 0;
  const isPositive = weekChange >= 0;

  const handleExport = () => {
    const dailySheet = XLSX.utils.json_to_sheet(
      chartData.map((d) => ({
        Day:                    d.name,
        "This Week Deliveries": d.today    ?? 0,
        "Last Week Deliveries": d.lastWeek ?? 0,
      }))
    );
    const summarySheet = XLSX.utils.json_to_sheet([
      { Metric: "This Week Total Deliveries", Value: thisWeekTotal },
      { Metric: "Last Week Total Deliveries", Value: lastWeekTotal },
      { Metric: "This Month Revenue (₹)",     Value: currentMonthRevenue },
      { Metric: "Last Month Revenue (₹)",     Value: lastMonthRevenue },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, dailySheet,   "Daily Deliveries");
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.writeFile(wb, "delivery_report.xlsx");
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "12px",
        color: "#172033",
        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
      }}>
        <p style={{ color: "#465064", marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.dataKey === "today" ? "#d4a13f" : "#172033", margin: "2px 0" }}>
            {p.dataKey === "today" ? "This Week" : "Last Week"}:{" "}
            <strong style={{ color: "#172033" }}>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg w-full" style={{ border: "1px solid #f1f5f9" }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2 mb-4 sm:mb-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Analytics</p>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
            Weekly Delivery Report
          </h2>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
          style={{
            background: "#d4a13f",
            color: "#fff",
            boxShadow: "0 2px 12px rgba(212,161,63,0.18)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          <span className="hidden xs:inline sm:inline">Export Excel</span>
          <span className="xs:hidden sm:hidden">Export</span>
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">

        {/* Last Week */}
        <div
          className="rounded-xl p-2.5 sm:p-3.5"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-900 flex-shrink-0" />
            <p className="text-xs text-slate-500 font-medium">Last Week</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900">
            {lastWeekTotal.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Deliveries</p>
        </div>

        {/* This Week */}
        <div
          className="rounded-xl p-2.5 sm:p-3.5"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <div className="w-2 h-2 rounded-full bg-[#d4a13f] flex-shrink-0" />
            <p className="text-xs text-slate-500 font-medium">This Week</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#b8860b]">
            {thisWeekTotal.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs font-semibold text-[#b8860b]">
              {isPositive ? "▲" : "▼"} {Math.abs(weekChange)}%
            </span>
            <span className="text-xs text-slate-400">vs last</span>
          </div>
        </div>

        {/* Last Month */}
        <div
          className="rounded-xl p-2.5 sm:p-3.5"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 font-medium">Last Month</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-700 truncate">
            ₹{lastMonthRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Revenue</p>
        </div>

        {/* This Month */}
        <div
          className="rounded-xl p-2.5 sm:p-3.5"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <div className="w-2 h-2 rounded-full bg-[#d4a13f] flex-shrink-0" />
            <p className="text-xs text-slate-500 font-medium">This Month</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#b8860b] truncate">
            ₹{currentMonthRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Revenue</p>
        </div>

      </div>

      {/* ── Chart ── */}
      <div style={{ background: "#ffffff", borderRadius: "14px", padding: "12px 4px 8px" }}>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#465064", fontSize: 10, fontWeight: 500 }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#465064", fontSize: 10 }}
              width={28}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="lastWeek"
              stroke="#172033"
              strokeWidth={2}
              fill="#172033"
              fillOpacity={0.06}
              dot={false}
              activeDot={{ r: 4, fill: "#172033", stroke: "#fff", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="today"
              stroke="#d4a13f"
              strokeWidth={2}
              fill="#d4a13f"
              fillOpacity={0.12}
              dot={false}
              activeDot={{ r: 4, fill: "#d4a13f", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 sm:mt-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 sm:w-6 h-0.5 rounded-full bg-slate-900" />
          <span className="text-xs text-slate-500 font-medium">Last Week</span>
          <span className="text-xs font-bold text-slate-700">{lastWeekTotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 sm:w-6 h-0.5 rounded-full bg-[#d4a13f]" />
          <span className="text-xs text-slate-500 font-medium">This Week</span>
          <span className="text-xs font-bold text-slate-700">{thisWeekTotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="ml-auto">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full bg-[#d4a13f]/10 text-[#b8860b]"
          >
            {isPositive ? "↑" : "↓"} {Math.abs(weekChange)}% WoW
          </span>
        </div>
      </div>

    </div>
  );
};

export default WeeklyDeliveryReport;