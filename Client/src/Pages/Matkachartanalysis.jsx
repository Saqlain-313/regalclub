import {
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronDown,
  Crown,
  Info,
  Landmark,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllResults } from "../redux/slices/publicmatkaResult";

const GAME_TYPES = [
  ["single", "Single"],
  ["single-Patti", "Single Patti"],
  ["double-Patti", "Double Patti"],
  ["triple-Patti", "Triple Patti"],
  ["jodi", "Jodi"],
  ["panna", "Panna"],
  ["half-sangam", "Half Sangam"],
  ["full-sangam", "Full Sangam"],
  ["last-digit", "Last Digit"],
  ["first-digit", "First Digit"],
];

const CHART_TABS = [
  ["Chart", "Chart"],
  ...GAME_TYPES.map(([key, label]) => [key, label]),
];

function ResultBall({ n, size = "md" }) {
  const sizeClass =
    size === "lg"
      ? "w-11 h-11 text-sm"
      : size === "sm"
        ? "w-6 h-6 text-[10px]"
        : "w-8 h-8 text-xs";
  return (
    <span
      className={`${sizeClass} rounded-full bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200]
border border-[#FFD75A]
shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black font-bold flex items-center justify-center shrink-0`}
    >
      {n}
    </span>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      LIVE
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatNextOpen(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) +
    ", " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
}
function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
function formatGameType(gt = "") {
  return gt.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getGameTypeValue(row, key) {
  const value = row?.winningNumber?.[key];
  return value === null || value === undefined || value === ""
    ? null
    : String(value);
}

function groupResultsByDate(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const dateValue = row?.resultDate || row?.marketDate || row?.createdAt;
    const key = dateValue
      ? new Date(dateValue).toISOString().slice(0, 10)
      : "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  });
  return [...map.entries()].sort((a, b) => new Date(b[0]) - new Date(a[0]));
}

// resultNumber can legitimately be null (bid still "pending", result not
// declared yet) — never String(null) that, it prints "null" and renders
// N/U/L/L balls. Use this everywhere resultNumber is rendered.
function resultDigits(resultNumber) {
  if (
    resultNumber === null ||
    resultNumber === undefined ||
    resultNumber === ""
  ) {
    return null;
  }
  return String(resultNumber).split("");
}

// half-sangam / full-sangam results come as "112-456" — split on the dash
// first and render each side as its own group of balls, with the dash as a
// plain text separator (not a ball). Splitting the whole string character-
// by-character used to turn "-" into a ball and blow the row's width out,
// causing it to overlap the row below it.
function ResultCell({ resultNumber }) {
  if (
    resultNumber === null ||
    resultNumber === undefined ||
    resultNumber === ""
  ) {
    return <span className="text-[10px] text-gray-400">Pending</span>;
  }

  const groups = String(resultNumber).split("-");

  return (
    <div className="flex flex-wrap items-center gap-1">
      {groups.map((group, gIdx) => (
        <span key={gIdx} className="flex items-center gap-1">
          {gIdx > 0 && (
            <span className="text-gray-300 text-[10px] leading-none">-</span>
          )}
          <span className="flex gap-0.5">
            {group.split("").map((digit, dIdx) => (
              <ResultBall key={dIdx} n={digit} size="sm" />
            ))}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function MatkaChartAnalysis() {
  const [activeMarketId, setActiveMarketId] = useState("all");
  const [activeChartTab, setActiveChartTab] = useState("Chart");

  const dispatch = useDispatch();
  const { results, loading, error } = useSelector(
    (state) => state.publicmatkaResult,
  );

  useEffect(() => {
    dispatch(getAllResults());
  }, [dispatch]);

  const marketFilters = useMemo(() => {
    const unique = new Map();
    (results || []).forEach((row) => {
      const id = row?.marketId?._id || row?.marketId || row?.id || row?._id;
      const name = row?.marketName || row?.marketId?.name || "Market";
      if (id) unique.set(String(id), { _id: String(id), name });
    });
    return [{ _id: "all", name: "All Markets" }, ...unique.values()];
  }, [results]);
  const activeMarketName =
    marketFilters.find((m) => m._id === activeMarketId)?.name || "All Markets";

  const rows = useMemo(() => {
    const allRows = results || [];
    if (activeMarketId === "all") return allRows;
    return allRows.filter(
      (row) =>
        String(row?.marketId?._id || row?.marketId || row?.id || row?._id) ===
        String(activeMarketId),
    );
  }, [results, activeMarketId]);

  // Most recent rows first — API already scopes this to the selected market.
  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [rows],
  );

  const latestRow = sortedRows[0];
  const latestJodiRow = sortedRows.find((r) => getGameTypeValue(r, "jodi"));
  const latestPanaRow = sortedRows.find((r) => getGameTypeValue(r, "panna"));

  const dateGroups = useMemo(
    () => groupResultsByDate(sortedRows),
    [sortedRows],
  );

  // Game type statistics are derived directly from winningNumber in /api/results.
  // Count only game types that actually have a declared value.
  const effectiveGameTypeStats = useMemo(() => {
    const counts = new Map();

    (rows || []).forEach((row) => {
      GAME_TYPES.forEach(([key, label]) => {
        const value = getGameTypeValue(row, key);
        if (value !== null) {
          counts.set(key, {
            _id: key,
            label,
            count: (counts.get(key)?.count || 0) + 1,
          });
        }
      });
    });

    return [...counts.values()].sort((a, b) => b.count - a.count);
  }, [rows]);

  const maxGameTypeCount = Math.max(
    1,
    ...effectiveGameTypeStats.map((g) => g.count),
  );

  // NUMBER FREQUENCY — real count of each digit (0-9) across every
  // resultNumber currently loaded for this market.
  const numberFrequency = useMemo(() => {
    const counts = Array(10).fill(0);
    rows.forEach((r) => {
      String(r.resultNumber || "")
        .split("")
        .forEach((ch) => {
          const d = Number(ch);
          if (!Number.isNaN(d)) counts[d] += 1;
        });
    });
    return counts.map((times, n) => ({ n, times }));
  }, [rows]);
  const maxFrequency = Math.max(1, ...numberFrequency.map((f) => f.times));

  // TOP OPEN (jodi / pana) — group by the declared number, count occurrences,
  // take the top 4. Reflects only what's in the currently loaded page of
  // results (pagination.limit), same as the results table below.
  const buildTopOpen = (digitLen) => {
    const map = new Map();
    rows.forEach((r) => {
      const key = String(r.resultNumber || "");
      if (key.length !== digitLen) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()]
      .map(([n, times]) => ({ n, times }))
      .sort((a, b) => b.times - a.times)
      .slice(0, 4);
  };
  const jodiTopOpen = useMemo(() => buildTopOpen(2), [rows]);
  const panaTopOpen = useMemo(() => buildTopOpen(3), [rows]);

  const latestResultValue = latestRow
    ? getGameTypeValue(latestRow, "triple-Patti") ||
      getGameTypeValue(latestRow, "panna") ||
      getGameTypeValue(latestRow, "jodi") ||
      getGameTypeValue(latestRow, "single")
    : null;
  const latestResultDigits = latestResultValue
    ? resultDigits(latestResultValue)
    : null;

  return (
    <div className="min-h-screen bg-white [&_*::-webkit-scrollbar]:hidden [&_*]:[scrollbar-width:none]">
      <div className="max-w-md mx-auto px-3 pb-8 pt-4 space-y-4">
        {/* ===== Header ===== */}
        <div>
          <div className="flex items-center gap-1.5">
            <Crown
              className="w-5 h-5 text-amber-500 shrink-0"
              fill="currentColor"
            />
            <h1 className="text-base xs:text-lg font-black text-gray-900 tracking-tight leading-tight">
              MATKA CHART &amp; ANALYSIS
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeMarketName} Market
          </p>
        </div>

        {/* ===== Market selector row (dynamic, from markets[] in publicBid state) ===== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-3 px-3">
          {marketFilters
            .filter((m) => m._id !== "all")
            .map((m) => (
              <button
                key={m._id}
                onClick={() => setActiveMarketId(m._id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${
                  activeMarketId === m._id
                    ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                {m.name}
              </button>
            ))}
          <button
            onClick={() => setActiveMarketId("all")}
            className={`shrink-0 flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${
              activeMarketId === "all"
                ? "bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-white"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            All Markets
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ===== Market summary card ===== */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/40 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200]
border border-[#FFD75A]
shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] flex items-center justify-center"
              >
                <Landmark className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-gray-900 truncate">
                    {activeMarketName.toUpperCase()}{" "}
                    {activeMarketId !== "all" ? "MARKET" : ""}
                  </span>
                  <LiveBadge />
                </div>
                <p className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                  {latestRow ? formatDate(latestRow.createdAt) : "—"}
                  <Calendar className="w-3 h-3 ml-1 shrink-0" />
                  {latestRow ? formatTime(latestRow.createdAt) : "—"}
                </p>
              </div>
            </div>
            <button className="shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-700 text-[11px] font-bold shadow-sm whitespace-nowrap">
              View Result
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-amber-100 grid grid-cols-3 divide-x divide-amber-100 overflow-hidden">
            {/* Last result */}
            <div className="p-2.5 flex flex-col items-center">
              <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 tracking-wide text-center">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                LAST RESULT
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              </span>
              <div className="flex gap-1 mt-2 flex-wrap justify-center">
                {latestResultDigits ? (
                  latestResultDigits.map((digit, i) => (
                    <ResultBall key={i} n={digit} size="lg" />
                  ))
                ) : (
                  <span className="text-[11px] text-gray-400 py-3">
                    {latestRow ? "Pending" : "No data"}
                  </span>
                )}
              </div>
              <div className="mt-3 px-1.5 py-1.5 rounded-lg bg-amber-50 text-center w-full">
                <p className="text-[9px] text-gray-500 font-semibold">
                  Next Open
                </p>
                <p className="text-[11px] font-extrabold text-gray-900 leading-tight">
                  {formatNextOpen(latestRow?.nextOpenDate)}
                </p>
              </div>
            </div>

            {/* Jodi + Pana */}
            <div className="p-2.5 flex flex-col items-center">
              <span className="text-[9px] font-bold text-gray-500 tracking-wide">
                JODI
              </span>
              <div className="flex gap-1.5 mt-2">
                {latestJodiRow ? (
                  <ResultBall
                    n={getGameTypeValue(latestJodiRow, "jodi")}
                    size="lg"
                  />
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </div>
              <span className="text-[9px] font-bold text-gray-500 tracking-wide mt-3">
                PANA
              </span>
              <div
                className="mt-2 px-2.5 py-1.5 rounded-full bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200]
border border-[#FFD75A]
shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black text-xs font-extrabold min-w-[2.75rem] text-center"
              >
                {latestPanaRow ? getGameTypeValue(latestPanaRow, "panna") : "—"}
              </div>
            </div>

            {/* Game type breakdown — replaces the fixed 0-4/4-8/8-9 panna
               ranges from the reference image, since that concept isn't
               derivable from bid records. Uses the real gameTypeStats the
               API already returns. */}
            <div className="p-2.5 flex flex-col">
              <span className="text-[9px] font-bold text-gray-500 tracking-wide text-center">
                GAME TYPE
              </span>
              <div className="mt-2 flex-1 flex flex-col justify-center gap-2">
                {(effectiveGameTypeStats || []).length === 0 && (
                  <span className="text-[10px] text-gray-400 text-center">
                    No data
                  </span>
                )}
                {(effectiveGameTypeStats || []).slice(0, 3).map((g) => {
                  const isMax = g.count === maxGameTypeCount;
                  return (
                    <div
                      key={g._id}
                      className="flex items-center justify-between text-[10px] gap-1"
                    >
                      <span className="text-gray-500 font-semibold truncate">
                        {g.label || formatGameType(g._id)}
                      </span>
                      <span
                        className={`font-extrabold shrink-0 ${isMax ? "text-red-500" : "text-gray-900"}`}
                      >
                        {g.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Chart tabs (was declared but never rendered before) ===== */}
        <div className="flex items-center gap-4 overflow-x-auto -mx-3 px-3 border-b border-gray-100">
          {CHART_TABS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveChartTab(value)}
              className={`shrink-0 pb-2.5 pt-1 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                activeChartTab === value
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {GAME_TYPES.some(([key]) => key === activeChartTab) ? (
          (() => {
            const activeGameType = GAME_TYPES.find(
              ([key]) => key === activeChartTab,
            );
            const activeGameTypeKey = activeGameType?.[0];
            const activeGameTypeLabel = activeGameType?.[1] || "Game Type";
            const filteredGameTypeRows = rows.filter((row) =>
              getGameTypeValue(row, activeGameTypeKey),
            );
            const groupedRows = groupResultsByDate(filteredGameTypeRows);

            return (
              <div className="rounded-2xl border border-gray-100 shadow-sm p-3">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div>
                    <p className="text-xs font-extrabold text-gray-900">
                      {activeGameTypeLabel.toUpperCase()} RESULTS
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Date Wise Results
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full shrink-0">
                    {filteredGameTypeRows.length} Results
                  </span>
                </div>

                {groupedRows.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No {activeGameTypeLabel.toLowerCase()} results yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupedRows.map(([dateKey, dateRows]) => (
                      <div
                        key={dateKey}
                        className="rounded-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-white border-b border-amber-100 flex items-center justify-between">
                          <p className="text-[11px] font-extrabold text-gray-800">
                            {formatDate(
                              dateRows[0]?.resultDate ||
                                dateRows[0]?.marketDate ||
                                dateRows[0]?.createdAt,
                            )}
                          </p>
                          <span className="text-[9px] text-gray-400">
                            {dateRows.length} Result
                            {dateRows.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        {dateRows.map((row) => {
                          const value = getGameTypeValue(
                            row,
                            activeGameTypeKey,
                          );
                          return (
                            <div
                              key={row._id}
                              className="p-3 border-b border-gray-50 last:border-0"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-extrabold text-gray-800 truncate">
                                    {row.marketName ||
                                      row.marketId?.name ||
                                      "Market"}
                                  </p>
                                  <p className="text-[9px] text-gray-400 mt-0.5">
                                    {row.marketId?.marketId ||
                                      row.digitType ||
                                      ""}
                                    {row.resultDate
                                      ? ` · ${formatTime(row.resultDate)}`
                                      : ""}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {String(value).includes("-") ? (
                                    <ResultCell resultNumber={value} />
                                  ) : (
                                    <div className="flex gap-1">
                                      {resultDigits(value)?.map(
                                        (digit, index) => (
                                          <ResultBall
                                            key={index}
                                            n={digit}
                                            size="sm"
                                          />
                                        ),
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        ) : activeChartTab !== "Chart" ? (
          <div className="rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-sm font-bold text-gray-700">
              {CHART_TABS.find(([value]) => value === activeChartTab)?.[1] ||
                activeChartTab}
            </p>
            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
        ) : (
          <>
            {/* ===== Results — real table, no horizontal scroll ===== */}
            <div className="rounded-2xl border border-gray-100 shadow-sm p-3">
              <div className="flex items-center justify-between mb-2 gap-2">
                <p className="text-xs font-extrabold text-gray-900">
                  MATKA CHART{" "}
                  <span className="font-medium text-gray-400">
                    (Last {rows.length} Results)
                  </span>
                </p>
                <button className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-gray-400 whitespace-nowrap">
                  <Info className="w-3.5 h-3.5" />
                  How to Read
                </button>
              </div>

              {loading && (
                <div className="py-6 text-center text-xs text-gray-400">
                  Loading results…
                </div>
              )}
              {error && (
                <div className="py-6 text-center text-xs text-red-500">
                  {error}
                </div>
              )}
              {!loading && !error && sortedRows.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-400">
                  No results yet
                </div>
              )}
              {!loading && !error && sortedRows.length > 0 && (
                <div className="space-y-3">
                  {dateGroups.map(([dateKey, dateRows]) => (
                    <div
                      key={dateKey}
                      className="rounded-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="px-3 py-2 bg-amber-50 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-extrabold text-gray-800">
                          {formatDate(
                            dateRows[0]?.resultDate ||
                              dateRows[0]?.marketDate ||
                              dateRows[0]?.createdAt,
                          )}
                        </p>
                        <span className="text-[9px] font-bold text-gray-400">
                          {dateRows.length} RESULT
                          {dateRows.length > 1 ? "S" : ""}
                        </span>
                      </div>
                      {dateRows.map((row) => (
                        <div
                          key={row._id}
                          className="p-3 border-t border-gray-50"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold text-gray-800 truncate">
                                {row.marketName ||
                                  row.marketId?.name ||
                                  "Market"}
                              </p>
                              <p className="text-[9px] text-gray-400">
                                {row.marketId?.marketId || ""} ·{" "}
                                {row.digitType || ""}
                              </p>
                            </div>
                            <span className="text-[9px] text-gray-400 shrink-0">
                              {formatTime(row.resultDate || row.createdAt)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                            {GAME_TYPES.map(([key, label]) => {
                              const value = getGameTypeValue(row, key);
                              if (!value) return null;
                              return (
                                <div
                                  key={key}
                                  className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2 py-1.5"
                                >
                                  <span className="text-[9px] font-semibold text-gray-500">
                                    {label}
                                  </span>
                                  <span className="text-[11px] font-extrabold text-gray-900">
                                    {value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== Number Frequency + Top Open — all derived from rows[] ===== */}
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <BarChart3 className="w-4 h-4 text-gray-700" />
                  <h3 className="text-xs font-extrabold text-gray-900 tracking-tight">
                    NUMBER FREQUENCY
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {numberFrequency.map((f) => (
                    <div key={f.n} className="flex items-center gap-2.5">
                      <span className="w-3 text-xs font-bold text-gray-700 shrink-0">
                        {f.n}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                          style={{
                            width: `${(f.times / maxFrequency) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 font-semibold w-14 text-right shrink-0">
                        {f.times} Times
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Star
                    className="w-4 h-4 text-amber-500"
                    fill="currentColor"
                  />
                  <h3 className="text-xs font-extrabold text-gray-900 tracking-tight">
                    JODI TOP OPEN
                  </h3>
                </div>
                {jodiTopOpen.length === 0 ? (
                  <p className="text-[11px] text-gray-400 mb-3">
                    No jodi results in this range
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {jodiTopOpen.map((j) => (
                      <div key={j.n} className="flex items-center gap-2">
                        <ResultBall n={j.n} size="lg" />
                        <span className="text-[11px] text-gray-500 font-semibold">
                          {j.times} Times
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold">
                  View All Jodi Chart
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Crown
                    className="w-4 h-4 text-amber-500"
                    fill="currentColor"
                  />
                  <h3 className="text-xs font-extrabold text-gray-900 tracking-tight">
                    PANA TOP OPEN
                  </h3>
                </div>
                {panaTopOpen.length === 0 ? (
                  <p className="text-[11px] text-gray-400 mb-3">
                    No pana results in this range
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {panaTopOpen.map((p) => (
                      <div key={p.n} className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1.5 rounded-full bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200]
border border-[#FFD75A]
shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] border-amber-400/60 text-black text-xs font-extrabold shrink-0"
                        >
                          {p.n}
                        </span>
                        <span className="text-[11px] text-gray-500 font-semibold">
                          {p.times} Times
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold">
                  View All Pana Chart
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== Upgrade banner (static, no data dependency) ===== */}
        <div className="rounded-2xl bg-gradient-to-r from-[#2a0e4d] via-[#3d1466] to-[#1a0a33] p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Trophy
              className="w-8 h-8 text-amber-300 shrink-0"
              fill="currentColor"
            />
            <div className="min-w-0">
              <p className="text-white text-xs font-extrabold leading-snug">
                GET ADVANCED CHARTS &amp; 100% ACCURATE ANALYSIS
              </p>
              <p className="text-amber-200/70 text-[11px] mt-0.5">
                Predict better, win bigger!
              </p>
            </div>
          </div>
          <button className="shrink-0 flex items-center gap-1 px-4 py-2.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-[#2a0e4d] text-xs font-extrabold shadow">
            Upgrade Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
