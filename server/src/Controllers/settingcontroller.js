import { CompanySettings, Terms, Privacy, Cookie } from "../Models/settings.js";
import mongoose from "mongoose";

export const getCompanySettings = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
      });
    }

    const company = await CompanySettings.findOne({ adminId });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company settings not found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("GET Company Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const saveCompanySettings = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
      });
    }

    const companyName = req.body?.companyName;
    const email = req.body?.email;
    const phone = req.body?.phone;
    const address = req.body?.address;

    let company = await CompanySettings.findOne({ adminId });

    if (!company) {
      company = new CompanySettings({ adminId });
    }

    company.companyName = companyName;
    company.email = email;
    company.phone = phone || "";
    company.address = address || "";
    company.updatedBy = adminId;

    if (req.file) {
      company.logo = req.file.location;
    }

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company settings saved successfully",
      data: company,
    });
  } catch (error) {
    console.error("Save Company Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving company settings",
    });
  }
};

export const getTerms = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
      });
    }

    // Find the active terms for this admin
    const terms = await Terms.findOne({ adminId, isActive: true })
      .sort({ version: -1 }); 

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: "Terms and conditions not found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      data: terms,
    });
  } catch (error) {
    console.error("GET Terms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const saveTerms = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
      });
    }

    const { title, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    let terms = await Terms.findOne({ adminId, isActive: true });

    if (terms) {
      terms.title = title || "Terms and Conditions";
      terms.content = content;
      await terms.save();
    } else {
      terms = await Terms.create({
        adminId,
        title: title || "Terms and Conditions",
        content,
        version: 1,
        isActive: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Terms and conditions saved successfully",
      data: terms,
    });
  } catch (error) {
    console.error("Save Terms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving terms and conditions",
    });
  }
};

export const getPrivacy = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
      });
    }

    const privacy = await Privacy.findOne({
      adminId,
      isActive: true,
    }).sort({ version: -1 });

    if (!privacy) {
      return res.status(404).json({
        success: false,
        message: "Privacy policy not found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      data: privacy,
    });
  } catch (error) {
    console.error("GET Privacy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const savePrivacy = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
      });
    }

    const { title, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Privacy content is required",
      });
    }

    let privacy = await Privacy.findOne({
      adminId,
      isActive: true,
    });

    if (privacy) {
      privacy.title = title?.trim() || "Privacy Policy";
      privacy.content = content.trim();
      await privacy.save();
    } else {
      privacy = await Privacy.create({
        adminId,
        title: title?.trim() || "Privacy Policy",
        content: content.trim(),
        version: 1,
        isActive: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Privacy policy saved successfully",
      data: privacy,
    });
  } catch (error) {
    console.error("Save Privacy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving privacy policy",
    });
  }
};

export const getCookie = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
      });
    }

    const cookie = await Cookie.findOne({
      adminId,
      isActive: true,
    }).sort({ version: -1 });

    if (!cookie) {
      return res.status(404).json({
        success: false,
        message: "Cookie policy not found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      data: cookie,
    });
  } catch (error) {
    console.error("GET Cookie Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const saveCookie = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
      });
    }

    const { title, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Cookie content is required",
      });
    }

    let cookie = await Cookie.findOne({
      adminId,
      isActive: true,
    });

    if (cookie) {
      cookie.title = title?.trim() || "Cookie Policy";
      cookie.content = content.trim();
      await cookie.save();
    } else {
      cookie = await Cookie.create({
        adminId,
        title: title?.trim() || "Cookie Policy",
        content: content.trim(),
        version: 1,
        isActive: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cookie policy saved successfully",
      data: cookie,
    });
  } catch (error) {
    console.error("Save Cookie Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving cookie policy",
    });
  }
};