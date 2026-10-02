import {
  Calendar,
  Gamepad2,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGameHistory } from "../redux/slices/gameSlice";

// ======================================================
// THEME TOKENS — TopX purple gradient system
// ======================================================

const accentGradient =
  "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9]";
const accentGlow =
  "shadow-[0_0_10px_rgba(180,92,255,0.35),0_4px_20px_rgba(58,0,201,0.35)]";
const cardBase =
  "bg-[#150D22]/90 border border-[#2a1b3d] shadow-[0_4px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]";
const statBox = "bg-[#12061C] rounded-xl border border-[#2a1b3d] px-3 py-2";

// ======================================================
// PROVIDER HISTORY ITEM — defensive field mapping
// ======================================================

const pick = (item, keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== "")
      return item[key];
  }
  return null;
};

const GameHistory = () => {
  const dispatch = useDispatch();
  const { gameHistory, loading, error } = useSelector((state) => state.game);
  const [page, setPage] = useState(1);

  const rows = Array.isArray(gameHistory) ? gameHistory : [];

  const fetchHistory = useCallback(
    (targetPage = 1) => {
      dispatch(getGameHistory({ page: targetPage, limit: 20 }));
    },
    [dispatch],
  );

  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  // Summary stats
  const totalBets = rows.length;
  const totalWagered = rows.reduce((sum, item) => {
    const amount = Number(
      pick(item, [
        "bet_amount",
        "betAmount",
        "bet",
        "stake",
        "turnover",
        "amount",
      ]) || 0,
    );
    return sum + amount;
  }, 0);
  const netProfit = rows.reduce((sum, item) => {
    const bet = Number(
      pick(item, ["bet_amount", "betAmount", "bet", "stake", "amount"]) || 0,
    );
    const win = Number(
      pick(item, ["win_amount", "winAmount", "win", "payout", "prize"]) || 0,
    );
    return sum + (win - bet);
  }, 0);

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0410] overflow-hidden relative pb-10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-64 h-64 bg-[#B45CFF]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-[#8E44AD]/10 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 py-6">
        <div className="max-w-md w-full mx-auto">
          {/* ===== Header ===== */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl ${accentGradient} ${accentGlow} border border-[#C77AFF] flex items-center justify-center flex-shrink-0`}
              >
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight tracking-wide">
                  Game History
                </h1>
                <p className="text-[11px] text-gray-400">
                  All your casino game bets
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchHistory(page)}
              className={`p-2.5 rounded-xl bg-[#150D22]/90 border border-[#2a1b3d] hover:border-[#B45CFF]/50 transition-colors ${accentGlow.replace(/,[^,]+,[^,]+/, "")}`}
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 text-[#B45CFF] ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* ===== Stats strip ===== */}
          {rows.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className={`${cardBase} rounded-2xl p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Gamepad2 size={11} className="text-[#B45CFF]" />
                  <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                    Bets
                  </span>
                </div>
                <p className="text-sm font-black text-white">{totalBets}</p>
              </div>
              <div className={`${cardBase} rounded-2xl p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet size={11} className="text-[#F1C40F]" />
                  <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                    Wagered
                  </span>
                </div>
                <p className="text-sm font-black text-white">
                  ₹{totalWagered.toLocaleString("en-IN")}
                </p>
              </div>
              <div className={`${cardBase} rounded-2xl p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {netProfit >= 0 ? (
                    <TrendingUp size={11} className="text-[#00E676]" />
                  ) : (
                    <TrendingDown size={11} className="text-red-400" />
                  )}
                  <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                    Net
                  </span>
                </div>
                <p
                  className={`text-sm font-black ${netProfit >= 0 ? "text-[#00E676]" : "text-red-400"}`}
                >
                  ₹{netProfit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}

          {/* ===== List ===== */}
          {loading && rows.length === 0 ? (
            <div className="flex items-center justify-center gap-2.5 bg-[#150D22]/90 border border-[#2a1b3d] rounded-2xl p-10">
              <Loader2 className="w-5 h-5 animate-spin text-[#B45CFF]" />
              <span className="text-sm text-gray-400 font-medium">
                Loading history...
              </span>
            </div>
          ) : rows.length === 0 ? (
            <div className="relative bg-[#150D22]/90 border border-[#2a1b3d] rounded-3xl p-10 text-center overflow-hidden">
              <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 w-40 h-32 bg-[#7418F5]/20 rounded-full blur-2xl" />
              <div className="relative">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl border border-[#B45CFF]/30 bg-[#B45CFF]/10 flex items-center justify-center`}
                >
                  <Gamepad2 className="w-8 h-8 text-[#B45CFF]/70" />
                </div>
                <p className="text-sm font-black text-white tracking-wide">
                  No games played yet
                </p>
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                  Play games from the home page and your bets
                  <br />
                  will appear here.
                </p>
                {error && (
                  <p className="text-[11px] text-red-400 mt-3">{error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((item, index) => {
                const gameName =
                  pick(item, [
                    "game_name",
                    "gameName",
                    "game_title",
                    "name",
                    "game",
                  ]) || "Casino Game";

                const provider = pick(item, ["provider", "provider_name"]);

                const betAmount = Number(
                  pick(item, [
                    "bet_amount",
                    "betAmount",
                    "bet",
                    "stake",
                    "turnover",
                    "amount",
                  ]) || 0,
                );

                const winAmount = Number(
                  pick(item, [
                    "win_amount",
                    "winAmount",
                    "win",
                    "payout",
                    "prize",
                  ]) || 0,
                );

                const isWin = winAmount > betAmount;

                return (
                  <div
                    key={pick(item, ["_id", "id", "tx_id", "bet_id"]) || index}
                    className={`relative rounded-2xl ${cardBase} p-4 overflow-hidden transition-all duration-200 hover:border-[#B45CFF]/40`}
                  >
                    {/* Left accent bar */}
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                        isWin
                          ? "bg-gradient-to-b from-[#00E676] to-transparent"
                          : "bg-gradient-to-b from-red-500 to-transparent"
                      }`}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate tracking-wide">
                          {gameName}
                        </p>
                        {provider && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {String(provider)}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest flex-shrink-0 ${
                          isWin
                            ? "text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30"
                            : "text-red-400 bg-red-500/10 border border-red-500/30"
                        }`}
                      >
                        {isWin ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isWin ? "WIN" : "BET"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className={statBox}>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                          Bet
                        </p>
                        <p className="text-xs font-black text-white truncate mt-0.5">
                          ₹{betAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className={statBox}>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                          Win
                        </p>
                        <p
                          className={`text-xs font-black truncate mt-0.5 ${isWin ? "text-[#00E676]" : "text-gray-300"}`}
                        >
                          ₹{winAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className={statBox}>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                          Net
                        </p>
                        <p
                          className={`text-xs font-black truncate mt-0.5 ${winAmount - betAmount >= 0 ? "text-[#00E676]" : "text-red-400"}`}
                        >
                          ₹{(winAmount - betAmount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(
                        pick(item, [
                          "created_at",
                          "createdAt",
                          "date",
                          "bet_time",
                          "timestamp",
                        ]),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== Pagination ===== */}
          {rows.length > 0 && (
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-5 py-2.5 rounded-xl bg-[#150D22]/90 border border-[#2a1b3d] text-xs font-bold text-gray-300 hover:border-[#B45CFF]/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">
                Page {page}
              </span>
              <button
                type="button"
                disabled={loading || rows.length < 20}
                onClick={() => setPage((p) => p + 1)}
                className="px-5 py-2.5 rounded-xl bg-[#150D22]/90 border border-[#2a1b3d] text-xs font-bold text-gray-300 hover:border-[#B45CFF]/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
