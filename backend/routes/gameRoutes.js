const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const {
  getGameDetails,
  getAllGames,
  getGamesByGameType,
  getProviderList,
  getGameTypeList,
} = require("../controllers/gameController");

const router = express.Router();

router.get("/game/docs/details", protect, getGameDetails);
router.get("/game/docs/all", protect, getAllGames);
router.get("/game/docs/gameType", protect, getGamesByGameType);
router.get("/game/docs/providers", protect, getProviderList);
router.get("/game/docs/types", protect, getGameTypeList);

module.exports = router;
