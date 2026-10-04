// src/pages/admin/DepositSettingsAdmin.jsx
//
// India-only deposit method manager.
// No country UI — the platform serves India (INR) only, so this
// page directly manages the payment methods shown on /deposit:
// add / edit / delete / toggle active.

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllDepositSettings,
  saveDepositSettings,
  clearError,
  clearSuccess,
  selectAllSettings,
  selectSettingsLoading,
  selectSettingsError,
  selectSettingsSuccess,
  selectSettingsSaving,
} from '../redux/depositSettingsSlice';
import PaymentMethodForm from './PaymentMethodForm';
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Building,
  Bitcoin,
  Mail,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// India-only platform — fixed settings doc
const INDIA = {
  country: 'IN',
  countryName: 'India',
  currency: 'INR',
  currencySymbol: '₹',
};

const getMethodIcon = (type) => {
  const icons = {
    UPI: Smartphone,
    BANK: Building,
    CRYPTO: Bitcoin,
    PAYPAL: Mail,
    JAZZCASH: Smartphone,
    EASYPEISA: Smartphone,
  };
  return icons[type] || CreditCard;
};

const getMethodColor = (type) => {
  const colors = {
    UPI: 'bg-blue-100 text-blue-700 border-blue-200',
    BANK: 'bg-green-100 text-green-700 border-green-200',
    CRYPTO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PAYPAL: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    JAZZCASH: 'bg-purple-100 text-purple-700 border-purple-200',
    EASYPEISA: 'bg-pink-100 text-pink-700 border-pink-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const DepositSettingsAdmin = () => {
  const dispatch = useDispatch();

  const settings = useSelector(selectAllSettings);
  const loading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);
  const success = useSelector(selectSettingsSuccess);
  const saving = useSelector(selectSettingsSaving);

  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  useEffect(() => {
    dispatch(getAllDepositSettings());
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('✅ Saved successfully!');
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  // India doc (or the only existing doc) — its methods are what
  // the /deposit page shows
  const doc = useMemo(
    () => settings.find((s) => s.country === INDIA.country) || settings[0] || null,
    [settings],
  );

  const methods = useMemo(
    () => (Array.isArray(doc?.methods) ? doc.methods : []),
    [doc],
  );

  const presetAmounts = useMemo(
    () =>
      Array.isArray(doc?.presetAmounts) ? doc.presetAmounts : [],
    [doc],
  );

  // Methods have no _id (subdoc _id disabled) — key by title
  const methodKey = (m) => m._id || m.title;

  // Editable quick-amount chips (comma separated)
  const [amountsText, setAmountsText] = useState("");
  useEffect(() => {
    setAmountsText(presetAmounts.join(", "));
  }, [presetAmounts.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveAmounts = async () => {
    const parsed = amountsText
      .split(/[,\s]+/)
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v) && v > 0);
    if (parsed.length === 0) {
      toast.error("Enter at least one amount (e.g. 100, 200, 500, 1000)");
      return;
    }
    await persistMethods(methods, parsed);
  };

  // Persist the methods array — upserts the India settings doc
  const persistMethods = async (nextMethods, nextAmounts) => {
    try {
      await dispatch(
        saveDepositSettings({
          ...INDIA,
          methods: nextMethods,
          presetAmounts:
            nextAmounts !== undefined ? nextAmounts : presetAmounts,
        }),
      ).unwrap();
      dispatch(getAllDepositSettings());
    } catch (err) {
      toast.error(err || 'Failed to save');
    }
  };

  const handleSaveMethod = (methodData) => {
    let next;
    if (editingMethod) {
      next = methods.map((m) =>
        methodKey(m) === methodKey(editingMethod)
          ? { ...m, ...methodData }
          : m,
      );
      toast.success('✅ Method updated!');
    } else {
      next = [
        ...methods,
        { ...methodData, sortOrder: methods.length + 1 },
      ];
      toast.success('✅ Method added!');
    }
    setShowForm(false);
    setEditingMethod(null);
    persistMethods(next);
  };

  const handleToggle = (method) => {
    const next = methods.map((m) =>
      methodKey(m) === methodKey(method)
        ? { ...m, status: !m.status }
        : m,
    );
    persistMethods(next);
  };

  const handleDelete = (method) => {
    if (!window.confirm(`Delete "${method.title}"?`)) return;
    const next = methods.filter(
      (m) => methodKey(m) !== methodKey(method),
    );
    persistMethods(next);
    toast.success('🗑️ Method deleted!');
  };

  const stats = useMemo(
    () => ({
      total: methods.length,
      active: methods.filter((m) => m.status).length,
    }),
    [methods],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="text-purple-600" size={28} />
              Deposit Methods
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              India ({INDIA.currency}) • shown on the /deposit page
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => dispatch(getAllDepositSettings())}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <RefreshCw size={18} className="hover:rotate-180 transition-transform duration-500" />
            </button>
            <button
              onClick={() => {
                setEditingMethod(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Method
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          {[
            { title: 'Total Methods', value: stats.total, icon: CreditCard, gradient: 'from-blue-500 to-cyan-600' },
            { title: 'Active Methods', value: stats.active, icon: TrendingUp, gradient: 'from-green-500 to-emerald-600' },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Deposit Amounts editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600" />
              Deposit Amounts (quick chips)
            </h2>
            <span className="text-[11px] text-gray-400">
              Shown on the /deposit page
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Comma separated amounts — e.g. 100, 200, 300, 400, 500, 1000, 2000, 3000, 5000
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={amountsText}
              onChange={(e) => setAmountsText(e.target.value)}
              placeholder="100, 200, 300, 400, 500, 1K, 2K, 3K, 5K"
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-sm"
            />
            <button
              type="button"
              onClick={saveAmounts}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Amounts"}
            </button>
          </div>
          {presetAmounts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {presetAmounts.map((v) => (
                <span
                  key={v}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700"
                >
                  ₹{v}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Methods list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Wallet className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              No deposit methods yet
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              Add a method — it appears on the user's /deposit page instantly.
            </p>
            <button
              onClick={() => {
                setEditingMethod(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              Add Your First Method
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => {
              const Icon = getMethodIcon(method.type);
              return (
                <motion.div
                  key={method._id || method.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border ${getMethodColor(method.type)}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 truncate">
                          {method.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getMethodColor(method.type)}`}
                        >
                          {method.type}
                        </span>
                        {Number(method.details?.bonusPercent) > 0 && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            +{method.details.bonusPercent}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Min ₹{method.minimumDeposit || 0} • Max ₹
                        {method.maximumDeposit || 0}
                        {method.processingTime ? ` • ${method.processingTime}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        method.status
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {method.status ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {method.status ? 'Active' : 'Inactive'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggle(method)}
                      disabled={saving}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        method.status
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {method.status ? 'Hide' : 'Show'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingMethod(method);
                        setShowForm(true);
                      }}
                      disabled={saving}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} className="text-gray-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(method)}
                      disabled={saving}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Method Modal */}
      <AnimatePresence>
        {showForm && (
          <PaymentMethodForm
            method={editingMethod}
            onSave={handleSaveMethod}
            onClose={() => {
              setShowForm(false);
              setEditingMethod(null);
            }}
            currencySymbol={INDIA.currencySymbol}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepositSettingsAdmin;
