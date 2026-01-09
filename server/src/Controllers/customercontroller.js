// src/controllers/customer.controller.js
import Customer from "../Models/customer.js";

/* ================= GET CUSTOMERS ================= */
export const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "All Status",
    } = req.query;
    const query = { isDeleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== "All Status") {
      query.status = status;
    }
    const skip = (Number(page) - 1) * Number(limit);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const total = await Customer.countDocuments(query);
    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

/* ================= CREATE CUSTOMER ================= */
export const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(400).json({
      success: false,
      message: error.code === 11000 ? "Email already exists" : error.message,
    });
  }
};

/* ================= UPDATE CUSTOMER ================= */
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= SOFT DELETE CUSTOMER ================= */
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};
