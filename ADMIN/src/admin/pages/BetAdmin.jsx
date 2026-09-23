import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllBet,
  getBetList,
  getPendingBetList,
  getUserBet,
  clearBetError,
} from "../redux/betAdminReducer";

const BetAdmin = () => {
  const dispatch = useDispatch();

  const {
    allBet = [],
    betList = [],
    pendingBetList = [],
    userBet = [],
    allBetLength = 0,
    betListLength = 0,
    pendingBetLength = 0,
    userBetLength = 0,
    totalMoney = 0,
    totalMoneyDown = 0,
    totalMoneyUp = 0,
    loading = false,
    error = null,
  } = useSelector((state) => state.betAdmin || {});

  const [tab, setTab] = useState("all");
  const [userId, setUserId] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [status, setStatus] = useState("");
  const [betType, setBetType] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Load the raw list for the current tab — no status/direction params sent
  // to the API. Status/direction filtering happens client-side below, on
  // whatever data is already in the store.
  const loadData = useCallback(() => {
    const params = {
      pageno: page,
      pageto: page + pageSize - 1,
    };

    if (tab === "all") {
      dispatch(getAllBet(params));
    } else if (tab === "completed") {
      dispatch(getBetList(params));
    } else if (tab === "pending") {
      dispatch(getPendingBetList(params));
    } else if (tab === "user" && userId) {
      dispatch(getUserBet({ userId, ...params }));
    }
  }, [tab, page, pageSize, userId, dispatch]);

  // Refetch only when tab/page/userId change — NOT on status/betType,
  // since those no longer touch the API at all.
  useEffect(() => {
    if (tab === "user" && !userId) return; // nothing to search yet
    loadData();
  }, [tab, page, userId, loadData]);

  // Error auto-clear
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearBetError()), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Search user — works no matter which tab you're currently on
  const searchUser = (e) => {
    e.preventDefault();
    const trimmedUserId = searchUserId.trim();
    if (!trimmedUserId) return;

    setUserId(trimmedUserId);
    setPage(1);
    setTab("user");
    // fetch is triggered by the effect above once state settles
  };

  // Change tab
  const changeTab = (value) => {
    setTab(value);
    setPage(1);
    // Reset userId when leaving user tab
    if (value !== "user") {
      setUserId("");
      setSearchUserId("");
    }
  };

  // Refresh button handler
  const refresh = () => {
    loadData();
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setPage(1);
    setStatus(e.target.value);
  };

  // Handle bet type filter change
  const handleBetTypeChange = (e) => {
    setPage(1);
    setBetType(e.target.value);
  };

  // Whatever data is already loaded for the current tab
  const rawRows =
    tab === "all"
      ? allBet
      : tab === "completed"
      ? betList
      : tab === "pending"
      ? pendingBetList
      : userBet;

  // Server-reported total for the current (unfiltered) tab
  const serverTotal =
    tab === "all"
      ? allBetLength
      : tab === "completed"
      ? betListLength
      : tab === "pending"
      ? pendingBetLength
      : userBetLength;

  // Apply status + direction filters locally on the rows already fetched —
  // no extra API call for filtering.
  const rows = useMemo(() => {
    return rawRows.filter((item) => {
      if (status !== "" && Number(item.status) !== Number(status)) {
        return false;
      }
      if (betType && String(item.bet || "").toLowerCase() !== betType) {
        return false;
      }
      return true;
    });
  }, [rawRows, status, betType]);

  // When a filter is active, count/paginate against the filtered set;
  // otherwise use the server's total for the tab.
  const isFiltered = status !== "" || betType !== "";
  const total = isFiltered ? rows.length : serverTotal;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Helper functions
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const getStatus = (value) => {
    const n = Number(value);
    if (n === 0) return { text: "Pending", className: "pending" };
    if (n === 1) return { text: "Win", className: "win" };
    if (n === 2) return { text: "Loss", className: "loss" };
    return { text: formatValue(value), className: "" };
  };

  return (
    <>
      <style>{`
        /* --- CSS Variables --- */
        :root {
          --bg-primary: #f0f4ff;
          --bg-card: rgba(255, 255, 255, 0.75);
          --bg-card-hover: rgba(255, 255, 255, 0.95);
          --text-primary: #0b1a33;
          --text-secondary: #4a5b7a;
          --text-muted: #7a8aa8;
          --border-color: rgba(255, 255, 255, 0.3);
          --shadow: 0 8px 32px rgba(0, 20, 50, 0.08);
          --shadow-hover: 0 12px 48px rgba(0, 20, 50, 0.15);
          --radius: 16px;
          --radius-sm: 10px;
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          --gradient-primary: linear-gradient(135deg, #1a2a6c, #2d4373);
          --gradient-accent: linear-gradient(135deg, #667eea, #764ba2);
          --gradient-success: linear-gradient(135deg, #11998e, #38ef7d);
          --gradient-danger: linear-gradient(135deg, #eb3349, #f45c43);
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(255, 255, 255, 0.25);
          --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
        }

        /* --- Scrollbar --- */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
        }

        /* --- Page Container --- */
        .bet-admin-page {
          width: 100%;
          min-height: 100vh;
          padding: 28px 32px;
          background: var(--bg-primary);
          background-image: 
            radial-gradient(ellipse at 10% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 80%, rgba(118, 75, 162, 0.08) 0%, transparent 50%);
          box-sizing: border-box;
          color: var(--text-primary);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* --- Header --- */
        .bet-admin-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .bet-admin-title h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .bet-admin-title p {
          margin: 6px 0 0;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 400;
          -webkit-text-fill-color: var(--text-secondary);
        }

        .bet-refresh {
          border: none;
          border-radius: var(--radius-sm);
          padding: 12px 24px;
          cursor: pointer;
          background: var(--gradient-primary);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          transition: var(--transition);
          box-shadow: 0 4px 15px rgba(26, 42, 108, 0.25);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bet-refresh:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(26, 42, 108, 0.35);
        }

        .bet-refresh:active {
          transform: scale(0.96);
        }

        /* --- Stats Cards --- */
        .bet-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .bet-card {
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius);
          padding: 20px 24px;
          box-shadow: var(--glass-shadow);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .bet-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-accent);
          opacity: 0;
          transition: var(--transition);
        }

        .bet-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
          background: var(--bg-card-hover);
        }

        .bet-card:hover::before {
          opacity: 1;
        }

        .bet-card span {
          display: block;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .bet-card strong {
          font-size: 28px;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bet-card .card-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 32px;
          opacity: 0.1;
        }

        /* --- Tabs --- */
        .bet-tabs {
          display: flex;
          gap: 6px;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          padding: 6px;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius);
          margin-bottom: 20px;
          overflow-x: auto;
          box-shadow: var(--glass-shadow);
        }

        .bet-tab {
          border: none;
          background: transparent;
          padding: 10px 22px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          white-space: nowrap;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-secondary);
          transition: var(--transition);
          position: relative;
        }

        .bet-tab:hover {
          color: var(--text-primary);
          background: rgba(102, 126, 234, 0.08);
        }

        .bet-tab.active {
          background: var(--gradient-primary);
          color: #fff;
          box-shadow: 0 4px 15px rgba(26, 42, 108, 0.25);
        }

        /* --- Tools Bar --- */
        .bet-tools {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          padding: 16px 20px;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius);
          margin-bottom: 20px;
          box-shadow: var(--glass-shadow);
        }

        .bet-input,
        .bet-select {
          height: 44px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: var(--radius-sm);
          padding: 0 14px;
          outline: none;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          font-size: 14px;
          color: var(--text-primary);
          transition: var(--transition);
          min-width: 160px;
        }

        .bet-input:focus,
        .bet-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
          background: #fff;
        }

        .bet-input::placeholder {
          color: var(--text-muted);
        }

        .bet-search {
          display: flex;
          gap: 8px;
          flex: 1;
          min-width: 200px;
        }

        .bet-btn {
          height: 44px;
          border: none;
          border-radius: var(--radius-sm);
          padding: 0 22px;
          background: var(--gradient-accent);
          color: #fff;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: var(--transition);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          white-space: nowrap;
        }

        .bet-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .bet-btn:active {
          transform: scale(0.96);
        }

        /* --- Table --- */
        .bet-table-wrap {
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius);
          overflow: auto;
          box-shadow: var(--glass-shadow);
        }

        .bet-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
        }

        .bet-table th {
          background: rgba(0, 0, 0, 0.02);
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          padding: 16px 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          white-space: nowrap;
        }

        .bet-table td {
          padding: 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          font-size: 14px;
          white-space: nowrap;
          color: var(--text-primary);
          transition: var(--transition);
        }

        .bet-table tbody tr {
          transition: var(--transition);
        }

        .bet-table tbody tr:hover {
          background: rgba(102, 126, 234, 0.04);
        }

        .bet-table tbody tr:last-child td {
          border-bottom: 0;
        }

        /* --- Status Badges --- */
        .status {
          display: inline-flex;
          padding: 5px 14px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .status.pending {
          background: rgba(255, 193, 7, 0.15);
          color: #b8860b;
          border: 1px solid rgba(255, 193, 7, 0.2);
        }

        .status.win {
          background: rgba(46, 213, 115, 0.15);
          color: #0d7a3b;
          border: 1px solid rgba(46, 213, 115, 0.2);
        }

        .status.loss {
          background: rgba(255, 71, 87, 0.12);
          color: #c0392b;
          border: 1px solid rgba(255, 71, 87, 0.2);
        }

        /* --- Direction Colors --- */
        .direction-up {
          color: #0d7a3b;
          font-weight: 700;
        }

        .direction-down {
          color: #c0392b;
          font-weight: 700;
        }

        /* --- Empty & Loader --- */
        .empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
          font-size: 16px;
        }

        .loader {
          text-align: center;
          padding: 50px 20px;
          color: var(--text-secondary);
          font-size: 15px;
        }

        .loader::after {
          content: '';
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-left: 12px;
          border: 3px solid rgba(102, 126, 234, 0.2);
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          vertical-align: middle;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* --- Error --- */
        .error {
          margin-bottom: 16px;
          padding: 14px 18px;
          border-radius: var(--radius-sm);
          background: rgba(255, 71, 87, 0.08);
          color: #c0392b;
          border: 1px solid rgba(255, 71, 87, 0.15);
          font-size: 14px;
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error::before {
          content: '⚠';
          font-size: 18px;
        }

        /* --- Footer --- */
        .bet-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 0 4px;
          flex-wrap: wrap;
        }

        .bet-footer > div:first-child {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-btn {
          min-width: 40px;
          height: 40px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(4px);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-btn:hover:not(:disabled) {
          background: var(--gradient-primary);
          color: #fff;
          border-color: transparent;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(26, 42, 108, 0.2);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .pagination span {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 0 8px;
        }

        /* --- Responsive --- */
        @media (max-width: 1024px) {
          .bet-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .bet-admin-page {
            padding: 16px;
          }

          .bet-admin-head {
            flex-direction: column;
            align-items: stretch;
          }

          .bet-cards {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .bet-card {
            padding: 16px;
          }

          .bet-card strong {
            font-size: 22px;
          }

          .bet-tools {
            flex-direction: column;
            align-items: stretch;
          }

          .bet-search {
            flex-direction: column;
          }

          .bet-input,
          .bet-select,
          .bet-btn {
            width: 100%;
            min-width: unset;
          }

          .bet-footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .bet-cards {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .bet-card {
            padding: 14px;
          }

          .bet-card strong {
            font-size: 18px;
          }

          .bet-card span {
            font-size: 11px;
          }

          .bet-table th,
          .bet-table td {
            padding: 10px 8px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="bet-admin-page">
        {/* Header */}
        <div className="bet-admin-head">
          <div className="bet-admin-title">
            <h2>🎯 Bet Management</h2>
            <p>Monitor all bets, filter by status, and search user history</p>
          </div>
          <button className="bet-refresh" onClick={refresh}>
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="bet-cards">
          <div className="bet-card">
            <span>📊 Total Bets</span>
            <strong>{allBetLength}</strong>
          </div>
          <div className="bet-card">
            <span>⏳ Pending Bets</span>
            <strong>{pendingBetLength}</strong>
          </div>
          <div className="bet-card">
            <span>⬆️ Pending UP</span>
            <strong>{totalMoneyUp}</strong>
          </div>
          <div className="bet-card">
            <span>⬇️ Pending DOWN</span>
            <strong>{totalMoneyDown}</strong>
          </div>
        </div>

        {/* Tabs */}
        <div className="bet-tabs">
          <button
            className={`bet-tab ${tab === "all" ? "active" : ""}`}
            onClick={() => changeTab("all")}
          >
            📋 All Bets
          </button>
          <button
            className={`bet-tab ${tab === "pending" ? "active" : ""}`}
            onClick={() => changeTab("pending")}
          >
            ⏳ Pending
          </button>
          <button
            className={`bet-tab ${tab === "completed" ? "active" : ""}`}
            onClick={() => changeTab("completed")}
          >
            ✅ Completed
          </button>
          <button
            className={`bet-tab ${tab === "user" ? "active" : ""}`}
            onClick={() => changeTab("user")}
          >
            👤 User Bets
          </button>
        </div>

        {/* Tools */}
        <form className="bet-tools" onSubmit={searchUser}>
          <div className="bet-search">
            <input
              className="bet-input"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="🔍 Enter User ID and press search"
            />
            <button className="bet-btn" type="submit">
              Search
            </button>
          </div>

          <select
            className="bet-select"
            value={status}
            onChange={handleStatusChange}
          >
            <option value="">All Status</option>
            <option value="0">⏳ Pending</option>
            <option value="1">✅ Win</option>
            <option value="2">❌ Loss</option>
          </select>

          <select
            className="bet-select"
            value={betType}
            onChange={handleBetTypeChange}
          >
            <option value="">All Direction</option>
            <option value="up">⬆️ UP</option>
            <option value="down">⬇️ DOWN</option>
          </select>
        </form>

        {/* Error */}
        {error && <div className="error">{error}</div>}

        {/* Table */}
        <div className="bet-table-wrap">
          {loading ? (
            <div className="loader">Loading bets</div>
          ) : rows.length === 0 ? (
            <div className="empty">📭 No bets found</div>
          ) : (
            <table className="bet-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User ID</th>
                  <th>Direction</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Order ID</th>
                  <th>Period</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, index) => {
                  const statusInfo = getStatus(item.status);
                  const direction = String(item.bet || "").toLowerCase();

                  return (
                    <tr key={item._id || item.orderId || index}>
                      <td>{(page - 1) * pageSize + index + 1}</td>
                      <td>{formatValue(item.userId)}</td>
                      <td
                        className={
                          direction === "up"
                            ? "direction-up"
                            : direction === "down"
                            ? "direction-down"
                            : ""
                        }
                      >
                        {formatValue(item.bet).toUpperCase()}
                      </td>
                      <td>{formatValue(item.amount ?? item.money)}</td>
                      <td>
                        <span className={`status ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td>{formatValue(item.orderId)}</td>
                      <td>{formatValue(item.period ?? item.issue ?? item.gameId)}</td>
                      <td>{formatValue(item.time ?? item.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="bet-footer">
          <div>
            Showing {rows.length} of {total} records
          </div>
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BetAdmin;
