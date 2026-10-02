const Banners = require("../models/bannerModel");
const uploadToImgBB = require("../utils/uploadToImgBB");

exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    let bannerDoc = await Banners.findOne();

    if (!bannerDoc) {
      bannerDoc = await Banners.create({
        banners: [],
      });
    }

    if (bannerDoc.banners.length >= 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 banners allowed.",
      });
    }

    const image = await uploadToImgBB(req.file);

    bannerDoc.banners.push({
      image,
      title: req.body.title || "",
      isActive: true,
    });

    await bannerDoc.save();

    res.status(201).json({
      success: true,
      message: "Banner uploaded successfully",
      data: bannerDoc,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const bannersDoc = await Banners.findOne();

    let list = bannersDoc?.banners || [];

    // Public default: only ACTIVE banners.
    // Admin panel passes ?all=true to manage every banner.
    if (req.query.all !== "true") {
      list = list.filter((b) => b.isActive);
    }

    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const bannerDoc = await Banners.findOne();

    if (!bannerDoc) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    bannerDoc.banners = bannerDoc.banners.filter(
      (item) => item._id.toString() !== req.params.id
    );

    await bannerDoc.save();

    res.json({
      success: true,
      message: "Banner deleted successfully",
      data: bannerDoc,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const bannerDoc = await Banners.findOne();

    if (!bannerDoc) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const banner = bannerDoc.banners.id(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    if (req.file) {
      banner.image = await uploadToImgBB(req.file);
    }

    if (req.body.title !== undefined) {
      banner.title = req.body.title;
    }

    if (req.body.isActive !== undefined) {
      // FormData sends booleans as strings — normalize "false" correctly
      // (a plain assignment would treat the string "false" as truthy)
      banner.isActive =
        req.body.isActive === true || req.body.isActive === "true";
    }

    await bannerDoc.save();

    res.json({
      success: true,
      message: "Banner updated successfully",
      data: bannerDoc,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};