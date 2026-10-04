import {
  AlertCircle,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  DollarSign,
  History,
  RefreshCw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearBidError, getBiddingHistory } from "../../redux/slices/bidSlice";
import { getCurrencyRates } from "../../redux/slices/currencyRateSlice";

// =========================================================
// COUNTRY NORMALIZATION
// =========================================================
const COUNTRY_ALIASES = {
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
};

const normalizeCountryCode = (country) => {
  if (!country) return "";
  const key = String(country).trim().toLowerCase();
  return COUNTRY_ALIASES[key] || key.toUpperCase();
};

// =========================================================
// CURRENCY SYMBOL MAP
// Amount kabhi convert nahi hota — sirf symbol badalta hai.
// =========================================================
const COUNTRY_TO_CURRENCY = {
  IN: "INR",
  AU: "AUD",
  PK: "PKR",
  BD: "BDT",
  NP: "NPR",
  AE: "AED",
};

const CURRENCY_SYMBOLS = {
  INR: "₹",
  AUD: "A$",
  PKR: "₨",
  BDT: "৳",
  NPR: "रू",
  AED: "د.إ",
  USD: "$",
};

const getCurrencySymbol = (country) => {
  const code = normalizeCountryCode(country);
  const currency = COUNTRY_TO_CURRENCY[code] || "INR";
  return CURRENCY_SYMBOLS[currency] || "₹";
};

const getCurrencySymbolByCode = (currencyCode) =>
  CURRENCY_SYMBOLS[(currencyCode || "INR").toUpperCase()] || "₹";

// =========================================================

const BidsHistory = () => {
  const dispatch = useDispatch();

  const bidState = useSelector((state) => state.bid) || {};
  const {
    bids = [],
    loading = false,
    pagination = { total: 0, pages: 0, page: 1, limit: 10 },
    error = null,
    message = null,
  } = bidState;

  const { user } = useSelector((state) => state.auth);

  // Currency rates (fetch ki ja rahi hain, par conversion nahi hogi)
  const currencies = useSelector((state) => state.currencyRate?.currencies);

  const [filter, setFilter] = useState({
    status: "",
    page: 1,
    limit: 10,
  });
  const [actionMessage, setActionMessage] = useState(null);

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  useEffect(() => {
    dispatch(getBiddingHistory(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    dispatch(getCurrencyRates());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setActionMessage({ type: "error", text: error });
      setTimeout(() => {
        setActionMessage(null);
        dispatch(clearBidError());
      }, 5000);
    }
    if (message) {
      setActionMessage({ type: "success", text: message });
      setTimeout(() => setActionMessage(null), 3000);
    }
  }, [error, message, dispatch]);

  // =========================================================
  // USER CURRENCY SYMBOL
  // =========================================================
  const userCountryCode = useMemo(
    () => normalizeCountryCode(user?.country),
    [user?.country],
  );

  const currencySymbol = useMemo(
    () => getCurrencySymbol(user?.country),
    [user?.country],
  );

  // Currency rate object (sirf reference ke liye — conversion nahi)
  const userCurrencyRate = useMemo(() => {
    if (!currencies || currencies.length === 0 || !userCountryCode) return null;
    return (
      currencies.find(
        (c) =>
          String(c.countryCode).trim().toUpperCase() === userCountryCode &&
          c.status,
      ) || null
    );
  }, [currencies, userCountryCode]);

  // =========================================================
  // FORMAT HELPERS — amount as-is, sirf symbol user ka
  // =========================================================
  const formatCurrency = (amount) => {
    const amt = Number(amount) || 0;
    return `${currencySymbol}${amt.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatWinAmount = (amount) => {
    const value = Number(amount) || 0;
    return `${currencySymbol}${value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "from-[#F1C40F] to-[#E67E22]",
        bgColor: "bg-[#F1C40F]/10",
        borderColor: "border-[#F1C40F]/30",
        icon: Clock,
        label: "Pending",
        glow: "shadow-[#F1C40F]/30",
      },
      won: {
        color: "from-[#00E676] to-[#00c853]",
        bgColor: "bg-[#00E676]/10",
        borderColor: "border-[#00E676]/30",
        icon: Trophy,
        label: "Won",
        glow: "shadow-[#00E676]/30",
      },
      lost: {
        color: "from-red-400 to-rose-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        icon: XCircle,
        label: "Lost",
        glow: "shadow-red-500/30",
      },
      cancelled: {
        color: "from-gray-400 to-gray-500",
        bgColor: "bg-[#2a1b3d]",
        borderColor: "border-[#3a2a4d]",
        icon: AlertCircle,
        label: "Cancelled",
        glow: "shadow-gray-500/30",
      },
    };
    return configs[status] || configs.pending;
  };

  const normalizeGameType = (gameType) =>
    String(gameType || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");

  const getGameTypeDisplay = (type) => {
    type = normalizeGameType(type);
    const display = {
      single: "Single",
      jodi: "Jodi",
      "single-patti": "Single Patti",
      "double-patti": "Double Patti",
      "triple-patti": "Triple Patti",
      panna: "Panna",
      "half-sangam": "Half-Sangam",
      "full-sangam": "Full-Sangam",
      "last-digit": "Last Digit",
      "first-digit": "First Digit",
    };
    return display[type] || type;
  };

  const getDigitType = (bid) => {
    if (bid?.digitType === "2-digit") return "2-digit";
    if (bid?.digitType === "3-digit") return "3-digit";
    if (bid?.marketId?.digitType === "2-digit") return "2-digit";
    if (bid?.marketId?.digitType === "3-digit") return "3-digit";
    if (["panna", "half-sangam"].includes(bid?.gameType)) return "3-digit";
    return "";
  };

  // ============================================================
  // NUMBER / RESULT DISPLAY
  // ============================================================
  const getDigitCount = (gameType) => {
    gameType = normalizeGameType(gameType);
    switch (gameType) {
      case "single":
        return 1;
      case "jodi":
        return 2;
      case "single-patti":
      case "double-patti":
      case "triple-patti":
      case "panna":
        return 3;
      case "half-sangam":
        return 4;
      case "full-sangam":
        return 6;
      case "last-digit":
      case "first-digit":
        return 1;
      default:
        return 2;
    }
  };

  const normalizeNumber = (number) => {
    if (number === undefined || number === null) return "";
    return String(number).trim();
  };

  const isHalfSangam = (gameType) =>
    normalizeGameType(gameType) === "half-sangam";

  const isFullSangam = (gameType) =>
    normalizeGameType(gameType) === "full-sangam";

  const getSangamParts = (number, gameType) => {
    const str = normalizeNumber(number);

    if (!str) {
      return { first: "", second: "" };
    }

    if (isHalfSangam(gameType) || isFullSangam(gameType)) {
      const parts = str.split("-");
      if (parts.length === 2) {
        return { first: parts[0], second: parts[1] };
      }
    }

    return { first: str, second: "" };
  };

  const getResultDigits = (number, gameType) => {
    gameType = normalizeGameType(gameType);
    const str = normalizeNumber(number);

    if (!str) return [];

    if (isHalfSangam(gameType) || isFullSangam(gameType)) {
      const { first, second } = getSangamParts(str, gameType);
      return {
        sangam: true,
        first: first.split(""),
        second: second.split(""),
      };
    }

    const digitCount = getDigitCount(gameType);
    const digits = str.split("");

    while (digits.length < digitCount) {
      digits.unshift("0");
    }

    return {
      sangam: false,
      first: digits.slice(-digitCount),
      second: [],
    };
  };

  const renderNumberBalls = (number, status, gameType, size = "md") => {
    if (!number) return null;

    const parsed = getResultDigits(number, gameType);

    const isWin = status === "won";
    const isLost = status === "lost";

    const sizeClasses =
      size === "sm"
        ? "w-6 h-6 text-[9px]"
        : size === "lg"
          ? "w-10 h-10 text-sm"
          : "w-8 h-8 text-xs";

    const ballClass = `
      ${sizeClasses}
      rounded-full
      flex items-center justify-center
      text-white font-extrabold
      ${
        isWin
          ? "bg-gradient-to-br from-[#00E676] to-[#00c853] shadow-md shadow-[#00E676]/40"
          : isLost
            ? "bg-gradient-to-br from-red-400 to-rose-600 shadow-md shadow-red-400/40"
            : "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] shadow-md shadow-[#B45CFF]/40"
      }
    `;

    if (parsed.sangam) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            {parsed.first.map((digit, index) => (
              <div key={`first-${index}`} className={ballClass}>
                {digit}
              </div>
            ))}
          </div>

          <span className="font-extrabold text-gray-500 text-xs">-</span>

          <div className="flex items-center gap-1">
            {parsed.second.map((digit, index) => (
              <div key={`second-${index}`} className={ballClass}>
                {digit}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {parsed.first.map((digit, index) => (
          <div key={index} className={ballClass}>
            {digit}
          </div>
        ))}
      </div>
    );
  };

  const renderResultNumber = (number, gameType) => {
    if (number === undefined || number === null || number === "") {
      return <span className="text-[10px] text-gray-500">Pending</span>;
    }

    const parsed = getResultDigits(number, gameType);

    if (parsed.sangam) {
      return (
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {parsed.first.map((digit, index) => (
              <div
                key={`result-first-${index}`}
                className="w-6 h-6 rounded-full bg-[#12061C] border-2 border-[#2a1b3d] flex items-center justify-center text-[10px] font-extrabold text-gray-200"
              >
                {digit}
              </div>
            ))}
          </div>

          <span className="font-extrabold text-gray-500 text-[10px]">-</span>

          <div className="flex items-center gap-1">
            {parsed.second.map((digit, index) => (
              <div
                key={`result-second-${index}`}
                className="w-6 h-6 rounded-full bg-[#12061C] border-2 border-[#2a1b3d] flex items-center justify-center text-[10px] font-extrabold text-gray-200"
              >
                {digit}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {parsed.first.map((digit, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-full bg-[#12061C] border-2 border-[#2a1b3d] flex items-center justify-center text-[10px] font-extrabold text-gray-200"
          >
            {digit}
          </div>
        ))}
      </div>
    );
  };

  const bidsArray = Array.isArray(bids) ? bids : [];

  // Type tab (market) + date filter — client-side, like /deposit-history
  const navigate = useNavigate();
  const [typeTab, setTypeTab] = useState("all");
  const [dateTab, setDateTab] = useState("all");

  const marketTabs = useMemo(() => {
    const names = [];
    bidsArray.forEach((b) => {
      const name = b.marketId?.name || "N/A";
      if (!names.includes(name)) names.push(name);
    });
    return [
      { id: "all", label: "All" },
      ...names.map((n) => ({ id: n, label: n })),
    ];
  }, [bidsArray]);

  const filteredBids = useMemo(() => {
    let list = bidsArray;

    if (typeTab !== "all") {
      list = list.filter((b) => (b.marketId?.name || "N/A") === typeTab);
    }

    if (dateTab !== "all") {
      const now = new Date();
      let startDate = null;
      if (dateTab === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateTab === "7days") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateTab === "30days") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (startDate) {
        list = list.filter((b) => new Date(b.createdAt) >= startDate);
      }
    }

    return list;
  }, [bidsArray, typeTab, dateTab]);

  const totalBids = bidsArray.length;
  const totalWon = bidsArray.filter((b) => b.status === "won").length;
  const totalAmount = bidsArray.reduce((sum, b) => sum + (b.bidAmount || 0), 0);
  const totalWinAmount = bidsArray.reduce(
    (sum, b) => sum + (b.winAmount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#0B0410]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#B45CFF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-64 h-64 bg-[#B45CFF]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-[#8E44AD]/10 rounded-full blur-3xl" />

      <div className="relative max-w-md mx-auto">
        {/* Header — back style, like /deposit-history */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-white transition-all active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-white">
            Bids history
          </h1>
          <button
            onClick={() => dispatch(getBiddingHistory(filter))}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-gray-400 transition-all hover:text-[#B45CFF] active:scale-95"
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* TYPE TABS — markets */}
        {marketTabs.length > 1 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {marketTabs.slice(0, 3).map(({ id, label }) => {
              const isActive = typeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTypeTab(id)}
                  className={`flex items-center justify-center rounded-xl py-2.5 border text-[11px] font-bold transition-all active:scale-95 ${
                    isActive
                      ? `${purpleGradient} text-white`
                      : "border-[#2a1b3d] bg-[#1C0F2B] text-gray-400 hover:border-[#9B59B6]/50"
                  }`}
                >
                  <span className="truncate px-1">{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* STATUS + DATE FILTERS */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={filter.status}
              onChange={(e) =>
                setFilter({ ...filter, status: e.target.value, page: 1 })
              }
              className="w-full appearance-none rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] px-3 py-2.5 text-xs font-semibold text-gray-300 outline-none transition-all focus:border-[#B45CFF]/60"
            >
              <option value="">All</option>
              <option value="pending">Status: Pending</option>
              <option value="won">Status: Won</option>
              <option value="lost">Status: Lost</option>
              <option value="cancelled">Status: Cancelled</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          <div className="relative">
            <select
              value={dateTab}
              onChange={(e) => setDateTab(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] px-3 py-2.5 text-xs font-semibold text-gray-300 outline-none transition-all focus:border-[#B45CFF]/60"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className="mb-4">
            <div
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${
                actionMessage.type === "success"
                  ? "bg-[#00E676]/10 border-[#00E676]/40 text-[#00E676]"
                  : "bg-red-500/10 border-red-500/40 text-red-400"
              }`}
            >
              <span className="text-lg">
                {actionMessage.type === "success" ? "✅" : "⚠️"}
              </span>
              <span className="text-sm">{actionMessage.text}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !actionMessage && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Bids list */}
        {filteredBids.length > 0 ? (
          <div className="space-y-3">
            {filteredBids.map((bid) => {
                const statusConfig = getStatusConfig(bid.status);
                const StatusIcon = statusConfig.icon;
                const gameTypeDisplay = getGameTypeDisplay(bid.gameType);
                const isResultDeclared =
                  bid.resultNumber !== null &&
                  bid.resultNumber !== undefined &&
                  bid.resultNumber !== "";

                return (
                  <div
                    key={bid._id}
                    className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-3.5 transition-all hover:border-[#9B59B6]/50"
                  >
                    {/* Row 0: tag + status — deposit/withdrawal history style */}
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <span className="rounded-md bg-gradient-to-r from-[#B45CFF] to-[#7418F5] px-2.5 py-1 text-[10px] font-bold text-white">
                        Bid
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          bid.status === "won"
                            ? "text-[#00E676]"
                            : bid.status === "lost"
                              ? "text-red-400"
                              : bid.status === "pending"
                                ? "text-[#F1C40F]"
                                : "text-gray-400"
                        }`}
                      >
                        <StatusIcon size={11} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Row 1: Market */}
                    <div className="mb-2.5">
                      <p className="text-sm font-bold text-white">
                        {bid.marketId?.name || "N/A"}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {bid.marketId?.marketId || ""}
                      </p>
                    </div>

                    {/* Row 2: Game type + Date */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#12061C] border border-[#2a1b3d] text-gray-300">
                          {gameTypeDisplay}
                        </span>

                        {bid.gameType === "half-sangam" && (
                          <span className="text-[9px] text-gray-500">
                            123-5 / 5-123
                          </span>
                        )}

                        {bid.gameType === "full-sangam" && (
                          <span className="text-[9px] text-gray-500">
                            123-456
                          </span>
                        )}

                        {getDigitType(bid) && (
                          <span className="px-2 py-1 text-[9px] font-extrabold rounded-full bg-[#9B59B6]/15 text-[#C77AFF] border border-[#9B59B6]/30">
                            {getDigitType(bid)}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">
                          {new Date(bid.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[9px] text-gray-500">
                          {new Date(bid.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Row 3: Number, Result, Amount */}
                    <div className="flex items-center justify-between gap-2 bg-[#12061C] rounded-xl px-3 py-2.5 border border-[#2a1b3d]">
                      {/* Your Number */}
                      <div>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Your Number
                        </p>
                        {renderNumberBalls(
                          bid.number,
                          bid.status,
                          bid.gameType,
                          "sm",
                        )}
                      </div>

                      {/* Result */}
                      <div>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Result
                        </p>
                        {isResultDeclared ? (
                          renderResultNumber(bid.resultNumber, bid.gameType)
                        ) : (
                          <span className="text-[10px] text-gray-500">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Amount
                        </p>

                        <p className="text-sm font-bold text-gray-200">
                          {formatCurrency(bid.bidAmount)}
                        </p>

                        {bid.winAmount > 0 && (
                          <p className="text-[10px] font-extrabold text-[#00E676]">
                            + {formatWinAmount(bid.winAmount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#150D22]/90 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] border border-[#2a1b3d] p-12 text-center relative overflow-hidden">
            <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 w-40 h-32 bg-[#7418F5]/20 rounded-full blur-2xl" />
            <div className="relative text-5xl mb-4 opacity-30">📭</div>
            <p className="relative text-gray-300 text-lg font-bold">No Bids Found</p>
            <p className="relative text-gray-500 text-sm mt-1">
              Start exploring active markets and place your first bid!
            </p>
            <Link
              to="/matka/markets"
              className={`relative inline-flex items-center gap-2 mt-4 px-6 py-2.5 ${purpleGradient} text-white rounded-xl font-bold transition-all active:scale-[0.98]`}
            >
              <Target size={16} />
              Browse Markets
            </Link>
          </div>
        )}

        {/* Pagination */}
        {filteredBids.length > 0 && (
          <>
            <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="text-sm text-gray-400">
                Showing {filteredBids.length} of {pagination?.total || 0} bids
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilter({
                      ...filter,
                      page: Math.max(1, filter.page - 1),
                    })
                  }
                  disabled={filter.page === 1}
                  className="px-4 py-1.5 border border-[#2a1b3d] bg-[#12061C] text-gray-300 rounded-xl text-sm hover:bg-[#2a1b3d] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold ${purpleGradient} text-white`}
                >
                  {filter.page} / {pagination?.pages || 1}
                </span>
                <button
                  onClick={() =>
                    setFilter({
                      ...filter,
                      page: Math.min(pagination?.pages || 1, filter.page + 1),
                    })
                  }
                  disabled={filter.page === (pagination?.pages || 1)}
                  className="px-4 py-1.5 border border-[#2a1b3d] bg-[#12061C] text-gray-300 rounded-xl text-sm hover:bg-[#2a1b3d] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <p className="py-3 text-center text-xs font-semibold text-gray-500">
              No more
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default BidsHistory;
