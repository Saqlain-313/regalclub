const express = require("express");

const {
  createTicketType,
  getTicketTypes,
  getTicketType,
  updateTicketType,
  deleteTicketType,
} = require("../../controllers/admin/ticketTypeController");

const {
  protect,
  adminProtect,
} = require("../../middleware/authMiddleware");

const router = express.Router();

// Admin Authentication Middleware
router.use(protect, adminProtect);

// Routes
router.post("/", createTicketType);
router.get("/", getTicketTypes);
router.get("/:id", getTicketType);
router.put("/:id", updateTicketType);
router.delete("/:id", deleteTicketType);

module.exports = router;