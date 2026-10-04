const ActivityBanner = require("../models/activityBannerModel");
const uploadToImgBB = require("../utils/uploadToImgBB");

/* ============================================================
   HELPERS
============================================================ */

const getDoc = async () => {
  let doc = await ActivityBanner.findOne();
  if (!doc) {
    doc = await ActivityBanner.create({});
  }
  return doc;
};

/* ============================================================
   PUBLIC — for the /activity page and /promo sharing
   Returns only ACTIVE banners and the referral share image
============================================================ */

exports.getActivityContent = async (req, res) => {
  try {
    const doc = await ActivityBanner.findOne().lean();

    const banners = (doc?.banners || []).filter((b) => b.isActive);

    return res.json({
      success: true,
      banners,
      referralShareImage: doc?.referralShareImage || "",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to load activity content",
      error: err.message,
    });
  }
};

/* ============================================================
   ADMIN — full doc (?all=true — includes inactive banners)
============================================================ */

exports.getAllActivityContent = async (req, res) => {
  try {
    const doc = await getDoc();
    return res.json({
      success: true,
      banners: doc.banners || [],
      referralShareImage: doc.referralShareImage || "",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to load activity content",
      error: err.message,
    });
  }
};

/* ============================================================
   ADMIN — upload a new activity banner
============================================================ */

exports.uploadActivityBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const doc = await getDoc();

    if (doc.banners.length >= 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 activity banners allowed.",
      });
    }

    const image = await uploadToImgBB(req.file);

    doc.banners.push({
      image,
      title: req.body.title || "",
      navigateTo: req.body.navigateTo || "",
      isActive: true,
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "Activity banner uploaded successfully",
      banners: doc.banners,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Upload failed",
    });
  }
};

/* ============================================================
   ADMIN — banner update (title/navigateTo/image/isActive)
============================================================ */

exports.updateActivityBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await getDoc();

    const banner = doc.banners.id(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Activity banner not found",
      });
    }

    if (req.body.title !== undefined) banner.title = req.body.title;
    if (req.body.navigateTo !== undefined)
      banner.navigateTo = req.body.navigateTo;
    if (req.body.isActive !== undefined)
      banner.isActive = String(req.body.isActive) === "true";

    if (req.file) {
      banner.image = await uploadToImgBB(req.file);
    }

    await doc.save();

    return res.json({
      success: true,
      message: "Activity banner updated successfully",
      banners: doc.banners,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Update failed",
    });
  }
};

/* ============================================================
   ADMIN — banner delete
============================================================ */

exports.deleteActivityBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await getDoc();

    const banner = doc.banners.id(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Activity banner not found",
      });
    }

    banner.deleteOne();
    await doc.save();

    return res.json({
      success: true,
      message: "Activity banner deleted successfully",
      banners: doc.banners,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Delete failed",
    });
  }
};

/* ============================================================
   ADMIN — referral share image upload/replace
============================================================ */

exports.uploadReferralShareImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const image = await uploadToImgBB(req.file);

    const doc = await getDoc();
    doc.referralShareImage = image;
    await doc.save();

    return res.json({
      success: true,
      message: "Referral share image updated successfully",
      referralShareImage: doc.referralShareImage,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Upload failed",
    });
  }
};
