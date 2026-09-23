import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearWithdrawalError,
  fetchWithdrawalHistory,
  selectHistoryError,
  selectHistoryLoading,
  selectPagination,
  selectWithdrawalHistory,
} from "../redux/slices/withdrawalSlice";

const statusColor = {
  Success: "bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30",
  Pending: "bg-[#F1C40F]/15 text-[#F1C40F] border border-[#F1C40F]/30",
  Failed: "bg-red-500/15 text-red-400 border border-red-500/30",
  Processing: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  Completed: "bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30",
  Rejected: "bg-red-500/15 text-red-400 border border-red-500/30",
  Cancelled: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
};

export default function WithdrawalHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Redux selectors
  const withdrawals = useSelector(selectWithdrawalHistory);
  const loading = useSelector(selectHistoryLoading);
  const error = useSelector(selectHistoryError);
  const pagination = useSelector(selectPagination);

  // Fetch withdrawal history on component mount
  useEffect(() => {
    dispatch(
      fetchWithdrawalHistory({
        page: currentPage,
        limit: 10,
      }),
    );

    // Clear any errors when component unmounts
    return () => {
      dispatch(clearWithdrawalError());
    };
  }, [dispatch, currentPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle view all navigation
  const handleViewAll = () => {
    navigate("/withdrawal-history");
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B45CFF]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-[#1C0F2B] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-8">
        <div className="text-red-400 text-center">
          <p className="font-medium">Error loading withdrawals</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() =>
              dispatch(fetchWithdrawalHistory({ page: currentPage, limit: 10 }))
            }
            className="mt-3 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-lg text-sm transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a1b3d] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/30">
            <ArrowUpRight className="h-5 w-5 text-[#9B59B6]" />
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg">
              Last {pagination?.total || 10} Withdrawals
            </h2>
            <p className="text-xs text-gray-400">
              Recent withdrawal transactions
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-sm text-gray-300 bg-[#12061C] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition"
          >
            View All
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      {withdrawals.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-gray-400">No withdrawal transactions found</p>
        </div>
      ) : (
        <div className="divide-y divide-[#2a1b3d]">
          {withdrawals.map((item) => (
            <div
              key={item._id || item.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-[#2a1b3d]/50 transition"
            >
              <div>
                <h3 className="font-medium text-white">
                  {item.userName || item.name || item.user?.name || "User"}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(item.createdAt || item.date)}
                </p>

                {item.method && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    via {item.method}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="font-semibold text-white">
                  {formatAmount(item.amount)}
                </p>

                <span
                  className={`inline-flex mt-2 rounded-full px-3 py-1 text-xs font-medium ${
                    statusColor[item.status] ||
                    "bg-gray-500/15 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#2a1b3d] px-5 py-3">
          <div className="text-xs text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} entries
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-[#2a1b3d] bg-[#12061C] text-gray-300 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(pagination.totalPages).keys()].map((page) => {
              const pageNum = page + 1;
              // Show first 3, last 3, and current page with ellipsis
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                Math.abs(pageNum - pagination.page) <= 1
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-lg transition ${
                      pageNum === pagination.page
                        ? "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white"
                        : "border-[#2a1b3d] bg-[#12061C] text-gray-300 hover:bg-[#2a1b3d] hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }

              // Show ellipsis
              if (
                (pageNum === 2 && pagination.page > 3) ||
                (pageNum === pagination.totalPages - 1 &&
                  pagination.page < pagination.totalPages - 2)
              ) {
                return (
                  <span
                    key={pageNum}
                    className="px-2 py-1 text-sm text-gray-500"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 text-sm border border-[#2a1b3d] bg-[#12061C] text-gray-300 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
