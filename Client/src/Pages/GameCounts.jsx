// GameSelection.jsx - FULLY FIXED - Manual Number Selection Working

import {
  AlertCircle,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Crown,
  Diamond,
  Flame,
  Gift,
  Home,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCircle,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

// Import country-specific game count slices
import { getGameCounts as getAustraliaGameCounts } from "../redux/slices/australia/gameCountSlice";
import { getGameCounts as getBangladeshGameCounts } from "../redux/slices/bangladesh/gameCountSlice";
import { getGameCounts as getIndiaGameCounts } from "../redux/slices/india/gameCountSlice";
import { getGameCounts as getNepalGameCounts } from "../redux/slices/nepal/gameCountSlice";
import { getGameCounts as getPakistanGameCounts } from "../redux/slices/pakistan/gameCountSlice";
import { getGameCounts as getUaeGameCounts } from "../redux/slices/uae/gameCountSlice";

import {
  createGameEntry,
  resetGameEntryState,
} from "../redux/slices/gameEntrySlice";
import { getUserTicketTypes } from "../redux/slices/ticketTypeSlice";

// Countries data
const countries = [
  { name: "India", flag: "https://flagcdn.com/w80/in.png", code: "IN" },
  { name: "Australia", flag: "https://flagcdn.com/w80/au.png", code: "AU" },
  { name: "Pakistan", flag: "https://flagcdn.com/w80/pk.png", code: "PK" },
  { name: "Bangladesh", flag: "https://flagcdn.com/w80/bd.png", code: "BD" },
  { name: "Nepal", flag: "https://flagcdn.com/w80/np.png", code: "NP" },
  { name: "Dubai", flag: "https://flagcdn.com/w80/ae.png", code: "UAE" },
];

// ==========================================
// CURRENCY CONFIGURATION
// ==========================================
const currencyConfig = {
  IN: { symbol: "₹", code: "INR", name: "Indian Rupee" },
  AU: { symbol: "A$", code: "AUD", name: "Australian Dollar" },
  PK: { symbol: "₨", code: "PKR", name: "Pakistani Rupee" },
  BD: { symbol: "৳", code: "BDT", name: "Bangladeshi Taka" },
  NP: { symbol: "रू", code: "NPR", name: "Nepalese Rupee" },
  UAE: { symbol: "د.إ", code: "AED", name: "UAE Dirham" },
};

// Helper function to get currency symbol
const getCurrencySymbol = (countryCode) => {
  return currencyConfig[countryCode]?.symbol || "₹";
};

// Helper function to format price with currency
const formatPrice = (amount, countryCode) => {
  const symbol = getCurrencySymbol(countryCode);
  return `${symbol}${amount}`;
};

// ===== CUSTOM MODAL COMPONENT =====
const CustomModal = ({ isOpen, onClose, type, title, message, details }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-300 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative p-6 text-center ${isSuccess ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
          >
            <X size={19} />
          </button>
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
            <span className="text-4xl">{isSuccess ? "✅" : "❌"}</span>
          </div>
          <h3 className="text-2xl font-black text-white">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-center text-lg font-semibold text-gray-700">
            {message}
          </p>
          {details && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="break-all font-mono text-xs text-gray-600">
                {details}
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className={`mt-5 w-full rounded-xl py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 ${isSuccess ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}
          >
            {isSuccess ? "🎉 Great!" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
};

const GameSelection = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const urlCountry = searchParams.get("country");

  const { user } = useSelector((state) => state.auth || { user: null });
  const userCountry = user?.country || null;

  const activeCountryName = urlCountry || userCountry;

  // ==========================================
  // COUNTRY CONFIGURATION
  // ==========================================

  const countryConfig = {
    india: {
      stateKey: "indiaGameCount",
      getGameCounts: getIndiaGameCounts,
      countryCode: "IN",
      displayName: "India",
    },
    australia: {
      stateKey: "australiaGameCount",
      getGameCounts: getAustraliaGameCounts,
      countryCode: "AU",
      displayName: "Australia",
    },
    pakistan: {
      stateKey: "pakistanGameCount",
      getGameCounts: getPakistanGameCounts,
      countryCode: "PK",
      displayName: "Pakistan",
    },
    bangladesh: {
      stateKey: "bangladeshGameCount",
      getGameCounts: getBangladeshGameCounts,
      countryCode: "BD",
      displayName: "Bangladesh",
    },
    nepal: {
      stateKey: "nepalGameCount",
      getGameCounts: getNepalGameCounts,
      countryCode: "NP",
      displayName: "Nepal",
    },
    dubai: {
      stateKey: "uaeGameCount",
      getGameCounts: getUaeGameCounts,
      countryCode: "UAE",
      displayName: "Dubai",
    },
    uae: {
      stateKey: "uaeGameCount",
      getGameCounts: getUaeGameCounts,
      countryCode: "UAE",
      displayName: "UAE",
    },
  };

  // ==========================================
  // NORMALIZE COUNTRY
  // ==========================================
  const countryAliases = {
    india: "india",
    in: "india",

    australia: "australia",
    au: "australia",

    pakistan: "pakistan",
    pk: "pakistan",

    bangladesh: "bangladesh",
    bd: "bangladesh",

    nepal: "nepal",
    np: "nepal",

    uae: "uae",
    ae: "uae",
    dubai: "uae",
  };

  const normalizedCountry =
    countryAliases[
      String(activeCountryName || "")
        .trim()
        .toLowerCase()
    ] || "";

  const activeCountryConfig = countryConfig[normalizedCountry] || null;

  // ==========================================
  // REDUX SELECTORS
  // ==========================================

  const { ticketTypes = [], loading: ticketLoading } = useSelector(
    (state) => state.ticketType || {},
  );

  // Get all game counts from all country slices
  const indiaGameCounts = useSelector(
    (state) => state.indiaGameCount?.gameCounts || [],
  );
  const australiaGameCounts = useSelector(
    (state) => state.australiaGameCount?.gameCounts || [],
  );
  const pakistanGameCounts = useSelector(
    (state) => state.pakistanGameCount?.gameCounts || [],
  );
  const bangladeshGameCounts = useSelector(
    (state) => state.bangladeshGameCount?.gameCounts || [],
  );
  const nepalGameCounts = useSelector(
    (state) => state.nepalGameCount?.gameCounts || [],
  );
  const uaeGameCounts = useSelector(
    (state) => state.uaeGameCount?.gameCounts || [],
  );

  // Get the correct game counts based on active country
  const getGameCountsByCountry = () => {
    if (!activeCountryConfig) return [];

    switch (activeCountryConfig.stateKey) {
      case "indiaGameCount":
        return indiaGameCounts;
      case "australiaGameCount":
        return australiaGameCounts;
      case "pakistanGameCount":
        return pakistanGameCounts;
      case "bangladeshGameCount":
        return bangladeshGameCounts;
      case "nepalGameCount":
        return nepalGameCounts;
      case "uaeGameCount":
        return uaeGameCounts;
      default:
        return [];
    }
  };

  const gameCounts = getGameCountsByCountry();

  // Get loading states at the top level.
  const indiaGameCountLoading = useSelector(
    (state) => state.indiaGameCount?.loading || false,
  );
  const australiaGameCountLoading = useSelector(
    (state) => state.australiaGameCount?.loading || false,
  );
  const pakistanGameCountLoading = useSelector(
    (state) => state.pakistanGameCount?.loading || false,
  );
  const bangladeshGameCountLoading = useSelector(
    (state) => state.bangladeshGameCount?.loading || false,
  );
  const nepalGameCountLoading = useSelector(
    (state) => state.nepalGameCount?.loading || false,
  );
  const uaeGameCountLoading = useSelector(
    (state) => state.uaeGameCount?.loading || false,
  );

  const loadingByCountry = {
    indiaGameCount: indiaGameCountLoading,
    australiaGameCount: australiaGameCountLoading,
    pakistanGameCount: pakistanGameCountLoading,
    bangladeshGameCount: bangladeshGameCountLoading,
    nepalGameCount: nepalGameCountLoading,
    uaeGameCount: uaeGameCountLoading,
  };

  const gameCountLoading = activeCountryConfig
    ? Boolean(loadingByCountry[activeCountryConfig.stateKey])
    : false;

  const {
    loading: entryLoading,
    success: entrySuccess,
    error: entryError,
    message: entryMessage,
  } = useSelector((state) => state.gameEntry || {});

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const getCountryCodeFromName = (countryName) => {
    if (!countryName) return null;

    const value = String(countryName).trim().toLowerCase();

    const codeMap = {
      india: "IN",
      in: "IN",
      australia: "AU",
      au: "AU",
      pakistan: "PK",
      pk: "PK",
      bangladesh: "BD",
      bd: "BD",
      nepal: "NP",
      np: "NP",
      uae: "UAE",
      ae: "UAE",
      dubai: "UAE",
    };

    return codeMap[value] || null;
  };

  const getCountryObject = (countryName) => {
    const code = getCountryCodeFromName(countryName);

    if (!code) return null;

    return countries.find((c) => c.code === code) || null;
  };

  const activeCountryCode = useMemo(() => {
    return getCountryCodeFromName(activeCountryName);
  }, [activeCountryName]);

  const activeCountryObject = useMemo(() => {
    return getCountryObject(activeCountryName);
  }, [activeCountryName]);

  // ==========================================
  // STATE DECLARATIONS
  // ==========================================

  const [activeTicket, setActiveTicket] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [selectedGameCount, setSelectedGameCount] = useState(null);
  const [games, setGames] = useState([]);
  const [selectionMode, setSelectionMode] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [drawCount, setDrawCount] = useState(1);
  const [expandedGame, setExpandedGame] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredTicket, setHoveredTicket] = useState(null);
  const [allGamesExpanded, setAllGamesExpanded] = useState(false);
  const [countryError, setCountryError] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    details: null,
  });

  // ==========================================
  // MEMOIZED VALUES
  // ==========================================

  const availableGameTypes = useMemo(() => {
    const ticket = ticketTypes.find((t) => t._id === activeTicket);
    if (ticket && ticket.gameTypes && ticket.gameTypes.length > 0) {
      return ticket.gameTypes.map((gt) => ({
        id: gt._id,
        title: gt.title,
        description: gt.description || "",
        order: gt.order,
        isActive: gt.isActive,
        fullObject: gt,
      }));
    }
    return [
      {
        id: "default",
        title: "Standard Game",
        description: "",
        order: 0,
        isActive: true,
        fullObject: null,
      },
    ];
  }, [ticketTypes, activeTicket]);

  // ==========================================
  // FILTER GAME COUNTS
  // ==========================================
  const filteredGameCounts = useMemo(() => {
    if (!Array.isArray(gameCounts) || gameCounts.length === 0) {
      return [];
    }

    const activeTicketId = String(activeTicket || "");

    if (!activeTicketId) {
      return [];
    }

    const result = gameCounts.filter((item) => {
      const ticketId =
        item?.ticketType?._id ||
        item?.ticketType?.id ||
        item?.ticketType ||
        item?.ticketTypeId ||
        "";

      if (String(ticketId) !== activeTicketId) {
        return false;
      }

      if (!selectedGameType || selectedGameType === "default") {
        return true;
      }

      const gameTypeId =
        item?.gameType?._id ||
        item?.gameType?.id ||
        item?.gameType ||
        item?.gameTypeId ||
        item?.gameTypeDetails?._id ||
        "";

      return String(gameTypeId) === String(selectedGameType);
    });

    if (result.length === 0 && gameCounts.length > 0) {
      const anyForTicket = gameCounts.filter((item) => {
        const ticketId =
          item?.ticketType?._id ||
          item?.ticketType?.id ||
          item?.ticketType ||
          item?.ticketTypeId ||
          "";

        return String(ticketId) === activeTicketId;
      });

      if (anyForTicket.length > 0) {
        return anyForTicket;
      }
    }

    return result;
  }, [gameCounts, activeTicket, selectedGameType]);

  const selectedCount = useMemo(() => {
    if (selectedGameCount) {
      return (
        filteredGameCounts.find(
          (x) => String(x?._id) === String(selectedGameCount),
        ) || null
      );
    }

    if (filteredGameCounts.length > 0) {
      return filteredGameCounts[0];
    }

    return null;
  }, [filteredGameCounts, selectedGameCount]);

  const activeTicketTitle = useMemo(() => {
    const ticket = ticketTypes.find((t) => t._id === activeTicket);
    return ticket?.title || "Select Ticket";
  }, [ticketTypes, activeTicket]);

  const selectedGameTypeTitle = useMemo(() => {
    const gameType = availableGameTypes.find((g) => g.id === selectedGameType);
    return gameType?.title || "";
  }, [availableGameTypes, selectedGameType]);

  const totalPrice = useMemo(() => {
    const basePrice = selectedCount?.price || 0;
    return basePrice * (autoPlay ? drawCount : 1);
  }, [selectedCount, autoPlay, drawCount]);

  const allGamesFilled = useMemo(() => {
    if (games.length === 0) return false;

    if (selectionMode === "quickpick") {
      return games.every(
        (game) =>
          game.numbers &&
          game.numbers.length === 7 &&
          game.powerball !== null &&
          game.powerball !== undefined,
      );
    }
    return games.every(
      (game) =>
        game.selectedNumbers &&
        game.selectedNumbers.length === 7 &&
        game.selectedPowerball !== null &&
        game.selectedPowerball !== undefined,
    );
  }, [games, selectionMode]);

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    dispatch(getUserTicketTypes());
  }, [dispatch]);

  // ==========================================
  // FETCH GAME COUNTS
  // ==========================================
  const lastGameCountRequest = useRef("");

  useEffect(() => {
    if (!activeCountryConfig) return;
    if (!normalizedCountry) return;
    if (!activeTicket) {
      return;
    }

    const ticketType = String(activeTicket).trim();
    if (!ticketType) return;

    const requestKey = `${normalizedCountry}:${ticketType}`;

    if (lastGameCountRequest.current === requestKey) {
      return;
    }

    lastGameCountRequest.current = requestKey;

    dispatch(
      activeCountryConfig.getGameCounts({
        ticketType,
      }),
    );
  }, [dispatch, normalizedCountry, activeTicket, activeCountryConfig]);

  // Set initial ticket
  useEffect(() => {
    if (ticketTypes.length > 0 && !activeTicket) {
      if (urlCountry) {
        const matchingTicket = ticketTypes.find((ticket) =>
          String(ticket?.title || ticket?.name || "")
            .toLowerCase()
            .includes(String(urlCountry).toLowerCase()),
        );

        if (matchingTicket) {
          setActiveTicket(matchingTicket._id);
          return;
        }
      }

      const firstActiveTicket =
        ticketTypes.find((ticket) => ticket?.isActive !== false) ||
        ticketTypes[0];

      setActiveTicket(firstActiveTicket?._id || null);
    }
  }, [ticketTypes, activeTicket, urlCountry]);

  useEffect(() => {
    setSelectedGameType(null);
    setSelectedGameCount(null);
    setGames([]);
    setExpandedGame(null);
    setIsInitialized(false);
    setSelectionMode(null);
    setAllGamesExpanded(false);
  }, [activeTicket]);

  useEffect(() => {
    if (entrySuccess) {
      setShowSuccess(true);
      const selectedTicket = ticketTypes.find((t) => t._id === activeTicket);
      setModal({
        isOpen: true,
        type: "success",
        title: "🎉 Entry Created Successfully!",
        message:
          entryMessage ||
          "Your game entry has been added to cart successfully.",
        details: `Ticket: ${activeTicketTitle} (ID: ${selectedTicket?._id?.slice(-6) || "N/A"}) | Order: ${selectedTicket?.order || 0} | ${selectedCount?.totalGames || 0} Games | ${selectionMode === "quickpick" ? "QuickPick" : "Pick Your Numbers"} | Country: ${activeCountryName} (${activeCountryCode || "N/A"})`,
      });

      const timer = setTimeout(() => {
        closeModal();
        dispatch(resetGameEntryState());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [entrySuccess, dispatch]);

  useEffect(() => {
    if (entryError) {
      const errorMessage =
        typeof entryError === "string"
          ? entryError
          : entryError?.message || "Something went wrong. Please try again.";

      const isCountryError = errorMessage.toLowerCase().includes("country");

      setModal({
        isOpen: true,
        type: "error",
        title: isCountryError ? "🌍 Country Error" : "❌ Error Occurred",
        message: errorMessage,
        details: isCountryError
          ? `Active Country: ${activeCountryName || "Not Set"} (${activeCountryCode || "N/A"})`
          : null,
      });
    }
  }, [entryError, activeCountryName, activeCountryCode]);

  useEffect(() => {
    if (activeTicket && availableGameTypes.length > 0 && !selectedGameType) {
      setSelectedGameType(availableGameTypes[0].id);
    }
  }, [activeTicket, availableGameTypes, selectedGameType]);

  useEffect(() => {
    if (
      selectedGameType &&
      filteredGameCounts.length > 0 &&
      !selectedGameCount
    ) {
      setSelectedGameCount(filteredGameCounts[0]._id);
    }
  }, [selectedGameType, filteredGameCounts, selectedGameCount]);

  // ==========================================
  // MODAL FUNCTIONS
  // ==========================================

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    setShowSuccess(false);
    dispatch(resetGameEntryState());
  };

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const generateRandomGameNumbers = () => {
    const numbers = [];
    while (numbers.length < 7) {
      const num = Math.floor(Math.random() * 35) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  const generateRandomPowerball = () => {
    return Math.floor(Math.random() * 20) + 1;
  };

  const initializeGames = (mode) => {
    const totalGames = selectedCount?.totalGames || 6;
    const newGames = [];

    for (let i = 0; i < totalGames; i++) {
      if (mode === "quickpick") {
        newGames.push({
          id: i + 1,
          numbers: generateRandomGameNumbers(),
          powerball: generateRandomPowerball(),
          selectedNumbers: [],
          selectedPowerball: null,
        });
      } else {
        newGames.push({
          id: i + 1,
          numbers: [],
          powerball: null,
          selectedNumbers: [],
          selectedPowerball: null,
        });
      }
    }

    setGames(newGames);
    setIsInitialized(true);

    if (mode === "pick") {
      setAllGamesExpanded(true);
    } else {
      setAllGamesExpanded(false);
    }
  };

  // ==========================================
  // GAME FUNCTIONS - FIXED
  // ==========================================

  const toggleNumber = (gameIndex, num) => {
    if (selectionMode !== "pick") return;

    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];

      if (!game) return prev;

      const currentNumbers = game.selectedNumbers || [];
      const isSelected = currentNumbers.includes(num);

      if (isSelected) {
        game.selectedNumbers = currentNumbers.filter((n) => n !== num);
      } else {
        if (currentNumbers.length >= 7) {
          setModal({
            isOpen: true,
            type: "error",
            title: "⚠️ Maximum Numbers Reached",
            message: `Game #${gameIndex + 1}: You can select maximum 7 numbers per game.`,
            details: null,
          });
          return prev;
        }
        game.selectedNumbers = [...currentNumbers, num].sort((a, b) => a - b);

        if (game.selectedNumbers.length === 7 && !game.selectedPowerball) {
          game.selectedPowerball = generateRandomPowerball();
        }
      }

      return newGames;
    });
  };

  const togglePowerball = (gameIndex, num) => {
    if (selectionMode !== "pick") return;

    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];

      if (!game) return prev;

      const isSelected = game.selectedPowerball === num;

      if (isSelected) {
        game.selectedPowerball = null;
      } else {
        game.selectedPowerball = num;
      }

      return newGames;
    });
  };

  const autoFillGame = (gameIndex) => {
    if (selectionMode !== "pick") return;

    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];

      if (!game) return prev;

      const numbers = generateRandomGameNumbers();
      game.selectedNumbers = numbers;

      if (!game.selectedPowerball) {
        game.selectedPowerball = generateRandomPowerball();
      }

      return newGames;
    });
  };

  const quickPickGame = (gameIndex) => {
    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];

      if (!game) return prev;

      const numbers = generateRandomGameNumbers();

      if (selectionMode === "pick") {
        game.selectedNumbers = numbers;
        game.selectedPowerball = generateRandomPowerball();
      } else {
        game.numbers = numbers;
        game.powerball = generateRandomPowerball();
      }

      return newGames;
    });
  };

  const clearGame = (gameIndex) => {
    if (selectionMode !== "pick") return;

    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];

      if (!game) return prev;

      game.selectedNumbers = [];
      game.selectedPowerball = null;
      return newGames;
    });
  };

  const handleReshuffleAll = () => {
    setGames((prev) => {
      return prev.map((game) => {
        const numbers = generateRandomGameNumbers();
        if (selectionMode === "pick") {
          return {
            ...game,
            selectedNumbers: numbers,
            selectedPowerball: generateRandomPowerball(),
          };
        } else {
          return {
            ...game,
            numbers: numbers,
            powerball: generateRandomPowerball(),
          };
        }
      });
    });
  };

  const toggleExpand = (gameIndex) => {
    if (expandedGame === gameIndex) {
      setExpandedGame(null);
    } else {
      setExpandedGame(gameIndex);
    }
  };

  // ==========================================
  // HANDLE ADD TO CART
  // ==========================================

  const handleAddToCart = async () => {
    if (!activeCountryName) {
      setModal({
        isOpen: true,
        type: "error",
        title: "🌍 Country Not Set",
        message:
          "Please set your country before playing. Update your profile to continue.",
        details: "Go to Profile → Edit Profile → Select Country",
      });
      return;
    }

    const countryObj = getCountryObject(activeCountryName);
    if (!countryObj) {
      setModal({
        isOpen: true,
        type: "error",
        title: "🌍 Unsupported Country",
        message: `"${activeCountryName}" is not a supported country. Please select a valid country.`,
        details: `Supported countries: ${countries.map((c) => c.name).join(", ")}`,
      });
      return;
    }

    const countryCode = countryObj.code;

    if (!selectionMode) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ Selection Mode Required",
        message:
          'Please select either "Pick Your Numbers" or "QuickPick" mode.',
        details: null,
      });
      return;
    }

    if (games.length === 0) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ No Games",
        message: "No games to add. Please select a game mode first.",
        details: null,
      });
      return;
    }

    if (!allGamesFilled) {
      const incompleteGames = games.filter((g) => {
        if (selectionMode === "quickpick") {
          return !(g.numbers?.length === 7 && g.powerball);
        }
        return !(g.selectedNumbers?.length === 7 && g.selectedPowerball);
      });

      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ Incomplete Games",
        message: `Please fill all ${games.length} games with 7 numbers and a Powerball before adding to cart. ${incompleteGames.length} game(s) incomplete.`,
        details: null,
      });
      return;
    }

    if (!selectedCount || !selectedCount._id) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ No Package Selected",
        message: "Please select a game package.",
        details: null,
      });
      return;
    }

    if (!activeTicket) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ No Ticket Selected",
        message: "Please select a ticket type.",
        details: null,
      });
      return;
    }

    const gameData = games.map((game) => ({
      numbers:
        selectionMode === "quickpick" ? game.numbers : game.selectedNumbers,
      powerball:
        selectionMode === "quickpick" ? game.powerball : game.selectedPowerball,
    }));

    const isValid = gameData.every(
      (g) =>
        g.numbers &&
        g.numbers.length === 7 &&
        g.powerball !== null &&
        g.powerball !== undefined,
    );

    if (!isValid) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ Invalid Game Data",
        message: "All games must have 7 numbers and a Powerball.",
        details: null,
      });
      return;
    }

    const payload = {
      ticketType: activeTicket,
      gameType: selectedGameType === "default" ? null : selectedGameType,
      gameCount: selectedCount._id,
      games: gameData,
      autoPlay: autoPlay,
      drawCount: autoPlay ? drawCount : 1,
      totalPrice: totalPrice,
      country: countryCode,
      countryName: activeCountryName,
      countryFlag: countryObj.flag,
    };

    try {
      await dispatch(createGameEntry(payload)).unwrap();
      setGames([]);
      setIsInitialized(false);
      setSelectionMode(null);
      setAllGamesExpanded(false);
    } catch (error) {
      console.error("Failed to create entry:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Failed to create game entry. Please try again.";

      setModal({
        isOpen: true,
        type: "error",
        title: "❌ Submission Failed",
        message: errorMessage,
        details: null,
      });
    }
  };

  // ==========================================
  // UI HELPERS
  // ==========================================

  const getTicketIcon = (title) => {
    const lower = title?.toLowerCase() || "";
    if (lower.includes("platinum") || lower.includes("premium")) return Crown;
    if (lower.includes("vip")) return Diamond;
    if (lower.includes("powerhit")) return Zap;
    if (lower.includes("system")) return Gift;
    if (lower.includes("syndicate")) return Users;
    return Sparkles;
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (ticketLoading || gameCountLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf0]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-400 border-t-transparent animate-spin">
            <Crown className="text-amber-500" size={28} />
          </div>
          <p className="font-semibold text-gray-600">
            Loading your Wingox dashboard…
          </p>
        </div>
      </div>
    );
  }

  const ticketVisuals = [
    {
      icon: "https://i.ibb.co/hxmPYBfh/icon1.png",
      title: "STANDARD",
      subtitle: "Most Popular",
    },
    {
      icon: "https://i.ibb.co/8Lspfbsd/icon2.png",
      title: "POWERHIT",
      subtitle: "High Rewards",
    },
    {
      icon: "https://i.ibb.co/cSgM060K/icon3.png",
      title: "SYSTEM",
      subtitle: "Smart Play",
    },
    {
      icon: "https://i.ibb.co/WvZct5CP/icon4.png",
      title: "LOTTO PARTY",
      subtitle: "Group Play",
    },
  ];

  const selectGameType = (gameTypeId) => {
    setSelectedGameType(gameTypeId);
    setSelectedGameCount(null);
    setGames([]);
    setExpandedGame(null);
    setIsInitialized(false);
    setSelectionMode(null);
    setAllGamesExpanded(false);
  };

  const selectPackage = (packageId) => {
    setSelectedGameCount(packageId);
    setGames([]);
    setExpandedGame(null);
    setIsInitialized(false);
    setSelectionMode(null);
    setAllGamesExpanded(false);
  };

  const handleModeSelect = (mode) => {
    if (!selectedCount) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ Select Package First",
        message: "Please select a game package before choosing numbers.",
        details: null,
      });
      return;
    }
    setSelectionMode(mode);
    initializeGames(mode);
    setExpandedGame(null);
    setAllGamesExpanded(mode === "pick");
  };

  const getGameDisplayData = (gameIndex) => {
    const game = games[gameIndex];
    if (!game) return { numbers: [], powerball: null, isComplete: false };

    const numbers =
      selectionMode === "quickpick"
        ? game.numbers || []
        : game.selectedNumbers || [];
    const powerball =
      selectionMode === "quickpick" ? game.powerball : game.selectedPowerball;
    const isComplete =
      numbers.length === 7 && powerball !== null && powerball !== undefined;

    return { numbers, powerball, isComplete };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fffdf8] to-[#fff7e8] pb-28 text-[#111]">
      <CustomModal {...modal} onClose={closeModal} />

      {/* HERO */}
      <section className="mx-auto max-w-[860px] sm:pt-4">
        <div className="relative overflow-hidden sm:h-[352px]">
          <img
            src="https://i.ibb.co/60g6N1Fp/banner1.png"
            alt="WinLuxury Powerball"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-4 left-2 flex min-w-[130px] items-center gap-3 rounded-2xl border border-amber-500 bg-black/90 px-3 py-2.5 text-white shadow-2xl sm:bottom-6 sm:left-7 sm:min-w-[40px] sm:px-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white sm:h-12 sm:w-12">
              {activeCountryObject ? (
                <img
                  src={activeCountryObject.flag}
                  alt={activeCountryObject.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl">🇮🇳</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                Playing from
              </div>
              <div className="text-sm font-black sm:text-xl">
                {activeCountryObject?.name || activeCountryName || "INDIA"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {!activeCountryName && (
        <div className="mx-auto mt-3 flex max-w-[860px] items-center gap-3 px-4">
          <div className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={22} />
            <div className="flex-1">
              <strong className="block">Country not set</strong>
              <span className="text-sm">
                Update your profile before playing.
              </span>
            </div>
            <button
              onClick={() => (window.location.href = "/profile")}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white"
            >
              Update
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[860px] px-3 sm:px-5">
        {/* STEP 1: SELECT TICKET TYPE */}
        <section className="mt-3 rounded-[21px] border border-[#f0e6d5] bg-white/95 p-4 shadow-[0_5px_18px_rgba(103,77,29,0.07)] sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-xl font-black text-black">
              1
            </div>
            <div>
              <h2 className="text-[21px] font-black leading-none sm:text-[23px]">
                SELECT TICKET TYPE
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Choose your preferred ticket
              </p>
            </div>
            <div className="ml-auto hidden items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-sm font-black text-red-600 sm:flex">
              <Flame size={16} fill="currentColor" /> Best Value
            </div>
          </div>
          <div className="grid gap-3 grid-cols-3">
            {ticketTypes.slice(0, 4).map((ticket, index) => {
              const isActive = activeTicket === ticket._id;
              const visual = ticketVisuals[index % ticketVisuals.length];

              return (
                <button
                  key={ticket._id}
                  onClick={() => setActiveTicket(ticket._id)}
                  onMouseEnter={() => setHoveredTicket(ticket._id)}
                  onMouseLeave={() => setHoveredTicket(null)}
                  className={`relative flex flex-col items-center justify-center rounded-[17px] border-2 bg-gradient-to-b from-white to-[#fffdf8] text-center pb-3 transition ${
                    isActive
                      ? "border-amber-500 shadow-[0_6px_15px_rgba(229,163,18,0.18)]"
                      : "border-[#f1d7a3] hover:-translate-y-0.5 hover:shadow-lg"
                  }`}
                >
                  {isActive && (
                    <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-500 font-black text-white shadow">
                      ✓
                    </span>
                  )}

                  <span className="flex h-14 w-14 items-center justify-center rounded-full p-2">
                    <img
                      src={visual.icon}
                      alt={ticket.title || visual.title}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                    />
                  </span>

                  <strong className="text-sm font-medium -mt-3">
                    {ticket.title || visual.title}
                  </strong>
                  <small className="text-xs text-amber-700 sm:text-sm">
                    {ticket.subTitle || visual.subtitle}
                  </small>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 2: SELECT GAME TYPE */}
        <section className="mt-2 rounded-[21px] border border-[#f0e6d5] bg-white/95 p-2 shadow-[0_5px_18px_rgba(103,77,29,0.07)] sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black text-xl font-black">
              2
            </div>
            <div>
              <h2 className="text-[21px] font-black leading-none sm:text-[23px]">
                SELECT GAME TYPE
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Choose your game type
              </p>
            </div>
          </div>
          <div
            style={{
              backgroundImage: "url('https://i.ibb.co/WNQ1Y9Gs/banner2.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="relative flex min-h-[95px] items-center overflow-hidden shadow-[0_5px_14px_rgba(230,166,0,0.13)] sm:p-4"
          >
            <div className="min-w-0 ml-11 px-6">
              <strong className="block text-lg font-black sm:text-[28px]">
                {selectedGameTypeTitle || "POWERBALL"}
              </strong>
              <span className="text-sm text-amber-700 sm:text-lg">
                Win Big. Dream Bigger.
              </span>
            </div>
            <div className="mx-2 hidden h-20 w-px bg-amber-300 sm:block" />
            <div className="hidden items-center gap-3 sm:flex">
              <Trophy size={38} className="text-amber-500" />
              <div>
                <small className="block text-xs font-bold text-amber-900">
                  JACKPOT
                </small>
                <strong className="block text-2xl font-black">
                  {/* jackpotAmount */}
                </strong>
                <span className="text-xs text-gray-600">Estimated Jackpot</span>
              </div>
            </div>
            <select
              value={selectedGameType || ""}
              onChange={(e) => selectGameType(e.target.value || null)}
              disabled={!activeTicket || availableGameTypes.length === 0}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Select game type"
            >
              <option value="">Select Game Type</option>
              {availableGameTypes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={24}
              className="ml-auto shrink-0 text-amber-600"
            />
          </div>
        </section>

        {/* STEP 3: SELECT GAME PACKAGE */}
        <section className="mt-2 rounded-[21px] border border-[#f0e6d5] bg-white/95 p-1 shadow-[0_5px_18px_rgba(103,77,29,0.07)] sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black font-black text-xl">
              3
            </div>
            <div>
              <h2 className="text-[21px] font-black leading-none sm:text-[23px]">
                SELECT GAME PACKAGE
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Choose your game package
              </p>
            </div>
            <div className="ml-auto hidden bg-gradient-to-r from-red-500 to-red-700 px-4 py-2 text-xs font-black text-white sm:block [clip-path:polygon(8%_0,100%_0,93%_100%,0_100%)]">
              BEST ODDS
            </div>
          </div>
          <div
            style={{
              backgroundImage: "url('https://i.ibb.co/nsXWsYZs/banner3.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="relative flex min-h-[76px] items-center overflow-hidden rounded-[18px] shadow-[0_5px_14px_rgba(230,166,0,0.1)]"
          >
            <div className="ml-20">
              <strong className="block text-sm font-black sm:text-lg">
                POWER PACK ({selectedCount?.totalGames || 6} GAMES)
              </strong>
              <span className="text-xs text-amber-700 sm:text-sm">
                {selectedCount?.discount
                  ? `${selectedCount.discount}% Off · Best Odds`
                  : "Best Odds - Max Wins"}
              </span>
            </div>
            <span className="ml-auto mr-4 hidden font-black text-gray-700 sm:block">
              {selectedCount
                ? formatPrice(selectedCount.price, activeCountryCode)
                : "—"}
            </span>
            <select
              value={selectedGameCount || ""}
              onChange={(e) => selectPackage(e.target.value || null)}
              disabled={!selectedGameType || filteredGameCounts.length === 0}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Select game package"
            >
              <option value="">Select Game Package</option>
              {filteredGameCounts.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.totalGames} Games -{" "}
                  {getCurrencySymbol(activeCountryCode)}
                  {item.price}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* STEP 4: SELECT NUMBERS */}
        {activeTicket && activeCountryName && (
          <section className="mt-2 rounded-[21px] border border-[#f0e6d5] bg-white/95 p-4 shadow-[0_5px_18px_rgba(103,77,29,0.07)] sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black text-xl font-black">
                4
              </div>
              <div>
                <h2 className="text-[21px] font-black leading-none sm:text-[23px]">
                  SELECT NUMBERS
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Choose 7 numbers + 1 Powerball for each game
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => handleModeSelect("pick")}
                  disabled={!selectedCount}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black shadow transition ${
                    selectionMode === "pick"
                      ? "bg-gradient-to-b from-amber-400 to-amber-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  } sm:px-4 sm:text-sm`}
                >
                  <ClipboardList size={16} /> PICK
                </button>
                <button
                  onClick={() => handleModeSelect("quickpick")}
                  disabled={!selectedCount}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black shadow transition ${
                    selectionMode === "quickpick"
                      ? "bg-gradient-to-b from-yellow-400 to-amber-500 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  } sm:px-4 sm:text-sm`}
                >
                  <Zap size={16} fill="currentColor" /> QUICK
                </button>
              </div>
            </div>

            {!selectionMode && selectedCount && (
              <div className="mb-3 rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-700">
                👆 Select "PICK" to choose numbers manually or "QUICK" for
                random numbers
              </div>
            )}

            {selectionMode && (
              <>
                {/* Games Summary Bar */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-gray-700">
                      {games.length} Games
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-green-600 font-medium">
                      ✅{" "}
                      {
                        games.filter((g) => {
                          if (selectionMode === "quickpick") {
                            return g.numbers?.length === 7 && g.powerball;
                          }
                          return (
                            g.selectedNumbers?.length === 7 &&
                            g.selectedPowerball
                          );
                        }).length
                      }{" "}
                      Complete
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-amber-600 font-medium">
                      {selectionMode === "quickpick"
                        ? "QuickPick"
                        : "Manual Mode"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReshuffleAll}
                      className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-200"
                    >
                      🔄 Reshuffle All
                    </button>
                  </div>
                </div>

                {/* Individual Games */}
                <div className="space-y-4">
                  {games.map((game, gameIndex) => {
                    const { numbers, powerball, isComplete } =
                      getGameDisplayData(gameIndex);
                    const isExpanded =
                      allGamesExpanded || expandedGame === gameIndex;

                    return (
                      <div
                        key={game.id}
                        className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                          isComplete
                            ? "border-green-400 shadow-lg shadow-green-100"
                            : "border-gray-200 hover:border-amber-200 hover:shadow-lg"
                        }`}
                      >
                        {/* Game Header */}
                        <div
                          className="p-3 cursor-pointer hover:bg-amber-50/30 transition-colors duration-200"
                          onClick={() => {
                            if (selectionMode === "pick") {
                              toggleExpand(gameIndex);
                            }
                          }}
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span
                                className={`font-bold text-base min-w-[32px] ${
                                  isComplete
                                    ? "text-green-600"
                                    : "text-gray-700"
                                }`}
                              >
                                #{game.id}
                              </span>

                              {numbers.length > 0 || powerball ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {numbers.map((num, idx) => (
                                    <span
                                      key={idx}
                                      style={{
                                        backgroundImage:
                                          "url('https://i.ibb.co/rGfVhpYT/circle1.png')",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                      }}
                                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-black"
                                    >
                                      {num}
                                    </span>
                                  ))}
                                  {numbers.length > 0 && numbers.length < 7 && (
                                    <span className="text-xs text-gray-400 font-medium">
                                      ({numbers.length}/7)
                                    </span>
                                  )}
                                  {powerball && (
                                    <>
                                      <span className="text-gray-300 font-bold">
                                        |
                                      </span>
                                      <span
                                        style={{
                                          backgroundImage:
                                            "url('https://i.ibb.co/r2ztZKWD/Red-circle.png')",
                                          backgroundSize: "cover",
                                          backgroundPosition: "center",
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                                      >
                                        {powerball}
                                      </span>
                                    </>
                                  )}
                                  {isComplete && (
                                    <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                      ✅ Complete
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                  Click to expand and select numbers
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {selectionMode === "pick" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      quickPickGame(gameIndex);
                                    }}
                                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg transition-colors duration-200 flex items-center gap-1 font-medium"
                                  >
                                    <Zap size={12} />
                                    Quick
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      autoFillGame(gameIndex);
                                    }}
                                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1 rounded-lg transition-colors duration-200 flex items-center gap-1 font-medium"
                                  >
                                    <span>+</span>
                                    Fill
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearGame(gameIndex);
                                    }}
                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1 rounded-lg transition-colors duration-200 flex items-center gap-1 font-medium"
                                  >
                                    <X size={12} />
                                    Clear
                                  </button>
                                </>
                              )}
                              {selectionMode === "quickpick" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    quickPickGame(gameIndex);
                                  }}
                                  className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg transition-colors duration-200 flex items-center gap-1 font-medium"
                                >
                                  <RefreshCw size={12} />
                                  Re-Generate
                                </button>
                              )}

                              {selectionMode === "pick" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(gameIndex);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                >
                                  {isExpanded ? (
                                    <ChevronUp
                                      size={18}
                                      className="text-amber-600"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={18}
                                      className="text-gray-400"
                                    />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content - Number Selection Grid - FIXED */}
                        {selectionMode === "pick" && isExpanded && (
                          <div className="p-4 border-t border-gray-100 bg-amber-50/20">
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></span>
                                  Select 7 numbers (1-35)
                                  <span className="text-gray-400 font-normal ml-2">
                                    ({numbers.length}/7 selected)
                                  </span>
                                </p>
                                {numbers.length === 7 && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    ✅ Full
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
                                {Array.from(
                                  { length: 35 },
                                  (_, i) => i + 1,
                                ).map((num) => {
                                  const isSelected = numbers.includes(num);

                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleNumber(gameIndex, num);
                                      }}
                                      className={`h-9 w-9 rounded-full font-semibold transition-all duration-200 text-sm ${
                                        isSelected
                                          ? "bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black scale-105"
                                          : "bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-amber-300"
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-red-300 rounded-full"></span>
                                  Select Powerball (1-20)
                                  <span className="text-gray-400 font-normal ml-2">
                                    {powerball
                                      ? `Selected: ${powerball}`
                                      : "Not selected"}
                                  </span>
                                </p>
                                {powerball && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    ✅ Set
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                                {Array.from(
                                  { length: 20 },
                                  (_, i) => i + 1,
                                ).map((num) => {
                                  const isSelected = powerball === num;

                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        togglePowerball(gameIndex, num);
                                      }}
                                      className={`h-9 w-9 rounded-full font-semibold transition-all duration-200 text-sm ${
                                        isSelected
                                          ? "bg-[radial-gradient(circle_at_30%_25%,#ff6666_0%,#ed0000_25%,#a80000_55%,#420000_100%)] border border-red-300/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-4px_8px_rgba(40,0,0,0.7),0_4px_10px_rgba(120,0,0,0.4)] text-white scale-105"
                                          : "bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-400"
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Game Status */}
                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-500">
                                Game #{game.id} • {numbers.length}/7 numbers •{" "}
                                {powerball ? "Powerball ✓" : "Powerball ✗"}
                              </span>
                              {isComplete ? (
                                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                  ✅ Ready to Play
                                </span>
                              ) : (
                                <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                                  ⚠️ Incomplete
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* QuickPick mode - show numbers only */}
                        {selectionMode === "quickpick" && (
                          <div className="px-3 pb-3 pt-0 flex items-center gap-2 text-xs text-gray-500">
                            <span>🎲 QuickPick numbers</span>
                            {isComplete ? (
                              <span className="text-green-600 font-medium">
                                ✅ Ready
                              </span>
                            ) : (
                              <span className="text-amber-600">
                                ⏳ Generating...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Toggle All Games */}
                {selectionMode === "pick" && games.length > 1 && (
                  <button
                    onClick={() => setAllGamesExpanded(!allGamesExpanded)}
                    className="mt-3 w-full rounded-xl bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {allGamesExpanded
                      ? "🔼 Collapse All Games"
                      : "🔽 Expand All Games"}
                  </button>
                )}
              </>
            )}
          </section>
        )}

        {/* SUMMARY */}
        {selectedCount &&
          games.length > 0 &&
          allGamesFilled &&
          activeCountryName && (
            <section className="mt-3 overflow-hidden rounded-2xl border border-[#c89b3c]/50 bg-white text-[#241b0b] shadow-[0_10px_35px_rgba(80,55,10,0.18)]">
              {/* Premium Header */}
              <div className="relative overflow-hidden bg-[linear-gradient(135deg,#fffdf5_0%,#f8edc9_35%,#d4aa4c_65%,#9b6b18_100%)] px-4 py-4 sm:px-5">
                {/* Gloss */}
                <div className="pointer-events-none absolute -top-20 left-1/4 h-32 w-1/2 rounded-full bg-white/40 blur-3xl" />

                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/30 shadow-inner">
                        <span className="text-sm">✦</span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black tracking-wide text-[#3b2807] sm:text-base">
                          YOUR SELECTION SUMMARY
                        </h3>

                        <p className="mt-0.5 text-[10px] font-semibold text-[#654b17] sm:text-xs">
                          Review all your selected games
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mode */}
                  <span className="rounded-full border border-white/60 bg-white/35 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#4b3509] shadow-sm backdrop-blur-sm">
                    {selectionMode === "quickpick" ? "QuickPick" : "Manual"}
                  </span>
                </div>

                {/* Stats */}
                <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/50 bg-white/35 px-3 py-2 backdrop-blur-sm">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#72561b]">
                      Games
                    </span>
                    <strong className="text-lg font-black text-[#2e2007]">
                      {games.length}
                    </strong>
                  </div>

                  <div className="rounded-xl border border-white/50 bg-white/35 px-3 py-2 backdrop-blur-sm">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#72561b]">
                      Complete
                    </span>
                    <strong className="text-lg font-black text-green-700">
                      {
                        games.filter((g) => {
                          if (selectionMode === "quickpick") {
                            return g.numbers?.length === 7 && g.powerball;
                          }

                          return (
                            g.selectedNumbers?.length === 7 &&
                            g.selectedPowerball
                          );
                        }).length
                      }
                      <span className="text-xs font-bold text-[#72561b]">
                        /{games.length}
                      </span>
                    </strong>
                  </div>

                  <div className="hidden rounded-xl border border-white/50 bg-white/35 px-3 py-2 backdrop-blur-sm sm:block">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#72561b]">
                      Status
                    </span>

                    <strong className="text-sm font-black text-green-700">
                      {allGamesFilled ? "READY" : "INCOMPLETE"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Game Selection Area */}
              <div className="border-b border-[#d9bd79]/40 bg-[linear-gradient(180deg,#fffdf8_0%,#fff_100%)] p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#5b4310]">
                      Selected Games
                    </h4>

                    <p className="mt-0.5 text-[9px] font-medium text-gray-500">
                      {games.length} game{games.length !== 1 ? "s" : ""}{" "}
                      selected
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                    <span className="text-[9px] font-bold text-gray-500">
                      Completed
                    </span>
                  </div>
                </div>

                {/* 
          IMPORTANT:
          max-height prevents 40-50 games from making the whole page huge.
          Grid automatically adapts to the screen.
        */}
                <div
                  className="
            max-h-[360px]
            overflow-y-auto
            pr-1
            scrollbar-thin
            scrollbar-thumb-[#c89b3c]
            scrollbar-track-[#f7f1df]
          "
                >
                  <div
                    className="
              grid
              grid-cols-1
              gap-2
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
                  >
                    {games.map((game, idx) => {
                      const nums =
                        selectionMode === "quickpick"
                          ? game.numbers || []
                          : game.selectedNumbers || [];

                      const pb =
                        selectionMode === "quickpick"
                          ? game.powerball
                          : game.selectedPowerball;

                      const isComplete = nums.length === 7 && pb;

                      return (
                        <div
                          key={idx}
                          className={`
                    group relative overflow-hidden rounded-xl border
                    bg-white
                    p-2.5
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[0_6px_18px_rgba(160,120,30,0.16)]
                    ${isComplete ? "border-[#d1a63f]/60" : "border-gray-200"}
                  `}
                        >
                          {/* Gold accent */}
                          <div
                            className={`
                      absolute left-0 top-0 h-full w-1
                      ${
                        isComplete
                          ? "bg-[linear-gradient(180deg,#fff2a8,#d4a72c,#8c6114)]"
                          : "bg-gray-200"
                      }
                    `}
                          />

                          <div className="flex items-center justify-between pl-1">
                            <div className="flex items-center gap-2">
                              {/* Game number */}

                              <span className="text-[10px] font-black uppercase tracking-wide text-[#5a4517]">
                                Game #{idx + 1}
                              </span>
                            </div>

                            {isComplete ? (
                              <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[8px] font-black text-green-600">
                                ✓ READY
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-black text-amber-600">
                                PENDING
                              </span>
                            )}
                          </div>

                          {/* Numbers */}
                          <div className="mt-2 flex flex-wrap items-center gap-1 pl-1">
                            {nums.length > 0 ? (
                              nums.map((n, i) => (
                                <span
                                  key={i}
                                  className="
                            flex h-7 min-w-7 items-center justify-center
                            rounded-full
                            border border-[#FFD75A]
  bg-[radial-gradient(circle_at_32%_25%,#FFFDE8_0%,#FFF19A_10%,#FFC928_35%,#E5A400_62%,#B96D00_100%)]
  text-[12px]
  font-black
  text-black
  shadow-[
    inset_2px_2px_4px_rgba(255,255,255,0.9),
    inset_-3px_-4px_6px_rgba(100,55,0,0.6),
    inset_0_1px_2px_rgba(255,255,255,0.95),
    0_2px_7px_rgba(210,145,0,0.45)
  ] text-black
                            px-1
                            text-[8px]
                            font-black
                            
                          "
                                >
                                  {n}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] italic text-gray-400">
                                Not selected
                              </span>
                            )}

                            {pb && (
                              <>
                                <span className="mx-0.5 text-[10px] font-black text-gray-300">
                                  +
                                </span>

                                <span
                                  className="
                            flex h-7 min-w-7 items-center justify-center
                            rounded-full
                            bg-[radial-gradient(circle_at_30%_25%,#ff6666_0%,#ed0000_25%,#a80000_55%,#420000_100%)] border border-red-300/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-4px_8px_rgba(40,0,0,0.7),0_4px_10px_rgba(120,0,0,0.4)]
                            px-1
                            text-[12px]
                            font-black
                            text-white
                          
                          "
                                >
                                  {pb}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scroll hint for many games */}
                {games.length > 12 && (
                  <div className="mt-2 text-center">
                    <span className="text-[9px] font-semibold text-gray-400">
                      ↕ Scroll to view all {games.length} games
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Information */}
              <div className="bg-[#fffdf8] p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    ["Game Type", selectedGameTypeTitle || "POWERBALL"],
                    ["Package", `POWER PACK (${selectedCount.totalGames})`],
                    ["Total Games", `${selectedCount.totalGames}`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="
                rounded-xl
                border border-[#e0c77e]/50
                bg-[linear-gradient(135deg,#fff,#fffaf0)]
                px-3 py-2.5
              "
                    >
                      <small className="block text-[9px] font-black uppercase tracking-wider text-[#a07820]">
                        {label}
                      </small>

                      <strong className="mt-0.5 block truncate text-xs font-black text-[#30230b] sm:text-sm">
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

        {/* PLAY NOW */}
        {selectedCount &&
          allGamesFilled &&
          selectionMode !== null &&
          games.length > 0 &&
          activeCountryName && (
            <>
              <button
                onClick={handleAddToCart}
                disabled={entryLoading}
                className="group relative mt-3 block h-[86px] w-full overflow-hidden disabled:opacity-70"
              >
                <img
                  src="https://i.ibb.co/39SJT6f1/banner6.png"
                  alt="Play Now"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center gap-5 text-xl font-black tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)] sm:text-4xl">
                  {entryLoading ? (
                    "PROCESSING…"
                  ) : (
                    <>
                      <span>»</span> PLAY NOW <span>«</span>
                    </>
                  )}
                </span>
              </button>

              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {[
                  [Calendar, "DRAW TIME", "Today", "10:30 PM"],
                  [BarChart3, "ODDS", "1 in 292M", "Win Probability"],
                  [ShieldCheck, "SECURE PLAY", "100% Safe", "Secure & Fair"],
                  [Trophy, "JACKPOT", "Est. Jackpot"],
                ].map(([Icon, label, value, sub]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm"
                  >
                    <Icon size={21} className="mb-1 text-amber-500" />
                    <small className="block text-[9px] font-bold text-gray-500">
                      {label}
                    </small>
                    <strong className="block text-sm sm:text-base">
                      {value}
                    </strong>
                    <span className="text-[9px] text-gray-500">{sub}</span>
                  </div>
                ))}
              </div>
            </>
          )}
      </main>

      {/* FIXED BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-[78px] max-w-[860px] items-center justify-around rounded-t-[26px] border border-amber-100 bg-white/95 px-2 shadow-[0_-6px_25px_rgba(0,0,0,0.08)] backdrop-blur">
        <button className="flex flex-col items-center gap-1 text-amber-600">
          <Home size={24} />
          <span className="text-xs font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <BarChart3 size={24} />
          <span className="text-xs font-bold">Activity</span>
        </button>
        <button className="-mt-9 flex h-16 w-16 flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-yellow-300 to-amber-500 text-black shadow-[0_5px_20px_rgba(218,151,0,0.4)]">
          <Gift size={24} />
          <span className="text-[9px] font-black">PROMO</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <WalletCards size={24} />
          <span className="text-xs font-bold">Wallet</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <UserCircle size={24} />
          <span className="text-xs font-bold">Account</span>
        </button>
      </nav>
    </div>
  );
};

export default GameSelection;
