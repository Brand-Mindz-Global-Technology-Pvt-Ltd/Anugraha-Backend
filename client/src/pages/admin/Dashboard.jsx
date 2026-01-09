// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";
// import { DollarSign, ShoppingCart, UserPlus } from "lucide-react";


// /* =================== DATA (same as image) =================== */

// const stats = [
//   {
//     title: "Total Sales",
//     value: "$1,245",
//     sub: "+10% from yesterday",
//     bg: "bg-purple-100",
//     icon: DollarSign,
//     iconBg: "bg-purple-200 text-purple-600",
//   },
//   {
//     title: "Total Orders",
//     value: "263",
//     sub: "+15% from yesterday",
//     bg: "bg-amber-100",
//     icon: ShoppingCart,
//     iconBg: "bg-amber-200 text-amber-600",
//   },
//   {
//     title: "New Customers",
//     value: "12",
//     sub: "+5% from yesterday",
//     bg: "bg-emerald-100",
//     icon: UserPlus,
//     iconBg: "bg-emerald-200 text-emerald-600",
//   },
// ];

// const satisfactionData = [
//   { name: "Mon", last: 30, current: 40 },
//   { name: "Tue", last: 45, current: 50 },
//   { name: "Wed", last: 25, current: 35 },
//   { name: "Thu", last: 40, current: 55 },
//   { name: "Fri", last: 30, current: 45 },
//   { name: "Sat", last: 35, current: 60 },
// ];

// const volumeData = [
//   { name: "Jan", volume: 40, service: 20 },
//   { name: "Feb", volume: 70, service: 35 },
//   { name: "Mar", volume: 55, service: 30 },
//   { name: "Apr", volume: 30, service: 15 },
//   { name: "May", volume: 50, service: 25 },
//   { name: "Jun", volume: 55, service: 30 },
// ];
// const volume = {
//   volume: 304,
//   service: 44,
// };

// const revenueData = [
//   { name: "Mon", online: 30, offline: 20 },
//   { name: "Tue", online: 45, offline: 30 },
//   { name: "Wed", online: 25, offline: 20 },
//   { name: "Thu", online: 50, offline: 35 },
//   { name: "Fri", online: 60, offline: 40 },
//   { name: "Sat", online: 40, offline: 30 },
// ];

// const products = [
//   {
//     id: "01",
//     name: "Home Decor Range",
//     percent: 45,
//     color: "bg-blue-500",
//     pill: "bg-blue-100 text-blue-600",
//   },
//   {
//     id: "02",
//     name: "Disney Princess Pink Bag 18'",
//     percent: 29,
//     color: "bg-emerald-500",
//     pill: "bg-emerald-100 text-emerald-600",
//   },
//   {
//     id: "03",
//     name: "Bathroom Essentials",
//     percent: 18,
//     color: "bg-violet-500",
//     pill: "bg-violet-100 text-violet-600",
//   },
//   {
//     id: "04",
//     name: "Apple Smartwatches",
//     percent: 25,
//     color: "bg-amber-500",
//     pill: "bg-amber-100 text-amber-600",
//   },
//   {
//     id: "05",
//     name: "Wireless Earbuds",
//     percent: 32,
//     color: "bg-rose-500",
//     pill: "bg-rose-100 text-rose-600",
//   },
// ];

// const summary = {
//   last: 3004,
//   current: 4504,
// };


// /* =================== COMPONENT =================== */

// export default function Dashboard() {
//   return (
//     <div className="space-y-6  ">
//       {/* ===== TOP SECTION ===== */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//         {/* Sales Summary */}
//         <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="text-md font-semibold text-slate-900">
//                 Today’s Sales
//               </h3>
//               <p className="text-sm text-slate-400">Sales Summary</p>
//             </div>

//             <button className="text-sm border border-slate-200 px-3 py-1 rounded-md text-slate-700 hover:bg-slate-50">
//               Export
//             </button>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {stats.map((s) => {
//               const Icon = s.icon;

//               return (
//                 <div
//                   key={s.title}
//                   className={`rounded-xl p-4 ${s.bg}`}
//                 >
//                   {/* Icon */}
//                   <div
//                     className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${s.iconBg}`}
//                   >
//                     <Icon className="w-5 h-5" />
//                   </div>

//                   <p className="text-sm text-slate-600">
//                     {s.title}
//                   </p>

//                   <h4 className="text-xl font-semibold text-slate-900 mt-1">
//                     {s.value}
//                   </h4>

//                   <p className="text-xs text-blue-500 mt-1">
//                     {s.sub}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Sales Mapping by Country */}
//         <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col">
//           <h4 className="text-sm font-semibold text-slate-900 mb-4">
//             Sales Mapping by Country
//           </h4>

//           <div className="flex-1 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 text-xs">
//             Map / Image Here
//           </div>
//         </div>
//       </div>

//       {/* ===== MIDDLE SECTION ===== */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <div className="lg:col-span-2 rounded-2xl bg-white text-white p-4 shadow-lg">
//           <div className="flex items-center justify-between mb-2">
//             <div>
//               <p className="text-md text-black font-semibold"> Customer Satisfaction  </p>
//             </div>
//           </div>
//           <div className="mt-4">
//             <ResponsiveContainer width="100%" height={220}>
//               <AreaChart data={satisfactionData}>
//                 <CartesianGrid
//                   stroke="#1e293b"
//                   strokeDasharray="3 3"
//                   vertical={false}
//                 />
//                 <XAxis
//                   dataKey="name"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: "#94a3b8", fontSize: 12 }}
//                 />
//                 <YAxis
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: "#94a3b8", fontSize: 12 }}
//                 />
//                 <Tooltip
//                   contentStyle={{
//                     background: "#020617",
//                     border: "1px solid #1e293b",
//                     borderRadius: 8,
//                     fontSize: 12,
//                   }}
//                   cursor={{ stroke: "#334155", strokeWidth: 1 }}
//                 />

//                 {/* Bottom Area */}
//                 <Area
//                   type="monotone"
//                   dataKey="last"
//                   stackId="1"
//                   stroke="#2563eb"
//                   fill="#c8ecfa"
//                   fillOpacity={0.85}
//                 />

//                 {/* Top Area */}
//                 <Area
//                   type="monotone"
//                   dataKey="current"
//                   stackId="1"
//                   stroke="#93c5fd"
//                   fill="#d6faee"
//                   fillOpacity={0.9}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//             <div className="mt-4 flex justify-start gap-10 text-sm ">
//               <div className="flex items-center gap-2 p-2">
//                 <span className="h-2 w-2 rounded-full bg-blue-600  " />
//                 <div className="flex flex-col ">
//                   <span className="text-xs text-slate-400">Last Month</span>
//                   <span className="font-semibold text-slate-800">
//                     ${summary.last.toLocaleString()}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <span className="h-2 w-2 rounded-full bg-emerald-500" />
//                 <div className="flex flex-col">
//                   <span className="text-xs text-slate-400">This Month</span>
//                   <span className="font-semibold text-slate-800">
//                     ${summary.current.toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>


//         {/* Volume */}
//         <div className="rounded-2xl bg-white p-4 shadow-lg">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-md font-semibold text-slate-900">
//               Volume vs Service Level
//             </p>
//           </div>

//           <div className="mt-4">
//             <ResponsiveContainer width="100%" height={220}>
//               <BarChart
//                 data={volumeData}
//                 barCategoryGap="25%"
//                 barGap={6}
//               >
//                 <XAxis
//                   dataKey="name"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: "#94a3b8", fontSize: 12 }}
//                 />

//                 <Tooltip
//                   contentStyle={{
//                     background: "#020617",
//                     border: "1px solid #1e293b",
//                     borderRadius: 8,
//                     fontSize: 12,
//                   }}
//                   cursor={{ fill: "rgba(2,6,23,0.05)" }}
//                 />

//                 {/* Bottom (Light Blue) */}
//                 <Bar
//                   dataKey="volume"
//                   stackId="a"
//                   fill="#0dd99a"
//                   radius={[0, 0, 6, 6]}
//                 />

//                 {/* Top (Dark Blue) */}
//                 <Bar
//                   dataKey="service"
//                   stackId="a"
//                   fill="#2563eb"
//                   radius={[6, 6, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//             <div className="mt-4 flex justify-start gap-10 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="h-2 w-2 rounded-full bg-blue-300" />
//                 <div className="flex flex-col leading-tight">
//                   <span className="text-xs text-slate-400">Volume</span>
//                   <span className="font-semibold text-slate-800">
//                     ${volume.volume.toLocaleString()}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <span className="h-2 w-2 rounded-full bg-blue-600" />
//                 <div className="flex flex-col leading-tight">
//                   <span className="text-xs text-slate-400">Services</span>
//                   <span className="font-semibold text-slate-800">
//                     ${volume.service.toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>

//       {/* ===== BOTTOM SECTION ===== */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

//         <div className="lg:col-span-1 bg-white rounded-xl p-4 shadow-sm">
//           <h4 className="text-md font-semibold text-slate-900 mb-3">
//             Total Revenue
//           </h4>
//           <ResponsiveContainer width="100%" height={260}>
//             <BarChart
//               data={revenueData}
//               barCategoryGap="25%"
//               barGap={6}
//             >
//               {/* X Axis */}
//               <XAxis
//                 dataKey="name"
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fill: "#94a3b8", fontSize: 12 }}
//               />

//               {/* Y Axis */}
//               <YAxis
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fill: "#94a3b8", fontSize: 12 }}
//               />

//               {/* Tooltip */}
//               <Tooltip
//                 contentStyle={{
//                   background: "#020617",
//                   border: "1px solid #1e293b",
//                   borderRadius: 8,
//                   fontSize: 12,
//                 }}
//                 cursor={{ fill: "rgba(2,6,23,0.05)" }}
//               />

//               {/* Online Revenue (Blue) */}
//               <Bar
//                 dataKey="online"
//                 fill="#2563eb"
//                 radius={[6, 6, 0, 0]}
//               />

//               {/* Offline Revenue (Green) */}
//               <Bar
//                 dataKey="offline"
//                 fill="#22c55e"
//                 radius={[6, 6, 0, 0]}
//               />
//             </BarChart>
//           </ResponsiveContainer>

//           {/* Footer Legend */}
//           <div className="mt-4 flex justify-start gap-8 text-sm">
//             <div className="flex items-center gap-2">
//               <span className="h-2 w-2 rounded-full bg-blue-600" />
//               <span className="text-xs text-slate-500">Online</span>
//             </div>

//             <div className="flex items-start gap-2 ">
//               <span className="h-2 w-2 rounded-full bg-green-500" />
//               <span className="text-xs text-slate-500">Offline</span>
//             </div>
//           </div>
//         </div>


//         {/* Products */}
//         <div className="bg-white rounded-xl p-5 shadow-sm w-full overflow-hidden">
//           <h4 className="text-md text-black font-semibold mb-4">
//             Top Products
//           </h4>

//           {/* Header (hide on mobile) */}
//           <div className="hidden md:grid grid-cols-[40px_1fr_160px_70px] text-xs text-slate-400 mb-3">
//             <span>#</span>
//             <span>Name</span>
//             <span>Popularity</span>
//             <span className="text-right">Sales</span>
//           </div>
//           <div className="space-y-4">
//             {products.map((p) => (
//               <div
//                 key={p.id}
//                 className="grid grid-cols-[40px_1fr] md:grid-cols-[40px_1fr_160px_70px] gap-y-2 items-center"
//               >
//                 <span className="text-sm text-slate-400">{p.id}</span>
//                 <span className="text-sm text-slate-700 truncate">
//                   {p.name}
//                 </span>
//                 <div className="col-span-2 md:col-span-1 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
//                   <div
//                     className={`h-full ${p.color} rounded-full`}
//                     style={{ width: `${p.percent}%` }}
//                   />
//                 </div>
//                 <div className="col-span-2 md:col-span-1 flex justify-end">
//                   <span
//                     className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.pill}`}
//                   >
//                     {p.percent}%
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DollarSign, ShoppingCart, UserPlus } from "lucide-react";

/* =================== SKELETON COMPONENTS =================== */

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="rounded-xl p-4 bg-slate-50">
    <Skeleton className="w-9 h-9 rounded-full mb-3" />
    <Skeleton className="h-4 w-20 mb-2" />
    <Skeleton className="h-6 w-24 mb-2" />
    <Skeleton className="h-3 w-32" />
  </div>
);

const ChartSkeleton = ({ height = "220px" }) => (
  <div className="space-y-3">
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {[...Array(6)].map((_, i) => (
        <Skeleton
          key={i}
          className="w-full"
          style={{ height: `${Math.random() * 60 + 40}%` }}
        />
      ))}
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

/* =================== DATA =================== */

const stats = [
  {
    title: "Total Sales",
    value: "$1,245",
    sub: "+10% from yesterday",
    bg: "bg-purple-100",
    icon: DollarSign,
    iconBg: "bg-purple-200 text-purple-600",
  },
  {
    title: "Total Orders",
    value: "263",
    sub: "+15% from yesterday",
    bg: "bg-amber-100",
    icon: ShoppingCart,
    iconBg: "bg-amber-200 text-amber-600",
  },
  {
    title: "New Customers",
    value: "12",
    sub: "+5% from yesterday",
    bg: "bg-emerald-100",
    icon: UserPlus,
    iconBg: "bg-emerald-200 text-emerald-600",
  },
];

const satisfactionData = [
  { name: "Mon", last: 30, current: 40 },
  { name: "Tue", last: 45, current: 50 },
  { name: "Wed", last: 25, current: 35 },
  { name: "Thu", last: 40, current: 55 },
  { name: "Fri", last: 30, current: 45 },
  { name: "Sat", last: 35, current: 60 },
];

const volumeData = [
  { name: "Jan", volume: 40, service: 20 },
  { name: "Feb", volume: 70, service: 35 },
  { name: "Mar", volume: 55, service: 30 },
  { name: "Apr", volume: 30, service: 15 },
  { name: "May", volume: 50, service: 25 },
  { name: "Jun", volume: 55, service: 30 },
];

const volume = { volume: 304, service: 44 };

const revenueData = [
  { name: "Mon", online: 30, offline: 20 },
  { name: "Tue", online: 45, offline: 30 },
  { name: "Wed", online: 25, offline: 20 },
  { name: "Thu", online: 50, offline: 35 },
  { name: "Fri", online: 60, offline: 40 },
  { name: "Sat", online: 40, offline: 30 },
];

const products = [
  {
    id: "01",
    name: "Home Decor Range",
    percent: 45,
    color: "bg-blue-500",
    pill: "bg-blue-100 text-blue-600",
  },
  {
    id: "02",
    name: "Disney Princess Pink Bag 18'",
    percent: 29,
    color: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "03",
    name: "Bathroom Essentials",
    percent: 18,
    color: "bg-violet-500",
    pill: "bg-violet-100 text-violet-600",
  },
  {
    id: "04",
    name: "Apple Smartwatches",
    percent: 25,
    color: "bg-amber-500",
    pill: "bg-amber-100 text-amber-600",
  },
  {
    id: "05",
    name: "Wireless Earbuds",
    percent: 32,
    color: "bg-rose-500",
    pill: "bg-rose-100 text-rose-600",
  },
];

const summary = { last: 3004, current: 4504 };

/* =================== COMPONENTS =================== */

const SalesSummary = ({ loading }) => {
  if (loading) {
    return (
      <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-md font-semibold text-slate-900">Today's Sales</h3>
          <p className="text-sm text-slate-400">Sales Summary</p>
        </div>
        <button className="text-sm border border-slate-200 px-3 py-1 rounded-md text-slate-700 hover:bg-slate-50">
          Export
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className={`rounded-xl p-4 ${s.bg}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${s.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600">{s.title}</p>
              <h4 className="text-xl font-semibold text-slate-900 mt-1">{s.value}</h4>
              <p className="text-xs text-blue-500 mt-1">{s.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SalesMapping = ({ loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-full h-full min-h-[180px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col">
      <h4 className="text-sm font-semibold text-slate-900 mb-4">
        Sales Mapping by Country
      </h4>
      <div className="flex-1 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 text-xs">
        Map / Image Here
      </div>
    </div>
  );
};

const CustomerSatisfaction = ({ loading }) => {
  if (loading) {
    return (
      <div className="lg:col-span-2 rounded-2xl bg-white p-4 shadow-lg">
        <Skeleton className="h-5 w-48 mb-4" />
        <ChartSkeleton height="220px" />
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 rounded-2xl bg-white p-4 shadow-lg">
      <p className="text-md text-black font-semibold mb-2">Customer Satisfaction</p>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={satisfactionData}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ stroke: "#334155", strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="last" stackId="1" stroke="#2563eb" fill="#c8ecfa" fillOpacity={0.85} />
            <Area type="monotone" dataKey="current" stackId="1" stroke="#93c5fd" fill="#d6faee" fillOpacity={0.9} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-start gap-10 text-sm">
          <div className="flex items-center gap-2 p-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Last Month</span>
              <span className="font-semibold text-slate-800">${summary.last.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">This Month</span>
              <span className="font-semibold text-slate-800">${summary.current.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VolumeService = ({ loading }) => {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-lg">
        <Skeleton className="h-5 w-48 mb-4" />
        <ChartSkeleton height="220px" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg">
      <p className="text-md font-semibold text-slate-900 mb-2">Volume vs Service Level</p>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={volumeData} barCategoryGap="25%" barGap={6}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ fill: "rgba(2,6,23,0.05)" }}
            />
            <Bar dataKey="volume" stackId="a" fill="#0dd99a" radius={[0, 0, 6, 6]} />
            <Bar dataKey="service" stackId="a" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-start gap-10 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-300" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-slate-400">Volume</span>
              <span className="font-semibold text-slate-800">${volume.volume.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-slate-400">Services</span>
              <span className="font-semibold text-slate-800">${volume.service.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TotalRevenue = ({ loading }) => {
  if (loading) {
    return (
      <div className="lg:col-span-1 bg-white rounded-xl p-4 shadow-sm">
        <Skeleton className="h-5 w-32 mb-4" />
        <ChartSkeleton height="260px" />
      </div>
    );
  }

  return (
    <div className="lg:col-span-1 bg-white rounded-xl p-4 shadow-sm">
      <h4 className="text-md font-semibold text-slate-900 mb-3">Total Revenue</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={revenueData} barCategoryGap="25%" barGap={6}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ fill: "rgba(2,6,23,0.05)" }}
          />
          <Bar dataKey="online" fill="#2563eb" radius={[6, 6, 0, 0]} />
          <Bar dataKey="offline" fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex justify-start gap-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <span className="text-xs text-slate-500">Online</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-slate-500">Offline</span>
        </div>
      </div>
    </div>
  );
};

const TopProducts = ({ loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm w-full overflow-hidden">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm w-full overflow-hidden">
      <h4 className="text-md text-black font-semibold mb-4">Top Products</h4>
      <div className="hidden md:grid grid-cols-[40px_1fr_160px_70px] text-xs text-slate-400 mb-3">
        <span>#</span>
        <span>Name</span>
        <span>Popularity</span>
        <span className="text-right">Sales</span>
      </div>
      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.id} className="grid grid-cols-[40px_1fr] md:grid-cols-[40px_1fr_160px_70px] gap-y-2 items-center">
            <span className="text-sm text-slate-400">{p.id}</span>
            <span className="text-sm text-slate-700 truncate">{p.name}</span>
            <div className="col-span-2 md:col-span-1 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.percent}%` }} />
            </div>
            <div className="col-span-2 md:col-span-1 flex justify-end">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.pill}`}>{p.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =================== MAIN DASHBOARD =================== */

export default function Dashboard() {
  const [loadingStates, setLoadingStates] = useState({
    sales: true,
    mapping: true,
    satisfaction: true,
    volume: true,
    revenue: true,
    products: true,
  });

  useEffect(() => {
    const timers = [
      setTimeout(() => setLoadingStates((s) => ({ ...s, sales: false })), 800),
      setTimeout(() => setLoadingStates((s) => ({ ...s, mapping: false })), 1200),
      setTimeout(() => setLoadingStates((s) => ({ ...s, satisfaction: false })), 1600),
      setTimeout(() => setLoadingStates((s) => ({ ...s, volume: false })), 2000),
      setTimeout(() => setLoadingStates((s) => ({ ...s, revenue: false })), 2400),
      setTimeout(() => setLoadingStates((s) => ({ ...s, products: false })), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-6">
      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <SalesSummary loading={loadingStates.sales} />
        <SalesMapping loading={loadingStates.mapping} />
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CustomerSatisfaction loading={loadingStates.satisfaction} />
        <VolumeService loading={loadingStates.volume} />
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TotalRevenue loading={loadingStates.revenue} />
        <TopProducts loading={loadingStates.products} />
      </div>
    </div>
  );
}