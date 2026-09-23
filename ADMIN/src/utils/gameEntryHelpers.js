// utils/gameEntryHelpers.js

/**
 * Get the actual data from entry (supports both wrapped and unwrapped formats)
 */
export const getEntryData = (entry) => entry.data || entry;

/**
 * Get player information from entry
 */
export const getPlayerInfo = (entry) => {
  const data = getEntryData(entry);
  const player = data.players?.[0] || {};
  return {
    name: player.userName || 'Unknown User',
    email: player.userEmail || 'No email',
    phone: player.userPhone || '',
    userId: player.userId || '',
    status: player.status || 'N/A',
    bidAmount: player.bidAmount || 0,
    currencyDetails: player.currencyDetails || null,
    result: player.result || null,
  };
};

/**
 * Get game information from entry
 */
export const getGameInfo = (entry) => {
  const data = getEntryData(entry);
  const player = data.players?.[0] || {};
  const game = player.games?.[0] || {};
  return {
    numbers: game.numbers || [],
    powerball: game.powerball || null,
    gameNo: game.gameNo || 1,
    totalGames: data.gameCount?.totalGames || 1,
    price: data.gameCount?.price || 0,
  };
};

/**
 * Get pool information from entry
 */
export const getPoolInfo = (entry) => {
  const data = getEntryData(entry);
  return {
    poolId: data.poolId || entry._id,
    drawNo: data.drawNo || 'N/A',
    status: data.status || 'N/A',
    totalPlayers: data.totalPlayers || 0,
    totalAmount: data.totalAmount || 0,
    resultDeclared: data.resultDeclared || false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    ticketType: data.ticketType,
    gameType: data.gameType,
    winningNumbers: data.winningNumbers?.numbers || [],
    gameCount: data.gameCount,
  };
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
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
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
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
};

/**
 * Get status color classes
 */
export const getStatusColor = (status) => {
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
};

/**
 * Get status icon component
 */
export const getStatusIcon = (status) => {
  const icons = {
    'Open': <Circle className="h-3 w-3 text-green-600" />,
    'Closed': <Clock className="h-3 w-3 text-yellow-600" />,
    'Completed': <CheckCircle className="h-3 w-3 text-blue-600" />,
    'Won': <Award className="h-3 w-3 text-emerald-600" />,
  };
  return icons[status] || <Circle className="h-3 w-3 text-gray-400" />;
};