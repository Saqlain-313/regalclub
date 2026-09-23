// src/pages/admin/CreateWithdrawalSettings.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createWithdrawalSettings } from "../redux/withdrawalSettingsSlice";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Globe,
  DollarSign,
  Calendar,
  Shield,
  Settings,
  Zap,
  Wallet,
  Award,
  Lock,
  MapPin,
  Banknote,
  Percent,
  Clock,
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

// ============================
// Main Component
// ============================

const CreateWithdrawalSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.withdrawalSettings);

  const [form, setForm] = useState({
    country: "",
    countryName: "",
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
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "country") {
      const selectedCountry = countries.find(c => c.code === value);
      setForm((prev) => ({
        ...prev,
        country: value,
        countryName: selectedCountry ? selectedCountry.name : "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createWithdrawalSettings(form));
    if (!res.error) {
      toast.success("✅ Withdrawal settings created successfully!");
      navigate("/admin/withdrawal-settings");
    }
  };

  const handlePaymentMethodToggle = (method) => {
    setForm((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <button
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
                <p className="text-gray-500 mt-1">Configure withdrawal rules and limits for your platform</p>
              </div>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-md">
            <span className="text-sm text-gray-600">Status: </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {form.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
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
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Country Code <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code} - {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Country Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 cursor-not-allowed"
                    name="countryName"
                    value={form.countryName}
                    onChange={handleChange}
                    required
                    readOnly
                    placeholder="Select country code first"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    placeholder="e.g., INR, USD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="currencySymbol"
                    value={form.currencySymbol}
                    onChange={handleChange}
                    placeholder="e.g., ₹, $"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Amount Limits */}
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
              <h3 className="text-lg font-semibold text-white">Amount Limits</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minimum Withdrawal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="minWithdrawal"
                    value={form.minWithdrawal}
                    onChange={handleChange}
                    step="1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Maximum Withdrawal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="maxWithdrawal"
                    value={form.maxWithdrawal}
                    onChange={handleChange}
                    step="1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Suspicious Amount Threshold
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="suspiciousAmountThreshold"
                    value={form.suspiciousAmountThreshold}
                    onChange={handleChange}
                    step="1"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Time Limits */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Daily Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="dailyLimit"
                    value={form.dailyLimit}
                    onChange={handleChange}
                    step="1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Weekly Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="weeklyLimit"
                    value={form.weeklyLimit}
                    onChange={handleChange}
                    step="1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Monthly Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="monthlyLimit"
                    value={form.monthlyLimit}
                    onChange={handleChange}
                    step="1"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Processing & Fees */}
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
              <h3 className="text-lg font-semibold text-white">Processing & Fees</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Processing Time
                  </label>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="processingTime"
                    value={form.processingTime}
                    onChange={handleChange}
                    placeholder="e.g., 24-48 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Processing Fee
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="processingFee"
                    value={form.processingFee}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Fee Type
                  </label>
                  <select
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white"
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

          {/* User Requirements */}
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
              <h3 className="text-lg font-semibold text-white">User Requirements</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minimum Account Age (days)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="minAccountAge"
                    value={form.minAccountAge}
                    onChange={handleChange}
                    step="1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minimum Games Played
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="minGamesPlayed"
                    value={form.minGamesPlayed}
                    onChange={handleChange}
                    step="1"
                    min="0"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="verificationRequired"
                      name="verificationRequired"
                      checked={form.verificationRequired}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 transition-all duration-200"
                    />
                    <label htmlFor="verificationRequired" className="text-sm font-medium text-gray-700">
                      Verification Required
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Withdrawal Frequency Limits */}
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
              <h3 className="text-lg font-semibold text-white">Withdrawal Frequency Limits</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max Withdrawals Per Day <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="maxWithdrawalsPerDay"
                    value={form.maxWithdrawalsPerDay}
                    onChange={handleChange}
                    step="1"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max Withdrawals Per Week <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
                    name="maxWithdrawalsPerWeek"
                    value={form.maxWithdrawalsPerWeek}
                    onChange={handleChange}
                    step="1"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
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
              <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "upi", label: "UPI", icon: CreditCard },
                  { value: "bank_transfer", label: "Bank Transfer", icon: Building },
                  { value: "crypto", label: "Cryptocurrency", icon: Wallet },
                  { value: "paypal", label: "PayPal", icon: Mail },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${form.paymentMethods.includes(method.value)
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.paymentMethods.includes(method.value)}
                      onChange={() => handlePaymentMethodToggle(method.value)}
                      className="hidden"
                    />
                    <method.icon className={`w-5 h-5 ${form.paymentMethods.includes(method.value) ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${form.paymentMethods.includes(method.value) ? 'text-purple-700' : 'text-gray-600'}`}>
                      {method.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Status */}
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
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 transition-all duration-200"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
                <div className="ml-auto flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
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