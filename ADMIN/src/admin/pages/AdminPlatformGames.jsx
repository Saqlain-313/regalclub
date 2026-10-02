// pages/AdminPlatformGames.jsx
// Home page "Platform recommendation" games manage karo:
// - New game add (default: "All" me dikhta hai)
// - isTop6 toggle -> home par top section me show
// - Active/inactive toggle, edit, delete
import React, { useEffect, useState } from "react";
import {
  Gamepad2,
  Loader2,
  Plus,
  Star,
  Trash2,
  Pencil,
  Power,
  Crown,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../redux/api";

const EMPTY_FORM = {
  game_name: "",
  game_uid: "",
  icon: "",
  category: "instant",
  game_type: "Instant",
  provider: "",
  rating: 4.5,
  players: "",
  volatility: "Medium",
  isTop6: false,
  isNew: false,
  isActive: true,
  sortOrder: 100,
};

const AdminPlatformGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/platform-games/admin/all");
      setGames(data?.games || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (game) => {
    setEditingId(game._id);
    setForm({
      game_name: game.game_name || "",
      game_uid: game.game_uid || "",
      icon: game.icon || "",
      category: game.category || "instant",
      game_type: game.game_type || "Instant",
      provider: game.provider || "",
      rating: game.rating ?? 4.5,
      players: game.players || "",
      volatility: game.volatility || "Medium",
      isTop6: Boolean(game.isTop6),
      isNew: Boolean(game.isNew),
      isActive: game.isActive !== false,
      sortOrder: game.sortOrder ?? 100,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!form.game_name.trim() || !form.game_uid.trim()) {
      toast.error("Game name and Game UID are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        rating: Number(form.rating) || 4.5,
        sortOrder: Number(form.sortOrder) || 100,
      };

      if (editingId) {
        await api.put(`/platform-games/admin/${editingId}`, payload);
        toast.success("Game updated successfully");
      } else {
        await api.post("/platform-games/admin", payload);
        toast.success("Game added successfully");
      }

      setShowModal(false);
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save game");
    } finally {
      setSaving(false);
    }
  };

  const toggleTop6 = async (game) => {
    try {
      const { data } = await api.put(`/platform-games/admin/${game._id}`, {
        isTop6: !game.isTop6,
      });
      toast.success(
        data?.game?.isTop6
          ? `${game.game_name} added to Top 6 (home section)`
          : `${game.game_name} removed from Top 6`,
      );
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update");
    }
  };

  const toggleActive = async (game) => {
    try {
      await api.put(`/platform-games/admin/${game._id}`, {
        isActive: game.isActive === false,
      });
      toast.success(
        game.isActive === false
          ? `${game.game_name} activated`
          : `${game.game_name} deactivated`,
      );
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async (game) => {
    if (!window.confirm(`Delete "${game.game_name}"?`)) return;

    try {
      await api.delete(`/platform-games/admin/${game._id}`);
      toast.success("Game deleted");
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete");
    }
  };

  const top6Count = games.filter((g) => g.isTop6).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gamepad2 className="text-indigo-600" />
          Platform Games
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 border border-slate-200 bg-white text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Add Game
          </button>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-5 text-xs text-slate-600 max-w-3xl">
        <strong>Top 6</strong> wale games home page ke "Platform
        recommendation" section me dikhte hain (abhi {top6Count} selected).
        Baaki sab games <strong>All</strong> page ({"/games/all"}) par dikhte
        hain. Naya game add karne par default wo All me aata hai.
      </div>

      {/* GAMES TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : games.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">
            No games yet. Click "Add Game" to create one.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {games.map((game) => (
              <div
                key={game._id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  game.isActive === false ? "opacity-50" : ""
                }`}
              >
                <img
                  src={game.icon || "https://via.placeholder.com/60x80"}
                  alt={game.game_name}
                  className="w-10 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/60x80";
                  }}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                    {game.game_name}
                    {game.isTop6 && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Crown className="w-3 h-3" /> TOP 6
                      </span>
                    )}
                    {game.isNew && (
                      <span className="text-[9px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                    {game.isActive === false && (
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        HIDDEN
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {game.provider || "—"} · {game.category} ·{" "}
                    <Star className="w-3 h-3 inline text-amber-400" />{" "}
                    {game.rating} · UID: {game.game_uid.slice(0, 12)}…
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleTop6(game)}
                    title={game.isTop6 ? "Remove from Top 6" : "Add to Top 6"}
                    className={`p-2 rounded-lg border transition ${
                      game.isTop6
                        ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200"
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(game)}
                    title={
                      game.isActive === false ? "Activate" : "Hide from users"
                    }
                    className={`p-2 rounded-lg border transition ${
                      game.isActive === false
                        ? "bg-green-50 border-green-200 text-green-600"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200"
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(game)}
                    title="Edit"
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(game)}
                    title="Delete"
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== ADD / EDIT MODAL ===== */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {editingId ? "Edit Game" : "Add New Game"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Game Name *
                </span>
                <input
                  name="game_name"
                  value={form.game_name}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Game UID (provider id) *
                </span>
                <input
                  name="game_uid"
                  value={form.game_uid}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono bg-slate-50 outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-slate-600">
                  Icon URL
                </span>
                <input
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Category
                </span>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                >
                  {["instant", "chicken", "mines", "aviator", "table", "slot", "casino"].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Game Type
                </span>
                <input
                  name="game_type"
                  value={form.game_type}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Provider
                </span>
                <input
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Rating (0-5)
                </span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Players text (e.g. 1.8K)
                </span>
                <input
                  name="players"
                  value={form.players}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Volatility
                </span>
                <select
                  name="volatility"
                  value={form.volatility}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                >
                  {["Low", "Medium", "High"].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Sort Order
                </span>
                <input
                  type="number"
                  name="sortOrder"
                  value={form.sortOrder}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none focus:border-indigo-400"
                />
              </label>

              <div className="sm:col-span-2 flex flex-wrap gap-4 mt-1">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isTop6"
                    checked={form.isTop6}
                    onChange={handleChange}
                    className="w-4 h-4 accent-amber-500"
                  />
                  Show in Top 6 (home section)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={form.isNew}
                    onChange={handleChange}
                    className="w-4 h-4 accent-green-500"
                  />
                  NEW badge
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 accent-indigo-500"
                  />
                  Active (visible to users)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Game"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlatformGames;
