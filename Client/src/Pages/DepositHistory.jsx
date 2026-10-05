// pages/DepositHistory.jsx
//
// /deposit-history — same design as /withdrawal-history:
// type tabs + status/date filters, then cards with a Deposit
// tag + status and Order amount / Type / Time / UTR number
// (copyable) / Remarks rows.

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { getMyDeposits } from "../redux/slices/depositSlice";

const accentGradient =
  "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_10px_rgba(180,92,255,0.5)]";

const STATUS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "approved", label: "Success" },
  { id: "pending", label: "Pending" },
  { id: "rejected", label: "Failed" },
];

const DATE_OPTIONS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7days", label: "Last 7 days" },
  { id: "30days", label: "Last 30 days" },
];

const statusInfo = (status) => {
  const value = String(status).toLowerCase();
  if (["success", "approved", "completed"].includes(value))
    return { label: "Success", cls: "text-[#00E676]" };
  if (value === "pending") return { label: "Pending", cls: "text-[#F1C40F]" };
  if (["failed", "rejected"].includes(value))
    return { label: "Failed", cls: "text-red-400" };
  if (value === "cancelled") return { label: "Cancelled", cls: "text-gray-400" };
  return { label: status || "Pending", cls: "text-gray-400" };
};

const DepositHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { deposits, loading } = useSelector((state) => state.deposit);

  const [typeTab, setTypeTab] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [dateTab, setDateTab] = useState("all");

  useEffect(() => {
    dispatch(getMyDeposits());
  }, [dispatch]);

  // Type tabs — All + every method the user actually deposited with
  const typeTabs = useMemo(() => {
    const titles = [];
    (deposits || []).forEach((d) => {
      const title = d.methodTitle || d.method || "Deposit";
      if (!titles.includes(title)) titles.push(title);
    });
    return [
      { id: "all", label: "All" },
      ...titles.map((t) => ({ id: t, label: t })),
    ];
  }, [deposits]);

  const filtered = useMemo(() => {
    let list = deposits || [];

    if (typeTab !== "all") {
      list = list.filter(
        (d) => (d.methodTitle || d.method || "Deposit") === typeTab,
      );
    }

    if (statusTab !== "all") {
      list = list.filter((d) => {
        const value = String(d.status).toLowerCase();
        if (statusTab === "approved")
          return ["success", "approved", "completed"].includes(value);
        return value === statusTab;
      });
    }

    if (dateTab !== "all") {
      const now = new Date();
      let startDate = null;
      if (dateTab === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateTab === "7days") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateTab === "30days") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (startDate) {
        list = list.filter((d) => new Date(d.createdAt) >= startDate);
      }
    }

    return list;
  }, [deposits, typeTab, statusTab, dateTab]);

  const formatAmount = (amount) => {
    const num = Number(amount);
    if (!Number.isFinite(num)) return "₹0.00";
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const copyOrderNumber = async (order) => {
    try {
      await navigator.clipboard.writeText(order);
      toast.success("UTR number copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0410] pb-10">
      <div className="mx-auto max-w-md px-4 pt-4">
        {/* HEADER */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-white transition-all active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-white">
            Deposit history
          </h1>
          <span className="w-9 flex-shrink-0" />
        </div>

        {/* TYPE TABS */}
        <div
          className={`mb-3 grid gap-2 ${
            typeTabs.length === 1
              ? "grid-cols-1"
              : typeTabs.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {typeTabs.slice(0, 3).map(({ id, label }) => {
            const isActive = typeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTypeTab(id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 border text-[11px] font-bold transition-all active:scale-95 ${
                  isActive
                    ? `${accentGradient} text-white`
                    : "border-[#2a1b3d] bg-[#1C0F2B] text-gray-400 hover:border-[#9B59B6]/50"
                }`}
              >
                {id === "all" && (
                  <span className="grid grid-cols-2 gap-0.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1 w-1 rounded-sm ${
                          isActive ? "bg-white" : "bg-[#B45CFF]"
                        }`}
                      />
                    ))}
                  </span>
                )}
                <span className="truncate">{label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* STATUS + DATE FILTERS */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={statusTab}
              onChange={(e) => setStatusTab(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] px-3 py-2.5 text-xs font-semibold text-gray-300 outline-none transition-all focus:border-[#B45CFF]/60"
            >
              {STATUS_OPTIONS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label === "All" ? "All" : `Status: ${label}`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          <div className="relative">
            <select
              value={dateTab}
              onChange={(e) => setDateTab(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] px-3 py-2.5 text-xs font-semibold text-gray-300 outline-none transition-all focus:border-[#B45CFF]/60"
            >
              {DATE_OPTIONS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-10">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2a1b3d] border-t-[#B45CFF]" />
            <span className="ml-2.5 text-xs font-medium text-gray-400">
              Loading...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2a1b3d] bg-[#1C0F2B] py-12 text-center">
            <p className="text-sm font-bold text-white">No deposits found</p>
            <p className="mt-1 text-[11px] text-gray-500">
              Try changing the filters above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const status = statusInfo(item.status);
              const order = item.depositRef || item._id;
              const utr = String(item.transactionId || "").trim();

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-3.5 transition-all hover:border-[#9B59B6]/50"
                >
                  {/* top row — tag + status */}
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-gradient-to-r from-[#B45CFF] to-[#7418F5] px-2.5 py-1 text-[10px] font-bold text-white">
                      Deposit
                    </span>
                    <span className={`text-[11px] font-bold ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* detail rows */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Order amount</span>
                      <span className="font-bold text-white">
                        {formatAmount(item.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Type</span>
                      <span className="font-semibold text-gray-300">
                        {(item.methodTitle || item.method || "DEPOSIT").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Time</span>
                      <span className="text-gray-300">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Order number</span>
                      <span className="flex items-center gap-1.5">
                        <span className="max-w-[150px] truncate font-mono text-[10px] text-gray-400">
                          {order}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyOrderNumber(order)}
                          className="text-gray-500 transition-all hover:text-[#B45CFF] active:scale-90"
                          aria-label="Copy order number"
                        >
                          <Copy size={11} />
                        </button>
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">UTR number</span>
                      <span className="flex items-center gap-1.5">
                        <span className="max-w-[150px] truncate font-mono text-[10px] text-gray-400">
                          {utr || "—"}
                        </span>
                        {utr && (
                          <button
                            type="button"
                            onClick={() => copyOrderNumber(utr)}
                            className="text-gray-500 transition-all hover:text-[#B45CFF] active:scale-90"
                            aria-label="Copy UTR number"
                          >
                            <Copy size={11} />
                          </button>
                        )}
                      </span>
                    </div>
                    {item.remark && (
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Remarks</span>
                        <span className="max-w-[170px] truncate text-gray-400">
                          {item.remark}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <p className="py-3 text-center text-xs font-semibold text-gray-500">
              No more
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositHistory;
