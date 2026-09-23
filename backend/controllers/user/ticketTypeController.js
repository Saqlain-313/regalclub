const TicketType = require("../../models/TicketType");

// Get All Active Ticket Types (User)
const getUserTicketTypes = async (req, res) => {
  try {
    const ticketTypes = await TicketType.find({
      isActive: true,
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Sirf active gameTypes return karo
    const data = ticketTypes.map((ticket) => ({
      ...ticket,
      gameTypes: ticket.gameTypes
        .filter((game) => game.isActive)
        .sort((a, b) => a.order - b.order),
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get User Ticket Types Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket types",
      error: error.message,
    });
  }
};

module.exports = {
  getUserTicketTypes,
};