const axios = require("axios");
const FormData = require("form-data");

const uploadToImgBB = async (file) => {
  try {
    if (!file) {
      throw new Error("Image file is required");
    }

    if (!file.buffer) {
      throw new Error("Image buffer is missing");
    }

    if (!process.env.IMGBB_API_KEY) {
      throw new Error(
        "IMGBB_API_KEY is not configured in .env"
      );
    }

    const form = new FormData();

    form.append(
      "image",
      file.buffer,
      {
        filename:
          file.originalname || "market-image.jpg",
        contentType:
          file.mimetype || "image/jpeg",
      }
    );

    const url =
      "https://api.imgbb.com/1/upload";

    const response = await axios.post(
      url,
      form,
      {
        params: {
          key: process.env.IMGBB_API_KEY,
        },

        headers: {
          ...form.getHeaders(),
        },

        maxContentLength: Infinity,
        maxBodyLength: Infinity,

        timeout: 60000,
      }
    );

    console.log(
      "ImgBB Upload Response:",
      response.data
    );

    if (
      !response.data ||
      !response.data.success ||
      !response.data.data?.url
    ) {
      throw new Error(
        response.data?.error?.message ||
          "ImgBB did not return image URL"
      );
    }

    return response.data.data.url;
  } catch (error) {
    console.error(
      "========== IMGBB UPLOAD ERROR =========="
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Response:",
      error.response?.data
    );

    console.error(
      "Message:",
      error.response?.data?.error?.message ||
        error.message
    );

    console.error(
      "========================================"
    );

    throw new Error(
      error.response?.data?.error?.message ||
        error.response?.data?.status_txt ||
        error.message ||
        "Image upload failed"
    );
  }
};

module.exports = uploadToImgBB;