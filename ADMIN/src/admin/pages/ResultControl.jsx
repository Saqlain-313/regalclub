// pages/ResultControl.jsx
// Period-specific authorized result management + audit trail.
// Admin locks the expected result (0-9) for the LIVE pending period.
// The current period is fetched from the server (source of truth) and
// auto-resets when the next period starts. Audit trail kept below.
// Backend: /bet/admin/period-results + /bet/current-period (admin secured)
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Shield,
  Loader2,
  Lock,
  Trash2,
  Info,
  History as HistoryIcon,
  CheckCircle2,
  RefreshCw,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../redux/api";

const GAMES = [
  { value: 10, label: "Wingo 30S", field: "wingo10" },
  { value: 1, label: "Wingo 1M", field: "wingo" },
  { value: 3, label: "Wingo 3M", field: "wingo3" },
  { value: 5, label: "Wingo 5M", field: "wingo5" },
];

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Number -> colour/size mapping (same as backend deriveAttributes)
const numberMeta = (n) => {
  if (n === 0) return { colours: "Red + Violet", size: "Small" };
  if (n === 5) return { colours: "Green + Violet", size: "Big" };
  return {
    colours: [1, 3, 7, 9].includes(n) ? "Green" : "Red",
    size: n >= 5 ? "Big" : "Small",
  };
};

const ResultControl = () => {
  const [game, setGame] = useState(10);
  const [result, setResult] = useState("");
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live period state (server-driven)
  const [livePeriod, setLivePeriod] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodError, setPeriodError] = useState("");

  // ===== ENTER PERIOD MODE =====
  // Admin kisi future period ka result pehle se set kar sakta hai.
  // Period aane par result automatically apply ho jata hai.
  const [useEnteredPeriod, setUseEnteredPeriod] = useState(false);
  const [enteredPeriod, setEnteredPeriod] = useState("");

  // Local ticking value — keeps countdown smooth between server syncs
  const tickRef = useRef(null);
  const secondsRef = useRef(0);
  secondsRef.current = secondsLeft;

  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/bet/admin/period-results");
      if (data?.configs) setConfigs(data.configs);
    } catch {
      toast.error("Failed to load result configs");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH LIVE PENDING PERIOD (server is source of truth)
  // ======================================================
  const fetchCurrentPeriod = useCallback(
    async (targetGame = game) => {
      setPeriodLoading(true);
      setPeriodError("");
      try {
        const { data } = await api.get("/bet/current-period", {
          params: { typeid: targetGame },
        });
        setLivePeriod(String(data?.period || ""));
        setSecondsLeft(Number(data?.secondsRemaining) || 0);
      } catch (error) {
        setLivePeriod("");
        setPeriodError(
          error?.response?.data?.message ||
            "No pending period. Waiting for the next one...",
        );
      } finally {
        setPeriodLoading(false);
      }
    },
    [game],
  );

  useEffect(() => {
    load();
  }, []);

  // Refetch period whenever the selected game changes
  useEffect(() => {
    fetchCurrentPeriod(game);
  }, [game, fetchCurrentPeriod]);

  // Smooth 1s countdown; resync with server when the period rolls over
  useEffect(() => {
    tickRef.current = setInterval(() => {
      if (secondsRef.current > 0) {
        setSecondsLeft((s) => Math.max(0, s - 1));
      }
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, []);

  // When countdown reaches 0 (or stays 0 too long), resync with server
  useEffect(() => {
    if (secondsLeft > 0) return;

    const resync = setTimeout(() => {
      fetchCurrentPeriod(game);
    }, 1500);

    return () => clearTimeout(resync);
  }, [secondsLeft, game, fetchCurrentPeriod]);

  // Period jo lock hogi — entered (future) ya live current period
  const targetPeriod = useEnteredPeriod
    ? String(enteredPeriod).trim()
    : livePeriod;

  const save = async () => {
    if (!targetPeriod) {
      toast.error(
        useEnteredPeriod
          ? "Please enter a period number"
          : "No active period right now. Please wait for the next one or use Enter Period."
      );
      return;
    }
    if (!/^\d+$/.test(targetPeriod)) {
      toast.error("Period must be a number");
      return;
    }
    if (result === "" || result === null) {
      toast.error("Please select a result (0-9)");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put("/bet/admin/period-results", {
        typeid: game,
        period: targetPeriod,
        result: Number(result),
      });
      toast.success(data?.message || "Result locked");
      setResult("");
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to lock result");
    } finally {
      setSaving(false);
    }
  };

  const clearConfig = async (configGame, configPeriod) => {
    try {
      const fieldGame = GAMES.find((g) => g.field === configGame);
      const { data } = await api.delete("/bet/admin/period-results", {
        data: { typeid: fieldGame?.value, period: configPeriod },
      });
      toast.success(data?.message || "Cleared");
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to clear");
    }
  };

  const gameMeta = GAMES.find((g) => g.value === game);

  // Countdown display mm:ss
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 flex items-center gap-2">
        <Shield className="text-indigo-600" />
        Result Control
      </h1>

      {/* ============ LOCK NEW RESULT ============ */}
      <div className="bg-white rounded-lg shadow p-5 mb-6 max-w-3xl">
        <div className="flex items-start gap-2 mb-5 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            The <strong>live period</strong> is fetched automatically from the
            server. Pick the expected result and lock it before the timer
            completes — Size and Color derive automatically (7 → Big / Green).
            When the period completes and the next one starts, the panel resets
            and you set the result again. Closed periods cannot be modified.
            Every action is audit-logged.
          </p>
        </div>

        {/* Game select */}
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Game
        </label>
        <select
          value={game}
          onChange={(e) => setGame(Number(e.target.value))}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 bg-slate-50 cursor-pointer"
        >
          {GAMES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>

        {/* Live period (read-only, auto-fetched) */}
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Current Period (auto)
        </label>

        {periodLoading && !livePeriod ? (
          <div className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-1 bg-slate-50 text-slate-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Fetching live period...
          </div>
        ) : livePeriod ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50">
              <span className="text-sm font-black text-slate-800 font-mono tracking-wider">
                {livePeriod}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {gameMeta?.label}
              </span>
            </div>

            {/* Countdown badge */}
            <div
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-black font-mono ${
                secondsLeft <= 5 && secondsLeft > 0
                  ? "bg-red-50 border-red-300 text-red-600"
                  : "bg-emerald-50 border-emerald-300 text-emerald-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              {mm}:{ss}
            </div>

            <button
              type="button"
              onClick={() => fetchCurrentPeriod(game)}
              title="Resync period"
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full border border-amber-200 rounded-xl px-4 py-2.5 text-sm mb-1 bg-amber-50 text-amber-700 flex items-center justify-between gap-2">
            <span>{periodError || "No pending period"}</span>
            <button
              type="button"
              onClick={() => fetchCurrentPeriod(game)}
              className="text-[11px] font-bold text-amber-800 underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {livePeriod && secondsLeft > 0 && secondsLeft <= 5 && (
          <p className="text-[11px] text-red-500 font-semibold mb-4 -mt-2">
            Hurry up — this period is about to complete!
          </p>
        )}

        {/* ===== ENTER PERIOD (future pre-set) ===== */}
        <div className="mb-4 border border-indigo-200 bg-indigo-50/60 rounded-xl p-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useEnteredPeriod}
              onChange={(e) => {
                setUseEnteredPeriod(e.target.checked);
                if (!e.target.checked) setEnteredPeriod("");
              }}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
              Enter Period (pre-set for a future period)
            </span>
          </label>

          {useEnteredPeriod && (
            <>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter future period number, e.g. 20261002100051234"
                value={enteredPeriod}
                onChange={(e) =>
                  setEnteredPeriod(e.target.value.replace(/[^\d]/g, ""))
                }
                className="w-full mt-2.5 border border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-mono bg-white outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Period aane par yahan set kiya gaya result{" "}
                <strong>automatically apply</strong> ho jayega — instant (30s)
                aur timer (1M / 3M / 5M) dono games ke liye. Past period reject
                ho jayegi.
              </p>
            </>
          )}
        </div>

        {/* Result picker */}
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Expected Result
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
          {NUMBERS.map((n) => {
            const selected = result !== "" && Number(result) === n;
            const meta = numberMeta(n);

            return (
              <button
                key={n}
                type="button"
                onClick={() => setResult(String(n))}
                disabled={!targetPeriod}
                className={`h-12 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  selected
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                    : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300"
                }`}
              >
                <span className="block text-sm font-black leading-none">
                  {n}
                </span>
                <span
                  className={`block text-[8px] mt-0.5 font-semibold ${
                    selected ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  {meta.size}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mapping preview */}
        {result !== "" && result !== null && (
          <p className="text-xs text-slate-500 mb-4">
            Result <strong>{result}</strong> →{" "}
            <strong>{numberMeta(Number(result)).colours}</strong> /{" "}
            <strong>{numberMeta(Number(result)).size}</strong>
          </p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving || !targetPeriod}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          Lock Result for{" "}
          {targetPeriod
            ? `Period ${targetPeriod}`
            : "Current Period"}
        </button>
      </div>

      {/* ============ CONFIG HISTORY / AUDIT ============ */}
      <div className="bg-white rounded-lg shadow p-5 max-w-3xl">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <HistoryIcon className="w-4 h-4 text-indigo-600" />
          Configured Results (Audit)
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : configs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No result configs yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {configs.map((c) => {
              const gameLabel =
                GAMES.find((g) => g.field === c.game)?.label || c.game;
              const consumed = Boolean(c.consumedAt);

              return (
                <div
                  key={c._id}
                  className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 ${
                    consumed
                      ? "border-slate-100 bg-slate-50 opacity-70"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">
                      {gameLabel} · Period {c.period}
                      {consumed && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-semibold text-green-600">
                          <CheckCircle2 size={11} /> Processed
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Result <strong>{c.result}</strong> ({c.color} / {c.size})
                      {" · "}
                      {c.action} by{" "}
                      <strong>{c.createdByMobile || "admin"}</strong> at{" "}
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!consumed && (
                    <button
                      type="button"
                      onClick={() => clearConfig(c.game, c.period)}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={12} />
                      Clear
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultControl;
