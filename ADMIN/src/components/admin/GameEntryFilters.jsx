// components/admin/GameEntryFilters.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

const defaultFilters = {
  status: "",
  ticketType: "",
  gameType: "",
  drawNo: "",
  minPlayers: "",
  maxPlayers: "",
  minAmount: "",
  maxAmount: "",
  startDate: "",
  endDate: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  resultDeclared: "",
};

const GameEntryFilters = ({
  filters = defaultFilters,
  onFilterChange = () => {},
  onReset = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const safeFilters = useMemo(() => ({
    ...defaultFilters,
    ...(filters || {}),
  }), [filters]);

  // Options arrays
  const statusOptions = useMemo(() => [
    { value: "", label: "All Statuses" },
    { value: "Open", label: "Open" },
    { value: "Closed", label: "Closed" },
    { value: "Completed", label: "Completed" },
    { value: "Pending", label: "Pending" },
    { value: "Played", label: "Played" },
    { value: "Won", label: "Won" },
    { value: "Lost", label: "Lost" },
    { value: "Cancelled", label: "Cancelled" },
  ], []);

  const resultDeclaredOptions = useMemo(() => [
    { value: "", label: "All" },
    { value: "true", label: "Declared" },
    { value: "false", label: "Not Declared" },
  ], []);

  const sortByOptions = useMemo(() => [
    { value: "createdAt", label: "Date Created" },
    { value: "totalAmount", label: "Total Amount" },
    { value: "totalPlayers", label: "Players Count" },
    { value: "drawNo", label: "Draw Number" },
    { value: "status", label: "Status" },
  ], []);

  const sortOrderOptions = useMemo(() => [
    { value: "desc", label: "Newest First" },
    { value: "asc", label: "Oldest First" },
  ], []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  }, [onFilterChange]);

  const handleClear = useCallback((fieldName) => {
    onFilterChange({ [fieldName]: "" });
  }, [onFilterChange]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.keys(safeFilters).filter(
      key => safeFilters[key] && safeFilters[key] !== ""
    ).length;
  }, [safeFilters]);

  // Check if there are active filters that are not default
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
      {/* Header with toggle */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium text-gray-700">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
          <button 
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Filter content */}
      {isExpanded && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={safeFilters.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Draw Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Draw Number
              </label>
              <input
                type="number"
                name="drawNo"
                value={safeFilters.drawNo}
                onChange={handleChange}
                placeholder="e.g., 1"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Result Declared */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result Status
              </label>
              <select
                name="resultDeclared"
                value={safeFilters.resultDeclared}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                {resultDeclaredOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ticket Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Type ID
              </label>
              <input
                type="text"
                name="ticketType"
                value={safeFilters.ticketType}
                onChange={handleChange}
                placeholder="Enter ticket type ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Game Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Type ID
              </label>
              <input
                type="text"
                name="gameType"
                value={safeFilters.gameType}
                onChange={handleChange}
                placeholder="Enter game type ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Min Players */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Players
              </label>
              <input
                type="number"
                name="minPlayers"
                value={safeFilters.minPlayers}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Max Players */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Players
              </label>
              <input
                type="number"
                name="maxPlayers"
                value={safeFilters.maxPlayers}
                onChange={handleChange}
                placeholder="100"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount ($)
              </label>
              <input
                type="number"
                name="minAmount"
                value={safeFilters.minAmount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount ($)
              </label>
              <input
                type="number"
                name="maxAmount"
                value={safeFilters.maxAmount}
                onChange={handleChange}
                placeholder="1000"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={safeFilters.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={safeFilters.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                name="sortBy"
                value={safeFilters.sortBy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                {sortByOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                name="sortOrder"
                value={safeFilters.sortOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                {sortOrderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All Filters
                </button>
              )}
              <button
                type="button"
                onClick={toggleExpand}
                className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {hasActiveFilters ? (
                <span>{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
              ) : (
                <span>No active filters</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEntryFilters;