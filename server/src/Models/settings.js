import mongoose from "mongoose";
const { Schema } = mongoose;

const companySettingsSchema = new Schema(
  {
    companyName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    logo: {
      type: String, 
      default: null,
    },
  adminId: {
      type: Schema.Types.ObjectId, 
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const termsSchema = new Schema(
  {
    title: {
      type: String,
      default: "Terms and Conditions",
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


const privacySchema = new Schema(
  {
    title: {
      type: String,
      default: "Privacy Policy",
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const cookieSchema = new Schema(
  {
    title: {
      type: String,
      default: "Cookie Policy",
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

function autoIncrementVersion(next) {
  if (!this.isNew && this.isModified("content")) {
    this.version = this.version + 1;
  }
}

termsSchema.pre("save", autoIncrementVersion);
privacySchema.pre("save", autoIncrementVersion);
cookieSchema.pre("save", autoIncrementVersion);

companySettingsSchema.index({ adminId: 1 }, { unique: true });


export const CompanySettings = mongoose.model("CompanySettings", companySettingsSchema);
export const Terms = mongoose.model("Terms", termsSchema);
export const Privacy = mongoose.model("Privacy", privacySchema);
export const Cookie = mongoose.model("Cookie", cookieSchema);
