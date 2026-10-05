import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Dice5,
  Gift,
  History,
  Home as HomeIcon,
  Key,
  LogIn,
  MessageCircle,
  Plus,
  PlusCircle,
  PlusIcon,
  PowerIcon,
  Sparkles,
  User,
  UserPlus,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // ======================================================
  // ✅ Handle userInfo array or object from API
  // ======================================================
  const userData = (() => {
    if (!user) return null;
    if (Array.isArray(user)) return user[0];
    if (Array.isArray(user?.userInfo)) return user.userInfo[0];
    if (user?.userInfo && typeof user.userInfo === "object")
      return user.userInfo;
    return user;
  })();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileAccountMenuOpen, setIsMobileAccountMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

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

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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
    { icon: HomeIcon, label: "Home", path: "https://regalclub.live/" },
    {
      icon: Dice5,
      label: "Matka",
      path: "https://regalclub.live/matka/markets",
    },
    {
      icon: Activity,
      label: "Activity",
      path: "https://regalclub.live/activity",
    },
    {
      icon: PowerIcon,
      label: "Powerhit",
      path: "https://regalclub.live/powerhit",
    },
    {
      icon: Wallet,
      label: "Wallet",
      path: "https://regalclub.live/wallet",
    },
    {
      icon: User,
      label: "Profile",
      path: "https://regalclub.live/profile",
    },
  ];

  const accountMenuItems = [
    { icon: User, label: "Profile", path: "/profile", color: "text-blue-400" },
    {
      icon: PlusCircle,
      label: "Deposit",
      path: "/deposit",
      color: "text-green-400",
    },
    {
      icon: History,
      label: "Deposit History",
      path: "/deposit-history",
      color: "text-purple-400",
    },
    {
      icon: ArrowUpRight,
      label: "Withdrawal",
      path: "/withdrawal",
      color: "text-orange-400",
    },
    {
      icon: ArrowDownLeft,
      label: "Withdrawal History",
      path: "/withdrawal-history",
      color: "text-red-400",
    },
    {
      icon: Gift,
      label: "Refer & Earn",
      path: "/promo",
      color: "text-pink-400",
    },
    {
      icon: ClipboardList,
      label: "All Bet History",
      path: "/bet-history",
      color: "text-indigo-400",
    },
    {
      icon: ClipboardList,
      label: "PowerHit History",
      path: "/powerhit/history",
      color: "text-indigo-400",
    },
    {
      icon: Key,
      label: "Change Password",
      path: "/change-password",
      color: "text-yellow-400",
    },
    {
      icon: MessageCircle,
      label: "Support Chat",
      path: "/trading/support-chat",
      color: "text-cyan-400",
    },
  ];

  const isActiveRoute = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // ======================================================
  // ✅ User data helpers — API response ke according
  // ======================================================

  const getUserDisplayName = () => {
    if (!userData) return "User";
    return userData?.name || userData?.username || "User";
  };

  const getUserSubtitle = () => {
    if (!userData) return "";
    return userData?.email || userData?.mobile || "";
  };

  const getUserUID = () => {
    if (!userData) return "";
    return userData?.userId || userData?._id || "";
  };

  const getUserMobile = () => {
    if (!userData) return "";
    return userData?.mobile || "";
  };

  const getInitial = () => {
    return getUserDisplayName().charAt(0).toUpperCase();
  };

  // ======================================================
  // ✅ Wallet balance
  // ======================================================
  const walletcredit = userData?.credit;

  // ======================================================
  // ✅ Currency Symbol by country code
  // ======================================================
  const getCurrencySymbol = () => {
    const country = String(userData?.country || "")
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

  // ======================================================
  // ✅ Avatar
  // ======================================================
  const getAvatar = () => {
    const name = getUserDisplayName();
    return (
      userData?.profilePic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=B45CFF&color=fff&size=128`
    );
  };

  const WinzoxLogo = ({ className = "h-48" }) => (
    <img
      src="https://i.ibb.co/fdGFXBrr/logo.png"
      alt="RegalClub"
      className={`${className} object-contain w-auto`}
    />
  );

  return (
    <>
      {/* ================= MAIN CONTENT ================= */}
      <div className="flex flex-col bg-[#0B0410]">
        {/* TOP NAVBAR */}
        <div className="h-16 border-b border-[#2a1b3d] bg-[#0B0410]/95 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/30 transform-gpu">
          <div className="h-full flex items-center px-4 sm:px-6">
            {/* Left - Menu & Logo */}
            <div className="flex items-center gap-2 ">
              <Link
                to="/"
                className="flex items-center transform-gpu hover:scale-105 transition-all duration-500"
              >
                <WinzoxLogo className="h-12 " />
              </Link>
            </div>

            <div className="flex-1"></div>

            {/* Right - Auth Buttons */}
            <div className="flex items-center gap-2">
              {/* Wallet Balance */}
              {userData &&
                userData?.credit !== undefined &&
                userData?.credit !== null && (
                  <Link
                    to="/wallet"
                    className="flex items-center gap-1 rounded-xl border border-[#9B59B6]/40 bg-[#1C0F2B] px-2 py-1.5 sm:gap-1.5 sm:px-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(155,89,182,0.2)] hover:border-[#9B59B6]/70"
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

                    <span className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white transition-transform duration-300 hover:scale-110">
                      <Plus size={15} strokeWidth={3} />
                    </span>
                  </Link>
                )}

              {/* User Avatar + Name */}
              {userData ? (
                <>
                  {/* Desktop */}
                  <Link
                    to="https://regalclub.live/account"
                    className="hidden  items-center gap-2 px-3 py-1.5 rounded-xl text-white hover:bg-[#1C0F2B] transition-all duration-500"
                  >
                    <img
                      src={getAvatar()}
                      alt={getUserDisplayName()}
                      className="w-7 h-7 rounded-full object-cover border-2 border-[#B45CFF] shadow-lg transform-gpu hover:scale-110 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=B45CFF&color=fff&size=128`;
                      }}
                    />
                    <span className="text-sm font-bold capitalize">
                      {getUserDisplayName()}
                    </span>
                  </Link>

                  {/* Mobile */}
                  <Link to="/account" className=" flex items-center">
                    <img
                      src={getAvatar()}
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#B45CFF] shadow-lg transform-gpu hover:scale-110 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=B45CFF&color=fff&size=128`;
                      }}
                    />
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50  perspective-1000">
        <div className="relative mx-auto max-w-full">
          <div className="relative h-[72px] bg-[#1C0F2B]/95 backdrop-blur-xl rounded-t-3xl border-t border-[#2a1b3d] shadow-[0_-8px_40px_rgba(0,0,0,0.6)] transform-gpu translate-y-0 transition-all duration-700 [transform-style:preserve-3d]">
            <div className="grid grid-cols-5 h-full w-full">
              {/* Home */}
              <Link
                to="https://regalclub.live/"
                className={`flex flex-col items-center justify-center text-[10px] transition-all duration-500 relative ${
                  location.pathname === "/"
                    ? "text-[#C77AFF]"
                    : "text-gray-500 hover:text-[#C77AFF]"
                } transform-gpu hover:scale-110 hover:-translate-y-2 [transform-style:preserve-3d]`}
              >
                <HomeIcon
                  size={20}
                  strokeWidth={location.pathname === "/" ? 2.5 : 2}
                  className={`transition-all duration-500 ${location.pathname === "/" ? "text-[#C77AFF]" : "text-gray-500"}`}
                />
                <span className="mt-0.5 font-bold text-[10px]">Home</span>
              </Link>

              {/* Activity */}
              <Link
                to="https://regalclub.live/activity"
                className={`flex flex-col items-center justify-center text-[10px] transition-all duration-500 relative ${
                  location.pathname === "/activity"
                    ? "text-[#C77AFF]"
                    : "text-gray-500 hover:text-[#C77AFF]"
                } transform-gpu hover:scale-110 hover:-translate-y-2 [transform-style:preserve-3d]`}
              >
                <Activity
                  size={20}
                  strokeWidth={location.pathname === "/activity" ? 2.5 : 2}
                  className={`transition-all duration-500 ${location.pathname === "/activity" ? "text-[#C77AFF]" : "text-gray-500"}`}
                />
                <span className="mt-0.5 font-bold text-[10px]">Activity</span>
              </Link>

              <div></div>

              {/* Wallet */}
              <Link
                to="https://regalclub.live/wallet"
                className={`flex flex-col items-center justify-center text-[10px] transition-all duration-500 relative ${
                  location.pathname === "/wallet"
                    ? "text-[#C77AFF]"
                    : "text-gray-500 hover:text-[#C77AFF]"
                } transform-gpu hover:scale-110 hover:-translate-y-2 [transform-style:preserve-3d]`}
              >
                <Wallet
                  size={20}
                  strokeWidth={location.pathname === "/wallet" ? 2.5 : 2}
                  className={`transition-all duration-500 ${location.pathname === "/wallet" ? "text-[#C77AFF]" : "text-gray-500"}`}
                />
                <span className="mt-0.5 font-bold text-[10px]">Wallet</span>
              </Link>

              {/* Account */}
              <Link
                to="https://regalclub.live/account"
                className={`flex flex-col items-center justify-center text-[10px] transition-all duration-500 relative ${
                  location.pathname === "/account"
                    ? "text-[#C77AFF]"
                    : "text-gray-500 hover:text-[#C77AFF]"
                } transform-gpu hover:scale-110 hover:-translate-y-2 [transform-style:preserve-3d]`}
              >
                <User
                  size={20}
                  strokeWidth={location.pathname === "/account" ? 2.5 : 2}
                  className={`transition-all duration-500 ${location.pathname === "/account" ? "text-[#C77AFF]" : "text-gray-500"}`}
                />
                <span className="mt-0.5 font-bold text-[10px]">Account</span>
              </Link>
            </div>

            {/* Floating Promo Button */}
            <Link
              to="https://regalclub.live/deposit"
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
      <div
        className={`fixed inset-0 z-50  transition-all duration-500 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsSidebarOpen(false);
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
        <div
          ref={sidebarRef}
          className={`fixed left-0 top-0 h-full w-80 bg-[#1C0F2B] backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out border-r border-[#2a1b3d] ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } perspective-1000`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full transform-gpu transition-all duration-700 [transform-style:preserve-3d]">
            {/* Header */}
            <div className="flex items-center justify-center p-4 border-b border-[#2a1b3d] bg-[#12061C]">
              <Link
                to="/"
                onClick={() => setIsSidebarOpen(false)}
                className="transform-gpu hover:scale-105 transition-all duration-500"
              >
                <WinzoxLogo className="h-16" />
              </Link>
            </div>

            {/* Tagline */}
            <div className="px-4 py-2 mx-4 mt-2 bg-[#12061C] rounded-2xl border border-[#2a1b3d] shadow-lg">
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 tracking-widest font-bold">
                <Sparkles
                  size={10}
                  className="text-[#B45CFF] animate-sparkle"
                />
                <span>PLAY • WIN • REPEAT</span>
                <Sparkles
                  size={10}
                  className="text-[#B45CFF] animate-sparkle"
                />
              </div>
            </div>

            {/* User Info */}
            {userData && (
              <div className="px-4 py-4 border-b border-[#2a1b3d] bg-[#12061C]">
                <Link
                  to="https://regalclub.live/account"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 group"
                >
                  <img
                    src={getAvatar()}
                    alt={getUserDisplayName()}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#B45CFF] shadow-lg transform-gpu group-hover:scale-110 transition-all duration-500"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=B45CFF&color=fff&size=128`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white capitalize group-hover:text-[#C77AFF] transition-colors">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {getUserSubtitle()}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-500 group-hover:text-[#C77AFF] transition-colors"
                  />
                </Link>
              </div>
            )}

            {/* Navigation */}
            <div className="px-3 py-4 overflow-y-auto h-[calc(100%-14rem)] scrollbar-thin scrollbar-thumb-[#2a1b3d] scrollbar-track-transparent">
              <div className="space-y-1.5">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-500 ${
                      isActiveRoute(item.path)
                        ? "bg-[#9B59B6]/15 text-[#C77AFF] border border-[#9B59B6]/40 scale-105"
                        : "text-gray-400 hover:text-white hover:bg-[#2a1b3d]"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={
                        isActiveRoute(item.path)
                          ? "text-[#C77AFF]"
                          : "text-gray-500"
                      }
                    />
                    <span className="text-sm font-bold">{item.label}</span>
                    {isActiveRoute(item.path) && (
                      <ChevronRight
                        size={16}
                        className="ml-auto text-[#C77AFF]"
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer — sirf Login/Register jab user login na ho */}
            {!userData && (
              <div className="absolute bottom-0 left-0 w-full border-t border-[#2a1b3d] p-4 bg-[#1C0F2B]">
                <div className="space-y-2.5">
                  <Link
                    to="https://regalclub.live/login"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-gray-400 hover:text-white hover:bg-[#2a1b3d] transition-all duration-500"
                  >
                    <LogIn size={20} className="text-gray-500" />
                    Login
                  </Link>
                  <Link
                    to="https://regalclub.live/register"
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 ${purpleGradient} text-white font-bold transition-all duration-500 transform-gpu hover:scale-105`}
                  >
                    <UserPlus size={20} />
                    Register Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
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
        .hover\\:scale-105 { transform: scale(1.05); }
        .hover\\:scale-110 { transform: scale(1.1); }
        .hover\\:-translate-y-1:hover { transform: translateY(-0.25rem); }
        .hover\\:-translate-y-2:hover { transform: translateY(-0.5rem); }
      `}</style>
    </>
  );
};

export default Header;
