// src/pages/admin/CreateWithdrawalSettings.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createWithdrawalSettings,
  resetWithdrawalSettingsState,
} from "../redux/withdrawalSettingsSlice";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Globe,
  Calendar,
  Shield,
  Settings,
  Zap,
  Wallet,
  Lock,
  Banknote,
  CreditCard,
  Building,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// ============================
// Constants
// ============================

const countries = [
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "NP", name: "Nepal" },
  { code: "AE", name: "Dubai" },
];

// Currency defaults per country (optional auto-fill)
const countryCurrencyDefaults = {
  AU: { currency: "AUD", symbol: "A$" },
  IN: { currency: "INR", symbol: "₹" },
  PK: { currency: "PKR", symbol: "₨" },
  BD: { currency: "BDT", symbol: "৳" },
  NP: { currency: "NPR", symbol: "रू" },
  AE: { currency: "AED", symbol: "د.إ" },
};

// ============================
// Main Component
// ============================

const CreateWithdrawalSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.withdrawalSettings);

  const [form, setForm] = useState({
    country: "IN",
    countryName: "India",
    currency: "INR",
    currencySymbol: "₹",
    minWithdrawal: 100,
    maxWithdrawal: 100000,
    dailyLimit: 50000,
    weeklyLimit: 200000,
    monthlyLimit: 500000,
    processingTime: "24-48 hours",
    processingFee: 0,
    processingFeeType: "fixed",
    verificationRequired: true,
    minAccountAge: 1,
    minGamesPlayed: 0,
    isActive: true,
    paymentMethods: ["upi", "bank_transfer"],
    maxWithdrawalsPerDay: 3,
    maxWithdrawalsPerWeek: 10,
    suspiciousAmountThreshold: 10000,
    methodSettings: {
      upi: { minWithdrawal: "", maxWithdrawal: "" },
      bank: { minWithdrawal: "", maxWithdrawal: "" },
      crypto: { minWithdrawal: "", maxWithdrawal: "" },
    },
  });

  // ✅ Reset redux state on mount so `loading` isn't stuck from a previous action
  useEffect(() => {
    dispatch(resetWithdrawalSettingsState());
    window.scrollTo(0, 0);
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  // Per-method limits — "upiBank" sets both UPI and Bank keys,
  // "crypto" sets the USDT key. Empty string = use global limit.
  const handleMethodSettingChange = (keys, field, value) => {
    const parsed = value === "" ? "" : Number(value);
    setForm((prev) => {
      const next = { ...prev.methodSettings };
      keys.forEach((k) => {
        next[k] = { ...next[k], [field]: parsed };
      });
      return { ...prev, methodSettings: next };
    });
  };

  const handlePaymentMethodToggle = (method) => {    setForm((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submit started", form);

    // ✅ Manual validation — country is fixed to India
    if (Number(form.minWithdrawal) > Number(form.maxWithdrawal)) {
      toast.error("Min withdrawal cannot be greater than max withdrawal");
      return;
    }

    // Per-method validation + sanitize: "" -> null (use global)
    const ms = form.methodSettings;
    for (const key of Object.keys(ms)) {
      const min = Number(ms[key].minWithdrawal) || 0;
      const max = Number(ms[key].maxWithdrawal) || 0;
      if (min && max && min > max) {
        toast.error(
          `${key === "crypto" ? "USDT" : "UPI/Bank"}: min cannot be greater than max`,
        );
        return;
      }
    }
    const payload = {
      ...form,
      methodSettings: Object.fromEntries(
        Object.entries(ms).map(([key, v]) => [
          key,
          {
            minWithdrawal: v.minWithdrawal === "" ? null : Number(v.minWithdrawal),
            maxWithdrawal: v.maxWithdrawal === "" ? null : Number(v.maxWithdrawal),
          },
        ]),
      ),
    };

    try {
      const res = await dispatch(createWithdrawalSettings(payload)).unwrap();
      toast.success("✅ Withdrawal settings created successfully!");
      navigate("/admin/withdrawal-settings");
    } catch (err) {
      console.error("❌ API error:", err);
      toast.error(err?.message || "Failed to create withdrawal settings");
    }
  };

  // Common input class
  const inputClass =
    "w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/withdrawal-settings")}
              className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="text-purple-600" size={28} />
                Create Withdrawal Settings
              </h1>
              <p className="text-gray-500 mt-1">
                Configure withdrawal rules and limits for your platform
              </p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-md">
            <span className="text-sm text-gray-600">Status: </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                form.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  form.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========== Basic Information ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Basic Information
              </h3>
            </div>
            <div className="p-6">
              {/* India-only platform — country/currency are fixed */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                <span className="text-3xl">₹</span>
                <div>
                  <p className="font-semibold text-gray-800">
                    India (IN)
                  </p>
                  <p className="text-sm text-gray-600">
                    Currency: INR (₹) — fixed for the whole platform
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== UPI / Bank Card Withdrawals ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                UPI / Bank Card Withdrawals
              </h3>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-400 mb-4">
                Leave empty to use the global Amount Limits above.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    Minimum Withdrawal (₹)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    min="0"
                    value={form.methodSettings.upi.minWithdrawal}
                    onChange={(e) =>
                      handleMethodSettingChange(
                        ["upi", "bank"],
                        "minWithdrawal",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 100"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Maximum Withdrawal (₹)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    min="0"
                    value={form.methodSettings.upi.maxWithdrawal}
                    onChange={(e) =>
                      handleMethodSettingChange(
                        ["upi", "bank"],
                        "maxWithdrawal",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== USDT Withdrawals ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                USDT Withdrawals
              </h3>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-400 mb-4">
                Separate limits for USDT (crypto) withdrawals — leave empty
                to use the global Amount Limits above.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    Minimum Withdrawal (₹)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    min="0"
                    value={form.methodSettings.crypto.minWithdrawal}
                    onChange={(e) =>
                      handleMethodSettingChange(
                        ["crypto"],
                        "minWithdrawal",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 1000"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Maximum Withdrawal (₹)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    min="0"
                    value={form.methodSettings.crypto.maxWithdrawal}
                    onChange={(e) =>
                      handleMethodSettingChange(
                        ["crypto"],
                        "maxWithdrawal",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 100000"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== Amount Limits ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Amount Limits
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>
                    Minimum Withdrawal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="minWithdrawal"
                    value={form.minWithdrawal}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Maximum Withdrawal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="maxWithdrawal"
                    value={form.maxWithdrawal}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Suspicious Amount Threshold
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="suspiciousAmountThreshold"
                    value={form.suspiciousAmountThreshold}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== Time Limits ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Time Limits</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>
                    Daily Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="dailyLimit"
                    value={form.dailyLimit}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Weekly Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="weeklyLimit"
                    value={form.weeklyLimit}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Monthly Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="monthlyLimit"
                    value={form.monthlyLimit}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== Processing & Fees ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Processing & Fees
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Processing Time</label>
                  <input
                    className={inputClass}
                    name="processingTime"
                    value={form.processingTime}
                    onChange={handleChange}
                    placeholder="e.g., 24-48 hours"
                  />
                </div>
                <div>
                  <label className={labelClass}>Processing Fee</label>
                  <input
                    type="number"
                    className={inputClass}
                    name="processingFee"
                    value={form.processingFee}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>Fee Type</label>
                  <select
                    className={inputClass}
                    name="processingFeeType"
                    value={form.processingFeeType}
                    onChange={handleChange}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== User Requirements ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                User Requirements
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>
                    Minimum Account Age (days)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="minAccountAge"
                    value={form.minAccountAge}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>Minimum Games Played</label>
                  <input
                    type="number"
                    className={inputClass}
                    name="minGamesPlayed"
                    value={form.minGamesPlayed}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="verificationRequired"
                      checked={form.verificationRequired}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Verification Required
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== Frequency Limits ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Withdrawal Frequency Limits
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    Max Withdrawals Per Day{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="maxWithdrawalsPerDay"
                    value={form.maxWithdrawalsPerDay}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Max Withdrawals Per Week{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    name="maxWithdrawalsPerWeek"
                    value={form.maxWithdrawalsPerWeek}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== Payment Methods ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Payment Methods
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "upi", label: "UPI", icon: CreditCard },
                  {
                    value: "bank_transfer",
                    label: "Bank Transfer",
                    icon: Building,
                  },
                  { value: "crypto", label: "Cryptocurrency", icon: Wallet },
                  { value: "paypal", label: "PayPal", icon: Mail },
                ].map((method) => {
                  const selected = form.paymentMethods.includes(method.value);
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selected
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handlePaymentMethodToggle(method.value)}
                        className="hidden"
                      />
                      <Icon
                        className={`w-5 h-5 ${
                          selected ? "text-purple-600" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          selected ? "text-purple-700" : "text-gray-600"
                        }`}
                      >
                        {method.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ========== Status ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-4 px-6 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Status</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
                <div className="ml-auto flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      form.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        form.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========== Actions ========== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-end gap-3 pt-4"
          >
            <button
              type="button"
              onClick={() => navigate("/admin/withdrawal-settings")}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Settings
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateWithdrawalSettings;