// pages/ResultControl.jsx
// Period-specific authorized result management + audit trail.
// Admin exact period ke liye result (0-9) lock karta hai.
// Backend: /bet/admin/period-results (adminProtect secured)
import React, { useEffect, useState } from "react";
import {
  Shield,
  Loader2,
  Save,
  Trash2,
  Lock,
  Info,
  History as HistoryIcon,
  CheckCircle2,
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

// Number -> colour/size mapping (backend ke deriveAttributes jaisa hi)
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
  const [period, setPeriod] = useState("");
  const [result, setResult] = useState("");
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!period.trim() || !/^\d+$/.test(period.trim())) {
      toast.error("Please enter a valid period number");
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
        period: period.trim(),
        result: Number(result),
      });
      toast.success(data?.message || "Result locked");
      setPeriod("");
      setResult("");
      await load();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to lock result",
      );
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
            Exact <strong>period number</strong> ke liye expected result lock
            karo. Timer complete hone par wahi number process hoga — Size aur
            Color automatic derive honge (7 → Big / Green). Result process
            hone ke baad config <strong>consumed</strong> mark ho jata hai.
            Closed periods modify nahi ho sakte. Har action audit-logged hai.
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

        {/* Period input */}
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Period Number
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value.replace(/[^\d]/g, ""))
          }
          placeholder="e.g. 16360430"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 bg-slate-50"
        />

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
                className={`h-12 rounded-xl transition-all ${
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
          disabled={saving}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          Lock Result for Period
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
