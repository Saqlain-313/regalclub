const jwt = require("jsonwebtoken");
const User = require("../models/authmodel");

// ============================================================
// GET TOKEN FROM COOKIE / HEADER
// ============================================================

const getToken = (req) => {
  // Admin token
  if (req.cookies?.adminToken) {
    return req.cookies.adminToken;
  }

  // User token
  if (req.cookies?.powerhit) {
    return req.cookies.powerhit;
  }

  // Authorization header
  const authHeader = req.headers?.authorization;

  if (
    authHeader &&
    authHeader.startsWith("Bearer ")
  ) {
    return authHeader.substring(7).trim();
  }

  return null;
};
// ============================================================
// PROTECT USER / ADMIN
// ============================================================

const protect = async (req, res, next) => {
  try {
    const token = getToken(req);

    // --------------------------------------------------------
    // No token
    // --------------------------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // --------------------------------------------------------
    // JWT secret
    // --------------------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message: "JWT configuration error",
      });
    }

    // --------------------------------------------------------
    // Verify JWT
    // --------------------------------------------------------

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "JWT VERIFY ERROR:",
        jwtError.message
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // --------------------------------------------------------
    // Find user
    //
    // NEW TOKEN:
    // decoded.id = MongoDB _id
    // decoded.userId = numeric userId
    //
    // OLD TOKEN:
    // decoded.id = MongoDB _id
    //
    // Both are supported.
    // --------------------------------------------------------

    let user = null;

    if (decoded.id) {
      try {
        user = await User.findById(
          decoded.id
        ).select("-password -plainPassword");
      } catch (error) {
        console.error(
          "USER FIND ERROR:",
          error.message
        );
      }
    }

    // --------------------------------------------------------
    // Fallback for token containing numeric userId
    // --------------------------------------------------------

    if (
      !user &&
      decoded.userId !== undefined &&
      decoded.userId !== null
    ) {
      const numericUserId = Number(
        decoded.userId
      );

      if (Number.isFinite(numericUserId)) {
        user =
          await User.findOne({
            userId: numericUserId,
          }).select(
            "-password -plainPassword"
          );
      }
    }

    // --------------------------------------------------------
    // User not found
    // --------------------------------------------------------

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------------------
    // Blocked user
    // --------------------------------------------------------

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    // --------------------------------------------------------
    // Attach authenticated user
    // --------------------------------------------------------

    req.user = user;

    // Numeric trading ID
    req.userId = Number(user.userId);

    // Backward compatibility
    req.id = user._id;

    next();
  } catch (error) {
    console.error(
      "PROTECT ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

// ============================================================
// ADMIN ONLY
// ============================================================

const adminProtect = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};

// ============================================================
// USER ONLY
// ============================================================

const userProtect = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "user") {
    return res.status(403).json({
      success: false,
      message: "User access only",
    });
  }

  next();
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  protect,
  adminProtect,
  userProtect,
};