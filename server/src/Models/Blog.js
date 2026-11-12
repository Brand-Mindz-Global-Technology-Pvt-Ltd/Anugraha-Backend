import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 180,
    },
    featuredImage: {
      type: String,
      default: "",
      trim: true,
    },
    imageAltText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    publishDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    seo: {
      metaTitle: { type: String, default: "", trim: true, maxlength: 200 },
      metaDescription: { type: String, default: "", trim: true, maxlength: 500 },
      focusKeyword: { type: String, default: "", trim: true, maxlength: 100 },
      openGraphImage: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ adminId: 1, createdAt: -1 });
blogSchema.index({ status: 1, publishDate: -1 });

export default mongoose.model("Blog", blogSchema);
