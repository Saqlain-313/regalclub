const mongoose = require("mongoose");

// ============================================================
// ACTIVITY BANNERS + REFERRAL SHARE IMAGE
// - banners      -> /activity page ke reward cards (admin managed)
// - referralShareImage -> image shared with the /promo referral link
//   image (admin managed)
// ============================================================

const activityBannerItemSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    // where to navigate on click, e.g. "/deposit", "/promo", "/matka"
    navigateTo: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

const activityBannerSchema = new mongoose.Schema(
  {
    banners: {
      type: [activityBannerItemSchema],
      default: [],
    },
    // Image shared along with "Your Referral Link"
    referralShareImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "ActivityBanner",
  activityBannerSchema,
);
