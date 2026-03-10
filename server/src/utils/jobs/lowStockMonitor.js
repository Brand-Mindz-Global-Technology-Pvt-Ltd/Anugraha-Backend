import cron from "node-cron";
import Product from "../../Models/Product.js";
import { sendLowStockMail } from "../sendLowStockMail.js";
import { sendOutOfStockMail } from "../sendOutOfStockMail.js";

const LOW_STOCK_LIMIT = 10;

// 5 min, 1 hour, 24 hours
const ALERT_INTERVALS = [
  5 * 60 * 1000,
  60 * 60 * 1000,
  24 * 60 * 60 * 1000,
];

/* =========================
   LOG HELPERS
========================= */
const logLowStock = (product) => {
  console.log(
    `[LOW STOCK] Email sent | Product: ${product.name} | Stock: ${product.stock}`
  );
};

const logOutOfStock = (product) => {
  console.log(
    `[OUT OF STOCK] Email sent | Product: ${product.name} | Stock: 0`
  );
};

/* =========================
   ALERT DECISION
========================= */
const shouldSendLowStockMail = (product) => {
  const alert = product.lowStockAlert;

  // First alert
  if (!alert.lastSentAt) return true;

  // Stock increased → stop alerts
  if (product.stock > alert.lastAlertStock) return false;

  const elapsed = Date.now() - new Date(alert.lastSentAt).getTime();

  return ALERT_INTERVALS.some(interval => elapsed >= interval);
};

/* =========================
   CRON JOB
========================= */
cron.schedule("* * * * *", async () => {
  try {
    const products = await Product.find({
      stock: { $lte: LOW_STOCK_LIMIT },
    });

    for (const product of products) {
      const alert = product.lowStockAlert;

      /* ❌ OUT OF STOCK */
      if (product.stock === 0 && !alert.outOfStockSent) {
        await sendOutOfStockMail(product);

        alert.outOfStockSent = true;
        alert.lastSentAt = new Date();
        alert.lastAlertStock = 0;

        await product.save();
        logOutOfStock(product);
        continue;
      }

      /* ⚠️ LOW STOCK */
      if (product.stock > 0) {
        const sendMail = shouldSendLowStockMail(product);
        if (!sendMail) continue;

        await sendLowStockMail(product);

        alert.lastSentAt = new Date();
        alert.lastAlertStock = product.stock;

        await product.save();
        logLowStock(product);
      }
    }

    if (products.length) {
      console.log(
        `[CRON] Checked ${products.length} products at ${new Date().toISOString()}`
      );
    }
  } catch (error) {
    console.error("Low stock monitor error:", error.message);
  }
});
