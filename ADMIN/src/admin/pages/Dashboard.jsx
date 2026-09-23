import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '../redux/adminAuthSlice';
import { fetchAllDeposits, fetchDepositStats } from '../redux/depositSlice';
import { fetchAllWithdrawals, fetchWithdrawalStats } from '../redux/withdrawalSlice';

// 👇 Matka Imports
import { getAdminMarkets } from '../redux/adminMarketSlice';
import { getAllBids, getBidStats } from '../redux/adminBidSlice';
import { getAdminResults, getAdminResultStats } from '../redux/adminResultSlice';

import { format } from 'date-fns';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Sparkles,
  Crown,
  UserCheck,
  UserX,
  CreditCard,
  Gift,
  Globe,
  Target,
  Trophy,
  Award,
  Gamepad2,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// ============================
// Custom Hooks
// ============================

const useDashboardData = () => {
  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state) => state.adminAuth);
  const { stats: depositStats, isLoading: depositsLoading } = useSelector((state) => state.deposits);
  const { stats: withdrawalStats, isLoading: withdrawalsLoading } = useSelector((state) => state.withdrawals);

  // 👇 Matka Selectors - FIXED with safe defaults
  const { markets, loading: marketsLoading } = useSelector((state) => state.adminMarket || { markets: [], loading: false });
  const { stats: bidStats, loading: bidsLoading } = useSelector((state) => state.adminBid || { stats: null, loading: false });
  const { stats: resultStats, loading: resultsLoading } = useSelector((state) => state.adminResult || { stats: [], loading: false });

  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [dispatch, timeRange]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        dispatch(getAllUsers()).unwrap(),
        dispatch(fetchDepositStats({ period: timeRange })).unwrap(),
        dispatch(fetchWithdrawalStats({ period: timeRange })).unwrap(),
        dispatch(fetchAllDeposits({ limit: 5, page: 1 })).unwrap(),
        dispatch(fetchAllWithdrawals({ limit: 5, page: 1 })).unwrap(),
        // 👇 Matka APIs
        dispatch(getAdminMarkets({ limit: 100 })).unwrap(),
        dispatch(getAllBids({ limit: 100 })).unwrap(),
        dispatch(getBidStats()).unwrap(),
        dispatch(getAdminResults({ limit: 100 })).unwrap(),
        dispatch(getAdminResultStats()).unwrap(),
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, timeRange]);

  // Calculate user stats
  const userStats = useMemo(() => {
    if (!users || !Array.isArray(users)) return { total: 0, active: 0, blocked: 0, admins: 0 };
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      blocked: users.filter(u => u.status === 'blocked').length,
      admins: users.filter(u => u.role === 'admin').length,
    };
  }, [users]);

  // 👇 Matka Stats - FIXED with proper array checks
  const matkaStats = useMemo(() => {
    const totalMarkets = markets?.length || 0;
    const activeMarkets = markets?.filter(m => m.isActive).length || 0;
    const pendingResults = markets?.filter(m => m.isActive && !m.isResultDeclared).length || 0;
    const totalBids = bidStats?.totalBids || 0;
    
    // FIX: Ensure resultStats is an array before using reduce
    const resultStatsArray = Array.isArray(resultStats) ? resultStats : [];
    const totalWinningBids = resultStatsArray.reduce((acc, s) => acc + (s.totalWinningBids || 0), 0);
    const totalPayout = resultStatsArray.reduce((acc, s) => acc + (s.totalPayout || 0), 0);
    const totalResults = resultStatsArray.reduce((acc, s) => acc + (s.totalResults || 0), 0);

    // Game type distribution from markets
    const gameTypeDistribution = {};
    if (Array.isArray(markets)) {
      markets.forEach(m => {
        const type = m.gameType || 'unknown';
        gameTypeDistribution[type] = (gameTypeDistribution[type] || 0) + 1;
      });
    }

    return {
      totalMarkets,
      activeMarkets,
      pendingResults,
      totalBids,
      totalWinningBids,
      totalPayout,
      totalResults,
      gameTypeDistribution,
    };
  }, [markets, bidStats, resultStats]);

  // Calculate deposit stats - FIXED
  const depositData = useMemo(() => {
    const stats = depositStats?.stats || [];
    const totalAmount = Array.isArray(stats) ? stats.reduce((sum, s) => sum + (s.totalAmount || 0), 0) : 0;
    const totalCount = Array.isArray(stats) ? stats.reduce((sum, s) => sum + (s.count || 0), 0) : 0;
    const pending = Array.isArray(stats) ? stats.find(s => s._id === 'pending')?.count || 0 : 0;
    const approved = Array.isArray(stats) ? stats.find(s => s._id === 'approved')?.count || 0 : 0;
    const rejected = Array.isArray(stats) ? stats.find(s => s._id === 'rejected')?.count || 0 : 0;
    return { totalAmount, totalCount, pending, approved, rejected, stats };
  }, [depositStats]);

  // Calculate withdrawal stats - FIXED
  const withdrawalData = useMemo(() => {
    const stats = withdrawalStats?.stats || [];
    const totalAmount = Array.isArray(stats) ? stats.reduce((sum, s) => sum + (s.totalAmount || 0), 0) : 0;
    const totalCount = Array.isArray(stats) ? stats.reduce((sum, s) => sum + (s.count || 0), 0) : 0;
    const pending = Array.isArray(stats) ? stats.find(s => s._id?.status === 'pending')?.count || 0 : 0;
    const processing = Array.isArray(stats) ? stats.find(s => s._id?.status === 'processing')?.count || 0 : 0;
    const completed = Array.isArray(stats) ? stats.find(s => s._id?.status === 'completed')?.count || 0 : 0;
    const rejected = Array.isArray(stats) ? stats.find(s => s._id?.status === 'rejected')?.count || 0 : 0;
    return { totalAmount, totalCount, pending, processing, completed, rejected, stats };
  }, [withdrawalStats]);

  // Generate dummy data for charts
  const generateDummyChartData = useCallback((days = 30) => {
    const data = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: format(date, 'MMM dd'),
        deposits: Math.floor(Math.random() * 5000) + 500,
        withdrawals: Math.floor(Math.random() * 4000) + 200,
        users: Math.floor(Math.random() * 100) + 10,
        revenue: Math.floor(Math.random() * 8000) + 1000,
        profit: Math.floor(Math.random() * 2000) + 100,
        bids: Math.floor(Math.random() * 200) + 20,
        winners: Math.floor(Math.random() * 50) + 5,
      });
    }
    return data;
  }, []);

  const [chartData, setChartData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const data = generateDummyChartData(30);
    setChartData(data);
    setWeeklyData(data.slice(-7));
    const monthData = [];
    for (let i = 0; i < 4; i++) {
      const weekData = data.slice(i * 7, (i + 1) * 7);
      monthData.push({
        week: `Week ${i + 1}`,
        deposits: weekData.reduce((sum, d) => sum + d.deposits, 0),
        withdrawals: weekData.reduce((sum, d) => sum + d.withdrawals, 0),
        revenue: weekData.reduce((sum, d) => sum + d.revenue, 0),
        bids: weekData.reduce((sum, d) => sum + d.bids, 0),
        winners: weekData.reduce((sum, d) => sum + d.winners, 0),
      });
    }
    setMonthlyData(monthData);

    // Pie data with Matka stats
    setPieData([
      { name: 'Deposits', value: depositData.totalAmount || 50000 },
      { name: 'Withdrawals', value: withdrawalData.totalAmount || 30000 },
      { name: 'Revenue', value: 20000 },
      { name: 'Bid Payout', value: matkaStats.totalPayout || 10000 },
    ]);
  }, [depositData, withdrawalData, matkaStats]);

  return {
    users,
    userStats,
    depositData,
    withdrawalData,
    matkaStats,
    chartData,
    weeklyData,
    monthlyData,
    pieData,
    loading: loading || usersLoading || depositsLoading || withdrawalsLoading || marketsLoading || bidsLoading || resultsLoading,
    timeRange,
    setTimeRange,
    lastUpdated,
    fetchAllData,
    isFullScreen,
    setIsFullScreen,
  };
};

// ============================
// Components
// ============================

// Loading Skeleton
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="mt-3 h-1 bg-gray-200 rounded-full"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 h-80 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 h-80 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

// Stat Card
const StatCard = ({ title, value, icon: Icon, color, gradient, subtitle, trend, trendValue }) => {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
          style={{ width: '65%' }}
        />
      </div>
    </motion.div>
  );
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Fullscreen Toggle Button
const FullscreenButton = ({ isFullScreen, toggleFullScreen }) => {
  return (
    <button
      onClick={toggleFullScreen}
      className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
      title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
    >
      {isFullScreen ? (
        <Minimize2 className="w-5 h-5 text-gray-600" />
      ) : (
        <Maximize2 className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

// ============================
// Main Dashboard Component
// ============================

const Dashboard = () => {
  const {
    userStats,
    depositData,
    withdrawalData,
    matkaStats,
    chartData,
    weeklyData,
    monthlyData,
    pieData,
    loading,
    timeRange,
    setTimeRange,
    lastUpdated,
    fetchAllData,
    isFullScreen,
    setIsFullScreen,
  } = useDashboardData();

  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const totalcredit = depositData.totalAmount - withdrawalData.totalAmount;

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  }, [isFullScreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Game type icons
  const gameTypeIcons = {
    single: Dice1,
    jodi: Dice2,
    panna: Dice3,
    'half-sangam': Dice4,
    'full-sangam': Dice5,
  };

  const gameTypeColors = {
    single: 'bg-blue-100 text-blue-700',
    jodi: 'bg-green-100 text-green-700',
    panna: 'bg-purple-100 text-purple-700',
    'half-sangam': 'bg-amber-100 text-amber-700',
    'full-sangam': 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="text-indigo-600" size={28} />
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live overview • Last updated: {format(lastUpdated, 'hh:mm:ss a')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            <div className="bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2 flex-1 md:flex-initial">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer w-full"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <FullscreenButton isFullScreen={isFullScreen} toggleFullScreen={toggleFullScreen} />
          </div>
        </motion.div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stats Grid - Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Users"
                value={userStats.total}
                icon={Users}
                gradient="from-indigo-500 to-blue-600"
                subtitle={`${userStats.active} active • ${userStats.blocked} blocked`}
                trend="up"
                trendValue="12% this month"
              />
              <StatCard
                title="Total Deposits"
                value={formatCurrency(depositData.totalAmount)}
                icon={TrendingUp}
                gradient="from-green-500 to-emerald-600"
                subtitle={`${depositData.totalCount} transactions • ${depositData.pending} pending`}
                trend="up"
                trendValue="8.5% this month"
              />
              <StatCard
                title="Total Withdrawals"
                value={formatCurrency(withdrawalData.totalAmount)}
                icon={TrendingDown}
                gradient="from-red-500 to-rose-600"
                subtitle={`${withdrawalData.totalCount} transactions • ${withdrawalData.pending} pending`}
                trend="down"
                trendValue="3.2% this month"
              />
              <StatCard
                title="Net credit"
                value={formatCurrency(totalcredit)}
                icon={Wallet}
                gradient="from-purple-500 to-violet-600"
                subtitle={`Platform credit`}
                trend="up"
                trendValue="5.1% this month"
              />
            </div>

            {/* 👇 Matka Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Markets"
                value={matkaStats.totalMarkets}
                icon={Gamepad2}
                gradient="from-amber-500 to-orange-600"
                subtitle={`${matkaStats.activeMarkets} active • ${matkaStats.pendingResults} pending results`}
                trend="up"
                trendValue="2 new this month"
              />
              <StatCard
                title="Total Bids"
                value={matkaStats.totalBids}
                icon={Target}
                gradient="from-blue-500 to-cyan-600"
                subtitle={`${matkaStats.totalWinningBids} winning bids`}
                trend="up"
                trendValue="15% this month"
              />
              <StatCard
                title="Total Payout"
                value={formatIndianCurrency(matkaStats.totalPayout)}
                icon={Trophy}
                gradient="from-yellow-500 to-amber-600"
                subtitle={`Total winners declared`}
                trend="up"
                trendValue="7.8% this month"
              />
              <StatCard
                title="Total Results"
                value={matkaStats.totalResults}
                icon={Award}
                gradient="from-pink-500 to-rose-600"
                subtitle={`Results declared`}
                trend="up"
                trendValue="5 new this week"
              />
            </div>

            {/* Game Type Distribution */}
            {Object.keys(matkaStats.gameTypeDistribution).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <Gamepad2 className="w-5 h-5 text-amber-500" />
                  Game Type Distribution
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.entries(matkaStats.gameTypeDistribution).map(([type, count]) => {
                    const Icon = gameTypeIcons[type] || Dice6;
                    const colorClass = gameTypeColors[type] || 'bg-gray-100 text-gray-700';
                    return (
                      <div
                        key={type}
                        className={`${colorClass} rounded-xl p-4 text-center transition-all hover:scale-105`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs font-medium uppercase">{type}</p>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detailed Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Deposits Status</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Approved</span>
                        <span className="font-semibold">{depositData.approved}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-yellow-500" /> Pending</span>
                        <span className="font-semibold">{depositData.pending}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" /> Rejected</span>
                        <span className="font-semibold">{depositData.rejected}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Withdrawals Status</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Completed</span>
                        <span className="font-semibold">{withdrawalData.completed}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-yellow-500" /> Processing</span>
                        <span className="font-semibold">{withdrawalData.processing}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" /> Rejected</span>
                        <span className="font-semibold">{withdrawalData.rejected}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-100 p-3 rounded-xl">
                    <Wallet className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">User Stats</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 text-green-500" /> Active</span>
                        <span className="font-semibold">{userStats.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><UserX className="w-3 h-3 text-red-500" /> Blocked</span>
                        <span className="font-semibold">{userStats.blocked}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-purple-500" /> Admins</span>
                        <span className="font-semibold">{userStats.admins}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Matka Quick Stats</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><Target className="w-3 h-3 text-amber-500" /> Active Markets</span>
                        <span className="font-semibold">{matkaStats.activeMarkets}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> Total Winners</span>
                        <span className="font-semibold">{matkaStats.totalWinningBids}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-orange-500" /> Pending Results</span>
                        <span className="font-semibold">{matkaStats.pendingResults}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-xl">
                    <Gamepad2 className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Main Line Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-indigo-500" />
                      Financial Overview
                    </h3>
                    <p className="text-sm text-gray-500">Revenue, deposits & withdrawals trend</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                      Deposits
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span>
                      Withdrawals
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                      Revenue
                    </span>
                  </div>
                </div>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `$${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        fill="#10b981" 
                        stroke="#10b981" 
                        fillOpacity={0.2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="deposits" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        dot={{ fill: '#6366f1', r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="withdrawals" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-500" />
                      Distribution
                    </h3>
                    <p className="text-sm text-gray-500">Revenue breakdown</p>
                  </div>
                </div>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-gray-600 truncate">{item.name}</span>
                      <span className="font-semibold ml-auto">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart - Weekly */}
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Weekly Performance
                    </h3>
                    <p className="text-sm text-gray-500">Last 7 days overview</p>
                  </div>
                </div>
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `$${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="deposits" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="withdrawals" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar Chart - Monthly */}
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-pink-500" />
                      Monthly Metrics
                    </h3>
                    <p className="text-sm text-gray-500">Performance indicators</p>
                  </div>
                </div>
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={monthlyData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="week" />
                      <PolarRadiusAxis tickFormatter={(value) => `$${value}`} />
                      <Radar name="Deposits" dataKey="deposits" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      <Radar name="Withdrawals" dataKey="withdrawals" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                      <Radar name="Revenue" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-4 md:p-6 text-white"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm flex-shrink-0">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Admin Quick Actions</h3>
                    <p className="text-indigo-100 text-sm">Manage users, deposits, withdrawals & Matka game</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap w-full md:w-auto">
                  <button 
                    onClick={() => window.location.href = '/admin/markets'}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    Manage Markets
                  </button>
                  <button 
                    onClick={() => window.location.href = '/admin/bids'}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    View Bids
                  </button>
                  <button 
                    onClick={() => window.location.href = '/admin/results/declare'}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Declare Result
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;