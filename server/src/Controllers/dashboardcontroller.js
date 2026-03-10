import Order from "../Models/Order.js";
import Customer from "../Models/Customer.js";
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

export const getSalesSummary = async (req, res) => {
  try {
    const now = new Date();

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

    const successStatuses = [
      "captured",
      "paid",
      "success",
      "completed",
      "CAPTURED",
      "PAID",
      "SUCCESS",
      "COMPLETED",
    ];

    const [
      allTimeSalesAgg,
      allTimeOrders,
      todaySalesAgg,
      yestSalesAgg,
      todayOrders,
      yestOrders,
      thisMonthSalesAgg,
      lastMonthSalesAgg,
      thisMonthOrders,
      lastMonthOrders,
      todayCusts,
      yestCusts,
      totalCustomers,
      stockSummary,
      lowStockProducts,
      highStockProducts,
    ] = await Promise.all([
      // ───── SALES ─────
      Order.aggregate([
        { $match: { "payment.status": { $in: successStatuses } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Order.countDocuments(),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: todayS, $lte: todayE },
            "payment.status": { $in: successStatuses },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: yestS, $lte: yestE },
            "payment.status": { $in: successStatuses },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Order.countDocuments({ createdAt: { $gte: todayS, $lte: todayE } }),
      Order.countDocuments({ createdAt: { $gte: yestS, $lte: yestE } }),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thisMonthS, $lte: thisMonthE },
            "payment.status": { $in: successStatuses },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: lastMonthS, $lte: lastMonthE },
            "payment.status": { $in: successStatuses },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Order.countDocuments({
        createdAt: { $gte: thisMonthS, $lte: thisMonthE },
      }),
      Order.countDocuments({
        createdAt: { $gte: lastMonthS, $lte: lastMonthE },
      }),

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
    ]);

    const stockData = stockSummary[0] || {
      lowStock: 0,
      highStock: 0,
      totalProducts: 0,
    };

    res.json({
      success: true,
      data: {
        sales: {
          total: allTimeSalesAgg[0]?.total ?? 0,
          today: todaySalesAgg[0]?.total ?? 0,
          yesterday: yestSalesAgg[0]?.total ?? 0,
          thisMonth: thisMonthSalesAgg[0]?.total ?? 0,
          lastMonth: lastMonthSalesAgg[0]?.total ?? 0,
          percentage: calcPct(
            todaySalesAgg[0]?.total ?? 0,
            yestSalesAgg[0]?.total ?? 0,
          ),
        },
        orders: {
          total: allTimeOrders,
          today: todayOrders,
          yesterday: yestOrders,
          thisMonth: thisMonthOrders,
          lastMonth: lastMonthOrders,
          percentage: calcPct(todayOrders, yestOrders),
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
