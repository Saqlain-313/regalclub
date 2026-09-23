// GameSelectionIndia.jsx - Country-specific Redux (India)

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Crown,
  Diamond,
  Gift,
  Grid3x3,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  ShoppingCart,
  Shuffle,
  Sparkles,
  Star,
  Ticket,
  Users,
  X,
  Zap,
  Globe,
} from "lucide-react";
import { getGameCounts } from "../../redux/slices/india/gameCountSlice";
import {
  createGameEntry,
  resetGameEntryState,
} from "../../redux/slices/india/gameEntrySlice";
import { getUserTicketTypes } from "../../redux/slices/ticketTypeSlice";

// Countries data
const countries = [
  { name: "India", flag: "https://flagcdn.com/w80/in.png", code: "IN" },
  { name: "Australia", flag: "https://flagcdn.com/w80/au.png", code: "AU" },
  { name: "Canada", flag: "https://flagcdn.com/w80/ca.png", code: "CA" },
  { name: "Pakistan", flag: "https://flagcdn.com/w80/pk.png", code: "PK" },
  { name: "Bangladesh", flag: "https://flagcdn.com/w80/bd.png", code: "BD" },
  { name: "Nepal", flag: "https://flagcdn.com/w80/np.png", code: "NP" },
  { name: "Dubai", flag: "https://flagcdn.com/w80/ae.png", code: "UAE" },
];

// ===== CUSTOM MODAL COMPONENT =====
const CustomModal = ({ isOpen, onClose, type, title, message, details }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const icon = isSuccess ? '✅' : '❌';
  const bgGradient = isSuccess 
    ? 'from-green-500 to-emerald-500' 
    : 'from-red-500 to-rose-500';
  const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
  const iconBg = isSuccess ? 'bg-green-100' : 'bg-red-100';

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-md mx-4 transform-gpu animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${borderColor}`}>
            <div className={`bg-gradient-to-r ${bgGradient} p-6 text-center relative`}>
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              </div>
              <div className="relative z-10">
                <div className={`w-20 h-20 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-3 shadow-xl transform-gpu animate-bounce-slow`}>
                  <span className="text-4xl">{icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                  {title}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 text-center text-lg font-medium">
                {message}
              </p>
              
              {details && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 font-mono break-all">
                    {details}
                  </p>
                </div>
              )}

              <button
                onClick={onClose}
                className={`mt-6 w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 transform-gpu hover:scale-105 hover:shadow-xl ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
              >
                {isSuccess ? '🎉 Great!' : 'Got it'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.8) translateY(20px) rotateX(10deg);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

// ===== TICKET INFO TOOLTIP =====
const TicketInfoTooltip = ({ ticket }) => {
  if (!ticket) return null;

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-xs rounded-xl p-4 shadow-2xl z-50 border border-gray-700">
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
      <div className="space-y-1.5">
        <p className="flex justify-between">
          <span className="text-gray-400">ID:</span>
          <span className="font-mono text-[10px]">{ticket._id}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">Title:</span>
          <span className="font-semibold">{ticket.title}</span>
        </p>
        {ticket.subTitle && (
          <p className="flex justify-between">
            <span className="text-gray-400">Subtitle:</span>
            <span>{ticket.subTitle}</span>
          </p>
        )}
        <p className="flex justify-between">
          <span className="text-gray-400">Order:</span>
          <span>{ticket.order}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span>{ticket.isActive ? "🟢 Active" : "🔴 Inactive"}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">Game Types:</span>
          <span>{ticket.gameTypes?.length || 0}</span>
        </p>
        {ticket.gameTypes && ticket.gameTypes.length > 0 && (
          <div className="mt-1 pt-1 border-t border-gray-700">
            <p className="text-gray-400 text-[10px] mb-0.5">Game Types:</p>
            {ticket.gameTypes.map((gt, idx) => (
              <div key={gt._id} className="flex justify-between text-[10px]">
                <span>{gt.title}</span>
                <span className="text-gray-500">
                  {gt.isActive ? "✅" : "❌"} Order: {gt.order}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="flex justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-700">
          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
        </p>
      </div>
    </div>
  );
};

const GameSelection = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const urlCountry = searchParams.get('country');

  const { ticketTypes = [], loading: ticketLoading } = useSelector(
    (state) => state.ticketType,
  );

  const { gameCounts = [], loading: gameCountLoading } = useSelector(
    (state) => state.indiaGameCount,
  );

  const {
    loading: entryLoading,
    success: entrySuccess,
    error: entryError,
    message: entryMessage,
  } = useSelector((state) => state.indiaGameEntry);

  const { user } = useSelector((state) => state.auth || {});
  const userCountry = user?.country || null;
  
  const activeCountryName = urlCountry || "India";
  
  const getCountryCodeFromName = (countryName) => {
    if (!countryName) return null;
    const country = countries.find(c => 
      c.name.toLowerCase() === countryName.toLowerCase()
    );
    return country?.code || null;
  };

  const getCountryObject = (countryName) => {
    if (!countryName) return null;
    return countries.find(c => 
      c.name.toLowerCase() === countryName.toLowerCase()
    );
  };

  const activeCountryCode = useMemo(() => {
    return getCountryCodeFromName(activeCountryName);
  }, [activeCountryName]);

  const activeCountryObject = useMemo(() => {
    return getCountryObject(activeCountryName);
  }, [activeCountryName]);

  // State declarations
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
    type: 'success',
    title: '',
    message: '',
    details: null
  });

  // ========== MEMOIZED VALUES ==========

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
    const result = gameCounts.filter((item) => {
      const ticketId = item.ticketType?._id || item.ticketType;
      if (ticketId !== activeTicket) return false;
      if (!selectedGameType || selectedGameType === "default") return true;
      const gameTypeId = item.gameType?._id || item.gameType;
      return gameTypeId === selectedGameType;
    });

    if (result.length === 0 && gameCounts.length > 0) {
      const anyForTicket = gameCounts.filter(
        (item) => (item.ticketType?._id || item.ticketType) === activeTicket,
      );
      if (anyForTicket.length > 0) {
        return anyForTicket;
      }
    }
    return result;
  }, [gameCounts, activeTicket, selectedGameType]);

  const selectedCount = useMemo(() => {
    if (selectedGameCount) {
      return filteredGameCounts.find((x) => x._id === selectedGameCount);
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

  const selectedGameTypeOrder = useMemo(() => {
    const gameType = availableGameTypes.find((g) => g.id === selectedGameType);
    return gameType?.order;
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

  const isCountryValid = useMemo(() => {
    if (!activeCountryName) {
      setCountryError("Please set your country to play.");
      return false;
    }
    const countryObj = getCountryObject(activeCountryName);
    if (!countryObj) {
      setCountryError(`Country "${activeCountryName}" not found in our supported countries.`);
      return false;
    }
    setCountryError(null);
    return true;
  }, [activeCountryName]);

  // ========== EFFECTS ==========

  // Debug: Log full ticket data
  useEffect(() => {
    if (ticketTypes.length > 0) {
      console.log("📦 Full Ticket Types:", JSON.stringify(ticketTypes, null, 2));
      ticketTypes.forEach((ticket) => {
        console.log(`🎫 Ticket: ${ticket.title}`, {
          id: ticket._id,
          order: ticket.order,
          isActive: ticket.isActive,
          gameTypes: ticket.gameTypes?.map((gt) => ({
            id: gt._id,
            title: gt.title,
            order: gt.order,
            isActive: gt.isActive,
            description: gt.description,
          })),
        });
      });
    }
  }, [ticketTypes]);

  // Debug: Log game counts
  useEffect(() => {
    if (gameCounts.length > 0) {
      console.log("📊 Full Game Counts:", JSON.stringify(gameCounts, null, 2));
    }
  }, [gameCounts]);

  useEffect(() => {
    dispatch(getUserTicketTypes());
    dispatch(getGameCounts());
  }, [dispatch]);

  useEffect(() => {
    if (ticketTypes.length > 0 && !activeTicket) {
      if (urlCountry) {
        const matchingTicket = ticketTypes.find(ticket => 
          ticket.title?.toLowerCase().includes(urlCountry.toLowerCase())
        );
        if (matchingTicket) {
          setActiveTicket(matchingTicket._id);
        } else {
          setActiveTicket(ticketTypes[0]._id);
        }
      } else {
        setActiveTicket(ticketTypes[0]._id);
      }
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
        type: 'success',
        title: '🎉 Entry Created Successfully!',
        message: entryMessage || 'Your game entry has been added to cart successfully.',
        details: `Ticket: ${activeTicketTitle} (ID: ${selectedTicket?._id?.slice(-6) || 'N/A'}) | Order: ${selectedTicket?.order || 0} | ${selectedCount?.totalGames || 0} Games | ${selectionMode === 'quickpick' ? 'QuickPick' : 'Pick Your Numbers'} | Country: ${activeCountryName} (${activeCountryCode || 'N/A'})`
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
      const errorMessage = typeof entryError === 'string' 
        ? entryError 
        : entryError?.message || 'Something went wrong. Please try again.';
      
      const isCountryError = errorMessage.toLowerCase().includes('country');
      
      setModal({
        isOpen: true,
        type: 'error',
        title: isCountryError ? '🌍 Country Error' : '❌ Error Occurred',
        message: errorMessage,
        details: isCountryError ? `Active Country: ${activeCountryName || 'Not Set'} (${activeCountryCode || 'N/A'})` : null
      });
    }
  }, [entryError, activeCountryName, activeCountryCode]);

  useEffect(() => {
    if (activeTicket && availableGameTypes.length > 0 && !selectedGameType) {
      setSelectedGameType(availableGameTypes[0].id);
    }
  }, [activeTicket, availableGameTypes, selectedGameType]);

  useEffect(() => {
    if (selectedGameType && filteredGameCounts.length > 0 && !selectedGameCount) {
      setSelectedGameCount(filteredGameCounts[0]._id);
    }
  }, [selectedGameType, filteredGameCounts, selectedGameCount]);

  // ========== MODAL FUNCTIONS ==========
  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
    setShowSuccess(false);
    dispatch(resetGameEntryState());
  };

  // ========== UTILITY FUNCTIONS ==========

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

  // ========== GAME FUNCTIONS ==========

  const toggleNumber = (gameIndex, num) => {
    if (selectionMode !== "pick") return;

    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];
      const currentNumbers = game.selectedNumbers || [];

      if (currentNumbers.includes(num)) {
        game.selectedNumbers = currentNumbers.filter((n) => n !== num);
      } else {
        if (currentNumbers.length >= 7) {
          setModal({
            isOpen: true,
            type: 'error',
            title: '⚠️ Maximum Numbers Reached',
            message: 'You can select maximum 7 numbers per game.',
            details: null
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

      if (game.selectedPowerball === num) {
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

      if (selectionMode === "pick") {
        const numbers = generateRandomGameNumbers();
        game.selectedNumbers = numbers;
        game.selectedPowerball = generateRandomPowerball();
      } else {
        const numbers = generateRandomGameNumbers();
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

  // ========== HANDLE ADD TO CART ==========

  const handleAddToCart = async () => {
    if (!activeCountryName) {
      setModal({
        isOpen: true,
        type: 'error',
        title: '🌍 Country Not Set',
        message: 'Please set your country before playing. Update your profile to continue.',
        details: 'Go to Profile → Edit Profile → Select Country'
      });
      return;
    }

    const countryObj = getCountryObject(activeCountryName);
    if (!countryObj) {
      setModal({
        isOpen: true,
        type: 'error',
        title: '🌍 Unsupported Country',
        message: `"${activeCountryName}" is not a supported country. Please select a valid country.`,
        details: `Supported countries: ${countries.map(c => c.name).join(', ')}`
      });
      return;
    }

    const countryCode = countryObj.code;

    if (!selectionMode) {
      setModal({
        isOpen: true,
        type: 'error',
        title: '⚠️ Selection Mode Required',
        message: 'Please select either "Pick Your Numbers" or "QuickPick" mode.',
        details: null
      });
      return;
    }

    if (games.length === 0) {
      setModal({
        isOpen: true,
        type: 'error',
        title: '⚠️ No Games',
        message: 'No games to add. Please select a game mode first.',
        details: null
      });
      return;
    }

    if (!allGamesFilled) {
      const incompleteGames = games.filter(g => {
        if (selectionMode === "quickpick") {
          return !(g.numbers?.length === 7 && g.powerball);
        }
        return !(g.selectedNumbers?.length === 7 && g.selectedPowerball);
      });
      
      setModal({
        isOpen: true,
        type: 'error',
        title: '⚠️ Incomplete Games',
        message: `Please fill all ${games.length} games with 7 numbers and a Powerball before adding to cart. ${incompleteGames.length} game(s) incomplete.`,
        details: null
      });
      return;
    }

    if (!selectedCount || !selectedCount._id) {
      setModal({
        isOpen: true,
        type: 'error',
        title: '⚠️ No Package Selected',
        message: 'Please select a game package.',
        details: null
      });
      return;
    }

    if (!activeTicket) {
      setModal({
        isOpen: true,
        type: 'error',
        title: '⚠️ No Ticket Selected',
        message: 'Please select a ticket type.',
        details: null
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
        type: 'error',
        title: '⚠️ Invalid Game Data',
        message: 'All games must have 7 numbers and a Powerball.',
        details: null
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
      countryFlag: countryObj.flag
    };

    try {
      await dispatch(createGameEntry(payload)).unwrap();
      setGames([]);
      setIsInitialized(false);
      setSelectionMode(null);
      setAllGamesExpanded(false);
    } catch (error) {
      console.error("Failed to create entry:", error);
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to create game entry. Please try again.';
      
      setModal({
        isOpen: true,
        type: 'error',
        title: '❌ Submission Failed',
        message: errorMessage,
        details: null
      });
    }
  };

  // ========== UI HELPERS ==========

  const getTicketIcon = (title) => {
    const lower = title?.toLowerCase() || "";
    if (lower.includes("platinum") || lower.includes("premium")) return Crown;
    if (lower.includes("vip")) return Diamond;
    if (lower.includes("powerhit")) return Zap;
    if (lower.includes("system")) return Gift;
    if (lower.includes("syndicate")) return Users;
    return Sparkles;
  };

  // ========== RENDER ==========

  if (ticketLoading || gameCountLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 p-1 mx-auto mb-4">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        details={modal.details}
      />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 text-white text-sm font-medium mb-3">
                <Star size={14} /> Premium Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Welcome back, <span className="text-yellow-200">Player</span>
              </h1>
              <p className="text-amber-100 text-sm mt-1">
                Select your ticket and start playing
              </p>
              {urlCountry && (
                <p className="text-white/80 text-sm mt-2 flex items-center gap-2">
                  <Globe size={16} /> Playing: <span className="font-bold uppercase">{urlCountry}</span>
                  {activeCountryObject && (
                    <img 
                      src={activeCountryObject.flag} 
                      alt={activeCountryObject.name}
                      className="w-6 h-4 rounded-sm shadow-lg ml-1"
                    />
                  )}
                  {activeCountryCode && (
                    <span className="text-yellow-200 text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full ml-1">
                      {activeCountryCode}
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/30 shadow-xl shadow-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center shadow-inner">
                  {activeCountryObject ? (
                    <img 
                      src={activeCountryObject.flag} 
                      alt={activeCountryObject.name}
                      className="w-8 h-6 rounded-sm shadow-lg"
                    />
                  ) : (
                    <Globe size={20} className="text-white" />
                  )}
                </div>
                <div>
                  <p className="text-white/80 text-xs font-medium">
                    {urlCountry ? 'Selected Country' : 'Playing from'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                      {activeCountryObject?.name || activeCountryName || "Not Set"}
                    </span>
                    {activeCountryCode && (
                      <span className="text-white/90 text-xs font-mono bg-white/30 px-2 py-0.5 rounded-full">
                        {activeCountryCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in">
          <div className="bg-white rounded-xl shadow-2xl border border-green-100 p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">Success!</p>
              <p className="text-gray-600 text-sm">
                {entryMessage || "Game entry created successfully"}
              </p>
            </div>
            <button
              onClick={() => {
                setShowSuccess(false);
                dispatch(resetGameEntryState());
              }}
              className="flex-shrink-0 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {!activeCountryName && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-300 rounded-2xl p-5 flex items-start gap-4 shadow-xl shadow-red-100">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-red-700 text-lg">Country Not Set!</h4>
              <p className="text-red-600 text-sm mt-1">
                Please update your profile with your country to play games. 
                This is required for currency conversion and game eligibility.
              </p>
              <button 
                onClick={() => window.location.href = '/profile'}
                className="mt-3 bg-red-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-200 hover:scale-105 flex items-center gap-2"
              >
                Update Profile <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* STEP 1: SELECT TICKET TYPE */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-amber-200">
              1
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">
                Select Ticket Type
              </h3>
              <p className="text-gray-500 text-sm">
                Choose your preferred ticket
              </p>
            </div>
          </div>

          {ticketTypes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-500">
              No ticket types available
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {ticketTypes.map((ticket) => {
                const isActive = activeTicket === ticket._id;
                const TicketIcon = getTicketIcon(ticket.title || ticket.name);
                const isMatchingCountry = urlCountry && ticket.title?.toLowerCase().includes(urlCountry.toLowerCase());

                return (
                  <button
                    key={ticket._id}
                    onClick={() => setActiveTicket(ticket._id)}
                    onMouseEnter={() => setHoveredTicket(ticket._id)}
                    onMouseLeave={() => setHoveredTicket(null)}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                      isActive
                        ? `border-amber-400 bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-amber-200`
                        : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg hover:-translate-y-1"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        Selected
                      </div>
                    )}
                    {isMatchingCountry && !isActive && (
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-2xl shadow-green-300">
                        Recommended
                      </div>
                    )}

                    {/* Tooltip */}
                    {hoveredTicket === ticket._id && (
                      <TicketInfoTooltip ticket={ticket} />
                    )}

                    <div className="flex flex-col items-center text-center gap-2 relative z-10">
                      <div className={`p-3 rounded-xl ${isActive ? 'bg-amber-100 shadow-lg shadow-amber-200' : 'bg-gray-100 group-hover:bg-amber-50'} transition-all duration-300`}>
                        <TicketIcon size={22} className={isActive ? "text-amber-600" : "text-gray-500"} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm capitalize transition-colors ${isActive ? 'text-amber-700' : 'text-gray-800 group-hover:text-amber-600'}`}>
                          {ticket.title || ticket.name}
                        </h4>
                        {ticket.subTitle && (
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                            {ticket.subTitle}
                          </p>
                        )}
                        {/* Show order and active status */}
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <span className="text-[8px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            Order: {ticket.order}
                          </span>
                          <span className="text-[8px]">
                            {ticket.isActive ? "🟢" : "🔴"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <div className="mt-2 h-0.5 w-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 2: SELECT GAME TYPE */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-amber-200">
              2
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">
                Select Game Type
              </h3>
              <p className="text-gray-500 text-sm">Choose your game type</p>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedGameType || ""}
              onChange={(e) => {
                setSelectedGameType(e.target.value || null);
                setSelectedGameCount(null);
                setGames([]);
                setExpandedGame(null);
                setIsInitialized(false);
                setSelectionMode(null);
                setAllGamesExpanded(false);
              }}
              disabled={!activeTicket || availableGameTypes.length === 0}
              className="w-full bg-white border-2 border-gray-200 rounded-xl h-12 px-4 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <option value="">
                {!activeCountryName 
                  ? "⚠️ Please set your country first" 
                  : availableGameTypes.length === 0 
                    ? "No game types available for this ticket" 
                    : "Select Game Type"}
              </option>
              {availableGameTypes.map((gameType) => (
                <option key={gameType.id} value={gameType.id}>
                  {gameType.title}
                  {gameType.description && ` - ${gameType.description}`}
                  {gameType.order !== undefined && ` (Order: ${gameType.order})`}
                  {gameType.isActive !== undefined && gameType.isActive && " ✅"}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
          {!activeCountryName && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle size={14} /> Please update your profile with your country to select game types
            </p>
          )}
        </div>

        {/* STEP 3: SELECT GAME PACKAGE */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-amber-200">
              3
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">
                Select Game Package
              </h3>
              <p className="text-gray-500 text-sm">Choose your game package</p>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedGameCount || ""}
              onChange={(e) => {
                setSelectedGameCount(e.target.value || null);
                setGames([]);
                setExpandedGame(null);
                setIsInitialized(false);
                setSelectionMode(null);
                setAllGamesExpanded(false);
              }}
              disabled={!selectedGameType || filteredGameCounts.length === 0}
              className="w-full bg-white border-2 border-gray-200 rounded-xl h-12 px-4 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <option value="">
                {!activeCountryName 
                  ? "⚠️ Please set your country first" 
                  : filteredGameCounts.length === 0 
                    ? "No game packages available" 
                    : "Select Game Package"}
              </option>
              {filteredGameCounts.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.totalGames} Games - ₹{item.price}
                  {item.label && ` (${item.label})`}
                  {item.discount && ` - ${item.discount}% off`}
                  {item.isActive !== undefined && !item.isActive && " (Inactive)"}
                  {item.ticketType?._id && ` | Ticket: ${item.ticketType.title || item.ticketType}`}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* STEP 4: SELECT NUMBERS */}
        {activeTicket && activeCountryName && (
          <div className="mt-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white flex items-center justify-center font-bold text-xl shadow-2xl shadow-amber-200">
                4
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">
                  Select Numbers
                </h3>
                <p className="text-gray-500 text-sm">
                  Choose 7 numbers + 1 Powerball for{" "}
                  {selectedCount?.totalGames || 6} games
                </p>
                {activeCountryName && activeCountryObject && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-2">
                    <img 
                      src={activeCountryObject.flag} 
                      alt={activeCountryObject.name}
                      className="w-5 h-3 rounded-sm shadow-md"
                    />
                    <CheckCircle size={14} /> Playing from: {activeCountryObject.name}
                    <span className="text-amber-600 font-mono bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">
                      {activeCountryCode}
                    </span>
                    {urlCountry && <span className="text-amber-600"> (via URL)</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Selection Mode Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  setSelectionMode("pick");
                  setExpandedGame(null);
                  initializeGames("pick");
                }}
                disabled={!selectedCount}
                className={`group p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                  !selectedCount ? 'opacity-50 cursor-not-allowed' :
                  selectionMode === "pick"
                    ? "border-amber-400 bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-amber-100"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectionMode === "pick"
                        ? "bg-amber-100"
                        : "bg-gray-100 group-hover:bg-amber-50"
                    } transition-colors duration-300`}
                  >
                    <Grid3x3
                      size={22}
                      className={
                        selectionMode === "pick"
                          ? "text-amber-600"
                          : "text-gray-500"
                      }
                    />
                  </div>
                  <div>
                    <span
                      className={`font-semibold block text-base ${
                        selectionMode === "pick"
                          ? "text-amber-700"
                          : "text-gray-700 group-hover:text-amber-600"
                      }`}
                    >
                      Pick Your Numbers
                    </span>
                    <span className="text-xs text-gray-500">
                      Choose your favourite numbers manually
                    </span>
                  </div>
                </div>
                {selectionMode === "pick" && (
                  <div className="mt-2 h-0.5 w-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
                )}
                {!selectedCount && (
                  <p className="text-xs text-red-500 mt-2">Select a game package first</p>
                )}
              </button>

              <button
                onClick={() => {
                  setSelectionMode("quickpick");
                  setExpandedGame(null);
                  initializeGames("quickpick");
                }}
                disabled={!selectedCount}
                className={`group p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                  !selectedCount ? 'opacity-50 cursor-not-allowed' :
                  selectionMode === "quickpick"
                    ? "border-amber-400 bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-amber-100"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectionMode === "quickpick"
                        ? "bg-amber-100"
                        : "bg-gray-100 group-hover:bg-amber-50"
                    } transition-colors duration-300`}
                  >
                    <RefreshCw
                      size={22}
                      className={
                        selectionMode === "quickpick"
                          ? "text-amber-600"
                          : "text-gray-500"
                      }
                    />
                  </div>
                  <div>
                    <span
                      className={`font-semibold block text-base ${
                        selectionMode === "quickpick"
                          ? "text-amber-700"
                          : "text-gray-700 group-hover:text-amber-600"
                      }`}
                    >
                      QuickPick
                    </span>
                    <span className="text-xs text-gray-500">
                      Numbers are generated randomly
                    </span>
                  </div>
                </div>
                {selectionMode === "quickpick" && (
                  <div className="mt-2 h-0.5 w-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
                )}
                {!selectedCount && (
                  <p className="text-xs text-red-500 mt-2">Select a game package first</p>
                )}
              </button>
            </div>

            {/* Games Grid */}
            {selectionMode !== null && (
              <>
                <div className="space-y-4">
                  {games.length > 0 ? (
                    games.map((game, gameIndex) => {
                      const isComplete =
                        selectionMode === "quickpick"
                          ? game.numbers?.length === 7 && game.powerball
                          : game.selectedNumbers?.length === 7 &&
                            game.selectedPowerball;

                      const currentNumbers =
                        selectionMode === "quickpick"
                          ? game.numbers || []
                          : game.selectedNumbers || [];
                      const currentPowerball =
                        selectionMode === "quickpick"
                          ? game.powerball
                          : game.selectedPowerball;

                      const isExpanded =
                        allGamesExpanded || expandedGame === gameIndex;

                      return (
                        <div
                          key={game.id}
                          className={`bg-white rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                            isComplete
                              ? "border-green-400 shadow-lg shadow-green-100"
                              : "border-gray-200 hover:border-amber-200 hover:shadow-lg"
                          }`}
                        >
                          {/* Game Header */}
                          <div
                            className="p-4 cursor-pointer hover:bg-amber-50/30 transition-colors duration-200"
                            onClick={() => {
                              if (selectionMode === "pick") {
                                const game = games[gameIndex];
                                if (
                                  !game.selectedNumbers ||
                                  game.selectedNumbers.length === 0
                                ) {
                                  autoFillGame(gameIndex);
                                }
                                toggleExpand(gameIndex);
                              }
                            }}
                          >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
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

                                {currentNumbers.length > 0 ||
                                currentPowerball ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {currentNumbers.map((num, idx) => (
                                      <span
                                        key={idx}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 text-white flex items-center justify-center text-xs font-bold shadow-md"
                                      >
                                        {num}
                                      </span>
                                    ))}
                                    {currentNumbers.length > 0 &&
                                      currentNumbers.length < 7 && (
                                        <span className="text-xs text-gray-400 font-medium">
                                          ({currentNumbers.length}/7)
                                        </span>
                                      )}
                                    {currentPowerball && (
                                      <>
                                        <span className="text-gray-300 font-bold">
                                          |
                                        </span>
                                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-400 text-white flex items-center justify-center text-xs font-bold shadow-md">
                                          {currentPowerball}
                                        </span>
                                      </>
                                    )}
                                    {isComplete && (
                                      <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        Complete
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                    Click to auto-fill
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
                                      <RefreshCw size={12} />
                                      Quick
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        autoFillGame(gameIndex);
                                      }}
                                      className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1 rounded-lg transition-colors duration-200 flex items-center gap-1 font-medium"
                                    >
                                      <Plus size={12} />
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
                                      const numbers =
                                        generateRandomGameNumbers();
                                      setGames((prev) => {
                                        const newGames = [...prev];
                                        const game = newGames[gameIndex];
                                        game.numbers = numbers;
                                        game.powerball =
                                          generateRandomPowerball();
                                        return newGames;
                                      });
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

                          {/* Expanded Content */}
                          {selectionMode === "pick" && isExpanded && (
                            <div className="p-5 border-t border-gray-100 bg-amber-50/20">
                              <div className="mb-5">
                                <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></span>
                                  Select 7 numbers (1-35)
                                </p>
                                <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                                  {Array.from(
                                    { length: 35 },
                                    (_, i) => i + 1,
                                  ).map((num) => {
                                    const isSelected =
                                      currentNumbers.includes(num);

                                    return (
                                      <button
                                        key={num}
                                        onClick={() =>
                                          toggleNumber(gameIndex, num)
                                        }
                                        className={`h-10 rounded-full font-semibold transition-all duration-200 text-sm ${
                                          isSelected
                                            ? "bg-gradient-to-br from-amber-400 to-yellow-400 text-white shadow-md scale-105"
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
                                <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-red-300 rounded-full"></span>
                                  Select Powerball (1-20)
                                </p>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                  {Array.from(
                                    { length: 20 },
                                    (_, i) => i + 1,
                                  ).map((num) => {
                                    const isSelected = currentPowerball === num;

                                    return (
                                      <button
                                        key={num}
                                        onClick={() =>
                                          togglePowerball(gameIndex, num)
                                        }
                                        className={`h-10 rounded-full font-semibold transition-all duration-200 text-sm ${
                                          isSelected
                                            ? "bg-gradient-to-br from-red-500 to-red-400 text-white shadow-md scale-105"
                                            : "bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-400"
                                        }`}
                                      >
                                        {num}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                      <p className="text-gray-500">
                        No games available. Please select a game package first.
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {games.length > 0 && (
                  <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
                    <button
                      onClick={handleReshuffleAll}
                      className="text-amber-600 hover:text-amber-800 font-medium flex items-center gap-2 px-4 py-2 hover:bg-amber-50 rounded-lg transition-all duration-200 border-2 border-amber-100 hover:border-amber-300"
                    >
                      <Shuffle size={16} />
                      Reshuffle All
                    </button>
                    <div className="text-xs text-gray-500 bg-white px-4 py-2 rounded-lg border-2 border-gray-100 shadow-sm flex items-center gap-3">
                      <span>{games.length} games</span>
                      <span className="w-px h-4 bg-gray-200"></span>
                      <span className="capitalize">
                        {selectionMode === "quickpick"
                          ? "QuickPick"
                          : "Pick mode"}
                      </span>
                      <span className="w-px h-4 bg-gray-200"></span>
                      <span className="text-green-600 font-medium">
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
                        /{games.length} complete
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 5: AUTOPLAY */}
        {selectedCount && allGamesFilled && selectionMode !== null && games.length > 0 && activeCountryName && (
          <div className="mt-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white flex items-center justify-center font-bold text-xl shadow-2xl shadow-amber-200">
                5
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-800">
                  Play more than once?
                </h3>
                <p className="text-gray-500">
                  Optional. Play for multiple draws
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 hover:border-amber-200 transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                      autoPlay
                        ? "border-amber-400 bg-amber-50 shadow-md"
                        : "border-gray-200 hover:border-amber-300 hover:bg-gray-50 bg-white"
                    }`}
                  >
                    <Play
                      size={20}
                      className={
                        autoPlay ? "text-amber-600" : "text-gray-500"
                      }
                    />
                    <span
                      className={`font-semibold ${autoPlay ? "text-amber-700" : "text-gray-700"}`}
                    >
                      AutoPlay
                    </span>
                    <span className="text-xs text-gray-500">
                      Cancel anytime
                    </span>
                  </button>
                </div>

                {autoPlay && (
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">
                      Play for multiple draws
                    </label>
                    <div className="flex gap-2">
                      {[2, 5, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setDrawCount(num)}
                          className={`flex-1 p-3 rounded-xl border-2 transition-all duration-300 text-center ${
                            drawCount === num
                              ? "border-amber-400 bg-amber-50 shadow-md"
                              : "border-gray-200 hover:border-amber-300 bg-white hover:shadow-md"
                          }`}
                        >
                          <Calendar
                            size={16}
                            className={`mx-auto mb-1 ${drawCount === num ? "text-amber-600" : "text-gray-500"}`}
                          />
                          <span
                            className={`text-xs font-medium block ${drawCount === num ? "text-amber-700" : "text-gray-700"}`}
                          >
                            {num} draws
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary Card */}
        {selectedCount && allGamesFilled && selectionMode !== null && games.length > 0 && activeCountryName && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 p-6 md:p-8 text-white shadow-2xl shadow-amber-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="w-full">
                <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                  <Ticket size={16} /> Selected Package
                </p>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-4xl md:text-5xl font-bold drop-shadow-2xl">
                    ₹{totalPrice}
                  </span>
                  <span className="text-white/80 text-sm">/ total</span>
                </div>

                {/* Full Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  {/* Ticket Details */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-[10px] text-white/70">Ticket</p>
                    <p className="font-bold text-sm truncate">
                      {activeTicketTitle}
                    </p>
                    {ticketTypes.find((t) => t._id === activeTicket) && (
                      <>
                        <p className="text-[8px] font-mono text-white/50 truncate">
                          ID: {ticketTypes.find((t) => t._id === activeTicket)?._id?.slice(-6) || 'N/A'}
                        </p>
                        <p className="text-[8px] text-white/50">
                          Order: {ticketTypes.find((t) => t._id === activeTicket)?.order || 0}
                          {" "}
                          {ticketTypes.find((t) => t._id === activeTicket)?.isActive ? "🟢" : "🔴"}
                        </p>
                        <p className="text-[8px] text-white/50">
                          Game Types: {ticketTypes.find((t) => t._id === activeTicket)?.gameTypes?.length || 0}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Game Type Details */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-[10px] text-white/70">Game Type</p>
                    <p className="font-bold text-sm truncate">
                      {selectedGameTypeTitle || 'Standard'}
                    </p>
                    {selectedGameTypeOrder !== undefined && (
                      <p className="text-[8px] text-white/50">
                        Order: {selectedGameTypeOrder}
                      </p>
                    )}
                    {availableGameTypes.find((g) => g.id === selectedGameType)?.isActive !== undefined && (
                      <p className="text-[8px] text-white/50">
                        {availableGameTypes.find((g) => g.id === selectedGameType)?.isActive ? "✅ Active" : "❌ Inactive"}
                      </p>
                    )}
                  </div>

                  {/* Game Count Details */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-[10px] text-white/70">Package</p>
                    <p className="font-bold text-sm">{selectedCount.totalGames} Games</p>
                    <p className="text-[8px] text-white/50">
                      ₹{selectedCount.price} 
                      {selectedCount.discount && ` (${selectedCount.discount}% off)`}
                    </p>
                    {selectedCount.label && (
                      <p className="text-[8px] text-white/50">{selectedCount.label}</p>
                    )}
                  </div>

                  {/* Mode Details */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-[10px] text-white/70">Mode</p>
                    <p className="font-bold text-sm capitalize">
                      {selectionMode === 'quickpick' ? 'QuickPick' : 'Manual'}
                    </p>
                    <p className="text-[8px] text-white/50">
                      {games.filter((g) => {
                        if (selectionMode === 'quickpick') {
                          return g.numbers?.length === 7 && g.powerball;
                        }
                        return g.selectedNumbers?.length === 7 && g.selectedPowerball;
                      }).length}/{games.length} Complete
                    </p>
                    {autoPlay && (
                      <p className="text-[8px] text-white/50">
                        {drawCount} draws
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg shadow-black/10">
                    {selectedCount.totalGames} Games
                  </span>
                  {selectedCount.label && (
                    <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg shadow-black/10">
                      {selectedCount.label}
                    </span>
                  )}
                  <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg shadow-black/10">
                    {activeTicketTitle}
                  </span>
                  {selectedGameTypeTitle && (
                    <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg shadow-black/10">
                      {selectedGameTypeTitle}
                    </span>
                  )}
                  <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg shadow-black/10 capitalize">
                    {selectionMode === "quickpick" ? "QuickPick" : "Pick your numbers"}
                  </span>
                  {autoPlay && (
                    <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg shadow-black/10">
                      {drawCount} draws
                    </span>
                  )}
                  <span className="text-xs bg-green-500/40 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg shadow-black/10 flex items-center gap-2">
                    <Globe size={12} />
                    {activeCountryObject?.name || activeCountryName}
                    <img 
                      src={activeCountryObject?.flag} 
                      alt={activeCountryObject?.name}
                      className="w-5 h-3 rounded-sm shadow-md"
                    />
                    <span className="text-yellow-300 text-[10px] font-mono font-bold">
                      {activeCountryCode}
                    </span>
                    {urlCountry && <span className="text-yellow-300 text-[8px]">(URL)</span>}
                  </span>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={entryLoading || !activeCountryName}
                className="group bg-white text-amber-600 px-10 py-4 rounded-xl font-bold hover:scale-110 transition-all duration-500 w-full md:w-auto shadow-2xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {entryLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : !activeCountryName ? (
                  <>
                    <AlertCircle size={20} />
                    Set Country First
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    Add to Cart
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GameSelection;