import {
  ArrowLeft,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  BarChart3,
  Calendar,
  ChevronRight,
  Crown,
  Dice5,
  Gem,
  Grid3x3,
  History,
  Landmark,
  Moon,
  Sparkles,
  Sun,
  Trophy,
  User,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import matkabg from "../../assets/Home/matkabg.jpeg";
import { getActiveMarkets } from "../../redux/slices/marketSlice";

/* ============================================================
   IMAGE HELPERS
   ============================================================ */

const DEFAULT_MARKET_IMAGE =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80";

const GAME_TYPE_IMAGES = {
  single:
    "https://i.ibb.co/JwYrJyVn/Chat-GPT-Image-Aug-29-2026-11-07-30-AM.png",
  "single-patti":
    "https://i.ibb.co/wZ9YJRPH/Chat-GPT-Image-Aug-29-2026-10-44-14-AM.png",
  "double-patti":
    "https://i.ibb.co/qSH5WsR/Chat-GPT-Image-Aug-29-2026-11-01-10-AM.png",
  "triple-patti":
    "https://i.ibb.co/fYGbwZdz/Chat-GPT-Image-Aug-29-2026-11-01-13-AM.png",
  jodi: "https://i.ibb.co/5X47nGm7/Chat-GPT-Image-Aug-26-2026-04-52-31-PM.png",
  panna: "https://i.ibb.co/dwZ2Zy6v/Chat-GPT-Image-Aug-26-2026-04-54-23-PM.png",
  spot: "https://images.unsplash.com/photo-1518544889287-6d7a6d3f0f4a?auto=format&fit=crop&w=500&q=80",
  "half-sangam":
    "https://i.ibb.co/bqtmp8C/Chat-GPT-Image-Aug-29-2026-10-31-53-AM.png",
  "full-sangam":
    "https://i.ibb.co/6cwhRTJC/Chat-GPT-Image-Aug-29-2026-10-34-25-AM.png",
  "last-digit":
    "https://i.ibb.co/N2YkKkT9/Chat-GPT-Image-Aug-29-2026-10-40-13-AM.png",
  "first-digit":
    "https://i.ibb.co/RTZS9SPp/Chat-GPT-Image-Aug-29-2026-10-40-06-AM.png",
};

/* ============================================================
   MOCK DATA HELPERS
   ============================================================ */

const MOCK_AVATARS = [Crown, Landmark, Gem, Sparkles];

const seededDigit = (seed) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 10;
};

const mockTriplet = (marketId, salt = "") =>
  [0, 1, 2].map((i) => seededDigit(`${marketId}-${salt}-${i}`));

/* ============================================================
   TIME HELPERS
   ============================================================ */

const toMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = String(t).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const formatTime12 = (t) => {
  if (!t) return "--:--";
  const [h, m] = String(t).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${String(hour12).padStart(2, "0")}:${String(m || 0).padStart(
    2,
    "0",
  )} ${period}`;
};

/* ============================================================
   ACTIVE SESSION HELPER  ← KEY FIX
   ============================================================ */

// Returns the currently active marketArray entry (or the first one)
const getActiveSession = (market) => {
  if (!market?.marketArray?.length) return null;
  return market.marketArray.find((s) => s.isActive) || market.marketArray[0];
};

/* ============================================================
   MARKET STATUS
   ============================================================ */

const getMarketStatus = (openTime, closeTime) => {
  if (!openTime || !closeTime) return "closed";

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const openMin = toMinutes(openTime);
  const closeMin = toMinutes(closeTime);

  // Overnight market (close < open)
  if (closeMin < openMin) {
    if (nowMin >= openMin || nowMin <= closeMin) return "live";
    return "upcoming";
  }

  if (nowMin < openMin) return "upcoming";
  if (nowMin <= closeMin) return "live";
  return "closed";
};

/* ============================================================
   STATUS STYLES
   ============================================================ */

const STATUS_STYLES = {
  live: {
    dot: "bg-[#00E676]",
    text: "text-[#00E676]",
    bg: "bg-[#00E676]/10 border-[#00E676]/30",
    label: "LIVE",
  },
  upcoming: {
    dot: "bg-[#F1C40F]",
    text: "text-[#F1C40F]",
    bg: "bg-[#F1C40F]/10 border-[#F1C40F]/30",
    label: "UPCOMING",
  },
  closed: {
    dot: "bg-gray-500",
    text: "text-gray-400",
    bg: "bg-[#2a1b3d] border-[#3a2a4d]",
    label: "CLOSED",
  },
};

/* ============================================================
   GAME TYPES
   ============================================================ */

const GAME_TYPES = [
  {
    key: "single",
    label: "SINGLE",
    sub: "Choose One Number",
    mode: "digits",
    digits: ["7"],
    image: GAME_TYPE_IMAGES.single,
    icon: Dice5,
  },
  {
    key: "single-patti",
    label: "SINGLE PATTI",
    sub: "Choose Single Patti",
    mode: "icon",
    image: GAME_TYPE_IMAGES["single-patti"],
    icon: Dice5,
  },
  {
    key: "double-patti",
    label: "DOUBLE PATTI",
    sub: "Choose Double Patti",
    mode: "icon",
    image: GAME_TYPE_IMAGES["double-patti"],
    icon: Dice5,
  },
  {
    key: "triple-patti",
    label: "TRIPLE PATTI",
    sub: "Choose Triple Patti",
    mode: "icon",
    image: GAME_TYPE_IMAGES["triple-patti"],
    icon: Dice5,
  },
  {
    key: "jodi",
    label: "JODI",
    sub: "Choose Two Numbers",
    mode: "digits",
    digits: ["7", "8"],
    image: GAME_TYPE_IMAGES.jodi,
    icon: Grid3x3,
  },
  {
    key: "panna",
    label: "PANNA",
    sub: "Choose Panna",
    mode: "icon",
    image: GAME_TYPE_IMAGES.panna,
    icon: Dice5,
  },
  {
    key: "spot",
    label: "SPOT",
    sub: "Choose Spot Number",
    mode: "digits",
    digits: ["5"],
    image: GAME_TYPE_IMAGES.spot,
    icon: Gem,
  },
  {
    key: "half-sangam",
    label: "HALF-SANGAM",
    sub: "HALF-SANGAM",
    mode: "icon",
    image: GAME_TYPE_IMAGES["half-sangam"],
    icon: Moon,
  },
  {
    key: "full-sangam",
    label: "FULL-SANGAM",
    sub: "Full SANGAM",
    mode: "icon",
    image: GAME_TYPE_IMAGES["full-sangam"],
    icon: Sun,
  },
  {
    key: "last-digit",
    label: "LAST DIGIT",
    sub: "Choose Last Digit",
    mode: "icon",
    image: GAME_TYPE_IMAGES["last-digit"],
    icon: ArrowRightFromLine,
  },
  {
    key: "first-digit",
    label: "FIRST DIGIT",
    sub: "Choose First Digit",
    mode: "icon",
    image: GAME_TYPE_IMAGES["first-digit"],
    icon: ArrowLeftFromLine,
  },
];

/* ============================================================
   GAME TYPE NORMALIZER  ← handles "single-Patti" → "single-patti"
   ============================================================ */

const normalizeGameKey = (key) =>
  String(key || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

/* ============================================================
   ALLOWED GAME TYPES  ← uses BOTH digitType AND API gameTypes
   ============================================================ */

const getAllowedGameTypes = (market) => {
  if (!market) return [];

  // 1) Base list from digitType
  let byDigitType = [];
  if (market.digitType === "2-digit") {
    byDigitType = ["jodi", "last-digit", "first-digit"];
  } else if (market.digitType === "3-digit") {
    byDigitType = [
      "single",
      "single-patti",
      "double-patti",
      "triple-patti",
      "jodi",
      "panna",
      "half-sangam",
      "full-sangam",
      "last-digit",
      "first-digit",
    ];
  } else {
    return [];
  }

  // 2) Intersect with API-provided gameTypes (if present)
  const apiKeys = (market.gameTypes || []).map(normalizeGameKey);
  const allowed = apiKeys.length
    ? byDigitType.filter((k) => apiKeys.includes(k))
    : byDigitType;

  // 3) Map to full GAME_TYPES objects, preserving GAME_TYPES order
  return GAME_TYPES.filter((g) => allowed.includes(g.key));
};

const DEFAULT_VISIBLE_GAME_TYPES = 6;

/* ============================================================
   SAFE IMAGE
   ============================================================ */

const SafeImage = ({
  src,
  alt,
  className = "",
  fallbackIcon: FallbackIcon = Gem,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (!src || imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] ${className}`}
      >
        <FallbackIcon className="text-white" size={28} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setImageError(true)}
      className={className}
    />
  );
};

/* ============================================================
   COMPONENT
   ============================================================ */

const MatkaMarkets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMarkets, loading } = useSelector((state) => state.market);
  const { user } = useSelector((state) => state.auth);

  const walletcredit = user?.credit;

  // TopX Purple gradient (used for all primary buttons/tabs)
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  // Country-wise currency SYMBOL only.
  // credit value remains exactly as received from backend.
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

  const [activeTab, setActiveTab] = useState("live");
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [justOpened, setJustOpened] = useState(false);
  const [showAllGameTypes, setShowAllGameTypes] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState(null);

  const detailRef = useRef(null);
  const openedTimeoutRef = useRef(null);

  /* ============================================================
     FETCH MARKETS
     ============================================================ */

  useEffect(() => {
    dispatch(getActiveMarkets());
  }, [dispatch]);

  /* ============================================================
     MARKETS WITH SESSION + STATUS  ← KEY FIX
     ============================================================ */

  const marketsWithStatus = useMemo(
    () =>
      (activeMarkets || []).map((m) => {
        const session = getActiveSession(m);

        return {
          // Spread market root (name, image, digitType, gameTypes, etc.)
          ...m,

          // Flatten session fields to top level so rest of UI works
          openTime: session?.openTime || m.openTime,
          closeTime: session?.closeTime || m.closeTime,
          resultTime: session?.resultTime || m.resultTime,
          minBid: session?.minBid ?? m.minBid,
          maxBid: session?.maxBid ?? m.maxBid,
          winningNumber: session?.winningNumber ?? null,
          isResultDeclared: session?.isResultDeclared ?? false,
          marketDate: session?.marketDate || null,

          // Compute status from the session times
          status: getMarketStatus(session?.openTime, session?.closeTime),
        };
      }),
    [activeMarkets],
  );

  /* ============================================================
     DEFAULT MARKET
     ============================================================ */

  useEffect(() => {
    if (marketsWithStatus.length && !selectedMarketId) {
      setSelectedMarketId(marketsWithStatus[0]._id);
    }
  }, [marketsWithStatus, selectedMarketId]);

  /* ============================================================
     CLEANUP
     ============================================================ */

  useEffect(() => {
    return () => clearTimeout(openedTimeoutRef.current);
  }, []);

  /* ============================================================
     FILTERED MARKETS  ← "open" tab treated like "live"
     ============================================================ */

  const filteredMarkets = useMemo(() => {
    if (activeTab === "live" || activeTab === "open") {
      return marketsWithStatus.filter((m) => m.status === "live");
    }
    if (activeTab === "upcoming") {
      return marketsWithStatus.filter((m) => m.status === "upcoming");
    }
    return marketsWithStatus.filter((m) => m.status !== "closed");
  }, [marketsWithStatus, activeTab]);

  /* ============================================================
     SELECTED MARKET
     ============================================================ */

  const selectedMarket = marketsWithStatus.find(
    (m) => m._id === selectedMarketId,
  );

  /* ============================================================
     OPEN MARKET
     ============================================================ */

  const openMarket = (marketId) => {
    setSelectedMarketId(marketId);
    setJustOpened(true);

    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    clearTimeout(openedTimeoutRef.current);
    openedTimeoutRef.current = setTimeout(() => setJustOpened(false), 1200);
  };

  /* ============================================================
     PLACE BID
     ============================================================ */

  const handlePlaceBid = (marketId, gameType) => {
    const normalizedGameType = String(gameType || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");

    navigate(`/matka/place-bid/${marketId}`, {
      state: {
        gameType: normalizedGameType,
        marketId,
      },
    });
  };

  /* ============================================================
     SELECT GAME TYPE
     ============================================================ */

  const handleSelectGameType = (gameType) => {
    if (!selectedMarket) return;

    const allowedGameTypes = getAllowedGameTypes(selectedMarket);
    if (!allowedGameTypes.some((game) => game.key === gameType)) return;

    setSelectedGameType(gameType);
    setShowAllGameTypes(false);
    handlePlaceBid(selectedMarket._id, gameType);
  };

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0B0410]">
        <div className="relative text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-[#B45CFF]" />
          <p className="mt-4 text-sm font-medium text-gray-400">
            Loading markets...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     UI
     ============================================================ */

  const allowedGameTypes = getAllowedGameTypes(selectedMarket);

  return (
    <div className="scrollbar-hide relative h-screen overflow-y-auto bg-[#0B0410] pb-10">
      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="mx-auto max-w-6xl space-y-5 px-4 pt-4 sm:px-6">
        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-[#B45CFF] shadow-sm active:scale-95 transition hover:bg-[#2a1b3d]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#B45CFF]" />
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">
              Choose Market
            </h2>
          </div>
        </div>

        {/* ================= CHOOSE MARKET ================= */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex overflow-hidden rounded-full border border-[#2a1b3d] bg-[#1C0F2B] p-1 text-xs font-bold">
              {["live", "open", "upcoming"].map((tab) => {
                const style = STATUS_STYLES[tab === "open" ? "live" : tab];
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                      isActive
                        ? `${purpleGradient} text-white`
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {tab.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MARKET CARDS */}
          {filteredMarkets.length > 0 ? (
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
              {filteredMarkets.map((market, idx) => {
                const Avatar = MOCK_AVATARS[idx % MOCK_AVATARS.length];
                const style = STATUS_STYLES[market.status];
                const isSelected = market._id === selectedMarketId;

                const marketImage =
                  market.image ||
                  market.imageUrl ||
                  market.logo ||
                  DEFAULT_MARKET_IMAGE;

                return (
                  <div
                    key={market._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openMarket(market._id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && openMarket(market._id)
                    }
                    className={`relative w-[7rem] flex-shrink-0 cursor-pointer rounded-2xl border bg-[#1C0F2B] p-2 text-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition ${
                      isSelected
                        ? "border-[#B45CFF] ring-2 ring-[#B45CFF]/30"
                        : "border-[#2a1b3d]"
                    }`}
                  >
                    {/* STATUS BADGE */}
                    <span
                      className={`absolute right-3 top-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${style.bg} ${style.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                      />
                      {style.label}
                    </span>

                    {/* CIRCULAR AVATAR */}
                    <div className="mx-auto mt-2 h-16 w-16 overflow-hidden rounded-full ring-2 ring-[#B45CFF]/40">
                      <SafeImage
                        src={marketImage}
                        alt={market.name || "Market"}
                        fallbackIcon={Avatar}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="mt-3">
                      <p className="text-center text-sm font-extrabold text-white">
                        {market.name}
                      </p>

                      <p className="mt-2 text-center text-[11px] text-gray-400">
                        Open{" "}
                        <span className="font-semibold text-gray-200">
                          {formatTime12(market.openTime)}
                        </span>
                      </p>

                      <p className="text-center text-[11px] text-gray-400">
                        Close{" "}
                        <span className="font-semibold text-gray-200">
                          {formatTime12(market.closeTime)}
                        </span>
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openMarket(market._id);
                        }}
                        className={`mt-3 w-full rounded-lg ${purpleGradient} py-1.5 text-center text-xs font-bold text-white`}
                      >
                        {market.status === "live" ? "PLAY →" : "VIEW →"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openMarket(market._id);
                        }}
                        className="mt-1 w-full text-center text-[11px] font-semibold text-[#B45CFF] hover:text-[#C77AFF] transition"
                      >
                        RESULTS →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-10 text-center text-sm text-gray-500">
              No markets in this tab right now
            </div>
          )}
        </div>

        {/* ================= SELECTED MARKET DETAIL ================= */}
        {selectedMarket && (
          <div
            ref={detailRef}
            className={`relative overflow-hidden rounded-2xl scroll-mt-4 transition-all duration-300 sm:rounded-3xl ${
              justOpened ? "ring-4 ring-[#B45CFF]/50" : ""
            }`}
          >
            <div className="relative w-full aspect-[16/9]">
              <img
                src={matkabg}
                alt="Matka"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />

              <div
                className={`pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-[#B45CFF] px-3 py-1 text-[10px] font-bold text-white shadow transition-opacity duration-500 ${
                  justOpened ? "opacity-100" : "opacity-0"
                }`}
              >
                {selectedMarket.name} opened
              </div>

              {/* Market Name */}
              <div className="absolute left-[42%] top-[21%] flex h-[16%] w-[54%] items-center justify-center px-2">
                <h3 className="truncate text-center text-sm font-extrabold text-amber-900 sm:text-2xl">
                  {selectedMarket.name}
                </h3>
              </div>

              {/* Wallet credit */}
              <div className="absolute left-[70%] top-[51%] flex h-[10%] w-[30%] items-center justify-center px-1">
                <span className="text-[10px] font-bold text-gray-800 sm:text-base">
                  {getCurrencySymbol()}
                  {walletcredit?.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </span>
              </div>

              {/* Bottom row: 4 boxes */}
              <div className="absolute bottom-[12%] left-[12px] flex w-full justify-between px-[2%]">
                {/* Box 1: Status */}
                <div className="flex w-[23%] items-center justify-center">
                  <span className="truncate text-[13px] font-bold text-amber-900 sm:text-xs">
                    {selectedMarket.status === "live" ? "OPEN" : "CLOSED"}
                  </span>
                </div>

                {/* Box 2: Timing */}
                <div className="flex w-[23%] flex-col items-center justify-center gap-0.5 ml-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] font-bold text-gray-700 sm:text-[10px]">
                      {formatTime12(selectedMarket.openTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] font-bold text-gray-700 sm:text-[10px]">
                      {formatTime12(selectedMarket.closeTime)}
                    </span>
                  </div>
                </div>

                {/* Box 3: Today's Result — show Full Sangam result */}
                <div className="flex w-[23%] items-center justify-center gap-1">
                  {(() => {
                    let fullSangamResult = null;

                    try {
                      const parsedWinningNumber =
                        typeof selectedMarket.winningNumber === "string"
                          ? JSON.parse(selectedMarket.winningNumber)
                          : selectedMarket.winningNumber;

                      fullSangamResult = parsedWinningNumber?.["full-sangam"];
                    } catch {
                      fullSangamResult = null;
                    }

                    const result =
                      fullSangamResult ||
                      mockTriplet(
                        selectedMarket.marketId || selectedMarket._id,
                        "today",
                      ).join("");

                    return (
                      <span className="text-[10px] font-extrabold text-red-700 -ml-2">
                        {result}
                      </span>
                    );
                  })()}
                </div>

                {/* Box 4: Date — use marketDate if available */}
                <div className="flex w-[23%] items-center justify-center">
                  <span className="text-[12px] font-bold text-amber-900 sm:text-[10px]">
                    {(selectedMarket.marketDate
                      ? new Date(selectedMarket.marketDate)
                      : new Date(Date.now() - 86400000)
                    )
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })
                      .toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= GAME TYPES ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3x3 size={16} className="text-[#B45CFF]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">
                Choose Game Type
              </h2>
            </div>

            {allowedGameTypes.length > DEFAULT_VISIBLE_GAME_TYPES && (
              <button
                onClick={() => setShowAllGameTypes((prev) => !prev)}
                className="flex items-center gap-0.5 text-xs font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition"
              >
                {showAllGameTypes ? "SHOW LESS" : "VIEW ALL"}
                <ChevronRight
                  size={14}
                  className={`transition-transform duration-200 ${
                    showAllGameTypes ? "rotate-90" : ""
                  }`}
                />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 sm:gap-3">
            {allowedGameTypes
              .slice(
                0,
                showAllGameTypes
                  ? allowedGameTypes.length
                  : DEFAULT_VISIBLE_GAME_TYPES,
              )
              .map((gt) => {
                const Icon = gt.icon;
                const isSelected = selectedGameType === gt.key;

                return (
                  <div
                    key={gt.key}
                    className={`overflow-hidden rounded-2xl border bg-[#1C0F2B] text-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition ${
                      isSelected
                        ? "border-[#B45CFF] ring-2 ring-[#B45CFF]/30"
                        : "border-[#2a1b3d]"
                    }`}
                  >
                    <div className="relative h-24 w-full overflow-hidden sm:h-32">
                      <SafeImage
                        src={gt.image}
                        alt={gt.label}
                        fallbackIcon={Icon}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-2 sm:p-3">
                      <p className="mb-2 min-h-[16px] text-[8px] text-gray-500 sm:text-[10px]">
                        {gt.sub}
                      </p>

                      <button
                        onClick={() =>
                          selectedMarket && handleSelectGameType(gt.key)
                        }
                        className={`w-full rounded-xl ${purpleGradient} py-1.5 text-[10px] font-bold text-white transition-all active:scale-[0.98] sm:py-2 sm:text-xs disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={!selectedMarket}
                      >
                        {selectedMarket ? "PLAY →" : "SELECT MARKET"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ================= QUICK ACCESS ================= */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#B45CFF]" />
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">
              Quick Access
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Today's Result", icon: Trophy },
              { label: "Previous Results", icon: History },
              { label: "Detailed Chart", icon: BarChart3 },
              { label: "My Plays", icon: User },
            ].map((item) => (
              <button
                key={item.label}
                className="flex items-center justify-center gap-1 rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] py-2 text-[9px] font-medium text-gray-300 shadow-sm hover:bg-[#2a1b3d] hover:text-white transition"
              >
                <item.icon size={10} className="text-[#B45CFF]" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= RECENT RESULTS ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#B45CFF]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">
                Recent Results
              </h2>
            </div>

            <button className="flex items-center gap-0.5 text-xs font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition">
              VIEW ALL
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
            {filteredMarkets.map((market) => {
              let fullSangamResult = null;

              try {
                const parsedWinningNumber =
                  typeof market.winningNumber === "string"
                    ? JSON.parse(market.winningNumber)
                    : market.winningNumber;

                fullSangamResult = parsedWinningNumber?.["full-sangam"];
              } catch {
                fullSangamResult = null;
              }

              const result =
                fullSangamResult ||
                mockTriplet(market.marketId || market._id, "recent").join("");

              const dateLabel = (
                market.marketDate ? new Date(market.marketDate) : new Date()
              )
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
                .toUpperCase();

              return (
                <div
                  key={market._id}
                  className="w-36 flex-shrink-0 overflow-hidden rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] text-center shadow-sm"
                >
                  <div className="p-2">
                    <p className="text-[9px] font-semibold text-gray-500">
                      {dateLabel}
                    </p>

                    <p className="mb-2 truncate text-[11px] font-extrabold text-[#B45CFF]">
                      {market.name?.toUpperCase()}
                    </p>

                    <div className="flex justify-center gap-1">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-[#B45CFF]/15 text-xs font-bold text-[#C77AFF] border border-[#B45CFF]/30">
                        {result}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatkaMarkets;
