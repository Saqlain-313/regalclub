import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  CircleX,
  Clock,
  DollarSign,
  Gamepad2,
  Heart,
  Info,
  Loader2,
  Percent,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// ======================================================
// COUNTRY-SPECIFIC GAME ENTRY SLICES
// ======================================================
import {
  deleteGameEntry as deleteAustraliaGameEntry,
  getMyGameEntries as getAustraliaGameEntries,
} from "../redux/slices/australia/gameEntrySlice";

import {
  deleteGameEntry as deleteBangladeshGameEntry,
  getMyGameEntries as getBangladeshGameEntries,
} from "../redux/slices/bangladesh/gameEntrySlice";

import {
  deleteGameEntry as deleteIndiaGameEntry,
  getMyGameEntries as getIndiaGameEntries,
} from "../redux/slices/india/gameEntrySlice";

import {
  deleteGameEntry as deleteNepalGameEntry,
  getMyGameEntries as getNepalGameEntries,
} from "../redux/slices/nepal/gameEntrySlice";

import {
  deleteGameEntry as deletePakistanGameEntry,
  getMyGameEntries as getPakistanGameEntries,
} from "../redux/slices/pakistan/gameEntrySlice";

import {
  deleteGameEntry as deleteUaeGameEntry,
  getMyGameEntries as getUaeGameEntries,
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
// COUNTRY ALIASES
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
};

const countryConfig = {
  india: {
    stateKey: "indiaGameEntry",
    getGameEntries: getIndiaGameEntries,
    deleteGameEntry: deleteIndiaGameEntry,
    countryCode: "IN",
    displayName: "India",
  },
  australia: {
    stateKey: "australiaGameEntry",
    getGameEntries: getAustraliaGameEntries,
    deleteGameEntry: deleteAustraliaGameEntry,
    countryCode: "AU",
    displayName: "Australia",
  },
  pakistan: {
    stateKey: "pakistanGameEntry",
    getGameEntries: getPakistanGameEntries,
    deleteGameEntry: deletePakistanGameEntry,
    countryCode: "PK",
    displayName: "Pakistan",
  },
  bangladesh: {
    stateKey: "bangladeshGameEntry",
    getGameEntries: getBangladeshGameEntries,
    deleteGameEntry: deleteBangladeshGameEntry,
    countryCode: "BD",
    displayName: "Bangladesh",
  },
  nepal: {
    stateKey: "nepalGameEntry",
    getGameEntries: getNepalGameEntries,
    deleteGameEntry: deleteNepalGameEntry,
    countryCode: "NP",
    displayName: "Nepal",
  },
  uae: {
    stateKey: "uaeGameEntry",
    getGameEntries: getUaeGameEntries,
    deleteGameEntry: deleteUaeGameEntry,
    countryCode: "UAE",
    displayName: "UAE",
  },
};

// ======================================================
// MAIN COMPONENT
// ======================================================
const GameEntryResultDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { entryId } = useParams();

  // Get entry from navigation state
  const entryFromState = location.state?.entry;
  const countryCodeFromState = location.state?.countryCode;
  const countryNameFromState = location.state?.countryName;
  const currencySymbolFromState = location.state?.currencySymbol;

  const { user } = useSelector((state) => state.auth || { user: null });
  const userCountry = user?.country || null;

  // Determine country
  const activeCountryName = countryNameFromState || userCountry;
  const normalizedCountry =
    countryAliases[
      String(activeCountryName || "")
        .trim()
        .toLowerCase()
    ] || "";

  const activeCountryConfig = countryConfig[normalizedCountry] || null;

  // Helper function to get country code from name
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

  const activeCountryCode =
    countryCodeFromState || getCountryCodeFromName(activeCountryName);

  const currencySymbol =
    currencySymbolFromState || getCurrencySymbol(activeCountryCode);
  const currencyConfigObj = getCurrencyConfig(activeCountryCode);

  const [entry, setEntry] = useState(entryFromState || null);
  const [loading, setLoading] = useState(!entryFromState);
  const [error, setError] = useState(null);

  // ======================================================
  // REDUX SELECTORS
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

  // ======================================================
  // EFFECTS
  // ======================================================

  useEffect(() => {
    // If entry not passed via state, fetch it
    if (!entryFromState && activeCountryConfig) {
      dispatch(activeCountryConfig.getGameEntries());
    }
  }, [dispatch, activeCountryConfig, entryFromState]);

  useEffect(() => {
    // If entry came from state, use it
    if (entryFromState) {
      setEntry(entryFromState);
      setLoading(false);
      return;
    }

    // Otherwise find from Redux
    const activeState = getActiveEntryState();
    if (activeState?.entries && activeState.entries.length > 0) {
      const foundEntry = activeState.entries.find((e) => e.poolId === entryId);
      if (foundEntry) {
        setEntry(foundEntry);
        setLoading(false);
      } else {
        setError("Entry not found");
        setLoading(false);
      }
    } else if (activeState?.loading) {
      setLoading(true);
    } else {
      setLoading(false);
      if (!activeState?.entries || activeState.entries.length === 0) {
        setError("No entries found");
      }
    }
  }, [entryFromState, entryId, getActiveEntryState]);

  // ======================================================
  // UTILITY FUNCTIONS
  // ======================================================

  const formatCurrency = (amount) => {
    return `${currencySymbol}${Number(amount).toFixed(2)}`;
  };

  const checkNumberMatch = (gameNumbers, winningNumbers) => {
    if (!winningNumbers || !winningNumbers.numbers || !gameNumbers) return null;

    const matches = gameNumbers.numbers.filter(
      (num) => winningNumbers.numbers && winningNumbers.numbers.includes(num),
    );

    const powerballMatch = gameNumbers.powerball === winningNumbers.powerball;

    return {
      matches: matches.length,
      powerballMatch,
      isWinner: matches.length >= 3 || (matches.length >= 2 && powerballMatch),
    };
  };

  const getGameStatistics = (games, winningNumbers, resultDeclared) => {
    if (!resultDeclared || !games || !winningNumbers) {
      return { total: 0, won: 0, lost: 0, pending: games?.length || 0 };
    }

    let won = 0;
    let lost = 0;

    games.forEach((game) => {
      const result = checkNumberMatch(game, winningNumbers);
      if (result?.isWinner) {
        won++;
      } else {
        lost++;
      }
    });

    return {
      total: games.length,
      won,
      lost,
      pending: 0,
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-amber-500",
      Active: "bg-amber-500",
      Completed: "bg-emerald-500",
      Cancelled: "bg-red-500",
      Won: "bg-amber-500",
      Lost: "bg-red-500",
      Open: "bg-amber-500",
    };
    return colors[status] || "bg-gray-400";
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

  // ======================================================
  // LOADING / ERROR STATES
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-amber-100 border-t-amber-500 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-400 mt-4 font-medium">
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-gray-100 shadow-xl">
          <div className="text-red-400 flex justify-center mb-3">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Entry Not Found
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            {error || "The requested entry could not be found."}
          </p>
          <button
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 mx-auto"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER ENTRY DETAILS
  // ======================================================

  const status = entry.poolStatus || entry.playerStatus || "Pending";
  const drawNo = entry.drawNo || "N/A";
  const totalAmount = entry.totalAmount || 0;
  const totalPlayers = entry.totalPlayers || 0;
  const games = entry.games || [];
  const winningNumbers = entry.winningNumbers || {
    numbers: [],
    powerball: null,
  };
  const resultDeclared = entry.resultDeclared || false;
  const StatusIcon = getStatusIcon(status);

  const stats = getGameStatistics(games, winningNumbers, resultDeclared);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-hidden">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-64 h-64 bg-yellow-200/25 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Entries</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-200 flex-shrink-0">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Entry #{drawNo}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Game entry results and details
                </p>
              </div>
            </div>
          </div>

          {/* Country & Currency Badge */}
          {activeCountryCode && (
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 mb-4 flex items-center justify-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-amber-700">
                🌍 Country: {activeCountryName || activeCountryCode}
              </span>
              <span className="text-xs font-medium text-amber-700">
                • Currency: {currencySymbol} {currencyConfigObj.code}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-white font-semibold text-xs flex items-center gap-1.5 ${getStatusColor(status)}`}
              >
                <StatusIcon className="w-3 h-3" />
                {status}
              </span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Amount
              </div>
              <div className="font-bold text-gray-900 text-lg mt-0.5">
                {formatCurrency(totalAmount)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                <Users className="w-3 h-3" /> Players
              </div>
              <div className="font-bold text-gray-900 text-lg mt-0.5">
                {totalPlayers}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                <Gamepad2 className="w-3 h-3" /> Games
              </div>
              <div className="font-bold text-gray-900 text-lg mt-0.5">
                {stats.total}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Created
              </div>
              <div className="font-bold text-gray-900 text-sm mt-0.5">
                {entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* Result Status */}
          {resultDeclared && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-xl p-4 text-center border border-amber-100 shadow-sm">
                <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.won}
                </div>
                <div className="text-[11px] text-gray-400 font-medium">Won</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-red-100 shadow-sm">
                <Heart className="w-6 h-6 text-red-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.lost}
                </div>
                <div className="text-[11px] text-gray-400 font-medium">
                  Lost
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <Percent className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total > 0
                    ? Math.round((stats.won / stats.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-[11px] text-gray-400 font-medium">
                  Win Rate
                </div>
              </div>
            </div>
          )}

          {!resultDeclared && (
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 mb-4 text-center">
              <div className="text-amber-700 font-semibold text-sm flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Results pending - check back later
              </div>
            </div>
          )}

          {/* Winning Numbers */}
          {resultDeclared &&
            winningNumbers &&
            winningNumbers.numbers &&
            winningNumbers.numbers.length > 0 && (
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 mb-4 text-white shadow-sm">
                <h3 className="text-sm font-bold text-center mb-4 flex items-center justify-center gap-2 uppercase tracking-wide">
                  <Target className="w-4 h-4" /> Winning Numbers
                </h3>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {winningNumbers.numbers.map((num) => (
                    <div
                      key={num}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-base font-bold border border-white/30"
                    >
                      {num}
                    </div>
                  ))}
                  <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-bold border border-white/30 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> PB: {winningNumbers.powerball}
                  </div>
                </div>
                {entry.updatedAt && (
                  <div className="text-center mt-3 opacity-80 text-xs">
                    Results declared:{" "}
                    {new Date(entry.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

          {/* Game Results */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-amber-500" />
              Game Results
              <span className="text-xs font-normal text-gray-400 ml-2">
                ({stats.total} games • {stats.won} won • {stats.lost} lost)
              </span>
            </h3>

            {!games || games.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400 bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
                <Info className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                No games found for this entry
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game, index) => {
                  const matchResult = resultDeclared
                    ? checkNumberMatch(game, winningNumbers)
                    : null;
                  const isWinner = matchResult?.isWinner || false;
                  const matchedCount = matchResult?.matches || 0;
                  const powerballMatch = matchResult?.powerballMatch || false;

                  return (
                    <div
                      key={index}
                      className={`rounded-2xl p-5 border transition-all ${
                        !resultDeclared
                          ? "bg-gray-50/60 border-gray-100"
                          : isWinner
                            ? "bg-amber-50/60 border-amber-200"
                            : "bg-gray-50/60 border-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-800">
                          Game #{game.gameNo || index + 1}
                        </span>
                        {resultDeclared && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 ${
                              isWinner ? "bg-amber-500" : "bg-gray-400"
                            }`}
                          >
                            {isWinner ? (
                              <Trophy className="w-3 h-3" />
                            ) : (
                              <Heart className="w-3 h-3" />
                            )}
                            {isWinner ? "Winner" : "Lost"}
                          </span>
                        )}
                        {!resultDeclared && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {game.numbers?.map((num) => {
                          const isMatched =
                            resultDeclared &&
                            winningNumbers?.numbers?.includes(num);
                          return (
                            <div
                              key={num}
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                                isMatched
                                  ? "bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black"
                                  : "bg-white text-gray-600 border border-gray-200"
                              }`}
                            >
                              {num}
                            </div>
                          );
                        })}
                        <div
                          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                            resultDeclared &&
                            winningNumbers?.powerball === game.powerball
                              ? "bg-amber-500 text-white"
                              : "bg-white text-gray-600 border border-gray-200"
                          }`}
                        >
                          <Zap className="w-3 h-3" /> PB: {game.powerball}
                        </div>
                      </div>

                      {resultDeclared && matchResult && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-white px-3 py-1 rounded-full border border-gray-100 flex items-center gap-1">
                              <Target className="w-3 h-3" /> Matches:{" "}
                              <strong
                                className={
                                  matchedCount > 0
                                    ? "text-amber-600"
                                    : "text-gray-500"
                                }
                              >
                                {matchedCount}/7
                              </strong>
                            </span>
                            <span className="bg-white px-3 py-1 rounded-full border border-gray-100 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Powerball:{" "}
                              <strong
                                className={
                                  powerballMatch
                                    ? "text-amber-600"
                                    : "text-red-500"
                                }
                              >
                                {powerballMatch ? "Hit" : "Miss"}
                              </strong>
                            </span>
                          </div>

                          {isWinner && (
                            <div className="mt-2 p-3 bg-amber-100/70 rounded-xl text-center text-xs font-semibold text-amber-800 border border-amber-200">
                              <Trophy className="w-4 h-4 inline-block mr-1.5" />
                              Congratulations! You won!
                              <div className="text-xs font-normal text-amber-700 mt-0.5">
                                Estimated Prize:{" "}
                                {formatCurrency(
                                  (totalAmount * 0.7) /
                                    games.filter((g) => {
                                      const r = checkNumberMatch(
                                        g,
                                        winningNumbers,
                                      );
                                      return r?.isWinner;
                                    }).length || 1,
                                )}
                              </div>
                            </div>
                          )}

                          {!isWinner && matchedCount > 0 && (
                            <div className="mt-2 p-2 bg-white/70 rounded-lg text-center text-xs text-gray-500 border border-gray-100">
                              You matched {matchedCount} number
                              {matchedCount !== 1 ? "s" : ""}
                              {powerballMatch && " and the Powerball"}
                              {matchedCount === 1 &&
                                !powerballMatch &&
                                " - Need at least 2 matches or 1 + Powerball to win"}
                            </div>
                          )}

                          {!isWinner && matchedCount === 0 && (
                            <div className="mt-2 p-2 bg-white/70 rounded-lg text-center text-xs text-gray-400 border border-gray-100">
                              No matches this time. Better luck next time!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Overall Summary */}
          {resultDeclared && stats.total > 0 && (
            <div className="p-5 bg-gray-50/60 rounded-xl border border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" /> Overall Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <span className="text-gray-400 block text-xs">
                    Total Games
                  </span>
                  <span className="font-bold text-gray-900 text-lg">
                    {stats.total}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <span className="text-gray-400 block text-xs">Won</span>
                  <span className="font-bold text-emerald-600 text-lg">
                    {stats.won}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <span className="text-gray-400 block text-xs">Lost</span>
                  <span className="font-bold text-red-500 text-lg">
                    {stats.lost}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <span className="text-gray-400 block text-xs">Win Rate</span>
                  <span className="font-bold text-amber-600 text-lg">
                    {Math.round((stats.won / stats.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameEntryResultDetail;
