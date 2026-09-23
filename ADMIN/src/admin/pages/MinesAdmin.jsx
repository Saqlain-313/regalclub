import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RefreshCw,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Award,
  Clock,
  Wallet,
  Gamepad2,
  Bomb,
  CheckCircle2,
  Circle,
  Filter,
  Calendar,
  Mail,
  Phone,
  User,
  Hash,
  Percent,
  Coins,
  Trophy,
  XCircle,
  PlayCircle,
} from "lucide-react";

import { fetchMinesHistory, updateGame } from "../redux/minesAdminSlice";

/* =========================================================
   MAIN COMPONENT
========================================================= */

const MinesAdmin = () => {
  const dispatch = useDispatch();

  const {
    games = [],
    loading,
    error,
    lastUpdated,
  } = useSelector((state) => state.minesAdmin);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGame, setSelectedGame] = useState(null);

  /* ================= LOAD HISTORY ================= */
  useEffect(() => {
    dispatch(fetchMinesHistory());
  }, [dispatch]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    const normalize = (data) => ({
      ...data,
      _id: data.gameId,
      virtualStake: Number(data.virtualStake || data.entryAmount || 0),
      entryAmount: Number(data.entryAmount || data.virtualStake || 0),
      virtualWin: Number(data.virtualWin || 0),
      creditAfter: Number(data.creditAfter || 0),
    });

    const handleCreated = (data) => {
      dispatch(updateGame({ ...normalize(data), status: data.status || "playing" }));
      dispatch(fetchMinesHistory());
    };

    const handleFinished = (data) => {
      dispatch(updateGame({ ...normalize(data), status: data.status }));
      dispatch(fetchMinesHistory());
    };

    socket.on("mines-game-created", handleCreated);
    socket.on("mines-game-finished", handleFinished);

    return () => {
      socket.off("mines-game-created", handleCreated);
      socket.off("mines-game-finished", handleFinished);
    };
  }, [dispatch]);

  /* ================= FILTERS ================= */
  const filteredGames = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return games.filter((game) => {
      const username = game.user?.username || game.user?.name || "";
      const name = game.user?.name || "";
      const email = game.user?.email || "";
      const mobile = game.user?.mobile || "";
      const gameId = String(game._id || "");

      const matchesSearch =
        !searchValue ||
        username.toLowerCase().includes(searchValue) ||
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue) ||
        mobile.toLowerCase().includes(searchValue) ||
        gameId.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        String(game.status).toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [games, search, statusFilter]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return {
      total: games.length,
      playing: games.filter((g) => g.status === "playing").length,
      won: games.filter((g) => g.status === "won").length,
      lost: games.filter((g) => g.status === "lost").length,
      cashout: games.filter((g) => g.status === "cashout").length,
      stake: games.reduce(
        (t, g) => t + Number(g.virtualStake || g.entryAmount || 0),
        0
      ),
      win: games.reduce((t, g) => t + Number(g.virtualWin || 0), 0),
    };
  }, [games]);

  /* ================= HELPERS ================= */
  const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-gray-900 p-4 md:p-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bomb size={28} className="text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Mines Control Center
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Real-time monitoring of all mines games & payouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          )}

          <button
            onClick={() => dispatch(fetchMinesHistory())}
            disabled={loading}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 text-slate-700 font-semibold disabled:opacity-50 active:scale-95"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        <StatCard
          icon={<Users size={20} />}
          title="Total Games"
          value={stats.total}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={<PlayCircle size={20} />}
          title="Playing"
          value={stats.playing}
          color="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={<Trophy size={20} />}
          title="Won"
          value={stats.won}
          color="from-emerald-500 to-green-500"
        />
        <StatCard
          icon={<XCircle size={20} />}
          title="Lost"
          value={stats.lost}
          color="from-rose-500 to-red-500"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          title="Cashout"
          value={stats.cashout}
          color="from-violet-500 to-purple-500"
        />
        <StatCard
          icon={<Coins size={20} />}
          title="Total Entry"
          value={formatMoney(stats.stake)}
          color="from-orange-500 to-pink-500"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Total Win"
          value={formatMoney(stats.win)}
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 mb-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username, email, mobile or game ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium text-sm placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={14} className="text-slate-500" />
              </button>
            )}
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/60 transition-all min-w-[180px] font-medium text-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="playing">Playing</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="cashout">Cashout</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6 flex items-center gap-3 font-medium">
          <XCircle size={20} />
          {error}
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Game ID</th>
                <th className="px-5 py-4">Mines</th>
                <th className="px-5 py-4">Opened</th>
                <th className="px-5 py-4">Multiplier</th>
                <th className="px-5 py-4">Game Entry</th>
                <th className="px-5 py-4">Virtual Win</th>
                <th className="px-5 py-4">credit</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && games.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <RefreshCw size={36} className="relative animate-spin text-indigo-500" />
                      </div>
                      <span className="font-medium">Loading Mines games...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredGames.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Bomb size={48} className="text-slate-300" />
                      <span className="font-medium">No Mines games found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => {
                  const username =
                    game.user?.username || game.user?.name || "Unknown";
                  const entryAmount = Number(
                    game.entryAmount ?? game.virtualStake ?? 0
                  );
                  const virtualWin = Number(game.virtualWin || 0);
                  const creditAfter = game.creditAfter;

                  return (
                    <tr
                      key={game._id}
                      className="hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-purple-50/20 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {username}
                            </div>
                            <div className="text-xs text-slate-400">
                              {game.user?.email || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          #{String(game._id).slice(-8)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <Bomb size={14} />
                          {game.minesCount}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {" / "}
                          {game.totalCells || 36}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">
                          {game.safeCells ?? game.openedCells?.length ?? 0}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {" / "}
                          {(game.totalCells || 36) - Number(game.minesCount || 0)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md text-sm">
                          <Percent size={12} />
                          {Number(game.multiplier || 1).toFixed(2)}x
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-orange-600">
                          {formatMoney(entryAmount)}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          deducted
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`font-bold ${
                            virtualWin > 0 ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {formatMoney(virtualWin)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {creditAfter !== undefined && creditAfter !== null ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100">
                            <Wallet size={13} className="text-blue-500" />
                            <span className="font-bold text-blue-600 text-sm">
                              {formatMoney(creditAfter)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={game.status} />
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(game.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedGame(game)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-200 hover:from-indigo-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all text-sm font-semibold shadow-sm hover:shadow-md hover:shadow-indigo-500/25 active:scale-95"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedGame && (
        <GameDetailsModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          formatMoney={formatMoney}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ icon, title, value, color }) => {
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

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const config = {
    playing: {
      bg: "bg-gradient-to-r from-amber-100 to-yellow-100",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      icon: PlayCircle,
    },
    won: {
      bg: "bg-gradient-to-r from-emerald-100 to-green-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      icon: Trophy,
    },
    lost: {
      bg: "bg-gradient-to-r from-rose-100 to-red-100",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
      icon: XCircle,
    },
    cashout: {
      bg: "bg-gradient-to-r from-blue-100 to-indigo-100",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
      icon: DollarSign,
    },
  };

  const c = config[status] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
    icon: Circle,
  };

  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${c.bg} ${c.text} ${c.border} text-xs font-bold capitalize shadow-sm`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

/* =========================================================
   GAME DETAILS MODAL
========================================================= */

const GameDetailsModal = ({ game, onClose, formatMoney, formatDate }) => {
  const openedCells = game.openedCells || [];
  const minePositions = game.minePositions || [];
  const totalCells = game.totalCells || 36;
  const entryAmount = Number(game.entryAmount ?? game.virtualStake ?? 0);
  const virtualWin = Number(game.virtualWin || 0);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl shadow-black/30 flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              <Bomb size={24} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Game Details
              </h2>
              <p className="text-xs text-white/70 font-mono mt-0.5 truncate max-w-[200px] md:max-w-md">
                {game._id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 transition-all text-white active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* TOP INFO */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard
              icon={<Hash size={16} />}
              label="Mines"
              value={game.minesCount}
              color="from-red-500 to-rose-500"
            />
            <InfoCard
              icon={<CheckCircle2 size={16} />}
              label="Safe Cells"
              value={game.safeCells || 0}
              color="from-emerald-500 to-green-500"
            />
            <InfoCard
              icon={<Percent size={16} />}
              label="Multiplier"
              value={`${Number(game.multiplier || 1).toFixed(2)}x`}
              color="from-purple-500 to-indigo-500"
            />
            <InfoCard
              icon={<Wallet size={16} />}
              label="credit After"
              value={
                game.creditAfter !== undefined && game.creditAfter !== null
                  ? formatMoney(game.creditAfter)
                  : "-"
              }
              color="from-blue-500 to-cyan-500"
            />
          </div>

          {/* MONEY ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Coins size={14} className="text-orange-500" />
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  Game Entry
                </p>
              </div>
              <p className="text-2xl font-black text-orange-600">
                {formatMoney(entryAmount)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-emerald-500" />
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Virtual Win
                </p>
              </div>
              <p className="text-2xl font-black text-emerald-600">
                {formatMoney(virtualWin)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 flex flex-col justify-center">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                Status
              </p>
              <StatusBadge status={game.status} />
            </div>
          </div>

          {/* PLAYER INFO */}
          <Section title="Player Information" icon={<User size={16} />}>
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Detail label="Username" value={game.user?.username || game.user?.name || "-"} />
                <Detail label="Name" value={game.user?.name || "-"} />
                <Detail label="Email" value={game.user?.email || "-"} />
                <Detail label="Mobile" value={game.user?.mobile || "-"} />
              </div>
            </div>
          </Section>

          {/* DATES */}
          <Section title="Timeline" icon={<Calendar size={16} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Created
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDate(game.createdAt)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Finished
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDate(game.finishedAt)}
                </p>
              </div>
            </div>
          </Section>

          {/* GAME GRID */}
          <Section title="Game Grid" icon={<Gamepad2 size={16} />}>
            <div className="flex items-center gap-4 mb-4 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                <CheckCircle2 size={12} />
                Safe
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <Bomb size={12} />
                Mine
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                <Circle size={12} />
                Unopened
              </span>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-5 rounded-2xl border border-slate-200 inline-block">
              <div className="grid grid-cols-6 gap-2 md:gap-2.5">
                {Array.from({ length: totalCells }).map((_, index) => {
                  const isMine = minePositions.includes(index);
                  const isOpened = openedCells.includes(index);

                  let cellClass =
                    "w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300 border-2 ";

                  if (isMine) {
                    cellClass +=
                      "bg-gradient-to-br from-red-100 to-rose-200 border-red-300 text-red-600 shadow-sm shadow-red-200";
                  } else if (isOpened) {
                    cellClass +=
                      "bg-gradient-to-br from-emerald-100 to-green-200 border-emerald-300 text-emerald-600 shadow-sm shadow-emerald-200";
                  } else {
                    cellClass +=
                      "bg-white border-slate-200 text-slate-300 hover:border-slate-300";
                  }

                  return (
                    <div key={index} className={cellClass}>
                      {isMine ? (
                        <Bomb size={18} />
                      ) : isOpened ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <span className="text-slate-300">{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* OPENED & MINE POSITIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Opened Cells" icon={<CheckCircle2 size={16} />}>
              <div className="flex flex-wrap gap-2">
                {openedCells.length === 0 ? (
                  <span className="text-slate-400 text-sm italic">
                    No cells opened
                  </span>
                ) : (
                  openedCells.map((cell) => (
                    <span
                      key={cell}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm"
                    >
                      #{cell}
                    </span>
                  ))
                )}
              </div>
            </Section>

            <Section title="Mine Positions" icon={<Bomb size={16} />}>
              <div className="flex flex-wrap gap-2">
                {minePositions.length === 0 ? (
                  <span className="text-slate-400 text-sm italic">
                    Mine positions unavailable
                  </span>
                ) : (
                  minePositions.map((cell) => (
                    <span
                      key={cell}
                      className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold shadow-sm"
                    >
                      #{cell}
                    </span>
                  ))
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({ icon, label, value, color }) => (
  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div
      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-2 shadow-sm`}
    >
      {icon}
    </div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
      {label}
    </p>
    <p className="text-sm font-black text-slate-900 truncate">{value}</p>
  </div>
);

/* =========================================================
   SECTION
========================================================= */

const Section = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

/* =========================================================
   DETAIL
========================================================= */

const Detail = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-sm font-semibold text-slate-800 break-all">{value}</p>
  </div>
);

export default MinesAdmin;