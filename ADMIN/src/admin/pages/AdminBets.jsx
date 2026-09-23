import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RefreshCw,
  Search,
  X,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Wallet,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
  Calendar,
  CreditCard,
  Percent,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Smartphone,
} from "lucide-react";

import {
  getAdminBets,
  setBetFilters,
  clearBetFilters,
} from "../redux/adminBetReducer";

const AdminBets = () => {
  const dispatch = useDispatch();

  const { bets, loading, error, pagination, stats, filters } = useSelector(
    (state) => state.adminBet
  );

  const [searchMobile, setSearchMobile] = useState(filters.mobile || "");
  const [searchPeriod, setSearchPeriod] = useState(filters.period || "");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    dispatch(getAdminBets({ page: 1, ...filters }));
  }, [dispatch, filters.game, filters.status, filters.bet]);

  /* ================= REFRESH ================= */
  const refreshData = () => {
    dispatch(getAdminBets({ page: pagination.page, ...filters }));
  };

  /* ================= SEARCH ================= */
  const handleSearch = () => {
    dispatch(setBetFilters({ mobile: searchMobile, period: searchPeriod }));
    dispatch(
      getAdminBets({
        page: 1,
        ...filters,
        mobile: searchMobile,
        period: searchPeriod,
      })
    );
  };

  /* ================= CLEAR ================= */
  const handleClear = () => {
    setSearchMobile("");
    setSearchPeriod("");
    dispatch(clearBetFilters());
    dispatch(
      getAdminBets({
        page: 1,
        game: "all",
        status: "all",
        bet: "all",
        mobile: "",
        period: "",
      })
    );
  };

  /* ================= FILTER ================= */
  const handleFilterChange = (key, value) => {
    dispatch(setBetFilters({ [key]: value }));
  };

  /* ================= PAGINATION ================= */
  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages || loading) return;
    dispatch(getAdminBets({ page, ...filters }));
  };

  /* ================= HELPERS ================= */
  const getBetType = (bet) => {
    const map = {
      l: "Big",
      n: "Small",
      d: "Red",
      x: "Green",
      t: "Violet",
      "0": "Number 0",
      "1": "Number 1",
      "2": "Number 2",
      "3": "Number 3",
      "4": "Number 4",
      "5": "Number 5",
      "6": "Number 6",
      "7": "Number 7",
      "8": "Number 8",
      "9": "Number 9",
    };
    return map[bet] || bet;
  };

  // ✅ UPDATED: wingo10 → Wingo 30S show karo
  const getGameName = (game) => {
    const map = {
      wingo: "Wingo 1M",
      wingo3: "Wingo 3M",
      wingo5: "Wingo 5M",
      wingo10: "Wingo 30S", // ✅ wingo10 ko Wingo 30S show karo
      wingo30: "Wingo 30S",
      trx: "TRX",
      trx3: "TRX 3M",
      trx5: "TRX 5M",
      trx10: "TRX 10M",
    };
    return map[game] || game;
  };

  const getStatus = (status) => {
    if (status === 1)
      return {
        text: "Won",
        className:
          "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200",
        icon: Trophy,
      };
    if (status === 2)
      return {
        text: "Lost",
        className:
          "bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 border-rose-200",
        icon: XCircle,
      };
    return {
      text: "Pending",
      className:
        "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200",
      icon: Clock,
    };
  };

  const getBetBadge = (bet) => {
    const betType = getBetType(bet);
    if (betType === "Big")
      return "bg-blue-50 text-blue-700 border-blue-200";
    if (betType === "Small")
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    if (betType === "Red")
      return "bg-red-50 text-red-700 border-red-200";
    if (betType === "Green")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (betType === "Violet")
      return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  /* ================= BET COLOR HELPERS ================= */
  const getBetClass = (bet) => {
    const map = {
      x: "bgs-green",
      d: "bgs-red-200",
      t: "bgs-violet",
      l: "color-yellow-bg-200",
      n: "bgs-blue-500",
    };
    if (map[bet]) return map[bet];
    const num = Number(bet);
    if ([1, 3, 7, 9].includes(num)) return "bgs-green";
    if (num === 5) return "bg-green-voilet";
    if (num === 0) return "bg-red-voilet";
    return "bgs-red-200";
  };

  const getBetColorName = (bet) => {
    const map = {
      x: "Green",
      d: "Red",
      t: "Violet",
      l: "Yellow",
      n: "Blue",
    };
    if (map[bet]) return map[bet];
    const num = Number(bet);
    if ([1, 3, 7, 9].includes(num)) return "Green";
    if (num === 5) return "Green + Violet";
    if (num === 0) return "Red + Violet";
    return "Red";
  };

  const getBetColorHex = (bet) => {
    const map = {
      x: "#22c55e",
      d: "#ef4444",
      t: "#8b5cf6",
      l: "#eab308",
      n: "#3b82f6",
    };
    if (map[bet]) return map[bet];
    const num = Number(bet);
    if ([1, 3, 7, 9].includes(num)) return "#22c55e";
    if (num === 5)
      return "linear-gradient(135deg, #22c55e 50%, #8b5cf6 50%)";
    if (num === 0)
      return "linear-gradient(135deg, #ef4444 50%, #8b5cf6 50%)";
    return "#ef4444";
  };

  const formatResult = (result) => {
    if (result === null || result === undefined) return "-";
    return result;
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BarChart3 size={28} className="text-white" strokeWidth={2.2} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Admin Bets
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                View all users bets, numbers, timers and results
              </p>
            </div>
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 text-slate-700 font-semibold disabled:opacity-50 active:scale-95"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }
            />
            Refresh
          </button>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={<BarChart3 size={20} />}
            title="Total Bets"
            value={stats.totalBets}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Wallet size={20} />}
            title="Bet Amount"
            value={`₹${Number(stats.totalBetAmount || 0).toFixed(2)}`}
            color="from-orange-500 to-amber-500"
          />
          <StatCard
            icon={<CreditCard size={20} />}
            title="Total Fee"
            value={`₹${Number(stats.totalFee || 0).toFixed(2)}`}
            color="from-pink-500 to-rose-500"
          />
          <StatCard
            icon={<Clock size={20} />}
            title="Pending"
            value={stats.pendingBets}
            color="from-amber-500 to-yellow-500"
          />
          <StatCard
            icon={<Trophy size={20} />}
            title="Won"
            value={stats.wonBets}
            color="from-emerald-500 to-green-500"
          />
          <StatCard
            icon={<XCircle size={20} />}
            title="Lost"
            value={stats.lostBets}
            color="from-rose-500 to-red-500"
          />
        </div>

        {/* ================= FILTERS ================= */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 mb-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Game */}
            <select
              value={filters.game}
              onChange={(e) => handleFilterChange("game", e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium cursor-pointer"
            >
              <option value="all">All Games</option>
              <option value="wingo">Wingo 1M</option>
              <option value="wingo3">Wingo 3M</option>
              <option value="wingo5">Wingo 5M</option>
              <option value="wingo30">Wingo 30S</option>
              <option value="trx">TRX</option>
              <option value="trx3">TRX 3M</option>
              <option value="trx5">TRX 5M</option>
              <option value="trx10">TRX 10M</option>
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="0">Pending</option>
              <option value="1">Won</option>
              <option value="2">Lost</option>
            </select>

            {/* Bet */}
            <select
              value={filters.bet}
              onChange={(e) => handleFilterChange("bet", e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium cursor-pointer"
            >
              <option value="all">All Bets</option>
              <option value="l">Big</option>
              <option value="n">Small</option>
              <option value="d">Red</option>
              <option value="x">Green</option>
              <option value="t">Violet</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <option key={number} value={number}>
                  Number {number}
                </option>
              ))}
            </select>

            {/* Mobile */}
            <div className="relative group">
              <Smartphone
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                type="text"
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value)}
                placeholder="Search mobile..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Period */}
            <div className="relative group">
              <Calendar
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                type="text"
                value={searchPeriod}
                onChange={(e) => setSearchPeriod(e.target.value)}
                placeholder="Search period..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md hover:shadow-indigo-500/25 transition-all active:scale-95"
              >
                <Search size={14} />
                Search
              </button>
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
              >
                <X size={14} />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ================= ERROR ================= */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* ================= TABLE ================= */}
        <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Bet History</h2>
                <p className="text-xs text-slate-500">
                  Total {pagination.total} bets
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="relative mx-auto w-14 h-14">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <RefreshCw
                    size={36}
                    className="relative animate-spin text-indigo-500 mx-auto"
                  />
                </div>
                <p className="mt-4 text-sm text-slate-500 font-medium">
                  Loading bets...
                </p>
              </div>
            </div>
          ) : bets.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Inbox size={32} className="text-slate-400" />
                </div>
                <h3 className="mt-4 font-bold text-slate-700">No Bets Found</h3>
                <p className="mt-1 text-sm text-slate-400">
                  No bets match your current filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] text-left">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      #
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Game
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Timer / Period
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bet
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Result
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Win Amount
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Net
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {bets.map((item, index) => {
                    const status = getStatus(item.status);
                    const StatusIcon = status.icon;
                    const net = Number(item.netResult || 0);

                    return (
                      <tr
                        key={item._id || item.id_product || index}
                        className="hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-purple-50/20 transition-colors"
                      >
                        {/* INDEX */}
                        <td className="px-5 py-4 text-sm text-slate-500 font-mono">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>

                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                              {(item.mobile || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">
                                {item.mobile || "-"}
                              </p>
                              <p className="text-xs text-slate-400">
                                Code: {item.code || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* GAME */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 border border-blue-100">
                            <Hash size={11} />
                            {getGameName(item.game)}
                          </span>
                        </td>

                        {/* PERIOD */}
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md inline-block">
                            {item.period || "-"}
                          </p>
                        </td>

                        {/* BET (with color dot + name) */}
                        <td className="px-5 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              {/* Color Dot */}
                              <span
                                className="inline-block h-3 w-3 rounded-full border border-slate-300 shrink-0"
                                style={{ background: getBetColorHex(item.bet) }}
                              />
                              {/* Badge */}
                              <span
                                className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${getBetBadge(
                                  item.bet
                                )}`}
                              >
                                {getBetType(item.bet)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-400 font-mono">
                              Code: {item.bet} • {getBetColorName(item.bet)}
                            </p>
                          </div>
                        </td>

                        {/* AMOUNT */}
                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-slate-800">
                            ₹{Number(item.money || 0).toFixed(2)}
                          </p>
                          {Number(item.fee || 0) > 0 && (
                            <p className="text-xs text-slate-400">
                              Fee ₹{Number(item.fee).toFixed(2)}
                            </p>
                          )}
                        </td>

                        {/* RESULT */}
                        <td className="px-5 py-4 text-center">
                          {item.result !== null && item.result !== undefined ? (
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 font-black text-slate-800 shadow-sm border border-slate-200">
                              {formatResult(item.result)}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-bold">-</span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                          >
                            <StatusIcon size={12} />
                            {status.text}
                          </span>
                        </td>

                        {/* WIN */}
                        <td className="px-5 py-4 text-right">
                          {Number(item.winningAmount || 0) > 0 ? (
                            <span className="font-bold text-emerald-600">
                              ₹{Number(item.winningAmount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-300">₹0.00</span>
                          )}
                        </td>

                        {/* NET */}
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              net > 0
                                ? "text-emerald-600"
                                : net < 0
                                ? "text-rose-600"
                                : "text-slate-400"
                            }`}
                          >
                            {net > 0 ? (
                              <TrendingUp size={14} />
                            ) : net < 0 ? (
                              <TrendingDown size={14} />
                            ) : null}
                            {net > 0 ? "+" : ""}₹{net.toFixed(2)}
                          </span>
                        </td>

                        {/* TIME */}
                        <td className="px-5 py-4">
                          <p className="text-xs text-slate-600 font-medium whitespace-nowrap">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString("en-IN", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : item.today || "-"}
                          </p>
                          {item.isdemo && (
                            <span className="mt-1 inline-block rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                              DEMO
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= PAGINATION ================= */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-white to-slate-50">
              <p className="text-sm text-slate-500 font-medium">
                Page{" "}
                <span className="font-bold text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                {Array.from(
                  { length: Math.min(pagination.totalPages, 5) },
                  (_, index) => {
                    let page;
                    if (pagination.totalPages <= 5) page = index + 1;
                    else if (pagination.page <= 3) page = index + 1;
                    else if (pagination.page >= pagination.totalPages - 2)
                      page = pagination.totalPages - 4 + index;
                    else page = pagination.page - 2 + index;

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        disabled={loading}
                        className={`min-w-[36px] rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                          pagination.page === page
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-indigo-300"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="relative bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`}
      ></div>
      <div className="relative">
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 shadow-md`}
        >
          {icon}
        </div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-xl font-black text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
};

export default AdminBets;