const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/authmodel");

const { sendResetPasswordOTP } = require("../utils/mailer.js");

const uploadToImgBB = require("../utils/uploadToImgBB");

// ======================================================
// COUNTRY CONFIGURATION — Sirf India support hai
// ======================================================

const COUNTRY_CONFIG = {
  IN: {
    name: "India",
    mobileLength: 10,
  },
};

// ======================================================
// NORMALIZE COUNTRY
// ======================================================

const normalizeCountry = (country) => {
  const value = String(country || "")
    .trim()
    .toLowerCase();

  // Only India supported.
  const aliases = {
    india: "IN",
    in: "IN",
    ind: "IN",
  };

  return aliases[value] || "";
};

// ======================================================
// GET COUNTRY FROM REQUEST
// ======================================================

const getRequestCountry = (req) => {
  const rawCountry =
    req.body?.country ||
    req.body?.countryCode ||
    req.body?.countryName ||
    req.params?.country ||
    req.query?.country ||
    req.query?.countryCode ||
    req.user?.country ||
    "";

  return normalizeCountry(rawCountry);
};

// ======================================================
// VALIDATE COUNTRY
// ======================================================

const validateCountry = (country) => {
  const normalized = normalizeCountry(country);

  if (!normalized) {
    return {
      valid: false,
      country: "",
      message: "Country is required. Only India is supported.",
    };
  }

  if (!COUNTRY_CONFIG[normalized]) {
    return {
      valid: false,
      country: normalized,
      message: "Unsupported country. Only India is supported.",
    };
  }

  return { valid: true, country: normalized };
};

// ======================================================
// VALIDATE MOBILE
// ======================================================

const validateMobile = (mobile, country) => {
  const normalizedCountry = normalizeCountry(country);
  const config = COUNTRY_CONFIG[normalizedCountry];

  if (!config) {
    return {
      valid: false,
      message:
        "Invalid country. Only India is supported.",
    };
  }

  const cleanMobile = String(mobile || "").replace(/\D/g, "");

  if (!cleanMobile) {
    return {
      valid: false,
      message: "Mobile number is required",
    };
  }

  if (normalizedCountry === "AU") {
    if (!/^4\d{8}$/.test(cleanMobile)) {
      return {
        valid: false,
        message:
          "Australia mobile number must be exactly 9 digits and start with 4",
      };
    }
  } else if (cleanMobile.length !== config.mobileLength) {
    return {
      valid: false,
      message: `Mobile number must be ${config.mobileLength} digits for ${config.name}`,
    };
  }

  return {
    valid: true,
    mobile: cleanMobile,
  };
};

// ======================================================
// GENERATE JWT TOKEN
// ======================================================

const generateToken = (user) => {
  if (!user || !user._id) {
    throw new Error("Cannot generate token: user _id missing");
  }

  if (user.userId === undefined || user.userId === null) {
    throw new Error("Cannot generate token: userId missing");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      userId: Number(user.userId),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// ======================================================
// COOKIE CONFIG (CENTRALIZED)
// ======================================================
//
// WHY:
// - Production: HTTPS + cross-site => secure=true, sameSite="none"
// - Development: HTTP + localhost => secure=false, sameSite="lax"
// - Domain ".regalclub.live" SIRF production mein lagao
//   warna localhost pe browser cookie silently drop kar dega.
//
// ======================================================

const isProduction = process.env.NODE_ENV === "production";

const getCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  // Production: main domain + all subdomains
  if (isProduction) {
    options.domain = ".regalclub.live";
  }

  return options;
};

// ======================================================
// COOKIE NAME HELPER (role case-insensitive)
// ======================================================

const getAuthCookieName = (role) => {
  return String(role || "").toLowerCase() === "admin"
    ? "adminToken"
    : "powerhit";
};

// ======================================================
// SET AUTH COOKIE
// ======================================================

const setAuthCookie = (res, token, role) => {
  const cookieName = getAuthCookieName(role);

  const options = getCookieOptions();

  res.cookie(cookieName, token, options);

  // Purani legacy "token" cookie remove karo
  // IMPORTANT: expires + maxAge dono chahiye warna browser clear nahi karta
  const clearOptions = {
    ...options,
    expires: new Date(0),
    maxAge: 0,
  };

  res.clearCookie("token", clearOptions);
};

// ======================================================
// CLEAR AUTH COOKIES
// ======================================================
//
// IMPORTANT:
// - clearCookie ke options SAME hone chahiye jo set karte waqt the
//   (httpOnly, secure, sameSite, path, domain).
// - Cross-site (SameSite=None; Secure) case mein sirf expires kaafi nahi —
//   maxAge: 0 bhi pass karna zaroori hai warna Chrome/Firefox cookie
//   silently drop nahi karte.
//
// ======================================================

const clearAuthCookies = (res) => {
  const options = getCookieOptions();

  // maxAge ko overwrite karke 0 kar do
  options.expires = new Date(0);
  options.maxAge = 0;

  res.clearCookie("powerhit", options);
  res.clearCookie("token", options);
  res.clearCookie("adminToken", options);
};

// ======================================================
// REGISTER
// ======================================================

const register = async (req, res) => {
  try {
    let { name, email, mobile, password, referralCode } = req.body;

    // COUNTRY
    const country = getRequestCountry(req);

    // COUNTRY VALIDATION
    const countryCheck = validateCountry(country);
    if (!countryCheck.valid) {
      return res.status(400).json({
        success: false,
        message: countryCheck.message,
      });
    }

    // REQUIRED FIELDS
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile and password are required",
      });
    }

    // NORMALIZE
    name = String(name).trim().toLowerCase();
    email = String(email).trim().toLowerCase();
    mobile = String(mobile).trim();

    // PASSWORD VALIDATION
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // MOBILE MUST BE NUMBERS ONLY
    if (!/^\d+$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must contain numbers only",
      });
    }

    // COUNTRY WISE MOBILE VALIDATION
    const mobileCheck = validateMobile(mobile, country);
    if (!mobileCheck.valid) {
      return res.status(400).json({
        success: false,
        message: mobileCheck.message,
      });
    }
    mobile = mobileCheck.mobile;

    // CHECK EXISTING USER
    const userExist = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (userExist) {
      let message = "User already exists";

      if (userExist.email === email) {
        message = "Email already registered";
      } else if (userExist.mobile === mobile) {
        message = "Mobile number already registered";
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }

    // REFERRAL
    let referrerUser = null;

    if (referralCode) {
      referralCode = String(referralCode).trim().toUpperCase();

      referrerUser = await User.findOne({ referralCode });

      if (!referrerUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }

      if (referrerUser.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Referrer account is blocked",
        });
      }
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // GENERATE UNIQUE REFERRAL CODE
    let newReferralCode = generateReferralCode(name);

    while (await User.findOne({ referralCode: newReferralCode })) {
      newReferralCode = generateReferralCode(name);
    }

    // GENERATE USER ID
    const lastUser = await User.findOne({
      userId: { $exists: true, $ne: null },
    })
      .sort({ userId: -1 })
      .select("userId")
      .lean();

    const userId = lastUser?.userId ? Number(lastUser.userId) + 1 : 100001;

    // CREATE USER
    const user = await User.create({
      userId,
      name,
      email,
      mobile,
      password: hashedPassword,

      // ⚠️ Plain password storage
      plainPassword: password,

      role: "user",
      country,
      referralCode: newReferralCode,
      referredBy: referralCode || null,
      referredByUser: referrerUser ? referrerUser._id : null,
    });

    // UPDATE REFERRER STATS
    if (referrerUser) {
      await User.findByIdAndUpdate(referrerUser._id, {
        $inc: {
          totalReferrals: 1,
          referralEarning: 50,
        },
      });
    }

    // JWT TOKEN
    const token = generateToken(user);

    // SET COOKIE
    setAuthCookie(res, token, user.role);

    // REMOVE SENSITIVE DATA
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.plainPassword;

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: userObj,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    // DUPLICATE KEY ERROR
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      let message = "Duplicate field";

      if (field === "email") {
        message = "Email already registered";
      } else if (field === "mobile") {
        message = "Mobile number already registered";
      } else if (field === "userId") {
        message = "User ID already exists. Please try again.";
      } else if (field === "referralCode") {
        message = "Referral code already exists";
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// GENERATE REFERRAL CODE
// ======================================================

const generateReferralCode = (name) => {
  const cleanName = String(name || "")
    .replace(/\s+/g, "")
    .substring(0, 4)
    .toUpperCase();

  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return cleanName + random;
};

// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    let { mobile, password } = req.body;

    // VALIDATION
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile and password are required",
      });
    }

    // NORMALIZE MOBILE
    mobile = String(mobile).replace(/\D/g, "");

    // FIND USER
    const user = await User.findOne({ mobile }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // BLOCK CHECK
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    // PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile or password",
      });
    }

    // JWT
    const token = generateToken(user);

    // COOKIE
    setAuthCookie(res, token, user.role);

    // RESPONSE USER
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.plainPassword;

    return res.status(200).json({
      success: true,
      message: `${user.role} login successful`,
      token,
      role: user.role,
      user: userObj,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// GET PROFILE
// ======================================================

// ======================================================
// GET PROFILE (with referral stats)
// ======================================================

const getProfile = async (req, res) => {
  try {
    const mongoId = req.user?._id || req.user?.id;

    if (!mongoId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Admin accounts client (user) side par allowed nahi hain.
    // Admin panel alag port par chalta hai, par cookies localhost
    // par share hoti hain — stale admin cookie se client ka
    // profile admin ban jata tha aur / <-> /login loop banta tha.
    if (String(req.user?.role || "").toLowerCase() === "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — admin accounts must use the admin panel",
      });
    }

    const user = await User.findById(mongoId)
      .select("-password -plainPassword")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= LEVEL WISE REFERRALS =================
    const level1Users = await User.find({ referredByUser: user._id })
      .select("_id userId mobile createdAt")
      .lean();

    const level1Ids = level1Users.map((u) => u._id);

    const level2Users = level1Ids.length
      ? await User.find({ referredByUser: { $in: level1Ids } })
          .select("_id userId mobile createdAt")
          .lean()
      : [];

    const level2Ids = level2Users.map((u) => u._id);

    const level3Users = level2Ids.length
      ? await User.find({ referredByUser: { $in: level2Ids } })
          .select("_id userId mobile createdAt")
          .lean()
      : [];

    const totalMembersJoined =
      level1Users.length + level2Users.length + level3Users.length;

    // ================= FIRST DEPOSIT COUNT =================
    // TODO (Vikram): Deposit/Transaction model ka naam bata do to
    // real count laga dunga. Filhal 0.
    let totalMembersFirstDeposit = 0;

    // ================= COMMISSION TOTALS =================
    // Recharge commission -> referralEarning
    // Betting commission  -> rebate
    const totalRechargeCommission = user.referralEarning || 0;
    const totalBettingCommission = user.rebate || 0;

    // ================= RECENT JOINED MEMBERS =================
    const tagLevel = (arr, level) => arr.map((u) => ({ ...u, level }));

    const recentJoinedMembers = [
      ...tagLevel(level1Users, 1),
      ...tagLevel(level2Users, 2),
      ...tagLevel(level3Users, 3),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((u) => ({
        userId: u.userId,
        level: u.level,
        joinedAt: u.createdAt,
      }));

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        credit: user.credit,
        country: user.country || null,
      },
      referralStats: {
        totalMembersJoined,
        totalMembersFirstDeposit,
        level1Count: level1Users.length,
        level2Count: level2Users.length,
        level3Count: level3Users.length,
        totalBettingCommission,
        totalRechargeCommission,
      },
      recentJoinedMembers,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// UPDATE PROFILE
// ======================================================

const updateProfile = async (req, res) => {
  try {
    const mongoId = req.user?._id || req.user?.id;

    if (!mongoId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { fullName, email, mobile, city } = req.body;
    const updateData = {};

    // NAME
    if (fullName !== undefined) {
      const cleanName = String(fullName).trim().toLowerCase();

      updateData.name = cleanName;
    }

    // EMAIL
    if (email !== undefined) {
      updateData.email = String(email).trim().toLowerCase();
    }

    // MOBILE
    if (mobile !== undefined) {
      const currentUser = await User.findById(mongoId).select("country");

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const currentCountry = normalizeCountry(currentUser.country);
      const mobileCheck = validateMobile(mobile, currentCountry);

      if (!mobileCheck.valid) {
        return res.status(400).json({
          success: false,
          message: mobileCheck.message,
        });
      }

      updateData.mobile = mobileCheck.mobile;
    }

    // CITY
    if (city !== undefined) {
      updateData.city = String(city).trim();
    }

    // PROFILE IMAGE
    if (req.file) {
      updateData.profilePic = await uploadToImgBB(req.file);
    }

    // UPDATE USER
    const updatedUser = await User.findByIdAndUpdate(
      mongoId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password -plainPassword");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: req.file
        ? "Profile and image updated successfully"
        : "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      let message = "Duplicate field";

      if (field === "name") message = "Username already taken";
      else if (field === "email") message = "Email already registered";
      else if (field === "mobile") message = "Mobile number already registered";

      return res.status(400).json({ success: false, message });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// LOGOUT
// ======================================================

const logout = async (req, res) => {
  try {
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    email = String(email).trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.reset_otp = otp;
    user.reset_otp_expiry = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    const isSent = await sendResetPasswordOTP(user.email, otp);

    if (!isSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// VERIFY OTP AND RESET PASSWORD
// ======================================================

const verifyOTPAndReset = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    email = String(email).trim().toLowerCase();

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    if (!user.reset_otp || user.reset_otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.reset_otp_expiry ||
      new Date() > new Date(user.reset_otp_expiry)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // NEW PASSWORD
    user.password = await bcrypt.hash(newPassword, 10);
    user.plainPassword = newPassword;
    user.reset_otp = null;
    user.reset_otp_expiry = null;

    await user.save();

    // Clear old session
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const mongoId = req.user?._id || req.user?.id;

    if (!mongoId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(mongoId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.plainPassword = newPassword;

    await user.save();

    // Clear old session
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE USER STATUS
// ======================================================

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or blocked",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = status;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.plainPassword;

    return res.status(200).json({
      success: true,
      message: `User ${status} successfully`,
      user: userResponse,
    });
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// ADMIN — SET USER WAGERING REQUIREMENT
// Admin user ke account par ek wagering target (₹) set
// karta hai. Jab tak user ka total wagered is target tak
// complete nahi hota, withdrawal capped rahegi.
// wageringRequired = 0 -> requirement clear.
// ======================================================

const adminSetUserWagering = async (req, res) => {
  try {
    const { userId } = req.params;
    const { wageringRequired } = req.body;

    const amount = Number(wageringRequired);
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "wageringRequired must be a number >= 0",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.adminWageringRequired = Math.round(amount);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.plainPassword;

    return res.status(200).json({
      success: true,
      message: amount > 0
        ? `Wagering requirement of ₹${user.adminWageringRequired} set — withdrawal stays capped until wagering completes`
        : "Wagering requirement cleared",
      user: userResponse,
    });
  } catch (error) {
    console.error("SET USER WAGERING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// ADMIN — UPDATE USER (full edit)
// Admin can edit: name, email, mobile, wallet credit,
// status, country, role and password (hashed + plain sync).
// ======================================================

const adminUpdateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      mobile,
      credit,
      status,
      country,
      role,
      password,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // An admin cannot change their own role or status
    // (prevents locking yourself out of the panel)
    const adminId = String(req.user?._id || req.user?.id || "");
    if (adminId && adminId === String(user._id)) {
      if ((role && role !== user.role) || (status && status !== user.status)) {
        return res.status(403).json({
          success: false,
          message: "You cannot change your own role or status",
        });
      }
    }

    const updates = {};

    // NAME
    if (name !== undefined && name !== null && String(name).trim() !== "") {
      updates.name = String(name).trim().toLowerCase();
    }

    // EMAIL
    if (email !== undefined && email !== null && String(email).trim() !== "") {
      const cleanEmail = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address",
        });
      }
      updates.email = cleanEmail;
    }

    // MOBILE
    if (mobile !== undefined && mobile !== null && String(mobile).trim() !== "") {
      const cleanMobile = String(mobile).replace(/\D/g, "");
      if (!/^\d+$/.test(cleanMobile) || cleanMobile.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Invalid mobile number",
        });
      }
      updates.mobile = cleanMobile;
    }

    // WALLET CREDIT
    if (credit !== undefined && credit !== null && credit !== "") {
      const newCredit = Number(credit);
      if (!Number.isFinite(newCredit) || newCredit < 0) {
        return res.status(400).json({
          success: false,
          message: "Wallet amount must be a positive number",
        });
      }
      updates.credit = newCredit;
    }

    // STATUS
    if (status !== undefined && status !== null && status !== "") {
      if (!["active", "blocked"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be active or blocked",
        });
      }
      updates.status = status;
    }

    // COUNTRY
    if (country !== undefined && country !== null && String(country).trim() !== "") {
      updates.country = String(country).trim().toUpperCase();
    }

    // ROLE
    if (role !== undefined && role !== null && role !== "") {
      if (!["admin", "user"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be admin or user",
        });
      }
      updates.role = role;
    }

    // PASSWORD (hash + keep plainPassword in sync — the panel reads it)
    if (password !== undefined && password !== null && String(password) !== "") {
      const newPassword = String(password);
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      updates.password = await bcrypt.hash(newPassword, 10);
      updates.plainPassword = newPassword;
    }

    // DUPLICATE CHECK for email / mobile
    if (updates.email || updates.mobile) {
      const duplicate = await User.findOne({
        _id: { $ne: user._id },
        $or: [
          ...(updates.email ? [{ email: updates.email }] : []),
          ...(updates.mobile ? [{ mobile: updates.mobile }] : []),
        ],
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: duplicate.email === updates.email
            ? "Email already in use by another user"
            : "Mobile number already in use by another user",
        });
      }
    }

    // APPLY
    Object.assign(user, updates);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.plainPassword;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("ADMIN UPDATE USER ERROR:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({
        success: false,
        message: field === "email"
          ? "Email already registered"
          : field === "mobile"
            ? "Mobile number already registered"
            : "Duplicate field",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  forgotPassword,
  verifyOTPAndReset,
  changePassword,
  getAllUsers,
  updateUserStatus,
  adminSetUserWagering,
  adminUpdateUser,

  // Helpers
  normalizeCountry,
  validateMobile,

  // JWT helper
  generateToken,
};
