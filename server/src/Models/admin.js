import mongoose from "mongoose";

/* ------------------------------- Admin -------------------------------- */

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN"],
      default: "SUPER_ADMIN",
    },

    profile: {
      firstName: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50,
        default: "",
      },
      lastName: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50,
        default: "",
      },

      /* ---------- Profile Image ---------- */
      profileImage: {
        key: {
          type: String,
          trim: true,
          default: "",
        },
        url: {
          type: String,
          trim: true,
          default: "https://prourls.link/9hrWiS",
        },
      },

      phone: {
        type: String,
        trim: true,
        default: "",
      },

      /* ---------- Social Links (single fields) ---------- */
      socialLinks: {
        facebook: {
          type: String,
          trim: true,
          default: "",
        },

        instagram: {
          type: String,
          trim: true,
          default: "",
        },

        linkedin: {
          type: String,
          trim: true,
          default: "",
        },

        twitter: {
          type: String,
          trim: true,
          default: "",
        },

        github: {
          type: String,
          trim: true,
          default: "",
        },

        website: {
          type: String,
          trim: true,
          default: "",
        },
      },
    },

    /* ------------------------------- Meta ------------------------------- */

    lastLoginAt: {
      type: Date,
      default: null,
    },

    acceptTerms: {
      type: Boolean,
      required: true,
      validate: {
        validator: (v) => v === true,
        message: "Terms & Conditions must be accepted",
      },
    },

    acceptedTermsAt: {
      type: Date,
      default: Date.now,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Admin", adminSchema);
