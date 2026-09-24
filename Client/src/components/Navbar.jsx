import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Circle,
  Dice5,
  Home as HomeIcon,
  LogIn,
  LogOut,
  Plus,
  PlusIcon,
  Sparkles,
  User,
  UserPlus,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaPlaneDeparture } from "react-icons/fa";
import { GiChicken } from "react-icons/gi";
import { MdCasino, MdLocalActivity } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";

const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Body scroll lock
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const menuItems = [
    { icon: HomeIcon, label: "Home", path: "/" },
    { icon: Dice5, label: "Matka", path: "/matka/markets" },
    { icon: Activity, label: "Activity", path: "/activity" },
    // { icon: PowerIcon, label: "Powerhit", path: "/powerhit" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: User, label: "Account", path: "/account" },
    { icon: FaPlaneDeparture, label: "Aviator", path: "/aviator" },
    { icon: GiChicken, label: "Chicken Game", path: "/chicken" },
    { icon: MdLocalActivity, label: "Mines", path: "/minis" },
    { icon: MdCasino, label: "Live Casino", path: "/casino" },
    { icon: MdCasino, label: "Slot", path: "/slots" },
    // 👇 Game categories add karo
    // { icon: Sparkles, label: "Recommended", path: "/games/recommended" },
    // { icon: Zap, label: "Trending", path: "/games/trending" },
    // { icon: Gift, label: "Desi Khel", path: "/games/desi-khel" },
    // { icon: Trophy, label: "Top Games", path: "/games/top" },
    // { icon: Rocket, label: "Crash", path: "/games/crash" },
    // { icon: Egg, label: "Chicken", path: "/games/chicken" },
    // { icon: Plane, label: "Aviator", path: "/games/aviator" },
    // { icon: Circle, label: "Bingo", path: "/games/bingo" },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      setIsSidebarOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.name || user.username || "User";
  };

  const walletcredit = user?.credit;

  // Country-wise currency SYMBOL only.
  const getCurrencySymbol = () => {
    const country = String(user?.country || "")
      .trim()
      .toLowerCase();

    const countryAliases = {
      in: "IN",
      india: "IN",
      au: "AU",
      australia: "AU",
      pk: "PK",
      pakistan: "PK",
      bd: "BD",
      bangladesh: "BD",
      np: "NP",
      nepal: "NP",
      ae: "AE",
      uae: "AE",
      dubai: "AE",
      "united arab emirates": "AE",
      ca: "CA",
      canada: "CA",
      us: "US",
      usa: "US",
      "united states": "US",
      gb: "GB",
      uk: "GB",
      "united kingdom": "GB",
      nz: "NZ",
      "new zealand": "NZ",
      sg: "SG",
      singapore: "SG",
      my: "MY",
      malaysia: "MY",
      ph: "PH",
      philippines: "PH",
      jp: "JP",
      japan: "JP",
      cn: "CN",
      china: "CN",
      th: "TH",
      thailand: "TH",
      id: "ID",
      indonesia: "ID",
      vn: "VN",
      vietnam: "VN",
      tr: "TR",
      turkey: "TR",
      sa: "SA",
      "saudi arabia": "SA",
      za: "ZA",
      "south africa": "ZA",
      ng: "NG",
      nigeria: "NG",
      ke: "KE",
      kenya: "KE",
      br: "BR",
      brazil: "BR",
      mx: "MX",
      mexico: "MX",
      de: "DE",
      germany: "DE",
      fr: "FR",
      france: "FR",
      it: "IT",
      italy: "IT",
      es: "ES",
      spain: "ES",
    };

    const countryCode = countryAliases[country] || country.toUpperCase();

    const currencyMap = {
      IN: "₹",
      NP: "रू",
      AU: "A$",
      PK: "₨",
      BD: "৳",
      AE: "د.إ",
      CA: "C$",
      US: "$",
      GB: "£",
      NZ: "NZ$",
      SG: "S$",
      MY: "RM",
      PH: "₱",
      JP: "¥",
      CN: "¥",
      TH: "฿",
      ID: "Rp",
      VN: "₫",
      TR: "₺",
      SA: "﷼",
      ZA: "R",
      NG: "₦",
      KE: "KSh",
      BR: "R$",
      MX: "MX$",
      DE: "€",
      FR: "€",
      IT: "€",
      ES: "€",
    };

    return currencyMap[countryCode] || "₹";
  };

  const getAvatar = () => {
    const name = getUserDisplayName();
    return (
      user?.profilePic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
      )}&background=FBBF24&color=fff&size=128`
    );
  };

  // WINZOX Logo Component
  const WinzoxLogo = ({ className = "h-48" }) => (
    <img
      src="https://i.ibb.co/fdGFXBrr/logo.png"
      alt="WINZOX"
      className={`${className} object-contain w-auto`}
    />
  );

  return (
    <>
      {/* ================= DESKTOP SIDEBAR (Collapsible) ================= */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:bg-[#0B0410] md:backdrop-blur-xl md:z-50 shadow-2xl shadow-black/50 border-r border-[#2a1b3d] perspective-1000 transition-all duration-300 ${
          isCollapsed ? "md:w-20" : "md:w-72"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Collapse Toggle Button — exact center */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-1/2 z-[60] w-7 h-7 rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border-2 border-[#0B0410] shadow-[0_0_12px_#B45CFF,0_0_24px_rgba(139,43,255,0.75)] flex items-center justify-center text-white hover:scale-110 transition-all duration-300"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>

          {/* Brand with WINZOX Logo */}
          <div
            className={`flex items-center justify-center ${
              isCollapsed ? "h-20 px-2" : "h-32 px-6"
            } transition-all duration-300`}
          >
            <Link to="/" className="flex items-center group">
              <div className="relative">
                {isCollapsed ? (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75)] flex items-center justify-center">
                    <span className="text-white font-black text-lg">R</span>
                  </div>
                ) : (
                  <WinzoxLogo className="h-52" />
                )}
              </div>
            </Link>
          </div>

          {/* Tagline (hide when collapsed) */}
          {!isCollapsed && (
            <div className="px-6 py-3 bg-[#1C0F2B] mx-4 mt-3 rounded-2xl border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transform-gpu hover:translate-z-6 hover:scale-105 transition-all duration-500 [transform-style:preserve-3d]">
              <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest">
                <Sparkles
                  size={14}
                  className="text-[#9B59B6] animate-sparkle"
                />
                <span className="text-gray-300">PLAY • WIN • REPEAT</span>
                <Sparkles
                  size={14}
                  className="text-[#9B59B6] animate-sparkle"
                />
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav
            className={`flex-1 ${
              isCollapsed ? "px-2" : "px-4"
            } py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a1b3d] scrollbar-track-transparent relative z-10 transition-all duration-300`}
          >
            <div className="space-y-1.5">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  title={isCollapsed ? item.label : ""}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "gap-3"
                  } rounded-2xl ${
                    isCollapsed ? "px-2 py-3" : "px-4 py-3.5"
                  } transition-all duration-500 group relative cursor-pointer ${
                    isActiveRoute(item.path)
                      ? "bg-gradient-to-r from-[#9B59B6]/20 to-[#8E44AD]/10 text-[#9B59B6] shadow-xl shadow-[#9B59B6]/15 border border-[#9B59B6]/40 transform-gpu hover:translate-x-3 hover:scale-105 hover:shadow-2xl hover:shadow-[#9B59B6]/25 [transform-style:preserve-3d]"
                      : "text-gray-400 hover:text-white hover:bg-[#1C0F2B] transform-gpu hover:translate-x-3 hover:scale-105 hover:shadow-xl [transform-style:preserve-3d]"
                  }`}
                  style={{ pointerEvents: "auto" }}
                >
                  {isActiveRoute(item.path) && !isCollapsed && (
                    <div className="absolute left-0 top-[9%] -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-[#9B59B6] to-[#8E44AD] rounded-r-full shadow-lg shadow-[#9B59B6]/50 animate-pulse-slow pointer-events-none"></div>
                  )}
                  <div className="relative pointer-events-none">
                    <item.icon
                      size={22}
                      className={`transition-all duration-500 group-hover:scale-110 group-hover:rotate-y-6 [transform-style:preserve-3d] ${
                        isActiveRoute(item.path)
                          ? "text-[#9B59B6]"
                          : "text-gray-500 group-hover:text-gray-300"
                      }`}
                    />
                    {isActiveRoute(item.path) && (
                      <div className="absolute inset-0 bg-[#9B59B6]/20 blur-xl rounded-full animate-pulse-slow pointer-events-none"></div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span
                        className={`text-sm font-bold pointer-events-none ${
                          isActiveRoute(item.path)
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-200"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isActiveRoute(item.path) && (
                        <ChevronRight
                          size={18}
                          className="ml-auto text-[#9B59B6] transform-gpu group-hover:translate-x-2 transition-transform duration-300 pointer-events-none"
                        />
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer with Logout */}
          <div
            className={`border-t border-[#2a1b3d] ${
              isCollapsed ? "p-2" : "p-4"
            } transition-all duration-300`}
          >
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                disabled={loading}
                title={isCollapsed ? "Logout" : ""}
                className={`flex items-center ${
                  isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3.5"
                } text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full rounded-2xl transition-all duration-500 group disabled:opacity-50 transform-gpu hover:scale-105 hover:shadow-xl [transform-style:preserve-3d]`}
              >
                <LogOut
                  size={20}
                  className="text-gray-500 group-hover:text-red-400 transition-colors duration-300 group-hover:rotate-y-6 [transform-style:preserve-3d]"
                />
                {!isCollapsed &&
                  (loading ? (
                    <span className="flex items-center gap-2">
                      <Circle className="animate-spin" size={16} />
                      Logging out...
                    </span>
                  ) : (
                    "Logout"
                  ))}
              </button>
            ) : (
              <div className="space-y-2.5">
                <Link
                  to="/login"
                  title={isCollapsed ? "Login" : ""}
                  className={`flex items-center ${
                    isCollapsed
                      ? "justify-center px-2 py-3"
                      : "gap-3 px-4 py-3.5"
                  } text-gray-400 hover:text-white hover:bg-[#1C0F2B] rounded-2xl transition-all duration-500 group transform-gpu hover:translate-x-2 hover:scale-105 [transform-style:preserve-3d]`}
                >
                  <LogIn
                    size={20}
                    className="text-gray-500 group-hover:text-gray-300 transition-colors duration-300 group-hover:rotate-y-6 [transform-style:preserve-3d]"
                  />
                  {!isCollapsed && "Login"}
                </Link>
                <Link
                  to="/register"
                  title={isCollapsed ? "Register" : ""}
                  className={`flex items-center justify-center ${
                    isCollapsed ? "gap-0 px-2 py-3" : "gap-2 px-4 py-3.5"
                  } rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-bold transition-all duration-500 group transform-gpu hover:scale-105 hover:-translate-y-1 hover:rotate-y-3 [transform-style:preserve-3d]`}
                >
                  <UserPlus
                    size={20}
                    className="group-hover:scale-110 group-hover:rotate-y-6 transition-all duration-500 [transform-style:preserve-3d]"
                  />
                  {!isCollapsed && "Register Now"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div
        className={`${
          isCollapsed ? "md:ml-20" : "md:ml-72"
        } flex flex-col min-h-screen bg-[#0B0410] transition-all duration-300`}
      >
        {/* ================= TOP NAVBAR (Fixed & Full Width) ================= */}
        <div
          className={`h-16 border-b border-[#2a1b3d] bg-[#0B0410]/95 backdrop-blur-xl fixed top-0 right-0 z-40 shadow-lg shadow-black/30 transition-all duration-300 ${
            isCollapsed ? "left-0 md:left-20" : "left-0 md:left-72"
          }`}
        >
          <div className="h-full flex items-center justify-between px-4 sm:px-6">
            {/* ================= LEFT - LOGO ================= */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                to="/"
                className="flex items-center transform-gpu hover:scale-105 transition-all duration-500"
              >
                <WinzoxLogo className="h-[3rem] md:h-10" />
              </Link>
            </div>

            {/* ================= RIGHT - WALLET + ACCOUNT ================= */}
            <div className="flex items-center gap-2">
              {/* Wallet credit */}
              {isAuthenticated && (
                <Link
                  to="/wallet"
                  className="flex items-center gap-1.5 rounded-xl border border-[#9B59B6]/40 bg-[#1C0F2B] px-2.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(155,89,182,0.2)] hover:border-[#9B59B6]/70"
                >
                  <Wallet
                    size={17}
                    strokeWidth={2.2}
                    className="text-[#9B59B6]"
                  />

                  <span className="text-xs font-bold text-gray-200 sm:text-sm">
                    {getCurrencySymbol()}
                    {Number(walletcredit || 0).toFixed(2)}
                  </span>

                  {/* Plus Button */}
                  <span className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white transition-transform duration-300 hover:scale-110">
                    <Plus size={15} strokeWidth={3} />
                  </span>
                </Link>
              )}

              {/* ================= AUTHENTICATED USER ================= */}
              {isAuthenticated ? (
                <>
                  {/* Desktop Avatar + Name */}
                  <Link
                    to="/account"
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-white hover:bg-[#1C0F2B] transition-all duration-500"
                  >
                    <img
                      src={getAvatar()}
                      alt={getUserDisplayName()}
                      className="w-7 h-7 rounded-full object-cover border-2 border-[#9B59B6] shadow-lg transform-gpu hover:scale-110 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          getUserDisplayName(),
                        )}&background=FBBF24&color=fff&size=128`;
                      }}
                    />

                    <span className="text-sm font-bold">
                      {getUserDisplayName()}
                    </span>
                  </Link>

                  {/* Mobile Avatar */}
                  <Link to="/account" className="md:hidden flex items-center">
                    <img
                      src={getAvatar()}
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#9B59B6] shadow-lg transform-gpu hover:scale-110 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          getUserDisplayName(),
                        )}&background=FBBF24&color=fff&size=128`;
                      }}
                    />
                  </Link>
                </>
              ) : (
                <>
                  {/* Login */}
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-[#2a1b3d] bg-[#1C0F2B] text-gray-300 text-sm hover:text-white hover:border-[#9B59B6]/50 transition-all duration-300"
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:inline">LOGIN</span>
                    <span className="sm:hidden">Login</span>
                  </Link>

                  {/* Register */}
                  <Link
                    to="/register"
                    className="flex ml-3 items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white text-sm font-bold transition-all duration-300"
                  >
                    <UserPlus size={16} />
                    <span className="hidden sm:inline">REGISTER</span>
                    <span className="sm:hidden">Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= PAGE CONTENT (pt-16 for fixed navbar) ================= */}
        <div className="flex-1 pt-16 pb-[4rem] md:pb-6">{children}</div>
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden perspective-1000">
        <div className="relative mx-auto max-w-full">
          <div className="relative h-[72px] bg-[#1C0F2B]/95 backdrop-blur-xl rounded-t-3xl border-t border-[#2a1b3d] shadow-[0_-8px_40px_rgba(0,0,0,0.6)] transform-gpu translate-y-0 transition-all duration-700 [transform-style:preserve-3d]">
            {/* Grid Layout - 5 columns */}
            <div className="grid grid-cols-5 h-full w-full">
              {/* Home */}
              <Link
                to="/"
                className={`flex flex-col items-center justify-center text-[10px] transition-all duration-500 relative ${
                  location.pathname === "/"
                    ? "text-[#9B59B6]"
                    : "text-gray-500 hover:text-[#9B59B6]"
                } transform-gpu hover:scale-110 hover:-translate-y-2 hover:rotate-y-6 [transform-style:preserve-3d]`}
              >
                <HomeIcon
                  size={20}
                  strokeWidth={location.pathname === "/" ? 2.5 : 2}
                  className={`transition-all duration-500 ${
                    location.pathname === "/"
                      ? "text-[#9B59B6]"
                      : "text-gray-500"
                  }`}
                />
                <span className="mt-0.5 font-bold text-[10px]">Home</span>
                {location.pathname === "/" && (
                  <div className="absolute top-[3.5rem] w-8 h-1 bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] rounded-full shadow-lg shadow-[#9B59B6]/40 animate-pulse-slow"></div>
                )}
              </Link>

              {/* Activity */}
              <Link
                to="/activity"
                className={`flex flex-col items-center justify-center text-[10px] transition-all duration-500 relative ${
                  location.pathname === "/activity"
                    ? "text-[#9B59B6]"
                    : "text-gray-500 hover:text-[#9B59B6]"
                } transform-gpu hover:scale-110 hover:-translate-y-2 hover:rotate-y-6 [transform-style:preserve-3d]`}
              >
                <Activity
                  size={20}
                  strokeWidth={location.pathname === "/activity" ? 2.5 : 2}
                  className={`transition-all duration-500 ${
                    location.pathname === "/activity"
                      ? "text-[#9B59B6]"
                      : "text-gray-500"
                  }`}
                />
                <span className="mt-0.5 font-bold text-[10px]">Activity</span>
                {location.pathname === "/activity" && (
                  <div className="absolute top-[3.5rem] w-8 h-1 bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] rounded-full shadow-lg shadow-[#9B59B6]/40 animate-pulse-slow"></div>
                )}
              </Link>

              {/* Empty Space for Floating Button */}
              <div></div>

              {/* Wallet */}
              <Link
                to="/wallet"
                className={`flex flex-col items-center justify-center text-[10px] transition-all duration-500 relative ${
                  location.pathname === "/wallet"
                    ? "text-[#9B59B6]"
                    : "text-gray-500 hover:text-[#9B59B6]"
                } transform-gpu hover:scale-110 hover:-translate-y-2 hover:rotate-y-6 [transform-style:preserve-3d]`}
              >
                <Wallet
                  size={20}
                  strokeWidth={location.pathname === "/wallet" ? 2.5 : 2}
                  className={`transition-all duration-500 ${
                    location.pathname === "/wallet"
                      ? "text-[#9B59B6]"
                      : "text-gray-500"
                  }`}
                />
                <span className="mt-0.5 font-bold text-[10px]">Wallet</span>
                {location.pathname === "/wallet" && (
                  <div className="absolute top-[3.5rem] w-8 h-1 bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] rounded-full shadow-lg shadow-[#9B59B6]/40 animate-pulse-slow"></div>
                )}
              </Link>

              {/* Profile */}
              <Link
                to="/account"
                className={`flex flex-col items-center justify-center text-[10px] transition-all duration-500 relative ${
                  location.pathname === "/profile"
                    ? "text-[#9B59B6]"
                    : "text-gray-500 hover:text-[#9B59B6]"
                } transform-gpu hover:scale-110 hover:-translate-y-2 hover:rotate-y-6 [transform-style:preserve-3d]`}
              >
                <User
                  size={20}
                  strokeWidth={location.pathname === "/account" ? 2.5 : 2}
                  className={`transition-all duration-500 ${
                    location.pathname === "/account"
                      ? "text-[#9B59B6]"
                      : "text-gray-500"
                  }`}
                />
                <span className="mt-0.5 font-bold text-[10px]">Account</span>
                {location.pathname === "/account" && (
                  <div className="absolute top-[3.5rem] w-8 h-1 bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] rounded-full shadow-lg shadow-[#9B59B6]/40 animate-pulse-slow"></div>
                )}
              </Link>
            </div>

            {/* Floating Promo Button with 3D */}
            <Link
              to="/deposit"
              className="absolute left-1/2 -translate-x-1/2 -top-7 group perspective-1000"
            >
              <div className="relative transform-gpu transition-all duration-700 hover:rotate-y-12 hover:scale-110 hover:-translate-y-2 [transform-style:preserve-3d]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#B45CFF] to-[#7418F5] blur-2xl opacity-30 group-hover:opacity-70 transition-all duration-700 animate-pulse-slow"></div>
                <div className="w-[78px] h-[78px] rounded-full bg-[#1C0F2B] shadow-2xl relative border border-[#2a1b3d]">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] flex flex-col items-center justify-center group-hover:scale-105 transition-all duration-500">
                    <span className="text-3xl font-bold text-white leading-none mt-0.5">
                      <PlusIcon
                        size={42}
                        className="text-white text-3xl"
                        strokeWidth={3}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MOBILE SIDEBAR ================= */}

      <style>{`
        .bg-surface { background-color: #0B0410; }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) rotateX(-15deg) scale(0.95); }
          to { opacity: 1; transform: translateY(0) rotateX(0) scale(1); }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #2a1b3d; border-radius: 9999px; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(180deg); }
        }
        .animate-sparkle { animation: sparkle 2.5s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
        .transform-gpu { transform: translate3d(0, 0, 0); backface-visibility: hidden; }
        [transform-style="preserve-3d"] { transform-style: preserve-3d; }
        .hover\\:translate-x-2:hover { transform: translateX(0.5rem); }
        .hover\\:translate-x-3:hover { transform: translateX(0.75rem); }
        .hover\\:translate-z-6:hover { transform: translateZ(1.5rem); }
        .hover\\:translate-z-8:hover { transform: translateZ(2rem); }
        .hover\\:rotate-y-2:hover { transform: rotateY(2deg); }
        .hover\\:rotate-y-3:hover { transform: rotateY(3deg); }
        .hover\\:rotate-y-6:hover { transform: rotateY(6deg); }
        .hover\\:rotate-y-12:hover { transform: rotateY(12deg); }
        .hover\\:scale-105 { transform: scale(1.05); }
        .hover\\:scale-110 { transform: scale(1.1); }
        .hover\\:-translate-y-1:hover { transform: translateY(-0.25rem); }
        .hover\\:-translate-y-2:hover { transform: translateY(-0.5rem); }
        .hover\\:-translate-y-3:hover { transform: translateY(-0.75rem); }
        .hover\\:shadow-2xl:hover { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
      `}</style>
    </>
  );
};

export default Navbar;
