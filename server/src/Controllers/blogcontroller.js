import fs from "fs/promises";
import path from "path";
import slugify from "slugify";
import Blog from "../Models/Blog.js";

const normalizeSlug = (value) =>
  slugify(value || "", { lower: true, strict: true, trim: true }).slice(0, 180);

const getUploadedImage = (files, fieldName) =>
  files?.[fieldName]?.[0]
    ? `/uploads/blogs/${files[fieldName][0].filename}`
    : undefined;

const parsePublishDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const removeUploadedImage = async (imageUrl) => {
  if (!imageUrl?.startsWith("/uploads/blogs/")) return;
  const filename = path.basename(imageUrl);
  if (!filename || filename === "." || filename === "..") return;

  try {
    await fs.unlink(path.join(process.cwd(), "uploads", "blogs", filename));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to remove blog image:", error);
    }
  }
};

const removeRequestImages = async (files) => {
  const uploadedFiles = Object.values(files || {}).flat();
  await Promise.all(
    uploadedFiles.map((file) => removeUploadedImage(`/uploads/blogs/${file.filename}`))
  );
};

const rejectBlogRequest = async (req, res, message) => {
  await removeRequestImages(req.files);
  return res.status(400).json({ success: false, message });
};

const cleanReplacedImages = async (
  oldFeaturedImage,
  oldOpenGraphImage,
  featuredImage,
  openGraphImage
) => {
  const oldImages = [];
  if (featuredImage && featuredImage !== oldFeaturedImage) {
    oldImages.push(oldFeaturedImage);
  }
  if (openGraphImage && openGraphImage !== oldOpenGraphImage) {
    oldImages.push(oldOpenGraphImage);
  }
  await Promise.all(oldImages.map(removeUploadedImage));
};

const respondWithError = (res, error, action) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A blog with this URL slug already exists",
    });
  }

  console.error(`${action} Blog Error:`, error);
  return res.status(500).json({
    success: false,
    message: `Failed to ${action.toLowerCase()} blog`,
  });
};

export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ adminId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    return respondWithError(res, error, "Fetch");
  }
};

export const createBlog = async (req, res) => {
  try {
    const {
      title = "",
      slug = "",
      imageAltText = "",
      category = "",
      shortDescription = "",
      content = "",
      author = "",
      status = "draft",
      metaTitle = "",
      metaDescription = "",
      focusKeyword = "",
    } = req.body;

    if (!title.trim() || !category.trim()) {
      return rejectBlogRequest(req, res, "Blog title and category are required");
    }
    if (!["draft", "published"].includes(status)) {
      return rejectBlogRequest(req, res, "Invalid blog status");
    }
    if (status === "published" && !content.trim()) {
      return rejectBlogRequest(req, res, "Blog content is required to publish");
    }
    if (status === "published" && !getUploadedImage(req.files, "featuredImage")) {
      return rejectBlogRequest(req, res, "A featured image is required to publish");
    }

    const blogSlug = normalizeSlug(slug || title);
    if (!blogSlug) {
      return rejectBlogRequest(req, res, "A valid URL slug is required");
    }

    const publishDate = parsePublishDate(req.body.publishDate);
    if (publishDate === undefined) {
      return rejectBlogRequest(req, res, "Invalid publish date");
    }

    const blog = await Blog.create({
      adminId: req.user.id,
      title: title.trim(),
      slug: blogSlug,
      featuredImage: getUploadedImage(req.files, "featuredImage") || "",
      imageAltText: imageAltText.trim(),
      category: category.trim(),
      shortDescription: shortDescription.trim(),
      content,
      author: author.trim(),
      publishDate: status === "published" ? publishDate || new Date() : publishDate,
      status,
      seo: {
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        focusKeyword: focusKeyword.trim(),
        openGraphImage: getUploadedImage(req.files, "openGraphImage") || "",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    await removeRequestImages(req.files);
    return respondWithError(res, error, "Create");
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!blog) {
      await removeRequestImages(req.files);
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const {
      title = "",
      slug = "",
      imageAltText = "",
      category = "",
      shortDescription = "",
      content = "",
      author = "",
      status = blog.status,
      metaTitle = "",
      metaDescription = "",
      focusKeyword = "",
    } = req.body;

    if (!title.trim() || !category.trim()) {
      return rejectBlogRequest(req, res, "Blog title and category are required");
    }
    if (!["draft", "published"].includes(status)) {
      return rejectBlogRequest(req, res, "Invalid blog status");
    }
    if (status === "published" && !content.trim()) {
      return rejectBlogRequest(req, res, "Blog content is required to publish");
    }

    const blogSlug = normalizeSlug(slug || title);
    if (!blogSlug) {
      return rejectBlogRequest(req, res, "A valid URL slug is required");
    }

    const publishDate = Object.hasOwn(req.body, "publishDate")
      ? parsePublishDate(req.body.publishDate)
      : blog.publishDate;
    if (publishDate === undefined) {
      return rejectBlogRequest(req, res, "Invalid publish date");
    }

    const oldFeaturedImage = blog.featuredImage;
    const oldOpenGraphImage = blog.seo?.openGraphImage || "";
    const featuredImage = getUploadedImage(req.files, "featuredImage") || blog.featuredImage;
    const openGraphImage =
      getUploadedImage(req.files, "openGraphImage") || blog.seo?.openGraphImage || "";
    if (status === "published" && !featuredImage) {
      return rejectBlogRequest(req, res, "A featured image is required to publish");
    }

    blog.set({
      title: title.trim(),
      slug: blogSlug,
      featuredImage,
      imageAltText: imageAltText.trim(),
      category: category.trim(),
      shortDescription: shortDescription.trim(),
      content,
      author: author.trim(),
      publishDate:
        status === "published" ? publishDate || new Date() : publishDate,
      status,
      seo: {
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        focusKeyword: focusKeyword.trim(),
        openGraphImage,
      },
    });
    await blog.save();
    await cleanReplacedImages(
      oldFeaturedImage,
      oldOpenGraphImage,
      featuredImage,
      openGraphImage
    );

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    await removeRequestImages(req.files);
    return respondWithError(res, error, "Update");
  }
};

export const updateBlogStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid blog status" });
    }

    const blog = await Blog.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    if (status === "published" && !blog.content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog content is required to publish",
      });
    }
    if (status === "published" && !blog.featuredImage) {
      return res.status(400).json({
        success: false,
        message: "A featured image is required to publish",
      });
    }

    blog.status = status;
    if (status === "published" && !blog.publishDate) {
      blog.publishDate = new Date();
    }
    await blog.save();

    return res.status(200).json({
      success: true,
      message: status === "published" ? "Blog published successfully" : "Blog saved as draft",
      data: blog,
    });
  } catch (error) {
    return respondWithError(res, error, "Update status for");
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      adminId: req.user.id,
    });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await Promise.all([
      removeUploadedImage(blog.featuredImage),
      removeUploadedImage(blog.seo?.openGraphImage),
    ]);

    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    return respondWithError(res, error, "Delete");
  }
};

export const getPublishedBlogs = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const blogs = await Blog.find({
      status: "published",
      $or: [{ publishDate: { $lte: new Date() } }, { publishDate: null }],
    })
      .select("title slug featuredImage imageAltText category shortDescription author publishDate seo")
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    return respondWithError(res, error, "Fetch published");
  }
};

export const getPublishedBlogBySlug = async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug);
    const blog = await Blog.findOne({
      slug,
      status: "published",
      $or: [{ publishDate: { $lte: new Date() } }, { publishDate: null }],
    }).lean();

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    return respondWithError(res, error, "Fetch published");
  }
};
