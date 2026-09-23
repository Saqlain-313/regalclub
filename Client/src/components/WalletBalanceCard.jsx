// components/WalletcreditCard.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Eye, EyeOff, TrendingUp, Plus, ArrowUpRight, Wallet } from "lucide-react";

// Country to Currency mapping
const countryCurrencyMap = {
  "AU": "AUD",
  "IN": "INR",
  "PK": "PKR",
  "BD": "BDT",
  "NP": "NPR",
  "AE": "AED",
};

// Currency Symbol mapping
const currencySymbolMap = {
  "AUD": "A$",
  "INR": "₹",
  "PKR": "₨",
  "BDT": "৳",
  "NPR": "₨",
  "AED": "د.إ",
  "USD": "$",
  "EUR": "€",
  "GBP": "£",
};

// Helper function to get currency symbol based on user's country
const getCurrencySymbol = (countryCode) => {
  if (!countryCode) return "₹"; // Default to INR if no country
  const currencyCode = countryCurrencyMap[countryCode];
  return currencySymbolMap[currencyCode] || "₹"; // Default to INR if currency not found
};

export default function WalletcreditCard() {
  const { user } = useSelector((state) => state.auth);
  const [showcredit, setShowcredit] = useState(true);

  // Get the currency symbol based on user's country
  const currencySymbol = getCurrencySymbol(user?.country);
  
  // Get credit with fallback
  const credit = user?.credit?.local || 0;
  
  const formatcredit = (amount) => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-purple-200/20 shadow-lg p-6 md:p-8 min-h-[260px] md:min-h-[320px] flex flex-col justify-between group">
      
      {/* Background Decorative Wallet Icon */}
      <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5 pointer-events-none">
        <Wallet size={180} className="text-gray-900" />
      </div>

      {/* Top Section */}
      <div>
        {/* Header with credit Label and Toggle */}
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <span className="text-sm font-medium">Current Wallet credit</span>
          <button
            onClick={() => setShowcredit(!showcredit)}
            className="hover:text-purple-600 transition-colors"
            aria-label={showcredit ? "Hide credit" : "Show credit"}
          >
            {showcredit ? (
              <EyeOff size={18} className="text-gray-500" />
            ) : (
              <Eye size={18} className="text-gray-500" />
            )}
          </button>
        </div>

        {/* credit Amount */}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">{currencySymbol}</span>
          <span className="text-4xl md:text-[56px] font-extrabold text-gray-900 tracking-tight">
            {showcredit ? formatcredit(credit) : '••••••••••'}
          </span>
        </div>

        {/* User Country Info (Optional - shows which currency) */}
        {user?.country && (
          <div className="mt-1 text-sm text-gray-500">
            {user.country} • {currencySymbol}
          </div>
        )}

        {/* Trending Badge */}
        <div className="inline-flex items-center mt-4 px-3 py-1 bg-green-500/10 text-green-600 rounded-full">
          <TrendingUp size={16} className="mr-1" />
          <span className="text-sm font-medium">+12.5% Today</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 md:mt-8">
        <Link 
          to="/deposit"
          className="flex-1 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:shadow-xl hover:shadow-purple-500/30 transition-all active:scale-95 text-sm md:text-base"
        >
          <Plus size={20} />
          <span>Add Money</span>
        </Link>
        <Link 
          to="/withdrawal"
          className="flex-1 py-3 md:py-4 bg-white border border-purple-200/20 text-gray-900 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-50 transition-all active:scale-95 text-sm md:text-base"
        >
          <ArrowUpRight size={20} />
          <span>Withdraw</span>
        </Link>
      </div>
    </div>
  );
}