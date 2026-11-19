import Order from "../Models/Order.js";
import OfflineOrder from "../Models/OfflineOrder.js";
import Customer from "../Models/customer.js";
import Product from "../Models/Product.js";
import { startOfDay, endOfDay } from "date-fns";

/* ─────────────────────────────────────────────
   DATE HELPERS
───────────────────────────────────────────── */
const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const startOfLastMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
};

const endOfLastMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const calcPct = (today, yesterday) => {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return Number((((today - yesterday) / yesterday) * 100).toFixed(0));
};

const last6Days = () =>
  Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (5 - i));
    return d;
  });

const last6Months = () =>
  Array.from({ length: 6 }, (_, i) => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth() - (5 - i), 1);
  });

const LOW_STOCK_LIMIT = 10;
const HIGH_STOCK_LIMIT = 100;

const ONLINE_SALES_FILTER = {
  "payment.status": "captured",
  orderStatus: { $ne: "cancelled" },
};

const OFFLINE_SALES_FILTER = {
  status: "completed",
};

const formatDateInput = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const parseDateInput = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getSalesDateRange = (query, now = new Date()) => {
  const period = query.period || "all";
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  let start;
  let endExclusive;

  if (period === "all") {
    return { period, start: null, endExclusive: null, from: null, to: null };
  }

  if (period === "today") {
    start = todayStart;
    endExclusive = new Date(todayStart);
    endExclusive.setDate(endExclusive.getDate() + 1);
  } else if (period === "yesterday") {
    endExclusive = todayStart;
    start = new Date(todayStart);
    start.setDate(start.getDate() - 1);
  } else if (period === "thisMonth") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    endExclusive = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (period === "lastMonth") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endExclusive = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "custom") {
    start = parseDateInput(query.from);
    const end = parseDateInput(query.to);

    if (!start || !end || start > end) {
      return {
        error: "Custom date range requires valid from/to dates with from no later than to",
      };
    }

    endExclusive = new Date(end);
    endExclusive.setDate(endExclusive.getDate() + 1);
  } else {
    return { error: "Invalid sales report period" };
  }

  const lastIncludedDay = new Date(endExclusive);
  lastIncludedDay.setDate(lastIncludedDay.getDate() - 1);

  return {
    period,
    start,
    endExclusive,
    from: formatDateInput(start),
    to: formatDateInput(lastIncludedDay),
  };
};

const getCombinedSalesMetrics = async (dateRange, includeProfit = false) => {
  const dateFilter = dateRange?.start
    ? { createdAt: { $gte: dateRange.start, $lt: dateRange.endExclusive } }
    : {};

  const onlineGroup = {
    _id: null,
    sales: { $sum: "$totalAmount" },
    orders: { $sum: 1 },
  };
  const offlineGroup = { ...onlineGroup };

  if (includeProfit) {
    const items = { $ifNull: ["$items", []] };
    const invalidProfitItem = {
      $map: {
        input: items,
        as: "item",
        in: {
          $or: [
            { $not: [{ $isNumber: "$$item.price" }] },
            { $not: [{ $isNumber: "$$item.costPriceSnapshot" }] },
            { $not: [{ $isNumber: "$$item.qty" }] },
            { $lt: ["$$item.price", 0] },
            { $lt: ["$$item.costPriceSnapshot", 0] },
            { $lte: ["$$item.qty", 0] },
          ],
        },
      },
    };
    const unavailableProfitOrder = {
      $or: [
        { $eq: [{ $size: items }, 0] },
        { $anyElementTrue: [invalidProfitItem] },
      ],
    };
    const orderGrossProfit = {
      $sum: {
        $map: {
          input: items,
          as: "item",
          in: {
            $cond: [
              {
                $and: [
                  { $isNumber: "$$item.price" },
                  { $isNumber: "$$item.costPriceSnapshot" },
                  { $isNumber: "$$item.qty" },
                ],
              },
              {
                $multiply: [
                  {
                    $subtract: [
                      "$$item.price",
                      "$$item.costPriceSnapshot",
                    ],
                  },
                  "$$item.qty",
                ],
              },
              0,
            ],
          },
        },
      },
    };

    onlineGroup.grossProfit = orderGrossProfit;
    onlineGroup.unavailableProfitOrders = {
      $sum: { $cond: [unavailableProfitOrder, 1, 0] },
    };
    offlineGroup.grossProfit = orderGrossProfit;
    offlineGroup.unavailableProfitOrders = {
      $sum: { $cond: [unavailableProfitOrder, 1, 0] },
    };
  }

  const [onlineResults, offlineResults] = await Promise.all([
    Order.aggregate([
      { $match: { ...ONLINE_SALES_FILTER, ...dateFilter } },
      { $group: onlineGroup },
    ]),
    OfflineOrder.aggregate([
      { $match: { ...OFFLINE_SALES_FILTER, ...dateFilter } },
      { $group: offlineGroup },
    ]),
  ]);

  const online = onlineResults[0] || { sales: 0, orders: 0 };
  const offline = offlineResults[0] || { sales: 0, orders: 0 };

  const metrics = {
    onlineSales: online.sales,
    offlineSales: offline.sales,
    totalSales: online.sales + offline.sales,
    onlineOrders: online.orders,
    offlineOrders: offline.orders,
    totalOrders: online.orders + offline.orders,
  };

  if (includeProfit) {
    const onlineUnavailable = online.unavailableProfitOrders || 0;
    const offlineUnavailable = offline.unavailableProfitOrders || 0;

    metrics.onlineGrossProfit =
      onlineUnavailable === 0 ? online.grossProfit || 0 : null;
    metrics.offlineGrossProfit =
      offlineUnavailable === 0 ? offline.grossProfit || 0 : null;
    metrics.totalGrossProfit =
      onlineUnavailable === 0 && offlineUnavailable === 0
        ? (online.grossProfit || 0) + (offline.grossProfit || 0)
        : null;
    metrics.onlineProfitUnavailableOrders = onlineUnavailable;
    metrics.offlineProfitUnavailableOrders = offlineUnavailable;
    metrics.totalProfitUnavailableOrders =
      onlineUnavailable + offlineUnavailable;
  }

  return metrics;
};

const calculateOrderGrossProfit = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  let grossProfit = 0;
  for (const item of items) {
    if (
      !Number.isFinite(item.price) ||
      item.price < 0 ||
      !Number.isFinite(item.costPriceSnapshot) ||
      item.costPriceSnapshot < 0 ||
      !Number.isFinite(item.qty) ||
      item.qty <= 0
    ) {
      return null;
    }

    grossProfit += (item.price - item.costPriceSnapshot) * item.qty;
  }

  return Number.isFinite(grossProfit) ? grossProfit : null;
};

export const getSalesSummary = async (req, res) => {
  try {
    const now = new Date();
    const reportRange = getSalesDateRange(req.query, now);

    if (reportRange.error) {
      return res.status(400).json({
        success: false,
        message: reportRange.error,
      });
    }

    const includeReport = req.query.includeReport === "true";
    const reportPageValue = Number(req.query.page);
    const reportPage =
      Number.isSafeInteger(reportPageValue) && reportPageValue > 0
        ? reportPageValue
        : 1;
    const reportLimitValue = Number(req.query.limit);
    const reportLimit =
      Number.isSafeInteger(reportLimitValue) && reportLimitValue > 0
        ? Math.min(reportLimitValue, 100)
        : 10;
    const reportSkip = (reportPage - 1) * reportLimit;
    const reportFetchLimit = reportSkip + reportLimit;

    // ───── Date Ranges ─────
    const todayS = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const todayE = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestS = new Date(
      yest.getFullYear(),
      yest.getMonth(),
      yest.getDate(),
      0,
      0,
      0,
      0,
    );
    const yestE = new Date(
      yest.getFullYear(),
      yest.getMonth(),
      yest.getDate(),
      23,
      59,
      59,
      999,
    );

    const thisMonthS = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const thisMonthE = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const lastMonthS = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );
    const lastMonthE = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    const todayRange = {
      start: todayS,
      endExclusive: new Date(todayE.getTime() + 1),
    };
    const yestRange = {
      start: yestS,
      endExclusive: new Date(yestE.getTime() + 1),
    };
    const thisMonthRange = {
      start: thisMonthS,
      endExclusive: new Date(thisMonthE.getTime() + 1),
    };
    const lastMonthRange = {
      start: lastMonthS,
      endExclusive: new Date(lastMonthE.getTime() + 1),
    };

    const [
      allTimeMetrics,
      todayMetrics,
      yestMetrics,
      thisMonthMetrics,
      lastMonthMetrics,
      todayCusts,
      yestCusts,
      totalCustomers,
      stockSummary,
      lowStockProducts,
      highStockProducts,
      reportMetrics,
      onlineReportOrders,
      offlineReportOrders,
    ] = await Promise.all([
      getCombinedSalesMetrics(null),
      getCombinedSalesMetrics(todayRange),
      getCombinedSalesMetrics(yestRange),
      getCombinedSalesMetrics(thisMonthRange),
      getCombinedSalesMetrics(lastMonthRange),

      // ───── CUSTOMERS ─────
      Customer.countDocuments({ createdAt: { $gte: todayS, $lte: todayE } }),
      Customer.countDocuments({ createdAt: { $gte: yestS, $lte: yestE } }),
      Customer.countDocuments(),

      // ───── STOCK SUMMARY ─────
      Product.aggregate([
        {
          $group: {
            _id: null,
            lowStock: {
              $sum: { $cond: [{ $lte: ["$stock", LOW_STOCK_LIMIT] }, 1, 0] },
            },
            highStock: {
              $sum: { $cond: [{ $gte: ["$stock", HIGH_STOCK_LIMIT] }, 1, 0] },
            },
            totalProducts: { $sum: 1 },
          },
        },
      ]),

      // ───── TOP 5 LOW STOCK PRODUCTS ─────
      Product.aggregate([
        { $match: { stock: { $lte: LOW_STOCK_LIMIT } } },
        { $sort: { stock: 1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: 1, stock: 1 } },
      ]),

      // ───── TOP 5 HIGH STOCK PRODUCTS ─────
      Product.aggregate([
        { $match: { stock: { $gte: HIGH_STOCK_LIMIT } } },
        { $sort: { stock: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: 1, stock: 1 } },
      ]),

      includeReport
        ? getCombinedSalesMetrics(reportRange, true)
        : Promise.resolve(null),
      includeReport
        ? Order.find({
            ...ONLINE_SALES_FILTER,
            ...(reportRange.start
              ? {
                  createdAt: {
                    $gte: reportRange.start,
                    $lt: reportRange.endExclusive,
                  },
                }
              : {}),
          })
            .select(
              "orderId customerId items totalAmount payment.method payment.status orderStatus createdAt",
            )
            .populate("customerId", "name")
            .sort({ createdAt: -1 })
            .limit(reportFetchLimit)
            .lean()
        : Promise.resolve([]),
      includeReport
        ? OfflineOrder.find({
            ...OFFLINE_SALES_FILTER,
            ...(reportRange.start
              ? {
                  createdAt: {
                    $gte: reportRange.start,
                    $lt: reportRange.endExclusive,
                  },
                }
              : {}),
          })
            .select(
              "orderId customerName salesperson items totalAmount paymentMethod status createdAt",
            )
            .sort({ createdAt: -1 })
            .limit(reportFetchLimit)
            .lean()
        : Promise.resolve([]),
    ]);

    const reportOrders = [
      ...onlineReportOrders.map((order) => ({
        _id: String(order._id),
        orderId: order.orderId,
        orderType: "Online",
        customerName: order.customerId?.name || "—",
        salesperson: null,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        paymentMethod: order.payment?.method || "—",
        paymentStatus: order.payment?.status || "—",
        status: order.orderStatus || "—",
        grossProfit: calculateOrderGrossProfit(order.items),
      })),
      ...offlineReportOrders.map((order) => ({
        _id: String(order._id),
        orderId: order.orderId,
        orderType: "Offline",
        customerName: order.customerName || "Walk-in Customer",
        salesperson: order.salesperson || "—",
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod || "—",
        paymentStatus: null,
        status: order.status || "—",
        grossProfit: calculateOrderGrossProfit(order.items),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(reportSkip, reportSkip + reportLimit);

    const stockData = stockSummary[0] || {
      lowStock: 0,
      highStock: 0,
      totalProducts: 0,
    };

    res.json({
      success: true,
      data: {
        salesReport: includeReport
          ? {
              period: reportRange.period,
              from: reportRange.from,
              to: reportRange.to,
              totalSales: reportMetrics.totalSales,
              onlineSales: reportMetrics.onlineSales,
              offlineSales: reportMetrics.offlineSales,
              totalOrders: reportMetrics.totalOrders,
              onlineOrdersCount: reportMetrics.onlineOrders,
              offlineOrdersCount: reportMetrics.offlineOrders,
              totalGrossProfit: reportMetrics.totalGrossProfit,
              onlineGrossProfit: reportMetrics.onlineGrossProfit,
              offlineGrossProfit: reportMetrics.offlineGrossProfit,
              profitUnavailableOrders: {
                total: reportMetrics.totalProfitUnavailableOrders,
                online: reportMetrics.onlineProfitUnavailableOrders,
                offline: reportMetrics.offlineProfitUnavailableOrders,
              },
              orders: reportOrders,
              pagination: {
                currentPage: reportPage,
                limit: reportLimit,
                totalOrders: reportMetrics.totalOrders,
                totalPages: Math.ceil(reportMetrics.totalOrders / reportLimit),
              },
            }
          : undefined,
        sales: {
          total: allTimeMetrics.totalSales,
          onlineTotal: allTimeMetrics.onlineSales,
          offlineTotal: allTimeMetrics.offlineSales,
          today: todayMetrics.totalSales,
          yesterday: yestMetrics.totalSales,
          thisMonth: thisMonthMetrics.totalSales,
          lastMonth: lastMonthMetrics.totalSales,
          percentage: calcPct(
            todayMetrics.totalSales,
            yestMetrics.totalSales,
          ),
        },
        orders: {
          total: allTimeMetrics.totalOrders,
          onlineTotal: allTimeMetrics.onlineOrders,
          offlineTotal: allTimeMetrics.offlineOrders,
          today: todayMetrics.totalOrders,
          yesterday: yestMetrics.totalOrders,
          thisMonth: thisMonthMetrics.totalOrders,
          lastMonth: lastMonthMetrics.totalOrders,
          percentage: calcPct(todayMetrics.totalOrders, yestMetrics.totalOrders),
        },
        customers: {
          total: totalCustomers,
          newToday: todayCusts,
          yesterday: yestCusts,
          percentage: calcPct(todayCusts, yestCusts),
        },
        products: {
          total: stockData.totalProducts,
          lowStockCount: stockData.lowStock,
          highStockCount: stockData.highStock,
          lowStockTop5: lowStockProducts,
          highStockTop5: highStockProducts,
        },
      },
    });
  } catch (err) {
    console.error("getSalesSummary error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: err.message,
    });
  }
};
/* ─────────────────────────────────────────────
   CUSTOMER SATISFACTION
───────────────────────────────────────────── */
export const getCustomerSatisfaction = async (req, res) => {
  try {
    const chartData = await Promise.all(
      last6Days().map(async (d) => {
        const daySnapshot = new Date(d);

        const s = startOfDay(new Date(daySnapshot));
        const e = endOfDay(new Date(daySnapshot));

        const lastDayCopy = new Date(daySnapshot);
        lastDayCopy.setDate(lastDayCopy.getDate() - 7);
        const lastStart = startOfDay(lastDayCopy);
        const lastEnd = endOfDay(new Date(lastDayCopy));

        const [today, lastWeek] = await Promise.all([
          Order.countDocuments({
            createdAt: { $gte: s, $lte: e },
            orderStatus: "delivered",
          }),
          Order.countDocuments({
            createdAt: { $gte: lastStart, $lte: lastEnd },
            orderStatus: "delivered",
          }),
        ]);

        return {
          name: DAY_NAMES[s.getDay()],
          today,
          lastWeek,
        };
      }),
    );

    const [curAgg, lastAgg] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth() },
            "payment.status": "captured",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfLastMonth(),
              $lte: endOfLastMonth(),
            },
            "payment.status": "captured",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json({
      chartData,
      summary: {
        currentMonthRevenue: curAgg[0]?.total ?? 0,
        lastMonthRevenue: lastAgg[0]?.total ?? 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ─────────────────────────────────────────────
   VOLUME SERVICE
───────────────────────────────────────────── */
export const getVolumeService = async (req, res) => {
  try {
    const chartData = await Promise.all(
      last6Months().map(async (d) => {
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(
          d.getFullYear(),
          d.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

        const [volume, delivered] = await Promise.all([
          Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Order.countDocuments({
            createdAt: { $gte: start, $lte: end },
            orderStatus: "delivered",
          }),
        ]);

        return {
          name: MONTH_NAMES[d.getMonth()],
          totalOrders: volume,
          deliveredOrders: delivered,
        };
      }),
    );

    const totals = chartData.reduce(
      (acc, cur) => ({
        totalOrders: acc.totalOrders + cur.totalOrders,
        deliveredOrders: acc.deliveredOrders + cur.deliveredOrders,
      }),
      { totalOrders: 0, deliveredOrders: 0 },
    );

    res.json({ chartData, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ─────────────────────────────────────────────
   REVENUE (ONLINE VS OFFLINE)
───────────────────────────────────────────── */
export const getRevenue = async (req, res) => {
  try {
    const weeklyChartData = await Promise.all(
      last6Days().map(async (d) => {
        const daySnap = new Date(d);
        const s = startOfDay(new Date(daySnap));
        const e = endOfDay(new Date(daySnap));

        const [onlineAgg, codAgg] = await Promise.all([
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: s, $lte: e },
                "payment.method": "razorpay",
                "payment.status": "captured",
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: s, $lte: e },
                "payment.method": "cod",
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
        ]);

        return {
          name: DAY_NAMES[s.getDay()],
          onlineRevenue: onlineAgg[0]?.total ?? 0,
          codRevenue: codAgg[0]?.total ?? 0,
        };
      }),
    );

    // ─── MONTHLY — last 6 months ────────────────────────────────────
    const monthlyChartData = await Promise.all(
      last6Months().map(async (d) => {
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(
          d.getFullYear(),
          d.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

        const [onlineAgg, codAgg] = await Promise.all([
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
                "payment.method": "razorpay",
                "payment.status": "captured",
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
                "payment.method": "cod",
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
        ]);

        return {
          name: MONTH_NAMES[d.getMonth()],
          onlineRevenue: onlineAgg[0]?.total ?? 0,
          codRevenue: codAgg[0]?.total ?? 0,
        };
      }),
    );

    // ─── YEARLY — last 6 years ──────────────────────────────────────
    const currentYear = new Date().getFullYear();
    const last6Years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

    const yearlyChartData = await Promise.all(
      last6Years.map(async (year) => {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);

        const [onlineAgg, codAgg] = await Promise.all([
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
                "payment.method": "razorpay",
                "payment.status": "captured",
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
                "payment.method": "cod",
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
        ]);

        return {
          name: String(year),
          onlineRevenue: onlineAgg[0]?.total ?? 0,
          codRevenue: codAgg[0]?.total ?? 0,
        };
      }),
    );

    // ─── LAST MONTH summary ─────────────────────────────────────────
    const [lastMonthOnlineAgg, lastMonthCodAgg] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth(), $lte: endOfLastMonth() },
            "payment.method": "razorpay",
            "payment.status": "captured",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth(), $lte: endOfLastMonth() },
            "payment.method": "cod",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    // ─── LAST WEEK summary ──────────────────────────────────────────
    const now = new Date();
    const lastWeekStart = startOfDay(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
    );
    const lastWeekEnd = endOfDay(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    );

    const [lastWeekOnlineAgg, lastWeekCodAgg] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
            "payment.method": "razorpay",
            "payment.status": "captured",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
            "payment.method": "cod",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json({
      weeklyChartData,
      chartData: monthlyChartData,
      yearlyChartData,
      summary: {
        lastMonth: {
          onlineRevenue: lastMonthOnlineAgg[0]?.total ?? 0,
          codRevenue: lastMonthCodAgg[0]?.total ?? 0,
          total:
            (lastMonthOnlineAgg[0]?.total ?? 0) +
            (lastMonthCodAgg[0]?.total ?? 0),
        },
        lastWeek: {
          onlineRevenue: lastWeekOnlineAgg[0]?.total ?? 0,
          codRevenue: lastWeekCodAgg[0]?.total ?? 0,
          total:
            (lastWeekOnlineAgg[0]?.total ?? 0) +
            (lastWeekCodAgg[0]?.total ?? 0),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ─────────────────────────────────────────────
   TOP PRODUCTS
───────────────────────────────────────────── */
export const getTopProducts = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.qty" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    const maxQty = result[0]?.totalQty ?? 1;

    const products = result.map((p) => ({
      productId: p._id,
      name: p.name,
      totalSold: p.totalQty,
      percentage: Math.round((p.totalQty / maxQty) * 100),
    }));

    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
