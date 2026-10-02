const PlatformGame = require("../models/PlatformGame");

// ============================================================
// DEFAULT SEED — current home games (pehli baar auto-seed hote
// hain, fir admin panel se manage hote hain)
// ============================================================

const DEFAULT_GAMES = [
  {
    game_name: "Chicken Road",
    game_uid: "2126c5c458316ba1f2df65b387b60408",
    category: "chicken",
    game_type: "Instant",
    provider: "inout",
    icon: "https://img.huidu123.com/huidu/images/2025-12-15/20251215135317.png",
    rating: 4.5,
    players: "1.8K",
    volatility: "Low",
    isTop6: false,
    isNew: true,
    sortOrder: 1,
  },
  {
    game_name: "Mines",
    game_uid: "5c4a12fb0a9b296d9b0d5f9e1cd41d65",
    category: "mines",
    game_type: "Casino Table",
    provider: "Spribe",
    icon: "https://img.huidu123.com/huidu/images/2024-05-27/20240527113743.png",
    rating: 4.7,
    players: "3.9K",
    volatility: "High",
    isTop6: true,
    sortOrder: 2,
  },
  {
    game_name: "Mines",
    game_uid: "72ce7e04ce95ee94eef172c0dfd6dc17",
    category: "mines",
    game_type: "Crash Game",
    provider: "JILI",
    icon: "https://img.huidu123.com/huidu/images/2024-03-06/20240306151805.png",
    rating: 4.5,
    players: "2.1K",
    volatility: "Medium",
    isTop6: true,
    sortOrder: 3,
  },
  {
    game_name: "Aviator",
    game_uid: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
    category: "aviator",
    game_type: "Casino Table",
    provider: "SPB",
    icon: "https://img.huidu123.com/huidu/images/2024-05-27/20240527120200.png",
    rating: 4.9,
    players: "5.6K",
    volatility: "High",
    isTop6: true,
    sortOrder: 4,
  },
  {
    game_name: "7Updown",
    game_uid: "3aca3084a5c1a8c77c52d6147ee3d2ab",
    category: "instant",
    game_type: "Instant",
    provider: "jili",
    icon: "https://img.huidu123.com/huidu/images/2024-03-06/20240306153756.png@compress",
    rating: 4.6,
    players: "1.2K",
    volatility: "Low",
    isTop6: true,
    sortOrder: 5,
  },
  {
    game_name: "Pappu Game",
    game_uid: "e5091890bbb65a5f9ceb657351fa73c1",
    category: "table",
    game_type: "Table",
    provider: "JILIGaming",
    icon: "https://img.huidu123.com/huidu/images/2024-03-15/20240315154251.png",
    rating: 4.8,
    players: "2.1K",
    volatility: "Medium",
    isTop6: true,
    sortOrder: 6,
  },
];

const seedIfEmpty = async () => {
  const count = await PlatformGame.countDocuments();
  if (count > 0) return;
  await PlatformGame.insertMany(DEFAULT_GAMES);
  console.log(
    `[PLATFORM-GAMES] Seeded ${DEFAULT_GAMES.length} default games`,
  );
};

// ============================================================
// PUBLIC — active games (top6 first, fir baaki)
// @route GET /api/platform-games
// ============================================================
exports.getPlatformGames = async (req, res) => {
  try {
    await seedIfEmpty();

    const games = await PlatformGame.find({ isActive: true })
      .sort({ isTop6: -1, sortOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      games,
      top6: games.filter((g) => g.isTop6),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load platform games",
    });
  }
};

// ============================================================
// ADMIN — saari games (inactive bhi)
// @route GET /api/platform-games/admin/all
// ============================================================
exports.adminGetAllGames = async (req, res) => {
  try {
    await seedIfEmpty();

    const games = await PlatformGame.find({})
      .sort({ isTop6: -1, sortOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, games });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load games",
    });
  }
};

// ============================================================
// ADMIN — new game add karo (default: "All" me dikhega,
// isTop6 manually on karna hoga)
// @route POST /api/platform-games/admin
// ============================================================
exports.adminCreateGame = async (req, res) => {
  try {
    const {
      game_name,
      game_uid,
      icon,
      category,
      game_type,
      provider,
      rating,
      players,
      volatility,
      isTop6,
      isNew,
      isActive,
      sortOrder,
    } = req.body;

    if (!game_name || !game_uid) {
      return res.status(400).json({
        success: false,
        message: "game_name and game_uid are required",
      });
    }

    const existing = await PlatformGame.findOne({ game_uid: String(game_uid).trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A game with this game_uid already exists",
      });
    }

    const game = await PlatformGame.create({
      game_name: String(game_name).trim(),
      game_uid: String(game_uid).trim(),
      icon: icon || "",
      category: (category || "instant").toLowerCase(),
      game_type: game_type || "Instant",
      provider: provider || "",
      rating: Number(rating) || 4.5,
      players: players || "",
      volatility: ["Low", "Medium", "High"].includes(volatility)
        ? volatility
        : "Medium",
      isTop6: Boolean(isTop6),
      isNew: Boolean(isNew),
      isActive: isActive === undefined ? true : Boolean(isActive),
      sortOrder: Number(sortOrder) || 100,
    });

    return res.status(201).json({
      success: true,
      message: "Game added successfully",
      game,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add game",
    });
  }
};

// ============================================================
// ADMIN — game update
// @route PUT /api/platform-games/admin/:id
// ============================================================
exports.adminUpdateGame = async (req, res) => {
  try {
    const game = await PlatformGame.findById(req.params.id);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }

    const allowed = [
      "game_name",
      "game_uid",
      "icon",
      "category",
      "game_type",
      "provider",
      "rating",
      "players",
      "volatility",
      "isTop6",
      "isNew",
      "isActive",
      "sortOrder",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        game[field] = req.body[field];
      }
    });

    await game.save();

    return res.status(200).json({
      success: true,
      message: "Game updated successfully",
      game,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update game",
    });
  }
};

// ============================================================
// ADMIN — game delete
// @route DELETE /api/platform-games/admin/:id
// ============================================================
exports.adminDeleteGame = async (req, res) => {
  try {
    const game = await PlatformGame.findByIdAndDelete(req.params.id);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete game",
    });
  }
};
