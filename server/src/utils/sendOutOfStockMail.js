import { sendMail } from "./mailer.js";
import { ENV } from "../Config/env.js";

export const sendOutOfStockMail = async (product) => {
  return sendMail({
    to: ENV.GMAIL_USER,
    subject: `❌ OUT OF STOCK - ${product.name}`,
    html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#dc2626; color:#ffffff; padding:16px 20px;">
        <h2 style="margin:0; font-size:20px;">🚨 Out of Stock Alert</h2>
      </div>

      <!-- Body -->
      <div style="padding:20px;">
        <p style="font-size:15px; margin:0 0 10px;">
          The following product is now <b style="color:#dc2626;">out of stock</b>.
        </p>

        <table style="width:100%; border-collapse:collapse; margin-top:12px;">
          <tr>
            <td style="padding:8px; background:#f9fafb; font-weight:bold; width:40%;">
              Product Name
            </td>
            <td style="padding:8px; background:#f9fafb;">
              ${product.name}
            </td>
          </tr>
          <tr>
            <td style="padding:8px; font-weight:bold;">
              Current Stock
            </td>
            <td style="padding:8px; color:#dc2626; font-weight:bold;">
              0
            </td>
          </tr>
        </table>

        <p style="margin-top:16px; font-size:14px; color:#374151;">
          Please restock this product as soon as possible to avoid missed sales.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb; padding:12px 20px; font-size:12px; color:#6b7280; text-align:center;">
        Stock Monitoring System
      </div>

    </div>
  </div>
`,
  });
};
