const TicketType = require("../../models/TicketType");

// Create
const createTicketType = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      order,
      gameTypes = [],
    } = req.body;

    const exists = await TicketType.findOne({ title });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Ticket Type already exists",
      });
    }

    const ticketType = await TicketType.create({
      title,
      subTitle,
      order,
      gameTypes,
    });

    res.status(201).json({
      success: true,
      message: "Ticket Type created successfully",
      ticketType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All
const getTicketTypes = async (req, res) => {
  try {
    const ticketTypes = await TicketType.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      ticketTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single
const getTicketType = async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id);

    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: "Ticket Type not found",
      });
    }

    res.status(200).json({
      success: true,
      ticketType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update
const updateTicketType = async (req, res) => {
  try {
    const { title, subTitle, order, isActive } = req.body;

    let { gameTypes = [] } = req.body;

    // Agar object aaye to array bana do
    if (!Array.isArray(gameTypes)) {
      gameTypes = [gameTypes];
    }

    // Null ya invalid values hata do
    gameTypes = gameTypes
      .filter(Boolean)
      .map((item) => ({
        title: item.title || "",
        description: item.description || "",
        order: Number(item.order) || 0,
        isActive:
          item.isActive === undefined ? true : item.isActive,
      }));

    const ticketType = await TicketType.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subTitle,
        order: Number(order) || 0,
        isActive,
        gameTypes,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: "Ticket Type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      ticketType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete
const deleteTicketType = async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id);

    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: "Ticket Type not found",
      });
    }

    await ticketType.deleteOne();

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTicketType,
  getTicketTypes,
  getTicketType,
  updateTicketType,
  deleteTicketType,
};