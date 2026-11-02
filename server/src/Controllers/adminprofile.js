import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import Admin from "../Models/admin.js";

export const changeAdminPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // 1. Basic validation
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password are required",
      });
    }

    // 2. Match validation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // 3. Strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // 5. Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // 6. Hash & save password
    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Password update failed",
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { adminId } = req.params;

    /* ---------- GUARD: no data provided ---------- */
    if (!req.body && !req.file) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    /* ---------- FIND ADMIN ---------- */
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const update = {};

    /* ---------- PROFILE TEXT ---------- */
    ["firstName", "lastName", "phone"].forEach((field) => {
      if (req.body && req.body[field] !== undefined) {
        update[`profile.${field}`] = req.body[field];
      }
    });

    /* ---------- PROFILE IMAGE (local disk storage) ---------- */
    if (req.file) {
      // Delete old image from disk if one existed
      const oldKey = admin.profile?.profileImage?.key;
      if (oldKey) {
        const oldFilePath = path.join(process.cwd(), "uploads", oldKey);
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.warn("Old profile image not found on disk, skipping delete:", oldKey);
        }
      }

      update["profile.profileImage"] = {
        key: `profile/${req.file.filename}`,
        url: `/uploads/profile/${req.file.filename}`,
      };
    }

    /* ---------- UPDATE ---------- */
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

export const AdminProfile = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const admin = await Admin.findById(adminId).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json(admin);
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    return res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};
