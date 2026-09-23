import { format } from "date-fns";
import { useEffect } from "react";
import { FaCrown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchPublicBidResults,
  selectPublicBidResults,
} from "../redux/slices/publicBidSlice";

const getGameTypeLabel = (type) => {
  const labels = {
    single: "Single",
    jodi: "Jodi",
    panna: "Panna",
    "half-sangam": "Half Sangam",
    "full-sangam": "Full Sangam",
    "last-digit": "Last Digit",
    "first-digit": "First Digit",
  };
  return labels[type] || type;
};

const LiveResults = () => {
  const dispatch = useDispatch();
  const { results, pagination, loading, error, filters } = useSelector(
    selectPublicBidResults,
  );

  useEffect(() => {
    dispatch(fetchPublicBidResults(filters));
  }, [dispatch, filters, pagination.page]);

  // sirf latest 5 dikha rahe hain card row me (image jaisa)
  const liveMarkets = results.slice(0, 5);

  return (
    <div className="bg-[#0B0410] px-3 py-3">
      <div className="max-w-md mx-auto rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.6)] bg-[#1C0F2B] overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          {/* Matka Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-2">
              <FaCrown className="text-[#F1C40F] text-lg mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  MATKA RESULTS
                </h3>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Live updates from all main markets
                </p>
              </div>
            </div>
            <Link
              to={"/publicresult"}
              className="text-[11px] font-bold text-[#0B0410] px-3 py-1.5 rounded-lg shrink-0
              bg-gradient-to-b from-[#00E676] to-[#00c853]
              border border-[#00E676]
              shadow-[0_2px_8px_rgba(0,230,118,0.3)]
              transition hover:shadow-[0_4px_12px_rgba(0,230,118,0.5)]"
            >
              View All
            </Link>
          </div>

          {/* Matka Cards (from publicBidSlice reducer) */}
          {loading && results.length === 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[100px] h-28 rounded-xl bg-[#2a1b3d] animate-pulse shrink-0"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : liveMarkets.length === 0 ? (
            <p className="text-xs text-gray-400">No results found</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
              {liveMarkets.map((bid) => (
                <div
                  key={bid._id}
                  className="min-w-[100px] shrink-0 snap-start border border-[#2a1b3d] bg-[#12061C] rounded-xl px-2 py-2 text-center shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                >
                  {/* Market name — highlighted at top */}
                  <p className="text-[11px] font-bold text-[#F1C40F] uppercase truncate">
                    {bid.marketId?.name || "N/A"}
                  </p>

                  <p className="text-[10px] text-gray-400 mb-1.5">
                    {format(new Date(bid.createdAt), "hh:mm a")}
                  </p>

                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    {String(bid.resultNumber || bid.number)
                      .split("")
                      .map((digit, idx) => (
                        <span
                          key={idx}
                          className="text-lg font-extrabold text-white"
                        >
                          {digit}
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] inline-block animate-pulse" />
                    <span className="text-[10px] font-semibold text-[#00E676]">
                      LIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveResults;
