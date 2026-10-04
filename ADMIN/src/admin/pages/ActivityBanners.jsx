// src/admin/pages/ActivityBanners.jsx
//
// Manage the /activity page banners and the /promo referral share image

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trash2,
  Edit,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import {
  getActivityContentAdmin,
  uploadActivityBanner,
  updateActivityBanner,
  deleteActivityBanner,
  uploadReferralShareImage,
} from "../redux/activityBannerSlice";

const ActivityBanners = () => {
  const dispatch = useDispatch();
  const {
    banners,
    referralShareImage,
    loading,
    uploadLoading,
    updateLoading,
    deleteLoading,
    referralUploadLoading,
  } = useSelector((state) => state.activityBannerAdmin);

  const [title, setTitle] = useState("");
  const [navigateTo, setNavigateTo] = useState("/deposit");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNavigateTo, setEditNavigateTo] = useState("");
  const [editImage, setEditImage] = useState(null);

  const [shareImage, setShareImage] = useState(null);

  useEffect(() => {
    dispatch(getActivityContentAdmin());
  }, [dispatch]);

  // ============================
  // HANDLERS
  // ============================

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    if (isEdit) {
      setEditImage(file);
      toast.info(`Image selected: ${file.name}`);
    } else {
      setImage(file);
      setImagePreview(file);
      toast.info(`Image selected: ${file.name}`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) return toast.error("Please select an image");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title || "");
    formData.append("navigateTo", navigateTo);

    try {
      await dispatch(uploadActivityBanner(formData)).unwrap();
      toast.success("🎉 Activity banner uploaded!");
      setTitle("");
      setNavigateTo("/deposit");
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(err || "Upload failed. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity banner?")) return;

    try {
      await dispatch(deleteActivityBanner(id)).unwrap();
      toast.success("🗑️ Banner deleted!");
    } catch (err) {
      toast.error(err || "Delete failed. Please try again.");
    }
  };

  const handleToggleActive = async (banner) => {
    const formData = new FormData();
    formData.append("isActive", banner.isActive ? "false" : "true");

    try {
      await dispatch(
        updateActivityBanner({ id: banner._id, formData }),
      ).unwrap();
      toast.success(
        banner.isActive
          ? "Banner hidden from /activity"
          : "Banner is now live on /activity",
      );
    } catch (err) {
      toast.error(err || "Update failed. Please try again.");
    }
  };

  const handleEditStart = (banner) => {
    setEditingId(banner._id);
    setEditTitle(banner.title || "");
    setEditNavigateTo(banner.navigateTo || "");
    setEditImage(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("navigateTo", editNavigateTo);

    if (editImage) formData.append("image", editImage);

    try {
      await dispatch(
        updateActivityBanner({ id: editingId, formData }),
      ).unwrap();
      toast.success("✨ Banner updated!");
      setEditingId(null);
      setEditImage(null);
    } catch (err) {
      toast.error(err || "Update failed. Please try again.");
    }
  };

  const handleShareImageUpload = async () => {
    if (!shareImage) return toast.error("Please select an image");

    const formData = new FormData();
    formData.append("image", shareImage);

    try {
      await dispatch(uploadReferralShareImage(formData)).unwrap();
      toast.success("🎉 Referral share image updated!");
      setShareImage(null);
    } catch (err) {
      toast.error(err || "Upload failed. Please try again.");
    }
  };

  const routeOptions = [
    { value: "/deposit", label: "Deposit (/deposit)" },
    { value: "/promo", label: "Promo — Refer & Earn (/promo)" },
    { value: "/matka", label: "Matka (/matka)" },
    { value: "/mine-games", label: "Mines Game (/mine-games)" },
    { value: "/casino", label: "Casino (/casino)" },
    { value: "/slots", label: "Slots (/slots)" },
    { value: "/aviator", label: "Aviator (/aviator)" },
  ];

  const inputClass =
    "w-full border-2 border-gray-200 rounded-2xl p-3.5 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ============================ */}
        {/* Header */}
        {/* ============================ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles size={32} className="text-purple-600" />
              Activity Banners
            </h1>
            <p className="text-gray-500 mt-1">
              Manage the /activity page banners and the referral share image
            </p>
          </div>

          <button
            onClick={() => dispatch(getActivityContentAdmin())}
            className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg hover:rotate-180 transition-all"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </motion.div>

        {/* ============================ */}
        {/* REFERRAL SHARE IMAGE */}
        {/* ============================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
              <Share2 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Referral Share Image
              </h2>
              <p className="text-xs text-gray-400">
                Shared along with "Your Referral Link" on /promo
                (WhatsApp / native share)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Current image */}
            <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 p-3">
              {referralShareImage ? (
                <img
                  src={referralShareImage}
                  alt="Referral share"
                  className="w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                  <ImageIcon size={32} />
                  <span className="text-xs">No image uploaded yet</span>
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="md:col-span-2 space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0] || null;
                    setShareImage(file);
                    if (file) toast.info(`Image selected: ${file.name}`);
                  }}
                />
                <span className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer block text-sm text-gray-500">
                  {shareImage
                    ? `Selected: ${shareImage.name}`
                    : "Click to select new referral share image (recommended: 1280×720)"}
                </span>
              </label>

              <button
                type="button"
                onClick={handleShareImageUpload}
                disabled={referralUploadLoading || !shareImage}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl px-6 py-3 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {referralUploadLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Upload size={18} />
                )}
                {referralUploadLoading ? "Uploading..." : "Update Share Image"}
              </button>
            </div>
          </div>
        </motion.section>

        {/* ============================ */}
        {/* UPLOAD ACTIVITY BANNER */}
        {/* ============================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-white/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <Plus className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Upload New Activity Banner
            </h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Banner title (optional)"
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <select
                className={inputClass}
                value={navigateTo}
                onChange={(e) => setNavigateTo(e.target.value)}
              >
                {routeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label className="relative block">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    handleImageChange(e, false);
                    setImagePreview(e.target.files[0] || null);
                  }}
                />
                <span className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-3.5 text-center hover:border-blue-500 transition-all cursor-pointer block text-sm text-gray-500 truncate">
                  {imagePreview
                    ? imagePreview.name
                    : "Click to select image"}
                </span>
              </label>

              <button
                type="submit"
                disabled={uploadLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-6 py-3.5 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {uploadLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Upload size={18} />
                )}
                {uploadLoading ? "Uploading..." : "Upload Banner"}
              </button>
            </div>
          </form>
        </motion.section>

        {/* ============================ */}
        {/* BANNERS LIST */}
        {/* ============================ */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="w-full h-44 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-xl border-2 border-dashed border-gray-200">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-xl font-bold text-gray-600">
                No activity banners yet
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Default banners are shown on the /activity page
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all"
                >
                  <div className="relative">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-44 object-cover"
                    />

                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                        banner.isActive
                          ? "bg-green-500/90 text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {banner.isActive ? "● Active" : "● Inactive"}
                    </span>

                    {banner.navigateTo && (
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1">
                        <ArrowRight size={12} />
                        {banner.navigateTo}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    {editingId === banner._id ? (
                      <form onSubmit={handleUpdate} className="space-y-3">
                        <input
                          type="text"
                          className="w-full border-2 border-blue-400 rounded-xl p-2.5 outline-none text-sm"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                        />

                        <select
                          className="w-full border-2 border-blue-400 rounded-xl p-2.5 outline-none text-sm"
                          value={editNavigateTo}
                          onChange={(e) => setEditNavigateTo(e.target.value)}
                        >
                          <option value="">No navigation</option>
                          {routeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(e, true)}
                          />
                          <span className="border-2 border-dashed border-gray-300 rounded-xl p-2 text-center hover:border-blue-500 transition-all cursor-pointer block text-xs text-gray-500">
                            {editImage
                              ? "New image selected ✓"
                              : "Change image (optional)"}
                          </span>
                        </label>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={updateLoading}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex-1 bg-gray-100 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-800 mb-3 truncate">
                          {banner.title || "Untitled banner"}
                        </h3>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditStart(banner)}
                            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5"
                          >
                            <Edit size={15} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleToggleActive(banner)}
                            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium text-white flex items-center justify-center gap-1.5 ${
                              banner.isActive
                                ? "bg-slate-500"
                                : "bg-green-600"
                            }`}
                          >
                            {banner.isActive ? "Hide" : "Show"}
                          </button>

                          <button
                            onClick={() => handleDelete(banner._id)}
                            disabled={deleteLoading}
                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ActivityBanners;
