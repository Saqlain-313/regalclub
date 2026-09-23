// components/admin/GameEntryModal.jsx

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, User, Calendar, DollarSign, Ticket, Gamepad2, Hash, 
  Users, Award, Clock, Package, 
  Circle, CheckCircle, XCircle, AlertCircle, Phone, Mail,
  Calendar as CalendarIcon, TrendingUp
} from 'lucide-react';
import { createPowerballResult } from '../../admin/redux/bangladesh/powerballResultSlice';
import { toast } from 'react-hot-toast';

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
    'bangladesh': '৳',
    'japan': '¥',
    'china': '¥',
    'default': '$'
  };
  return symbols[country?.toLowerCase()] || symbols.default;
};

const GameEntryModal = ({ entry, onClose, selectedPool, onResultAnnounced, country = 'bangladesh' }) => {
  const dispatch = useDispatch();
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const currencySymbol = useMemo(() => getCurrencySymbol(country), [country]);
  
  // Redux state
  const { loading, success, error } = useSelector(
    (state) => state.bangladeshPowerballResult || { loading: false, success: false, error: null }
  );

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
      'Open': <Circle className="h-4 w-4 text-green-600" />,
      'Closed': <AlertCircle className="h-4 w-4 text-yellow-600" />,
      'Completed': <CheckCircle className="h-4 w-4 text-blue-600" />,
      'Pending': <Clock className="h-4 w-4 text-yellow-600" />,
      'Won': <Award className="h-4 w-4 text-emerald-600" />,
      'Lost': <XCircle className="h-4 w-4 text-red-600" />,
    };
    return icons[status] || <Circle className="h-4 w-4 text-gray-400" />;
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (!amount && amount !== 0) return 'N/A';
    try {
      return `${currencySymbol}${amount.toFixed(2)}`;
    } catch (error) {
      return `${currencySymbol}${amount}`;
    }
  }, [currencySymbol]);

  const formatShortId = useCallback((id) => {
    if (!id) return 'N/A';
    return id.slice(-8).toUpperCase();
  }, []);

  const getStatusDescription = useCallback((status) => {
    const descriptions = {
      'Open': 'Accepting new players',
      'Closed': 'No longer accepting players',
      'Completed': 'Game has been completed',
      'Pending': 'Waiting for confirmation',
      'Played': 'Game has been played',
      'Won': 'Player won the game',
      'Lost': 'Player did not win',
      'Cancelled': 'Game was cancelled',
    };
    return descriptions[status] || 'Status unknown';
  }, []);

  // Handle result announcement - UPDATED with proper validation for your schema
  const handleAnnounceResult = useCallback(async () => {
    // Reset local error
    setLocalError(null);

    // Validate that we have a pool
    const poolId = selectedPool?._id || entry?.poolId || entry?._id;
    if (!poolId) {
      const errorMsg = 'No pool selected or pool ID missing';
      toast.error(errorMsg);
      setLocalError(errorMsg);
      console.error('Missing pool ID:', { selectedPool, entry });
      return;
    }

    // Get winning numbers - try multiple paths
    const winningNumbers = 
      entry?.winningNumbers?.numbers || 
      entry?.numbers || 
      selectedPool?.winningNumbers?.numbers ||
      selectedPool?.numbers ||
      [];

    const powerball = 
      entry?.winningNumbers?.powerball || 
      entry?.powerball || 
      selectedPool?.winningNumbers?.powerball ||
      selectedPool?.powerball ||
      null;

    // Validate winning numbers
    if (!winningNumbers || winningNumbers.length === 0) {
      const errorMsg = 'No winning numbers found to announce. Please add winning numbers first.';
      toast.error(errorMsg);
      setLocalError(errorMsg);
      console.error('Missing winning numbers:', { 
        entry, 
        selectedPool,
        winningNumbers,
        powerball 
      });
      return;
    }

    // VALIDATION FOR YOUR SCHEMA: Exactly 7 numbers required
    if (winningNumbers.length !== 7) {
      const errorMsg = `Invalid number of winning numbers: ${winningNumbers.length}. Exactly 7 numbers are required.`;
      toast.error(errorMsg);
      setLocalError(errorMsg);
      console.error('Invalid numbers count:', winningNumbers);
      return;
    }

    // Validate winning numbers are between 1-69 (standard Powerball range)
    const invalidNumbers = winningNumbers.filter(num => num < 1 || num > 69);
    if (invalidNumbers.length > 0) {
      const errorMsg = `Invalid winning numbers: ${invalidNumbers.join(', ')}. Numbers must be between 1-69.`;
      toast.error(errorMsg);
      setLocalError(errorMsg);
      return;
    }

    // Check for duplicate numbers (Powerball rules)
    const uniqueNumbers = new Set(winningNumbers);
    if (uniqueNumbers.size !== winningNumbers.length) {
      const errorMsg = 'Duplicate numbers found. Each number must be unique.';
      toast.error(errorMsg);
      setLocalError(errorMsg);
      return;
    }

    // VALIDATION FOR YOUR SCHEMA: Powerball between 1-20
    if (powerball === null || powerball === undefined) {
      const errorMsg = 'Powerball number is required.';
      toast.error(errorMsg);
      setLocalError(errorMsg);
      return;
    }

    if (powerball < 1 || powerball > 20) {
      const errorMsg = `Invalid Powerball: ${powerball}. Must be between 1-20.`;
      toast.error(errorMsg);
      setLocalError(errorMsg);
      return;
    }

    // Check if powerball is in the main numbers (Powerball rules)
    if (winningNumbers.includes(powerball)) {
      const errorMsg = `Powerball number ${powerball} cannot be one of the main numbers.`;
      toast.error(errorMsg);
      setLocalError(errorMsg);
      return;
    }

    // Prepare result data
    const resultData = {
      gamePoolId: poolId,
      numbers: winningNumbers,
      powerball: powerball,
      country: selectedPool?.country || selectedPool?.userCountry || entry?.country || "bangladesh",
    };

    console.log('Announcing result with data:', resultData);

    setIsAnnouncing(true);

    try {
      const result = await dispatch(createPowerballResult(resultData)).unwrap();
      console.log('Result announced successfully:', result);
      
      setIsAnnouncing(false);
      toast.success('Result announced successfully!');
      setLocalError(null);
      
      // Callback to parent to refresh data
      if (onResultAnnounced) {
        onResultAnnounced();
      }
      
      // Close modal after successful announcement
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Failed to announce result:', err);
      setIsAnnouncing(false);
      
      // Extract meaningful error message
      let errorMsg = 'Failed to announce result';
      if (err?.message) {
        errorMsg = err.message;
      } else if (err?.data?.message) {
        errorMsg = err.data.message;
      } else if (err?.error) {
        errorMsg = err.error;
      }
      
      toast.error(errorMsg);
      setLocalError(errorMsg);
    }
  }, [dispatch, selectedPool, entry, onResultAnnounced, onClose]);

  // Handle success/error states
  useEffect(() => {
    if (success) {
      setIsAnnouncing(false);
      // Success is already handled in handleAnnounceResult
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      setIsAnnouncing(false);
      // Error is already handled in handleAnnounceResult
      console.error('Redux error:', error);
    }
  }, [error]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  }, [onClose]);

  // If no entry, show loading or error state
  if (!entry) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Entry Data</h3>
          <p className="text-gray-600">The game entry data is not available.</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Extract data from the entry with fallbacks
  const poolData = entry || {};
  const players = poolData.players || [];
  const winningNumbers = poolData.winningNumbers?.numbers || poolData.numbers || [];
  const resultDeclared = poolData.resultDeclared || false;
  const totalPlayers = players.length;
  
  // Calculate total games across all players
  const totalGamesAllPlayers = players.reduce((acc, player) => {
    return acc + (player.games?.length || 0);
  }, 0);

  // Find winners
  const winners = players.filter(p => p.result?.prize > 0);

  // Check if we can announce - UPDATED with proper validation
  const canAnnounce = !resultDeclared && 
                     !loading && 
                     !isAnnouncing && 
                     winningNumbers && 
                     winningNumbers.length === 7 &&
                     powerball !== null &&
                     powerball >= 1 &&
                     powerball <= 20;

  // Get powerball value
  const powerball = poolData.winningNumbers?.powerball || poolData.powerball || null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Game Pool Details</h2>
              <p className="text-sm text-gray-500 font-mono">
                Pool #{formatShortId(poolData.poolId || poolData._id)} - Draw #{poolData.drawNo || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Announce Result Button - UPDATED with proper validation */}
            {!resultDeclared && (
              <button
                onClick={handleAnnounceResult}
                disabled={!canAnnounce}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  !canAnnounce
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 hover:from-green-600 hover:to-emerald-700'
                }`}
                title={
                  !winningNumbers?.length ? 'No winning numbers available to announce' :
                  winningNumbers?.length !== 7 ? `Need exactly 7 numbers (currently ${winningNumbers?.length || 0})` :
                  !powerball ? 'Powerball number is missing' :
                  powerball < 1 || powerball > 20 ? 'Powerball must be between 1-20' :
                  resultDeclared ? 'Result already declared' :
                  loading || isAnnouncing ? 'Announcement in progress' :
                  'Click to announce the winning result'
                }
              >
                {(loading || isAnnouncing) ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Announcing...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4" />
                    Announce Result
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Local Error Display */}
          {localError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">Error</h4>
                <p className="text-sm text-red-600">{localError}</p>
              </div>
            </div>
          )}

          {/* Winning Numbers Warning - UPDATED */}
          {!resultDeclared && (
            <div className={`${(!winningNumbers || winningNumbers.length === 0) ? 'bg-red-50 border-red-200' : winningNumbers.length !== 7 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border-2 rounded-xl p-4 flex items-start gap-3`}>
              {(!winningNumbers || winningNumbers.length === 0) ? (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              ) : winningNumbers.length !== 7 ? (
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className={`text-sm font-semibold ${(!winningNumbers || winningNumbers.length === 0) ? 'text-red-800' : winningNumbers.length !== 7 ? 'text-yellow-800' : 'text-green-800'}`}>
                  {(!winningNumbers || winningNumbers.length === 0) ? 'No Winning Numbers' :
                   winningNumbers.length !== 7 ? `Invalid Number Count: ${winningNumbers.length}/7` :
                   'Valid Winning Numbers Ready'}
                </h4>
                <p className={`text-sm ${(!winningNumbers || winningNumbers.length === 0) ? 'text-red-700' : winningNumbers.length !== 7 ? 'text-yellow-700' : 'text-green-700'}`}>
                  {(!winningNumbers || winningNumbers.length === 0) ? 
                    'This game doesn\'t have winning numbers assigned yet. Please add winning numbers before announcing the result.' :
                    winningNumbers.length !== 7 ? 
                    `Powerball requires exactly 7 numbers. Currently have ${winningNumbers.length} numbers.` :
                    `All ${winningNumbers.length} numbers are present and ready for announcement.`}
                </p>
                {winningNumbers && winningNumbers.length > 0 && winningNumbers.length !== 7 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {winningNumbers.map((num, idx) => (
                      <span key={idx} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-semibold text-xs">
                        {num}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Powerball Warning - NEW */}
          {!resultDeclared && powerball !== null && powerball !== undefined && (powerball < 1 || powerball > 20) && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">Invalid Powerball</h4>
                <p className="text-sm text-red-700">
                  Powerball number {powerball} is invalid. Must be between 1-20.
                </p>
              </div>
            </div>
          )}

          {/* Status Banner */}
          <div className={`rounded-xl p-4 border-2 ${getStatusColor(poolData.status)} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(poolData.status)}
              <div>
                <span className="font-semibold">{poolData.status || 'N/A'}</span>
                <p className="text-sm opacity-75">
                  {getStatusDescription(poolData.status)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="font-medium">{totalPlayers} Players</span>
              </div>
              <div className="flex items-center gap-1">
                <Gamepad2 className="h-4 w-4" />
                <span className="font-medium">{totalGamesAllPlayers} Total Games</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">{formatCurrency(poolData.totalAmount)}</span>
              </div>
              {resultDeclared ? (
                <span className="flex items-center gap-1 text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  Result Declared
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  Result Pending
                </span>
              )}
            </div>
          </div>

          {/* Pool Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Ticket Type</div>
              <div className="font-medium text-sm truncate">
                {formatShortId(poolData.ticketType?._id || poolData.ticketType)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Game Type</div>
              <div className="font-medium text-sm truncate">
                {formatShortId(poolData.gameType)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Games Per Player</div>
              <div className="font-medium text-sm">
                {poolData.gameCount?.totalGames || 0}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Price Per Game</div>
              <div className="font-medium text-sm">
                {formatCurrency(poolData.gameCount?.price || 0)}
              </div>
            </div>
          </div>

          {/* ALL PLAYERS Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              All Players ({totalPlayers})
            </h3>
            
            <div className="space-y-4">
              {players.length > 0 ? (
                players.map((player, playerIndex) => {
                  const playerGames = player.games || [];
                  const totalPlayerGames = playerGames.length;
                  const hasWon = player.result?.prize > 0;

                  return (
                    <div key={player.userId || playerIndex} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Player Header */}
                      <div className={`p-4 border-b border-gray-200 ${hasWon ? 'bg-gradient-to-r from-emerald-50 to-green-50' : 'bg-gradient-to-r from-gray-50 to-blue-50'}`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${hasWon ? 'bg-emerald-500' : 'bg-blue-100'}`}>
                              <User className={`h-5 w-5 ${hasWon ? 'text-white' : 'text-blue-600'}`} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                {player.userName || 'Unknown User'}
                                {hasWon && (
                                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    Winner!
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <Mail className="h-3 w-3" />
                                <span>{player.userEmail || 'No email'}</span>
                                {player.userPhone && (
                                  <>
                                    <Phone className="h-3 w-3 ml-1" />
                                    <span>{player.userPhone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm">
                              <Gamepad2 className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium">{totalPlayerGames} games</span>
                            </div>
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm">
                              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium">{formatCurrency(player.bidAmount || 0)}</span>
                            </div>
                            {hasWon && (
                              <div className="flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-lg shadow-sm">
                                <Award className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="font-medium text-emerald-700">{formatCurrency(player.result.prize)}</span>
                              </div>
                            )}
                            {player.status && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(player.status)}`}>
                                {player.status}
                              </span>
                            )}
                          </div>
                        </div>
                        {player.userId && (
                          <div className="mt-2 text-xs text-gray-400 font-mono">
                            User ID: {player.userId}
                          </div>
                        )}
                      </div>

                      {/* Player's Games */}
                      <div className="p-4 bg-white">
                        {playerGames.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {playerGames.map((game, gameIndex) => (
                              <div 
                                key={gameIndex} 
                                className={`bg-gray-50 rounded-lg p-3 border ${game.result?.prize > 0 ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100'} hover:shadow-md transition-all duration-200`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    Game #{game.gameNo || gameIndex + 1}
                                  </span>
                                  {game.powerball && (
                                    <span className="text-xs bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded">
                                      PB: {game.powerball}
                                    </span>
                                  )}
                                  {game.result?.prize > 0 && (
                                    <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <Award className="h-3 w-3" />
                                      {formatCurrency(game.result.prize)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {game.numbers && game.numbers.length > 0 ? (
                                    game.numbers.map((num, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs hover:scale-110 transition-transform duration-200"
                                      >
                                        {num}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-gray-400">No numbers</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 text-center py-4">
                            No games for this player
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No players in this pool</p>
                </div>
              )}
            </div>
          </div>

          {/* Winning Numbers (if declared) */}
          {resultDeclared && winningNumbers.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
              <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-emerald-600" />
                Winning Numbers
              </h4>
              <div className="flex flex-wrap gap-2">
                {winningNumbers.map((num, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 font-bold text-base border-2 border-green-300 shadow-sm hover:scale-110 transition-transform duration-200"
                  >
                    {num}
                  </span>
                ))}
                {poolData.winningNumbers?.powerball && (
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-700 font-bold text-base border-2 border-red-300 shadow-sm hover:scale-110 transition-transform duration-200">
                    {poolData.winningNumbers.powerball}
                  </span>
                )}
              </div>
              
              {/* Winners List */}
              {winners.length > 0 && (
                <div className="mt-4 p-4 bg-emerald-100 rounded-lg border border-emerald-200">
                  <p className="text-emerald-800 font-semibold flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5" />
                    Winners ({winners.length})
                  </p>
                  <div className="space-y-2">
                    {winners.map((winner, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium text-gray-900">{winner.userName}</span>
                          <span className="text-xs text-gray-500">{winner.userEmail}</span>
                        </div>
                        <div className="font-semibold text-emerald-700">
                          {formatCurrency(winner.result.prize)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400 font-mono">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-500">Pool ID:</span>
                {poolData.poolId || poolData._id || 'N/A'}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-500">Game Count ID:</span>
                {poolData.gameCount?._id || 'N/A'}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-500">Created:</span>
                {formatDate(poolData.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-500">Updated:</span>
                {formatDate(poolData.updatedAt)}
              </div>
              {poolData.ticketType?._id && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-500">Ticket Type ID:</span>
                  {poolData.ticketType._id}
                </div>
              )}
              {poolData.gameType && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-500">Game Type ID:</span>
                  {poolData.gameType}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEntryModal;