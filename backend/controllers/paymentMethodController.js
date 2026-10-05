// controllers/paymentMethodController.js
//
// ============================================================
// SAVED WITHDRAWAL PAYMENT METHODS — user CRUD
// Types: bank (bank card), upi (UPI address), usdt (crypto)
// ============================================================

const PaymentMethod = require("../models/paymentMethodModel");

const USDT_NETWORKS = ["TRC20", "ERC20", "BEP20"];

const clean = (v) => String(v || "").trim();

/* ============================================================
   GET /api/payment-methods?type=bank|upi|usdt (optional filter)
============================================================ */

exports.getMyPaymentMethods = async (req, res) => {
  try {
    const query = { user: req.user.id };
    if (req.query.type) {
      query.type = String(req.query.type).toLowerCase();
    }

    const methods = await PaymentMethod.find(query)
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return res.json({ success: true, methods });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load saved payment methods",
    });
  }
};

/* ============================================================
   POST /api/payment-methods — save a new method
============================================================ */

exports.addPaymentMethod = async (req, res) => {
  try {
    const type = String(req.body.type || "").toLowerCase();
    if (!["bank", "upi", "usdt"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method type",
      });
    }

    const doc = { user: req.user.id, type };

    if (type === "bank") {
      doc.bankName = clean(req.body.bankName);
      doc.accountHolderName = clean(req.body.accountHolderName);
      doc.accountNumber = clean(req.body.accountNumber);
      doc.ifscCode = clean(req.body.ifscCode).toUpperCase();
      doc.phone = clean(req.body.phone);

      if (!doc.bankName || !doc.accountHolderName || !doc.accountNumber || !doc.ifscCode) {
        return res.status(400).json({
          success: false,
          message: "Bank name, recipient name, account number and IFSC code are required",
        });
      }
      if (!/^\d{9,18}$/.test(doc.accountNumber)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid bank account number",
        });
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(doc.ifscCode)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid IFSC code",
        });
      }
    } else if (type === "upi") {
      doc.upiId = clean(req.body.upiId);
      doc.upiName = clean(req.body.upiName);

      if (!doc.upiId || !doc.upiName) {
        return res.status(400).json({
          success: false,
          message: "UPI ID and holder name are required",
        });
      }
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(doc.upiId)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid UPI ID (e.g. name@paytm)",
        });
      }
    } else {
      // usdt
      doc.network = clean(req.body.network).toUpperCase();
      doc.walletAddress = clean(req.body.walletAddress);

      if (!USDT_NETWORKS.includes(doc.network)) {
        return res.status(400).json({
          success: false,
          message: `Invalid USDT network. Allowed: ${USDT_NETWORKS.join(", ")}`,
        });
      }
      if (doc.walletAddress.length < 20) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid USDT wallet address",
        });
      }
    }

    // First saved method of this type becomes the default
    const existingCount = await PaymentMethod.countDocuments({
      user: req.user.id,
      type,
    });
    doc.isDefault = existingCount === 0;

    const method = await PaymentMethod.create(doc);

    return res.status(201).json({
      success: true,
      message: "Payment method saved successfully",
      method,
    });
  } catch (error) {
    console.error("Add payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save payment method",
    });
  }
};

/* ============================================================
   PUT /api/payment-methods/:id — edit a saved method
============================================================ */

exports.updatePaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    const body = req.body || {};

    if (method.type === "bank") {
      if (body.bankName !== undefined) method.bankName = clean(body.bankName);
      if (body.accountHolderName !== undefined)
        method.accountHolderName = clean(body.accountHolderName);
      if (body.accountNumber !== undefined)
        method.accountNumber = clean(body.accountNumber);
      if (body.ifscCode !== undefined)
        method.ifscCode = clean(body.ifscCode).toUpperCase();
      if (body.phone !== undefined) method.phone = clean(body.phone);
    } else if (method.type === "upi") {
      if (body.upiId !== undefined) method.upiId = clean(body.upiId);
      if (body.upiName !== undefined) method.upiName = clean(body.upiName);
    } else if (method.type === "usdt") {
      if (body.network !== undefined)
        method.network = clean(body.network).toUpperCase();
      if (body.walletAddress !== undefined)
        method.walletAddress = clean(body.walletAddress);

      if (method.network && !USDT_NETWORKS.includes(method.network)) {
        return res.status(400).json({
          success: false,
          message: `Invalid USDT network. Allowed: ${USDT_NETWORKS.join(", ")}`,
        });
      }
    }

    if (body.isDefault === true || body.isDefault === "true") {
      await PaymentMethod.updateMany(
        { user: req.user.id, type: method.type },
        { isDefault: false },
      );
      method.isDefault = true;
    }

    await method.save();

    return res.json({
      success: true,
      message: "Payment method updated successfully",
      method,
    });
  } catch (error) {
    console.error("Update payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment method",
    });
  }
};

/* ============================================================
   DELETE /api/payment-methods/:id
============================================================ */

exports.deletePaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    // If the deleted one was the default, promote the newest one
    if (method.isDefault) {
      const next = await PaymentMethod.findOne({
        user: req.user.id,
        type: method.type,
      }).sort({ createdAt: -1 });

      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    return res.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment method",
    });
  }
};
