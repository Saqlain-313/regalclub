import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdFilterList,
  MdSearch,
  MdDownload,
  MdPrint,
  MdCheckCircle,
  MdPending,
  MdError,
  MdRefresh,
  MdCalendarToday,
  MdVisibility,
  MdClose,
  MdContentCopy,
  MdInfo,
  MdWarning,
} from "react-icons/md";
import {
  FaRupeeSign,
  FaFilter,
  FaSpinner,
  FaSortAmountDown,
  FaCopy,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Import Redux actions
import {
  clearDepositState,
  getMyDeposits as getUpiDeposits,
} from "../../reducer/depositSlice";

export default function DepositHistory() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const { deposits, loading, message, error } = useSelector(
    (state) => state.deposit,
  );

  const { userprofile } = useSelector((state) => state.auth);

  // Load deposits on component mount
  useEffect(() => {
    dispatch(getUpiDeposits());
    dispatch(clearDepositState());
  }, [dispatch]);

  // Handle notifications
  useEffect(() => {
    if (message) {
      toast.success(message, { id: "deposit_history_success" });
      dispatch(clearDepositState());
    }
    if (error) {
      toast.error(error, { id: error });
      dispatch(clearDepositState());
    }
  }, [message, error, dispatch]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "abandoned":
        return "bg-gray-500/20 text-gray-500 border-gray-600/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return <MdCheckCircle className="text-green-500" />;
      case "pending":
        return <MdPending className="text-yellow-500" />;
      case "rejected":
      case "failed":
        return <MdError className="text-red-500" />;
      case "abandoned":
        return <MdClose className="text-gray-500" />;
      default:
        return <MdInfo className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return "Approved";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      case "failed":
        return "Failed";
      case "abandoned":
        return "Abandoned";
      default:
        return status || "Pending";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getMethodIcon = (method) => {
    const methodName = method?.toLowerCase() || "upi";
    switch (methodName) {
      case "upi":
        return "📱";
      case "usdt":
        return "🪙";
      case "bank":
        return "🏦";
      default:
        return "💳";
    }
  };

  const getMethodDisplay = (deposit) => {
    // Check if it's USDT deposit
    if (deposit.paymentMethod?.toLowerCase() === "usdt") {
      return "USDT";
    }
    // Check if it's UPI deposit
    if (deposit.paymentMethod?.toLowerCase() === "upi") {
      return "UPI";
    }
    // Default
    return deposit.paymentMethod || "UPI";
  };

  const getTransactionId = (deposit) => {
    if (deposit.paymentMethod?.toLowerCase() === "usdt") {
      return deposit.transactionId || "N/A";
    }
    return deposit.utr || "N/A";
  };

  const getTransactionLabel = (deposit) => {
    if (deposit.paymentMethod?.toLowerCase() === "usdt") {
      return "Transaction ID";
    }
    return "UTR Number";
  };

  const getDepositId = (deposit) => {
    if (deposit.paymentMethod?.toLowerCase() === "usdt") {
      return deposit.depositId || "N/A";
    }
    return deposit.depositId || "N/A";
  };

  const getOriginalAmount = (deposit) => {
    if (deposit.paymentMethod?.toLowerCase() === "usdt") {
      return deposit.originalAmount || "N/A";
    }
    return "N/A";
  };

  const getUsdtRate = (deposit) => {
    if (deposit.paymentMethod?.toLowerCase() === "usdt") {
      return deposit.usdtRate || "N/A";
    }
    return "N/A";
  };

  const getNetwork = (deposit) => {
    if (deposit.paymentMethod?.toLowerCase() === "usdt") {
      return deposit.network || "TRC20";
    }
    return "N/A";
  };

  // Unified Deposits Collection - Ensure all deposits are included
  const allDeposits = useMemo(() => {
    // Map deposits to ensure consistent structure
    return deposits.map((d) => ({
      ...d,
      method: d.paymentMethod || "upi",
      // Ensure all fields are present
      depositId: d.depositId || "N/A",
      transactionId: d.transactionId || "N/A",
      utr: d.utr || "N/A",
      originalAmount: d.originalAmount || null,
      usdtRate: d.usdtRate || null,
      network: d.network || "TRC20",
      remark: d.remark || "N/A",
      adminRemark: d.adminRemark || null,
      approvedAt: d.approvedAt || null,
      rejectedAt: d.rejectedAt || null,
    }));
  }, [deposits]);

  const filteredDeposits = allDeposits.filter((deposit) => {
    const searchLower = searchTerm.toLowerCase();
    const transactionId = getTransactionId(deposit).toLowerCase();
    const depositId = getDepositId(deposit).toLowerCase();

    const matchesSearch =
      deposit._id?.toLowerCase().includes(searchLower) ||
      transactionId.includes(searchLower) ||
      depositId.includes(searchLower) ||
      deposit.mobile?.toLowerCase().includes(searchLower) ||
      deposit.amount?.toString().includes(searchLower) ||
      deposit.remark?.toLowerCase().includes(searchLower) ||
      (deposit.adminRemark &&
        deposit.adminRemark.toLowerCase().includes(searchLower)) ||
      deposit.depositId?.toLowerCase().includes(searchLower) ||
      deposit.utr?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" ||
      deposit.status?.toLowerCase() === statusFilter.toLowerCase();

    if (!deposit.createdAt) return matchesSearch && matchesStatus;

    const depositDate = new Date(deposit.createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && depositDate >= today) ||
      (dateFilter === "week" && depositDate >= weekAgo) ||
      (dateFilter === "month" && depositDate >= monthAgo);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort deposits by date (newest first)
  const sortedDeposits = [...filteredDeposits].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalDeposited = sortedDeposits
    .filter((d) =>
      ["approved", "completed", "success"].includes(d.status?.toLowerCase()),
    )
    .reduce((sum, deposit) => sum + (deposit.amount || 0), 0);

  const pendingCount = sortedDeposits.filter(
    (d) => d.status?.toLowerCase() === "pending",
  ).length;

  const usdtDeposits = sortedDeposits.filter(
    (d) => d.paymentMethod?.toLowerCase() === "usdt",
  ).length;
  const upiDeposits = sortedDeposits.filter(
    (d) => d.paymentMethod?.toLowerCase() === "upi",
  ).length;

  const handleRefresh = () => {
    dispatch(getUpiDeposits());
    toast.success("Refreshing deposit history...");
  };

  const handleViewDetails = (deposit) => {
    setSelectedDeposit(deposit);
    setShowModal(true);
  };

  const copyToClipboard = (text, id) => {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    try {
      const data = sortedDeposits.map((deposit) => ({
        Date: formatDate(deposit.createdAt),
        Amount: deposit.amount,
        Method: getMethodDisplay(deposit),
        "Deposit ID": getDepositId(deposit),
        "UTR/Transaction ID": getTransactionId(deposit),
        Status: getStatusText(deposit.status),
        Remark: deposit.remark || "N/A",
        "Admin Remark": deposit.adminRemark || "N/A",
      }));

      const csv = convertToCSV(data);
      downloadCSV(
        csv,
        `deposit-history-${new Date().toISOString().split("T")[0]}.csv`,
      );
      toast.success("Export started!");
    } catch (err) {
      toast.error("Failed to export data");
    }
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || "")).join(","),
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate("/deposit")}
          className="flex items-center gap-2 text-orange-400 hover:text-yellow-400 transition-colors bg-gray-800/50 px-4 py-2 rounded-xl backdrop-blur-sm"
        >
          <MdArrowBack />
          <span>Back to Deposit</span>
        </button>
      </div>

      <div className=" mx-auto md:px-4 pt-10 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6">
            <div className="text-gray-400 text-sm mb-2">Total Deposited</div>
            <div className="text-3xl font-bold text-white flex items-center">
              <FaRupeeSign className="mr-2 text-yellow-400" />
              <span>{totalDeposited.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {
                sortedDeposits.filter((d) =>
                  ["approved", "completed", "success"].includes(
                    d.status?.toLowerCase(),
                  ),
                ).length
              }{" "}
              successful deposits
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6">
            <div className="text-gray-400 text-sm mb-2">Current credit</div>
            <div className="text-3xl font-bold text-white flex items-center">
              <FaRupeeSign className="mr-2 text-yellow-400" />
              <span>{userprofile?.credit?.toLocaleString() || "0"}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Available for betting
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6">
            <div className="text-gray-400 text-sm mb-2">Pending Deposits</div>
            <div className="text-3xl font-bold text-yellow-400 flex items-center">
              <MdPending className="mr-2" />
              <span>{pendingCount}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">Awaiting approval</div>
          </div>

          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6">
            <div className="text-gray-400 text-sm mb-2">Total Deposits</div>
            <div className="text-3xl font-bold text-white">
              <span className="text-yellow-400">🪙 {usdtDeposits}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-green-400">📱 {upiDeposits}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              USDT | UPI deposits
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-auto flex-1">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-96 pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-all"
                placeholder="Search by ID, UTR, Transaction ID, Amount..."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="failed">Failed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Date Filter */}
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">This Month</option>
                </select>
                <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white hover:bg-gray-700/50 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Refresh"
              >
                <MdRefresh className={`${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleExport}
                disabled={sortedDeposits.length === 0}
                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl text-white hover:from-orange-600 hover:to-yellow-600 transition-all flex items-center gap-2 disabled:opacity-50"
                title="Export to CSV"
              >
                <MdDownload />
                <span className="hidden sm:inline">Export</span>
              </button>

              {(searchTerm ||
                statusFilter !== "all" ||
                dateFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                  title="Clear Filters"
                >
                  <MdClose />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Deposit History Table */}
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl border border-orange-500/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="mt-4 text-gray-400">
                Loading deposit history...
              </div>
            </div>
          ) : sortedDeposits.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-30">📭</div>
              <div className="text-gray-400 text-lg mb-2">
                No deposits found
              </div>
              <div className="text-gray-500 text-sm mb-4">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try changing your filters"
                  : "Make your first deposit to get started!"}
              </div>
              <button
                onClick={() => navigate("/deposit")}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl text-white hover:from-orange-600 hover:to-yellow-600 transition-all"
              >
                Make Deposit
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-900/50 border-b border-gray-800">
                    <th className="py-4 px-6 text-left text-gray-400 font-semibold text-sm">
                      Date & Time
                    </th>
                    <th className="py-4 px-6 text-left text-gray-400 font-semibold text-sm">
                      Amount
                    </th>
                    <th className="py-4 px-6 text-left text-gray-400 font-semibold text-sm">
                      Method
                    </th>
                    <th className="py-4 px-6 text-left text-gray-400 font-semibold text-sm">
                      UTR/Transaction ID
                    </th>
                    <th className="py-4 px-6 text-left text-gray-400 font-semibold text-sm">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-gray-400 font-semibold text-sm">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDeposits.map((deposit) => (
                    <tr
                      key={deposit._id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">
                          {formatDate(deposit.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {deposit.paymentMethod?.toLowerCase() === "usdt"
                            ? `Deposit ID: ${getDepositId(deposit)}`
                            : `ID: ${deposit._id?.slice(-8)}`}
                        </div>
                        {deposit.paymentMethod?.toLowerCase() === "usdt" &&
                          deposit.originalAmount && (
                            <div className="text-xs text-yellow-400/70 mt-1">
                              ${deposit.originalAmount} USDT @ ₹
                              {deposit.usdtRate}/USDT
                            </div>
                          )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center text-lg font-semibold text-white">
                          <FaRupeeSign className="mr-1 text-yellow-400" />
                          <span>{(deposit.amount || 0).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {getMethodIcon(deposit.paymentMethod)}
                          </span>
                          <span className="text-sm text-gray-300 uppercase">
                            {getMethodDisplay(deposit)}
                          </span>
                        </div>
                        {deposit.paymentMethod?.toLowerCase() === "usdt" &&
                          deposit.network && (
                            <div className="text-xs text-gray-500 mt-1">
                              {deposit.network}
                            </div>
                          )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-300 break-all">
                            {getTransactionId(deposit)}
                          </span>
                          {getTransactionId(deposit) !== "N/A" && (
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  getTransactionId(deposit),
                                  deposit._id,
                                )
                              }
                              className="p-1 hover:bg-gray-700/50 rounded transition-colors flex-shrink-0"
                              title="Copy"
                            >
                              {copiedId === deposit._id ? (
                                <MdCheckCircle className="text-green-500" />
                              ) : (
                                <FaCopy className="text-gray-400 text-xs" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getTransactionLabel(deposit)}
                        </div>
                        {deposit.remark && deposit.remark !== "N/A" && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                            {deposit.remark}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(deposit.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deposit.status)}`}
                          >
                            {getStatusText(deposit.status)}
                          </span>
                        </div>
                        {deposit.adminRemark &&
                          deposit.status?.toLowerCase() === "rejected" && (
                            <div className="text-xs text-red-400/70 mt-1 flex items-center gap-1">
                              <MdWarning className="text-xs" />
                              {deposit.adminRemark}
                            </div>
                          )}
                        {deposit.adminRemark &&
                          deposit.status?.toLowerCase() === "approved" && (
                            <div className="text-xs text-green-400/70 mt-1 flex items-center gap-1">
                              <MdCheckCircle className="text-xs" />
                              {deposit.adminRemark}
                            </div>
                          )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleViewDetails(deposit)}
                          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                          <MdVisibility />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {sortedDeposits.length > 0 && (
            <div className="p-4 border-t border-gray-800 bg-gray-900/30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  Showing{" "}
                  <span className="text-white font-semibold">
                    {sortedDeposits.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-white font-semibold">
                    {allDeposits.length}
                  </span>{" "}
                  deposits
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Total Amount:</span>
                    <span className="text-white font-semibold flex items-center">
                      <FaRupeeSign className="mr-1 text-yellow-400" />
                      {sortedDeposits
                        .reduce((sum, d) => sum + (d.amount || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Approved:</span>
                    <span className="text-green-400 font-semibold">
                      {
                        sortedDeposits.filter((d) =>
                          ["approved", "completed", "success"].includes(
                            d.status?.toLowerCase(),
                          ),
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">USDT:</span>
                    <span className="text-yellow-400 font-semibold">
                      {
                        sortedDeposits.filter(
                          (d) => d.paymentMethod?.toLowerCase() === "usdt",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">UPI:</span>
                    <span className="text-green-400 font-semibold">
                      {
                        sortedDeposits.filter(
                          (d) => d.paymentMethod?.toLowerCase() === "upi",
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Details Modal */}
      {showModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-orange-500/50 w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                <MdInfo />
                Deposit Details
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDeposit(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Amount Card */}
              <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700">
                <div className="text-3xl font-bold text-white flex items-center justify-center">
                  <FaRupeeSign className="mr-2 text-yellow-400" />
                  <span>{(selectedDeposit.amount || 0).toLocaleString()}</span>
                </div>
                <div className="text-center text-sm text-gray-400 mt-2">
                  Deposit Amount
                </div>
                {selectedDeposit.paymentMethod?.toLowerCase() === "usdt" &&
                  selectedDeposit.originalAmount && (
                    <div className="text-center text-sm text-yellow-400/70 mt-1">
                      ${selectedDeposit.originalAmount} USDT @ ₹
                      {selectedDeposit.usdtRate}/USDT
                    </div>
                  )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Deposit ID</div>
                  <div className="font-mono text-orange-300 text-sm break-all">
                    {getDepositId(selectedDeposit)}
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(getDepositId(selectedDeposit), "modal-id")
                    }
                    className="mt-1 text-xs text-gray-500 hover:text-gray-400 flex items-center gap-1"
                  >
                    <FaCopy className="text-xs" /> Copy
                  </button>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedDeposit.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDeposit.status)}`}
                    >
                      {getStatusText(selectedDeposit.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* UTR/Transaction ID */}
              {getTransactionId(selectedDeposit) !== "N/A" && (
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">
                    {getTransactionLabel(selectedDeposit)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-gray-300 text-sm break-all">
                      {getTransactionId(selectedDeposit)}
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          getTransactionId(selectedDeposit),
                          "modal-transaction",
                        )
                      }
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors ml-2 flex-shrink-0"
                    >
                      <FaCopy className="text-gray-400" />
                    </button>
                  </div>
                  {selectedDeposit.paymentMethod?.toLowerCase() === "usdt" &&
                    selectedDeposit.network && (
                      <div className="text-xs text-gray-500 mt-1">
                        Network: {selectedDeposit.network}
                      </div>
                    )}
                </div>
              )}

              {/* Method & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">
                    Payment Method
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {getMethodIcon(selectedDeposit.paymentMethod)}
                    </span>
                    <span className="text-sm text-white uppercase">
                      {getMethodDisplay(selectedDeposit)}
                    </span>
                  </div>
                  {selectedDeposit.paymentMethod?.toLowerCase() === "usdt" &&
                    selectedDeposit.network && (
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedDeposit.network}
                      </div>
                    )}
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Date & Time</div>
                  <div className="text-sm text-white">
                    {formatDate(selectedDeposit.createdAt)}
                  </div>
                  {selectedDeposit.approvedAt && (
                    <div className="text-xs text-green-400/70 mt-1">
                      Approved: {formatDate(selectedDeposit.approvedAt)}
                    </div>
                  )}
                  {selectedDeposit.rejectedAt && (
                    <div className="text-xs text-red-400/70 mt-1">
                      Rejected: {formatDate(selectedDeposit.rejectedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile */}
              {selectedDeposit.mobile && (
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">
                    Mobile Number
                  </div>
                  <div className="text-sm text-white">
                    {selectedDeposit.mobile}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedDeposit.remark && selectedDeposit.remark !== "N/A" && (
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">
                    {selectedDeposit.paymentMethod?.toLowerCase() === "usdt"
                      ? "USDT Remark"
                      : "Your Remark"}
                  </div>
                  <div className="text-sm text-gray-300">
                    {selectedDeposit.remark}
                  </div>
                </div>
              )}

              {selectedDeposit.adminRemark && (
                <div
                  className={`p-3 rounded-lg ${
                    selectedDeposit.status?.toLowerCase() === "rejected"
                      ? "bg-red-900/20 border border-red-500/30"
                      : selectedDeposit.status?.toLowerCase() === "approved"
                        ? "bg-green-900/20 border border-green-500/30"
                        : "bg-gray-800/50"
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">Admin Remark</div>
                  <div
                    className={`text-sm ${
                      selectedDeposit.status?.toLowerCase() === "rejected"
                        ? "text-red-400"
                        : selectedDeposit.status?.toLowerCase() === "approved"
                          ? "text-green-400"
                          : "text-gray-300"
                    }`}
                  >
                    {selectedDeposit.adminRemark}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDeposit(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl text-white font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
