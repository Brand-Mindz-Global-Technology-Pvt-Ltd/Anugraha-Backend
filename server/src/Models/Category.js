import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    image: {
      key: {
        type: String,
        trim: true,
        default: "",
      },
      url: {
        type: String,
        trim: true,
        default: "",
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);


categorySchema.index(
  { adminId: 1, slug: 1 },
  { unique: true }
);

export default mongoose.model("Category", categorySchema);
