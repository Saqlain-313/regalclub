import { ArrowDown, ArrowUp, Lock, LogOut, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import ChangePassword from "../components/ChangePassword";
import { showErrorToast } from "../hooks/toast";
import { getProfile } from "../redux/slices/authSlice";
import ProfileContent from "./ProfileContent";

// Helper function to get currency symbol based on country
const getCurrencySymbol = (country) => {
  const symbols = {
    IN: "₹",
    US: "$",
    GB: "£",
    EU: "€",
    JP: "¥",
    CN: "¥",
    AU: "$",
    CA: "$",
    SG: "S$",
    MY: "RM",
    AE: "د.إ",
    SA: "﷼",
    default: "₹",
  };
  return symbols[country] || symbols.default;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, loading, profileLoaded, error } = useSelector(
    (state) => state.auth,
  );

  // Get currency symbol based on user's country
  const currencySymbol = getCurrencySymbol(user?.country);

  // Format currency function with proper number formatting
  const formatCurrency = (amount) => {
    return `${currencySymbol}${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    if (!profileLoaded && !loading) {
      dispatch(getProfile());
    }
  }, [dispatch, profileLoaded, loading]);

  // Show profile errors using the same toast system as Withdrawal page
  useEffect(() => {
    if (error) {
      showErrorToast("Profile Error", error);
    }
  }, [error]);

  const menu = [
    { id: "profile", title: "Profile", icon: User },
    { id: "password", title: "Change Password", icon: Lock },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const getUserDisplayName = () => user?.name || user?.mobile || "User";
  const getUserId = () => user?.userId || "WINZOX0000";
  const getAvatar = () => {
    const name = user?.name || "User";

    return (
      user?.profilePic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
      )}&background=amber&color=fff&size=128`
    );
  };
  return (
    <div className="min-h-screen bg-[#0B0410]">
      <div className="h-full flex gap-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0 h-full">
          <DesktopSidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogout={handleLogout}
            navigate={navigate}
            getUserDisplayName={getUserDisplayName}
            getUserId={getUserId}
            getAvatar={getAvatar}
            formatCurrency={formatCurrency}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          navigate={navigate}
          getUserDisplayName={getUserDisplayName}
          getUserId={getUserId}
          getAvatar={getAvatar}
          menu={menu}
          formatCurrency={formatCurrency}
          currencySymbol={currencySymbol}
        />

        {/* Right Content */}
        <div className="flex-1 h-full overflow-auto sm:pb-20 md:pb-0 md:px-2">
          <div className="bg-[#1C0F2B] rounded-3xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            {activeTab === "profile" && (
              <ProfileContent
                formatCurrency={formatCurrency}
                currencySymbol={currencySymbol}
              />
            )}
            {activeTab === "password" && <ChangePassword />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DESKTOP SIDEBAR COMPONENT
// ============================================================
function DesktopSidebar({
  user,
  activeTab,
  setActiveTab,
  handleLogout,
  navigate,
  getUserDisplayName,
  getUserId,
  getAvatar,
  formatCurrency,
  currencySymbol,
}) {
  const menu = [
    { id: "profile", title: "Profile", icon: User },
    { id: "password", title: "Change Password", icon: Lock },
  ];

  return (
    <div className="h-full bg-[#1C0F2B] shadow-[0_4px_16px_rgba(0,0,0,0.5)] border-r border-[#2a1b3d] overflow-y-auto flex flex-col md:pl-2">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={getAvatar()}
              alt={getUserDisplayName()}
              className="w-20 h-20 rounded-full border-4 border-[#9B59B6] object-cover"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00E676] border-2 border-[#1C0F2B]"></span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">
              {getUserDisplayName()}
            </h2>
            <p className="text-gray-400">{getUserId()}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white p-5">
          <p className="text-sm opacity-90">Available credit</p>
          <h2 className="text-4xl font-bold mt-2">
            {formatCurrency(user?.credit || 0)}
          </h2>
        </div>
      </div>

      <div className="border-t border-[#2a1b3d] flex-shrink-0" />

      <div className="p-4 space-y-2 flex-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full rounded-xl px-5 py-4 flex items-center gap-3 font-semibold transition ${
                activeTab === item.id
                  ? "bg-[#9B59B6]/15 border border-[#9B59B6]/40 text-[#9B59B6]"
                  : "hover:bg-[#2a1b3d] text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {item.title}
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#2a1b3d] p-4 space-y-3 flex-shrink-0">
        <button
          onClick={() => navigate("/deposit")}
          className="w-full h-12 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
        >
          <ArrowUp size={18} />
          Deposit Funds
        </button>
        <button
          onClick={() => navigate("/withdraw")}
          className="w-full h-12 rounded-xl border border-[#2a1b3d] bg-[#12061C] text-gray-300 font-semibold flex items-center justify-center gap-2 hover:bg-[#2a1b3d] transition"
        >
          <ArrowDown size={18} />
          Withdraw Funds
        </button>
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MOBILE SIDEBAR COMPONENT
// ============================================================
function MobileSidebar({
  isOpen,
  setIsOpen,
  user,
  activeTab,
  setActiveTab,
  handleLogout,
  navigate,
  getUserDisplayName,
  getUserId,
  getAvatar,
  menu,
  formatCurrency,
  currencySymbol,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/70"
      />
      <div
        className={`absolute left-0 top-0 h-full w-80 bg-[#1C0F2B] transition-transform duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.7)] border-r border-[#2a1b3d] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#2a1b3d] p-5">
          <h2 className="text-xl font-bold text-white">Winzox</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-lg bg-[#2a1b3d] flex items-center justify-center text-gray-300 hover:bg-[#3a2a4d] transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4">
            <img
              src={getAvatar()}
              alt={getUserDisplayName()}
              className="w-16 h-16 rounded-full border-4 border-[#9B59B6] object-cover"
            />
            <div>
              <h3 className="font-bold text-lg text-white">
                {getUserDisplayName()}
              </h3>
              <p className="text-gray-400 text-sm">{getUserId()}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] p-4 text-white">
            <p className="text-sm opacity-90">Available credit</p>
            <h2 className="text-3xl font-bold mt-1">
              {formatCurrency(user?.credit || 0)}
            </h2>
          </div>
        </div>

        <div className="px-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full rounded-xl px-5 py-4 flex items-center gap-3 transition ${
                  activeTab === item.id
                    ? "bg-[#9B59B6]/15 border border-[#9B59B6]/40 text-[#9B59B6]"
                    : "hover:bg-[#2a1b3d] text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.title}
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 w-full border-t border-[#2a1b3d] p-4 space-y-3 bg-[#1C0F2B]">
          <button
            onClick={() => {
              navigate("/deposit");
              setIsOpen(false);
            }}
            className="w-full h-12 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-semibold"
          >
            Deposit
          </button>
          <button
            onClick={() => {
              navigate("/withdraw");
              setIsOpen(false);
            }}
            className="w-full h-12 rounded-xl border border-[#2a1b3d] bg-[#12061C] text-gray-300 font-semibold"
          >
            Withdraw
          </button>
          <button
            onClick={handleLogout}
            className="w-full h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
