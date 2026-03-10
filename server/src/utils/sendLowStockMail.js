import { sendMail } from "./mailer.js";
import { ENV } from "../Config/env.js";

export const sendLowStockMail = async (product) => {
  await sendMail({
    to: ENV.GMAIL_USER,
    subject: `⚠️ Low Stock Alert – ${product.name}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
                  background-color: #f4f6f8; padding: 24px;">
        
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; 
                    border-radius: 10px; overflow: hidden; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background: #dc2626; color: #ffffff; padding: 16px 24px;">
            <h2 style="margin: 0; font-size: 20px;"> Low Stock Alert</h2>
          </div>

          <!-- Content -->
          <div style="padding: 24px; color: #1f2937;">
            <p style="margin-top: 0; font-size: 15px;">
              Attention required. The following product is running low on stock:
            </p>

            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px;">
                <strong>Product Name:</strong> ${product.name}
              </p>
              <p style="margin: 0;">
                <strong>Remaining Stock:</strong>
                <span style="color: #dc2626; font-weight: 600;">
                  ${product.stock}
                </span>
              </p>
            </div>

            <p style="font-size: 14px; color: #374151;">
              Please restock this item as soon as possible to avoid order disruptions.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 14px 24px; 
                      font-size: 12px; color: #6b7280; text-align: center;">
            This is an automated alert from your inventory system.
          </div>
        </div>
      </div>
    `,
  });
};

