// components/admin/GameEntryTable.jsx

import React, { useCallback } from 'react';
import { 
  Eye, 
  Calendar, 
  Gamepad2, 
  Users, 
  DollarSign,
  Circle,
  Clock,
  CheckCircle,
  Award,
  Hash,
  TrendingUp
} from 'lucide-react';
import Pagination from '../common/Pagination';

const GameEntryTable = ({ entries, loading, onViewEntry, pagination, onPageChange }) => {
  // Helper functions
  const getStatusColor = useCallback((status) => {
    const colors = {
      'Open': 'bg-green-100 text-green-800 border-green-200',
      'Closed': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Played': 'bg-blue-100 text-blue-800 border-blue-200',
      'Won': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Lost': 'bg-red-100 text-red-800 border-red-200',
      'Cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  const getStatusIcon = useCallback((status) => {
    const icons = {
      'Open': <Circle className="h-3 w-3 text-green-600" />,
      'Closed': <Clock className="h-3 w-3 text-yellow-600" />,
      'Completed': <CheckCircle className="h-3 w-3 text-blue-600" />,
      'Won': <Award className="h-3 w-3 text-emerald-600" />,
    };
    return icons[status] || <Circle className="h-3 w-3 text-gray-400" />;
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  const formatCurrency = useCallback((amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `$${amount}`;
    }
  }, []);

  const formatShortId = useCallback((id) => {
    if (!id) return 'N/A';
    return id.slice(-8).toUpperCase();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading game entries...</p>
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Gamepad2 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No game pools found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pool ID / Draw
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Games Per Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price / Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => {
              const totalGamesPerPlayer = entry.gameCount?.totalGames || 0;
              const pricePerGame = entry.gameCount?.price || 0;
              const totalAmount = entry.totalAmount || 0;
              const totalPlayers = entry.totalPlayers || 0;

              return (
                <tr key={entry.poolId} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Hash className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{formatShortId(entry.poolId)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Draw #{entry.drawNo || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-semibold text-gray-900">
                        {totalPlayers}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        player{totalPlayers !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Gamepad2 className="h-4 w-4 text-gray-400 mr-1.5" />
                      <span className="text-sm text-gray-900">
                        {totalGamesPerPlayer}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        game{totalGamesPerPlayer !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(pricePerGame)}
                    </div>
                    <div className="text-xs text-gray-500">
                      per game
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1.5 ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                        {entry.status || 'N/A'}
                      </span>
                      {entry.resultDeclared && (
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Result declared
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="text-xs">{formatDate(entry.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewEntry(entry.poolId)}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg group"
                      title="View all entries in this pool"
                    >
                      <Eye className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalEntries={pagination.totalEntries}
            entriesPerPage={pagination.entriesPerPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default GameEntryTable;