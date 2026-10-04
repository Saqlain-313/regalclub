// components/HistoryShell.jsx
//
// Shared design frame for history pages — same look and features
// as /deposit-history and /withdrawal-history:
//   back header -> type tabs -> status/date dropdowns -> cards
//   (colored tag + status, detail rows) -> "No more"
//
// Usage: render the list cards yourself via `children`; the shell
// handles header, filters, loading/empty states.

import { ChevronDown, ChevronLeft, Copy } from "lucide-react";
import { toast } from "react-toastify";

export const accentGradient =
  "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_10px_rgba(180,92,255,0.5)]";

export const statusText = (status) => {
  const value = String(status).toLowerCase();
  if (["success", "approved", "completed", "won"].includes(value))
    return { label: "Won", cls: "text-[#00E676]" };
  if (["pending", "processing"].includes(value))
    return { label: "Pending", cls: "text-[#F1C40F]" };
  if (["failed", "rejected", "lost"].includes(value))
    return { label: "Lost", cls: "text-red-400" };
  if (value === "cancelled") return { label: "Cancelled", cls: "text-gray-400" };
  return { label: status || "Pending", cls: "text-gray-400" };
};

export const formatINR = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "₹0.00";
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

export const formatDateTime = (value) => {
  const date = new Date(value);
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

export const copyText = async (text, label = "Copied") => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Copy failed");
  }
};

export const FilterDropdown = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] px-3 py-2.5 text-xs font-semibold text-gray-300 outline-none transition-all focus:border-[#B45CFF]/60"
    >
      {options.map(({ id, label }) => (
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
);

export const DetailRow = ({ label, value, mono, copyable }) => (
  <div className="flex justify-between gap-2">
    <span className="text-gray-500">{label}</span>
    <span className="flex items-center gap-1.5">
      <span
        className={`max-w-[170px] truncate ${
          mono ? "font-mono text-[10px]" : ""
        } ${copyable ? "text-gray-400" : "text-gray-300"}`}
      >
        {value}
      </span>
      {copyable && (
        <button
          type="button"
          onClick={() => copyText(value)}
          className="text-gray-500 transition-all hover:text-[#B45CFF] active:scale-90"
          aria-label={`Copy ${label}`}
        >
          <Copy size={11} />
        </button>
      )}
    </span>
  </div>
);

const HistoryShell = ({
  title,
  tabs = [],
  activeTab,
  onTab,
  statusOptions = [],
  status,
  onStatus,
  date,
  onDate,
  loading,
  emptyTitle = "Nothing found",
  emptyText,
  emptyIcon,
  error,
  children,
}) => {
  const gridCols =
    tabs.length === 1
      ? "grid-cols-1"
      : tabs.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="min-h-screen bg-[#0B0410] pb-10">
      <div className="mx-auto max-w-md px-4 pt-4">
        {/* HEADER */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-white transition-all active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-white">
            {title}
          </h1>
          <span className="w-9 flex-shrink-0" />
        </div>

        {/* TYPE TABS */}
        {tabs.length > 0 && (
          <div className={`mb-3 grid gap-2 ${gridCols}`}>
            {tabs.slice(0, 3).map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTab(id)}
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
                  <span className="truncate">{String(label).toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* STATUS + DATE FILTERS */}
        {(statusOptions.length > 0 || onDate) && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {statusOptions.length > 0 ? (
              <FilterDropdown
                value={status}
                onChange={onStatus}
                options={statusOptions}
              />
            ) : (
              <span />
            )}
            {onDate && (
              <FilterDropdown
                value={date}
                onChange={onDate}
                options={[
                  { id: "all", label: "All time" },
                  { id: "today", label: "Today" },
                  { id: "7days", label: "Last 7 days" },
                  { id: "30days", label: "Last 30 days" },
                ]}
              />
            )}
          </div>
        )}

        {/* LIST */}
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] py-10">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2a1b3d] border-t-[#B45CFF]" />
            <span className="ml-2.5 text-xs font-medium text-gray-400">
              Loading...
            </span>
          </div>
        ) : !error && !children ? (
          <div className="rounded-2xl border border-dashed border-[#2a1b3d] bg-[#1C0F2B] py-12 text-center">
            {emptyIcon}
            <p className="text-sm font-bold text-white">{emptyTitle}</p>
            {emptyText && (
              <p className="mt-1 text-[11px] text-gray-500">{emptyText}</p>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}
            {children}
            <p className="py-3 text-center text-xs font-semibold text-gray-500">
              No more
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryShell;
