// controllers/admin/gameEntryController.js


const { getCountryContext } = require("../../config/countryConfig");
const User = require("../../models/authmodel");
const TicketType = require("../../models/TicketType");
const mongoose = require("mongoose");

/**
 * Get all game entries with filters
 * GET /api/admin/india/game-entries
 */
exports.getGameEntries = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const {
      page = 1,
      limit = 10,
      status,
      user,
      userName,
      ticketType,
      gameType,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter
    if (status) {
      filter.status = status;
    }

    // User ID filter - search in players array
    if (user) {
      filter["players.user"] = user;
    }

    // User name search - find users by name first
    if (userName) {
      const users = await User.find({
        $or: [
          { name: { $regex: userName, $options: "i" } },
          { email: { $regex: userName, $options: "i" } }
        ]
      }).select("_id");
      
      const userIds = users.map(u => u._id);
      
      if (userIds.length > 0) {
        filter["players.user"] = { $in: userIds };
      } else {
        // No users found with this name, return empty result
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalEntries: 0,
            entriesPerPage: parseInt(limit),
          },
          stats: {
            totalRevenue: 0,
            averagePrice: 0,
            totalEntries: 0,
            open: 0,
            closed: 0,
            completed: 0,
          },
        });
      }
    }

    // Ticket type filter
    if (ticketType) {
      filter.ticketType = ticketType;
    }

    // Game type filter
    if (gameType) {
      filter.gameType = gameType;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Price range filter - using totalAmount
    if (minPrice || maxPrice) {
      filter.totalAmount = {};
      if (minPrice) {
        filter.totalAmount.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.totalAmount.$lte = parseFloat(maxPrice);
      }
    }

    // Search filter (search in game numbers)
    if (search) {
      filter["players.games.numbers"] = { 
        $in: [parseInt(search) || 0] 
      };
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const gamePools = await GamePool.find(filter)
      .populate({
        path: "ticketType",
        select: "name price description",
      })
      .populate({
        path: "gameCount",
        select: "totalGames price",
      })
      .populate({
        path: "players.user",
        select: "name email phoneNumber profileImage",
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalEntries = await GamePool.countDocuments(filter);

    // Calculate statistics
    const stats = await GamePool.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averagePrice: { $avg: "$totalAmount" },
          totalEntries: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] },
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
        },
      },
    ]);

    // Format response with user names and player details
    const formattedData = gamePools.map(pool => ({
      poolId: pool._id,
      ticketType: pool.ticketType,
      gameCount: pool.gameCount,
      gameType: pool.gameType,
      drawNo: pool.drawNo,
      status: pool.status,
      totalPlayers: pool.totalPlayers,
      totalAmount: pool.totalAmount,
      winningNumbers: pool.winningNumbers,
      resultDeclared: pool.resultDeclared,
      players: pool.players.map(player => ({
        userId: player.user?._id || player.user,
        userName: player.user?.name || "Unknown User",
        userEmail: player.user?.email || "Unknown Email",
        userPhone: player.user?.phoneNumber || null,
        games: player.games,
        bidAmount: player.bidAmount,
        currencyDetails: player.currencyDetails,
        result: player.result,
        status: player.status,
      })),
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEntries / parseInt(limit)),
        totalEntries,
        entriesPerPage: parseInt(limit),
      },
      stats: stats[0] || {
        totalRevenue: 0,
        averagePrice: 0,
        totalEntries: 0,
        open: 0,
        closed: 0,
        completed: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching game entries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching game entries",
      error: error.message,
    });
  }
};

/**
 * Get single game entry by ID for admin
 * GET /api/admin/india/game-entries/:id
 */
exports.getGameEntryById = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { id } = req.params;

    const gamePool = await GamePool.findById(id)
      .populate({
        path: "ticketType",
        select: "name price description",
      })
      .populate({
        path: "gameCount",
        select: "totalGames price",
      })
      .populate({
        path: "players.user",
        select: "name email phoneNumber profileImage",
      })
      .lean();

    if (!gamePool) {
      return res.status(404).json({
        success: false,
        message: "Game pool not found",
      });
    }

    // Format response with user details
    const formattedData = {
      poolId: gamePool._id,
      ticketType: gamePool.ticketType,
      gameCount: gamePool.gameCount,
      gameType: gamePool.gameType,
      drawNo: gamePool.drawNo,
      status: gamePool.status,
      totalPlayers: gamePool.totalPlayers,
      totalAmount: gamePool.totalAmount,
      winningNumbers: gamePool.winningNumbers,
      resultDeclared: gamePool.resultDeclared,
      players: gamePool.players.map(player => ({
        userId: player.user?._id || player.user,
        userName: player.user?.name || "Unknown User",
        userEmail: player.user?.email || "Unknown Email",
        userPhone: player.user?.phoneNumber || null,
        games: player.games,
        bidAmount: player.bidAmount,
        currencyDetails: player.currencyDetails,
        result: player.result,
        status: player.status,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      })),
      createdAt: gamePool.createdAt,
      updatedAt: gamePool.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching game entry:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid game entry ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching game entry",
      error: error.message,
    });
  }
};

/**
 * Get game entries by user ID for admin
 * GET /api/admin/india/game-entries/user/:userId
 */
exports.getGameEntriesByUser = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const filter = { "players.user": userId };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gamePools = await GamePool.find(filter)
      .populate({
        path: "ticketType",
        select: "name price description",
      })
      .populate({
        path: "gameCount",
        select: "totalGames price",
      })
      .populate({
        path: "players.user",
        select: "name email phoneNumber profileImage",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalEntries = await GamePool.countDocuments(filter);

    // Format response with user name
    const formattedData = gamePools.map(pool => ({
      poolId: pool._id,
      ticketType: pool.ticketType,
      gameCount: pool.gameCount,
      gameType: pool.gameType,
      drawNo: pool.drawNo,
      status: pool.status,
      totalPlayers: pool.totalPlayers,
      totalAmount: pool.totalAmount,
      winningNumbers: pool.winningNumbers,
      resultDeclared: pool.resultDeclared,
      playerData: pool.players.find(p => p.user?._id?.toString() === userId || p.user?.toString() === userId),
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEntries / parseInt(limit)),
        totalEntries,
        entriesPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user game entries:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching user game entries",
      error: error.message,
    });
  }
};

/**
 * Get game entries by status for admin
 * GET /api/admin/india/game-entries/status/:status
 */
exports.getGameEntriesByStatus = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate status
    const validStatuses = ["Open", "Closed", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid statuses: " + validStatuses.join(", "),
      });
    }

    const filter = { status };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gamePools = await GamePool.find(filter)
      .populate({
        path: "ticketType",
        select: "name price description",
      })
      .populate({
        path: "gameCount",
        select: "totalGames price",
      })
      .populate({
        path: "players.user",
        select: "name email phoneNumber profileImage",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalEntries = await GamePool.countDocuments(filter);

    // Format response with user names
    const formattedData = gamePools.map(pool => ({
      poolId: pool._id,
      ticketType: pool.ticketType,
      gameCount: pool.gameCount,
      gameType: pool.gameType,
      drawNo: pool.drawNo,
      status: pool.status,
      totalPlayers: pool.totalPlayers,
      totalAmount: pool.totalAmount,
      winningNumbers: pool.winningNumbers,
      resultDeclared: pool.resultDeclared,
      players: pool.players.map(player => ({
        userId: player.user?._id || player.user,
        userName: player.user?.name || "Unknown User",
        userEmail: player.user?.email || "Unknown Email",
        games: player.games,
        bidAmount: player.bidAmount,
        result: player.result,
        status: player.status,
      })),
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEntries / parseInt(limit)),
        totalEntries,
        entriesPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching game entries by status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching game entries by status",
      error: error.message,
    });
  }
};

/**
 * Search game entries by user name or email
 * GET /api/admin/india/game-entries/search
 */
exports.searchGameEntriesByUser = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { 
      query, 
      page = 1, 
      limit = 10,
      status 
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Find users matching the search query
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("_id name email");

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No users found matching the search",
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalEntries: 0,
          entriesPerPage: parseInt(limit),
        },
      });
    }

    const userIds = users.map(u => u._id);
    
    // Build filter
    const filter = { "players.user": { $in: userIds } };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gamePools = await GamePool.find(filter)
      .populate({
        path: "ticketType",
        select: "name price description",
      })
      .populate({
        path: "gameCount",
        select: "totalGames price",
      })
      .populate({
        path: "players.user",
        select: "name email phoneNumber profileImage",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalEntries = await GamePool.countDocuments(filter);

    // Create a map of user info for quick lookup
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = { name: u.name, email: u.email };
    });

    // Format response with user names
    const formattedData = gamePools.map(pool => ({
      poolId: pool._id,
      ticketType: pool.ticketType,
      gameCount: pool.gameCount,
      gameType: pool.gameType,
      drawNo: pool.drawNo,
      status: pool.status,
      totalPlayers: pool.totalPlayers,
      totalAmount: pool.totalAmount,
      winningNumbers: pool.winningNumbers,
      resultDeclared: pool.resultDeclared,
      players: pool.players.map(player => {
        const userId = player.user?._id?.toString() || player.user?.toString();
        return {
          userId: userId,
          userName: userMap[userId]?.name || player.user?.name || "Unknown User",
          userEmail: userMap[userId]?.email || player.user?.email || "Unknown Email",
          games: player.games,
          bidAmount: player.bidAmount,
          result: player.result,
          status: player.status,
        };
      }),
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEntries / parseInt(limit)),
        totalEntries,
        entriesPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error searching game entries:", error);
    res.status(500).json({
      success: false,
      message: "Error searching game entries",
      error: error.message,
    });
  }
};

/**
 * Get game entries with user details for admin dashboard
 * GET /api/admin/india/game-entries/dashboard
 */
exports.getDashboardGameEntries = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { 
      limit = 10,
      status 
    } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const gamePools = await GamePool.find(filter)
      .populate({
        path: "ticketType",
        select: "name price",
      })
      .populate({
        path: "gameCount",
        select: "totalGames price",
      })
      .populate({
        path: "players.user",
        select: "name email phoneNumber profileImage",
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Format response with user names
    const formattedData = gamePools.map(pool => ({
      id: pool._id,
      ticketType: pool.ticketType?.name || "Unknown",
      gameCount: pool.gameCount?.totalGames || 0,
      gameType: pool.gameType,
      status: pool.status,
      totalPlayers: pool.totalPlayers,
      totalAmount: pool.totalAmount,
      drawNo: pool.drawNo,
      resultDeclared: pool.resultDeclared,
      players: pool.players.map(player => ({
        userName: player.user?.name || "Unknown User",
        userEmail: player.user?.email || "Unknown Email",
        userPhone: player.user?.phoneNumber || null,
        games: player.games?.length || 0,
        bidAmount: player.bidAmount,
        status: player.status,
      })),
      createdAt: pool.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching dashboard game entries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard game entries",
      error: error.message,
    });
  }
};

/**
 * Get game entries statistics
 * GET /api/admin/india/game-entries/statistics
 */
exports.getGameEntryStatistics = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { startDate, endDate } = req.query;

    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) {
        matchFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Get statistics by status
    const statusStats = await GamePool.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get statistics by ticket type
    const ticketTypeStats = await GamePool.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "tickettypes",
          localField: "ticketType",
          foreignField: "_id",
          as: "ticketTypeInfo",
        },
      },
      { $unwind: "$ticketTypeInfo" },
      {
        $group: {
          _id: "$ticketTypeInfo.name",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get top users by entries count
    const topUsers = await GamePool.aggregate([
      { $match: matchFilter },
      { $unwind: "$players" },
      {
        $group: {
          _id: "$players.user",
          entryCount: { $sum: 1 },
          totalSpent: { $sum: "$players.bidAmount" },
        },
      },
      { $sort: { entryCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          userName: "$userInfo.name",
          userEmail: "$userInfo.email",
          entryCount: 1,
          totalSpent: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        ticketTypeStats,
        topUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching game entry statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching game entry statistics",
      error: error.message,
    });
  }
};

/**
 * Update game entry status
 * PUT /api/admin/india/game-entries/:id/status
 */
exports.updateGameEntryStatus = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Open", "Closed", "Completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid statuses: " + validStatuses.join(", "),
      });
    }

    const gamePool = await GamePool.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate({
        path: "ticketType",
        select: "name price",
      })
      .populate({
        path: "gameCount",
        select: "totalGames price",
      });

    if (!gamePool) {
      return res.status(404).json({
        success: false,
        message: "Game pool not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Game pool status updated successfully",
      data: gamePool,
    });
  } catch (error) {
    console.error("Error updating game pool status:", error);
    
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid game pool ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating game pool status",
      error: error.message,
    });
  }
};

/**
 * Delete game entry
 * DELETE /api/admin/india/game-entries/:id
 */
exports.deleteGameEntry = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { id } = req.params;

    const gamePool = await GamePool.findByIdAndDelete(id);

    if (!gamePool) {
      return res.status(404).json({
        success: false,
        message: "Game pool not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Game pool deleted successfully",
      data: {
        id: gamePool._id,
        status: gamePool.status,
        totalPlayers: gamePool.totalPlayers,
        totalAmount: gamePool.totalAmount,
      },
    });
  } catch (error) {
    console.error("Error deleting game pool:", error);
    
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid game pool ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting game pool",
      error: error.message,
    });
  }
};

/**
 * Bulk update game entry statuses
 * PUT /api/admin/india/game-entries/bulk/status
 */
exports.bulkUpdateGameEntryStatus = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of game pool IDs",
      });
    }

    // Validate status
    const validStatuses = ["Open", "Closed", "Completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid statuses: " + validStatuses.join(", "),
      });
    }

    const result = await GamePool.updateMany(
      { _id: { $in: ids } },
      { status }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} game pools updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
    });
  } catch (error) {
    console.error("Error bulk updating game pools:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk updating game pools",
      error: error.message,
    });
  }
};

/**
 * Get game entries summary for dashboard
 * GET /api/admin/india/game-entries/summary
 */
exports.getGameEntrySummary = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    // Get total counts
    const totalCounts = await GamePool.aggregate([
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalPlayers: { $sum: "$totalPlayers" },
          open: { $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
        },
      },
    ]);

    // Get today's counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCounts = await GamePool.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          todayEntries: { $sum: 1 },
          todayRevenue: { $sum: "$totalAmount" },
          todayPlayers: { $sum: "$totalPlayers" },
        },
      },
    ]);

    // Get this week's counts
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekCounts = await GamePool.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: null,
          weekEntries: { $sum: 1 },
          weekRevenue: { $sum: "$totalAmount" },
          weekPlayers: { $sum: "$totalPlayers" },
        },
      },
    ]);

    // Get this month's counts
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthCounts = await GamePool.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          monthEntries: { $sum: 1 },
          monthRevenue: { $sum: "$totalAmount" },
          monthPlayers: { $sum: "$totalPlayers" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCounts[0] || {
          totalEntries: 0,
          totalRevenue: 0,
          totalPlayers: 0,
          open: 0,
          closed: 0,
          completed: 0,
        },
        today: todayCounts[0] || { todayEntries: 0, todayRevenue: 0, todayPlayers: 0 },
        week: weekCounts[0] || { weekEntries: 0, weekRevenue: 0, weekPlayers: 0 },
        month: monthCounts[0] || { monthEntries: 0, monthRevenue: 0, monthPlayers: 0 },
      },
    });
  } catch (error) {
    console.error("Error fetching game entry summary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching game entry summary",
      error: error.message,
    });
  }
};

/**
 * Get player's specific game details from a pool
 * GET /api/admin/india/game-entries/:poolId/player/:userId
 */
exports.getPlayerGameDetails = async (req, res) => {
  try {
    const { GamePool, GameCount } = getCountryContext(req);
    const { poolId, userId } = req.params;

    const gamePool = await GamePool.findOne({
      _id: poolId,
      "players.user": userId
    })
      .populate({
        path: "ticketType",
        select: "name price description",
      })
      .populate({
        path: "gameCount",
        select: "totalGames price",
      })
      .populate({
        path: "players.user",
        select: "name email phoneNumber profileImage",
      })
      .lean();

    if (!gamePool) {
      return res.status(404).json({
        success: false,
        message: "Pool not found or user not in this pool",
      });
    }

    const player = gamePool.players.find(
      p => p.user?._id?.toString() === userId || p.user?.toString() === userId
    );

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found in this pool",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        poolId: gamePool._id,
        ticketType: gamePool.ticketType,
        gameCount: gamePool.gameCount,
        gameType: gamePool.gameType,
        drawNo: gamePool.drawNo,
        poolStatus: gamePool.status,
        resultDeclared: gamePool.resultDeclared,
        winningNumbers: gamePool.winningNumbers,
        player: {
          userId: player.user?._id || userId,
          userName: player.user?.name || "Unknown User",
          userEmail: player.user?.email || "Unknown Email",
          games: player.games,
          bidAmount: player.bidAmount,
          currencyDetails: player.currencyDetails,
          result: player.result,
          status: player.status,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching player game details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching player game details",
      error: error.message,
    });
  }
};