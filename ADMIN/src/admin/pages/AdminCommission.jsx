import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getAdminCommission,
  tradeAdminCommission,
} from "../redux/adminCommissionReducer";

const AdminCommission = () => {
  const dispatch = useDispatch();

  const {
    users = [],
    loading,
    tradeLoading,
    error,
    message,
  } = useSelector((state) => state.adminCommission);

  useEffect(() => {
    dispatch(getAdminCommission());
  }, [dispatch]);

  // Total pending commission
  const totalCommission = users.reduce(
    (total, user) => total + Number(user.pending_commission || 0),
    0
  );

  const handleTradeCommission = async () => {
    if (users.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to transfer ₹${totalCommission.toFixed(
        2
      )} commission to ${users.length} users?`
    );

    if (!confirmed) return;

    const result = await dispatch(tradeAdminCommission());

    if (tradeAdminCommission.fulfilled.match(result)) {
      // Fresh data load
      dispatch(getAdminCommission());
    }
  };

  const handleRefresh = () => {
    dispatch(getAdminCommission());
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Commission Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and transfer pending user commissions
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h5M20 20v-5h-5M5.5 9A7.5 7.5 0 0118 6.5L20 9M18.5 15A7.5 7.5 0 016 17.5L4 15"
              />
            </svg>

            Refresh
          </button>
        </div>

        {/* ================= STATS ================= */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Total Users */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Users With Pending Commission
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {users.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-10a4 4 0 110 8 4 4 0 010-8zm6 4a3 3 0 100-6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Commission */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Pending Commission
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  ₹{totalCommission.toFixed(2)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V6m0 12v-2m0-10a6 6 0 100 12 6 6 0 000-12z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MESSAGE ================= */}
        {message && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
          </div>
        )}

        {/* ================= ERROR ================= */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================= TABLE CARD ================= */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">

          {/* Table Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Pending Commissions
              </h2>

              <p className="text-sm text-slate-500">
                Users whose commission is waiting to be transferred
              </p>
            </div>

            <button
              onClick={handleTradeCommission}
              disabled={
                tradeLoading ||
                loading ||
                users.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tradeLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>

                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V6m0 12v-2m0-10a6 6 0 100 12 6 6 0 000-12z"
                    />
                  </svg>

                  Trade Commission
                </>
              )}
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="text-sm text-slate-500">
                  Loading commissions...
                </p>
              </div>
            </div>
          ) : users.length === 0 ? (
            /* Empty */
            <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <svg
                  className="h-8 w-8 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No Pending Commission
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                There are currently no users with pending commission.
              </p>
            </div>
          ) : (
            /* ================= TABLE ================= */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Mobile
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User Code
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Pending Commission
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user, index) => {
                    const commission = Number(
                      user.pending_commission || 0
                    );

                    return (
                      <tr
                        key={user._id || user.mobile || index}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                              {(
                                user.name ||
                                user.mobile ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-medium text-slate-800">
                                {user.name || "Unknown User"}
                              </p>

                              <p className="text-xs text-slate-400">
                                ID: {user._id || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {user.mobile || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {user.code || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-base font-bold text-emerald-600">
                            ₹{commission.toFixed(2)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer */}
                <tfoot className="border-t border-slate-200 bg-slate-50">
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-4 text-right text-sm font-semibold text-slate-700"
                    >
                      Total Pending Commission
                    </td>

                    <td className="px-5 py-4 text-right text-lg font-bold text-emerald-600">
                      ₹{totalCommission.toFixed(2)}
                    </td>

                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCommission;
