import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Award,
  CalendarDays,
  Coins,
  Crown,
  Dice5,
  Filter,
  Gamepad2,
  Hash,
  Inbox,
  Moon,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActiveMarkets } from "../../redux/slices/marketSlice";
import { getResults, getResultStats } from "../../redux/slices/resultSlice";

const MatkaResults = () => {
  const dispatch = useDispatch();
  const { results, stats, loading } = useSelector((state) => state.result);
  const { activeMarkets } = useSelector((state) => state.market);
  const [filter, setFilter] = useState({
    marketId: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    dispatch(getResults(filter));
    dispatch(getResultStats());
    dispatch(getActiveMarkets());
  }, [dispatch, filter]);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
      page: 1,
    });
  };

  const clearFilters = () => {
    setFilter({
      marketId: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 10,
    });
  };

  const normalizeGameType = (gameType) =>
    String(gameType || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");

  const normalizeWinningNumber = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return String(value).trim();
  };

  // ============================================================
  // WINNING NUMBER DISPLAY
  // ============================================================


  const getWinningNumberDisplay = (result) => {
    if (
      result?.winningNumber === null ||
      result?.winningNumber === undefined ||
      result?.winningNumber === ""
    ) {
      return [];
    }

    const winningNumber = result.winningNumber;
    const digitType = getDigitType(result);
    const allowedTypes = getAllowedGameTypes(digitType);

    if (
      typeof winningNumber === "object" &&
      !Array.isArray(winningNumber)
    ) {
      return Object.entries(winningNumber)
        .map(([rawGameType, rawNumber]) => ({
          gameType: normalizeGameType(rawGameType),
          number: normalizeWinningNumber(rawNumber),
        }))
        .filter(({ gameType, number }) => {
          if (!number) return false;

          return (
            allowedTypes.length === 0 ||
            allowedTypes.includes(gameType)
          );
        });
    }

    return [
      {
        gameType: "winning-number",
        number: normalizeWinningNumber(winningNumber),
      },
    ];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // ============================================================
  // DIGIT TYPE / GAME HELPERS
  // ============================================================

  const getDigitType = (result) => {
    if (result?.digitType === "2-digit") return "2-digit";
    if (result?.digitType === "3-digit") return "3-digit";

    // Fallback for older results where digitType was not stored.
    const marketDigitType =
      result?.marketId?.digitType ||
      result?.market?.digitType;

    if (
      marketDigitType === "2-digit" ||
      marketDigitType === "3-digit"
    ) {
      return marketDigitType;
    }

    return "";
  };

  const getGameTypeLabel = (gameType) => {
    const type = normalizeGameType(gameType);

    const labels = {
      single: "SINGLE",
      jodi: "JODI",
      "single-patti": "SINGLE PATTI",
      "double-patti": "DOUBLE PATTI",
      "triple-patti": "TRIPLE PATTI",
      panna: "PANNA",
      open: "OPEN",
      close: "CLOSE",
      "half-sangam": "HALF SANGAM",
      "full-sangam": "FULL SANGAM",
      "last-digit": "LAST DIGIT",
      "first-digit": "FIRST DIGIT",
      "winning-number": "WINNING NUMBER",
    };

    return labels[type] || String(gameType || "").toUpperCase();
  };

  const getAllowedGameTypes = (digitType) => {
    if (digitType === "2-digit") {
      return [
        "single",
        "jodi",
        "open",
        "close",
        "last-digit",
        "first-digit",
      ];
    }

    if (digitType === "3-digit") {
      return [
        "single",
        "single-patti",
        "double-patti",
        "triple-patti",
        "panna",
        "open",
        "close",
        "jodi",
        "half-sangam",
        "full-sangam",
        "last-digit",
        "first-digit",
      ];
    }

    return [];
  };

  // Get gradient background based on market name
  const getMarketGradient = (marketName) => {
    const gradients = {
      Kalyan: "from-amber-400 to-orange-500",
      Main: "from-emerald-400 to-teal-500",
      Rajdhani: "from-purple-400 to-pink-500",
      Time: "from-cyan-400 to-blue-500",
    };
    const found = Object.keys(gradients).find((key) =>
      marketName?.includes(key),
    );
    return found ? gradients[found] : "from-gray-400 to-gray-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-amber-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-amber-100/50 transform group-hover:scale-[1.01] transition duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-md"></div>
                  <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-full shadow-lg">
                    <Trophy size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    Matka Results
                  </h1>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-400" />
                    Live results & statistics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl border border-amber-200/50 shadow-inner">
                <CalendarDays size={16} className="text-amber-600" />
                <span className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Trophy,
                color: "from-blue-500 to-blue-600",
                label: "Total Results",
                value: stats.reduce((acc, s) => acc + s.totalResults, 0),
                shadow: "shadow-blue-500/30",
              },
              {
                icon: Coins,
                color: "from-green-500 to-emerald-600",
                label: "Total Payout",
                value: formatCurrency(
                  stats.reduce((acc, s) => acc + s.totalPayout, 0),
                ),
                shadow: "shadow-green-500/30",
              },
              {
                icon: Users,
                color: "from-purple-500 to-purple-600",
                label: "Total Winners",
                value: stats.reduce((acc, s) => acc + s.totalWinningBids, 0),
                shadow: "shadow-purple-500/30",
              },
              {
                icon: Zap,
                color: "from-orange-500 to-amber-600",
                label: "Avg Payout",
                value: formatCurrency(
                  stats.reduce((acc, s) => acc + s.avgPayout, 0) / stats.length,
                ),
                shadow: "shadow-orange-500/30",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative transform hover:-translate-y-1 transition duration-300"
              >
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-300`}
                ></div>
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100/50 p-5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-50/50 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow} transform group-hover:scale-110 transition duration-300`}
                    >
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-xl font-extrabold text-gray-800 mt-0.5">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-700">
                Filter Results
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Market
                </label>
                <select
                  name="marketId"
                  value={filter.marketId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition duration-200"
                >
                  <option value="">All Markets</option>
                  {activeMarkets?.map((market) => (
                    <option key={market._id} value={market._id}>
                      {market.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filter.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filter.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition duration-200"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 text-sm font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {results?.length > 0 ? (
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-yellow-400/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Market
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Winning Numbers
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Total Bids
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Winners
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Total Payout
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {results.map((result, index) => {
                      const marketGradient = getMarketGradient(
                        result.marketName,
                      );
                      const winningDisplay = getWinningNumberDisplay(result);

                      return (
                        <tr
                          key={result._id || `${result.marketId?._id || result.marketId}-${result.resultDate}-${index}`}
                          className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 transition-all duration-300 group/row transform hover:scale-[1.002]"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col items-start gap-1.5">
                              <span
                                className={`inline-block px-3 py-1 text-xs font-bold text-white rounded-lg bg-gradient-to-r ${marketGradient} shadow-lg transform group-hover/row:scale-105 transition duration-300`}
                              >
                                {result.marketName ||
                                  result.marketId?.name ||
                                  "Market"}
                              </span>

                              {getDigitType(result) && (
                                <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-extrabold">
                                  {getDigitType(result)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {winningDisplay.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {winningDisplay.map(
                                  ({ gameType, number }) => (
                                    <div
                                      key={`${result._id}-${gameType}`}
                                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl border border-green-200 shadow-sm"
                                    >
                                      <Award
                                        size={15}
                                        className="text-green-500 flex-shrink-0"
                                      />

                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase text-gray-400 leading-none">
                                          {gameType === "winning-number"
                                            ? "Winning Number"
                                            : getGameTypeLabel(gameType)}
                                        </span>

                                        <span className="font-black text-lg leading-tight">
                                          {number}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Awaited
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">
                            {result.totalBids || 0}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">
                            <span className="inline-flex items-center gap-1">
                              <Crown size={14} className="text-amber-400" />
                              {result.totalWinningBids || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm font-extrabold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                            {formatCurrency(result.totalPayout || 0)}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-500 font-medium">
                            {new Date(result.resultDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-16 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center animate-float">
                  <Inbox size={56} className="text-amber-500" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-gray-600 text-xl font-semibold">
                No results found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Results will appear here once declared
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MatkaResults;