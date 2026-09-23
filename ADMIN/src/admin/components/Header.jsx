// src/components/admin/Header.jsx

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminProfile,
  adminLogout,
} from "../redux/adminAuthSlice";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Bell,
  Sparkles,
  Shield,
  UserCircle,
  Activity,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "react-toastify";

const Header = ({ setSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { admin } = useSelector((state) => state.adminAuth);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!admin) dispatch(getAdminProfile());
  }, [dispatch, admin]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(adminLogout());
      toast.success("👋 Logged out successfully!");
      navigate("/admin/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      "/admin/dashboard": "Dashboard",
      "/admin/users": "User Management",
      "/admin/banners": "Banner Management",
      "/admin/deposits": "Deposit Management",
      "/admin/withdrawals": "Withdrawal Management",
      "/admin/transactions": "Transactions",
      "/admin/reports": "Reports",
      "/admin/deposit-settings": "Deposit Settings",
      "/admin/withdrawal-settings": "Withdrawal Settings",
      "/admin/security-settings": "Security Settings",
    };
    return titles[path] || "Admin Panel";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    if (words.length === 1) return name.charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="h-16 flex items-center justify-between px-3 sm:px-5 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu size={22} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-3 py-1.5 rounded-lg border border-purple-200/20">
              <Sparkles size={16} className="text-purple-500" />
              <h2 className="text-sm font-semibold text-gray-800 truncate">
                {getPageTitle()}
              </h2>
            </div>
            <div className="sm:hidden">
              <h2 className="text-sm font-bold text-gray-800 truncate">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Quick Stats - Desktop */}
          <div className="hidden lg:flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={14} className="text-gray-400" />
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>{formatDate(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notification Bell */}


          {/* Admin Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-gray-100 transition-all duration-200 border-2 border-transparent hover:border-gray-200"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                  <span className="text-sm font-bold">
                    {getInitials(admin?.user?.name || "Admin")}
                  </span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <h4 className="font-semibold text-sm text-gray-800 leading-tight">
                  {admin?.user?.name || "Admin"}
                </h4>
                <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                  <Shield size={10} className="text-purple-500" />
                  {admin?.user?.role || "Admin"}
                </p>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-500 hidden md:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-slideDown">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                      <span className="text-lg font-bold">
                        {getInitials(admin?.user?.name || "Admin")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {admin?.user?.name || "Admin"}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
                        <Shield size={12} className="text-purple-500" />
                        {admin?.user?.role || "Admin"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {admin?.user?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/admin/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <UserCircle size={18} className="text-gray-400" />
                    <span className="text-sm font-medium">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <Settings size={18} className="text-gray-400" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/admin/dashboard');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <LayoutDashboard size={18} className="text-gray-400" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Logout */}
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                    <span className="ml-auto text-xs text-gray-400">Ctrl + L</span>
                  </button>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Logged in as {admin?.user?.role || 'Admin'}</span>
                    <span className="flex items-center gap-1">
                      <Activity size={10} />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;