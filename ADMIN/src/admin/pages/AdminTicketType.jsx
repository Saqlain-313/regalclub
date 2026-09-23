import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "../redux/ticketTypeSlice";
import { motion, AnimatePresence } from "framer-motion";

const AdminTicketType = () => {
  const dispatch = useDispatch();
  const { ticketTypes } = useSelector((state) => state.ticketType);

  const [form, setForm] = useState({
    title: "",
    subTitle: "",
    order: "",
    gameTypes: [],
  });

  const [editId, setEditId] = useState(null);
  const [newGameType, setNewGameType] = useState("");
  const [availableGameTypes, setAvailableGameTypes] = useState([]);
  const [selectedGameTypeIds, setSelectedGameTypeIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showGameTypes, setShowGameTypes] = useState(false); // New state for toggling game types visibility

  useEffect(() => {
    dispatch(getTicketTypes());
  }, [dispatch]);

  const getNextGameTypeOrder = () => {
    if (availableGameTypes.length === 0) return 0;
    const maxOrder = Math.max(...availableGameTypes.map(gt => gt.order || 0));
    return maxOrder + 1;
  };

  const editHandler = (item) => {
    setEditId(item._id);
    setShowGameTypes(true); // Show game types section when editing
    setForm({
      title: item.title || "",
      subTitle: item.subTitle || "",
      order: item.order || "",
      gameTypes: item.gameTypes || [],
    });

    const gameTypesCopy = Array.isArray(item.gameTypes) 
      ? item.gameTypes.map(gt => ({ ...gt }))
      : [];
    
    const sortedGameTypes = gameTypesCopy.sort((a, b) => (a.order || 0) - (b.order || 0));
    setAvailableGameTypes(sortedGameTypes);
    setSelectedGameTypeIds(sortedGameTypes.map(gt => gt._id?.toString() || gt._id));
    
    // Scroll to form
    document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({
      title: "",
      subTitle: "",
      order: "",
      gameTypes: [],
    });
    setEditId(null);
    setAvailableGameTypes([]);
    setSelectedGameTypeIds([]);
    setNewGameType("");
    setShowGameTypes(false); // Hide game types section when resetting
  };

  const handleAddGameType = () => {
    if (newGameType.trim() === "") {
      alert("Please enter a game type name");
      return;
    }

    const exists = availableGameTypes.some(
      gt => gt.title.toLowerCase() === newGameType.trim().toLowerCase()
    );

    if (exists) {
      alert("This game type already exists in this ticket!");
      return;
    }

    const newGame = {
      _id: Date.now().toString(),
      title: newGameType.trim(),
      description: "",
      order: getNextGameTypeOrder(),
      isActive: true,
    };

    const updatedGameTypes = [...availableGameTypes, newGame].sort((a, b) => (a.order || 0) - (b.order || 0));
    setAvailableGameTypes(updatedGameTypes);
    
    const newSelectedIds = [...selectedGameTypeIds, newGame._id.toString()];
    setSelectedGameTypeIds(newSelectedIds);
    
    const selectedGameTypes = updatedGameTypes.filter(
      gt => newSelectedIds.includes(gt._id.toString())
    );
    setForm(prev => ({
      ...prev,
      gameTypes: selectedGameTypes
    }));
    
    setNewGameType("");
  };

  const handleRemoveGameType = (gameTypeId) => {
    if (window.confirm("Are you sure you want to remove this game type from this ticket?")) {
      const updatedGameTypes = availableGameTypes.filter(
        gt => gt._id.toString() !== gameTypeId
      );
      
      const reorderedGameTypes = updatedGameTypes.map((gt, index) => ({
        ...gt,
        order: index
      }));
      
      setAvailableGameTypes(reorderedGameTypes);
      
      const newSelectedIds = selectedGameTypeIds.filter(id => id !== gameTypeId);
      setSelectedGameTypeIds(newSelectedIds);
      
      const selectedGameTypes = reorderedGameTypes.filter(
        gt => newSelectedIds.includes(gt._id.toString())
      );
      setForm(prev => ({
        ...prev,
        gameTypes: selectedGameTypes
      }));
    }
  };

  const handleGameTypeToggle = (gameTypeId) => {
    const id = gameTypeId.toString();
    
    if (selectedGameTypeIds.includes(id)) {
      const newSelectedIds = selectedGameTypeIds.filter(gid => gid !== id);
      setSelectedGameTypeIds(newSelectedIds);
      
      const selectedGameTypes = availableGameTypes.filter(
        gt => newSelectedIds.includes(gt._id.toString())
      );
      setForm(prev => ({
        ...prev,
        gameTypes: selectedGameTypes
      }));
    } else {
      const newSelectedIds = [...selectedGameTypeIds, id];
      setSelectedGameTypeIds(newSelectedIds);
      
      const selectedGameTypes = availableGameTypes.filter(
        gt => newSelectedIds.includes(gt._id.toString())
      );
      setForm(prev => ({
        ...prev,
        gameTypes: selectedGameTypes
      }));
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    const formData = {
      title: form.title.trim(),
      subTitle: form.subTitle.trim(),
      order: parseInt(form.order) || 0,
      gameTypes: form.gameTypes || [],
    };

    if (editId) {
      dispatch(
        updateTicketType({
          id: editId,
          data: formData,
        })
      );
    } else {
      dispatch(createTicketType(formData));
    }

    resetForm();
  };

  const isGameTypeSelected = (gameTypeId) => {
    return selectedGameTypeIds.includes(gameTypeId.toString());
  };

  const moveGameType = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === availableGameTypes.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...availableGameTypes];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, removed);

    const updatedGameTypes = reordered.map((gt, idx) => ({
      ...gt,
      order: idx
    }));

    setAvailableGameTypes(updatedGameTypes);

    const selectedGameTypes = updatedGameTypes.filter(
      gt => selectedGameTypeIds.includes(gt._id.toString())
    );
    setForm(prev => ({
      ...prev,
      gameTypes: selectedGameTypes
    }));
  };

  // Filter ticket types
  const filteredTicketTypes = ticketTypes.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && item.isActive !== false) ||
                         (filterStatus === "inactive" && item.isActive === false);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
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
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-200">
                <span className="text-3xl">🎫</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Ticket Types
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Manage your ticket categories and game types
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
              <span className="text-sm text-slate-600">
                Total: <span className="font-bold text-indigo-600">{ticketTypes.length}</span>
              </span>
              <div className="w-px h-6 bg-slate-200"></div>
              <span className="text-sm text-slate-600">
                Active: <span className="font-bold text-emerald-600">
                  {ticketTypes.filter(t => t.isActive !== false).length}
                </span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          id="ticket-form"
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 mb-8 border border-white/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {editId ? (
                <>
                  <span className="text-amber-500">✏️</span> 
                  <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    Edit Ticket Type
                  </span>
                </>
              ) : (
                <>
                  <span className="text-blue-500">✨</span> 
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Create New Ticket Type
                  </span>
                </>
              )}
            </h2>
            {editId && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <span>✖</span> Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">Title *</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                  placeholder="Enter ticket title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="relative group">
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">Sub Title</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                  placeholder="Enter subtitle..."
                  value={form.subTitle}
                  onChange={(e) => setForm({ ...form, subTitle: e.target.value })}
                />
              </div>

              <div className="relative group">
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">Order</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                  placeholder="Display order..."
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </div>
            </div>

            {/* Game Types Management - Conditionally Rendered */}
            <AnimatePresence>
              {showGameTypes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-2 border-slate-200 rounded-2xl p-6 bg-white/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-xl">🎮</span> Game Types for this Ticket
                      </label>
                      <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                        {selectedGameTypeIds.length} / {availableGameTypes.length} selected
                      </span>
                    </div>

                    {/* Add New Game Type Input */}
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                          placeholder="Enter new game type name..."
                          value={newGameType}
                          onChange={(e) => setNewGameType(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddGameType();
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddGameType}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-200"
                      >
                        <span>➕</span> Add
                      </button>
                    </div>

                    {/* Game Types Grid */}
                    {availableGameTypes.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="text-5xl mb-3">🎮</div>
                        <p className="text-slate-500 font-medium">No game types added yet</p>
                        <p className="text-slate-400 text-sm mt-1">Use the input above to add game types</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableGameTypes.map((gameType, index) => (
                          <motion.div
                            key={gameType._id.toString()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="group relative flex items-center gap-2 p-2 rounded-xl hover:bg-white/50 transition-all duration-200"
                          >
                            <span className="text-xs font-mono text-slate-400 w-6 text-center">
                              #{gameType.order || index}
                            </span>
                            <label
                              className={`flex items-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all duration-200 flex-1 ${
                                isGameTypeSelected(gameType._id)
                                  ? "border-blue-500 bg-blue-50/50 shadow-sm"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isGameTypeSelected(gameType._id)}
                                onChange={() => handleGameTypeToggle(gameType._id)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-slate-700 flex-1">
                                {gameType.title}
                              </span>
                            </label>

                            {/* Order controls */}
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => moveGameType(index, 'up')}
                                className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                                  index === 0 
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                    : 'bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-700'
                                }`}
                                disabled={index === 0}
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => moveGameType(index, 'down')}
                                className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                                  index === availableGameTypes.length - 1
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-700'
                                }`}
                                disabled={index === availableGameTypes.length - 1}
                              >
                                ▼
                              </button>
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveGameType(gameType._id.toString())}
                              className="w-8 h-8 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:shadow-lg flex-shrink-0"
                            >
                              ✕
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {availableGameTypes.length > 0 && (
                      <div className="mt-4 text-xs text-slate-400 text-center border-t border-slate-200 pt-4">
                        <span className="font-medium">{availableGameTypes.length}</span> game type{availableGameTypes.length > 1 ? 's' : ''} 
                        <span className="mx-2">•</span>
                        Order: {availableGameTypes.map((gt, i) => `${i+1}: ${gt.title}`).join(' → ')}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <button
                type="submit"
                className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
                  editId
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-amber-200"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200"
                }`}
              >
                {editId ? "🔄 Update Ticket Type" : "✨ Create Ticket Type"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Filters and Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden border border-white/50"
        >
          {/* Filters */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Search ticket types..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white/50"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">🟢 Active</option>
                  <option value="inactive">🔴 Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Subtitle</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Game Types</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                <AnimatePresence>
                  {filteredTicketTypes.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-5xl">📭</span>
                          <p className="text-lg font-medium text-slate-600">No ticket types found</p>
                          <p className="text-sm text-slate-400">Create your first ticket type using the form above</p>
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    filteredTicketTypes.map((item, index) => {
                      const sortedGameTypes = Array.isArray(item.gameTypes)
                        ? [...item.gameTypes].sort((a, b) => (a.order || 0) - (b.order || 0))
                        : [];
                      
                      return (
                        <motion.tr 
                          key={item._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-blue-50/30 transition-colors duration-200 group"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full text-slate-700 font-bold text-xs">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">{item.title}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {item.subTitle || <span className="text-slate-400 italic">No subtitle</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">
                              {item.order || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {sortedGameTypes.length > 0 ? (
                                sortedGameTypes.slice(0, 3).map((gameType, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2.5 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-lg text-xs font-medium"
                                  >
                                    {gameType.title}
                                    {gameType.order !== undefined && (
                                      <span className="text-[10px] text-indigo-400 ml-1">#{gameType.order}</span>
                                    )}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic text-sm">No games</span>
                              )}
                              {sortedGameTypes.length > 3 && (
                                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                  +{sortedGameTypes.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                item.isActive !== false
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                                  item.isActive !== false ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              ></span>
                              {item.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="px-3.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 flex items-center gap-1.5 group-hover:shadow-md"
                                onClick={() => editHandler(item)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="px-3.5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 flex items-center gap-1.5 group-hover:shadow-md"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this ticket type?')) {
                                    dispatch(deleteTicketType(item._id));
                                  }
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          {filteredTicketTypes.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-indigo-600">{filteredTicketTypes.length}</span> of{' '}
                <span className="font-semibold">{ticketTypes.length}</span> ticket types
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {ticketTypes.filter(t => t.isActive !== false).length} Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  {ticketTypes.filter(t => t.isActive === false).length} Inactive
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTicketType;