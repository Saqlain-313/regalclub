import { ArrowLeft, Crown, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchPublicBidResults,
  selectPublicBidResults,
} from "../redux/slices/publicBidSlice";

const DAYS_WINDOW = 20; // sirf last 20 days ka data dikhana hai

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

function ResultBall({ n }) {
  return (
    <span className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-200 to-amber-300 border border-amber-400/60 text-black text-xs font-extrabold flex items-center justify-center shadow-sm">
      {n}
    </span>
  );
}

// gameType ko readable column-header me convert karta hai (double-Patti -> Double Patti)
function formatGameTypeLabel(gameType) {
  if (!gameType) return "";
  return gameType
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function MarketDetailedResults() {
  const { marketId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showHowToRead, setShowHowToRead] = useState(false);

  const { results, loading, error } = useSelector(selectPublicBidResults);

  useEffect(() => {
    if (!marketId) return;
    // ⚠️ Bada limit bhej rahe hain taaki last 20 din ke saare draws
    // ek hi call me aa jayein, pagination ki wajah se kuch miss na ho
    dispatch(
      fetchPublicBidResults({
        marketId,
        status: "won",
        limit: 500,
      }),
    );
  }, [marketId, dispatch]);

  // Is market ke sirf last 20 days ke results
  const marketRowsLast20Days = useMemo(() => {
    const cutoff = Date.now() - DAYS_WINDOW * 24 * 60 * 60 * 1000;
    return (results || [])
      .filter((r) => r.marketId?._id === marketId)
      .filter((r) => new Date(r.createdAt).getTime() >= cutoff);
  }, [results, marketId]);

  // 🔑 Same draw/round ke saare gameType results ek row me group karo.
  // `nextOpenDate` alag-alag records me thoड़ा mismatch ho sakta hai,
  // isliye ab TIME-PROXIMITY clustering use kar rahe hain: jo results
  // ek dusre ke TIME_BUCKET_MINUTES ke andar aaye hain unhe same draw
  // maan kar ek hi absolute time (group ka sabse pehla result-time) ke
  // saath ek row me merge kar diya jaata hai.
  const TIME_BUCKET_MINUTES = 15;

  const drawRows = useMemo(() => {
    const sorted = [...marketRowsLast20Days].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );

    const groups = [];
    let currentGroup = [];

    sorted.forEach((row) => {
      if (currentGroup.length === 0) {
        currentGroup.push(row);
        return;
      }
      const lastRow = currentGroup[currentGroup.length - 1];
      const diffMinutes =
        (new Date(row.createdAt) - new Date(lastRow.createdAt)) / 60000;

      if (diffMinutes <= TIME_BUCKET_MINUTES) {
        currentGroup.push(row);
      } else {
        groups.push(currentGroup);
        currentGroup = [row];
      }
    });
    if (currentGroup.length) groups.push(currentGroup);

    const rows = groups.map((entries) => {
      // Absolute time = is draw-group ka sabse pehla result aane ka time
      const drawTime = entries[0].createdAt;
      const panna = entries.find((e) => e.gameType === "panna");
      const jodi = entries.find((e) => e.gameType === "jodi");
      const otherEntries = entries.filter(
        (e) => e.gameType !== "panna" && e.gameType !== "jodi",
      );

      return { key: drawTime, drawTime, panna, jodi, otherEntries };
    });

    return rows.sort((a, b) => new Date(b.drawTime) - new Date(a.drawTime));
  }, [marketRowsLast20Days]);

  // Dynamic extra columns (Panna/Jodi ke alawa jo bhi gameTypes is market
  // me maujood hain — Half Sangam, Full Sangam, First Digit, etc.)
  const extraColumns = useMemo(() => {
    const types = new Set();
    drawRows.forEach((d) =>
      d.otherEntries.forEach((e) => types.add(e.gameType)),
    );
    return Array.from(types);
  }, [drawRows]);

  const marketName =
    state?.marketName || marketRowsLast20Days[0]?.marketId?.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white [&_*::-webkit-scrollbar]:hidden [&_*]:[scrollbar-width:none]">
      <div className="max-w-md mx-auto px-3 pb-8 pt-3 space-y-4">
        {/* ===== Header ===== */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500" fill="currentColor" />
            <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
              {marketName ? marketName.toUpperCase() : "MARKET RESULTS"}
            </h1>
          </div>
        </div>

        {/* ===== Chart card ===== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
              MATKA CHART (LAST {DAYS_WINDOW} DAYS)
            </h3>
            <button
              onClick={() => setShowHowToRead((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-600"
            >
              <Info className="w-3.5 h-3.5" />
              How to Read Chart
            </button>
          </div>

          {showHowToRead && (
            <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-800">RESULT</span> = 3-digit
              panna balls, <span className="font-bold text-gray-800">JODI</span>{" "}
              = 2-digit jodi number,{" "}
              <span className="font-bold text-gray-800">PANA</span> = full panna
              number. Baaki columns us round ke corresponding game-type ka
              result dikhate hain.
            </div>
          )}

          {/* Horizontal scroll wrapper — extra columns dynamic hain isliye
              table width fixed nahi rakhi ja sakti */}
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse"
              style={{ minWidth: `${420 + extraColumns.length * 96}px` }}
            >
              <thead>
                <tr className="border-b-2 border-amber-100 bg-amber-50/40">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap">
                    Time
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap border-l border-amber-100/70">
                    Result
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap border-l border-amber-100/70">
                    Jodi
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap">
                    Pana
                  </th>
                  {extraColumns.map((type) => (
                    <th
                      key={type}
                      className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap border-l border-amber-100/70"
                    >
                      {formatGameTypeLabel(type)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={5 + extraColumns.length}
                      className="px-5 py-10 text-center text-xs text-gray-400"
                    >
                      Loading results…
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td
                      colSpan={5 + extraColumns.length}
                      className="px-5 py-10 text-center text-xs text-red-500"
                    >
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && drawRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5 + extraColumns.length}
                      className="px-5 py-10 text-center text-xs text-gray-400"
                    >
                      No results in the last {DAYS_WINDOW} days
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  drawRows.map((draw, i) => (
                    <tr
                      key={draw.key}
                      className={`border-b border-gray-100 last:border-b-0 transition-colors hover:bg-amber-50/40 ${
                        i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                      }`}
                    >
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-900">
                          {formatDate(draw.drawTime)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className="text-xs text-gray-500">
                          {formatTime(draw.drawTime)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle border-l border-gray-100">
                        <span className="flex gap-1.5">
                          {draw.panna ? (
                            String(draw.panna.resultNumber)
                              .split("")
                              .map((digit, idx) => (
                                <ResultBall key={idx} n={digit} />
                              ))
                          ) : (
                            <span className="text-xs text-gray-300">--</span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle border-l border-gray-100 whitespace-nowrap">
                        <span className="text-sm font-extrabold text-gray-900 tracking-wide">
                          {draw.jodi?.resultNumber || "--"}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className="text-sm font-extrabold text-gray-900 tracking-wide">
                          {draw.panna?.resultNumber || "--"}
                        </span>
                      </td>
                      {extraColumns.map((type) => {
                        const entry = draw.otherEntries.find(
                          (e) => e.gameType === type,
                        );
                        return (
                          <td
                            key={type}
                            className="px-5 py-4 align-middle border-l border-gray-100 whitespace-nowrap"
                          >
                            <span className="text-sm font-bold text-gray-600">
                              {entry?.resultNumber || "--"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
