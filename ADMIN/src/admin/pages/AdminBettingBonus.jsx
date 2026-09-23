import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBettingBonus,
  updateBettingBonus,
  clearBettingBonusMessage,
} from "../redux/bettingBonusSlice";

const AdminBettingBonus = () => {
  const dispatch = useDispatch();

  const {
    bonus,
    loading,
    updating,
    error,
    success,
  } = useSelector((state) => state.bettingBonus);

  const [percentage, setPercentage] = useState("");
  const [isActive, setIsActive] = useState(true);

  // ======================================================
  // GET SETTINGS
  // ======================================================
  useEffect(() => {
    dispatch(getBettingBonus());
  }, [dispatch]);

  // ======================================================
  // SET FORM DATA
  // ======================================================
  useEffect(() => {
    if (bonus) {
      setPercentage(bonus.percentage ?? 1);
      setIsActive(bonus.isActive ?? true);
    }
  }, [bonus]);

  // ======================================================
  // CLEAR MESSAGE
  // ======================================================
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearBettingBonusMessage());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // ======================================================
  // SUBMIT
  // ======================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    const value = Number(percentage);

    if (Number.isNaN(value)) {
      return;
    }

    if (value < 0 || value > 100) {
      return;
    }

    dispatch(
      updateBettingBonus({
        percentage: value,
        isActive,
      })
    );
  };

  // ======================================================
  // LOADING
  // ======================================================
  if (loading && !bonus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-sm">
          Loading betting bonus...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Betting Bonus
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Configure the referral bonus given after a winning bet.
          </p>
        </div>

        {/* ==================================================
            SUCCESS
        ================================================== */}
        {success && (
          <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Betting bonus settings updated successfully.
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            CARD
        ================================================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Card Header */}
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Bonus Configuration
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Set the percentage that a referrer receives from a
              referred user's winning amount.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5">

            {/* ==================================================
                PERCENTAGE
            ================================================== */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bonus Percentage
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="Enter bonus percentage"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  %
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Example: Set <b>1</b> for a 1% referral bonus.
              </p>
            </div>

            {/* ==================================================
                ACTIVE TOGGLE
            ================================================== */}
            <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">

              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Betting Bonus Status
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Enable or disable the referral betting bonus.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  isActive
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    isActive
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* STATUS */}
            <div className="mb-6">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isActive ? "Bonus Active" : "Bonus Disabled"}
              </span>
            </div>

            {/* ==================================================
                EXAMPLE
            ================================================== */}
            <div className="mb-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Example
              </h3>

              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  Winning Amount:{" "}
                  <strong>₹1,000</strong>
                </p>

                <p>
                  Bonus Percentage:{" "}
                  <strong>{percentage || 0}%</strong>
                </p>

                <p>
                  Referral Bonus:{" "}
                  <strong>
                    ₹
                    {(
                      (1000 * Number(percentage || 0)) /
                      100
                    ).toFixed(2)}
                  </strong>
                </p>
              </div>
            </div>

            {/* ==================================================
                SAVE
            ================================================== */}
            <button
              type="submit"
              disabled={updating}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 transition"
            >
              {updating ? "Saving..." : "Save Betting Bonus"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminBettingBonus;