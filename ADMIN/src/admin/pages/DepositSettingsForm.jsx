// src/pages/admin/components/DepositSettingsForm.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveDepositSettings,
  selectSettingsSaving,
  selectSettingsError,
  clearError,
} from '../redux/depositSettingsSlice';
import PaymentMethodForm from './PaymentMethodForm';
import {
  X,
  Save,
  Plus,
  Edit,
  Trash2,
  Globe,
  DollarSign,
  CreditCard,
  Info,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Wallet,
  Bitcoin,
  Mail,
  Smartphone,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Complete country list with currency codes and symbols
const countries = [
  {
    code: "AU",
    name: "Australian",
    currency: "AUD",
    symbol: "A$",
  },
  {
    code: "IN",
    name: "India",
    currency: "INR",
    symbol: "₹",
  },
  {
    code: "PK",
    name: "Pakistan",
    currency: "PKR",
    symbol: "Rs",
  },
  {
    code: "BD",
    name: "Bangladesh",
    currency: "BDT",
    symbol: "৳",
  },
  {
    code: "NP",
    name: "Nepal",
    currency: "NPR",
    symbol: "Rs",
  },
  {
    code: "AE",
    name: "Dubai",
    currency: "AED",
    symbol: "د.إ",
  },
];


// ============================
// Components
// ============================

// Form Field Component
const FormField = ({ label, name, value, onChange, type = "text", required, placeholder, readOnly, disabled, icon: Icon, children, helpText }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
      )}
      {children ? (
        <div className="relative">
          {children}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none ${Icon ? 'pl-10' : ''} ${readOnly || disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          required={required}
        />
      )}
    </div>
    {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
  </div>
);

// Payment Method Card
const PaymentMethodCard = ({ method, index, onEdit, onDelete, currencySymbol, saving }) => {
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

  const Icon = getMethodIcon(method.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`p-2 rounded-lg ${getMethodColor(method.type)}`}>
            <Icon size={18} />
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getMethodColor(method.type)}`}>
            {method.type}
          </span>
          <span className="font-medium text-gray-800">{method.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${method.status ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
            {method.status ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {method.status ? 'Active' : 'Inactive'}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-xs">↓</span>
              {currencySymbol}{method.minimumDeposit || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-xs">↑</span>
              {currencySymbol}{method.maximumDeposit || 'N/A'}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => onEdit(index)}
              disabled={saving}
              title="Edit Method"
            >
              <Edit size={16} className="text-gray-500" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              onClick={() => onDelete(index)}
              disabled={saving}
              title="Delete Method"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================
// Main Component
// ============================

const DepositSettingsForm = ({ country, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const saving = useSelector(selectSettingsSaving);
  const error = useSelector(selectSettingsError);

  const [formData, setFormData] = useState({
    country: '',
    countryName: '',
    currency: 'USD',
    currencySymbol: '$',
    methods: [],
  });

  const [editingMethodIndex, setEditingMethodIndex] = useState(null);
  const [showMethodForm, setShowMethodForm] = useState(false);

  useEffect(() => {
    if (country) {
      const countryData = countries.find(c => c.code === country.country);
      setFormData({
        country: country.country || '',
        countryName: country.countryName || '',
        currency: country.currency || countryData?.currency || 'USD',
        currencySymbol: country.currencySymbol || countryData?.symbol || '$',
        methods: country.methods || [],
      });
    } else {
      setFormData({
        country: '',
        countryName: '',
        currency: 'USD',
        currencySymbol: '$',
        methods: [],
      });
    }
    window.scrollTo(0, 0);
  }, [country]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'country') {
      const selectedCountry = countries.find(c => c.code === value);
      setFormData((prev) => ({
        ...prev,
        country: value,
        countryName: selectedCountry ? selectedCountry.name : '',
        currency: selectedCountry ? selectedCountry.currency : 'USD',
        currencySymbol: selectedCountry ? selectedCountry.symbol : '$',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddMethod = () => {
    setEditingMethodIndex(null);
    setShowMethodForm(true);
  };

  const handleEditMethod = (index) => {
    setEditingMethodIndex(index);
    setShowMethodForm(true);
  };

  const handleDeleteMethod = (index) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setFormData((prev) => ({
        ...prev,
        methods: prev.methods.filter((_, i) => i !== index),
      }));
      toast.info('Payment method removed');
    }
  };

  const handleSaveMethod = (methodData) => {
    if (editingMethodIndex !== null) {
      setFormData((prev) => ({
        ...prev,
        methods: prev.methods.map((method, index) =>
          index === editingMethodIndex ? methodData : method
        ),
      }));
      toast.success('✅ Payment method updated!');
    } else {
      setFormData((prev) => ({
        ...prev,
        methods: [...prev.methods, {
          ...methodData,
          sortOrder: prev.methods.length + 1
        }],
      }));
      toast.success('✅ Payment method added!');
    }
    setShowMethodForm(false);
    setEditingMethodIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country || !formData.countryName || !formData.currency) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.methods.length === 0) {
      toast.error('Please add at least one payment method.');
      return;
    }

    const submitData = {
      country: formData.country,
      countryName: formData.countryName,
      currency: formData.currency,
      currencySymbol: formData.currencySymbol,
      methods: formData.methods,
    };

    const result = await dispatch(saveDepositSettings(submitData));
    if (result.payload?.success) {
      onSuccess();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-3xl flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {country ? 'Edit Country Settings' : 'Add New Country'}
              </h2>
              <p className="text-purple-100 text-sm">
                {country ? `Editing ${country.countryName}` : 'Configure deposit settings for a country'}
              </p>
            </div>
          </div>
          <button
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="m-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                icon={Globe}
                disabled={!!country}
                helpText="Select a country to auto-fill details"
              >
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!!country}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select a country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code}) - {c.currency} {c.symbol}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Country Name"
                name="countryName"
                value={formData.countryName}
                onChange={handleInputChange}
                required
                readOnly={!!formData.country}
                helpText={formData.country ? 'Auto-filled from country selection' : 'Auto-fills when country is selected'}
              />

              <FormField
                label="Currency Code"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                required
                icon={DollarSign}
                readOnly={!!formData.country}
                helpText={formData.country ? 'Auto-filled from country selection' : 'Auto-fills when country is selected'}
              />

              <FormField
                label="Currency Symbol"
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleInputChange}
                required
                readOnly={!!formData.country}
                helpText={formData.country ? 'Auto-filled from country selection' : 'Auto-fills when country is selected'}
              />
            </div>

            {/* Selected Country Info Card */}
            {formData.country && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{formData.currencySymbol}</span>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {formData.countryName} ({formData.country})
                    </p>
                    <p className="text-sm text-gray-600">
                      Currency: {formData.currency} ({formData.currencySymbol})
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Payment Methods
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({formData.methods.length})
                </span>
              </h3>
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                onClick={handleAddMethod}
                disabled={saving}
              >
                <Plus size={16} />
                Add Method
              </button>
            </div>

            <div className="space-y-3">
              {formData.methods.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300"
                >
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No payment methods added yet.</p>
                  <button
                    type="button"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 mx-auto shadow-md hover:shadow-lg"
                    onClick={handleAddMethod}
                    disabled={saving}
                  >
                    <Plus size={16} />
                    Add Your First Method
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {formData.methods.map((method, index) => (
                    <PaymentMethodCard
                      key={index}
                      method={method}
                      index={index}
                      onEdit={handleEditMethod}
                      onDelete={handleDeleteMethod}
                      currencySymbol={formData.currencySymbol}
                      saving={saving}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>

        {/* Payment Method Form Modal */}
        <AnimatePresence>
          {showMethodForm && (
            <PaymentMethodForm
              method={editingMethodIndex !== null ? formData.methods[editingMethodIndex] : null}
              onSave={handleSaveMethod}
              onClose={() => {
                setShowMethodForm(false);
                setEditingMethodIndex(null);
              }}
              currencySymbol={formData.currencySymbol}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DepositSettingsForm;