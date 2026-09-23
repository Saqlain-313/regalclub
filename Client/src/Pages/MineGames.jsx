import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getAllMineGames,
  createMineGame,
  updateMineGame,
  deleteMineGame,
  toggleMineGame,
  clearMineGameError,
  clearMineGameMessage,
} from "../redux/slices/mineGameSlice";

const emptyForm = {
  name: "Mines",
  gridSize: 5,
  minesCount: 5,
  betAmount: 10,
  minBet: 10,
  maxBet: 10000,
  multiplier: 1,
  isActive: true,
  description: "",
};

const MineGames = () => {
  const dispatch = useDispatch();

  const {
    games,
    loading,
    creating,
    updating,
    deleting,
    error,
    success,
    message,
  } = useSelector((state) => state.mineGame);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    dispatch(getAllMineGames());
  }, [dispatch]);

  // ============================================================
  // AUTO CLEAR MESSAGE
  // ============================================================

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMineGameMessage());
        dispatch(clearMineGameError());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // ============================================================
  // INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  // ============================================================
  // OPEN CREATE
  // ============================================================

  const handleCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (game) => {
    setEditingId(game._id);

    setForm({
      name: game.name || "Mines",
      gridSize: game.gridSize || 5,
      minesCount: game.minesCount || 5,
      betAmount: game.betAmount || 10,
      minBet: game.minBet || 10,
      maxBet: game.maxBet || 10000,
      multiplier: game.multiplier || 1,
      isActive: game.isActive ?? true,
      description: game.description || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gridSize = Number(form.gridSize);
    const minesCount = Number(form.minesCount);
    const minBet = Number(form.minBet);
    const maxBet = Number(form.maxBet);

    const totalCells = gridSize * gridSize;

    if (minesCount >= totalCells) {
      alert("Mines count must be less than total cells");
      return;
    }

    if (minBet > maxBet) {
      alert("Minimum bet cannot be greater than maximum bet");
      return;
    }

    const payload = {
      name: form.name,
      gridSize,
      minesCount,
      betAmount: Number(form.betAmount),
      minBet,
      maxBet,
      multiplier: Number(form.multiplier),
      isActive: Boolean(form.isActive),
      description: form.description,
    };

    if (editingId) {
      const result = await dispatch(
        updateMineGame({
          id: editingId,
          data: payload,
        })
      );

      if (updateMineGame.fulfilled.match(result)) {
        resetForm();
        dispatch(getAllMineGames());
      }
    } else {
      const result = await dispatch(createMineGame(payload));

      if (createMineGame.fulfilled.match(result)) {
        resetForm();
        dispatch(getAllMineGames());
      }
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Mines game?"
    );

    if (!confirmed) return;

    await dispatch(deleteMineGame(id));
  };

  // ============================================================
  // TOGGLE
  // ============================================================

  const handleToggle = async (id) => {
    await dispatch(toggleMineGame(id));
  };

  // ============================================================
  // GRID PREVIEW
  // ============================================================

  const renderGridPreview = () => {
    const size = Number(form.gridSize || 5);
    const cells = size * size;

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gap: "5px",
          width: "180px",
          marginTop: "15px",
        }}
      >
        {Array.from({ length: cells }).map((_, index) => (
          <div
            key={index}
            style={{
              aspectRatio: "1",
              borderRadius: "5px",
              background: "#1f2937",
              border: "1px solid #374151",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "25px",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            Mines Games
          </h1>

          <p
            style={{
              marginTop: "6px",
              color: "#6b7280",
            }}
          >
            Manage Mines game configurations
          </p>
        </div>

        <button
          onClick={handleCreate}
          style={{
            border: "none",
            background: "#111827",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Create Mines
        </button>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {success && message && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {message}
        </div>
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      {showForm && (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "25px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              {editingId ? "Edit Mines Game" : "Create Mines Game"}
            </h2>

            <button
              onClick={resetForm}
              style={{
                border: "none",
                background: "#f3f4f6",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >
              {/* NAME */}

              <div>
                <label>Game Name</label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Mines"
                  style={inputStyle}
                />
              </div>

              {/* GRID */}

              <div>
                <label>Grid Size</label>

                <select
                  name="gridSize"
                  value={form.gridSize}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value={5}>5 × 5</option>
                  <option value={6}>6 × 6</option>
                  <option value={7}>7 × 7</option>
                  <option value={8}>8 × 8</option>
                  <option value={9}>9 × 9</option>
                  <option value={10}>10 × 10</option>
                </select>
              </div>

              {/* MINES */}

              <div>
                <label>Mines Count</label>

                <input
                  type="number"
                  name="minesCount"
                  value={form.minesCount}
                  onChange={handleChange}
                  min="1"
                  max={Number(form.gridSize) ** 2 - 1}
                  style={inputStyle}
                />
              </div>

              {/* BET */}

              <div>
                <label>Default Bet</label>

                <input
                  type="number"
                  name="betAmount"
                  value={form.betAmount}
                  onChange={handleChange}
                  min="0"
                  style={inputStyle}
                />
              </div>

              {/* MIN BET */}

              <div>
                <label>Minimum Bet</label>

                <input
                  type="number"
                  name="minBet"
                  value={form.minBet}
                  onChange={handleChange}
                  min="0"
                  style={inputStyle}
                />
              </div>

              {/* MAX BET */}

              <div>
                <label>Maximum Bet</label>

                <input
                  type="number"
                  name="maxBet"
                  value={form.maxBet}
                  onChange={handleChange}
                  min="0"
                  style={inputStyle}
                />
              </div>

              {/* MULTIPLIER */}

              <div>
                <label>Multiplier</label>

                <input
                  type="number"
                  name="multiplier"
                  value={form.multiplier}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  style={inputStyle}
                />
              </div>

              {/* ACTIVE */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "25px",
                }}
              >
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  style={{
                    width: "18px",
                    height: "18px",
                  }}
                />

                <label>Game Active</label>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div style={{ marginTop: "18px" }}>
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter game description"
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            {/* PREVIEW */}

            <div style={{ marginTop: "20px" }}>
              <strong>Grid Preview</strong>

              {renderGridPreview()}

              <div
                style={{
                  marginTop: "10px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Total Cells:{" "}
                {Number(form.gridSize) * Number(form.gridSize)}
                {" • "}
                Mines: {form.minesCount}
              </div>
            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <button
                type="submit"
                disabled={creating || updating}
                style={{
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  padding: "12px 22px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  opacity: creating || updating ? 0.6 : 1,
                }}
              >
                {creating
                  ? "Creating..."
                  : updating
                  ? "Updating..."
                  : editingId
                  ? "Update Game"
                  : "Create Game"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  padding: "12px 22px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0 }}>All Mines Games</h2>

          <span style={{ color: "#6b7280" }}>
            {games.length} game{games.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading Mines games...
          </div>
        ) : games.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            No Mines games found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>Game</th>
                  <th style={thStyle}>Grid</th>
                  <th style={thStyle}>Mines</th>
                  <th style={thStyle}>Bet</th>
                  <th style={thStyle}>Limits</th>
                  <th style={thStyle}>Multiplier</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {games.map((game) => (
                  <tr key={game._id}>
                    <td style={tdStyle}>
                      <strong>{game.name}</strong>

                      {game.description && (
                        <div
                          style={{
                            color: "#6b7280",
                            fontSize: "12px",
                            marginTop: "3px",
                          }}
                        >
                          {game.description}
                        </div>
                      )}
                    </td>

                    <td style={tdStyle}>
                      {game.gridSize} × {game.gridSize}
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {game.totalCells} cells
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <strong>{game.minesCount}</strong>
                    </td>

                    <td style={tdStyle}>
                      {game.betAmount}
                    </td>

                    <td style={tdStyle}>
                      {game.minBet} - {game.maxBet}
                    </td>

                    <td style={tdStyle}>
                      ×{game.multiplier}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: game.isActive
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: game.isActive
                            ? "#166534"
                            : "#991b1b",
                        }}
                      >
                        {game.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "7px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(game)}
                          style={actionButton("#2563eb")}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggle(game._id)}
                          style={actionButton(
                            game.isActive
                              ? "#f59e0b"
                              : "#16a34a"
                          )}
                        >
                          {game.isActive ? "Disable" : "Enable"}
                        </button>

                        <button
                          onClick={() => handleDelete(game._id)}
                          disabled={deleting}
                          style={actionButton("#dc2626")}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// STYLES
// ============================================================

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: "7px",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  outline: "none",
  fontSize: "14px",
  background: "#fff",
};

const thStyle = {
  padding: "14px 15px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  color: "#374151",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
  verticalAlign: "middle",
};

const actionButton = (background) => ({
  border: "none",
  background,
  color: "#fff",
  padding: "7px 11px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
});

export default MineGames;