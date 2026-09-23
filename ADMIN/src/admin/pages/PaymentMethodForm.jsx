// pages/admin/components/PaymentMethodForm.jsx
import React, { useState, useEffect } from 'react';

const PaymentMethodForm = ({ method, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    icon: '',
    description: '',
    details: {},
    minimumDeposit: 100,
    maximumDeposit: 1000000,
    processingTime: '5-30 Minutes',
    status: true,
    sortOrder: 1,
  });

  const [dynamicFields, setDynamicFields] = useState([]);

  useEffect(() => {
    if (method) {
      setFormData({
        ...method,
        details: method.details || {},
      });
      generateDynamicFields(method.type);
    }
    window.scrollTo(0, 0);

  }, [method]);

  const generateDynamicFields = (type) => {
    const fields = [];
    switch (type?.toUpperCase()) {
      case 'UPI':
        fields.push(
          { key: 'upiId', label: 'UPI ID', type: 'text', required: true, placeholder: 'example@upi' },
          { key: 'qrCode', label: 'QR Code URL', type: 'text', required: false, placeholder: 'https://example.com/qr.png' }
        );
        break;
      case 'BANK':
        fields.push(
          { key: 'accountNumber', label: 'Account Number', type: 'text', required: true, placeholder: '1234567890' },
          { key: 'accountName', label: 'Account Name', type: 'text', required: true, placeholder: 'John Doe' },
          { key: 'bankName', label: 'Bank Name', type: 'text', required: true, placeholder: 'Bank of America' },
          { key: 'ifscCode', label: 'IFSC Code / Routing Number', type: 'text', required: false, placeholder: 'IFSC1234567' },
          { key: 'branch', label: 'Branch', type: 'text', required: false, placeholder: 'Main Branch' }
        );
        break;
      case 'CRYPTO':
        fields.push(
          { key: 'walletAddress', label: 'Wallet Address', type: 'text', required: true, placeholder: '0x123...abc' },
          { key: 'network', label: 'Network', type: 'text', required: false, placeholder: 'ERC20, BEP20, TRC20' },
          { key: 'qrCode', label: 'QR Code URL', type: 'text', required: false, placeholder: 'https://example.com/qr.png' }
        );
        break;
      case 'PAYPAL':
        fields.push(
          { key: 'email', label: 'PayPal Email', type: 'email', required: true, placeholder: 'business@example.com' }
        );
        break;
      case 'JAZZCASH':
        fields.push(
          { key: 'accountNumber', label: 'JazzCash Number', type: 'text', required: true, placeholder: '03XX-XXXXXXX' },
          { key: 'accountName', label: 'Account Name', type: 'text', required: true, placeholder: 'John Doe' }
        );
        break;
      case 'EASYPEISA':
        fields.push(
          { key: 'accountNumber', label: 'EasyPaisa Number', type: 'text', required: true, placeholder: '03XX-XXXXXXX' },
          { key: 'accountName', label: 'Account Name', type: 'text', required: true, placeholder: 'John Doe' }
        );
        break;
      default:
        fields.push(
          { key: 'details', label: 'Payment Details', type: 'textarea', required: true, placeholder: 'Enter payment details...' }
        );
    }
    setDynamicFields(fields);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDynamicFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value,
      },
    }));
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type,
      details: {},
    }));
    generateDynamicFields(type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const missingRequired = dynamicFields
      .filter((field) => field.required)
      .some((field) => !formData.details[field.key]);

    if (missingRequired) {
      alert('Please fill in all required fields.');
      return;
    }

    onSave(formData);
  };

  const getTypeOptions = () => {
    return [
      'UPI', 'BANK', 'CRYPTO', 'PAYPAL',
      'JAZZCASH', 'EASYPEISA', 'OTHER'
    ];
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-credit-card text-purple-600"></i>
            {method ? 'Edit Payment Method' : 'Add Payment Method'}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select Type</option>
                {getTypeOptions().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Google Pay, Bank Transfer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (optional)
              </label>
              <input type="text"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="FontAwesome class or image URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <small className="text-xs text-gray-400">e.g., fab fa-google-pay</small>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Time
              </label>
              <input
                type="text"
                name="processingTime"
                value={formData.processingTime}
                onChange={handleInputChange}
                placeholder="e.g., 5-30 Minutes"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Deposit
              </label>
              <input
                type="number"
                name="minimumDeposit"
                value={formData.minimumDeposit}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Deposit
              </label>
              <input
                type="number"
                name="maximumDeposit"
                value={formData.maximumDeposit}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
              placeholder="Additional description for this payment method"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Dynamic Fields */}
          {dynamicFields.length > 0 && (
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i className="fas fa-info-circle text-purple-600"></i>
                Payment Details
              </h4>
              {dynamicFields.map((field) => (
                <div key={field.key} className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && ' *'}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData.details[field.key] || ''}
                      onChange={(e) =>
                        handleDynamicFieldChange(field.key, e.target.value)
                      }
                      rows="3"
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData.details[field.key] || ''}
                      onChange={(e) =>
                        handleDynamicFieldChange(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              Active
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                min="1"
                className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <small className="text-xs text-gray-400 ml-2">Lower number appears first</small>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <i className="fas fa-save"></i>
              {method ? 'Update Method' : 'Add Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodForm;