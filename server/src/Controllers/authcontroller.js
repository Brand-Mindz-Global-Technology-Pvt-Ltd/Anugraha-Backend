import Admin from "../Models/admin.js";
import crypto from "crypto";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { sendMail } from "../utils/mailer.js";
import { resetPasswordTemplate } from "../utils/forgotpasswordtemplate.js";
import { ENV } from "../Config/env.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, acceptTerms } = req.body;
    if (!acceptTerms) {
      return res.status(400).json({
        message: "You must accept the Terms & Conditions",
      });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }
    const admin = await Admin.create({
      username,
      email,
      password: await hashPassword(password),
      acceptTerms,
    });

    res.status(201).json({
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      token: signToken({
        id: admin._id,
        role: admin.role,
      }),
    });
  } catch (error) {
    console.error("ADMIN REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    res.json({
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      token: signToken({
        id: admin._id,
        role: admin.role,
      }),
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.json({ message: "If account exists, email will be sent" });
  }
  const token = crypto.randomBytes(32).toString("hex");
  admin.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  admin.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await admin.save();

  const resetUrl = `${ENV.FRONTEND_URL}/auth/resetpassword/${token}`;

  await sendMail({
    to: admin.email,
    subject: "Reset your password",
    html: resetPasswordTemplate({
      username: admin.username,
      resetUrl,
    }),
  });

  res.json({ message: "Reset link sent to email" });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const admin = await Admin.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!admin) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  admin.password = await hashPassword(password);
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpire = undefined;

  await admin.save();

  res.json({ message: "Password reset successful" });
};

