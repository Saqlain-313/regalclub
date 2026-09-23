import {
  AlertCircle,
  ArrowLeft,
  Award,
  Check,
  ChevronRight,
  Clock,
  Coins,
  RefreshCw,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { clearBidError, placeBid } from "../../redux/slices/bidSlice";
import { getCurrencyRates } from "../../redux/slices/currencyRateSlice";
import {
  clearCurrentMarket,
  getMarketById,
} from "../../redux/slices/marketSlice";
import {
  fetchPublicBidResults,
  selectPublicBidResults,
} from "../../redux/slices/publicBidSlice";

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

const getCurrencySymbol = (country) => {
  const symbols = {
    IN: "₹",
    AU: "A$",
    PK: "₨",
    BD: "৳",
    NP: "रू",
    AE: "د.إ",
    default: "₹",
  };
  return symbols[normalizeCountryCode(country)] || symbols.default;
};

// =========================================================
// ACTIVE SESSION HELPER
// =========================================================
const getActiveSession = (market) => {
  if (!market?.marketArray?.length) return null;
  return market.marketArray.find((s) => s.isActive) || market.marketArray[0];
};

// =========================================================
// GAME TYPE MAPPING
// =========================================================
const GAME_TYPE_MAP = {
  single: "single",
  jodi: "jodi",
  panna: "panna",
  "single-patti": "single-Patti",
  "double-patti": "double-Patti",
  "triple-patti": "triple-Patti",
  "half-sangam": "half-sangam",
  "full-sangam": "full-sangam",
  "last-digit": "last-digit",
  "first-digit": "first-digit",
};

const getBackendGameType = (frontendType) =>
  GAME_TYPE_MAP[frontendType] || frontendType;

const normalizeGameKey = (key) =>
  String(key || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

// =========================================================
// BID AMOUNT GENERATOR
// =========================================================
const generateBidAmounts = (min, max, maxButtons = 9) => {
  if (!min || !max || min >= max) return [min || 0];
  const niceBases = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8];
  const candidates = new Set();
  let magnitude = 1;
  while (magnitude <= max) {
    niceBases.forEach((b) => {
      const val = Math.round(b * magnitude);
      if (val >= min && val <= max) candidates.add(val);
    });
    magnitude *= 10;
  }
  candidates.add(min);
  candidates.add(max);
  let amounts = Array.from(candidates).sort((a, b) => a - b);
  if (amounts.length > maxButtons) {
    const step = (amounts.length - 1) / (maxButtons - 1);
    const picked = [];
    for (let i = 0; i < maxButtons; i++) {
      picked.push(amounts[Math.round(i * step)]);
    }
    amounts = Array.from(new Set(picked));
  }
  return amounts;
};

// =========================================================
// IST DATE HELPERS
// =========================================================
const toISTDateKey = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const formatShortDate = (dateKey) => {
  if (!dateKey) return "";
  const d = new Date(`${dateKey}T00:00:00`);
  return d
    .toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    .toUpperCase();
};

// =========================================================
// PATTI HELPERS
// =========================================================
const isSinglePatti = (num) => {
  const digits = num.toString().padStart(3, "0").split("");
  return (
    digits[0] !== digits[1] &&
    digits[1] !== digits[2] &&
    digits[0] !== digits[2]
  );
};

const isDoublePatti = (num) => {
  const digits = num.toString().padStart(3, "0").split("");
  return (
    (digits[0] === digits[1] && digits[1] !== digits[2]) ||
    (digits[0] === digits[2] && digits[1] !== digits[2]) ||
    (digits[1] === digits[2] && digits[0] !== digits[1])
  );
};

const isTriplePatti = (num) => {
  const digits = num.toString().padStart(3, "0").split("");
  return digits[0] === digits[1] && digits[1] === digits[2];
};

const getPattiTypeLabel = (type) => {
  const labels = {
    "single-patti": "Single Patti",
    "double-patti": "Double Patti",
    "triple-patti": "Triple Patti",
  };
  return labels[type] || type;
};

const getPattiDescription = (type) => {
  const descriptions = {
    "single-patti": "All 3 digits must be different (e.g., 123, 456, 789)",
    "double-patti": "Exactly 2 digits must be same (e.g., 112, 121, 211)",
    "triple-patti": "All 3 digits must be same (e.g., 111, 222, 999)",
  };
  return descriptions[type] || "";
};

const getPattiExample = (type) => {
  const examples = {
    "single-patti": "123, 456, 789, 012, 345",
    "double-patti": "112, 121, 211, 001, 100",
    "triple-patti": "111, 222, 333, 444, 999",
  };
  return examples[type] || "";
};

// =========================================================
// MAIN COMPONENT
// =========================================================
const PlaceBid = () => {
  const { marketId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentMarket, loading: marketLoading } = useSelector(
    (state) => state.market,
  );
  const { user } = useSelector((state) => state.auth);
  const {
    loading: bidLoading,
    error,
    message,
  } = useSelector((state) => state.bid);
  const { results: publicResults, loading: resultsLoading } = useSelector(
    selectPublicBidResults,
  );
  const currencies = useSelector((state) => state.currencyRate?.currencies);

  const { gameType: autoGameType, digitType: autoDigitType } =
    location.state || {};

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  // =========================================================
  // FLATTEN SESSION DATA FROM marketArray
  // =========================================================
  const activeSession = useMemo(
    () => getActiveSession(currentMarket),
    [currentMarket],
  );

  const marketData = useMemo(() => {
    if (!currentMarket) return null;
    const s = activeSession;
    return {
      ...currentMarket,
      openTime: s?.openTime || currentMarket.openTime || "--:--",
      closeTime: s?.closeTime || currentMarket.closeTime || "--:--",
      resultTime: s?.resultTime || currentMarket.resultTime || "--:--",
      minBid: s?.minBid ?? currentMarket.minBid ?? 0,
      maxBid: s?.maxBid ?? currentMarket.maxBid ?? 0,
      isActive: s?.isActive ?? false,
      winningNumber: s?.winningNumber ?? null,
      isResultDeclared: s?.isResultDeclared ?? false,
      marketDate: s?.marketDate || null,
    };
  }, [currentMarket, activeSession]);

  const marketDigitType =
    marketData?.digitType || marketData?.marketType || autoDigitType || "";

  // =========================================================
  // ALLOWED GAME TYPES
  // =========================================================
  const allowedGameTypesByDigitType = useMemo(() => {
    let byDigitType = [];

    if (marketDigitType === "2-digit") {
      byDigitType = ["single", "jodi", "last-digit", "first-digit"];
    } else if (marketDigitType === "3-digit") {
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

    const apiKeys = (marketData?.gameTypes || []).map(normalizeGameKey);
    return apiKeys.length
      ? byDigitType.filter((k) => apiKeys.includes(k))
      : byDigitType;
  }, [marketDigitType, marketData?.gameTypes]);

  const isGameTypeAllowed = (gameType) =>
    allowedGameTypesByDigitType.includes(gameType);

  const currencySymbol = getCurrencySymbol(user?.country);

  // =========================================================
  // CURRENCY CONVERSION
  // =========================================================
  const userCountryCode = useMemo(
    () => normalizeCountryCode(user?.country),
    [user?.country],
  );

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

  const exchangeRate = useMemo(() => {
    const rate = Number(userCurrencyRate?.rate);
    return Number.isFinite(rate) && rate > 0 ? rate : 1;
  }, [userCurrencyRate]);

  const userCurrencyCode = userCurrencyRate?.currencyCode || "INR";

  const userToINR = (amount) => {
    const a = Number(amount);
    if (!Number.isFinite(a)) return 0;
    return a * exchangeRate;
  };

  const inrToUser = (amountINR) => {
    const a = Number(amountINR);
    if (!Number.isFinite(a)) return 0;
    return a / exchangeRate;
  };

  const formatUserCurrency = (amount) => {
    const amt = Number(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: userCurrencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amt);
  };

  const formatINR = (amount) => {
    const amt = Number(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amt);
  };

  // =========================================================
  // MARKET MIN/MAX IN USER CURRENCY
  // =========================================================
  const minBidUser = useMemo(
    () => inrToUser(marketData?.minBid || 0),
    [marketData?.minBid, exchangeRate],
  );

  const maxBidUser = useMemo(
    () => inrToUser(marketData?.maxBid || 0),
    [marketData?.maxBid, exchangeRate],
  );

  // =========================================================
  // LOCAL STATE
  // =========================================================
  const [selectedDigits, setSelectedDigits] = useState([]);
  const [currentDigitIndex, setCurrentDigitIndex] = useState(0);

  const [formData, setFormData] = useState({
    number: "",
    bidAmount: "",
    gameType: autoGameType || "",
  });

  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [isHalfSangamMode, setIsHalfSangamMode] = useState("triple");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmountError, setCustomAmountError] = useState("");

  const bidAmountOptions = useMemo(() => {
    const inrAmounts = generateBidAmounts(
      marketData?.minBid,
      marketData?.maxBid,
    );
    const userAmounts = inrAmounts.map((amt) => {
      const v = inrToUser(amt);
      if (v < 1) return Number(v.toFixed(2));
      if (v < 100) return Number(v.toFixed(2));
      return Math.round(v);
    });
    return Array.from(new Set(userAmounts)).filter((v) => v > 0);
  }, [marketData?.minBid, marketData?.maxBid, exchangeRate]);

  // =========================================================
  // FETCHES
  // =========================================================
  useEffect(() => {
    dispatch(fetchPublicBidResults({ gameType: "panna", status: "all" }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCurrencyRates());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getMarketById(marketId));
    return () => {
      dispatch(clearCurrentMarket());
      dispatch(clearBidError());
    };
  }, [dispatch, marketId]);

  // =========================================================
  // PUBLIC RESULTS → TODAY / LAST
  // =========================================================
  const { todayResult, lastResult, lastResultDateKey } = useMemo(() => {
    if (!publicResults || publicResults.length === 0) {
      return { todayResult: [], lastResult: [], lastResultDateKey: null };
    }

    const marketResults = publicResults.filter((r) => r.resultNumber);
    const sorted = [...marketResults].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    const byDate = new Map();
    sorted.forEach((r) => {
      const key = toISTDateKey(r.createdAt);
      if (!byDate.has(key)) byDate.set(key, r);
    });

    const sortedDateKeys = Array.from(byDate.keys()).sort((a, b) =>
      b.localeCompare(a),
    );

    const todayKey = toISTDateKey(new Date());
    const todayEntry = byDate.get(todayKey);

    const prevDateKey = sortedDateKeys.find((key) => key !== todayKey);
    const prevEntry = prevDateKey ? byDate.get(prevDateKey) : null;

    return {
      todayResult: todayEntry ? todayEntry.resultNumber.split("") : [],
      lastResult: prevEntry ? prevEntry.resultNumber.split("") : [],
      lastResultDateKey: prevDateKey || null,
    };
  }, [publicResults]);

  // =========================================================
  // GAME HELPERS
  // =========================================================
  const getDigitsCount = (gameType) => {
    if (gameType === "half-sangam") return 4;
    if (gameType === "full-sangam") return 6;

    const counts = {
      jodi: 2,
      panna: 3,
      "single-patti": 3,
      "double-patti": 3,
      "triple-patti": 3,
      "last-digit": 2,
      "first-digit": 2,
    };
    return counts[gameType] || 1;
  };

  const getDigitLabels = (gameType) => {
    if (gameType === "half-sangam") {
      return isHalfSangamMode === "single"
        ? ["Digit", "H", "T", "U"]
        : ["H", "T", "U", "Digit"];
    }
    if (gameType === "full-sangam") {
      return ["OH", "OT", "OU", "CH", "CT", "CU"];
    }

    const labels = {
      jodi: ["1st", "2nd"],
      panna: ["H", "T", "U"],
      "single-patti": ["H", "T", "U"],
      "double-patti": ["H", "T", "U"],
      "triple-patti": ["H", "T", "U"],
      "last-digit": ["T", "U"],
      "first-digit": ["T", "U"],
    };
    return labels[gameType] || ["Digit"];
  };

  const buildGameNumber = (gameType, digitsArr) => {
    const values = digitsArr.map((d) => d ?? "");

    if (["single-patti", "double-patti", "triple-patti"].includes(gameType)) {
      const number = values.join("");
      if (number.length !== 3) return "";

      if (gameType === "single-patti" && !isSinglePatti(parseInt(number, 10)))
        return "";
      if (gameType === "double-patti" && !isDoublePatti(parseInt(number, 10)))
        return "";
      if (gameType === "triple-patti" && !isTriplePatti(parseInt(number, 10)))
        return "";
      return number;
    }

    if (gameType === "half-sangam") {
      if (isHalfSangamMode === "single") {
        return `${values[0]}-${values.slice(1, 4).join("")}`;
      }
      return `${values.slice(0, 3).join("")}-${values[3]}`;
    }

    if (gameType === "full-sangam") {
      return `${values.slice(0, 3).join("")}-${values.slice(3, 6).join("")}`;
    }

    return values.join("");
  };

  const getNumberHint = (gameType) => {
    const hints = {
      jodi: "00-99",
      panna: "000-999",
      "single-patti": "123, 456, 789",
      "double-patti": "112, 121, 211",
      "triple-patti": "111, 222, 333",
      "half-sangam": "123-5 or 5-123",
      "full-sangam": "123-456",
      "last-digit": "00-99",
      "first-digit": "00-99",
    };
    return hints[gameType] || "";
  };

  const getGameTypeDisplay = (type) => {
    const display = {
      single: "Single",
      jodi: "Jodi",
      panna: "Panna",
      "single-patti": "Single Patti",
      "double-patti": "Double Patti",
      "triple-patti": "Triple Patti",
      "half-sangam": "Half-Sangam",
      "full-sangam": "Full-Sangam",
      "last-digit": "Last Digit",
      "first-digit": "First Digit",
    };
    return display[type] || type;
  };

  const digitCount = getDigitsCount(formData.gameType);
  const digitLabels = getDigitLabels(formData.gameType);
  const digits = Array.from({ length: 10 }, (_, i) => i.toString());

  // =========================================================
  // AUTO GAME TYPE FROM NAVIGATION
  // =========================================================
  useEffect(() => {
    if (!autoGameType) return;

    if (
      allowedGameTypesByDigitType.length > 0 &&
      !allowedGameTypesByDigitType.includes(autoGameType)
    ) {
      setFormData((prev) => ({ ...prev, gameType: "" }));
      setSelectedDigits([]);
      setCurrentDigitIndex(0);
      setLocalError(`This game is not available for ${marketDigitType} market`);
      return;
    }

    setFormData((prev) => ({ ...prev, gameType: autoGameType }));
    setSelectedDigits([]);
    setCurrentDigitIndex(0);
    if (autoGameType === "half-sangam") {
      setIsHalfSangamMode("triple");
    }
  }, [autoGameType, marketDigitType, allowedGameTypesByDigitType]);

  // =========================================================
  // ERROR FROM REDUX
  // =========================================================
  useEffect(() => {
    if (error) {
      setLocalError(error);
      setTimeout(() => {
        setLocalError("");
        dispatch(clearBidError());
      }, 5000);
    }
  }, [error, dispatch]);

  // =========================================================
  // DIGIT SELECTION
  // =========================================================
  const handleDigitSelect = (digit) => {
    const newSelected = [...selectedDigits];
    newSelected[currentDigitIndex] = digit;
    setSelectedDigits(newSelected);

    const count = getDigitsCount(formData.gameType);
    if (currentDigitIndex < count - 1) {
      setCurrentDigitIndex(currentDigitIndex + 1);
    }

    const number = buildGameNumber(formData.gameType, newSelected);
    setFormData({ ...formData, number });

    if (
      ["single-patti", "double-patti", "triple-patti"].includes(
        formData.gameType,
      )
    ) {
      const fullNumber = newSelected.join("");
      if (fullNumber.length === 3) {
        const num = parseInt(fullNumber, 10);
        let isValid = true;
        if (formData.gameType === "single-patti") isValid = isSinglePatti(num);
        else if (formData.gameType === "double-patti")
          isValid = isDoublePatti(num);
        else if (formData.gameType === "triple-patti")
          isValid = isTriplePatti(num);

        if (!isValid) {
          const typeLabel = getPattiTypeLabel(formData.gameType);
          setLocalError(
            `Invalid number for ${typeLabel}. Please select correct digits.`,
          );
        } else {
          setLocalError("");
        }
      }
    }
  };

  const handleRemoveDigit = () => {
    if (currentDigitIndex > 0) {
      const newSelected = [...selectedDigits];
      newSelected[currentDigitIndex - 1] = null;
      setSelectedDigits(newSelected);
      setCurrentDigitIndex(currentDigitIndex - 1);
      setFormData({
        ...formData,
        number: buildGameNumber(formData.gameType, newSelected),
      });
    } else if (selectedDigits[0] !== null && selectedDigits[0] !== undefined) {
      setSelectedDigits([]);
      setCurrentDigitIndex(0);
      setFormData({ ...formData, number: "" });
    }
    setLocalError("");
  };

  const resetSelection = () => {
    setSelectedDigits([]);
    setCurrentDigitIndex(0);
    setFormData({ ...formData, number: "" });
    setLocalError("");
  };

  const isAllDigitsSelected = () => {
    if (!formData.gameType) return false;
    const count = getDigitsCount(formData.gameType);
    return (
      selectedDigits.length === count &&
      selectedDigits.every((d) => d !== null && d !== undefined)
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError("");
    setSuccess("");
  };

  const handleBidAmountClick = (amount) => {
    setIsCustomAmount(false);
    setCustomAmountError("");
    setFormData({ ...formData, bidAmount: amount.toString() });
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setFormData({ ...formData, bidAmount: value });

    if (value === "") {
      setCustomAmountError("");
      return;
    }

    const amount = parseFloat(value);
    if (!Number.isFinite(amount) || amount <= 0) {
      setCustomAmountError("Enter a valid amount");
      return;
    }

    const amountInINR = userToINR(amount);

    if (amountInINR < (marketData?.minBid || 0)) {
      setCustomAmountError(
        `Minimum bid is ${formatUserCurrency(minBidUser)} (₹${marketData?.minBid} INR)`,
      );
    } else if (amountInINR > (marketData?.maxBid || 0)) {
      setCustomAmountError(
        `Maximum bid is ${formatUserCurrency(maxBidUser)} (₹${marketData?.maxBid} INR)`,
      );
    } else {
      setCustomAmountError("");
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    if (!marketDigitType) {
      return setLocalError(
        "Market digit type is not configured. Please select 2-digit or 3-digit market.",
      );
    }

    if (!isGameTypeAllowed(formData.gameType)) {
      return setLocalError(
        `${getGameTypeDisplay(formData.gameType)} is not available for ${marketDigitType} market`,
      );
    }

    if (!isAllDigitsSelected())
      return setLocalError("Please select all digits");

    if (!formData.bidAmount || parseFloat(formData.bidAmount) <= 0)
      return setLocalError("Enter valid bid amount");

    if (isCustomAmount && customAmountError)
      return setLocalError(customAmountError);

    const bidAmountUser = parseFloat(formData.bidAmount);
    const bidAmountInINR = userToINR(bidAmountUser);

    if (bidAmountInINR < (marketData?.minBid || 0)) {
      return setLocalError(
        `Minimum bid is ${formatUserCurrency(minBidUser)} (₹${marketData?.minBid} INR)`,
      );
    }

    if (bidAmountInINR > (marketData?.maxBid || 0)) {
      return setLocalError(
        `Maximum bid is ${formatUserCurrency(maxBidUser)} (₹${marketData?.maxBid} INR)`,
      );
    }

    const usercredit = Number(user?.credit?.local ?? user?.credit ?? 0);

    if (!Number.isFinite(usercredit) || usercredit < bidAmountUser) {
      return setLocalError(
        `Insufficient credit. Need ${formatUserCurrency(bidAmountUser)}, have ${formatUserCurrency(usercredit)}`,
      );
    }

    const backendGameType = getBackendGameType(formData.gameType);

    const result = await dispatch(
      placeBid({
        marketId,
        gameType: backendGameType,
        number: formData.number,
        bidAmount: bidAmountUser,
      }),
    );

    if (result.payload?.success) {
      setSuccess(result.payload.message);
      resetSelection();
      setIsCustomAmount(false);
      setCustomAmountError("");
      setFormData({ number: "", bidAmount: "", gameType: formData.gameType });
      setTimeout(() => navigate("/matka/bids-history"), 2000);
    }
  };

  // =========================================================
  // WIN CALC
  // =========================================================
  const calculateWinAmount = () => {
    if (!formData.bidAmount || !formData.gameType) return 0;
    const multipliers = {
      jodi: 90,
      panna: 90,
      "single-patti": 90,
      "double-patti": 90,
      "triple-patti": 90,
      "half-sangam": 450,
      "full-sangam": 900,
      "last-digit": 9,
      "first-digit": 9,
      single: 9,
    };
    return (
      parseFloat(formData.bidAmount) * (multipliers[formData.gameType] || 9)
    );
  };

  const getMultiplierDisplay = (gameType) => {
    const multipliers = {
      jodi: "90x",
      panna: "90x",
      "single-patti": "90x",
      "double-patti": "90x",
      "triple-patti": "90x",
      "half-sangam": "450x",
      "full-sangam": "900x",
      "last-digit": "9x",
      "first-digit": "9x",
      single: "9x",
    };
    return multipliers[gameType] || "9x";
  };

  const getAboutText = (gameType) => {
    const abouts = {
      jodi: {
        title: "ABOUT JODI",
        desc: "Select any two numbers from 0 to 9. If your selected number matches the last two digits of the result, you win!",
        example:
          "Result: 4 6 8 → Last two digits: 6 8 → Jodi: 6 8 → You Win! 🎉",
      },
      panna: {
        title: "ABOUT PANEL",
        desc: "Select any three numbers from 0 to 9. If any one matches the result digits, you win!",
        example: "Result: 4 6 8 → You selected: 2-5-8 → Match: 8 → You Win! 🎉",
      },
      "single-patti": {
        title: "ABOUT SINGLE PATTI",
        desc: "Select three different digits (e.g., 123, 456, 789). All digits must be unique.",
        example:
          "Result: 4 6 8 → You selected: 4 6 8 → All match → You Win! 🎉",
      },
      "double-patti": {
        title: "ABOUT DOUBLE PATTI",
        desc: "Select three digits where exactly two are the same (e.g., 112, 121, 211).",
        example:
          "Result: 1 1 2 → You selected: 1 1 2 → All match → You Win! 🎉",
      },
      "triple-patti": {
        title: "ABOUT TRIPLE PATTI",
        desc: "Select three identical digits (e.g., 111, 222, 333, 999).",
        example:
          "Result: 1 1 1 → You selected: 1 1 1 → All match → You Win! 🎉",
      },
      "half-sangam": {
        title: "ABOUT HALF-SANGAM",
        desc: "Select one digit and one Panna. You can play Digit + Panna (5-123) or Panna + Digit (123-5).",
        example:
          "Example: 123-5 or 5-123 → Both sides must match the declared result.",
      },
      "full-sangam": {
        title: "ABOUT FULL-SANGAM",
        desc: "Select two Pannas: one for Open and one for Close. The format is 123-456.",
        example:
          "Example: 123-456 → Open Panna 123 + Close Panna 456 must both match.",
      },
      "last-digit": {
        title: "ABOUT LAST DIGIT",
        desc: "Select two numbers. If the last digit matches the winning number's last digit, you win!",
        example:
          "Result: 3 4 → You selected: 54 → Last digit match: 4 → You Win! 🎉",
      },
      "first-digit": {
        title: "ABOUT FIRST DIGIT",
        desc: "Select two numbers. If the first digit matches the winning number's first digit, you win!",
        example:
          "Result: 3 4 → You selected: 32 → First digit match: 3 → You Win! 🎉",
      },
    };
    return abouts[gameType] || abouts.jodi;
  };

  // =========================================================
  // RENDER: DIGIT SELECTION
  // =========================================================
  const renderDigitsGrid = () => {
    const count = getDigitsCount(formData.gameType);
    const labels = getDigitLabels(formData.gameType);
    const isComplete = isAllDigitsSelected();

    const isPattiGame = [
      "single-patti",
      "double-patti",
      "triple-patti",
    ].includes(formData.gameType);

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-[#B45CFF] rounded-full"></div>
          <h3 className="text-sm font-bold text-gray-200">
            STEP 1: SELECT {getGameTypeDisplay(formData.gameType).toUpperCase()}{" "}
            ({count} NUMBERS)
          </h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {formData.gameType === "half-sangam"
            ? `Select ${isHalfSangamMode === "single" ? "1 digit + 3-digit Panna" : "3-digit Panna + 1 digit"}`
            : formData.gameType === "full-sangam"
              ? "Select 3-digit Open Panna + 3-digit Close Panna"
              : isPattiGame
                ? `Select 3 digits for ${getPattiTypeLabel(formData.gameType)} (${getPattiDescription(formData.gameType)})`
                : `Select any ${count} numbers from 0 to 9`}
        </p>

        {isPattiGame && (
          <div className="mb-4 p-3 bg-[#9B59B6]/10 rounded-xl border border-[#9B59B6]/40">
            <p className="text-xs font-medium text-[#C77AFF]">
              📌 {getPattiTypeLabel(formData.gameType)} Pattern
            </p>
            <p className="text-xs text-gray-300 mt-0.5">
              Examples: {getPattiExample(formData.gameType)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mb-5">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="text-center">
              <div
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                  selectedDigits[i] !== null && selectedDigits[i] !== undefined
                    ? `${purpleGradient} text-white`
                    : i === currentDigitIndex
                      ? "border-[#B45CFF]/60 bg-[#9B59B6]/10 text-gray-400"
                      : "border-[#2a1b3d] bg-[#12061C] text-gray-600"
                }`}
              >
                {selectedDigits[i] !== null && selectedDigits[i] !== undefined
                  ? selectedDigits[i]
                  : "?"}
              </div>
              {labels[i] && (
                <p className="text-[10px] text-gray-500 mt-1 font-medium">
                  {labels[i]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2.5 max-w-[280px] mx-auto">
          {digits.map((digit) => {
            const preventDuplicate = ![
              "panna",
              "half-sangam",
              "full-sangam",
              "single-patti",
              "double-patti",
              "triple-patti",
            ].includes(formData.gameType);

            const isSelected =
              preventDuplicate && selectedDigits.some((d) => d === digit);

            return (
              <button
                key={digit}
                type="button"
                onClick={() => !isSelected && handleDigitSelect(digit)}
                disabled={isSelected || isComplete}
                className={`
                  w-11 h-11 rounded-full font-mono font-bold text-lg transition-all duration-200
                  ${
                    isSelected
                      ? `${purpleGradient} text-white scale-95`
                      : isComplete
                        ? "bg-[#12061C] text-gray-600 cursor-not-allowed border border-[#2a1b3d]"
                        : "bg-[#1C0F2B] border-2 border-[#2a1b3d] text-gray-200 hover:border-[#B45CFF]/60 hover:bg-[#2a1b3d] hover:scale-110 active:scale-95"
                  }
                `}
              >
                {digit}
              </button>
            );
          })}
        </div>

        {isComplete && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-3 bg-[#9B59B6]/10 border border-[#9B59B6]/40 rounded-full px-5 py-2">
              <span className="text-xs text-gray-400 font-medium">
                SELECTED {getGameTypeDisplay(formData.gameType).toUpperCase()}
              </span>
              <span className="text-xl font-extrabold text-[#C77AFF] font-mono tracking-wider">
                {formData.number}
              </span>
              <button
                type="button"
                onClick={resetSelection}
                className="p-0.5 rounded-full hover:bg-[#9B59B6]/30 transition-colors"
              >
                <X size={16} className="text-[#B45CFF]" />
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-3">
          Format:{" "}
          <span className="font-medium text-gray-400">
            {getNumberHint(formData.gameType)}
          </span>
        </p>

        {formData.gameType && (
          <div className="mt-5 p-4 bg-[#9B59B6]/10 rounded-xl border border-[#9B59B6]/40">
            <div className="flex items-start gap-3">
              <Award
                size={18}
                className="text-[#B45CFF] mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-[#C77AFF]">
                  {getAboutText(formData.gameType).title}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {getAboutText(formData.gameType).desc}
                </p>
                <p className="text-xs font-medium text-[#C77AFF] mt-1.5 bg-[#0B0410]/70 rounded-lg px-3 py-1.5 border border-[#9B59B6]/30">
                  💡 {getAboutText(formData.gameType).example}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDigitSelection = () => {
    if (!formData.gameType) {
      return (
        <div className="text-center py-10">
          <div className="text-5xl mb-3 opacity-30">👆</div>
          <p className="text-gray-400 font-medium">Select a game type</p>
          <p className="text-xs text-gray-500">Then choose your digits</p>
        </div>
      );
    }

    if (formData.gameType === "half-sangam") {
      return (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setIsHalfSangamMode("triple");
                setSelectedDigits([]);
                setCurrentDigitIndex(0);
                setFormData((prev) => ({ ...prev, number: "" }));
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                isHalfSangamMode === "triple"
                  ? `${purpleGradient} text-white`
                  : "bg-[#12061C] border-[#2a1b3d] text-gray-400 hover:bg-[#2a1b3d]"
              }`}
            >
              Panna + Digit
              <span className="block text-[10px] font-normal mt-0.5">
                123-5
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsHalfSangamMode("single");
                setSelectedDigits([]);
                setCurrentDigitIndex(0);
                setFormData((prev) => ({ ...prev, number: "" }));
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                isHalfSangamMode === "single"
                  ? `${purpleGradient} text-white`
                  : "bg-[#12061C] border-[#2a1b3d] text-gray-400 hover:bg-[#2a1b3d]"
              }`}
            >
              Digit + Panna
              <span className="block text-[10px] font-normal mt-0.5">
                5-123
              </span>
            </button>
          </div>

          {renderDigitsGrid()}
        </div>
      );
    }

    return renderDigitsGrid();
  };

  // =========================================================
  // LOADING / NOT FOUND
  // =========================================================
  if (marketLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#0B0410]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#B45CFF]"></div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 bg-[#0B0410] min-h-screen">
        <div className="bg-[#1C0F2B] rounded-2xl shadow-xl p-8 text-center border border-[#2a1b3d]">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-300 font-semibold">Market not found</p>
          <button
            onClick={() => navigate("/matka/markets")}
            className="mt-3 text-[#B45CFF] hover:text-[#C77AFF] text-sm font-medium"
          >
            ← Back to Markets
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="min-h-screen bg-[#0B0410] px-4 py-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/matka/markets")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#B45CFF] transition-all text-sm mb-4 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Markets</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            {/* MARKET HEADER CARD */}
            <div className="bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex items-stretch">
                <div
                  className={`relative w-28 flex-shrink-0 ${purpleGradient} flex flex-col items-center justify-center gap-2 py-5 overflow-hidden`}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center">
                    <img
                      src={marketData.image}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <h1 className="text-white font-extrabold text-base tracking-wide text-center leading-tight">
                    {marketData.name}
                  </h1>
                  {marketData.isActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#00E676]/90 text-[#0B0410] flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#0B0410] animate-pulse"></span>
                      LIVE
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a1b3d]">
                    <div className="flex-1 flex flex-col items-center gap-0.5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase">
                        Open Time
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-[#00E676]" />
                        <span className="text-[11px] font-bold text-gray-200">
                          {marketData.openTime}
                        </span>
                      </div>
                    </div>

                    <div className="w-px h-7 bg-[#2a1b3d] flex-shrink-0"></div>

                    <div className="flex-1 flex flex-col items-center gap-0.5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase">
                        Close Time
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-red-400" />
                        <span className="text-[11px] font-bold text-gray-200">
                          {marketData.closeTime}
                        </span>
                      </div>
                    </div>

                    <div className="w-px h-7 bg-[#2a1b3d] flex-shrink-0"></div>

                    <div className="flex-1 flex flex-col items-center gap-0.5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase">
                        Result Time
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-[#F1C40F]" />
                        <span className="text-[11px] font-bold text-gray-200">
                          {marketData.resultTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2 py-3 gap-2">
                    <div className="flex-1 flex flex-col items-center gap-1.5">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">
                        Today's Result
                      </p>
                      <div className="flex items-center gap-1.5">
                        {resultsLoading && todayResult.length === 0 ? (
                          <div className="w-7 h-7 rounded-xl bg-[#12061C] border border-[#2a1b3d] animate-pulse" />
                        ) : todayResult.length > 0 ? (
                          todayResult.map((digit, index) => (
                            <div
                              key={index}
                              className={`w-7 h-7 rounded-xl ${purpleGradient} flex items-center justify-center text-white font-extrabold text-base`}
                            >
                              {digit}
                            </div>
                          ))
                        ) : marketData.winningNumber ? (
                          String(marketData.winningNumber)
                            .split("")
                            .map((digit, index) => (
                              <div
                                key={index}
                                className={`w-7 h-7 rounded-xl ${purpleGradient} flex items-center justify-center text-white font-extrabold text-base`}
                              >
                                {digit}
                              </div>
                            ))
                        ) : (
                          <span className="text-xs text-gray-600 font-semibold">
                            Awaited
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-px h-12 bg-[#2a1b3d] flex-shrink-0"></div>

                    <div className="flex-1 flex flex-col items-center gap-1.5">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">
                        Last Result
                      </p>
                      <div className="flex items-center gap-1.5">
                        {resultsLoading && lastResult.length === 0 ? (
                          <div className="w-7 h-7 rounded-xl bg-[#12061C] border border-[#2a1b3d] animate-pulse" />
                        ) : lastResult.length > 0 ? (
                          lastResult.map((digit, index) => (
                            <div
                              key={index}
                              className="w-7 h-7 rounded-xl bg-[#12061C] border border-[#2a1b3d] flex items-center justify-center text-gray-200 font-extrabold text-base"
                            >
                              {digit}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-600 font-semibold">
                            —
                          </span>
                        )}
                      </div>
                      {lastResultDateKey && (
                        <p className="text-[8px] text-gray-500 font-semibold">
                          {formatShortDate(lastResultDateKey)}
                        </p>
                      )}
                    </div>

                    <div className="w-px h-12 bg-[#2a1b3d] flex-shrink-0"></div>

                    <div className="flex-1 flex flex-col items-center gap-1.5">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">
                        Updated
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-[#C77AFF]">
                          now
                        </span>
                        <RefreshCw
                          size={10}
                          className="text-[#B45CFF] animate-spin-slow"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DIGIT SELECTION CARD */}
            <div className="bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
              {!marketDigitType ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-bold text-red-400">
                    Market digit type is missing
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Configure this market as 2-digit or 3-digit from admin.
                  </p>
                </div>
              ) : (
                <>
                  {formData.gameType ? (
                    renderDigitSelection()
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm font-bold text-gray-500">
                        Please select a game type above
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — BID FORM */}
          <div className="lg:col-span-2">
            <div className="bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] sticky top-4">
              <h2 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Coins size={18} className="text-[#B45CFF]" />
                STEP 2: SELECT COIN AMOUNT
              </h2>
              <p className="text-xs text-gray-400 mb-3">
                Choose how many coins you want to play
              </p>
              <p className="text-[10px] text-gray-500 mb-3">
                Range: {formatUserCurrency(minBidUser)} —{" "}
                {formatUserCurrency(maxBidUser)}{" "}
                <span className="text-gray-600">
                  (₹{marketData.minBid} - ₹{marketData.maxBid} INR)
                </span>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {bidAmountOptions.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleBidAmountClick(amount)}
                        className={`
                          py-2.5 rounded-xl text-sm font-bold transition-all border-2
                          ${
                            Number(formData.bidAmount) === Number(amount)
                              ? `${purpleGradient} text-white`
                              : "bg-[#12061C] text-gray-300 border-[#2a1b3d] hover:border-[#B45CFF]/60 hover:bg-[#2a1b3d]"
                          }
                        `}
                      >
                        {formatUserCurrency(amount)}
                      </button>
                    ))}
                  </div>

                  <div>
                    {!isCustomAmount ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomAmount(true);
                          setCustomAmountError("");
                          setFormData({ ...formData, bidAmount: "" });
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-bold border-2 border-dashed border-[#B45CFF]/50 text-[#C77AFF] hover:bg-[#9B59B6]/10 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Coins size={14} />
                        Enter Custom Amount
                      </button>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                              {currencySymbol}
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              autoFocus
                              value={formData.bidAmount}
                              onChange={handleCustomAmountChange}
                              placeholder={`${minBidUser.toFixed(2)} - ${maxBidUser.toFixed(2)}`}
                              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-bold border-2 outline-none transition-all bg-[#12061C] text-white ${
                                customAmountError
                                  ? "border-red-500/60 focus:border-red-500 text-red-400"
                                  : "border-[#B45CFF]/50 focus:border-[#B45CFF]"
                              }`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomAmount(false);
                              setCustomAmountError("");
                              setFormData({ ...formData, bidAmount: "" });
                            }}
                            className="p-2.5 rounded-xl border-2 border-[#2a1b3d] text-gray-400 hover:bg-[#2a1b3d] hover:text-white transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {customAmountError ? (
                          <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                            <AlertCircle size={11} /> {customAmountError}
                          </p>
                        ) : (
                          <p className="text-[10px] text-gray-500 mt-1.5">
                            Min {formatUserCurrency(minBidUser)} · Max{" "}
                            {formatUserCurrency(maxBidUser)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {formData.bidAmount &&
                    formData.gameType &&
                    formData.number && (
                      <div className="bg-[#9B59B6]/10 rounded-xl p-4 border border-[#9B59B6]/40">
                        <p className="text-xs font-bold text-gray-300 mb-2">
                          POSSIBLE WINNING (APPROX.)
                        </p>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-[10px] text-gray-500">
                              BET AMOUNT
                            </p>
                            <p className="font-bold text-gray-200">
                              {formatUserCurrency(
                                parseFloat(formData.bidAmount),
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500">
                              YOU WILL WIN (APPROX.)
                            </p>
                            <p className="font-extrabold text-[#00E676] text-lg">
                              {formatUserCurrency(calculateWinAmount())}
                              <span className="text-[10px] font-bold bg-[#B45CFF] text-white px-1.5 py-0.5 rounded-full ml-1.5 align-middle">
                                {getMultiplierDisplay(formData.gameType)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-2">
                          * Winning coins may vary as per market rules.
                        </p>
                      </div>
                    )}

                  {localError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle size={14} /> {localError}
                    </div>
                  )}

                  {success && (
                    <div className="bg-[#00E676]/10 border border-[#00E676]/40 text-[#00E676] px-3 py-2.5 rounded-xl text-xs flex items-center gap-2">
                      <Check size={14} /> {success}
                    </div>
                  )}

                  {formData.bidAmount && formData.number && (
                    <div className="bg-[#12061C] rounded-xl p-3 border border-[#2a1b3d]">
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-[10px] text-gray-500">
                            YOUR credit
                          </p>
                          <p className="font-bold text-gray-200">
                            {formatUserCurrency(
                              Number(
                                user?.credit?.local ?? user?.credit ?? 0,
                              ),
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">YOUR BET</p>
                          <p className="font-bold text-[#C77AFF]">
                            {formatUserCurrency(
                              parseFloat(formData.bidAmount) || 0,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">
                            POSSIBLE WIN
                          </p>
                          <p className="font-bold text-[#00E676]">
                            {formatUserCurrency(calculateWinAmount())}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      bidLoading || !formData.number || !formData.bidAmount
                    }
                    className={`w-full ${purpleGradient} py-3.5 rounded-xl text-white font-bold text-base hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {bidLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Zap size={18} />
                        CONFIRM & PLAY
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="flex justify-center gap-4 text-[10px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      🔒 100% Fair Play
                    </span>
                    <span className="flex items-center gap-1">🛡️ Secured</span>
                    <span className="flex items-center gap-1">
                      ⚡ Instant Results
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PlaceBid;
