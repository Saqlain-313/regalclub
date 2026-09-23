// src/pages/admin/Deposits.jsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllDeposits,
  fetchPendingDeposits,
  fetchDepositStats,
  approveDeposit,
  rejectDeposit,
  setFilterParams,
  resetFilterParams,
  clearDepositError,
} from '../redux/depositSlice';
import { format } from 'date-fns';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  X,
  Eye,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  Wallet,
  CreditCard,
  Building,
  Globe,
  Calendar,
  MessageSquare,
  Sparkles,
  Download,
  Printer,
  Activity,
  BarChart3,
  Mail,
  Phone,
  Zap,
  Shield,
  Award,
  Gem,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// ============================
// Custom Hooks
// ============================

const useDepositManagement = () => {
  const dispatch = useDispatch();
  const {
    deposits,
    pendingDeposits,
    stats,
    currentPage,
    totalPages,
    totalRecords,
    isLoading,
    isProcessing,
    error,
    filterParams,
  } = useSelector((state) => state.deposits);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [remark, setRemark] = useState('');
  const [localFilters, setLocalFilters] = useState(filterParams);
  const [viewMode, setViewMode] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch, page, rowsPerPage, filterParams, viewMode]);

  const fetchData = useCallback(() => {
    dispatch(fetchDepositStats());
    if (viewMode === 'pending') {
      dispatch(fetchPendingDeposits());
    } else {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filterParams,
      };
      dispatch(fetchAllDeposits(params));
    }
  }, [dispatch, viewMode, page, rowsPerPage, filterParams]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearDepositError());
    }
  }, [error, dispatch]);

  return {
    deposits,
    pendingDeposits,
    stats,
    currentPage,
    totalPages,
    totalRecords,
    isLoading,
    isProcessing,
    error,
    filterParams,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    selectedDeposit,
    setSelectedDeposit,
    showApproveModal,
    setShowApproveModal,
    showRejectModal,
    setShowRejectModal,
    showDetailModal,
    setShowDetailModal,
    remark,
    setRemark,
    localFilters,
    setLocalFilters,
    viewMode,
    setViewMode,
    isFilterOpen,
    setIsFilterOpen,
    fetchData,
    dispatch,
  };
};

// ============================
// Components
// ============================

// 3D Stats Cards
const StatsCards = ({ stats, formatCurrency }) => {
  const cards = [
    {
      title: 'Total Deposits',
      value: stats.totalDeposits || 0,
      icon: DollarSign,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600',
      glow: 'shadow-blue-500/30',
      subtitle: 'Total transactions',
    },
    {
      title: 'Pending',
      value: stats.pendingDeposits || 0,
      icon: Clock,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-600',
      glow: 'shadow-yellow-500/30',
      subtitle: 'Awaiting approval',
    },
    {
      title: 'Approved',
      value: stats.approvedDeposits || 0,
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      glow: 'shadow-green-500/30',
      subtitle: 'Successfully processed',
    },
    {
      title: 'Rejected',
      value: stats.rejectedDeposits || 0,
      icon: XCircle,
      color: 'red',
      gradient: 'from-red-500 to-rose-600',
      glow: 'shadow-red-500/30',
      subtitle: 'Declined deposits',
    },
    {
      title: 'Total Amount',
      value: formatCurrency(stats.approvedAmount || 0, stats.country || 'India'),
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-violet-600',
      glow: 'shadow-purple-500/30',
      subtitle: 'Approved deposits',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 perspective-1000">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, rotateX: -30, y: 40 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6, type: 'spring' }}
          className="relative group"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className={`
            relative bg-white rounded-2xl p-6 shadow-xl 
            transform transition-all duration-500 
            hover:scale-105 hover:-translate-y-2 hover:rotate-y-3 
            hover:shadow-2xl ${card.glow}
            border border-gray-100/50
            before:absolute before:inset-0 before:rounded-2xl 
            before:bg-gradient-to-br before:${card.gradient} 
            before:opacity-0 hover:before:opacity-10 
            before:transition-opacity before:duration-500
            after:absolute after:inset-0 after:rounded-2xl 
            after:bg-white after:opacity-0 hover:after:opacity-50
            after:transition-opacity after:duration-500
          `}>
            {/* 3D Hover Effect Layers */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-white/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-2 truncate tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                  {card.subtitle}
                </p>
              </div>
              <div className={`
                bg-gradient-to-br ${card.gradient} p-3.5 rounded-2xl 
                transform transition-all duration-500 group-hover:scale-110 
                group-hover:rotate-3 shadow-lg flex-shrink-0 ml-3
                relative overflow-hidden
                before:absolute before:inset-0 before:bg-white/20 
                before:translate-x-full before:skew-x-12 
                group-hover:before:animate-shimmer
              `}>
                <card.icon className="w-5 h-5 text-white relative z-10" />
              </div>
            </div>
            
            {/* Progress Bar with 3D Effect */}
            <div className="relative z-10 mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full bg-gradient-to-r ${card.gradient} rounded-full 
                  transition-all duration-1000 transform group-hover:scale-x-100 
                  shadow-lg`}
                style={{ 
                  width: `${Math.min((typeof card.value === 'number' ? card.value : 0) / (stats.totalDeposits || 1) * 100, 100)}%`,
                  transformOrigin: 'left',
                }}
              />
              {/* Animated shimmer on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer-slow" />
            </div>

            {/* 3D Edge Highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Loading Skeleton with 3D Shimmer
const DepositSkeleton = () => (
  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50">
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl w-48 animate-pulse-skeleton bg-[length:200%_100%]"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl w-32 animate-pulse-skeleton bg-[length:200%_100%]"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50">
          <div className="h-12 w-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse-skeleton bg-[length:200%_100%]"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-pulse-skeleton bg-[length:200%_100%]"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2 animate-pulse-skeleton bg-[length:200%_100%]"></div>
          </div>
          <div className="h-8 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse-skeleton bg-[length:200%_100%]"></div>
        </div>
      ))}
    </div>
  </div>
);

// Enhanced Empty State with 3D Animation
const EmptyState = ({ viewMode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
    transition={{ duration: 0.6, type: 'spring' }}
    className="relative bg-white rounded-3xl p-20 text-center shadow-2xl border-2 border-dashed border-gray-200/50 backdrop-blur-sm overflow-hidden"
  >
    {/* 3D Background Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent" />
    
    <div className="relative z-10 flex flex-col items-center gap-6">
      <motion.div 
        className="relative"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-8 shadow-2xl relative">
          <DollarSign size={64} className="text-white" />
        </div>
      </motion.div>
      
      <h3 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        No deposits found
      </h3>
      <p className="text-gray-500 max-w-md text-lg leading-relaxed">
        {viewMode === 'pending'
          ? '🎉 All pending deposits have been processed. You\'re on fire!'
          : 'No deposits match your current filters. Try adjusting your search criteria.'}
      </p>
      <div className="flex gap-2">
        <span className="px-3 py-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full text-xs font-medium text-gray-600">
          {viewMode === 'pending' ? '✨ All clear' : '🔍 Try different filters'}
        </span>
      </div>
    </div>
  </motion.div>
);

// Enhanced Deposit Row with 3D Hover
const DepositRow = ({
  deposit,
  onViewDetails,
  onApprove,
  onReject,
  getStatusColors,
  getStatusIcon,
  formatCurrency,
  formatDate,
  isProcessing,
}) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ 
        scale: 1.01,
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
      transition={{ duration: 0.2 }}
      className="group relative cursor-default"
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
              <span className="text-sm font-bold text-white">
                {deposit.user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-900">
              {deposit.user?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[120px]">
              {deposit.user?.email || 'No email'}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1 md:hidden">
          {formatDate(deposit.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
          {formatCurrency(deposit.amount, deposit.country)}
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {deposit.country || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm group-hover:shadow-md transition-all duration-300">
          <CreditCard className="w-3 h-3" />
          {deposit.methodType?.toUpperCase() || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm ${getStatusColors(deposit.status)} group-hover:scale-105 transition-transform duration-300`}>
          {getStatusIcon(deposit.status)}
          <span className="capitalize">{deposit.status}</span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4 text-gray-400" />
          {formatDate(deposit.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onViewDetails(deposit)}
            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group relative"
          >
            <Eye className="w-4 h-4" />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View Details
            </span>
          </motion.button>
          {deposit.status === 'pending' && (
            <>
              <motion.button
                whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onApprove(deposit)}
                disabled={isProcessing}
                className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group relative"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Approve
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReject(deposit)}
                disabled={isProcessing}
                className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group relative"
              >
                <XCircle className="w-4 h-4" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Reject
                </span>
              </motion.button>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

// Enhanced Filter Section with 3D Elements
const FilterSection = ({
  localFilters,
  handleFilterChange,
  applyFilters,
  resetFilters,
  viewMode,
  setViewMode,
  fetchData,
  isLoading,
  stats,
  isFilterOpen,
  setIsFilterOpen,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-8 border border-white/50 overflow-hidden"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* 3D Background Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Filters & Views
              </h3>
              <p className="text-xs text-gray-400">Refine your deposit search</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden inline-flex items-center px-4 py-2 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium"
          >
            {isFilterOpen ? 'Hide' : 'Show'} Filters
            <Filter className="w-4 h-4 ml-2" />
          </motion.button>
        </div>

        <AnimatePresence>
          {(isFilterOpen || window.innerWidth >= 768) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                    Status
                  </label>
                  <select
                    name="status"
                    value={localFilters.status || ''}
                    onChange={handleFilterChange}
                    className="w-full rounded-2xl border-2 border-gray-200/80 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 transition-all duration-300 outline-none text-sm bg-white shadow-sm hover:shadow-md"
                  >
                    <option value="">📊 All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="approved">✅ Approved</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={localFilters.country || ''}
                    onChange={handleFilterChange}
                    placeholder="Enter country code"
                    className="w-full rounded-2xl border-2 border-gray-200/80 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 transition-all duration-300 outline-none text-sm bg-white shadow-sm hover:shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-pink-500"></span>
                    Payment Method
                  </label>
                  <select
                    name="methodType"
                    value={localFilters.methodType || ''}
                    onChange={handleFilterChange}
                    className="w-full rounded-2xl border-2 border-gray-200/80 px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100/50 transition-all duration-300 outline-none text-sm bg-white shadow-sm hover:shadow-md"
                  >
                    <option value="">💳 All Methods</option>
                    <option value="bank">🏦 Bank Transfer</option>
                    <option value="crypto">₿ Cryptocurrency</option>
                    <option value="card">💳 Credit Card</option>
                    <option value="upi">📱 UPI</option>
                    <option value="paypal">💰 PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                    Search User
                  </label>
                  <input
                    type="text"
                    name="search"
                    value={localFilters.search || ''}
                    onChange={handleFilterChange}
                    placeholder="Name, email, or mobile"
                    className="w-full rounded-2xl border-2 border-gray-200/80 px-4 py-3 focus:border-orange-500 focus:ring-4 focus:ring-orange-100/50 transition-all duration-300 outline-none text-sm bg-white shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t-2 border-gray-100/80">
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={applyFilters}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Apply Filters
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="inline-flex items-center px-6 py-3 bg-gray-200/80 text-gray-700 text-sm font-medium rounded-2xl hover:bg-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reset
                  </motion.button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('all')}
                    className={`px-5 py-3 text-sm font-medium rounded-2xl transition-all duration-300 shadow-sm ${
                      viewMode === 'all'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📋 All Deposits
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('pending')}
                    className={`px-5 py-3 text-sm font-medium rounded-2xl transition-all duration-300 shadow-sm flex items-center gap-2 ${
                      viewMode === 'pending'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Pending ({stats.pendingDeposits || 0})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchData}
                    disabled={isLoading}
                    className="inline-flex items-center px-5 py-3 bg-gray-200/80 text-gray-700 text-sm font-medium rounded-2xl hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Enhanced Detail Modal with 3D Effects
const DetailModal = ({
  deposit,
  onClose,
  getStatusColors,
  getStatusIcon,
  formatCurrency,
  formatDate,
}) => {
  if (!deposit) return null;

  const details = [
    { label: 'User', value: deposit.user?.name || 'N/A', icon: Users },
    { label: 'Email', value: deposit.user?.email || 'N/A', icon: Mail },
    { label: 'Mobile', value: deposit.user?.mobile || 'N/A', icon: Phone },
    { label: 'Country', value: deposit.country || 'N/A', icon: Globe },
    { label: 'Amount', value: formatCurrency(deposit.amount, deposit.country), icon: DollarSign, highlight: true },
    { label: 'Method', value: deposit.methodType?.toUpperCase() || 'N/A', icon: CreditCard },
    { label: 'Status', value: deposit.status, icon: Activity, isBadge: true },
    { label: 'Created', value: formatDate(deposit.createdAt), icon: Calendar },
    { label: 'Approved', value: deposit.approvedAt ? formatDate(deposit.approvedAt) : 'N/A', icon: CheckCircle },
    { label: 'Rejected', value: deposit.rejectedAt ? formatDate(deposit.rejectedAt) : 'N/A', icon: XCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        initial={{ scale: 0.8, rotateY: -30, y: 40 }}
        animate={{ scale: 1, rotateY: 0, y: 0 }}
        exit={{ scale: 0.8, rotateY: 30, y: 40 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 3D Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/30 to-pink-50/30 rounded-3xl pointer-events-none" />
        
        {/* Header with 3D Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-t-3xl flex justify-between items-center z-10 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-lg transform rotate-3">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Deposit Details
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full text-white/90 font-normal">
                  #{deposit._id?.slice(-8)}
                </span>
              </h2>
              <p className="text-indigo-100 text-sm flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                Transaction ID: {deposit._id?.slice(0, 12)}...
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 relative z-10"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Body with 3D Cards */}
        <div className="p-8 relative z-10">
          {/* Amount Highlight with 3D Effect */}
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-indigo-200/50 shadow-lg transform transition-all duration-300 group-hover:scale-[1.02]">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                  Transaction Amount
                  <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                </p>
                <p className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-3">
                  {formatCurrency(deposit.amount, deposit.country)}
                </p>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-md mt-4 ${getStatusColors(deposit.status)}`}>
                  {getStatusIcon(deposit.status)}
                  <span className="capitalize font-bold">{deposit.status}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid with 3D Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.map((item, index) => {
              if (item.isBadge) {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                  >
                    <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </label>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColors(item.value)}`}>
                        {getStatusIcon(item.value)}
                        <span className="capitalize">{item.value}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    ${item.highlight ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gray-50/80'} 
                    rounded-2xl p-5 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]
                    backdrop-blur-sm
                  `}
                >
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </label>
                  <p className={`mt-2 ${item.highlight ? 'text-2xl font-bold text-emerald-600' : 'text-sm font-medium text-gray-900'} break-all`}>
                    {item.value}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Remarks with 3D Effect */}
          {deposit.remark && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200/50 rounded-2xl p-5 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2.5 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                    Remark
                  </label>
                  <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap leading-relaxed">
                    {deposit.remark}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="flex justify-end mt-8 pt-6 border-t-2 border-gray-100">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Action Modal with 3D Effects
const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  deposit,
  remark,
  setRemark,
  isProcessing,
  actionColor,
  actionIcon: ActionIcon,
  formatCurrency,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        initial={{ scale: 0.8, rotateX: -20, y: 40 }}
        animate={{ scale: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.8, rotateX: 20, y: 40 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 3D Background */}
        <div className={`absolute inset-0 bg-gradient-to-br from-${actionColor}-50/50 via-white to-white rounded-3xl pointer-events-none`} />
        
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`bg-${actionColor}-100 p-4 rounded-2xl shadow-lg`}
            >
              <ActionIcon className={`w-7 h-7 text-${actionColor}-600`} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">Confirm your action</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

          {deposit && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-5 mb-6 space-y-3 border border-gray-200/50 shadow-inner"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">User:</span>
                <span className="font-semibold text-gray-900">{deposit.user?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Amount:</span>
                <span className="font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(deposit.amount, deposit.country)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Method:</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  {deposit.methodType?.toUpperCase()}
                </span>
              </div>
            </motion.div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              Remark <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows="3"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-200/80 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 transition-all duration-300 outline-none text-sm bg-white shadow-sm hover:shadow-md"
              placeholder="Add a remark..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100/80 rounded-2xl hover:bg-gray-200 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isProcessing}
              className={`px-6 py-3 text-sm font-medium text-white bg-${actionColor}-600 rounded-2xl hover:bg-${actionColor}-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl`}
            >
              {isProcessing && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              )}
              {title}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================
// Country Currency Helpers
// ============================

const COUNTRY_CURRENCY = {
  India: { symbol: "₹", code: "INR" },
  Australia: { symbol: "A$", code: "AUD" },
  Pakistan: { symbol: "Rs", code: "PKR" },
  Bangladesh: { symbol: "৳", code: "BDT" },
  Nepal: { symbol: "रू", code: "NPR" },
  Dubai: { symbol: "د.إ", code: "AED" },
  UAE: { symbol: "د.إ", code: "AED" },
  "United Arab Emirates": { symbol: "د.إ", code: "AED" },
};

const getCountryCurrency = (country) => {
  if (!country) return COUNTRY_CURRENCY.India;

  const value = String(country).trim().toLowerCase();

  const match = Object.entries(COUNTRY_CURRENCY).find(
    ([name]) => name.toLowerCase() === value
  );

  return match ? match[1] : COUNTRY_CURRENCY.India;
};

const formatCountryCurrency = (amount, country) => {
  const { symbol } = getCountryCurrency(country);
  const numericAmount = Number(amount) || 0;

  return `${symbol}${numericAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ============================
// Main Component
// ============================

const Deposits = () => {
  const {
    deposits,
    pendingDeposits,
    stats,
    totalPages,
    totalRecords,
    isLoading,
    isProcessing,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    selectedDeposit,
    setSelectedDeposit,
    showApproveModal,
    setShowApproveModal,
    showRejectModal,
    setShowRejectModal,
    showDetailModal,
    setShowDetailModal,
    remark,
    setRemark,
    localFilters,
    setLocalFilters,
    viewMode,
    setViewMode,
    isFilterOpen,
    setIsFilterOpen,
    fetchData,
    dispatch,
  } = useDepositManagement();

  // ============================
  // Handlers
  // ============================

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  }, [setLocalFilters]);

  const applyFilters = useCallback(() => {
    dispatch(setFilterParams(localFilters));
    setPage(0);
    setIsFilterOpen(false);
    toast.info('🔍 Filters applied');
  }, [dispatch, localFilters, setPage, setIsFilterOpen]);

  const resetFilters = useCallback(() => {
    dispatch(resetFilterParams());
    setLocalFilters({});
    setPage(0);
    toast.info('🔄 Filters reset');
  }, [dispatch, setLocalFilters, setPage]);

  const handleApprove = useCallback((deposit) => {
    setSelectedDeposit(deposit);
    setRemark('');
    setShowApproveModal(true);
  }, [setSelectedDeposit, setRemark, setShowApproveModal]);

  const handleReject = useCallback((deposit) => {
    setSelectedDeposit(deposit);
    setRemark('');
    setShowRejectModal(true);
  }, [setSelectedDeposit, setRemark, setShowRejectModal]);

  const confirmApprove = useCallback(async () => {
    try {
      await dispatch(approveDeposit({ id: selectedDeposit._id, remark }));
      toast.success('✅ Deposit approved successfully!');
      setShowApproveModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to approve deposit');
    }
  }, [dispatch, selectedDeposit, remark, setShowApproveModal, fetchData]);

  const confirmReject = useCallback(async () => {
    try {
      await dispatch(rejectDeposit({ id: selectedDeposit._id, remark }));
      toast.success('❌ Deposit rejected successfully!');
      setShowRejectModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to reject deposit');
    }
  }, [dispatch, selectedDeposit, remark, setShowRejectModal, fetchData]);

  const handleViewDetails = useCallback((deposit) => {
    setSelectedDeposit(deposit);
    setShowDetailModal(true);
  }, [setSelectedDeposit, setShowDetailModal]);

  // ============================
  // Helper Functions
  // ============================

  const formatCurrency = useCallback((amount, country) => {
    return formatCountryCurrency(amount, country);
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const getStatusColors = useCallback((status) => {
    const colors = {
      pending: 'bg-yellow-100/80 text-yellow-800 border-yellow-300/50 shadow-yellow-200/30',
      approved: 'bg-green-100/80 text-green-800 border-green-300/50 shadow-green-200/30',
      rejected: 'bg-red-100/80 text-red-800 border-red-300/50 shadow-red-200/30',
    };
    return colors[status] || 'bg-gray-100/80 text-gray-800 border-gray-300/50';
  }, []);

  const getStatusIcon = useCallback((status) => {
    const icons = {
      pending: <Clock className="w-3.5 h-3.5" />,
      approved: <CheckCircle className="w-3.5 h-3.5" />,
      rejected: <XCircle className="w-3.5 h-3.5" />,
    };
    return icons[status] || null;
  }, []);

  const data = viewMode === 'pending' ? pendingDeposits : deposits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with 3D Effect */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6"
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-4">
              <span className="relative">
                <Sparkles className="text-indigo-600" size={36} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              </span>
              Deposit Management
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                {viewMode === 'pending' ? 'Pending' : 'All'} deposits
              </span>
              <span className="w-px h-4 bg-gray-300" />
              <span className="font-semibold text-gray-700 bg-white/60 px-3 py-1 rounded-full shadow-sm">
                {viewMode === 'pending' ? pendingDeposits.length : totalRecords} records
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toast.info('📥 Export feature coming soon')}
              className="p-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
            >
              <Download size={20} className="text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.print()}
              className="p-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
            >
              <Printer size={20} className="text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <StatsCards stats={stats} formatCurrency={formatCurrency} />

        {/* Filters */}
        <FilterSection
          localFilters={localFilters}
          handleFilterChange={handleFilterChange}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          fetchData={fetchData}
          isLoading={isLoading}
          stats={stats}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />

        {/* Deposits Table */}
        {isLoading ? (
          <DepositSkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            {data.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/80">
                    <thead className="bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80">
                      <tr>
                        <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          User
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Status
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Date
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200/50">
                      {data.map((deposit) => (
                        <DepositRow
                          key={deposit._id}
                          deposit={deposit}
                          onViewDetails={handleViewDetails}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          getStatusColors={getStatusColors}
                          getStatusIcon={getStatusIcon}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          isProcessing={isProcessing}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination with 3D Effects */}
                {viewMode === 'all' && totalPages > 1 && (
                  <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 px-6 py-5 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200/50 gap-4 backdrop-blur-sm">
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                      <span className="font-medium">Rows per page:</span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                        className="rounded-2xl border-2 border-gray-200/80 px-3 py-2 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 transition-all duration-300 outline-none text-sm bg-white shadow-sm hover:shadow-md"
                      >
                        {[10, 20, 50, 100].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <span className="hidden sm:inline font-medium">
                        {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, totalRecords)} of {totalRecords}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="inline-flex items-center px-5 py-2.5 text-sm border-2 border-gray-200/80 rounded-2xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1.5" />
                        Previous
                      </motion.button>
                      <span className="text-sm font-bold text-gray-700 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                        {page + 1} <span className="text-gray-400 font-normal">/</span> {totalPages}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        className="inline-flex items-center px-5 py-2.5 text-sm border-2 border-gray-200/80 rounded-2xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1.5" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <EmptyState viewMode={viewMode} />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetailModal && selectedDeposit && (
          <DetailModal
            deposit={selectedDeposit}
            onClose={() => setShowDetailModal(false)}
            getStatusColors={getStatusColors}
            getStatusIcon={getStatusIcon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        {showApproveModal && (
          <ActionModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={confirmApprove}
            title="Approve Deposit"
            message="Are you sure you want to approve this deposit? This action will credit the user's account."
            deposit={selectedDeposit}
            remark={remark}
            setRemark={setRemark}
            isProcessing={isProcessing}
            actionColor="green"
            actionIcon={CheckCircle}
            formatCurrency={formatCurrency}
          />
        )}

        {showRejectModal && (
          <ActionModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onConfirm={confirmReject}
            title="Reject Deposit"
            message="Are you sure you want to reject this deposit? This action cannot be undone."
            deposit={selectedDeposit}
            remark={remark}
            setRemark={setRemark}
            isProcessing={isProcessing}
            actionColor="red"
            actionIcon={XCircle}
            formatCurrency={formatCurrency}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Deposits;