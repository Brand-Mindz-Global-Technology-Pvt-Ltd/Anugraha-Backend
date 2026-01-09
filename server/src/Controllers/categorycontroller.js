
import Category from "../Models/Category.js";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../Config/s3.js";
import { ENV } from "../Config/env.js";

/* =====================================================
   CREATE CATEGORY
===================================================== */
export const createCategory = async (req, res) => {
  try {
    const { adminId } = req.params; // ✅ ONLY SOURCE
    const { name, slug, parentId = null, status, metaTitle = "" } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    if (status && status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Category can only be created with active status",
      });
    }

    const image = req.file
      ? { key: req.file.key, url: req.file.location }
      : { key: "", url: "" };

    const category = await Category.create({
      adminId, // ✅ PARAM BASED
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      parentId,
      status: "active",
      metaTitle: metaTitle.trim(),
      image,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

/* =====================================================
   GET CATEGORIES (ADMIN – TREE)
===================================================== */
const buildTree = (categories, parentId = null) =>
  categories
    .filter((cat) => String(cat.parentId ?? null) === String(parentId))
    .map((cat) => ({
      ...cat,
      children: buildTree(categories, cat._id),
    }));

export const getCategories = async (req, res) => {
  try {
    const { adminId } = req.params; // ✅ ONLY SOURCE

    const categories = await Category.find({ adminId }).lean();
    const tree = buildTree(categories);

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: tree,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

/* =====================================================
   UPDATE CATEGORY
===================================================== */
export const updateCategory = async (req, res) => {
  try {
    const { adminId, id } = req.params; // ✅ ONLY SOURCE
    const { name, slug, parentId, status, metaTitle } = req.body;

    const category = await Category.findOne({ _id: id, adminId });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const updatePayload = {
      ...(name && { name: name.trim() }),
      ...(slug && { slug: slug.toLowerCase().trim() }),
      ...(parentId !== undefined && { parentId: parentId || null }),
      ...(status && { status }),
      ...(metaTitle && { metaTitle: metaTitle.trim() }),
    };

    /* ---------- IMAGE REPLACE ---------- */
    if (req.file) {
      const oldKey = category.image?.key;

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
        } catch {
          console.warn("Old category image not found:", oldKey);
        }
      }

      updatePayload.image = {
        key: req.file.key,
        url: req.file.location,
      };
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

/* =====================================================
   DELETE CATEGORY
===================================================== */
export const deleteCategory = async (req, res) => {
  try {
    const { adminId, id } = req.params; // ✅ ONLY SOURCE

    const category = await Category.findOne({ _id: id, adminId });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const imageKey = category.image?.key;
    if (imageKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: ENV.AWS_BUCKET_NAME,
            Key: imageKey,
          })
        );
      } catch {
        console.warn("Category image already deleted:", imageKey);
      }
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};
