import bcrypt from "bcryptjs";
import Admin from "../Models/admin.js";
import s3 from "../Config/s3.js";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "../Config/env.js";

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
      if (req.body[field]) {
        update[`profile.${field}`] = req.body[field];
      }
    });

    /* ---------- SOCIAL LINKS ---------- */
    [
      "facebook",
      "instagram",
      "linkedin",
      "twitter",
      "github",
      "website",
    ].forEach((field) => {
      if (req.body[field]) {
        update[`profile.socialLinks.${field}`] = req.body[field];
      }
    });

    /* ---------- PROFILE IMAGE ---------- */
    if (req.file) {
      const oldKey = admin.profile?.profileImage?.key;

      if (oldKey) {
        try {
          await s3.send(
            new HeadObjectCommand({
              Bucket: ENV.AWS_BUCKET_NAME,
              Key: oldKey,
            })
          );

          await s3.send(
            new DeleteObjectCommand({
              Bucket: ENV.AWS_BUCKET_NAME,
              Key: oldKey,
            })
          );
        } catch (err) {
          console.warn("Old image not found or already deleted:", oldKey);
        }
      }

      update["profile.profileImage"] = {
        key: req.file.key,
        url: req.file.location,
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
