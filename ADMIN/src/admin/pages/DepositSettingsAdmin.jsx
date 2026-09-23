// src/pages/admin/DepositSettingsAdmin.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllDepositSettings,
  deleteDepositSettings,
  clearError,
  clearSuccess,
  selectAllSettings,
  selectSettingsLoading,
  selectSettingsError,
  selectSettingsSuccess,
  selectSettingsDeleting,
} from '../redux/depositSettingsSlice';
import DepositSettingsForm from './DepositSettingsForm';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Globe,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  Wallet,
  TrendingUp,
  Building,
  ChevronRight,
  DollarSign,
  Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// ============================
// Helper: Get Flag Image URL
// ============================
const getFlagUrl = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) {
    return 'https://flagcdn.com/w80/un.png'; // fallback: UN flag
  }
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

// ============================
// Components
// ============================

// Loading Skeleton
const SettingSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse border border-gray-100"
      >
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
            <div className="flex-1">
              <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/4"></div>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg flex-1"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg flex-1"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State
const EmptyState = ({ onAdd }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
      <Globe className="w-12 h-12 text-purple-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Countries Configured</h3>
    <p className="text-gray-400 mb-6 max-w-md mx-auto">
      Start by adding deposit settings for a country to enable payment methods for your users.
    </p>
    <button
      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
      onClick={onAdd}
    >
      <Plus size={20} />
      Add First Country
    </button>
  </motion.div>
);

// Country Card
const CountryCard = ({ item, onEdit, onDelete, deleting }) => {
  const activeMethods = item.methods?.filter((m) => m.status).length || 0;
  const totalMethods = item.methods?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          {/* Country Flag Image */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <img
              src={getFlagUrl(item.country)}
              alt={item.countryName || 'Country Flag'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://flagcdn.com/w80/un.png';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">
              {item.countryName || 'Unknown Country'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <DollarSign size={12} />
                {item.currency || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                <Globe size={12} />
                {item.country || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center border-t border-b border-gray-100 py-3 mb-4">
          <div className="text-gray-600 text-sm flex items-center gap-2">
            <CreditCard size={16} className="text-gray-400" />
            <span>{totalMethods} Payment Methods</span>
          </div>
          <div className="text-green-600 text-sm font-medium flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{activeMethods} Active</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            onClick={() => onEdit(item)}
            disabled={deleting}
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            onClick={() => onDelete(item._id, item.countryName)}
            disabled={deleting}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================
// Main Component
// ============================

const DepositSettingsAdmin = () => {
  const dispatch = useDispatch();

  const settings = useSelector(selectAllSettings);
  const loading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);
  const success = useSelector(selectSettingsSuccess);
  const deleting = useSelector(selectSettingsDeleting);

  const [showForm, setShowForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllDepositSettings());
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('✅ Settings saved successfully!');
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  const handleEdit = (country) => {
    setEditingCountry(country);
    setShowForm(true);
  };

  const handleDelete = async (id, countryName) => {
    if (window.confirm(`Are you sure you want to delete settings for ${countryName}?`)) {
      try {
        await dispatch(deleteDepositSettings(id));
        toast.success(`🗑️ Settings for ${countryName} deleted successfully!`);
        dispatch(getAllDepositSettings());
      } catch (error) {
        toast.error('Failed to delete settings');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCountry(null);
  };

  const handleFormSuccess = () => {
    dispatch(getAllDepositSettings());
    handleFormClose();
  };

  const handleAddNew = () => {
    setEditingCountry(null);
    setShowForm(true);
  };

  const filteredSettings = useMemo(() => {
    return settings.filter(
      (item) =>
        item.countryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.currency?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [settings, searchTerm]);

  const stats = useMemo(() => ({
    total: settings.length,
    activeCountries: settings.filter(item => 
      item.methods?.some(m => m.status)
    ).length,
    totalMethods: settings.reduce((acc, item) => acc + (item.methods?.length || 0), 0),
    totalActiveMethods: settings.reduce((acc, item) => 
      acc + (item.methods?.filter(m => m.status).length || 0), 0
    ),
  }), [settings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="text-purple-600" size={28} />
              Deposit Settings
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {stats.total} countries • {stats.totalActiveMethods} active methods
            </p>
          </div>

          <button
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            onClick={handleAddNew}
          >
            <Plus size={20} />
            Add New Country
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { title: 'Total Countries', value: stats.total, icon: Globe, color: 'purple', gradient: 'from-purple-500 to-indigo-600' },
            { title: 'Active Countries', value: stats.activeCountries, icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-emerald-600' },
            { title: 'Payment Methods', value: stats.totalMethods, icon: CreditCard, color: 'blue', gradient: 'from-blue-500 to-cyan-600' },
            { title: 'Active Methods', value: stats.totalActiveMethods, icon: TrendingUp, color: 'orange', gradient: 'from-orange-500 to-amber-600' },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 mb-6 border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by country name, code, or currency..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                dispatch(getAllDepositSettings());
                toast.info('🔄 Refreshing settings...');
              }}
              className="inline-flex items-center px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200 gap-2"
            >
              <RefreshCw size={18} className="hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Settings Grid */}
        {loading ? (
          <SettingSkeleton count={6} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredSettings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSettings.map((item) => (
                    <CountryCard
                      key={item._id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleting={deleting}
                    />
                  ))}
                </div>
                {filteredSettings.length < settings.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center text-sm text-gray-500 bg-white rounded-xl py-3 px-4 shadow-sm border border-gray-100"
                  >
                    Showing {filteredSettings.length} of {settings.length} countries
                  </motion.div>
                )}
              </>
            ) : (
              <EmptyState onAdd={handleAddNew} />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <DepositSettingsForm
            country={editingCountry}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepositSettingsAdmin;