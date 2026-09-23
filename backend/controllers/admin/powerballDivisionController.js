const { getCountryContext } = require("../../config/countryConfig");

// ======================================================
// CREATE DIVISION
// ======================================================

exports.createDivision = async (req, res) => {
  try {
    const { PowerballDivision } = getCountryContext(req);
    const {
      division,
      main,
      powerball,
      prize,
      isActive,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      division === undefined ||
      main === undefined ||
      powerball === undefined ||
      prize === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "division, main, powerball and prize are required.",
      });
    }

    if (
      Number.isNaN(Number(division)) ||
      Number(division) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Division must be a valid number greater than 0.",
      });
    }

    if (
      Number.isNaN(Number(main)) ||
      Number(main) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Main matches must be a valid number.",
      });
    }

    if (
      Number.isNaN(Number(prize)) ||
      Number(prize) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Prize must be a valid number.",
      });
    }

    if (typeof powerball !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Powerball must be true or false.",
      });
    }

    // ==================================================
    // CHECK DUPLICATE DIVISION
    // ==================================================

    const existingDivision =
      await PowerballDivision.findOne({
        division: Number(division),
      });

    if (existingDivision) {
      return res.status(400).json({
        success: false,
        message: `Division ${division} already exists.`,
      });
    }

    // ==================================================
    // CREATE DIVISION
    // ==================================================

    const newDivision =
      await PowerballDivision.create({
        division: Number(division),
        main: Number(main),
        powerball,
        prize: Number(prize),
        isActive:
          isActive === undefined
            ? true
            : Boolean(isActive),
      });

    return res.status(201).json({
      success: true,
      message:
        "India Powerball division created successfully.",
      division: newDivision,
    });
  } catch (error) {
    console.error(
      "Create India Powerball Division Error:",
      error
    );

    // Duplicate key safety
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This division already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL DIVISIONS
// ======================================================

exports.getAllDivisions = async (req, res) => {
  try {
    const { PowerballDivision } = getCountryContext(req);
    const divisions =
      await PowerballDivision.find()
        .sort({ division: 1 })
        .lean();

    return res.status(200).json({
      success: true,
      total: divisions.length,
      divisions,
    });
  } catch (error) {
    console.error(
      "Get India Powerball Divisions Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ACTIVE DIVISIONS
// ======================================================

exports.getActiveDivisions = async (req, res) => {
  try {
    const { PowerballDivision } = getCountryContext(req);
    const divisions =
      await PowerballDivision.find({
        isActive: true,
      })
        .sort({ division: 1 })
        .lean();

    return res.status(200).json({
      success: true,
      total: divisions.length,
      divisions,
    });
  } catch (error) {
    console.error(
      "Get Active India Powerball Divisions Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET DIVISION BY ID
// ======================================================

exports.getDivisionById = async (req, res) => {
  try {
    const { PowerballDivision } = getCountryContext(req);
    const { id } = req.params;

    const division =
      await PowerballDivision.findById(id).lean();

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "India Powerball division not found.",
      });
    }

    return res.status(200).json({
      success: true,
      division,
    });
  } catch (error) {
    console.error(
      "Get India Powerball Division Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE DIVISION
// ======================================================

exports.updateDivision = async (req, res) => {
  try {
    const { PowerballDivision } = getCountryContext(req);
    const { id } = req.params;

    const {
      division,
      main,
      powerball,
      prize,
      isActive,
    } = req.body;

    // ==================================================
    // FIND EXISTING
    // ==================================================

    const existing =
      await PowerballDivision.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "India Powerball division not found.",
      });
    }

    // ==================================================
    // VALIDATION
    // ==================================================

    if (division !== undefined) {
      if (
        Number.isNaN(Number(division)) ||
        Number(division) < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Division must be a valid number greater than 0.",
        });
      }
    }

    if (main !== undefined) {
      if (
        Number.isNaN(Number(main)) ||
        Number(main) < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Main matches must be a valid number.",
        });
      }
    }

    if (prize !== undefined) {
      if (
        Number.isNaN(Number(prize)) ||
        Number(prize) < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Prize must be a valid number.",
        });
      }
    }

    if (
      powerball !== undefined &&
      typeof powerball !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Powerball must be true or false.",
      });
    }

    if (
      isActive !== undefined &&
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    // ==================================================
    // CHECK DUPLICATE DIVISION
    // ==================================================

    if (
      division !== undefined &&
      Number(division) !== existing.division
    ) {
      const duplicate =
        await PowerballDivision.findOne({
          division: Number(division),
          _id: { $ne: id },
        });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Division ${division} already exists.`,
        });
      }
    }

    // ==================================================
    // UPDATE FIELDS
    // ==================================================

    if (division !== undefined) {
      existing.division = Number(division);
    }

    if (main !== undefined) {
      existing.main = Number(main);
    }

    if (powerball !== undefined) {
      existing.powerball = powerball;
    }

    if (prize !== undefined) {
      existing.prize = Number(prize);
    }

    if (isActive !== undefined) {
      existing.isActive = isActive;
    }

    await existing.save();

    return res.status(200).json({
      success: true,
      message:
        "India Powerball division updated successfully.",
      division: existing,
    });
  } catch (error) {
    console.error(
      "Update India Powerball Division Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This division already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE DIVISION
// ======================================================

exports.deleteDivision = async (req, res) => {
  try {
    const { PowerballDivision } = getCountryContext(req);
    const { id } = req.params;

    const division =
      await PowerballDivision.findById(id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "India Powerball division not found.",
      });
    }

    await division.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "India Powerball division deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete India Powerball Division Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// TOGGLE DIVISION STATUS
// ======================================================

exports.toggleDivisionStatus = async (req, res) => {
  try {
    const { PowerballDivision } = getCountryContext(req);
    const { id } = req.params;

    const division =
      await PowerballDivision.findById(id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "India Powerball division not found.",
      });
    }

    division.isActive = !division.isActive;

    await division.save();

    return res.status(200).json({
      success: true,
      message: `Division ${
        division.isActive
          ? "activated"
          : "deactivated"
      } successfully.`,
      division,
    });
  } catch (error) {
    console.error(
      "Toggle India Powerball Division Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};