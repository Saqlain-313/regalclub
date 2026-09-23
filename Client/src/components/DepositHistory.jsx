import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ChevronRight } from "lucide-react";
import { getMyDeposits } from "../redux/slices/depositSlice";

const statusColor = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
  Success: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700",
};

export default function DepositHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { deposits, loading } = useSelector((state) => state.deposit);

  useEffect(() => {
    dispatch(getMyDeposits());
  }, [dispatch]);

  // Show only first 5 deposits
  const displayedDeposits = deposits?.slice(0, 5) || [];

  const handleViewAll = () => {
    navigate("/deposit-history");
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status display name
  const getStatusDisplay = (status) => {
    const statusMap = {
      approved: "Success",
      pending: "Pending",
      rejected: "Failed",
    };
    return statusMap[status] || status || "Pending";
  };

  // Get status color class
  const getStatusClass = (status) => {
    const statusMap = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700",
      Success: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Failed: "bg-red-100 text-red-700",
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <ArrowDownLeft className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Last 5 Deposits</h2>
              <p className="text-xs text-gray-500">Loading transactions...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading deposits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
            <ArrowDownLeft className="h-5 w-5 text-green-500" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Last 5 Deposits
            </h2>

            <p className="text-xs text-gray-500">
              Recent deposit transactions
            </p>
          </div>
        </div>

        <button
          onClick={handleViewAll}
          className="flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-600 transition"
        >
          View All
          <ChevronRight size={16} />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-200">
        {displayedDeposits.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-500 text-sm">
            <p className="font-medium text-gray-700">No deposits found</p>
            <p className="text-xs mt-1">Start your first deposit today</p>
          </div>
        ) : (
          displayedDeposits.map((item) => (
            <div
              key={item._id || item.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => navigate(`/deposit/${item._id}`)}
            >
              {/* Left */}
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {item.transactionId || item.id || `#DEP${item._id?.slice(-6)}`}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(item.createdAt)}
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  {item.methodTitle || "Unknown Method"}
                </p>
              </div>

              {/* Right */}
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₹ {parseFloat(item.amount).toLocaleString('en-IN')}
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    getStatusClass(item.status)
                  }`}
                >
                  {getStatusDisplay(item.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with total count */}
      {deposits?.length > 5 && (
        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Showing 5 of {deposits.length} deposits
          </p>
        </div>
      )}
    </div>
  );
}