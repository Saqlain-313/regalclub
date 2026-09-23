const { getCountryContext } = require("../../config/countryConfig");

// ================================
// CREATE GAME COUNT
// ================================
const createGameCount = async (req, res) => {
  try {
    const { GameCount } = getCountryContext(req);
    const {
      ticketType,
      gameType,
      totalGames,
      price,
      label,
      isActive,
    } = req.body;

    // Validate required fields
    if (!ticketType || !totalGames || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "ticketType, totalGames, and price are required fields",
      });
    }

    // Check duplicate
    const exists = await GameCount.findOne({
      ticketType,
      gameType: gameType || null,
      totalGames,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Game Count already exists for this ticket type, game type, and total games",
      });
    }

    // Create
    const data = await GameCount.create({
      ticketType,
      gameType: gameType || null,
      totalGames,
      price,
      label,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Populate ticket type
    const result = await GameCount.findById(data._id).populate(
      "ticketType"
    );

    res.status(201).json({
      success: true,
      message: "Game Count created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Create ${countryName} Game Count Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================================
// GET ALL GAME COUNTS
// ================================
const getGameCounts = async (req, res) => {
  try {
    const { GameCount } = getCountryContext(req);
    const { ticketType, gameType, isActive } = req.query;

    const filter = {};

    if (ticketType) {
      filter.ticketType = ticketType;
    }

    if (gameType) {
      filter.gameType = gameType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const data = await GameCount.find(filter)
      .populate("ticketType")
      .sort({
        ticketType: 1,
        totalGames: 1,
      });

    const transformedData = data.map((item) => {
      const itemObj = item.toObject();
      const ticketTypeData = itemObj.ticketType;

      if (
        ticketTypeData &&
        Array.isArray(ticketTypeData.gameTypes) &&
        itemObj.gameType
      ) {
        const specificGameType = ticketTypeData.gameTypes.find(
          (gt) => gt._id.toString() === itemObj.gameType.toString()
        );

        itemObj.gameTypeDetails = specificGameType || null;
      } else {
        itemObj.gameTypeDetails = null;
      }

      return itemObj;
    });

    res.json({
      success: true,
      count: transformedData.length,
      data: transformedData,
    });
  } catch (err) {
    console.error("Get ${countryName} Game Counts Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================================
// GET SINGLE GAME COUNT
// ================================
const getGameCount = async (req, res) => {
  try {
    const { GameCount } = getCountryContext(req);
    const data = await GameCount.findById(req.params.id).populate(
      "ticketType"
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Game Count not found",
      });
    }

    const dataObj = data.toObject();
    const ticketTypeData = dataObj.ticketType;

    if (
      ticketTypeData &&
      Array.isArray(ticketTypeData.gameTypes) &&
      dataObj.gameType
    ) {
      const specificGameType = ticketTypeData.gameTypes.find(
        (gt) => gt._id.toString() === dataObj.gameType.toString()
      );

      dataObj.gameTypeDetails = specificGameType || null;
    } else {
      dataObj.gameTypeDetails = null;
    }

    res.json({
      success: true,
      data: dataObj,
    });
  } catch (err) {
    console.error("Get ${countryName} Game Count Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================================
// UPDATE GAME COUNT
// ================================
const updateGameCount = async (req, res) => {
  try {
    const { GameCount } = getCountryContext(req);
    const {
      ticketType,
      gameType,
      totalGames,
    } = req.body;

    // Check duplicate if unique fields are being changed
    if (
      ticketType !== undefined ||
      gameType !== undefined ||
      totalGames !== undefined
    ) {
      const current = await GameCount.findById(req.params.id);

      if (!current) {
        return res.status(404).json({
          success: false,
          message: "Game Count not found",
        });
      }

      const existing = await GameCount.findOne({
        ticketType:
          ticketType !== undefined ? ticketType : current.ticketType,

        gameType:
          gameType !== undefined
            ? gameType || null
            : current.gameType || null,

        totalGames:
          totalGames !== undefined ? totalGames : current.totalGames,

        _id: {
          $ne: req.params.id,
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "Another India game count already exists with these values",
        });
      }
    }

    // Update
    const data = await GameCount.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("ticketType");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Game Count not found",
      });
    }

    const dataObj = data.toObject();
    const ticketTypeData = dataObj.ticketType;

    if (
      ticketTypeData &&
      Array.isArray(ticketTypeData.gameTypes) &&
      dataObj.gameType
    ) {
      const specificGameType = ticketTypeData.gameTypes.find(
        (gt) => gt._id.toString() === dataObj.gameType.toString()
      );

      dataObj.gameTypeDetails = specificGameType || null;
    } else {
      dataObj.gameTypeDetails = null;
    }

    res.json({
      success: true,
      message: "Game Count updated successfully",
      data: dataObj,
    });
  } catch (err) {
    console.error("Update ${countryName} Game Count Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================================
// DELETE GAME COUNT
// ================================
const deleteGameCount = async (req, res) => {
  try {
    const { GameCount } = getCountryContext(req);
    const data = await GameCount.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Game Count not found",
      });
    }

    res.json({
      success: true,
      message: "Game Count deleted successfully",
      data: {
        id: req.params.id,
        deletedItem: {
          ticketType: data.ticketType,
          gameType: data.gameType,
          totalGames: data.totalGames,
        },
      },
    });
  } catch (err) {
    console.error("Delete ${countryName} Game Count Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================================
// EXPORTS
// ================================
module.exports = {
  createGameCount,
  getGameCounts,
  getGameCount,
  updateGameCount,
  deleteGameCount,
};