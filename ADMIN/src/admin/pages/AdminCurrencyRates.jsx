import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrencyRates,
  createCurrencyRate,
  updateCurrencyRate,
  deleteCurrencyRate,
  resetCurrencyState,
} from "../redux/currencyRateSlice";
import { 
  RefreshCw, 
  Edit2, 
  Trash2, 
  Plus, 
  Globe, 
  DollarSign,
  Euro,
  PoundSterling,
  
} from "lucide-react";

const initialForm = {
  countryCode: "",
  currencyCode: "",
  rate: "",
  status: true,
};

const AdminCurrencyRates = () => {
  const dispatch = useDispatch();

  const { currencies, loading, error } = useSelector(
    (state) => state.currencyRate
  );

  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  // Country and Currency data
  const countries = [
    { code: "AU", name: "Australian", currency: "AUD" },
    { code: "IN", name: "India", currency: "INR" },
    { code: "PK", name: "Pakistan", currency: "PKR" },
    { code: "BD", name: "Bangladesh", currency: "BDT" },
    { code: "NP", name: "Nepal", currency: "NPR" },
    { code: "AE", name: "Dubai", currency: "AED" },
  ];

  // Currency options with symbols
  const currencyOptions = [
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
    { code: "NPR", symbol: "₨", name: "Nepalese Rupee" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
  ];

  useEffect(() => {
    dispatch(getCurrencyRates());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(resetCurrencyState());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Auto-fill currency code when country is selected
    if (name === "countryCode") {
      const selectedCountry = countries.find(c => c.code === value);
      setForm((prev) => ({
        ...prev,
        countryCode: value,
        currencyCode: selectedCountry ? selectedCountry.currency : "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editId) {
      dispatch(
        updateCurrencyRate({
          id: editId,
          formData: form,
        })
      ).then(() => {
        dispatch(getCurrencyRates());
      });
    } else {
      dispatch(createCurrencyRate(form)).then(() => {
        dispatch(getCurrencyRates());
      });
    }

    setForm(initialForm);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setEditId(item._id);

    setForm({
      countryCode: item.countryCode,
      currencyCode: item.currencyCode,
      rate: item.rate,
      status: item.status,
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this currency?")) return;

    dispatch(deleteCurrencyRate(id)).then(() => {
      dispatch(getCurrencyRates());
    });
  };

  // Get flag emoji for country
  const getFlagEmoji = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Card with White Theme */}
        <div className="relative">
          {/* Card Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200">
            
            {/* Header */}
            <div className="relative overflow-hidden rounded-t-2xl border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-gray-200">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin-slow" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800 tracking-wider">
                      Currency Rates
                    </h4>
                    <p className="text-gray-500 text-sm">Manage your currency exchange rates</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                    {currencies?.length || 0} Currencies
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Form with Dropdowns */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {/* Country Dropdown */}
                <div className="relative">
                  <select
                    name="countryCode"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none"
                    value={form.countryCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {getFlagEmoji(country.code)} {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>

                {/* Currency Dropdown */}
                <div className="relative">
                  <select
                    name="currencyCode"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none"
                    value={form.currencyCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Currency</option>
                    {currencyOptions.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>

                {/* Rate Input */}
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    name="rate"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="📊 Rate"
                    value={form.rate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Status Checkbox */}
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="status"
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-300"
                    name="status"
                    checked={form.status}
                    onChange={handleChange}
                  />
                  <label htmlFor="status" className="text-gray-700 font-medium">
                    Active
                  </label>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/30 transform transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : editId ? (
                      <>
                        <Edit2 className="w-5 h-5" />
                        <span>Update</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Table */}
              <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-gray-700">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currencies?.length > 0 ? (
                        currencies.map((item, index) => (
                          <tr 
                            key={item._id} 
                            className="hover:bg-blue-50/50 transition-all duration-200"
                          >
                            <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-800">
                                {getFlagEmoji(item.countryCode)} {item.countryCode}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-blue-600">{item.currencyCode}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-lg font-semibold text-green-600">{item.rate}</span>
                            </td>
                            <td className="px-6 py-4">
                              {item.status ? (
                                <span className="px-3 py-1 inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                  Active
                                </span>
                              ) : (
                                <span className="px-3 py-1 inline-flex items-center gap-2 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                            <div className="flex flex-col items-center">
                              <Globe className="w-16 h-16 mb-4 text-gray-300" />
                              <p className="text-lg font-medium text-gray-500">No Currency Found</p>
                              <p className="text-sm text-gray-400">Start by adding your first currency</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminCurrencyRates;