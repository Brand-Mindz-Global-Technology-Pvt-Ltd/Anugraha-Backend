import nodemailer from "nodemailer";
import { ENV } from "../Config/env.js";

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.GMAIL_USER,
    pass: ENV.GMAIL_APP_PASSWORD,
  },
});

export const sendMail = async ({ to, subject, html }) => {
  await mailer.sendMail({
    from: `"Admin Support" <${ENV.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
