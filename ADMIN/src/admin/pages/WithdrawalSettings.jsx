// src/pages/admin/WithdrawalSettings.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllWithdrawalSettings,
  deleteWithdrawalSettings,
  toggleWithdrawalSettingsStatus,
} from "../redux/withdrawalSettingsSlice";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Sparkles,
  Globe,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Settings,
  Wallet,
  TrendingUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building,
  CreditCard,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// ============================
// Components
// ============================

// Loading Skeleton
const SettingSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-8 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

// Empty State
const EmptyState = ({ onAdd }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl p-16 text-center shadow-xl border-2 border-dashed border-gray-200"
  >
    <div className="flex flex-col items-center gap-4">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full p-6">
        <Settings size={56} className="text-purple-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-700">No Withdrawal Settings Found</h3>
      <p className="text-gray-400 max-w-md">
        Start by adding withdrawal settings for a country to enable withdrawal functionality.
      </p>
      <button
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        onClick={onAdd}
      >
        <Plus size={20} />
        Add First Settings
      </button>
    </div>
  </motion.div>
);

// Withdrawal Settings Row
const WithdrawalRow = ({ item, onToggle, onDelete, onEdit }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-lg font-bold text-purple-600">
            {item.country?.slice(0, 2).toUpperCase() || '🌍'}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {item.countryName || 'Unknown Country'}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Globe size={12} />
              {item.country || 'N/A'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">
          {item.currencySymbol} {item.currency}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">
          {item.currencySymbol}{item.minWithdrawal}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">
          {item.currencySymbol}{item.maxWithdrawal}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-700">
          {item.processingFee}
          {item.processingFeeType === "percentage" ? "%" : ` ${item.currencySymbol}`}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Clock size={14} />
          {item.processingTime}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggle(item._id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
            item.isActive
              ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
              : "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200"
          }`}
        >
          {item.isActive ? (
            <CheckCircle size={12} />
          ) : (
            <XCircle size={12} />
          )}
          {item.isActive ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(item._id)}
            className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-xl transition-all duration-200"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all duration-200"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ============================
// Main Component
// ============================

const WithdrawalSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    settings,
    loading,
    error,
  } = useSelector((state) => state.withdrawalSettings);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(getAllWithdrawalSettings());
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this withdrawal setting?")) {
      dispatch(deleteWithdrawalSettings(id))
        .then(() => {
          toast.success("🗑️ Withdrawal setting deleted successfully!");
        })
        .catch(() => {
          toast.error("Failed to delete withdrawal setting");
        });
    }
  };

  const handleToggle = (id) => {
    dispatch(toggleWithdrawalSettingsStatus(id))
      .then(() => {
        toast.success("✅ Status updated successfully!");
      })
      .catch(() => {
        toast.error("Failed to update status");
      });
  };

  const handleRefresh = () => {
    dispatch(getAllWithdrawalSettings());
    toast.info("🔄 Refreshing settings...");
  };

  const handleAdd = () => {
    navigate("/admin/withdrawal-settings/create");
  };

  const handleEdit = (id) => {
    navigate(`/admin/withdrawal-settings/edit/${id}`);
  };

  // Filter and search
  const filteredSettings = useMemo(() => {
    let filtered = settings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.countryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.currency?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      filtered = filtered.filter(item => item.isActive === isActive);
    }

    return filtered;
  }, [settings, searchTerm, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredSettings.length / itemsPerPage);
  const paginatedSettings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSettings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSettings, currentPage, itemsPerPage]);

  // Stats
  const stats = useMemo(() => ({
    total: settings.length,
    active: settings.filter(item => item.isActive).length,
    inactive: settings.filter(item => !item.isActive).length,
  }), [settings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="text-purple-600" size={28} />
              Withdrawal Settings
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {stats.total} countries configured • {stats.active} active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:rotate-180"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Settings
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          {[
            { title: 'Total Countries', value: stats.total, icon: Globe, color: 'purple', gradient: 'from-purple-500 to-indigo-600' },
            { title: 'Active Settings', value: stats.active, icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-emerald-600' },
            { title: 'Inactive Settings', value: stats.inactive, icon: XCircle, color: 'red', gradient: 'from-red-500 to-rose-600' },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 mb-6 border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by country name, code, or currency..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "active", "inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 capitalize ${
                    filterStatus === status
                      ? status === "all"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                        : status === "active"
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-red-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  {status === "all" ? "📊 All" : status === "active" ? "✅ Active" : "❌ Inactive"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Table */}
        {loading ? (
          <SettingSkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredSettings.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Currency
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Min
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Max
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Fee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Processing Time
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedSettings.map((item) => (
                        <WithdrawalRow
                          key={item._id}
                          item={item}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                          onEdit={handleEdit}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSettings.length)} of {filteredSettings.length} settings
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 flex items-center gap-1"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                                  : "hover:bg-gray-100 text-gray-600"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 flex items-center gap-1"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState onAdd={handleAdd} />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default WithdrawalSettings;