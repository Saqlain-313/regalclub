const md5 = require("md5");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const User = require("../models/User");
const Recharge = require("../models/TradeRecharge");
const Transaction = require("../models/TradeTransaction");
const Withdrawal = require("../models/TradeWithdrawal");
const Message = require("../models/TradeMessage");
const Promocode = require("../models/Promocode");
const { timerJoin } = require("../utils/Timer");
const { uploadImage } = require("../utils/uploadImage");
const JWT_SECRET = process.env.JWT_SECRET || "santosh";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER || "",
    pass: process.env.MAIL_PASSWORD || "",
  },
});
const otp = () => String(Math.floor(100000 + Math.random() * 900000));
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const uid = (req) => Number(req.user?.userId ?? req.id);
const orderId = () =>
  `W${new Date().toISOString().replace(/-/g, "").slice(0, 8)}${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
const rechargeOrder = () =>
  `${new Date().toISOString().replace(/-/g, "").slice(0, 8)}${Math.floor(10000000000000 + Math.random() * 89999999999999)}`;

exports.registerUser = async (req, res) => {
  try {
    const { email, password, country, currency } = req.body;
    if (!email || !password || !country || !currency)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    const e = email.trim().toLowerCase();
    if (await User.exists({ email: e }))
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    const last = await User.findOne()
      .sort({ userId: -1 })
      .select("userId")
      .lean();
    const userId = last?.userId ? last.userId + 1 : 100001;
    const u = await User.create({
      userId,
      name: "Unknown",
      email: e,
      password: md5(password),
      plane_password: password,
      country,
      currency,
    });
    const token = jwt.sign({ userId, email: e }, JWT_SECRET, {
      expiresIn: "7d",
    });
    await User.updateOne({ _id: u._id }, { $set: { token } });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 604800000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    return res
      .status(201)
      .json({ success: true, message: "User registered successfully", token });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, otp: code } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    const u = await User.findOne({ email: email.trim().toLowerCase() });
    if (!u)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (u.password !== md5(password))
      return res
        .status(401)
        .json({ success: false, message: "Invalid username and password" });
    if (!u.otp || String(u.otp) !== String(code))
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    if (u.otpExpiresAt && u.otpExpiresAt < new Date())
      return res.status(401).json({ success: false, message: "OTP expired" });
    const token = jwt.sign({ userId: u.userId, email: u.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    await User.updateOne(
      { _id: u._id },
      { $set: { token, otp: null, otpExpiresAt: null } },
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 604800000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    return res.json({ success: true, message: "Login successful", token });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
exports.getUser = async (req, res) => {
  try {
    const u = await User.findOne({ userId: uid(req) })
      .select("-plane_password")
      .lean();
    if (!u)
      return res.status(404).json({ success: false, error: "User not found" });
    return res.json({ success: true, userInfo: [u] });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { name, country } = req.body;
    if (!name || !country)
      return res
        .status(400)
        .json({ success: false, message: "Name and country are required" });
    const u = await User.findOneAndUpdate(
      { userId: uid(req) },
      { $set: { name, country } },
      { new: true },
    );
    if (!u)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.json({ success: true, message: "User updated successfully" });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
exports.getWithdrawlHistory = async (req, res) => {
  try {
    return res.json({
      success: true,
      withdrawhistory: await Transaction.find({ userId: uid(req) })
        .sort({ createdAt: -1 })
        .lean(),
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
exports.sendOtp = async (req, res) => {
  try {
    const e = String(req.body.email || "")
      .trim()
      .toLowerCase();
    if (!e)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    const u = await User.findOne({ email: e });
    if (!u)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const code = otp();
    await User.updateOne(
      { _id: u._id },
      { $set: { otp: code, otpExpiresAt: new Date(Date.now() + 600000) } },
    );
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: e,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${code}. It is valid for 10 minutes.`,
    });
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
exports.verifyOtpAndUpdatePassword = async (req, res) => {
  try {
    const { email, newPassword, otp: code, oldPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    if ((!code && !oldPassword) || (code && oldPassword))
      return res.status(400).json({
        success: false,
        message: "Provide either OTP or old password, not both",
      });
    const u = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!u)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (code) {
      if (!u.otp || String(u.otp) !== String(code))
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      if (u.otpExpiresAt && u.otpExpiresAt < new Date())
        return res.status(400).json({ success: false, message: "OTP expired" });
    } else if (u.password !== md5(oldPassword))
      return res
        .status(400)
        .json({ success: false, message: "Invalid old password" });
    const p = md5(newPassword);
    if (u.password === p)
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    await User.updateOne(
      { _id: u._id },
      {
        $set: {
          password: p,
          plane_password: newPassword,
          otp: null,
          otpExpiresAt: null,
        },
      },
    );
    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
exports.recharge = async (req, res) => {
  try {
    const id = uid(req),
      amount = num(req.body.amount),
      bonus = num(req.body.bonus);
    if (amount <= 0 || !req.body.type || !req.body.utrNo || !req.body.image)
      return res.status(400).json({
        success: false,
        message: "Amount, type, utrNo and image are required",
      });
    if (!(await User.exists({ userId: id })))
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const o = orderId();
    await Recharge.create({
      orderId: o,
      userId: id,
      amount,
      bonus,
      type: req.body.type,
      utrNo: req.body.utrNo,
      image: req.body.image,
      status: 0,
    });
    await Transaction.create({
      userId: id,
      amount,
      remark: "deposit",
      status: 0,
      orderId: o,
    });
    return res
      .status(201)
      .json({ success: true, message: "Recharge successful", orderId: o });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
function sign(params, key) {
  const s = Object.keys(params)
    .sort()
    .filter(
      (k) =>
        k !== "sign" &&
        params[k] !== undefined &&
        params[k] !== null &&
        params[k] !== "",
    )
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("md5").update(`${s}&key=${key}`).digest("hex");
}
exports.handleRecharge = async (req, res) => {
  try {
    const id = uid(req),
      amount = num(req.body.amount),
      bonus = num(req.body.bonus);
    if (!id || amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Valid amount is required" });
    if (!(await User.exists({ userId: id })))
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const o = rechargeOrder(),
      date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const p = {
      version: "1.0",
      mch_id: process.env.SUNPAY_MCH_ID || "",
      mch_order_no: o,
      pay_type: "102",
      trade_amount: amount,
      order_date: date,
      goods_name: "user goods_name",
      notify_url: process.env.SUNPAY_CALLBACK_URL || "",
      mch_return_msg: "user mch_return_msg",
    };
    p.sign = sign(p, process.env.SUNPAY_SECRET_KEY || "");
    p.sign_type = "MD5";
    const r = await axios.post(
      process.env.SUNPAY_URL || "https://pay.sunpayonline.xyz/pay/web",
      new URLSearchParams(p).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000,
      },
    );
    if (!r.data || r.data.tradeMsg !== "request success")
      throw new Error("Gateway error from SunPay");
    if (r.data.payInfo) {
      await Recharge.create({
        orderId: o,
        userId: id,
        amount,
        bonus,
        type: req.body.type || "UPI",
        status: 0,
      });
      await Transaction.create({
        userId: id,
        amount,
        remark: "deposit",
        status: 0,
        orderId: o,
      });
    }
    return res.json({
      message: "Payment Initiated successfully",
      url: r.data.payInfo,
      status: true,
      orderId: o,
      timeStamp: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: e.message,
    });
  }
};
exports.verifySunpayPayment = async (req, res) => {
  try {
    const { mchOrderNo, tradeResult, orderNo } = req.body;
    if (!mchOrderNo)
      return res
        .status(400)
        .json({ success: false, message: "mchOrderNo is required" });
    const r = await Recharge.findOne({ orderId: mchOrderNo });
    if (!r)
      return res
        .status(404)
        .json({ success: false, message: "Recharge not found" });
    if (r.status === 1)
      return res.json({ success: true, message: "Recharge already completed" });
    const ok =
      tradeResult === undefined ||
      String(tradeResult) === "1" ||
      String(tradeResult).toLowerCase() === "success";
    if (!ok) {
      await Recharge.updateOne(
        { _id: r._id },
        { $set: { tradeResult: String(tradeResult || "") } },
      );
      return res.json({ success: false, message: "Payment not successful" });
    }
    const updated = await Recharge.findOneAndUpdate(
      { _id: r._id, status: 0 },
      {
        $set: {
          status: 1,
          tradeResult: String(tradeResult || ""),
          gatewayOrderNo: String(orderNo || ""),
          paidAt: new Date(),
        },
      },
      { new: true },
    );
    if (!updated)
      return res.json({ success: true, message: "Recharge already processed" });
    const credit = (num(r.amount) + num(r.bonus)) / 86;
    await User.updateOne(
      { userId: r.userId },
      { $inc: { money: credit, deposit: credit, recharge: credit } },
    );
    await Transaction.findOneAndUpdate(
      { orderId: mchOrderNo, userId: r.userId },
      { $set: { status: 1, remark: "deposit" } },
    );
    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};
exports.withdraw = async (req, res) => {
  try {
    const id = uid(req),
      amount = num(req.body.amount);
    if (amount <= 0 || !req.body.type || !req.body.usdt)
      return res.status(400).json({
        success: false,
        message: "Valid amount, type and usdt are required",
      });
    const o = orderId();
    const u = await User.findOneAndUpdate(
      { userId: id, money: { $gte: amount } },
      { $inc: { money: -amount } },
      { new: true },
    );
    if (!u) {
      if (!(await User.exists({ userId: id })))
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      return res
        .status(400)
        .json({ success: false, message: "credit insufficient" });
    }
    try {
      await Withdrawal.create({
        orderId: o,
        userId: id,
        amount,
        type: req.body.type,
        usdt: req.body.usdt,
        status: 0,
      });
      await Transaction.create({
        userId: id,
        amount,
        remark: "withdrawl",
        status: 0,
        orderId: o,
      });
    } catch (e) {
      await User.updateOne({ userId: id }, { $inc: { money: amount } });
      throw e;
    }
    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      orderId: o,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
exports.createTransaction = async (req, res) => {
  try {
    const amount = num(req.body.amount);
    if (amount <= 0 || !req.body.remark)
      return res
        .status(400)
        .json({ success: false, message: "Amount and remark are required" });
    await Transaction.create({
      userId: uid(req),
      amount,
      remark: req.body.remark,
      status: 0,
    });
    return res
      .status(201)
      .json({ success: true, message: "Transaction recorded successfully" });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
exports.rechargeDetailsForUser = async (req, res) => {
  try {
    const id = uid(req),
      page = Math.max(parseInt(req.query.pageno) || 1, 1),
      pageto = Math.max(parseInt(req.query.pageto) || 10, page),
      limit = pageto - page + 1;
    const filter = { userId: id };
    const [data, length] = await Promise.all([
      Recharge.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recharge.countDocuments(filter),
    ]);
    if (!data.length)
      return res.status(404).json({
        message: "No recharge records found for this user.",
        data: [],
        length,
      });
    return res.json({
      success: true,
      message: "Recharge details retrieved successfully.",
      data,
      length,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: e.message,
    });
  }
};
exports.logout = async (req, res) => {
  try {
    if (req.user?.userId)
      await User.updateOne(
        { userId: Number(req.user.userId) },
        { $set: { token: "" } },
      );
    res.clearCookie("token");
    if (req.session) req.session.destroy(() => {});
    return res.json({ success: true, message: "Logout successful" });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};
exports.support = async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();
    if (message.length <= 10)
      return res.status(400).json({
        message: "Please write at least 10 characters",
        success: false,
      });
    let image = null;
    if (req.file) {
      try {
        image = await uploadImage(req.file.path);
      } finally {
        fs.unlink(req.file.path, () => {});
      }
    }
    await Message.create({
      userId: uid(req),
      message,
      image,
      time: timerJoin(Date.now()),
    });
    return res.json({ success: true, message: "details update successfully" });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Server error", success: false, error: e.message });
  }
};
exports.usePromocode = async (req, res) => {
  try {
    const code = String(req.body.code || "")
      .trim()
      .toUpperCase();
    if (!code)
      return res
        .status(400)
        .json({ success: false, message: "Promo code is required" });
    const data = await Promocode.findOne({ code, status: 1 }).lean();
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Invalid promo code" });
    return res.json({
      success: true,
      data,
      message: `Promo code ${data.code} applied successfully!`,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};