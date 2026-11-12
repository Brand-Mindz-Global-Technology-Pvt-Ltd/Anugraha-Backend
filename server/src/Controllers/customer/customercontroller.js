import Customer from "../../Models/customer.js";
import generateCustomerId from "../../utils/generateCustomerId.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../../Config/env.js";
import { sendMail } from "../../utils/mailer.js";
import crypto from "crypto";
import { exportToCSV, exportToExcel } from "../../utils/customerExport.js";

export const createCustomer = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exists = await Customer.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Customer already exists" });
    }

    const customerId = await generateCustomerId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      customerId,
      name,
      email,
      password: hashedPassword,
      phone: phone?.trim() || "",
    });

    res.status(201).json({
      message: "Customer created successfully",
      data: {
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const loginCustomer = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = (email || phone || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number and password are required",
      });
    }

    const isEmail = identifier.includes("@");

    const customer = await Customer.findOne(
      isEmail
        ? { email: identifier.toLowerCase() }
        : { phone: identifier }
    ).select("+password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (customer.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: customer._id,
        role: "customer",
      },
      ENV.Customer_JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: customer._id,
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(200).json({
        message: "If the email exists, a reset link has been sent",
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    customer.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    customer.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    await customer.save({ validateBeforeSave: false });

    const resetUrl = `${ENV.Customer_FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("Reset URL:", resetUrl);
    const html = `
      <h2>Hello ${customer.name},</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p><b>This link expires in 15 minutes.</b></p>
      <p>If you did not request this, ignore this email.</p>
      <br/>
      <p>— Support Team</p>
    `;

    await sendMail({
      to: customer.email,
      subject: "Reset your password",
      html,
    });

    res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const customer = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!customer) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    customer.password = await bcrypt.hash(password, 10);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpire = undefined;

    await customer.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed" });
  }
};


export const getAllCustomers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const { search, name, email, customerId } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (name) query.name = { $regex: name, $options: "i" };
    if (email) query.email = { $regex: email, $options: "i" };
    if (customerId) query.customerId = customerId;

    const { status } = req.query;
    const allowedStatuses = ["Active", "Inactive", "Blocked"];
    if (status && allowedStatuses.includes(status)) {
      query.status = status;
    }

    const SORTABLE_FIELDS = { customerId: 1, name: 1 };

    const sortField = SORTABLE_FIELDS[req.query.sortBy]
      ? req.query.sortBy
      : null;
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const sortStage = sortField
      ? { [sortField]: sortOrder }
      : { createdAt: -1 };

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .select("-password")
        .sort(sortStage)
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        count: customers.length,
      },
      data: customers,
    });
  } catch (error) {
    console.error("[getAllCustomers]", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["Active", "Inactive", "Blocked"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer status updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const exportCustomers = async (req, res) => {
  try {
    const { type, ids } = req.query;
    const query = ids ? { _id: { $in: ids.split(",") } } : {};
    const customers = await Customer.find(query).lean();
    if (!customers.length) {
      return res.status(404).json({ message: "No customers found" });
    }

    // CSV Export
    if (type === "csv") {
      const csv = exportToCSV(customers);

      res.header("Content-Type", "text/csv");
      res.attachment("customers.csv");
      return res.send(csv);
    }

    //     // Excel Export
    if (type === "excel") {
      const workbook = await exportToExcel(customers);

      res.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.attachment("customers.xlsx");

      await workbook.xlsx.write(res);
      return res.end();
    }

    return res.status(400).json({
      message: "Invalid export type. Use csv or excel",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET CUSTOMER PROFILE
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (customer.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        id: customer._id,
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE CUSTOMER PROFILE
export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (customer.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    customer.name = name.trim();

    if (phone !== undefined) {
      customer.phone = phone.trim();
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: customer._id,
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
