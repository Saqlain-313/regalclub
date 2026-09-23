const WinMultiplier = require("../models/WinMultiplier");

// ======================================================
// GET WIN MULTIPLIERS
// ======================================================
const getWinMultipliers = async (req, res) => {
  try {
    let settings = await WinMultiplier.findOne();

    // Create default document if not exists
    if (!settings) {
      settings = await WinMultiplier.create({
        multipliers: {
          // 2-Digit Games
          single: {
            name: "Single",
            value: 9,
          },
          jodi: {
            name: "Jodi",
            value: 90,
          },
          "last-digit": {
            name: "Last Digit",
            value: 9,
          },
          "first-digit": {
            name: "First Digit",
            value: 9,
          },

          // 3-Digit Games
          panna: {
            name: "Panna",
            value: 90,
          },
          "single-Patti": {
            name: "Single Patti",
            value: 90,
          },
          "double-Patti": {
            name: "Double Patti",
            value: 90,
          },
          "triple-Patti": {
            name: "Triple Patti",
            value: 90,
          },
          "half-sangam": {
            name: "Half Sangam",
            value: 450,
          },
          "full-sangam": {
            name: "Full Sangam",
            value: 900,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Win multipliers fetched successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Get Win Multipliers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch win multipliers",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE WIN MULTIPLIERS
// ======================================================
const updateWinMultipliers = async (req, res) => {
  try {
    const { multipliers } = req.body;

    if (!multipliers || typeof multipliers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Multipliers object is required",
      });
    }

    let settings = await WinMultiplier.findOne();

    if (!settings) {
      settings = new WinMultiplier({
        multipliers,
      });
    } else {
      settings.multipliers = multipliers;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Win multipliers updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update Win Multipliers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update win multipliers",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE SINGLE MULTIPLIER
// ======================================================
const updateSingleMultiplier = async (req, res) => {
  try {
    const { gameType } = req.params;
    const { name, value } = req.body;

    if (!gameType) {
      return res.status(400).json({
        success: false,
        message: "Game type is required",
      });
    }

    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: "Multiplier value is required",
      });
    }

    if (Number(value) < 0) {
      return res.status(400).json({
        success: false,
        message: "Multiplier value cannot be negative",
      });
    }

    let settings = await WinMultiplier.findOne();

    if (!settings) {
      settings = new WinMultiplier();
    }

    settings.multipliers.set(gameType, {
      name: name || gameType,
      value: Number(value),
    });

    await settings.save();

    res.status(200).json({
      success: true,
      message: `${gameType} multiplier updated successfully`,
      data: settings,
    });
  } catch (error) {
    console.error("Update Single Multiplier Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update multiplier",
      error: error.message,
    });
  }
};

// ======================================================
// GET MULTIPLIER BY GAME TYPE
// ======================================================
const getMultiplierByGameType = async (req, res) => {
  try {
    const { gameType } = req.params;

    if (!gameType) {
      return res.status(400).json({
        success: false,
        message: "Game type is required",
      });
    }

    const settings = await WinMultiplier.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Win multipliers not found",
      });
    }

    const multiplier = settings.multipliers.get(gameType);

    if (!multiplier) {
      return res.status(404).json({
        success: false,
        message: `Multiplier for '${gameType}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Multiplier fetched successfully",
      data: {
        gameType,
        multiplier,
      },
    });
  } catch (error) {
    console.error("Get Multiplier By Game Type Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch multiplier",
      error: error.message,
    });
  }
};

// ======================================================
// BULK UPDATE MULTIPLIERS
// ======================================================
const bulkUpdateMultipliers = async (req, res) => {
  try {
    const { multipliers } = req.body;

    if (!multipliers || typeof multipliers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Multipliers object is required",
      });
    }

    // Validate all values
    const validGameTypes = [
      "single",
      "jodi",
      "panna",
      "single-Patti",
      "double-Patti",
      "triple-Patti",
      "half-sangam",
      "full-sangam",
      "last-digit",
      "first-digit",
    ];

    const errors = [];

    for (const [key, value] of Object.entries(multipliers)) {
      if (!validGameTypes.includes(key)) {
        errors.push(`Invalid game type: ${key}`);
      }
      if (!value || typeof value !== "object") {
        errors.push(`Invalid multiplier data for: ${key}`);
      }
      if (value.value !== undefined && Number(value.value) < 0) {
        errors.push(`Multiplier value for ${key} cannot be negative`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
        validGameTypes,
      });
    }

    let settings = await WinMultiplier.findOne();

    if (!settings) {
      settings = new WinMultiplier();
    }

    // Update each multiplier
    for (const [key, value] of Object.entries(multipliers)) {
      settings.multipliers.set(key, {
        name: value.name || key,
        value: Number(value.value),
      });
    }

    await settings.save();

    // Return the updated multipliers
    const updatedMultipliers = {};
    for (const [key, value] of settings.multipliers) {
      updatedMultipliers[key] = value;
    }

    res.status(200).json({
      success: true,
      message: "Multipliers updated successfully",
      data: {
        multipliers: updatedMultipliers,
      },
    });
  } catch (error) {
    console.error("Bulk Update Multipliers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update multipliers",
      error: error.message,
    });
  }
};

// ======================================================
// RESET MULTIPLIERS TO DEFAULT
// ======================================================
const resetMultipliers = async (req, res) => {
  try {
    const defaultMultipliers = {
      // 2-Digit Games
      single: {
        name: "Single",
        value: 9,
      },
      jodi: {
        name: "Jodi",
        value: 90,
      },
      "last-digit": {
        name: "Last Digit",
        value: 9,
      },
      "first-digit": {
        name: "First Digit",
        value: 9,
      },
      // 3-Digit Games
      panna: {
        name: "Panna",
        value: 90,
      },
      "single-Patti": {
        name: "Single Patti",
        value: 90,
      },
      "double-Patti": {
        name: "Double Patti",
        value: 90,
      },
      "triple-Patti": {
        name: "Triple Patti",
        value: 90,
      },
      "half-sangam": {
        name: "Half Sangam",
        value: 450,
      },
      "full-sangam": {
        name: "Full Sangam",
        value: 900,
      },
    };

    let settings = await WinMultiplier.findOne();

    if (!settings) {
      settings = new WinMultiplier({
        multipliers: defaultMultipliers,
      });
    } else {
      settings.multipliers = defaultMultipliers;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Multipliers reset to default values successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Reset Multipliers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reset multipliers",
      error: error.message,
    });
  }
};

module.exports = {
  getWinMultipliers,
  updateWinMultipliers,
  updateSingleMultiplier,
  getMultiplierByGameType,
  bulkUpdateMultipliers,
  resetMultipliers,
};