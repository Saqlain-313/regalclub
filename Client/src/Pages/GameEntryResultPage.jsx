import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleX,
  Clock,
  DollarSign,
  Eye,
  Gamepad2,
  Heart,
  Info,
  Loader2,
  Percent,
  Plus,
  Target,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

// ======================================================
// COUNTRY-SPECIFIC GAME ENTRY SLICES
// ======================================================
import {
  deleteGameEntry as deleteAustraliaGameEntry,
  getMyGameEntries as getAustraliaGameEntries,
  resetGameEntryState as resetAustraliaGameEntryState,
} from "../redux/slices/australia/gameEntrySlice";

import {
  deleteGameEntry as deleteBangladeshGameEntry,
  getMyGameEntries as getBangladeshGameEntries,
  resetGameEntryState as resetBangladeshGameEntryState,
} from "../redux/slices/bangladesh/gameEntrySlice";

import {
  deleteGameEntry as deleteIndiaGameEntry,
  getMyGameEntries as getIndiaGameEntries,
  resetGameEntryState as resetIndiaGameEntryState,
} from "../redux/slices/india/gameEntrySlice";

import {
  deleteGameEntry as deleteNepalGameEntry,
  getMyGameEntries as getNepalGameEntries,
  resetGameEntryState as resetNepalGameEntryState,
} from "../redux/slices/nepal/gameEntrySlice";

import {
  deleteGameEntry as deletePakistanGameEntry,
  getMyGameEntries as getPakistanGameEntries,
  resetGameEntryState as resetPakistanGameEntryState,
} from "../redux/slices/pakistan/gameEntrySlice";

import {
  deleteGameEntry as deleteUaeGameEntry,
  getMyGameEntries as getUaeGameEntries,
  resetGameEntryState as resetUaeGameEntryState,
} from "../redux/slices/uae/gameEntrySlice";

// ======================================================
// CURRENCY CONFIGURATION
// ======================================================

const currencyConfig = {
  IN: { symbol: "₹", code: "INR", locale: "en-IN", name: "Indian Rupee" },
  AU: { symbol: "$", code: "AUD", locale: "en-AU", name: "Australian Dollar" },
  PK: { symbol: "Rs", code: "PKR", locale: "en-PK", name: "Pakistani Rupee" },
  BD: { symbol: "৳", code: "BDT", locale: "en-BD", name: "Bangladeshi Taka" },
  NP: { symbol: "रु", code: "NPR", locale: "ne-NP", name: "Nepalese Rupee" },
  UAE: { symbol: "د.إ", code: "AED", locale: "ar-AE", name: "UAE Dirham" },
};

const getCurrencySymbol = (countryCode) => {
  return currencyConfig[countryCode]?.symbol || "$";
};

const getCurrencyConfig = (countryCode) => {
  return currencyConfig[countryCode] || currencyConfig.IN;
};

// ======================================================
// COUNTRY ALIASES & CONFIG
// ======================================================

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
  "united arab emirates": "uae",
};

const countryConfig = {
  india: {
    stateKey: "indiaGameEntry",
    getGameEntries: getIndiaGameEntries,
    deleteGameEntry: deleteIndiaGameEntry,
    resetState: resetIndiaGameEntryState,
    countryCode: "IN",
    displayName: "India",
  },
  australia: {
    stateKey: "australiaGameEntry",
    getGameEntries: getAustraliaGameEntries,
    deleteGameEntry: deleteAustraliaGameEntry,
    resetState: resetAustraliaGameEntryState,
    countryCode: "AU",
    displayName: "Australia",
  },
  pakistan: {
    stateKey: "pakistanGameEntry",
    getGameEntries: getPakistanGameEntries,
    deleteGameEntry: deletePakistanGameEntry,
    resetState: resetPakistanGameEntryState,
    countryCode: "PK",
    displayName: "Pakistan",
  },
  bangladesh: {
    stateKey: "bangladeshGameEntry",
    getGameEntries: getBangladeshGameEntries,
    deleteGameEntry: deleteBangladeshGameEntry,
    resetState: resetBangladeshGameEntryState,
    countryCode: "BD",
    displayName: "Bangladesh",
  },
  nepal: {
    stateKey: "nepalGameEntry",
    getGameEntries: getNepalGameEntries,
    deleteGameEntry: deleteNepalGameEntry,
    resetState: resetNepalGameEntryState,
    countryCode: "NP",
    displayName: "Nepal",
  },
  uae: {
    stateKey: "uaeGameEntry",
    getGameEntries: getUaeGameEntries,
    deleteGameEntry: deleteUaeGameEntry,
    resetState: resetUaeGameEntryState,
    countryCode: "UAE",
    displayName: "United Arab Emirates",
  },
};

// ======================================================
// COUNTRIES LIST
// ======================================================

const countries = [
  { name: "India", flag: "https://flagcdn.com/w80/in.png", code: "IN" },
  { name: "Australia", flag: "https://flagcdn.com/w80/au.png", code: "AU" },
  { name: "Pakistan", flag: "https://flagcdn.com/w80/pk.png", code: "PK" },
  { name: "Bangladesh", flag: "https://flagcdn.com/w80/bd.png", code: "BD" },
  { name: "Nepal", flag: "https://flagcdn.com/w80/np.png", code: "NP" },
  {
    name: "United Arab Emirates",
    flag: "https://flagcdn.com/w80/ae.png",
    code: "UAE",
  },
];

// ======================================================
// UTILITY FUNCTIONS
// ======================================================

const getCountryCodeFromName = (countryName) => {
  if (!countryName) return null;
  const value = String(countryName).trim().toLowerCase();
  const codeMap = {
    india: "IN",
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
    "united arab emirates": "UAE",
  };
  return codeMap[value] || null;
};

const getCountryObject = (countryName) => {
  const code = getCountryCodeFromName(countryName);
  if (!code) return null;
  return countries.find((c) => c.code === code) || null;
};

// ======================================================
// DELETE CONFIRMATION POPUP
// ======================================================

const DeleteConfirmationPopup = ({ isOpen, onClose, onConfirm, entryId }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1C0F2B] rounded-2xl max-w-sm w-full p-6 border border-[#2a1b3d] shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-red-400 flex justify-center mb-3">
            <Trash2 className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">
            Confirm Delete
          </h3>
          <p className="text-sm text-gray-400 mb-0.5">
            Are you sure you want to delete this entry?
          </p>
          <p className="text-xs text-red-400 font-semibold mb-5">
            This action cannot be undone.
          </p>

          <div className="flex gap-2.5 justify-center">
            <button
              className="px-4 py-2.5 bg-[#12061C] border border-[#2a1b3d] text-gray-300 rounded-xl text-sm font-semibold hover:bg-[#2a1b3d] hover:text-white transition flex items-center gap-1.5"
              onClick={onClose}
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              className="px-4 py-2.5 bg-red-500/90 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition flex items-center gap-1.5"
              onClick={() => onConfirm(entryId)}
            >
              <Trash2 className="w-3.5 h-3.5" /> Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// MAIN PAGE COMPONENT
// ======================================================

const GameEntryResultPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useSelector((state) => state.auth || { user: null });
  const userCountry = user?.country || null;
  const urlCountry = searchParams.get("country");

  const activeCountryName = urlCountry || userCountry;

  const normalizedCountry =
    countryAliases[
      String(activeCountryName || "")
        .trim()
        .toLowerCase()
    ] || "";

  const activeCountryConfig = countryConfig[normalizedCountry] || null;
  const activeCountryCode = getCountryCodeFromName(activeCountryName);
  const activeCountryObject = getCountryObject(activeCountryName);

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  // ======================================================
  // REDUX SELECTORS - Country Specific
  // ======================================================

  const indiaGameEntryState = useSelector((state) => state.indiaGameEntry);
  const australiaGameEntryState = useSelector(
    (state) => state.australiaGameEntry,
  );
  const bangladeshGameEntryState = useSelector(
    (state) => state.bangladeshGameEntry,
  );
  const nepalGameEntryState = useSelector((state) => state.nepalGameEntry);
  const pakistanGameEntryState = useSelector(
    (state) => state.pakistanGameEntry,
  );
  const uaeGameEntryState = useSelector((state) => state.uaeGameEntry);

  const getActiveEntryState = () => {
    if (!activeCountryConfig) return null;
    switch (activeCountryConfig.stateKey) {
      case "indiaGameEntry":
        return indiaGameEntryState;
      case "australiaGameEntry":
        return australiaGameEntryState;
      case "bangladeshGameEntry":
        return bangladeshGameEntryState;
      case "nepalGameEntry":
        return nepalGameEntryState;
      case "pakistanGameEntry":
        return pakistanGameEntryState;
      case "uaeGameEntry":
        return uaeGameEntryState;
      default:
        return null;
    }
  };

  const activeEntryState = getActiveEntryState();
  const entries = activeEntryState?.entries || [];
  const loading = activeEntryState?.loading || false;
  const error = activeEntryState?.error || null;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ======================================================
  // EFFECTS
  // ======================================================

  useEffect(() => {
    if (activeCountryConfig) {
      dispatch(activeCountryConfig.getGameEntries());
    }
    return () => {
      if (activeCountryConfig) {
        dispatch(activeCountryConfig.resetState());
      }
    };
  }, [dispatch, activeCountryConfig]);

  // ======================================================
  // HANDLERS
  // ======================================================

  const handleDelete = async (entryId) => {
    setDeleteId(entryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId && activeCountryConfig) {
      await dispatch(activeCountryConfig.deleteGameEntry(deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      dispatch(activeCountryConfig.getGameEntries());
    }
  };

  const handleViewResults = (entry) => {
    const countryRouteMap = {
      IN: "india",
      AU: "australia",
      PK: "pakistan",
      BD: "bangladesh",
      NP: "nepal",
      UAE: "uae",
    };

    const country =
      countryRouteMap[activeCountryCode] || normalizedCountry || "india";

    navigate(`/${country}/game-entry-result/${entry.poolId}`, {
      state: {
        entry,
        countryCode: activeCountryCode,
        countryName:
          activeCountryObject?.name ||
          activeCountryConfig?.displayName ||
          activeCountryName,
        currencySymbol: getCurrencySymbol(activeCountryCode),
      },
    });
  };

  // ======================================================
  // UI HELPERS
  // ======================================================

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-[#F1C40F]",
      Active: "bg-[#F1C40F]",
      Completed: "bg-[#00E676]",
      Cancelled: "bg-red-500",
      Won: "bg-[#F1C40F]",
      Lost: "bg-red-500",
      Open: "bg-[#F1C40F]",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: Clock,
      Active: Loader2,
      Completed: CheckCircle2,
      Cancelled: CircleX,
      Won: Trophy,
      Lost: Heart,
      Open: Loader2,
    };
    return icons[status] || Info;
  };

  const currencySymbol = getCurrencySymbol(activeCountryCode);
  const currencyConfigObj = getCurrencyConfig(activeCountryCode);

  const formatCurrency = (amount) => {
    return `${currencySymbol}${Number(amount).toFixed(2)}`;
  };

  // ======================================================
  // RENDER ENTRIES
  // ======================================================

  const renderEntriesList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-[#2a1b3d] border-t-[#B45CFF] mx-auto"></div>
            </div>
            <p className="text-sm text-gray-400 mt-4 font-medium">
              Loading your entries for {activeCountryObject?.name || "..."}...
            </p>
          </div>
        </div>
      );
    }

    if (!activeCountryName) {
      return (
        <div className="text-center py-14 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <div className="text-[#B45CFF] flex justify-center mb-3">
            <AlertCircle className="w-12 h-12" />
          </div>
          <p className="text-sm text-gray-300 font-medium">
            Please select a country to view your game entries
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Use the URL parameter ?country=INDIA or update your profile
          </p>
        </div>
      );
    }

    if (!activeCountryConfig) {
      return (
        <div className="text-center py-14 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <div className="text-red-400 flex justify-center mb-3">
            <AlertCircle className="w-12 h-12" />
          </div>
          <p className="text-sm text-gray-300 font-medium">
            Unsupported Country: {activeCountryName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported countries: India, Australia, Pakistan, Bangladesh, Nepal,
            UAE
          </p>
        </div>
      );
    }

    if (!entries || entries.length === 0) {
      return (
        <div className="text-center py-14 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <div className="text-gray-600 flex justify-center mb-3">
            <Gamepad2 className="w-12 h-12" />
          </div>
          <p className="text-sm text-gray-400 font-medium">
            No game entries found for{" "}
            {activeCountryObject?.name || activeCountryName}
          </p>
          <button
            className={`mt-5 px-5 py-2.5 ${purpleGradient} text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 mx-auto active:scale-[0.98]`}
            onClick={() => navigate("/create-game-entry")}
          >
            <Plus className="w-4 h-4" /> Create New Entry
          </button>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#B45CFF]" /> My Game Entries
            {activeCountryObject && (
              <img
                src={activeCountryObject.flag}
                alt={activeCountryObject.name}
                className="w-6 h-4 rounded-sm shadow-md ml-2"
              />
            )}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-[#9B59B6]/15 text-[#C77AFF] rounded-full text-xs font-semibold flex items-center gap-1 border border-[#9B59B6]/30">
              <Gamepad2 className="w-3 h-3" /> {entries.length} entries
            </span>
            <span className="px-3 py-1.5 bg-[#3498DB]/15 text-[#3498DB] rounded-full text-xs font-semibold flex items-center gap-1 border border-[#3498DB]/30">
              {currencySymbol} {currencyConfigObj.code}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {entries.map((entry) => {
            const status = entry.poolStatus || entry.playerStatus || "Pending";
            const entryId = entry.poolId;
            const isResultDeclared = entry.resultDeclared || false;
            const games = entry.games || [];
            const winningNumbers = entry.winningNumbers || {
              numbers: [],
              powerball: null,
            };
            const StatusIcon = getStatusIcon(status);

            let wonCount = 0;
            let lostCount = 0;
            if (isResultDeclared && games.length > 0) {
              games.forEach((game) => {
                const matches = game.numbers.filter(
                  (num) =>
                    winningNumbers.numbers &&
                    winningNumbers.numbers.includes(num),
                );
                const powerballMatch =
                  game.powerball === winningNumbers.powerball;
                if (
                  matches.length >= 3 ||
                  (matches.length >= 2 && powerballMatch)
                ) {
                  wonCount++;
                } else {
                  lostCount++;
                }
              });
            }

            return (
              <div
                key={entryId}
                className="bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-[#9B59B6]/50 hover:shadow-[0_6px_18px_rgba(155,89,182,0.2)] transition-all p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-[#B45CFF]" /> Draw #
                    {entry.drawNo || "N/A"}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold text-white flex items-center gap-1 ${getStatusColor(status)}`}
                  >
                    <StatusIcon className="w-2.5 h-2.5" /> {status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-[#12061C] rounded-lg p-2 text-center border border-[#2a1b3d]">
                    <div className="text-[9px] text-gray-500 font-semibold flex items-center justify-center gap-0.5">
                      <DollarSign className="w-2.5 h-2.5" /> Amount
                    </div>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {formatCurrency(entry.totalAmount || 0)}
                    </div>
                  </div>
                  <div className="bg-[#12061C] rounded-lg p-2 text-center border border-[#2a1b3d]">
                    <div className="text-[9px] text-gray-500 font-semibold flex items-center justify-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> Players
                    </div>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {entry.totalPlayers || 0}
                    </div>
                  </div>
                  <div className="bg-[#12061C] rounded-lg p-2 text-center border border-[#2a1b3d]">
                    <div className="text-[9px] text-gray-500 font-semibold flex items-center justify-center gap-0.5">
                      <Gamepad2 className="w-2.5 h-2.5" /> Games
                    </div>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {entry.games?.length || 0}
                    </div>
                  </div>
                </div>

                {isResultDeclared && (
                  <div className="mb-3 flex gap-1.5 text-[10px] justify-center">
                    <span className="px-2.5 py-1 bg-[#F1C40F]/15 text-[#F1C40F] rounded-full font-semibold flex items-center gap-1 border border-[#F1C40F]/30">
                      <Trophy className="w-2.5 h-2.5" /> {wonCount}
                    </span>
                    <span className="px-2.5 py-1 bg-red-500/15 text-red-400 rounded-full font-semibold flex items-center gap-1 border border-red-500/30">
                      <Heart className="w-2.5 h-2.5" /> {lostCount}
                    </span>
                    <span className="px-2.5 py-1 bg-[#12061C] text-gray-300 rounded-full font-semibold flex items-center gap-1 border border-[#2a1b3d]">
                      <Percent className="w-2.5 h-2.5" />{" "}
                      {Math.round(
                        (wonCount / (wonCount + lostCount || 1)) * 100,
                      )}
                      %
                    </span>
                  </div>
                )}

                {!entry.resultDeclared && (
                  <div className="mb-3 px-2.5 py-2 bg-[#F1C40F]/10 rounded-lg text-[11px] text-[#F1C40F] text-center font-medium border border-[#F1C40F]/30 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Results pending...
                  </div>
                )}

                <button
                  className={`w-full mt-1 px-4 py-2.5 ${purpleGradient} text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-[0.98]`}
                  onClick={() => handleViewResults(entry)}
                >
                  <Eye className="w-3.5 h-3.5" /> View Results{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ======================================================
  // MAIN RENDER
  // ======================================================

  return (
    <div className="relative min-h-screen bg-[#0B0410] overflow-hidden">
      {/* Decorative purple orbs */}
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-64 h-64 bg-[#B45CFF]/15 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className={`w-11 h-11 rounded-2xl ${purpleGradient} flex items-center justify-center mb-3`}
            >
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Game Entry Results
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              View and manage all your game entries
            </p>

            {/* Country Badge */}
            {activeCountryObject && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#9B59B6]/10 border border-[#9B59B6]/40 rounded-full">
                <img
                  src={activeCountryObject.flag}
                  alt={activeCountryObject.name}
                  className="w-5 h-3 rounded-sm shadow-md"
                />
                <span className="text-xs font-medium text-[#C77AFF]">
                  {activeCountryObject.name}
                </span>
                <span className="text-xs font-medium text-[#C77AFF]">
                  • {currencySymbol} {currencyConfigObj.code}
                </span>
                {urlCountry && (
                  <span className="text-[10px] text-[#C77AFF] bg-[#9B59B6]/20 px-2 py-0.5 rounded-full">
                    via URL
                  </span>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {typeof error === "string" ? error : "Something went wrong"}
            </div>
          )}

          {renderEntriesList()}

          <DeleteConfirmationPopup
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            entryId={deleteId}
          />
        </div>
      </div>
    </div>
  );
};

export default GameEntryResultPage;
