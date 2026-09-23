const BettingBonus = require("../models/BettingBonus");

// ======================================================
// GET BETTING BONUS SETTINGS
// ======================================================
const getBettingBonus = async (req, res) => {
  try {
    let bonus = await BettingBonus.findOne();

    // Create default settings if not exists
    if (!bonus) {
      bonus = await BettingBonus.create({
        percentage: 1,
        isActive: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Betting bonus settings fetched successfully",
      data: bonus,
    });
  } catch (error) {
    console.error("Get Betting Bonus Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch betting bonus settings",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE BETTING BONUS SETTINGS
// ======================================================
const updateBettingBonus = async (req, res) => {
  try {
    const { percentage, isActive } = req.body;

    // Validate percentage
    if (percentage !== undefined) {
      if (
        typeof percentage !== "number" ||
        percentage < 0 ||
        percentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Percentage must be between 0 and 100",
        });
      }
    }

    let bonus = await BettingBonus.findOne();

    // Create if not exists
    if (!bonus) {
      bonus = new BettingBonus({
        percentage: percentage !== undefined ? percentage : 1,
        isActive: isActive !== undefined ? isActive : true,
      });
    } else {
      if (percentage !== undefined) {
        bonus.percentage = percentage;
      }

      if (isActive !== undefined) {
        bonus.isActive = isActive;
      }
    }

    await bonus.save();

    return res.status(200).json({
      success: true,
      message: "Betting bonus settings updated successfully",
      data: bonus,
    });
  } catch (error) {
    console.error("Update Betting Bonus Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update betting bonus settings",
      error: error.message,
    });
  }
};

module.exports = {
  getBettingBonus,
  updateBettingBonus,
};