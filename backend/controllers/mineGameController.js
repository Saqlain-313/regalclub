const MineGame = require("../models/MineGame");
const mongoose = require("mongoose");

// ============================================================
// GET ALL MINE GAMES - ADMIN
// ============================================================

const getAllMineGames = async (req, res) => {
  try {
    const games = await MineGame.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error("getAllMineGames error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get mine games",
      error: error.message,
    });
  }
};

// ============================================================
// GET ACTIVE MINE GAMES - PUBLIC / USER
// ============================================================

const getActiveMineGames = async (req, res) => {
  try {
    const games = await MineGame.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error("getActiveMineGames error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get active mine games",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE MINE GAME
// ============================================================

const getMineGameById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mine game ID",
      });
    }

    const game = await MineGame.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Mine game not found",
      });
    }

    return res.status(200).json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("getMineGameById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get mine game",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE MINE GAME - ADMIN
// ============================================================

const createMineGame = async (req, res) => {
  try {
    const {
      name,
      gridSize,
      minesCount,
      betAmount,
      minBet,
      maxBet,
      multiplier,
      isActive,
      description,
    } = req.body;

    if (!minesCount) {
      return res.status(400).json({
        success: false,
        message: "Mines count is required",
      });
    }

    const finalGridSize = Number(gridSize || 5);
    const totalCells = finalGridSize * finalGridSize;
    const finalMinesCount = Number(minesCount);

    if (finalMinesCount >= totalCells) {
      return res.status(400).json({
        success: false,
        message: "Mines count must be less than total cells",
      });
    }

    const finalMinBet = Number(minBet ?? 10);
    const finalMaxBet = Number(maxBet ?? 10000);

    if (finalMinBet > finalMaxBet) {
      return res.status(400).json({
        success: false,
        message: "Minimum bet cannot be greater than maximum bet",
      });
    }

    const game = await MineGame.create({
      name: name || "Mines",
      gridSize: finalGridSize,
      totalCells,
      minesCount: finalMinesCount,
      betAmount: Number(betAmount ?? finalMinBet),
      minBet: finalMinBet,
      maxBet: finalMaxBet,
      multiplier: Number(multiplier ?? 1),
      isActive:
        typeof isActive === "boolean" ? isActive : true,
      description: description || "",
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Mine game created successfully",
      game,
    });
  } catch (error) {
    console.error("createMineGame error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create mine game",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE MINE GAME - ADMIN
// ============================================================

const updateMineGame = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mine game ID",
      });
    }

    const game = await MineGame.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Mine game not found",
      });
    }

    const {
      name,
      gridSize,
      minesCount,
      betAmount,
      minBet,
      maxBet,
      multiplier,
      isActive,
      description,
    } = req.body;

    const newGridSize =
      gridSize !== undefined
        ? Number(gridSize)
        : game.gridSize;

    const newTotalCells = newGridSize * newGridSize;

    const newMinesCount =
      minesCount !== undefined
        ? Number(minesCount)
        : game.minesCount;

    if (newMinesCount >= newTotalCells) {
      return res.status(400).json({
        success: false,
        message: "Mines count must be less than total cells",
      });
    }

    const newMinBet =
      minBet !== undefined
        ? Number(minBet)
        : game.minBet;

    const newMaxBet =
      maxBet !== undefined
        ? Number(maxBet)
        : game.maxBet;

    if (newMinBet > newMaxBet) {
      return res.status(400).json({
        success: false,
        message: "Minimum bet cannot be greater than maximum bet",
      });
    }

    game.name = name ?? game.name;
    game.gridSize = newGridSize;
    game.totalCells = newTotalCells;
    game.minesCount = newMinesCount;

    if (betAmount !== undefined) {
      game.betAmount = Number(betAmount);
    }

    game.minBet = newMinBet;
    game.maxBet = newMaxBet;

    if (multiplier !== undefined) {
      game.multiplier = Number(multiplier);
    }

    if (isActive !== undefined) {
      game.isActive = Boolean(isActive);
    }

    if (description !== undefined) {
      game.description = description;
    }

    await game.save();

    return res.status(200).json({
      success: true,
      message: "Mine game updated successfully",
      game,
    });
  } catch (error) {
    console.error("updateMineGame error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update mine game",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE MINE GAME - ADMIN
// ============================================================

const deleteMineGame = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mine game ID",
      });
    }

    const game = await MineGame.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Mine game not found",
      });
    }

    await game.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Mine game deleted successfully",
    });
  } catch (error) {
    console.error("deleteMineGame error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete mine game",
      error: error.message,
    });
  }
};

// ============================================================
// TOGGLE ACTIVE STATUS - ADMIN
// ============================================================

const toggleMineGame = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mine game ID",
      });
    }

    const game = await MineGame.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Mine game not found",
      });
    }

    game.isActive = !game.isActive;

    await game.save();

    return res.status(200).json({
      success: true,
      message: `Mine game ${
        game.isActive ? "activated" : "deactivated"
      } successfully`,
      game,
    });
  } catch (error) {
    console.error("toggleMineGame error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to toggle mine game",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getAllMineGames,
  getActiveMineGames,
  getMineGameById,
  createMineGame,
  updateMineGame,
  deleteMineGame,
  toggleMineGame,
};