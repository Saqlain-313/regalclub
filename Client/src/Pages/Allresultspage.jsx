import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Crown,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// 👇 adjust this path to wherever publicBidSlice actually lives in your project
import { Link, useNavigate } from "react-router-dom";
import {
  fetchPublicBidResults,
  selectPublicBidResults,
} from "../redux/slices/publicBidSlice";

// 🔶 MOCK — Powerball reducer/API not wired yet. Swap for the real slice +
// thunk once that endpoint exists. Structure kept intentionally similar so
// the swap is a drop-in later.
const MOCK_POWERBALL = [
  {
    id: "au",
    country: "AUSTRALIA POWERBALL",
    drawLabel: "Draw #1423",
    balls: [12, 23, 31, 36, 44],
    bonusBall: 7,
    bonusColor: "bg-purple-600",
    drawnAt: "10 Aug 2026, 02:30 PM",
    status: "live",
  },
  {
    id: "us",
    country: "USA POWERBALL",
    drawLabel: "Draw #1598",
    balls: [5, 18, 27, 40, 53],
    bonusBall: 19,
    bonusColor: "bg-red-600",
    drawnAt: "10 Aug 2026, 05:59 AM",
    status: "live",
  },
];

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Real field now — API sends row.nextOpenDate. Shown as date + time since
// it can land on a different day than createdAt (e.g. next day's opening).
function formatNextOpen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function LiveDot({ label = "LIVE" }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {label}
    </span>
  );
}

function ResultBall({ n }) {
  return (
    <span className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-200 to-amber-300 border border-amber-400/60 text-black text-xs font-bold flex items-center justify-center shadow-sm">
      {n}
    </span>
  );
}

function PowerBall({
  n,
  colorClass = "bg-gray-100 text-gray-700 border-gray-200",
}) {
  return (
    <span
      className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center border shadow-sm ${colorClass}`}
    >
      {n}
    </span>
  );
}

export default function AllResultsPage() {
  const [activeTab, setActiveTab] = useState("matka"); // 'matka' | 'powerball'
  const [activeMarketId, setActiveMarketId] = useState("all");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { results, markets, loading, error } = useSelector(
    selectPublicBidResults,
  );

  useEffect(() => {
    // ⚠️ Backend paginated hai (default limit ~20), lekin is summary page ke
    // liye hume har market ka latest 3-digit result chahiye — jo kabhi
    // page 2/3 me bhi ho sakta hai. Isliye ek hi call me bada limit bhej
    // rahe hain taaki koi bhi market ka result miss na ho.
    dispatch(
      fetchPublicBidResults({
        marketId: activeMarketId,
        status: "won",
        limit: 200,
      }),
    );
  }, [activeMarketId, dispatch]);

  const marketFilters = useMemo(
    () => [{ _id: "all", name: "All Markets" }, ...(markets || [])],
    [markets],
  );

  const rawRows = results || [];

  // 🔑 Sirf 3-digit wale result rakho (panna/patti type — jodi "56",
  // sangam "111-456" jaise non-3-digit results yahan exclude ho jayenge),
  // aur har market ka sirf sabse latest wala ek hi result nikaalo.
  const bidRows = useMemo(() => {
    const latestPerMarket = new Map();

    rawRows.forEach((row) => {
      const marketKey = row.marketId?._id;
      if (!marketKey) return;

      const existing = latestPerMarket.get(marketKey);
      if (!existing || new Date(row.createdAt) > new Date(existing.createdAt)) {
        latestPerMarket.set(marketKey, row);
      }
    });

    // 👇 Base ab `markets[]` (API ka full markets list) hai, results[] nahi —
    // isliye jin markets (6club, 5club, 2club, etc.) ka abhi koi won 3-digit
    // result nahi aaya, wo bhi list me row ke saath dikhenge (pending state).
    // Agar "All Markets" chip select hai to sabhi markets, warna sirf wahi
    // ek market jo chip me select kiya gaya hai.
    const marketsToShow =
      activeMarketId === "all"
        ? markets || []
        : (markets || []).filter((m) => m._id === activeMarketId);

    const rows = marketsToShow.map((m) => {
      const resultRow = latestPerMarket.get(m._id);
      if (resultRow) return resultRow;
      // Placeholder jab market ka koi 3-digit result abhi tak nahi aaya
      return {
        _id: `pending-${m._id}`,
        marketId: m,
        resultNumber: null,
        createdAt: null,
        nextOpenDate: null,
        isPending: true,
      };
    });

    return rows.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [rawRows, markets, activeMarketId]);

  // LIVE button / row click -> us market ka detailed page (sare game types)
  const handleOpenMarketDetails = (row) => {
    if (!row.marketId?._id) return;
    navigate(`/market-results/${row.marketId._id}`, {
      state: { marketName: row.marketId?.name },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white [&_*::-webkit-scrollbar]:hidden [&_*]:[scrollbar-width:none]">
      <div className="max-w-md mx-auto px-3 pb-8 pt-3 space-y-4">
        {/* ===== Hero banner ===== */}
        <div className="relative overflow-hidden">
          <img
            src="https://i.ibb.co/S4rcxcKz/banner-1.png"
            alt="Banner"
            className="w-full h-auto object-cover block"
          />
        </div>
        {/* ===== Tab toggle ===== */}
        <div className="flex bg-white rounded-2xl border border-gray-100 shadow-sm p-1 gap-1">
          <button
            onClick={() => setActiveTab("matka")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === "matka"
                ? "bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black"
                : "text-gray-500"
            }`}
          >
            <Crown
              className="w-4 h-4"
              fill={activeTab === "matka" ? "currentColor" : "none"}
            />
            MATKA RESULTS
          </button>
          <button
            onClick={() => setActiveTab("powerball")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === "powerball"
                ? "bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black"
                : "text-gray-500"
            }`}
          >
            <Zap
              className="w-4 h-4"
              fill={activeTab === "powerball" ? "currentColor" : "none"}
            />
            POWERBALL RESULTS
          </button>
        </div>
        {/* ===== Market filter chips (dynamic, from markets[] in publicBid state) ===== */}
        {activeTab === "matka" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {marketFilters.map((m) => (
              <button
                key={m._id}
                onClick={() => setActiveMarketId(m._id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${
                  activeMarketId === m._id
                    ? "bg-amber-50 border-amber-400 text-amber-700"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                {m.name.toUpperCase()}
              </button>
            ))}
            <button className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 flex items-center justify-center shadow">
              <Trophy className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
        {/* ===== Live Matka Results table — 1 result per market, 3-digit only ===== */}

        {activeTab === "matka" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" fill="currentColor" />
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                  LIVE MATKA RESULTS
                </h3>
              </div>

              <LiveDot />
            </div>

            {/* Table Header */}
            <div className="px-4 pb-1 grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] items-center text-[10px] font-bold text-gray-400 tracking-wide">
              <span>MARKET</span>
              <span>TIME</span>
              <span className="text-center">RESULT</span>
              <span className="text-center ml-3">STATUS</span>
            </div>

            {/* Results */}
            <div className="mt-1">
              {loading && (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  Loading results…
                </div>
              )}

              {error && (
                <div className="px-4 py-6 text-center text-xs text-red-500">
                  {error}
                </div>
              )}

              {!loading && !error && bidRows.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  No results yet
                </div>
              )}

              {!loading &&
                !error &&
                bidRows.map((row, i) => (
                  <button
                    key={row.marketId?._id || row._id || i}
                    onClick={() =>
                      !row.isPending && handleOpenMarketDetails(row)
                    }
                    disabled={row.isPending}
                    className={`
              w-full
              grid
              grid-cols-[1.2fr_0.8fr_1fr_0.8fr]
              items-center
              gap-2
              px-4
              py-3
              text-left
              transition-colors
              ${
                row.isPending
                  ? "opacity-60 cursor-default"
                  : "hover:bg-gray-50 active:bg-gray-100"
              }
              ${i !== bidRows.length - 1 ? "border-b border-gray-100" : ""}
            `}
                  >
                    {/* Market */}
                    <span className="text-sm font-bold text-gray-900 truncate">
                      {row.marketId?.name || row.marketName || "--"}
                    </span>

                    {/* Time */}
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {row.isPending ? "--" : formatTime(row.createdAt)}
                    </span>

                    {/* Result */}
                    {row.isPending ? (
                      <span className="text-[11px] text-gray-400 italic">
                        Waiting…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        {String(row.resultNumber ?? "--")
                          .split("")
                          .map((digit, idx) => (
                            <ResultBall key={idx} n={digit} />
                          ))}
                      </span>
                    )}

                    {/* Status */}
                    <span className="flex items-center justify-end gap-1">
                      {row.isPending ? (
                        <span className="text-[10px] font-bold text-gray-400">
                          PENDING
                        </span>
                      ) : (
                        <>
                          <LiveDot />

                          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        </>
                      )}
                    </span>
                  </button>
                ))}
            </div>

            {/* Chart Button */}
            <div className="p-3">
              <Link
                to="/chartanalysis"
                className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          py-3.5
          rounded-xl
          bg-gradient-to-b
          from-[#FFF19A]
          via-[#FFC928]
          to-[#D99200]
          border
          border-[#FFD75A]
          shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)]
          text-black
          text-sm
          font-extrabold
        "
              >
                <BarChart3 className="w-4 h-4" />
                VIEW DETAILED MATKA CHART
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
        {/* ===== Powerball Results (still mock — no backend endpoint yet) ===== */}
        {activeTab === "powerball" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" fill="currentColor" />
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                  POWERBALL RESULTS
                </h3>
              </div>
              <LiveDot />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MOCK_POWERBALL.map((draw) => (
                <div
                  key={draw.id}
                  className="rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center text-center gap-2"
                >
                  <div>
                    <p className="text-[11px] font-extrabold text-gray-900 leading-tight">
                      {draw.country}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {draw.drawLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {draw.balls.map((n) => (
                      <PowerBall key={n} n={n} />
                    ))}
                    <PowerBall
                      n={draw.bonusBall}
                      colorClass={`${draw.bonusColor} text-white border-transparent`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">{draw.drawnAt}</p>
                  <LiveDot />
                  <button className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-amber-400 text-amber-600 text-[11px] font-bold">
                    VIEW FULL RESULT
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black text-sm font-extrabold">
              VIEW ALL POWERBALL RESULTS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
