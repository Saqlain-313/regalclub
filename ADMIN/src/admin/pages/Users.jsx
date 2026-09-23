// src/pages/admin/Users.jsx

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  updateUserStatus,
} from "../redux/adminAuthSlice";
import {
  Users as UsersIcon,
  Search,
  Shield,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  EyeOff,
  X,
  Clock,
  DollarSign,
  Gift,
  AlertCircle,
  RefreshCw,
  Filter,
  Grid,
  List,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserX,
  Award,
  Calendar,
  MapPin,
  Smartphone,
  Hash,
  Link,
  Wallet,
  Activity,
  BarChart3,
  Key,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// ============================
// Country Data with Flags
// ============================

const countries = [
  { name: "India", flag: "https://flagcdn.com/w80/in.png", code: "IN" },
  { name: "Australia", flag: "https://flagcdn.com/w80/au.png", code: "AU" },
  { name: "Pakistan", flag: "https://flagcdn.com/w80/pk.png", code: "PK" },
  { name: "Bangladesh", flag: "https://flagcdn.com/w80/bd.png", code: "BD" },
  { name: "Nepal", flag: "https://flagcdn.com/w80/np.png", code: "NP" },
  { name: "ae", flag: "https://flagcdn.com/w80/ae.png", code: "UAE" },
  { name: "United States", flag: "https://flagcdn.com/w80/us.png", code: "US" },
  { name: "United Kingdom", flag: "https://flagcdn.com/w80/gb.png", code: "GB" },
  { name: "Canada", flag: "https://flagcdn.com/w80/ca.png", code: "CA" },
  { name: "Germany", flag: "https://flagcdn.com/w80/de.png", code: "DE" },
  { name: "France", flag: "https://flagcdn.com/w80/fr.png", code: "FR" },
  { name: "Italy", flag: "https://flagcdn.com/w80/it.png", code: "IT" },
  { name: "Spain", flag: "https://flagcdn.com/w80/es.png", code: "ES" },
  { name: "Brazil", flag: "https://flagcdn.com/w80/br.png", code: "BR" },
  { name: "Mexico", flag: "https://flagcdn.com/w80/mx.png", code: "MX" },
  { name: "Japan", flag: "https://flagcdn.com/w80/jp.png", code: "JP" },
  { name: "China", flag: "https://flagcdn.com/w80/cn.png", code: "CN" },
  { name: "Russia", flag: "https://flagcdn.com/w80/ru.png", code: "RU" },
  { name: "South Africa", flag: "https://flagcdn.com/w80/za.png", code: "ZA" },
  { name: "Egypt", flag: "https://flagcdn.com/w80/eg.png", code: "EG" },
  { name: "Nigeria", flag: "https://flagcdn.com/w80/ng.png", code: "NG" },
  { name: "Kenya", flag: "https://flagcdn.com/w80/ke.png", code: "KE" },
  { name: "Singapore", flag: "https://flagcdn.com/w80/sg.png", code: "SG" },
  { name: "Malaysia", flag: "https://flagcdn.com/w80/my.png", code: "MY" },
  { name: "Philippines", flag: "https://flagcdn.com/w80/ph.png", code: "PH" },
  { name: "Vietnam", flag: "https://flagcdn.com/w80/vn.png", code: "VN" },
  { name: "Thailand", flag: "https://flagcdn.com/w80/th.png", code: "TH" },
  { name: "Indonesia", flag: "https://flagcdn.com/w80/id.png", code: "ID" },
  { name: "Turkey", flag: "https://flagcdn.com/w80/tr.png", code: "TR" },
  { name: "Saudi Arabia", flag: "https://flagcdn.com/w80/sa.png", code: "SA" },
  { name: "Israel", flag: "https://flagcdn.com/w80/il.png", code: "IL" },
  { name: "New Zealand", flag: "https://flagcdn.com/w80/nz.png", code: "NZ" },
];

// ============================
// Helper Functions
// ============================

const getCountryFlag = (countryName) => {
  if (!countryName) return null;
  
  let country = countries.find(
    c => c.name.toLowerCase() === countryName.toLowerCase()
  );
  
  if (!country) {
    country = countries.find(
      c => countryName.toLowerCase().includes(c.name.toLowerCase()) ||
           c.name.toLowerCase().includes(countryName.toLowerCase())
    );
  }
  
  return country ? country.flag : null;
};

const getCountryCode = (countryName) => {
  if (!countryName) return null;
  
  let country = countries.find(
    c => c.name.toLowerCase() === countryName.toLowerCase()
  );
  
  if (!country) {
    country = countries.find(
      c => countryName.toLowerCase().includes(c.name.toLowerCase()) ||
           c.name.toLowerCase().includes(countryName.toLowerCase())
    );
  }
  
  return country ? country.code : null;
};

// ============================
// Currency Helpers
// ============================

const currencyByCountry = {
  India: "₹",
  Australia: "A$",
  Pakistan: "Rs",
  Bangladesh: "৳",
  Nepal: "रू",
  Dubai: "د.إ",
  "United Arab Emirates": "د.إ",
  "United States": "$",
  "United Kingdom": "£",
  Canada: "C$",
  Germany: "€",
  France: "€",
  Italy: "€",
  Spain: "€",
  Brazil: "R$",
  Mexico: "MX$",
  Japan: "¥",
  China: "¥",
  Russia: "₽",
  "South Africa": "R",
  Egypt: "E£",
  Nigeria: "₦",
  Kenya: "KSh",
  Singapore: "S$",
  Malaysia: "RM",
  Philippines: "₱",
  Vietnam: "₫",
  Thailand: "฿",
  Indonesia: "Rp",
  Turkey: "₺",
  "Saudi Arabia": "﷼",
  Israel: "₪",
  "New Zealand": "NZ$",
};

const getCurrencySymbol = (countryName) => {
  if (!countryName) return "₹";

  const normalized = String(countryName).trim().toLowerCase();

  const matchedCountry = Object.keys(currencyByCountry).find(
    (country) =>
      country.toLowerCase() === normalized ||
      normalized.includes(country.toLowerCase()) ||
      country.toLowerCase().includes(normalized)
  );

  return matchedCountry ? currencyByCountry[matchedCountry] : "₹";
};

const formatCurrency = (countryName, amount) => {
  const numericAmount = Number(amount) || 0;
  return `${getCurrencySymbol(countryName)}${numericAmount}`;
};

// ============================
// Custom Hooks
// ============================

const useUserManagement = () => {
  const dispatch = useDispatch();
  const {
    users,
    userCount,
    loading,
    error,
    message,
    statusUpdateLoading,
    statusUpdateError,
    admin,
  } = useSelector((state) => state.adminAuth);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const usersPerPage = 10;

  useEffect(() => {
    dispatch(getAllUsers());
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      dispatch(getAllUsers());
      toast.success(message);
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (statusUpdateError) toast.error(statusUpdateError);
  }, [statusUpdateError]);

  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm);
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return a.name?.localeCompare(b.name);
        case "credit":
          return (b.credit || 0) - (a.credit || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, searchTerm, filterRole, filterStatus, sortBy]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filteredAndSortedUsers.slice(startIndex, endIndex);
  }, [filteredAndSortedUsers, currentPage, usersPerPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);

  const stats = useMemo(() => ({
    total: userCount || 0,
    active: users?.filter(u => u.status === "active").length || 0,
    blocked: users?.filter(u => u.status === "blocked").length || 0,
    admins: users?.filter(u => u.role === "admin").length || 0,
  }), [users, userCount]);

  return {
    users: paginatedUsers,
    allUsers: filteredAndSortedUsers,
    stats,
    loading,
    statusUpdateLoading,
    statusChangeLoading,
    setStatusChangeLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    selectedUser,
    setSelectedUser,
    showModal,
    setShowModal,
    admin,
    totalPages,
    usersPerPage,
    dispatch,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
  };
};

// ============================
// Components
// ============================

// Flag Component
const CountryFlag = ({ countryName, size = "md" }) => {
  const flagUrl = getCountryFlag(countryName);
  const countryCode = getCountryCode(countryName);
  
  const sizeClasses = {
    sm: "w-5 h-4",
    md: "w-8 h-6",
    lg: "w-12 h-8",
    xl: "w-16 h-10",
  };

  if (!flagUrl) {
    return (
      <div className={`${sizeClasses[size] || sizeClasses.md} bg-gray-200 rounded flex items-center justify-center`}>
        <MapPin className="w-3 h-3 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size] || sizeClasses.md} rounded shadow-sm overflow-hidden flex-shrink-0 border border-gray-200 relative group`}>
      <img 
        src={flagUrl} 
        alt={`${countryName || 'Unknown'} flag`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
            <div class="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          `;
        }}
      />
      {countryName && (
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      )}
    </div>
  );
};

// Stats Cards - Responsive
const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Users",
      value: stats.total,
      icon: UsersIcon,
      color: "indigo",
      gradient: "from-indigo-500 to-blue-600",
    },
    {
      title: "Active Users",
      value: stats.active,
      icon: UserCheck,
      color: "green",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Blocked Users",
      value: stats.blocked,
      icon: UserX,
      color: "red",
      gradient: "from-red-500 to-rose-600",
    },
    {
      title: "Admins",
      value: stats.admins,
      icon: Crown,
      color: "purple",
      gradient: "from-purple-500 to-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{card.title}</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-0.5 sm:mt-1">{card.value}</p>
            </div>
            <div className={`bg-gradient-to-br ${card.gradient} p-2 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
              <card.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-500`}
              style={{ width: `${stats.total > 0 ? Math.min((card.value / stats.total) * 100, 100) : 0}%` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Loading Skeleton - Responsive
const UserSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden animate-pulse"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 mb-1.5 sm:mb-2"></div>
              <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 space-y-2">
            <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full"></div>
            <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-2/3"></div>
          </div>
          <div className="mt-3 sm:mt-4 flex gap-2">
            <div className="h-8 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg sm:rounded-xl flex-1"></div>
            <div className="h-8 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg sm:rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State - Responsive
const EmptyState = ({ hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center shadow-xl border-2 border-dashed border-gray-200"
  >
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full p-4 sm:p-6">
        <UsersIcon size={40} className="sm:w-14 sm:h-14 text-indigo-400" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-700">
        {hasFilters ? "No matching users" : "No users found"}
      </h3>
      <p className="text-sm sm:text-base text-gray-400 max-w-md px-2">
        {hasFilters
          ? "Try adjusting your search or filter criteria"
          : "Users will appear here once they register"}
      </p>
    </div>
  </motion.div>
);

// ✅ Password Cell Component - Hidden by default, toggle to show
const PasswordCell = ({ password }) => {
  const [show, setShow] = useState(false);
  const hasPassword = password && password !== "N/A";

  if (!hasPassword) {
    return <span className="text-[10px] sm:text-xs text-gray-400 italic">N/A</span>;
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <span className="font-mono text-[10px] sm:text-xs text-gray-700 truncate max-w-[70px] sm:max-w-[100px]">
        {show ? password : "•".repeat(Math.min(password.length, 10))}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShow((s) => !s);
        }}
        className="text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0 touch-manipulation"
        title={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <EyeOff size={12} className="sm:w-3.5 sm:h-3.5" />
        ) : (
          <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
        )}
      </button>
    </div>
  );
};

// User Card (Grid View) - Fully Responsive
const UserCard = ({
  user,
  onViewDetails,
  isCurrentAdmin,
  getRoleBadge,
  getStatusColor,
  getStatusIcon,
}) => {
  const isAdmin = user.role === "admin";
  const isCurrentAdminUser = isCurrentAdmin(user._id);
  const flagUrl = getCountryFlag(user.country);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border ${
        isAdmin ? "border-purple-200" : "border-gray-100"
      } hover:border-indigo-300`}
    >
      <div className={`p-4 sm:p-6 ${
        isAdmin ? "bg-gradient-to-br from-purple-50/50 to-indigo-50/50" : ""
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
              isAdmin ? "bg-gradient-to-br from-purple-500 to-violet-600" : "bg-gradient-to-br from-indigo-500 to-blue-600"
            } ${isCurrentAdminUser ? "ring-2 sm:ring-4 ring-indigo-300" : ""}`}>
              <span className="text-base sm:text-xl font-bold text-white">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
              {isCurrentAdminUser && (
                <div className="absolute -top-1 -right-1 bg-indigo-500 rounded-full p-0.5 sm:p-1">
                  <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="truncate text-sm sm:text-base">{user.name}</span>
                {isAdmin && (
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
                    <Crown className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    Admin
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 truncate">
                <Mail size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border flex-shrink-0 ${getStatusColor(user.status)}`}>
            {getStatusIcon(user.status)}
            <span className="hidden xs:inline">{user.status}</span>
          </span>
        </div>

        {/* Details - Responsive Grid */}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
            <Phone size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{user.mobile}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
            <DollarSign size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-emerald-600 truncate">{formatCurrency(user.country, user.credit)}</span>
          </div>
          {user.city && (
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 min-w-0 col-span-1">
              <MapPin size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.city}</span>
            </div>
          )}
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
            <Gift size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-amber-600 font-medium truncate">{user.totalReferrals || 0} refs</span>
          </div>
          {user.country && (
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-600 col-span-2 mt-0.5 sm:mt-1 min-w-0">
              <CountryFlag countryName={user.country} size="sm" />
              <span className="text-[10px] sm:text-xs text-gray-500 truncate">{user.country}</span>
              {getCountryCode(user.country) && (
                <span className="text-[10px] sm:text-xs text-gray-400 font-mono hidden sm:inline">({getCountryCode(user.country)})</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 sm:mt-4 flex gap-2">
          <button
            onClick={() => onViewDetails(user)}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg touch-manipulation"
          >
            <Eye size={14} className="sm:w-4 sm:h-4" />
            View Details
          </button>
          {isCurrentAdminUser && (
            <div className="px-2 sm:px-3 py-1.5 sm:py-2.5 bg-indigo-100 text-indigo-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium flex items-center gap-1 whitespace-nowrap">
              <Activity size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">You</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// User Row (List View) - Fully Responsive with Horizontal Scroll
const UserRow = ({
  user,
  onViewDetails,
  isCurrentAdmin,
  getRoleBadge,
  getStatusColor,
  getStatusIcon,
  index,
}) => {
  const isAdmin = user.role === "admin";
  const isCurrentAdminUser = isCurrentAdmin(user._id);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`hover:bg-gray-50 transition-colors duration-150 ${
        isAdmin ? "bg-purple-50/30" : ""
      } ${isCurrentAdminUser ? "bg-indigo-50/30" : ""}`}
    >
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${
            isAdmin ? "bg-gradient-to-br from-purple-500 to-violet-600" : "bg-gradient-to-br from-indigo-500 to-blue-600"
          } ${isCurrentAdminUser ? "ring-2 ring-indigo-400" : ""}`}>
            <span className="text-xs sm:text-sm font-medium text-white">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="ml-2 sm:ml-4 min-w-0">
            <div className="text-xs sm:text-sm font-medium text-gray-900 flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="truncate max-w-[60px] sm:max-w-[100px] lg:max-w-none">{user.name}</span>
              {isAdmin && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
                  <Crown className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  Admin
                </span>
              )}
              {isCurrentAdminUser && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs font-medium bg-indigo-100 text-indigo-700 whitespace-nowrap">
                  You
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
          <Mail size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none">{user.email}</span>
        </div>
      </td>
      <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Phone size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
          <span className="hidden xs:inline">{user.mobile}</span>
        </div>
      </td>
      {/* ✅ Password Column - hidden by default */}
      <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
        <PasswordCell password={user.plainPassword} />
      </td>
      <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="flex items-center gap-1 sm:gap-2">
          {user.country && (
            <CountryFlag countryName={user.country} size="sm" />
          )}
          <span className="hidden sm:inline">{getRoleBadge(user.role)}</span>
        </div>
      </td>
      <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold border ${getStatusColor(user.status)}`}>
          {getStatusIcon(user.status)}
          <span className="hidden xs:inline">{user.status}</span>
        </span>
      </td>
      <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onViewDetails(user)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-sm font-medium transition flex items-center gap-0.5 sm:gap-1 shadow-md hover:shadow-lg touch-manipulation"
          >
            <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">View</span>
          </button>
          {isCurrentAdminUser && (
            <span className="text-[8px] sm:text-xs text-indigo-600 font-medium bg-indigo-50 px-1 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
              Current
            </span>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

// User Details Modal - Fully Responsive
const UserDetailsModal = ({
  user,
  onClose,
  onStatusChange,
  isCurrentAdmin,
  statusChangeLoading,
  statusUpdateLoading,
  statusUpdateError,
  getStatusBadge,
  getRoleBadge,
  formatDate,
}) => {
  const [localStatusChangeLoading, setLocalStatusChangeLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleStatusChange = async (status) => {
    setLocalStatusChangeLoading(true);
    await onStatusChange(user._id, status);
    setLocalStatusChangeLoading(false);
  };

  const isLoading = statusChangeLoading || localStatusChangeLoading || statusUpdateLoading;
  const hasPassword = user.plainPassword && user.plainPassword !== "N/A";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Responsive */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-start sm:items-center z-10 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-sm flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <User className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              {user.country && (
                <CountryFlag countryName={user.country} size="md" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="truncate">{user.name}</span>
                <span className="hidden sm:inline">{getRoleBadge(user.role)}</span>
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 truncate">
                <Mail size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              {user.country && (
                <p className="text-indigo-200 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 truncate">
                  <MapPin size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
                  <span className="truncate">{user.country}</span>
                  {getCountryCode(user.country) && (
                    <span className="text-indigo-300 font-mono hidden xs:inline">({getCountryCode(user.country)})</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 touch-manipulation"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Body - Responsive */}
        <div className="p-4 sm:p-6">
          {/* Status Management */}
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-indigo-200 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Account Status</h3>
                <p className="text-xs sm:text-sm text-gray-600">Manage user account access</p>
              </div>
            </div>

            {isCurrentAdmin(user._id) ? (
              <div className="bg-indigo-100 border border-indigo-300 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center gap-1.5 sm:gap-2 text-indigo-700">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">You cannot modify your own account status</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <span className="text-xs sm:text-sm text-gray-600">Current Status:</span>
                    {getStatusBadge(user.status)}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      onClick={() => handleStatusChange("active")}
                      disabled={user.status === "active" || isLoading}
                      className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 sm:gap-2 ${
                        user.status === "active"
                          ? "bg-green-100 text-green-600 cursor-not-allowed border border-green-300"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
                      } disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
                    >
                      <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                      <span>Activate</span>
                      {user.status === "active" && (
                        <span className="ml-0.5 sm:ml-1 text-[8px] sm:text-xs bg-green-200 px-1 sm:px-2 py-0.5 rounded">Current</span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange("blocked")}
                      disabled={user.status === "blocked" || isLoading}
                      className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 sm:gap-2 ${
                        user.status === "blocked"
                          ? "bg-red-100 text-red-600 cursor-not-allowed border border-red-300"
                          : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md hover:shadow-lg"
                      } disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
                    >
                      <XCircle size={14} className="sm:w-4 sm:h-4" />
                      <span>Block</span>
                      {user.status === "blocked" && (
                        <span className="ml-0.5 sm:ml-1 text-[8px] sm:text-xs bg-red-200 px-1 sm:px-2 py-0.5 rounded">Current</span>
                      )}
                    </button>
                  </div>
                </div>
                
                {isLoading && (
                  <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-indigo-600 bg-indigo-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-indigo-600 border-t-transparent"></div>
                    <span className="text-xs sm:text-sm font-medium">Updating status...</span>
                  </div>
                )}
                {statusUpdateError && (
                  <div className="mt-3 sm:mt-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    {statusUpdateError}
                  </div>
                )}
              </>
            )}
          </div>

          {/* User Information Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Personal Info */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
              <div className="flex items-center gap-1.5 sm:gap-2 text-indigo-600 mb-2 sm:mb-3">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Personal Information</span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <InfoRow label="Full Name" value={user.name} />
                <InfoRow label="Email" value={user.email} icon={<Mail size={12} className="sm:w-3.5 sm:h-3.5" />} />
                <InfoRow label="Mobile" value={user.mobile} icon={<Phone size={12} className="sm:w-3.5 sm:h-3.5" />} />
                <InfoRow 
                  label="Country" 
                  value={
                    <div className="flex items-center gap-1 sm:gap-2">
                      {user.country && <CountryFlag countryName={user.country} size="sm" />}
                      <span className="text-xs sm:text-sm">{user.country || "N/A"}</span>
                      {user.country && getCountryCode(user.country) && (
                        <span className="text-[8px] sm:text-xs text-gray-400 font-mono">({getCountryCode(user.country)})</span>
                      )}
                    </div>
                  } 
                  icon={<MapPin size={12} className="sm:w-3.5 sm:h-3.5" />} 
                />
                <InfoRow label="City" value={user.city || "N/A"} icon={<MapPin size={12} className="sm:w-3.5 sm:h-3.5" />} />
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
              <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 mb-2 sm:mb-3">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Account Information</span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <InfoRow label="credit" value={formatCurrency(user.country, user.credit)} icon={<DollarSign size={12} className="sm:w-3.5 sm:h-3.5" />} highlight />
                <InfoRow label="Role" value={getRoleBadge(user.role)} />
                <InfoRow label="Demo Account" value={user.isDemo ? "Yes" : "No"} />
                {/* ✅ Plain Password Row - hidden by default with toggle */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-600 text-[10px] sm:text-sm flex items-center gap-0.5 sm:gap-1">
                    <Key size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Plain Password</span>
                    <span className="xs:hidden">Pwd</span>
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 max-w-[60%] sm:max-w-[70%]">
                    <span className="font-mono text-[10px] sm:text-xs font-medium text-gray-900 truncate text-right">
                      {!hasPassword
                        ? "N/A"
                        : showPassword
                        ? user.plainPassword
                        : "•".repeat(Math.min(user.plainPassword.length, 12))}
                    </span>
                    {hasPassword && (
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0 touch-manipulation"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff size={12} className="sm:w-3.5 sm:h-3.5" />
                        ) : (
                          <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <InfoRow label="User ID" value={user._id} monospace />
              </div>
            </div>
          </div>

          {/* Referral & Dates - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
              <div className="flex items-center gap-1.5 sm:gap-2 text-amber-600 mb-2 sm:mb-3">
                <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Referral Details</span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <InfoRow label="Referral Code" value={user.referralCode || "N/A"} monospace />
                <InfoRow label="Referred By" value={user.referredBy || "None"} />
                <InfoRow label="Total Referrals" value={user.totalReferrals || 0} />
                <InfoRow label="Referral Earnings" value={formatCurrency(user.country, user.referralEarning)} highlight />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
              <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600 mb-2 sm:mb-3">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Dates & Activity</span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <InfoRow label="Joined" value={formatDate(user.createdAt)} />
                <InfoRow label="Last Updated" value={formatDate(user.updatedAt)} />
                <InfoRow label="Last Withdrawal" value={user.lastWithdrawalDate ? formatDate(user.lastWithdrawalDate) : "None"} />
                <InfoRow label="Status" value={getStatusBadge(user.status)} />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition touch-manipulation"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Info Row Component - Responsive
const InfoRow = ({ label, value, icon, highlight, monospace }) => (
  <div className="flex justify-between items-center gap-2">
    <span className="text-gray-600 text-[10px] sm:text-sm flex items-center gap-0.5 sm:gap-1">
      {icon}
      <span className="hidden xs:inline">{label}</span>
      <span className="xs:hidden">{label.substring(0, 3)}</span>
    </span>
    <span className={`${highlight ? "font-bold text-emerald-600" : "font-medium text-gray-900"} ${monospace ? "font-mono text-[8px] sm:text-xs" : "text-xs sm:text-sm"} truncate text-right max-w-[60%] sm:max-w-[70%]`}>
      {value}
    </span>
  </div>
);

// Helper Functions
const getStatusColor = (status) => {
  if (status === "active") return "bg-green-100 text-green-800 border-green-200";
  if (status === "blocked") return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusIcon = (status) => {
  if (status === "active") return <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
  if (status === "blocked") return <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
  return <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
};

const getRoleBadge = (role) => {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 whitespace-nowrap">
        <Crown className="w-2 h-2 sm:w-3 sm:h-3" />
        <span className="hidden xs:inline">Admin</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap">
      <User className="w-2 h-2 sm:w-3 sm:h-3" />
      <span className="hidden xs:inline">User</span>
    </span>
  );
};

const getStatusBadge = (status) => {
  const colors = {
    active: "bg-green-100 text-green-800 border-green-200",
    blocked: "bg-red-100 text-red-800 border-red-200",
  };
  const icons = {
    active: <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
    blocked: <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${colors[status] || colors.active}`}>
      {icons[status] || icons.active}
      <span>{status?.charAt(0).toUpperCase() + status?.slice(1) || "Active"}</span>
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// ============================
// Main Component
// ============================

const Users = () => {
  const {
    users,
    allUsers,
    stats,
    loading,
    statusUpdateLoading,
    statusChangeLoading,
    setStatusChangeLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    selectedUser,
    setSelectedUser,
    showModal,
    setShowModal,
    admin,
    totalPages,
    usersPerPage,
    dispatch,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
  } = useUserManagement();

  // Handlers
  const handleStatusChange = useCallback(async (userId, status) => {
    setStatusChangeLoading(true);
    try {
      await dispatch(
        updateUserStatus({
          userId,
          status,
        })
      ).unwrap();
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({
          ...selectedUser,
          status: status
        });
      }
      
      await dispatch(getAllUsers());
      toast.success(`User ${status === 'active' ? 'activated' : 'blocked'} successfully!`);
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setStatusChangeLoading(false);
    }
  }, [dispatch, selectedUser, setStatusChangeLoading]);

  const handleViewDetails = useCallback((user) => {
    setSelectedUser(user);
    setShowModal(true);
  }, [setSelectedUser, setShowModal]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedUser(null);
  }, [setShowModal, setSelectedUser]);

  const isCurrentAdmin = useCallback((userId) => {
    return admin && admin._id === userId;
  }, [admin]);

  const handleRefresh = useCallback(() => {
    dispatch(getAllUsers());
    toast.info("🔄 Refreshing users...");
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setSortBy("newest");
  }, []);

  // Mobile filter toggle
  const toggleMobileFilters = useCallback(() => {
    setIsMobileFiltersOpen(prev => !prev);
  }, [setIsMobileFiltersOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4"
        >
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
              <Sparkles className="text-indigo-600 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              <span>User Management</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
              {allUsers.length} users found
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={handleRefresh}
              className="p-2 sm:p-2.5 bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:rotate-180 touch-manipulation"
            >
              <RefreshCw size={16} className="sm:w-5 sm:h-5 text-gray-600" />
            </button>

            {/* Mobile Filter Toggle */}
            <button
              onClick={toggleMobileFilters}
              className="lg:hidden p-2 sm:p-2.5 bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 touch-manipulation"
            >
              <Filter size={16} className="sm:w-5 sm:h-5 text-gray-600" />
            </button>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-md px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 sm:p-1.5 rounded-lg transition-all duration-200 touch-manipulation ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <Grid size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 sm:p-1.5 rounded-lg transition-all duration-200 touch-manipulation ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <List size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-md px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2">
              <label className="text-[10px] sm:text-xs text-gray-500 hidden xs:inline">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none text-[10px] sm:text-sm font-medium text-gray-700 cursor-pointer max-w-[80px] sm:max-w-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">A-Z</option>
                <option value="credit">credit</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filters - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          {/* Search Bar - Always Visible */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none bg-white/80 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters - Desktop */}
          <div className="hidden lg:flex gap-2 flex-wrap">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none bg-white/80 backdrop-blur-sm font-medium"
            >
              <option value="all">👥 All Roles</option>
              <option value="admin">👑 Admin</option>
              <option value="user">👤 User</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none bg-white/80 backdrop-blur-sm font-medium"
            >
              <option value="all">📊 All Status</option>
              <option value="active">✅ Active</option>
              <option value="blocked">❌ Blocked</option>
            </select>

            {(searchTerm || filterRole !== "all" || filterStatus !== "all") && (
              <button
                onClick={clearFilters}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-red-100 text-red-600 rounded-xl sm:rounded-2xl text-sm font-medium hover:bg-red-200 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 touch-manipulation"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Filters - Mobile Dropdown */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 space-y-3">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none bg-white font-medium"
                  >
                    <option value="all">👥 All Roles</option>
                    <option value="admin">👑 Admin</option>
                    <option value="user">👤 User</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none bg-white font-medium"
                  >
                    <option value="all">📊 All Status</option>
                    <option value="active">✅ Active</option>
                    <option value="blocked">❌ Blocked</option>
                  </select>

                  {(searchTerm || filterRole !== "all" || filterStatus !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm font-medium hover:bg-red-200 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <X size={16} />
                      Clear All Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Users Display */}
        {loading ? (
          <UserSkeleton count={viewMode === "grid" ? 6 : 4} />
        ) : (
          <AnimatePresence mode="popLayout">
            {allUsers.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {users.map((user) => (
                      <UserCard
                        key={user._id}
                        user={user}
                        onViewDetails={handleViewDetails}
                        isCurrentAdmin={isCurrentAdmin}
                        getRoleBadge={getRoleBadge}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                      <table className="min-w-[720px] sm:min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                          <tr>
                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell">Mobile</th>
                            {/* ✅ Password header */}
                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user, index) => (
                            <UserRow
                              key={user._id}
                              user={user}
                              onViewDetails={handleViewDetails}
                              isCurrentAdmin={isCurrentAdmin}
                              getRoleBadge={getRoleBadge}
                              getStatusColor={getStatusColor}
                              getStatusIcon={getStatusIcon}
                              index={index}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination - Responsive */}
                {totalPages > 1 && (
                  <div className="mt-4 sm:mt-6 flex flex-col xs:flex-row items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100">
                    <div className="text-[10px] sm:text-sm text-gray-600 text-center xs:text-left">
                      Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, allUsers.length)} of {allUsers.length}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-[10px] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 flex items-center gap-0.5 sm:gap-1 touch-manipulation"
                      >
                        <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Prev</span>
                      </button>
                      <div className="flex items-center gap-0.5 sm:gap-1">
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
                              className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
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
                        className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-[10px] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 flex items-center gap-0.5 sm:gap-1 touch-manipulation"
                      >
                        <span className="hidden xs:inline">Next</span>
                        <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState hasFilters={searchTerm !== "" || filterRole !== "all" || filterStatus !== "all"} />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={closeModal}
            onStatusChange={handleStatusChange}
            isCurrentAdmin={isCurrentAdmin}
            statusChangeLoading={statusChangeLoading || statusUpdateLoading}
            statusUpdateError={null}
            getStatusBadge={getStatusBadge}
            getRoleBadge={getRoleBadge}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;