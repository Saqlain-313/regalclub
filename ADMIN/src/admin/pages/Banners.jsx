// src/pages/admin/Banners.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBanners,
  uploadBanner,
  updateBanner,
  deleteBanner,
} from "../redux/bannerSlice";
import {
  Trash2,
  Edit,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Eye,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// ============================
// Custom Hooks
// ============================

const useBannerManagement = () => {
  const dispatch = useDispatch();
  const {
    banners,
    loading,
    uploadLoading,
    updateLoading,
    deleteLoading,
    error,
  } = useSelector((state) => state.banner);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    dispatch(getBanners());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const filteredAndSortedBanners = useMemo(() => {
    if (!banners) return [];

    let filtered = banners.filter((banner) => {
      const matchesSearch = banner.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && banner.isActive) ||
        (filterStatus === "inactive" && !banner.isActive);
      return matchesSearch && matchesFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [banners, searchTerm, filterStatus, sortBy]);

  return {
    banners,
    filteredBanners: filteredAndSortedBanners,
    loading,
    uploadLoading,
    updateLoading,
    deleteLoading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    dispatch,
  };
};

// ============================
// Components
// ============================

// Loading Skeleton
const BannerSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
      >
        <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl flex-1"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State
const EmptyState = ({ hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl p-16 text-center shadow-xl border-2 border-dashed border-gray-200"
  >
    <div className="flex flex-col items-center gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full p-6">
        <ImageIcon size={56} className="text-blue-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-700">
        {hasFilters ? "No matching banners" : "No banners yet"}
      </h3>
      <p className="text-gray-400 max-w-md">
        {hasFilters
          ? "Try adjusting your search or filter criteria"
          : "Upload your first banner to start promoting your content"}
      </p>
      {!hasFilters && (
        <button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-xl transition-all duration-200 flex items-center gap-2">
          <Plus size={20} />
          Upload Banner
        </button>
      )}
    </div>
  </motion.div>
);

// Banner Card
const BannerCard = ({
  banner,
  onEdit,
  onDelete,
  isEditing,
  editTitle,
  setEditTitle,
  editImagePreview,
  handleEditImageChange,
  handleUpdate,
  updateLoading,
  onCancelEdit,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
    >
      <div className="relative overflow-hidden">
        <img
          src={banner.image}
          alt={banner.title}
          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
              banner.isActive
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {banner.isActive ? "● Active" : "● Inactive"}
          </span>
        </div>

        {/* Quick Actions - Hover */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => window.open(banner.image, "_blank")}
            className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white transition-all duration-200 flex items-center gap-1"
          >
            <Eye size={14} />
            Preview
          </button>
          <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
            <Calendar size={12} />
            {new Date(banner.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleUpdate}
            className="space-y-3"
          >
            <input
              type="text"
              className="w-full border-2 border-blue-400 rounded-xl p-2.5 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-sm"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter title..."
              autoFocus
            />

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleEditImageChange}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 text-center hover:border-blue-500 transition-all duration-200 bg-gray-50">
                {editImagePreview ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="text-xs font-medium">New image selected</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">
                    Click to change image (optional)
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl px-4 py-2.5 font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {updateLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Save
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2.5 font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <>
            <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
              {banner.title}
            </h3>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              Updated {new Date(banner.updatedAt).toLocaleDateString()}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onEdit(banner)}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
              >
                <Edit size={15} />
                Edit
              </button>

              <button
                onClick={() => onDelete(banner._id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ============================
// Main Component
// ============================

const Banners = () => {
  const {
    filteredBanners,
    loading,
    uploadLoading,
    updateLoading,
    deleteLoading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    dispatch,
  } = useBannerManagement();

  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // ============================
  // Handlers
  // ============================

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditImage(file);
          setEditImagePreview(reader.result);
        } else {
          setImage(file);
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();

    if (!image) {
      return toast.error("Please select an image");
    }

    if (!title.trim()) {
      return toast.error("Please enter a title");
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);

    dispatch(uploadBanner(formData)).then((res) => {
      if (!res.error) {
        toast.success("🎉 Banner uploaded successfully!");
        setTitle("");
        setImage(null);
        setImagePreview(null);
      }
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    dispatch(deleteBanner(id)).then((res) => {
      if (!res.error) toast.success("🗑️ Banner deleted successfully!");
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!editTitle.trim()) {
      return toast.error("Please enter a title");
    }

    const formData = new FormData();
    formData.append("title", editTitle);

    if (editImage) {
      formData.append("image", editImage);
    }

    dispatch(
      updateBanner({
        id: editingId,
        formData,
      })
    ).then((res) => {
      if (!res.error) {
        toast.success("✨ Banner updated successfully!");
        setEditingId(null);
        setEditImage(null);
        setEditImagePreview(null);
      }
    });
  };

  const handleEditStart = (banner) => {
    setEditingId(banner._id);
    setEditTitle(banner.title);
    setEditImagePreview(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditImage(null);
    setEditImagePreview(null);
  };

  const handleRefresh = () => {
    dispatch(getBanners());
    toast.info("🔄 Refreshing banners...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ============================ */}
        {/* Header */}
        {/* ============================ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="text-blue-600" size={32} />
              Banner Management
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {filteredBanners.length} banners available
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:rotate-180"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>

            <div className="bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2">
              <label className="text-xs text-gray-500">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ============================ */}
        {/* Upload Section */}
        {/* ============================ */}
        <motion.div
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
              Upload New Banner
            </h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Enter banner title..."
                className="w-full border-2 border-gray-200 rounded-2xl p-3.5 pl-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleImageChange(e, false)}
                />
                <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-3.5 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200">
                  {imagePreview ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="text-sm font-medium">Image selected</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <ImageIcon size={20} />
                      <span className="text-sm">Click to select image</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-6 py-3.5 font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Banner
                  </>
                )}
              </button>
            </div>

            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-auto object-cover rounded-lg"
                />
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* ============================ */}
        {/* Filters */}
        {/* ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search banners by title..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white/80 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-2xl font-medium transition-all duration-200 capitalize ${
                  filterStatus === status
                    ? status === "all"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : status === "active"
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-red-500 text-white shadow-lg"
                    : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md"
                }`}
              >
                {status === "all" ? "📊 All" : status === "active" ? "✅ Active" : "❌ Inactive"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ============================ */}
        {/* Banners Grid */}
        {/* ============================ */}
        {loading ? (
          <BannerSkeleton count={8} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredBanners.length > 0 ? (
              <div
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                } gap-6`}
              >
                {filteredBanners.map((banner) => (
                  <BannerCard
                    key={banner._id}
                    banner={banner}
                    onEdit={handleEditStart}
                    onDelete={handleDelete}
                    isEditing={editingId === banner._id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editImagePreview={editImagePreview}
                    handleEditImageChange={(e) => handleImageChange(e, true)}
                    handleUpdate={handleUpdate}
                    updateLoading={updateLoading}
                    onCancelEdit={handleEditCancel}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                hasFilters={searchTerm !== "" || filterStatus !== "all"}
              />
            )}
          </AnimatePresence>
        )}

        {/* ============================ */}
        {/* Footer */}
        {/* ============================ */}
        {!loading && filteredBanners.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center text-sm text-gray-400"
          >
            Showing {filteredBanners.length} of {filteredBanners.length} banners
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Banners;