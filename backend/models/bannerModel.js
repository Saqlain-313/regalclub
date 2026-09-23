const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const bannersSchema = new mongoose.Schema(
  {
    banners: {
      type: [bannerSchema],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= 10;
        },
        message: "Maximum 10 banners allowed.",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banners", bannersSchema);