// pages/All_Withdrawal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Wallet,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  History,
  Gift,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Import from withdrawal slice
import {
  fetchWithdrawalSettings,
  fetchWithdrawalHistory,
  requestWithdrawal,
  clearWithdrawalError,
  clearWithdrawalSuccess,
  selectWithdrawalSettings,
  selectSettingsLoading,
  selectSettingsError,
  selectWithdrawalHistory,
  selectHistoryLoading,
  selectSummary,
  selectPagination,
  selectRequestLoading,
  selectRequestError,
  selectRequestSuccess,
  selectCurrentWithdrawal,
  selectWithdrawalError,
  selectWithdrawalMessage,
} from "../redux/slices/withdrawalSlice";

// Helper function to get currency symbol based on country
const getCurrencySymbol = (country) => {
  const symbols = {
    'IN': '₹',
    'US': '$',
    'GB': '£',
    'EU': '€',
    'JP': '¥',
    'CN': '¥',
    'AU': '$',
    'CA': '$',
    'default': '₹'
  };
  return symbols[country] || symbols.default;
};

const AllWithdrawal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Redux state
  const settings = useSelector(selectWithdrawalSettings);
  const settingsLoading = useSelector(selectSettingsLoading);
  const settingsError = useSelector(selectSettingsError);
  const withdrawalHistory = useSelector(selectWithdrawalHistory);
  const historyLoading = useSelector(selectHistoryLoading);
  const summary = useSelector(selectSummary);
  const pagination = useSelector(selectPagination);
  const requestLoading = useSelector(selectRequestLoading);
  const requestError = useSelector(selectRequestError);
  const requestSuccess = useSelector(selectRequestSuccess);
  const currentWithdrawal = useSelector(selectCurrentWithdrawal);
  const error = useSelector(selectWithdrawalError);
  const message = useSelector(selectWithdrawalMessage);

  // Get currency symbol based on user's country
  const currencySymbol = getCurrencySymbol(user?.country);
  
  // Format currency function
  const formatCurrency = (amount) => {
    return `${currencySymbol}${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Local state
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "",
    bankDetails: {
      accountNumber: "",
      accountHolderName: "",
      bankName: "",
      ifscCode: "",
      branchName: "",
    },
    upiDetails: {
      upiId: "",
      upiName: "",
    },
    paypalDetails: {
      email: "",
    },
    cryptoDetails: {
      walletAddress: "",
      network: "BTC",
    },
  });

  const [formErrors, setFormErrors] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [fee, setFee] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch withdrawal settings and history
  useEffect(() => {
    dispatch(fetchWithdrawalSettings());
    dispatch(fetchWithdrawalHistory());
  }, [dispatch]);

  // Handle success state
  useEffect(() => {
    if (requestSuccess && currentWithdrawal) {
      setShowSuccessModal(true);
      // Reset form
      setFormData(prev => ({
        ...prev,
        amount: "",
      }));
      setFee(0);
      setNetAmount(0);
      
      // Refresh history
      dispatch(fetchWithdrawalHistory());
      
      // Auto close modal after 5 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        dispatch(clearWithdrawalSuccess());
      }, 5000);
    }
  }, [requestSuccess, currentWithdrawal, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearWithdrawalError());
    }
    if (requestError) {
      toast.error(requestError);
      dispatch(clearWithdrawalError());
    }
    if (settingsError) {
      toast.error(settingsError);
      dispatch(clearWithdrawalError());
    }
  }, [error, requestError, settingsError, dispatch]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Calculate fee and net amount when amount changes
    if (name === 'amount') {
      calculateFeeAndNet(value, formData.paymentMethod);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method
    }));
    setSelectedPaymentMethod(method);
    setFormErrors({});
    
    // Recalculate fee with new method
    calculateFeeAndNet(formData.amount, method);
  };

  const calculateFeeAndNet = (amount, method) => {
    if (!amount || !settings) {
      setFee(0);
      setNetAmount(0);
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFee(0);
      setNetAmount(0);
      return;
    }
    
    let calculatedFee = 0;
    if (settings.processingFeeType === 'percentage') {
      calculatedFee = (numAmount * settings.processingFee) / 100;
    } else {
      calculatedFee = settings.processingFee || 0;
    }
    
    setFee(calculatedFee);
    setNetAmount(numAmount - calculatedFee);
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.amount) {
      errors.amount = "Please enter withdrawal amount";
    } else if (parseFloat(formData.amount) < settings?.minWithdrawal) {
      errors.amount = `Minimum withdrawal amount is ${currencySymbol}${settings?.minWithdrawal}`;
    } else if (parseFloat(formData.amount) > settings?.maxWithdrawal) {
      errors.amount = `Maximum withdrawal amount is ${currencySymbol}${settings?.maxWithdrawal}`;
    } else if (parseFloat(formData.amount) > user?.credit) {
      errors.amount = `Insufficient credit. Available: ${formatCurrency(user?.credit)}`;
    }
    
    if (!formData.paymentMethod) {
      errors.paymentMethod = "Please select a payment method";
    }
    
    // Validate payment method specific fields
    const method = formData.paymentMethod;
    if (method === 'bank_transfer') {
      if (!formData.bankDetails.accountNumber) {
        errors['bankDetails.accountNumber'] = "Account number is required";
      }
      if (!formData.bankDetails.accountHolderName) {
        errors['bankDetails.accountHolderName'] = "Account holder name is required";
      }
      if (!formData.bankDetails.bankName) {
        errors['bankDetails.bankName'] = "Bank name is required";
      }
      if (!formData.bankDetails.ifscCode) {
        errors['bankDetails.ifscCode'] = "IFSC code is required";
      }
    } else if (['upi', 'phonepe', 'googlepay', 'paytm'].includes(method)) {
      if (!formData.upiDetails.upiId) {
        errors['upiDetails.upiId'] = "UPI ID is required";
      }
      if (!formData.upiDetails.upiName) {
        errors['upiDetails.upiName'] = "UPI holder name is required";
      }
    } else if (['paypal', 'skrill', 'neteller'].includes(method)) {
      if (!formData.paypalDetails.email) {
        errors['paypalDetails.email'] = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalDetails.email)) {
        errors['paypalDetails.email'] = "Please enter a valid email address";
      }
    } else if (method === 'crypto') {
      if (!formData.cryptoDetails.walletAddress) {
        errors['cryptoDetails.walletAddress'] = "Wallet address is required";
      }
      if (!formData.cryptoDetails.network) {
        errors['cryptoDetails.network'] = "Network is required";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit withdrawal using Redux
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    const withdrawalData = {
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
    };
    
    // Add payment method specific details
    const method = formData.paymentMethod;
    if (method === 'bank_transfer') {
      withdrawalData.bankDetails = formData.bankDetails;
    } else if (['upi', 'phonepe', 'googlepay', 'paytm'].includes(method)) {
      withdrawalData.upiDetails = formData.upiDetails;
    } else if (['paypal', 'skrill', 'neteller'].includes(method)) {
      withdrawalData.paypalDetails = formData.paypalDetails;
    } else if (method === 'crypto') {
      withdrawalData.cryptoDetails = formData.cryptoDetails;
    }
    
    dispatch(requestWithdrawal(withdrawalData));
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      bank_transfer: <Building2 size={16} />,
      upi: <Phone size={16} />,
      phonepe: <Phone size={16} />,
      googlepay: <Phone size={16} />,
      paytm: <Phone size={16} />,
      paypal: <Mail size={16} />,
      skrill: <Mail size={16} />,
      neteller: <Mail size={16} />,
      crypto: <CreditCard size={16} />,
    };
    return icons[method] || <CreditCard size={16} />;
  };

  // Get payment method display name
  const getPaymentMethodName = (method) => {
    const names = {
      bank_transfer: 'Bank Transfer',
      upi: 'UPI',
      phonepe: 'PhonePe',
      googlepay: 'Google Pay',
      paytm: 'Paytm',
      paypal: 'PayPal',
      skrill: 'Skrill',
      neteller: 'Neteller',
      crypto: 'Cryptocurrency',
    };
    return names[method] || method;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading withdrawal settings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (settingsError && !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Withdrawal Not Available</h2>
          <p className="text-gray-600 mb-4">
            {settingsError || "Withdrawal settings are not configured for your country. Please contact support."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Withdraw Funds</h1>
                <p className="text-sm text-gray-500">Withdraw your winnings securely</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
              <Wallet className="text-yellow-500" size={20} />
              <div>
                <p className="text-xs text-gray-500">Available credit</p>
                <p className="text-lg font-bold text-yellow-600">
                  {formatCurrency(user?.credit || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit}>
                {/* Withdrawal Limits Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="text-blue-500 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Withdrawal Limits</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-blue-700">
                        <div>
                          <span className="text-blue-500">Min:</span> {formatCurrency(settings?.minWithdrawal || 0)}
                        </div>
                        <div>
                          <span className="text-blue-500">Max:</span> {formatCurrency(settings?.maxWithdrawal || 0)}
                        </div>
                        {settings?.dailyLimit && (
                          <div>
                            <span className="text-blue-500">Daily Limit:</span> {formatCurrency(settings.dailyLimit)}
                          </div>
                        )}
                        {settings?.processingFee > 0 && (
                          <div>
                            <span className="text-blue-500">Fee:</span> {settings.processingFeeType === 'percentage' 
                              ? `${settings.processingFee}%` 
                              : formatCurrency(settings.processingFee)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {currencySymbol}
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder={`Enter amount (min: ${settings?.minWithdrawal || 0})`}
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition ${
                        formErrors.amount ? 'border-red-400' : 'border-gray-300'
                      }`}
                      step="0.01"
                      min={settings?.minWithdrawal || 0}
                      max={settings?.maxWithdrawal || 0}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-message">
                      <AlertCircle size={12} /> {formErrors.amount}
                    </p>
                  )}
                  
                  {/* Fee and Net Amount Display */}
                  {formData.amount && parseFloat(formData.amount) > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Withdrawal Amount:</span>
                        <span className="font-medium">{formatCurrency(parseFloat(formData.amount))}</span>
                      </div>
                      {fee > 0 && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Processing Fee:</span>
                          <span className="text-red-500">-{formatCurrency(fee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold mt-1 pt-1 border-t border-gray-200">
                        <span className="text-gray-700">Net Amount:</span>
                        <span className="text-green-600">{formatCurrency(netAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {settings?.paymentMethods?.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handlePaymentMethodChange(method)}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          selectedPaymentMethod === method
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:border-yellow-300 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {getPaymentMethodIcon(method)}
                          <span>{getPaymentMethodName(method)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {formErrors.paymentMethod && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.paymentMethod}</p>
                  )}
                </div>

                {/* Dynamic Payment Method Fields */}
                {selectedPaymentMethod && (
                  <div className="space-y-4">
                    {/* Bank Transfer */}
                    {selectedPaymentMethod === 'bank_transfer' && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Building2 size={18} /> Bank Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Account Holder Name *</label>
                            <input
                              type="text"
                              name="bankDetails.accountHolderName"
                              value={formData.bankDetails.accountHolderName}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                              placeholder="Enter account holder name"
                            />
                            {formErrors['bankDetails.accountHolderName'] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors['bankDetails.accountHolderName']}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Account Number *</label>
                            <input
                              type="text"
                              name="bankDetails.accountNumber"
                              value={formData.bankDetails.accountNumber}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                              placeholder="Enter account number"
                            />
                            {formErrors['bankDetails.accountNumber'] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors['bankDetails.accountNumber']}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Bank Name *</label>
                            <input
                              type="text"
                              name="bankDetails.bankName"
                              value={formData.bankDetails.bankName}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                              placeholder="Enter bank name"
                            />
                            {formErrors['bankDetails.bankName'] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors['bankDetails.bankName']}</p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">IFSC Code *</label>
                              <input
                                type="text"
                                name="bankDetails.ifscCode"
                                value={formData.bankDetails.ifscCode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                                placeholder="Enter IFSC code"
                                maxLength="11"
                              />
                              {formErrors['bankDetails.ifscCode'] && (
                                <p className="text-red-500 text-xs mt-1">{formErrors['bankDetails.ifscCode']}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">Branch Name (Optional)</label>
                              <input
                                type="text"
                                name="bankDetails.branchName"
                                value={formData.bankDetails.branchName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                                placeholder="Enter branch name"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI */}
                    {['upi', 'phonepe', 'googlepay', 'paytm'].includes(selectedPaymentMethod) && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Phone size={18} /> {getPaymentMethodName(selectedPaymentMethod)} Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">UPI ID *</label>
                            <input
                              type="text"
                              name="upiDetails.upiId"
                              value={formData.upiDetails.upiId}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                              placeholder="e.g., user@paytm"
                            />
                            {formErrors['upiDetails.upiId'] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors['upiDetails.upiId']}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">UPI Holder Name *</label>
                            <input
                              type="text"
                              name="upiDetails.upiName"
                              value={formData.upiDetails.upiName}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                              placeholder="Enter UPI holder name"
                            />
                            {formErrors['upiDetails.upiName'] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors['upiDetails.upiName']}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal, Skrill, Neteller */}
                    {['paypal', 'skrill', 'neteller'].includes(selectedPaymentMethod) && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Mail size={18} /> {getPaymentMethodName(selectedPaymentMethod)} Details
                        </h4>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Email Address *</label>
                          <input
                            type="email"
                            name="paypalDetails.email"
                            value={formData.paypalDetails.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                            placeholder="Enter email address"
                          />
                          {formErrors['paypalDetails.email'] && (
                            <p className="text-red-500 text-xs mt-1">{formErrors['paypalDetails.email']}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Crypto */}
                    {selectedPaymentMethod === 'crypto' && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <CreditCard size={18} /> Cryptocurrency Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Network *</label>
                            <select
                              name="cryptoDetails.network"
                              value={formData.cryptoDetails.network}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                            >
                              <option value="BTC">Bitcoin (BTC)</option>
                              <option value="ETH">Ethereum (ETH)</option>
                              <option value="USDT">Tether (USDT)</option>
                              <option value="BSC">Binance Smart Chain</option>
                              <option value="SOL">Solana</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Wallet Address *</label>
                            <input
                              type="text"
                              name="cryptoDetails.walletAddress"
                              value={formData.cryptoDetails.walletAddress}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                              placeholder="Enter wallet address"
                            />
                            {formErrors['cryptoDetails.walletAddress'] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors['cryptoDetails.walletAddress']}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={requestLoading || !selectedPaymentMethod}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/30"
                >
                  {requestLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </span>
                  ) : (
                    `Request Withdrawal (${formatCurrency(netAmount || 0)})`
                  )}
                </button>

                {/* Processing Time Info */}
                {settings?.processingTime && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    <span>Processing time: {settings.processingTime}</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp size={18} className="text-yellow-500" />
                Withdrawal Summary
              </h3>
              <div className="space-y-2">
                {summary && summary.length > 0 ? (
                  summary.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{item._id}</span>
                      <span className="font-medium">
                        {item.count} ({formatCurrency(item.totalAmount)})
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No withdrawals yet</p>
                )}
              </div>
            </div>

            {/* Quick Actions - Updated to navigate to history page */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <button
                onClick={() => navigate('/withdrawal-history')}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-gray-700">
                  <History size={18} />
                  <span className="font-medium">View All History</span>
                </span>
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Gift size={18} className="text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Need Help?</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Contact our support team for assistance with your withdrawal.
                  </p>
                  <button
                    onClick={() => navigate('/support')}
                    className="text-xs text-yellow-500 font-medium hover:underline mt-1"
                  >
                    Contact Support →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && currentWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentWithdrawal.status === 'completed' ? 'Withdrawal Successful!' : 'Withdrawal Request Submitted!'}
              </h3>
              <p className="text-gray-600 mb-4">
                {currentWithdrawal.status === 'completed' 
                  ? 'Your withdrawal has been processed successfully.' 
                  : `Your withdrawal request has been submitted and will be processed within ${settings?.processingTime || '24-48 hours'}.`}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(currentWithdrawal.withdrawal?.amount || currentWithdrawal.amount)}</span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Fee:</span>
                    <span className="text-red-500">-{formatCurrency(fee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-1 font-bold">
                  <span className="text-gray-700">Net Amount:</span>
                  <span className="text-green-600">{formatCurrency(netAmount)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1 pt-1 border-t border-gray-200">
                  <span className="text-gray-600">Status:</span>
                  <span className={`capitalize font-medium ${
                    currentWithdrawal.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {currentWithdrawal.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(clearWithdrawalSuccess());
                  navigate('/dashboard');
                }}
                className="w-full py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdrawal;