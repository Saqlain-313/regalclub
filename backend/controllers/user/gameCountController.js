const mongoose = require("mongoose");

const {
  getCountryModels,
  normalizeCountry,
} = require("../../config/usercontryConfig");

const TicketType = require("../../models/TicketType");

// ======================================================
// GET GAME COUNTS
// ======================================================
const getGameCounts = async (req, res) => {
  try {
    // ==================================================
    // COUNTRY
    // ==================================================
    const rawCountry =
      req.params?.country ||
      req.query?.country ||
      req.body?.country;

    const country = normalizeCountry(rawCountry);

    console.log("=================================");
    console.log("GAME COUNT REQUEST");
    console.log("URL:", req.originalUrl);
    console.log("PARAMS:", req.params);
    console.log("QUERY:", req.query);
    console.log("COUNTRY:", country);
    console.log("=================================");

    // ==================================================
    // COUNTRY VALIDATION
    // ==================================================
    if (!country) {
      return res.status(400).json({
        success: false,
        count: 0,
        data: [],
        message: "Valid country is required",
      });
    }

    // ==================================================
    // COUNTRY MODEL
    // ==================================================
    const models = getCountryModels(country);

    if (!models?.gameCount) {
      return res.status(404).json({
        success: false,
        count: 0,
        data: [],
        message: `Game count model not configured for ${country}`,
      });
    }

    const GameCount = models.gameCount;

    // ==================================================
    // TICKET TYPE
    //
    // Supports:
    // ?ticketType=standard
    // ?ticketType=premium
    // ?ticketType=<ObjectId>
    //
    // Also supports:
    // ?ticketid=<ObjectId>
    // ==================================================
    const rawTicketType =
      req.query?.ticketType ??
      req.query?.ticketid ??
      req.query?.ticketId ??
      req.query?.ticket_type ??
      "";

    const ticketType = String(rawTicketType || "").trim();

    console.log("TICKET TYPE:", ticketType || "ALL");

    // ==================================================
    // BASE QUERY
    // ==================================================
    const query = {
      isActive: true,
    };

    // ==================================================
    // TICKET TYPE FILTER
    // ==================================================
    if (ticketType) {
      let ticketTypeId = null;

      // ------------------------------------------------
      // CASE 1: Already ObjectId
      // ------------------------------------------------
      if (mongoose.Types.ObjectId.isValid(ticketType)) {
        ticketTypeId = ticketType;
      }

      // ------------------------------------------------
      // CASE 2: standard / premium / title / type
      // ------------------------------------------------
      if (!ticketTypeId) {
        try {
          const escaped = ticketType.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

          const ticket = await TicketType.findOne({
            $or: [
              {
                type: {
                  $regex: `^${escaped}$`,
                  $options: "i",
                },
              },
              {
                title: {
                  $regex: `^${escaped}$`,
                  $options: "i",
                },
              },
              {
                name: {
                  $regex: `^${escaped}$`,
                  $options: "i",
                },
              },
            ],
          }).select("_id");

          if (ticket) {
            ticketTypeId = ticket._id;
          }
        } catch (ticketError) {
          console.error(
            "Ticket Type lookup error:",
            ticketError.message
          );
        }
      }

      // ------------------------------------------------
      // If user supplied ticket type but it doesn't exist
      // return empty data instead of throwing 500
      // ------------------------------------------------
      if (!ticketTypeId) {
        console.log(
          "TICKET TYPE NOT FOUND:",
          ticketType
        );

        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          ticketType,
          message: "No game counts found for this ticket type.",
        });
      }

      query.ticketType = ticketTypeId;
    }

    console.log("GAME COUNT QUERY:", query);

    // ==================================================
    // FETCH
    // ==================================================
    let gameCounts = [];

    try {
      gameCounts = await GameCount.find(query)
        .populate({
          path: "ticketType",
          select: "title subTitle gameTypes type name",
        })
        .sort({
          createdAt: 1,
        })
        .lean();
    } catch (dbError) {
      console.error(
        "GAME COUNT DB ERROR:",
        dbError
      );

      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No game counts available.",
      });
    }

    console.log(
      "GAME COUNTS FOUND:",
      gameCounts.length
    );

    // ==================================================
    // FORMAT GAME TYPE
    // ==================================================
    const formattedGameCounts = gameCounts.map(
      (item) => {
        let gameTypeDetails = null;

        // ----------------------------------------------
        // TicketType populated
        // ----------------------------------------------
        if (
          item?.ticketType &&
          Array.isArray(item.ticketType.gameTypes) &&
          item.gameType
        ) {
          gameTypeDetails =
            item.ticketType.gameTypes.find(
              (gt) =>
                String(gt?._id) ===
                String(item.gameType)
            ) || null;
        }

        return {
          ...item,

          // Always safe
          gameTypeDetails,

          // Useful frontend fields
          ticketTypeId:
            item?.ticketType?._id ||
            item?.ticketType ||
            null,

          ticketTypeName:
            item?.ticketType?.title ||
            item?.ticketType?.name ||
            item?.ticketType?.type ||
            null,
        };
      }
    );

    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(200).json({
      success: true,
      count: formattedGameCounts.length,
      data: formattedGameCounts,
      ticketType: ticketType || null,
    });
  } catch (error) {
    console.error(
      "User getGameCounts error:",
      error
    );

    // Never expose unnecessary server crash
    return res.status(500).json({
      success: false,
      count: 0,
      data: [],
      message:
        error?.message ||
        "Failed to fetch game counts",
    });
  }
};

module.exports = {
  getGameCounts,
};