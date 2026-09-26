// GameSelection.jsx - COMPACT & MOBILE RESPONSIVE

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

const countries = [
  { name: "India", flag: "", code: "IN" },
  { name: "Australia", flag: "", code: "AU" },
  { name: "Pakistan", flag: "", code: "PK" },
  { name: "Bangladesh", flag: "", code: "BD" },
  { name: "Nepal", flag: "", code: "NP" },
  { name: "Dubai", flag: "", code: "UAE" },
];

const currencyConfig = {
  IN: { symbol: "₹", code: "INR", name: "Indian Rupee" },
  AU: { symbol: "A$", code: "AUD", name: "Australian Dollar" },
  PK: { symbol: "₨", code: "PKR", name: "Pakistani Rupee" },
  BD: { symbol: "৳", code: "BDT", name: "Bangladeshi Taka" },
  NP: { symbol: "रू", code: "NPR", name: "Nepalese Rupee" },
  UAE: { symbol: "د.إ", code: "AED", name: "UAE Dirham" },
};

const getCurrencySymbol = (countryCode) => {
  return currencyConfig[countryCode]?.symbol || "₹";
};

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-[#B45CFF]/50 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative p-4 text-center ${isSuccess ? "bg-gradient-to-r from-[#B45CFF] to-[#7418F5]" : "bg-gradient-to-r from-red-500 to-rose-600"}`}
        >
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/30"
          >
            <X size={16} />
          </button>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl">
            <span className="text-2xl">{isSuccess ? "✅" : "❌"}</span>
          </div>
          <h3 className="text-lg font-black text-white">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-center text-sm font-semibold text-gray-600">
            {message}
          </p>
          {details && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="break-all font-mono text-[10px] text-gray-500">
                {details}
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className={`mt-4 w-full rounded-lg py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 ${isSuccess ? "bg-gradient-to-r from-[#B45CFF] to-[#7418F5]" : "bg-gradient-to-r from-red-500 to-rose-600"}`}
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

  const { ticketTypes = [], loading: ticketLoading } = useSelector(
    (state) => state.ticketType || {},
  );

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

  const [modal, setModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    details: null,
  });

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

  const filteredGameCounts = useMemo(() => {
    if (!Array.isArray(gameCounts) || gameCounts.length === 0) return [];
    const activeTicketId = String(activeTicket || "");
    if (!activeTicketId) return [];

    const result = gameCounts.filter((item) => {
      const ticketId =
        item?.ticketType?._id ||
        item?.ticketType?.id ||
        item?.ticketType ||
        item?.ticketTypeId ||
        "";
      if (String(ticketId) !== activeTicketId) return false;
      if (!selectedGameType || selectedGameType === "default") return true;

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
      if (anyForTicket.length > 0) return anyForTicket;
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
    if (filteredGameCounts.length > 0) return filteredGameCounts[0];
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

  useEffect(() => {
    dispatch(getUserTicketTypes());
  }, [dispatch]);

  const lastGameCountRequest = useRef("");

  useEffect(() => {
    if (!activeCountryConfig) return;
    if (!normalizedCountry) return;
    if (!activeTicket) return;
    const ticketType = String(activeTicket).trim();
    if (!ticketType) return;
    const requestKey = `${normalizedCountry}:${ticketType}`;
    if (lastGameCountRequest.current === requestKey) return;
    lastGameCountRequest.current = requestKey;
    dispatch(activeCountryConfig.getGameCounts({ ticketType }));
  }, [dispatch, normalizedCountry, activeTicket, activeCountryConfig]);

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
        title: "🎉 Entry Created!",
        message:
          entryMessage ||
          "Your game entry has been added to cart successfully.",
        details: `Ticket: ${activeTicketTitle} | ${selectedCount?.totalGames || 0} Games | ${selectionMode === "quickpick" ? "QuickPick" : "Manual"} | ${activeCountryName}`,
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
        title: isCountryError ? "🌍 Country Error" : "❌ Error",
        message: errorMessage,
        details: isCountryError
          ? `Active Country: ${activeCountryName || "Not Set"}`
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

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    setShowSuccess(false);
    dispatch(resetGameEntryState());
  };

  const generateRandomGameNumbers = () => {
    const numbers = [];
    while (numbers.length < 7) {
      const num = Math.floor(Math.random() * 35) + 1;
      if (!numbers.includes(num)) numbers.push(num);
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
    setAllGamesExpanded(mode === "pick");
  };

  const toggleNumber = (gameIndex, num) => {
    if (selectionMode !== "pick") return;
    setGames((prev) => {
      const game = prev[gameIndex];
      if (!game) return prev;
      const currentNumbers = Array.isArray(game.selectedNumbers)
        ? game.selectedNumbers
        : [];
      const isSelected = currentNumbers.includes(num);

      if (isSelected) {
        return prev.map((item, index) =>
          index === gameIndex
            ? {
                ...item,
                selectedNumbers: currentNumbers.filter((n) => n !== num),
              }
            : item,
        );
      }

      if (currentNumbers.length >= 7) {
        setModal({
          isOpen: true,
          type: "error",
          title: "⚠️ Max Numbers",
          message: `Game #${gameIndex + 1}: Max 7 numbers per game.`,
          details: null,
        });
        return prev;
      }

      const nextNumbers = [...currentNumbers, num].sort((a, b) => a - b);
      return prev.map((item, index) =>
        index === gameIndex
          ? {
              ...item,
              selectedNumbers: nextNumbers,
              selectedPowerball: item.selectedPowerball ?? null,
            }
          : item,
      );
    });
  };

  const togglePowerball = (gameIndex, num) => {
    if (selectionMode !== "pick") return;
    setGames((prev) =>
      prev.map((item, index) =>
        index === gameIndex
          ? {
              ...item,
              selectedPowerball: item.selectedPowerball === num ? null : num,
            }
          : item,
      ),
    );
  };

  const autoFillGame = (gameIndex) => {
    if (selectionMode !== "pick") return;
    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];
      if (!game) return prev;
      game.selectedNumbers = generateRandomGameNumbers();
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

  const handleAddToCart = async () => {
    if (!activeCountryName) {
      setModal({
        isOpen: true,
        type: "error",
        title: "🌍 Country Not Set",
        message: "Please set your country before playing.",
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
        message: `"${activeCountryName}" is not supported.`,
        details: `Supported: ${countries.map((c) => c.name).join(", ")}`,
      });
      return;
    }

    const countryCode = countryObj.code;

    if (!selectionMode) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ Mode Required",
        message: 'Please select "Pick Your Numbers" or "QuickPick" mode.',
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
        message: `Please fill all ${games.length} games with 7 numbers + Powerball. ${incompleteGames.length} incomplete.`,
        details: null,
      });
      return;
    }

    if (!selectedCount || !selectedCount._id) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ No Package",
        message: "Please select a game package.",
        details: null,
      });
      return;
    }

    if (!activeTicket) {
      setModal({
        isOpen: true,
        type: "error",
        title: "⚠️ No Ticket",
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
        title: "⚠️ Invalid Data",
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

  const getTicketIcon = (title) => {
    const lower = title?.toLowerCase() || "";
    if (lower.includes("platinum") || lower.includes("premium")) return Crown;
    if (lower.includes("vip")) return Diamond;
    if (lower.includes("powerhit")) return Zap;
    if (lower.includes("system")) return Gift;
    if (lower.includes("syndicate")) return Users;
    return Sparkles;
  };

  if (ticketLoading || gameCountLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0410]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#B45CFF] border-t-transparent animate-spin">
            <Crown className="text-[#B45CFF]" size={22} />
          </div>
          <p className="text-sm font-semibold text-gray-400">
            Loading Wingox...
          </p>
        </div>
      </div>
    );
  }

  const ticketVisuals = [
    { title: "STANDARD", subtitle: "Most Popular" },
    { title: "POWERHIT", subtitle: "High Rewards" },
    { title: "SYSTEM", subtitle: "Smart Play" },
    { title: "LOTTO PARTY", subtitle: "Group Play" },
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
        title: "⚠️ Select Package",
        message: "Please select a game package first.",
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
    <div className="min-h-screen bg-[#0B0410] pb-24 text-white overflow-x-hidden">
      <CustomModal {...modal} onClose={closeModal} />

      {/* HERO - Compact */}
      <section className="mx-auto max-w-[980px] px-2 pt-2 sm:px-4 sm:pt-3">
        <div className="relative h-[140px] overflow-hidden rounded-xl border border-[#2a1b3d] shadow-[0_0_20px_rgba(116,24,245,0.18)] sm:h-[260px] md:h-[320px]">
          <img
            src="https://i.ibb.co/60g6N1Fp/banner1.png"
            alt="WinLuxury Powerball"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-xl border border-[#B45CFF]/70 bg-[#0B0410]/90 px-2.5 py-1.5 text-white shadow-xl sm:bottom-4 sm:left-5 sm:gap-3 sm:px-3.5 sm:py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white sm:h-10 sm:w-10">
              <span className="text-lg sm:text-2xl">
                {activeCountryObject?.code === "IN"
                  ? "🇮🇳"
                  : activeCountryObject?.code === "AU"
                    ? "🇦🇺"
                    : activeCountryObject?.code === "PK"
                      ? "🇵🇰"
                      : activeCountryObject?.code === "BD"
                        ? "🇧🇩"
                        : activeCountryObject?.code === "NP"
                          ? "🇳🇵"
                          : "🇦🇪"}
              </span>
            </div>
            <div>
              <div className="text-[9px] font-bold text-[#C77AFF] sm:text-[11px]">
                Playing from
              </div>
              <div className="text-[11px] font-black sm:text-base">
                {activeCountryObject?.name || activeCountryName || "INDIA"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {!activeCountryName && (
        <div className="mx-auto mt-2 flex max-w-[980px] items-center gap-2 px-2 sm:px-4">
          <div className="flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-500/10 p-2.5 text-red-400">
            <AlertCircle size={18} />
            <div className="flex-1">
              <strong className="block text-xs">Country not set</strong>
              <span className="text-[10px]">
                Update your profile before playing.
              </span>
            </div>
            <button
              onClick={() => (window.location.href = "/profile")}
              className="rounded-lg bg-red-500 px-2.5 py-1.5 text-[10px] font-bold text-white"
            >
              Update
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[980px] px-2 sm:px-2 md:px-5">
        {/* STEP 1: SELECT TICKET TYPE - Compact */}
        <section className="mt-2 rounded-xl border border-[#2a1b3d] bg-[#12061C]/95 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:rounded-[18px] sm:p-1">
          <div className="mb-2.5 flex items-center gap-2 sm:mb-3 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_rgba(180,92,255,0.55)] text-sm font-black text-white sm:h-10 sm:w-10 sm:text-base">
              1
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black leading-none sm:text-lg">
                SELECT TICKET TYPE
              </h2>
              <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
                Choose your preferred ticket
              </p>
            </div>
            <div className="ml-auto hidden items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-black text-red-400 sm:flex">
              <Flame size={12} fill="currentColor" /> Best Value
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {ticketTypes.slice(0, 4).map((ticket, index) => {
              const isActive = activeTicket === ticket._id;
              const visual = ticketVisuals[index % ticketVisuals.length];
              return (
                <button
                  key={ticket._id}
                  onClick={() => setActiveTicket(ticket._id)}
                  onMouseEnter={() => setHoveredTicket(ticket._id)}
                  onMouseLeave={() => setHoveredTicket(null)}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 bg-gradient-to-b from-[#1C0F2B] to-[#12061C] text-center pb-2 pt-1.5 transition sm:rounded-[14px] sm:pb-3 sm:pt-2 ${
                    isActive
                      ? "border-[#B45CFF] shadow-[0_0_14px_rgba(180,92,255,0.22)]"
                      : "border-[#2a1b3d] hover:-translate-y-0.5 hover:border-[#B45CFF]/60"
                  }`}
                >
                  {isActive && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#B45CFF] text-[9px] font-black text-white shadow sm:h-6 sm:w-6 sm:text-xs">
                      ✓
                    </span>
                  )}
                  <span className="mt-1.5 flex h-9 w-9 items-center justify-center rounded-xl border border-[#B45CFF]/30 bg-[#B45CFF]/10 text-[#C77AFF] shadow-[0_0_10px_rgba(180,92,255,0.16)] sm:mt-2 sm:h-11 sm:w-11">
                    {(() => {
                      const Icon = getTicketIcon(ticket.title || visual.title);
                      return <Icon size={20} strokeWidth={2.2} />;
                    })()}
                  </span>
                  <strong className="mt-1 text-[10px] font-bold leading-tight sm:text-xs">
                    {ticket.title || visual.title}
                  </strong>
                  <small className="text-[8px] text-[#C77AFF] sm:text-[10px]">
                    {ticket.subTitle || visual.subtitle}
                  </small>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 2: SELECT GAME TYPE - Compact */}
        <section className="mt-2 rounded-xl border border-[#2a1b3d] bg-[#12061C]/95 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:rounded-[18px] sm:p-1">
          <div className="mb-2.5 flex items-center gap-2 sm:mb-3 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_rgba(180,92,255,0.55)] text-sm font-black text-white sm:h-10 sm:w-10 sm:text-base">
              2
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black leading-none sm:text-lg">
                SELECT GAME TYPE
              </h2>
              <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
                Choose your game type
              </p>
            </div>
          </div>
          <div className="relative flex min-h-[70px] items-center overflow-hidden rounded-xl border border-[#B45CFF]/35 bg-gradient-to-r from-[#1C0F2B] via-[#12061C] to-[#1C0F2B] p-2 shadow-[0_0_18px_rgba(116,24,245,0.12)] sm:min-h-[90px] sm:p-3">
            <div className="min-w-0 pl-2 pr-10 sm:pl-4 sm:pr-12">
              <strong className="block text-sm font-black text-white sm:text-xl">
                {selectedGameTypeTitle || "POWERBALL"}
              </strong>
              <span className="text-[10px] text-[#C77AFF] sm:text-sm">
                Win Big. Dream Bigger.
              </span>
            </div>
            <div className="mx-2 hidden h-14 w-px bg-[#B45CFF]/40 sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <Trophy size={28} className="text-[#B45CFF]" />
              <div>
                <small className="block text-[9px] font-bold text-[#C77AFF]">
                  JACKPOT
                </small>
                <strong className="block text-lg font-black"></strong>
                <span className="text-[9px] text-gray-400">
                  Estimated Jackpot
                </span>
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
              size={18}
              className="ml-auto shrink-0 text-[#B45CFF]"
            />
          </div>
        </section>

        {/* STEP 3: SELECT GAME PACKAGE - Compact */}
        <section className="mt-2 rounded-xl border border-[#2a1b3d] bg-[#12061C]/95 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:rounded-[18px] sm:p-1">
          <div className="mb-2.5 flex items-center gap-2 sm:mb-3 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_rgba(180,92,255,0.55)] text-sm font-black text-white sm:h-10 sm:w-10 sm:text-base">
              3
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black leading-none sm:text-lg">
                SELECT GAME PACKAGE
              </h2>
              <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
                Choose your game package
              </p>
            </div>
            <div className="ml-auto hidden bg-gradient-to-r from-red-500 to-red-700 px-3 py-1.5 text-[10px] font-black text-white sm:block [clip-path:polygon(8%_0,100%_0,93%_100%,0_100%)]">
              BEST ODDS
            </div>
          </div>
          <div className="relative flex min-h-[60px] items-center overflow-hidden rounded-xl border border-[#B45CFF]/35 bg-gradient-to-r from-[#1C0F2B] via-[#12061C] to-[#1C0F2B] px-2.5 shadow-[0_0_18px_rgba(116,24,245,0.12)] sm:min-h-[75px] sm:px-4">
            <div className="ml-1 min-w-0 pl-1 sm:ml-2 sm:pl-2">
              <strong className="block text-xs font-black text-white sm:text-base">
                POWER PACK ({selectedCount?.totalGames || 6} GAMES)
              </strong>
              <span className="text-[9px] text-[#C77AFF] sm:text-xs">
                {selectedCount?.discount
                  ? `${selectedCount.discount}% Off · Best Odds`
                  : "Best Odds - Max Wins"}
              </span>
            </div>
            <span className="ml-auto mr-3 hidden text-sm font-black text-gray-300 sm:block">
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

        {/* STEP 4: SELECT NUMBERS - Compact */}
        {activeTicket && activeCountryName && (
          <section className="mt-2 rounded-xl border border-[#2a1b3d] bg-[#12061C]/95 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:rounded-[18px] sm:p-1">
            <div className="mb-2 grid grid-cols-[32px_minmax(0,1fr)] items-center gap-x-2 gap-y-2 sm:flex sm:items-center sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_rgba(180,92,255,0.55)] text-sm font-black text-white sm:h-10 sm:w-10 sm:text-base">
                4
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black leading-tight sm:text-lg sm:leading-none">
                  SELECT NUMBERS
                </h2>
                <p className="mt-0.5 text-[9px] leading-3 text-gray-400 sm:mt-1 sm:text-xs">
                  Choose 7 numbers + 1 Powerball
                </p>
              </div>
              <div className="col-span-2 flex w-full gap-1.5 sm:ml-auto sm:w-auto">
                <button
                  onClick={() => handleModeSelect("pick")}
                  disabled={!selectedCount}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black shadow transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs ${
                    selectionMode === "pick"
                      ? "bg-gradient-to-b from-[#B45CFF] to-[#7418F5] text-white"
                      : "bg-[#1C0F2B] text-gray-400 hover:bg-[#2a1b3d]"
                  }`}
                >
                  <ClipboardList size={12} /> PICK
                </button>
                <button
                  onClick={() => handleModeSelect("quickpick")}
                  disabled={!selectedCount}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black shadow transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs ${
                    selectionMode === "quickpick"
                      ? "bg-gradient-to-b from-[#B45CFF] to-[#7418F5] text-white"
                      : "bg-[#1C0F2B] text-gray-400 hover:bg-[#2a1b3d]"
                  }`}
                >
                  <Zap size={12} fill="currentColor" /> QUICK
                </button>
              </div>
            </div>

            {!selectionMode && selectedCount && (
              <div className="mb-2 rounded-lg bg-[#B45CFF]/10 p-2 text-center text-[10px] text-[#C77AFF] sm:text-xs">
                👆 Select "PICK" to choose numbers manually or "QUICK" for
                random numbers
              </div>
            )}

            {selectionMode && (
              <>
                {/* Games Summary Bar - Compact */}
                <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 rounded-lg bg-[#1C0F2B] px-2 py-1.5 sm:mb-3 sm:gap-2 sm:p-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:gap-2 sm:text-xs">
                    <span className="font-bold text-gray-300">
                      {games.length} Games
                    </span>
                    <span className="text-gray-500">|</span>
                    <span className="text-[#00E676] font-medium">
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
                      Done
                    </span>
                    <span className="text-gray-500">|</span>
                    <span className="text-[#B45CFF] font-medium">
                      {selectionMode === "quickpick" ? "QuickPick" : "Manual"}
                    </span>
                  </div>
                  <button
                    onClick={handleReshuffleAll}
                    className="rounded-md bg-[#B45CFF]/15 px-2 py-1 text-[9px] font-bold text-[#C77AFF] hover:bg-[#B45CFF]/25 sm:px-2.5 sm:text-[10px]"
                  >
                    🔄 Reshuffle
                  </button>
                </div>

                {/* Individual Games - Compact */}
                <div className="space-y-2 sm:space-y-3">
                  {games.map((game, gameIndex) => {
                    const { numbers, powerball, isComplete } =
                      getGameDisplayData(gameIndex);
                    const isExpanded =
                      allGamesExpanded || expandedGame === gameIndex;

                    return (
                      <div
                        key={game.id}
                        className={`rounded-lg border transition-all duration-300 overflow-hidden sm:rounded-xl sm:border-2 ${
                          isComplete
                            ? "border-[#00E676]/50 shadow-md shadow-green-900/20"
                            : "border-[#2a1b3d] hover:border-[#B45CFF]/50"
                        }`}
                      >
                        {/* Game Header - Compact */}
                        <div
                          className="cursor-pointer px-2 py-1.5 hover:bg-[#B45CFF]/5 transition-colors duration-200 sm:p-2.5"
                          onClick={() => {
                            if (selectionMode === "pick") {
                              toggleExpand(gameIndex);
                            }
                          }}
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-bold min-w-[26px] sm:text-sm sm:min-w-[30px] ${
                                  isComplete
                                    ? "text-[#00E676]"
                                    : "text-gray-300"
                                }`}
                              >
                                #{game.id}
                              </span>

                              {numbers.length > 0 || powerball ? (
                                <div className="flex items-center gap-0.5 flex-wrap sm:gap-1">
                                  {numbers.map((num, idx) => (
                                    <span
                                      key={idx}
                                      className="flex h-5 w-5 items-center justify-center rounded-full border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] text-[8px] font-bold text-white shadow-[0_0_5px_rgba(180,92,255,0.35)] sm:h-7 sm:w-7 sm:text-[10px]"
                                    >
                                      {num}
                                    </span>
                                  ))}
                                  {numbers.length > 0 && numbers.length < 7 && (
                                    <span className="text-[9px] text-gray-400 font-medium sm:text-[10px]">
                                      ({numbers.length}/7)
                                    </span>
                                  )}
                                  {powerball && (
                                    <>
                                      <span className="text-gray-400 font-bold text-[9px] sm:text-[10px]">
                                        |
                                      </span>
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-red-300 bg-[radial-gradient(circle_at_30%_25%,#ff7777_0%,#ef2020_30%,#b40000_65%,#560000_100%)] text-[8px] font-bold text-white shadow-[0_0_5px_rgba(239,68,68,0.45)] sm:h-6 sm:w-6 sm:text-[10px]">
                                        {powerball}
                                      </span>
                                    </>
                                  )}
                                  {isComplete && (
                                    <span className="ml-1 text-[8px] bg-[#00E676]/10 text-[#00E676] px-1.5 py-0.5 rounded-full font-medium sm:text-[9px]">
                                      ✅
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-[9px] flex items-center gap-1 sm:text-[10px]">
                                  <span className="w-1 h-1 bg-[#B45CFF] rounded-full animate-pulse"></span>
                                  Tap to expand
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 flex-wrap">
                              {selectionMode === "pick" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      quickPickGame(gameIndex);
                                    }}
                                    className="text-[9px] bg-[#B45CFF]/10 hover:bg-[#B45CFF]/15 text-[#C77AFF] px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 font-medium sm:px-2 sm:py-1 sm:text-[10px]"
                                  >
                                    <Zap size={10} />
                                    Quick
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      autoFillGame(gameIndex);
                                    }}
                                    className="text-[9px] bg-[#00E676]/10 hover:bg-[#00E676]/15 text-[#00E676] px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 font-medium sm:px-2 sm:py-1 sm:text-[10px]"
                                  >
                                    <span>+</span>Fill
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearGame(gameIndex);
                                    }}
                                    className="text-[9px] bg-red-500/10 hover:bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 font-medium sm:px-2 sm:py-1 sm:text-[10px]"
                                  >
                                    <X size={10} />
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
                                  className="text-[9px] bg-[#B45CFF]/10 hover:bg-[#B45CFF]/15 text-[#C77AFF] px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 font-medium sm:px-2 sm:py-1 sm:text-[10px]"
                                >
                                  <RefreshCw size={10} />
                                  Regen
                                </button>
                              )}
                              {selectionMode === "pick" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(gameIndex);
                                  }}
                                  className="p-0.5 hover:bg-[#1C0F2B] rounded transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronUp
                                      size={14}
                                      className="text-[#B45CFF]"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-gray-400"
                                    />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content - Compact Number Grid */}
                        {selectionMode === "pick" && isExpanded && (
                          <div className="border-t border-[#2a1b3d] bg-[#0B0410] p-2 sm:p-4">
                            {/* Main numbers */}

                            <div className="rounded-lg border border-[#2a1b3d] bg-[#12061C] p-2 sm:rounded-xl sm:p-3">
                              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 sm:mb-2 sm:gap-2">
                                <p className="flex items-center gap-1 text-[9px] font-bold text-gray-200 sm:gap-1.5 sm:text-xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#B45CFF] shadow-[0_0_6px_rgba(180,92,255,0.9)] sm:h-2 sm:w-2" />
                                  Select 7 Numbers
                                  <span className="font-normal text-gray-500">
                                    (1–35)
                                  </span>
                                </p>
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[8px] font-black sm:px-2 sm:py-0.5 sm:text-[10px] ${
                                    numbers.length === 7
                                      ? "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/25"
                                      : "bg-[#B45CFF]/10 text-[#C77AFF] border border-[#B45CFF]/25"
                                  }`}
                                >
                                  {numbers.length}/7
                                </span>
                              </div>

                              {/* ✅ CHANGED: grid-cols-6 (mobile) instead of grid-cols-7 */}
                              <div className="grid grid-cols-6 gap-1.5 md:grid-cols-10 md:gap-2">
                                {Array.from(
                                  { length: 35 },
                                  (_, i) => i + 1,
                                ).map((num) => {
                                  const isSelected = numbers.includes(num);
                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() =>
                                        toggleNumber(gameIndex, num)
                                      }
                                      aria-pressed={isSelected}
                                      className={`flex h-8 w-8 items-center justify-center justify-self-center rounded-full border text-[10px] font-black transition-all duration-150 sm:h-10 sm:w-10 sm:text-sm ${
                                        isSelected
                                          ? "border-[#C77AFF] bg-gradient-to-br from-[#C77AFF] via-[#8B2BFF] to-[#3A00C9] text-white shadow-[0_0_8px_rgba(180,92,255,0.55)] scale-105"
                                          : "border-[#3a2550] bg-[#1C0F2B] text-gray-300 hover:border-[#B45CFF] hover:bg-[#251238] hover:text-white active:scale-95"
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Red Powerball */}
                            <div className="mt-2 rounded-lg border border-red-500/20 bg-[#12061C] p-2 sm:mt-2.5 sm:rounded-xl sm:p-3">
                              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 sm:mb-2 sm:gap-2">
                                <p className="flex items-center gap-1 text-[9px] font-bold text-gray-200 sm:gap-1.5 sm:text-xs">
                                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                  Powerball
                                  <span className="font-normal text-gray-500">
                                    (1–20)
                                  </span>
                                </p>
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[8px] font-black sm:px-2 sm:py-0.5 sm:text-[10px] ${
                                    powerball
                                      ? "border border-red-400/30 bg-red-500/10 text-red-400"
                                      : "border border-red-500/15 bg-red-500/5 text-red-300/70"
                                  }`}
                                >
                                  {powerball
                                    ? `PB ${powerball}`
                                    : "NOT SELECTED"}
                                </span>
                              </div>

                              {/* ✅ CHANGED: grid-cols-6 (mobile) instead of grid-cols-7 */}
                              <div className="grid grid-cols-6 gap-1.5 md:grid-cols-10 md:gap-2">
                                {Array.from(
                                  { length: 20 },
                                  (_, i) => i + 1,
                                ).map((num) => {
                                  const isSelected = powerball === num;
                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() =>
                                        togglePowerball(gameIndex, num)
                                      }
                                      aria-pressed={isSelected}
                                      className={`flex h-8 w-8 items-center justify-center justify-self-center rounded-full border text-[10px] font-black transition-all duration-150 sm:h-10 sm:w-10 sm:text-sm ${
                                        isSelected
                                          ? "border-red-300 bg-[radial-gradient(circle_at_30%_25%,#ff7777_0%,#ef2020_30%,#b40000_65%,#560000_100%)] text-white shadow-[0_0_10px_rgba(239,68,68,0.6)] scale-105"
                                          : "border-red-500/30 bg-[#2a0d15] text-red-300 hover:border-red-400 hover:bg-[#40101b] hover:text-red-100 active:scale-95"
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Game Status - Compact */}
                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 border-t border-[#2a1b3d] pt-1.5 sm:mt-2 sm:gap-2 sm:pt-2">
                              <span className="text-[9px] text-gray-500 sm:text-[10px]">
                                Game #{game.id} • {numbers.length}/7 •{" "}
                                {powerball ? "PB ✓" : "PB ✗"}
                              </span>
                              {isComplete ? (
                                <span className="rounded-full border border-[#00E676]/25 bg-[#00E676]/10 px-2 py-0.5 text-[8px] font-bold text-[#00E676] sm:text-[10px]">
                                  ✓ READY
                                </span>
                              ) : (
                                <span className="rounded-full border border-[#B45CFF]/25 bg-[#B45CFF]/10 px-2 py-0.5 text-[8px] font-bold text-[#C77AFF] sm:text-[10px]">
                                  INCOMPLETE
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* QuickPick mode */}
                        {selectionMode === "quickpick" && (
                          <div className="px-2.5 pb-2 pt-0 flex items-center gap-1.5 text-[9px] text-gray-400 sm:text-[10px]">
                            <span>🎲 QuickPick</span>
                            {isComplete ? (
                              <span className="text-[#00E676] font-medium">
                                ✅ Ready
                              </span>
                            ) : (
                              <span className="text-[#B45CFF]">
                                ⏳ Generating...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Toggle All Games - Compact */}
                {selectionMode === "pick" && games.length > 1 && (
                  <button
                    onClick={() => setAllGamesExpanded(!allGamesExpanded)}
                    className="mt-2 w-full rounded-lg bg-[#1C0F2B] py-1.5 text-[10px] font-medium text-gray-300 hover:bg-[#2a1b3d] transition-colors sm:text-xs"
                  >
                    {allGamesExpanded
                      ? "🔼 Collapse All"
                      : "🔽 Expand All Games"}
                  </button>
                )}
              </>
            )}
          </section>
        )}

        {/* SUMMARY - Compact */}
        {selectedCount &&
          games.length > 0 &&
          allGamesFilled &&
          activeCountryName && (
            <section className="mt-2 overflow-hidden rounded-xl border border-[#B45CFF]/40 bg-[#12061C] text-white shadow-[0_8px_25px_rgba(0,0,0,0.45)] sm:rounded-2xl">
              {/* Header - Compact */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#1C0F2B] via-[#7418F5]/35 to-[#12061C] px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="pointer-events-none absolute -top-16 left-1/4 h-24 w-1/2 rounded-full bg-white/30 blur-3xl" />
                <div className="relative flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#B45CFF]/30 bg-[#B45CFF]/10 shadow-inner">
                      <span className="text-[10px]">✦</span>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black tracking-wide text-white sm:text-xs">
                        SELECTION SUMMARY
                      </h3>
                      <p className="mt-0.5 text-[8px] font-semibold text-[#C77AFF] sm:text-[9px]">
                        Review your games
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#B45CFF]/30 bg-white/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#C77AFF] shadow-sm backdrop-blur-sm sm:text-[9px]">
                    {selectionMode === "quickpick" ? "QuickPick" : "Manual"}
                  </span>
                </div>

                {/* Stats - Compact */}
                <div className="relative mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="rounded-lg border border-[#B45CFF]/20 bg-white/5 px-2 py-1.5 backdrop-blur-sm">
                    <span className="block text-[7px] font-bold uppercase tracking-wider text-gray-400 sm:text-[8px]">
                      Games
                    </span>
                    <strong className="text-sm font-black text-white sm:text-base">
                      {games.length}
                    </strong>
                  </div>
                  <div className="rounded-lg border border-[#B45CFF]/20 bg-white/5 px-2 py-1.5 backdrop-blur-sm">
                    <span className="block text-[7px] font-bold uppercase tracking-wider text-gray-400 sm:text-[8px]">
                      Complete
                    </span>
                    <strong className="text-sm font-black text-[#00E676] sm:text-base">
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
                      <span className="text-[9px] font-bold text-gray-400">
                        /{games.length}
                      </span>
                    </strong>
                  </div>
                  <div className="rounded-lg border border-[#B45CFF]/20 bg-white/5 px-2 py-1.5 backdrop-blur-sm">
                    <span className="block text-[7px] font-bold uppercase tracking-wider text-gray-400 sm:text-[8px]">
                      Status
                    </span>
                    <strong className="text-[10px] font-black text-[#00E676] sm:text-xs">
                      {allGamesFilled ? "READY" : "INCOMPLETE"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Games List - Compact with max height */}
              <div className="border-b border-[#2a1b3d] bg-[#0B0410] p-2 sm:p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-wider text-gray-200 sm:text-[10px]">
                      Selected Games
                    </h4>
                    <p className="mt-0.5 text-[8px] font-medium text-gray-400 sm:text-[9px]">
                      {games.length} game{games.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    <span className="text-[8px] font-bold text-gray-400 sm:text-[9px]">
                      Completed
                    </span>
                  </div>
                </div>

                {/* Scrollable games grid - Compact */}
                <div className="max-h-[200px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-[#7418F5] scrollbar-track-[#1C0F2B] sm:max-h-[300px]">
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-3">
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
                          className={`group relative overflow-hidden rounded-lg border bg-[#12061C] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(180,92,255,0.12)] sm:p-2.5 ${
                            isComplete
                              ? "border-[#d1a63f]/60"
                              : "border-[#2a1b3d]"
                          }`}
                        >
                          {/* Accent bar */}
                          <div
                            className={`absolute left-0 top-0 h-full w-0.5 ${
                              isComplete
                                ? "bg-[linear-gradient(180deg,#fff2a8,#d4a72c,#8c6114)]"
                                : "bg-[#1C0F2B]"
                            }`}
                          />

                          <div className="flex items-center justify-between pl-1">
                            <span className="text-[8px] font-black uppercase tracking-wide text-gray-300 sm:text-[9px]">
                              Game #{idx + 1}
                            </span>
                            {isComplete ? (
                              <span className="rounded-full bg-[#00E676]/10 px-1.5 py-0.5 text-[7px] font-black text-[#00E676] sm:text-[8px]">
                                ✓ READY
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#B45CFF]/10 px-1.5 py-0.5 text-[7px] font-black text-[#B45CFF] sm:text-[8px]">
                                PENDING
                              </span>
                            )}
                          </div>

                          {/* Numbers - Compact */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-0.5 pl-1 sm:gap-1">
                            {nums.length > 0 ? (
                              nums.map((n, i) => (
                                <span
                                  key={i}
                                  className="flex h-5 min-w-5 items-center justify-center rounded-full border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] px-0.5 text-[8px] font-black text-white shadow-[0_0_5px_rgba(180,92,255,0.35)] sm:h-6 sm:min-w-6 sm:text-[9px]"
                                >
                                  {n}
                                </span>
                              ))
                            ) : (
                              <span className="text-[8px] italic text-gray-400">
                                Not selected
                              </span>
                            )}

                            {pb && (
                              <>
                                <span className="mx-0.5 text-[8px] font-black text-gray-300 sm:text-[9px]">
                                  +
                                </span>
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#C77AFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] px-0.5 text-[8px] font-black text-white shadow-[0_0_5px_rgba(180,92,255,0.35)] sm:h-6 sm:min-w-6 sm:text-[9px]">
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

                {/* Scroll hint */}
                {games.length > 8 && (
                  <div className="mt-1.5 text-center">
                    <span className="text-[8px] font-semibold text-gray-400 sm:text-[9px]">
                      ↕ Scroll to view all {games.length} games
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Info - Compact */}
              <div className="bg-[#0B0410] p-2 sm:p-3">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    ["Game Type", selectedGameTypeTitle || "POWERBALL"],
                    ["Package", `POWER PACK (${selectedCount.totalGames})`],
                    ["Total Games", `${selectedCount.totalGames}`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-[#2a1b3d] bg-[#1C0F2B] px-2 py-1.5"
                    >
                      <small className="block text-[7px] font-black uppercase tracking-wider text-[#B45CFF] sm:text-[8px]">
                        {label}
                      </small>
                      <strong className="mt-0.5 block truncate text-[9px] font-black text-white sm:text-[10px]">
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

        {/* PLAY NOW - Compact */}
        {selectedCount &&
          allGamesFilled &&
          selectionMode !== null &&
          games.length > 0 &&
          activeCountryName && (
            <>
              <button
                onClick={handleAddToCart}
                disabled={entryLoading}
                className="group relative mt-2 flex h-[52px] w-full items-center justify-center overflow-hidden rounded-xl border border-[#C77AFF] bg-gradient-to-r from-[#B45CFF] via-[#7418F5] to-[#3A00C9] text-base font-black tracking-wide text-white shadow-[0_0_10px_rgba(180,92,255,0.45),0_6px_20px_rgba(0,0,0,0.35)] transition hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] disabled:opacity-70 sm:h-[70px] sm:rounded-2xl sm:text-2xl"
              >
                {entryLoading ? (
                  "PROCESSING…"
                ) : (
                  <>
                    <span className="mr-3 opacity-70">»</span> PLAY NOW{" "}
                    <span className="ml-3 opacity-70">«</span>
                  </>
                )}
              </button>

              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2.5">
                {[
                  [Calendar, "DRAW TIME", "Today", "10:30 PM"],
                  [BarChart3, "ODDS", "1 in 292M", "Win Probability"],
                  [ShieldCheck, "SECURE PLAY", "100% Safe", "Secure & Fair"],
                  [Trophy, "JACKPOT", "Est. Jackpot"],
                ].map(([Icon, label, value, sub]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[#2a1b3d] bg-white p-2 shadow-sm sm:rounded-xl sm:p-2.5"
                  >
                    <Icon
                      size={16}
                      className="mb-0.5 text-[#B45CFF] sm:mb-1 sm:size={18}"
                    />
                    <small className="block text-[7px] font-bold text-gray-400 sm:text-[8px]">
                      {label}
                    </small>
                    <strong className="block text-[10px] sm:text-xs">
                      {value}
                    </strong>
                    <span className="text-[7px] text-gray-400 sm:text-[8px]">
                      {sub}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
      </main>

      {/* FIXED BOTTOM NAV - Compact */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-[60px] max-w-[860px] items-center justify-around rounded-t-2xl border border-[#2a1b3d] bg-[#12061C]/95 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur sm:h-[72px] sm:rounded-t-[22px]">
        <button className="flex flex-col items-center gap-0.5 text-[#B45CFF] sm:gap-1">
          <Home size={18} className="sm:size={22}" />
          <span className="text-[9px] font-bold sm:text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-gray-400 sm:gap-1">
          <BarChart3 size={18} className="sm:size={22}" />
          <span className="text-[9px] font-bold sm:text-xs">Activity</span>
        </button>
        <button className="-mt-6 flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 border-[#12061C] bg-gradient-to-br from-[#B45CFF] to-[#7418F5] text-white shadow-[0_0_18px_rgba(180,92,255,0.45)] sm:-mt-8 sm:h-14 sm:w-14 sm:border-4">
          <Gift size={18} className="sm:size={22}" />
          <span className="text-[7px] font-black sm:text-[8px]">PROMO</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-gray-400 sm:gap-1">
          <WalletCards size={18} className="sm:size={22}" />
          <span className="text-[9px] font-bold sm:text-xs">Wallet</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-gray-400 sm:gap-1">
          <UserCircle size={18} className="sm:size={22}" />
          <span className="text-[9px] font-bold sm:text-xs">Account</span>
        </button>
      </nav>
    </div>
  );
};

export default GameSelection;
