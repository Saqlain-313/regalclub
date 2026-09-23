// pages/admin/AdminGameEntries.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGameEntries,
  fetchGameEntryById,
  fetchGameEntriesByStatus,
  searchGameEntriesByUser,
  fetchGameEntrySummary,
  setFilters,
  resetFilters,
  setPage,
  clearSelectedEntry,
} from '../redux/gameEntrySlice';
import GameEntryTable from '../../components/admin/GameEntryTable';
import GameEntryFilters from '../../components/admin/GameEntryFilters';
import GameEntryStats from '../../components/admin/GameEntryStats';
import GameEntryModal from '../../components/admin/GameEntryModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { RefreshCw, Search, X } from 'lucide-react';

const AdminGameEntries = () => {
  const dispatch = useDispatch();
  const { 
    entries = [], 
    loading, 
    error, 
    pagination, 
    stats = {}, 
    filters, 
    selectedEntry 
  } = useSelector((state) => state.gameEntries || {});

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Use ref to track initial load
  const isInitialLoad = useRef(true);
  const isFetching = useRef(false);

  // Calculate unique players and stats from entries
  const calculatedStats = useMemo(() => {
    if (!entries || entries.length === 0) {
      return stats;
    }

    // Calculate unique players (by userId)
    const uniquePlayers = new Map();
    let totalUniquePlayers = 0;
    let totalRevenue = 0;
    let totalAmount = 0;

    entries.forEach(entry => {
      // Add total amount
      totalAmount += (entry.totalAmount || 0);
      
      // Process players in this entry
      if (entry.players && Array.isArray(entry.players)) {
        entry.players.forEach(player => {
          if (player.userId) {
            // Only add if not already counted
            if (!uniquePlayers.has(player.userId)) {
              uniquePlayers.set(player.userId, {
                userId: player.userId,
                userName: player.userName,
                userEmail: player.userEmail,
                totalBid: 0,
                entries: 0
              });
              totalUniquePlayers++;
            }
            
            // Update player stats
            const playerData = uniquePlayers.get(player.userId);
            playerData.totalBid += (player.bidAmount || 0);
            playerData.entries += 1;
          }
        });
      }
    });

    // Calculate total revenue (sum of all entry amounts)
    totalRevenue = entries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const totalEntries = entries.length;
    const averagePrice = totalEntries > 0 ? totalRevenue / totalEntries : 0;

    // Count by status
    const open = entries.filter(e => e.status === 'Open').length;
    const closed = entries.filter(e => e.status === 'Closed').length;
    const completed = entries.filter(e => e.status === 'Completed').length;
    const pending = entries.filter(e => e.status === 'Pending').length;
    const won = entries.filter(e => e.status === 'Won').length;
    const lost = entries.filter(e => e.status === 'Lost').length;
    const cancelled = entries.filter(e => e.status === 'Cancelled').length;

    return {
      ...stats,
      totalRevenue: stats?.totalRevenue || totalRevenue,
      totalPlayers: totalUniquePlayers, // Unique players count
      totalAmount: stats?.totalAmount || totalAmount,
      totalEntries: stats?.totalEntries || totalEntries,
      averagePrice: stats?.averagePrice || averagePrice,
      open: stats?.open || open,
      closed: stats?.closed || closed,
      completed: stats?.completed || completed,
      pending: stats?.pending || pending,
      won: stats?.won || won,
      lost: stats?.lost || lost,
      cancelled: stats?.cancelled || cancelled,
      uniquePlayers: Array.from(uniquePlayers.values()), // For debugging
    };
  }, [entries, stats]);

  // Fetch entries with current filters
  const fetchEntries = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isFetching.current) return;
    
    isFetching.current = true;
    
    const { currentPage = 1, entriesPerPage = 10 } = pagination || {};
    const filterParams = { ...filters };
    
    // Remove empty filters
    Object.keys(filterParams).forEach(key => {
      if (!filterParams[key] || filterParams[key] === '') {
        delete filterParams[key];
      }
    });

    if (activeTab !== 'all') {
      dispatch(fetchGameEntriesByStatus({
        status: activeTab,
        page: currentPage,
        limit: entriesPerPage,
        ...filterParams
      })).finally(() => {
        isFetching.current = false;
      });
    } else {
      dispatch(fetchGameEntries({
        page: currentPage,
        limit: entriesPerPage,
        filters: filterParams,
      })).finally(() => {
        isFetching.current = false;
      });
    }
  }, [dispatch, activeTab, filters, pagination]);

  // Fetch stats
  const fetchStats = useCallback(() => {
    dispatch(fetchGameEntrySummary());
  }, [dispatch]);

  // Initial load - runs once on mount
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchEntries();
      fetchStats();
    }
  }, []); // Empty dependency array - only runs once

  // Refetch when pagination changes (page change)
  useEffect(() => {
    // Skip initial load
    if (isInitialLoad.current) return;
    
    fetchEntries();
  }, [pagination?.currentPage]);

  // Refetch when filters change
  useEffect(() => {
    // Skip initial load
    if (isInitialLoad.current) return;
    
    fetchEntries();
  }, [filters]);

  // Refetch when tab changes
  useEffect(() => {
    // Skip initial load
    if (isInitialLoad.current) return;
    
    fetchEntries();
  }, [activeTab]);

  // Handle search - search by user and get unique results
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      dispatch(searchGameEntriesByUser({
        query: searchQuery.trim(),
        page: 1,
        limit: pagination?.entriesPerPage || 10,
        status: activeTab !== 'all' ? activeTab : '',
      }));
    } else {
      fetchEntries();
    }
  }, [searchQuery, dispatch, activeTab, pagination?.entriesPerPage, fetchEntries]);

  // Handle search on Enter key
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    fetchEntries();
  }, [fetchEntries]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setPage(1));
  }, [dispatch]);

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
    dispatch(setPage(1));
    setSearchQuery('');
    setActiveTab('all');
  }, [dispatch]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    dispatch(setPage(newPage));
  }, [dispatch]);

  // Handle view entry
  const handleViewEntry = useCallback((id) => {
    dispatch(fetchGameEntryById(id));
    setShowModal(true);
  }, [dispatch]);

  // Handle close modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    dispatch(clearSelectedEntry());
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    dispatch(setPage(1));
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchEntries();
    fetchStats();
  }, [fetchEntries, fetchStats]);

  // Status tabs configuration with memo
  const statusTabs = useMemo(() => [
    { key: 'all', label: 'All Pools', count: calculatedStats?.totalEntries || 0 },
    { key: 'Open', label: 'Open', count: calculatedStats?.open || 0 },
    { key: 'Closed', label: 'Closed', count: calculatedStats?.closed || 0 },
    { key: 'Completed', label: 'Completed', count: calculatedStats?.completed || 0 },
  ], [calculatedStats]);

  // Loading state
  if (loading && (!entries || entries.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Game Pools</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and monitor all game pools</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {/* Statistics Cards - Use calculatedStats */}
        <GameEntryStats stats={calculatedStats} loading={loading} />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by user name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Search
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <GameEntryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="border-b border-gray-200">
            <nav className="flex flex-nowrap -mb-px px-4">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`
                      ml-1 sm:ml-2 px-2 py-0.5 text-xs rounded-full
                      ${activeTab === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading entries</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <GameEntryTable
          entries={entries}
          loading={loading}
          onViewEntry={handleViewEntry}
          pagination={pagination}
          onPageChange={handlePageChange}
        />

        {/* Modal */}
        {showModal && selectedEntry && (
          <GameEntryModal
            entry={selectedEntry}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminGameEntries;