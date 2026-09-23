// components/admin/GameEntryStats.jsx

import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Ticket, 
  Clock, 
  Trophy, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';

// Currency symbol mapping
const getCurrencySymbol = (country) => {
  const symbols = {
    'india': '₹',
    'us': '$',
    'usa': '$',
    'uk': '£',
    'europe': '€',
    'eu': '€',
    'australia': 'A$',
    'canada': 'C$',
    'japan': '¥',
    'china': '¥',
    'default': '$'
  };
  return symbols[country?.toLowerCase()] || symbols.default;
};

const GameEntryStats = ({ stats, loading = false, country = 'us' }) => {
  const currencySymbol = useMemo(() => getCurrencySymbol(country), [country]);

  // Memoized stat cards configuration with subtitles
  const statCards = useMemo(() => {
    const totalEntries = stats?.totalEntries || 0;
    const totalRevenue = stats?.totalRevenue || 0;
    const totalPlayers = stats?.totalPlayers || 0;

    return [
      {
        title: 'Total Revenue',
        value: `${currencySymbol}${totalRevenue?.toFixed(2) || '0.00'}`,
        icon: DollarSign,
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        subtitle: totalEntries > 0 ? `${currencySymbol}${(totalRevenue / totalEntries).toFixed(2)} avg per pool` : null,
      },
      {
        title: 'Total Pools',
        value: totalEntries,
        icon: Ticket,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        subtitle: totalPlayers > 0 ? `${totalPlayers} unique players` : null,
      },
      {
        title: 'Average Price',
        value: `${currencySymbol}${stats?.averagePrice?.toFixed(2) || '0.00'}`,
        icon: TrendingUp,
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        subtitle: totalEntries > 0 ? `Across ${totalEntries} pools` : null,
      },
      {
        title: 'Unique Players',
        value: totalPlayers,
        icon: Users,
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-600',
        subtitle: totalPlayers > 0 ? `In ${totalEntries} pools` : 'No players yet',
      },
      {
        title: 'Pending',
        value: stats?.open || 0,
        icon: Clock,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        subtitle: null,
      },
      {
        title: 'Won',
        value: stats?.won || 0,
        icon: Trophy,
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-600',
        subtitle: null,
      },
      {
        title: 'Lost',
        value: stats?.lost || 0,
        icon: XCircle,
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        subtitle: null,
      },
      {
        title: 'Cancelled',
        value: stats?.cancelled || 0,
        icon: AlertCircle,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        subtitle: null,
      },
    ];
  }, [stats, currencySymbol]);

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse border border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Check if stats are available
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200 mb-6">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No statistics available</p>
          <p className="text-gray-400 text-sm mt-1">Data will appear once entries are created</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.textColor}`} />
              </div>
            </div>
            <div className={`text-xl font-bold ${card.textColor}`}>
              {card.value}
            </div>
            {card.subtitle && (
              <div className="text-xs text-gray-400 mt-1">
                {card.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameEntryStats;