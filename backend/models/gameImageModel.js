// models/gameImageModel.js
//
// Admin-managed images for the popular game cards on the client home
// page (wingo / trading / mines / powerballs / matka). One document per
// game key — imageUrl points to the uploaded (imgbb) image.

const mongoose = require("mongoose");

const gameImageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameImage", gameImageSchema);
