import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    deleteGameCount,
    getGameCounts,
    createGameCount,
    updateGameCount,
} from "../redux/gameCountSlice";
import { getTicketTypes } from "../redux/ticketTypeSlice";
import { motion, AnimatePresence } from "framer-motion";

const AdminGameCount = () => {
    const dispatch = useDispatch();
    const { gameCounts, loading } = useSelector((state) => state.gameCount);
    const { ticketTypes } = useSelector((state) => state.ticketType);

    const [form, setForm] = useState({
        ticketType: "",
        gameType: "",
        totalGames: "",
        price: "",
        label: "",
        isActive: true,
    });

    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [availableGameTypes, setAvailableGameTypes] = useState([]);
    const [selectedTicketFilter, setSelectedTicketFilter] = useState("");

    useEffect(() => {
        dispatch(getGameCounts());
        dispatch(getTicketTypes());
    }, [dispatch]);

    // Update available game types when ticket type changes
    useEffect(() => {
        if (form.ticketType) {
            const selectedTicket = ticketTypes.find(t => t._id === form.ticketType);
            if (selectedTicket && selectedTicket.gameTypes) {
                setAvailableGameTypes(selectedTicket.gameTypes);
            } else {
                setAvailableGameTypes([]);
            }
        } else {
            setAvailableGameTypes([]);
        }
    }, [form.ticketType, ticketTypes]);

    // Helper function to get game type title from ID
    const getGameTypeTitle = (gameTypeId) => {
        if (!gameTypeId) return null;

        // Search through all ticket types to find the game type
        for (const ticket of ticketTypes) {
            if (ticket.gameTypes && Array.isArray(ticket.gameTypes)) {
                const foundGame = ticket.gameTypes.find(game => game._id === gameTypeId);
                if (foundGame) {
                    return foundGame.title;
                }
            }
        }
        return null;
    };

    // Get ticket type by ID
    const getTicketTypeById = (id) => {
        return ticketTypes.find(t => t._id === id);
    };

    const resetForm = () => {
        setForm({
            ticketType: "",
            gameType: "",
            totalGames: "",
            price: "",
            label: "",
            isActive: true,
        });
        setEditId(null);
        setShowForm(false);
        setAvailableGameTypes([]);
    };

    const editHandler = (item) => {
        setEditId(item._id);
        setForm({
            ticketType: item.ticketType?._id || "",
            gameType: item.gameType || "",
            totalGames: item.totalGames || "",
            price: item.price || "",
            label: item.label || "",
            isActive: item.isActive !== false,
        });
        setShowForm(true);

        document.getElementById('game-count-form')?.scrollIntoView({
            behavior: 'smooth'
        });
    };

    const submitHandler = (e) => {
        e.preventDefault();

        const formData = {
            ticketType: form.ticketType,
            gameType: form.gameType || null,
            totalGames: parseInt(form.totalGames) || 0,
            price: parseFloat(form.price) || 0,
            label: form.label.trim(),
            isActive: form.isActive,
        };

        if (editId) {
            dispatch(updateGameCount({
                id: editId,
                data: formData,
            }));
        } else {
            dispatch(createGameCount(formData));
        }

        resetForm();
    };

    // Filter game counts
    const filteredGameCounts = gameCounts.filter(item => {
        // First filter by ticket type if selected
        if (selectedTicketFilter && item.ticketType?._id !== selectedTicketFilter) {
            return false;
        }

        const gameTypeTitle = getGameTypeTitle(item.gameType);
        const matchesSearch =
            item.ticketType?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (gameTypeTitle && gameTypeTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
            item.label?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && item.isActive !== false) ||
            (filterStatus === "inactive" && item.isActive === false);

        return matchesSearch && matchesStatus;
    });

    // Get ticket type badge color
    const getTicketBadgeColor = (ticketTitle) => {
        if (!ticketTitle) return "bg-slate-100 text-slate-700";
        const title = ticketTitle.toLowerCase();
        if (title.includes("power") || title.includes("hit")) {
            return "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200";
        }
        if (title.includes("standard")) {
            return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
        }
        return "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200";
    };

    // Group game counts by ticket type
    const groupedGameCounts = filteredGameCounts.reduce((acc, item) => {
        const ticketId = item.ticketType?._id || 'no-ticket';
        if (!acc[ticketId]) {
            acc[ticketId] = [];
        }
        acc[ticketId].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Animated Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg shadow-purple-200">
                                <span className="text-3xl">📊</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    Game Counts
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">
                                    Manage game counts and pricing for ticket types
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
                            <span className="text-sm text-slate-600">
                                Total: <span className="font-bold text-purple-600">{gameCounts.length}</span>
                            </span>
                            <div className="w-px h-6 bg-slate-200"></div>
                            <span className="text-sm text-slate-600">
                                Active: <span className="font-bold text-emerald-600">
                                    {gameCounts.filter(t => t.isActive !== false).length}
                                </span>
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Form Card */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            id="game-count-form"
                            className="overflow-hidden"
                        >
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-purple-100/50 p-8 mb-8 border border-white/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        {editId ? (
                                            <>
                                                <span className="text-amber-500">✏️</span>
                                                <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                                                    Edit Game Count
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-purple-500">✨</span>
                                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                    Add New Game Count
                                                </span>
                                            </>
                                        )}
                                    </h2>
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                                    >
                                        <span>✖</span> Close
                                    </button>
                                </div>

                                <form onSubmit={submitHandler} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="relative group">
                                            <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                                                Ticket Type *
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                                                value={form.ticketType}
                                                onChange={(e) => setForm({ ...form, ticketType: e.target.value, gameType: "" })}
                                                required
                                            >
                                                <option value="">Select Ticket Type</option>
                                                {ticketTypes.map((ticket) => (
                                                    <option key={ticket._id} value={ticket._id}>
                                                        {ticket.title} {ticket.subTitle ? `(${ticket.subTitle})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {form.ticketType && (
                                                <div className="mt-1">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getTicketBadgeColor(
                                                        ticketTypes.find(t => t._id === form.ticketType)?.title
                                                    )}`}>
                                                        {ticketTypes.find(t => t._id === form.ticketType)?.title || ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative group">
                                            <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                                                Game Type
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                                                value={form.gameType}
                                                onChange={(e) => setForm({ ...form, gameType: e.target.value })}
                                                disabled={!form.ticketType}
                                            >
                                                <option value="">No Game Type</option>
                                                {availableGameTypes.map((game) => (
                                                    <option key={game._id} value={game._id}>
                                                        {game.title}
                                                    </option>
                                                ))}
                                            </select>
                                            {!form.ticketType && (
                                                <p className="text-xs text-amber-500 mt-1">
                                                    ⚠️ Please select a ticket type first
                                                </p>
                                            )}
                                            {form.ticketType && availableGameTypes.length === 0 && (
                                                <p className="text-xs text-amber-500 mt-1">
                                                    ⚠️ No game types available for this ticket
                                                </p>
                                            )}
                                            {form.ticketType && availableGameTypes.length > 0 && (
                                                <p className="text-xs text-emerald-500 mt-1">
                                                    ✅ {availableGameTypes.length} game type(s) available
                                                </p>
                                            )}
                                        </div>

                                        <div className="relative group">
                                            <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                                                Total Games *
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                                                placeholder="Number of games..."
                                                value={form.totalGames}
                                                onChange={(e) => setForm({ ...form, totalGames: e.target.value })}
                                                required
                                                min="1"
                                            />
                                        </div>

                                        <div className="relative group">
                                            <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                                                Price ($) *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full pl-7 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                                                    placeholder="0.00"
                                                    value={form.price}
                                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                                                Label
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                                                placeholder="Optional label..."
                                                value={form.label}
                                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                            />
                                        </div>

                                        <div className="relative group">
                                            <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                                                Status
                                            </label>
                                            <div className="flex items-center gap-3 pt-1">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={form.isActive === true}
                                                        onChange={() => setForm({ ...form, isActive: true })}
                                                        className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Active</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={form.isActive === false}
                                                        onChange={() => setForm({ ...form, isActive: false })}
                                                        className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Inactive</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${editId
                                                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-amber-200"
                                                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-200"
                                                }`}
                                        >
                                            {editId ? "🔄 Update Game Count" : "✨ Create Game Count"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-purple-100/50 overflow-hidden border border-white/50"
                >
                    {/* Filters and Actions */}
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="🔍 Search by ticket, game, or label..."
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white/50"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Ticket Type Filter Dropdown */}
                            <div className="min-w-[180px]">
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white/50"
                                    value={selectedTicketFilter}
                                    onChange={(e) => setSelectedTicketFilter(e.target.value)}
                                >
                                    <option value="">All Ticket Types</option>
                                    {ticketTypes.map((ticket) => (
                                        <option key={ticket._id} value={ticket._id}>
                                            {ticket.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="min-w-[140px]">
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none bg-white/50"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">🟢 Active</option>
                                    <option value="inactive">🔴 Inactive</option>
                                </select>
                            </div>

                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-purple-200"
                            >
                                <span>➕</span> Add Game Count
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                    <p className="text-slate-500 font-medium">Loading game counts...</p>
                                </div>
                            </div>
                        ) : filteredGameCounts.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-5xl">📭</span>
                                    <p className="text-lg font-medium text-slate-600">No game counts found</p>
                                    <p className="text-sm text-slate-400">Add your first game count using the form above</p>
                                </div>
                            </div>
                        ) : (
                            // Group by ticket type and render separate tables
                            Object.entries(groupedGameCounts).map(([ticketId, items]) => {
                                const ticket = getTicketTypeById(ticketId);
                                const ticketTitle = ticket?.title || 'No Ticket Type';
                                const ticketSubTitle = ticket?.subTitle || '';
                                const isPowerHit = ticketTitle.toLowerCase().includes('power') || ticketTitle.toLowerCase().includes('hit');

                                return (
                                    <div key={ticketId} className="mb-6 last:mb-0">
                                        {/* Ticket Type Header */}
                                        <div className={`px-6 py-3 ${isPowerHit ? 'bg-gradient-to-r from-orange-50 to-red-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} border-b border-slate-200`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{isPowerHit ? '⚡' : '📋'}</span>
                                                <div>
                                                    <h3 className={`text-lg font-bold ${isPowerHit ? 'text-orange-700' : 'text-blue-700'}`}>
                                                        {ticketTitle}
                                                    </h3>
                                                    {ticketSubTitle && (
                                                        <p className="text-sm text-slate-500">{ticketSubTitle}</p>
                                                    )}
                                                </div>
                                                <span className="ml-auto text-sm text-slate-500">
                                                    {items.length} game count{items.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Table for this ticket type */}
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Game Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Games</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Label</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {items.map((item, index) => {
                                                    const gameTypeTitle = getGameTypeTitle(item.gameType);
                                                    return (
                                                        <motion.tr
                                                            key={item._id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="hover:bg-purple-50/30 transition-colors duration-200 group"
                                                        >
                                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full text-slate-700 font-bold text-xs">
                                                                    {index + 1}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {gameTypeTitle ? (
                                                                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${isPowerHit
                                                                            ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800'
                                                                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
                                                                        }`}>
                                                                        {gameTypeTitle}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">
                                                                        No Game Type
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    <span className="text-sm font-bold text-slate-700">
                                                                        {item.totalGames}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400">games</span>
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-sm">
                                                                    ${item.price?.toFixed(2) || "0.00"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                                {item.label || <span className="text-slate-400 italic">No label</span>}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${item.isActive !== false
                                                                            ? "bg-emerald-100 text-emerald-800"
                                                                            : "bg-red-100 text-red-800"
                                                                        }`}
                                                                >
                                                                    <span
                                                                        className={`w-2 h-2 rounded-full mr-2 animate-pulse ${item.isActive !== false ? "bg-emerald-500" : "bg-red-500"
                                                                            }`}
                                                                    ></span>
                                                                    {item.isActive !== false ? "Active" : "Inactive"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        className="px-3.5 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 flex items-center gap-1.5 group-hover:shadow-md"
                                                                        onClick={() => editHandler(item)}
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                    <button
                                                                        className="px-3.5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 flex items-center gap-1.5 group-hover:shadow-md"
                                                                        onClick={() => {
                                                                            if (window.confirm('Are you sure you want to delete this game count?')) {
                                                                                dispatch(deleteGameCount(item._id));
                                                                            }
                                                                        }}
                                                                    >
                                                                        🗑️ Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && filteredGameCounts.length > 0 && (
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-purple-50/30 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                                Showing <span className="font-semibold text-purple-600">{filteredGameCounts.length}</span> of{' '}
                                <span className="font-semibold">{gameCounts.length}</span> game counts
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {gameCounts.filter(t => t.isActive !== false).length} Active
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {gameCounts.filter(t => t.isActive === false).length} Inactive
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    {gameCounts.length} Total
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminGameCount;