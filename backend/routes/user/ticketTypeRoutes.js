const express = require("express");
const router = express.Router();

const {
  getUserTicketTypes,
} = require("../../controllers/user/ticketTypeController");

router.get("/", getUserTicketTypes);

module.exports = router;