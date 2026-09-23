const express = require("express");

const router = express.Router({ mergeParams: true });

const {
    protect,
    adminProtect,
} = require("../../middleware/authMiddleware");

const controller = require("../../controllers/admin/powerballResultController");

router.use(protect, adminProtect);

router.post("/create", controller.createPowerballResult);

router.get("/", controller.getAllPowerballResults);

router.get(
    "/pending-games/all",
    controller.getAllPendingGames
);

router.get(
    "/pending-game/:playerId",
    controller.getPendingGameByPlayerId
);

router.get(
    "/game-pool/:poolId",
    controller.getGamePoolDetails
);

router.get(
    "/pool/:gamePoolId",
    controller.getResultsByGamePool
);

router.get(
    "/user/:userId/history",
    controller.getUserWinningHistory
);

router.get(
    "/user/:userId/credit",
    controller.getUsercredit
);

// IMPORTANT:
// Keep this before "/:id"
router.get(
    "/unselected-numbers",
    controller.getUnselectedPowerballNumbers
);

router.get(
    "/:id",
    controller.getPowerballResultById
);

router.delete(
    "/:id",
    controller.deletePowerballResult
);

module.exports = router;