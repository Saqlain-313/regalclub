const nodemailer = require("nodemailer");

/* ============================================================
   TRANSPORTER
============================================================ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ============================================================
   EMAIL TEMPLATE
============================================================ */
const emailWrapper = ({
  title = "Reset Password",
  subtitle = "Use the OTP below to reset your password securely.",
  otp = "969457",
}) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <title>${title}</title>

  <style>

    body{
      margin:0;
      padding:6px;
      background:#f3f3f5;
      font-family:Arial,Helvetica,sans-serif;
      -webkit-text-size-adjust:none;
    }

    table{
      border-spacing:0;
      border-collapse:collapse;
    }

.main{
  width:100%;
  max-width:500px;
  margin:auto;
  background:#ffffff;
  border-radius:18px;
  overflow:hidden;
  border:2px solid #000000; /* BLACK OUTLINE */
  box-shadow:0 6px 18px rgba(0,0,0,0.12);
}

    /* ================= HEADER ================= */

    .header{
      background:#14003d;
      padding:16px 18px;
    }

    .logo{
      color:#ffffff;
      font-size:28px;
      font-weight:800;
      line-height:30px;
    }

    .logo span{
      color:#6958ff;
    }

    .secure{
      color:#ffffff;
      font-size:12px;
      font-weight:600;
      line-height:14px;
    }

    /* ================= CONTENT ================= */

    .content{
      padding:18px 14px 12px;
      text-align:center;
    }

    .lock-wrap{
      width:68px;
      height:68px;
      border-radius:50%;
      background:#f4f1ff;
      margin:0 auto 12px;
      text-align:center;
      line-height:68px;
      font-size:28px;
    }

    .title{
      margin:0;
      color:#12003d;
      font-size:24px;
      line-height:30px;
      font-weight:800;
      text-align:center;
    }

    .subtitle{
      margin:10px auto 0;
      max-width:340px;
      color:#666680;
      font-size:14px;
      line-height:22px;
      text-align:center;
    }

    /* ================= OTP ================= */

    .otp-box{
      margin-top:16px;
      border:1px solid #ece8ff;
      border-radius:16px;
      background:#ffffff;
      padding:14px 8px;
      text-align:center;
    }

    .otp-label{
      margin:0;
      color:#666680;
      font-size:14px;
      font-weight:700;
      text-align:center;
    }

    .otp{
      margin:10px 0 0;
      font-size:40px;
      line-height:44px;
      font-weight:900;
      color:#5c45ff;
      letter-spacing:6px;
      text-align:center;
    }

    /* ================= VALID ================= */

    .valid-table{
      width:100%;
      margin-top:12px;
    }

    .valid-text{
      color:#666680;
      font-size:13px;
      line-height:16px;
      text-align:center;
    }

    .valid-text span{
      color:#5c45ff;
      font-weight:800;
    }

    /* ================= DIVIDER ================= */

    .divider{
      height:1px;
      background:#ececf3;
      margin:16px 0;
    }

    /* ================= INFO ================= */

    .info-wrap{
      width:100%;
    }

    .info-icon{
      width:42px;
      height:42px;
      border:1px solid #ececf3;
      border-radius:50%;
      text-align:center;
      line-height:42px;
      font-size:18px;
      background:#ffffff;
      margin:auto;
    }

    .info-title{
      margin:0;
      color:#12003d;
      font-size:15px;
      font-weight:800;
    }

    .info-text{
      margin:4px 0 0;
      color:#666680;
      font-size:12px;
      line-height:18px;
    }

    /* ================= FOOTER ================= */

    .footer-box{
      margin-top:16px;
      background:#f7f5ff;
      border-radius:14px;
      padding:12px 10px;
      text-align:center;
    }

    .footer-title{
      margin:0;
      color:#55556d;
      font-size:13px;
      line-height:20px;
      text-align:center;
    }

    .footer-title span{
      color:#5c45ff;
      font-weight:800;
    }

    .copyright{
      margin:4px 0 0;
      color:#666680;
      font-size:11px;
      text-align:center;
    }

    /* ================= BOTTOM ================= */

    .bottom{
      padding:12px 0 2px;
      text-align:center;
    }

    .bottom-item{
      display:inline-block;
      margin:0 6px;
      color:#555577;
      font-size:11px;
      font-weight:600;
      text-align:center;
    }

  </style>
</head>

<body>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table class="main" cellpadding="0" cellspacing="0">

          <!-- HEADER -->
          <tr>
            <td class="header">

              <table width="100%">
                <tr>

                  <!-- LOGO -->
                  <td align="left">

                    <div class="logo">
                      Adstor<span>X</span>
                    </div>

                  </td>

                  <!-- SECURE -->
                  <td align="right">

                    <table cellpadding="0" cellspacing="0" style="margin-left:auto;">
                      <tr>

                        <td valign="middle">

                          <div style="
                            width:28px;
                            height:28px;
                            border-radius:50%;
                            background:rgba(255,255,255,0.08);
                            text-align:center;
                            line-height:28px;
                            font-size:14px;
                            color:#ffffff;
                          ">
                            🛡️
                          </div>

                        </td>

                        <td valign="middle" style="padding-left:6px;">

                          <span class="secure">
                            Secure Verification
                          </span>

                        </td>

                      </tr>
                    </table>

                  </td>

                </tr>
              </table>

            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td class="content">

              <!-- LOCK -->
              <div class="lock-wrap">
                🔐
              </div>

              <!-- TITLE -->
              <h1 class="title">
                ${title}
              </h1>

              <!-- SUBTITLE -->
              <p class="subtitle">
                ${subtitle}
              </p>

              <!-- OTP -->
              <div class="otp-box">

                <p class="otp-label">
                  Your OTP
                </p>

                <div class="otp">
                  ${otp}
                </div>

              </div>

              <!-- VALID -->
              <table
                class="valid-table"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>

                  <td align="center">

                    <table cellpadding="0" cellspacing="0">
                      <tr>

                        <td valign="middle" style="padding-right:6px;">

                          <div style="
                            font-size:14px;
                            line-height:14px;
                            text-align:center;
                          ">
                            ⏰
                          </div>

                        </td>

                        <td valign="middle">

                          <div class="valid-text">
                            This OTP is valid for
                            <span>5 minutes</span>
                          </div>

                        </td>

                      </tr>
                    </table>

                  </td>

                </tr>
              </table>

              <!-- DIVIDER -->
              <div class="divider"></div>

              <!-- INFO -->
              <table class="info-wrap">
                <tr>

                  <td width="56" valign="top">

                    <div class="info-icon">
                      ✅
                    </div>

                  </td>

                  <td align="left">

                    <h3 class="info-title">
                      Didn't request this?
                    </h3>

                    <p class="info-text">
                      If you did not sign up for this account,
                      you can safely ignore this email.
                    </p>

                  </td>

                </tr>
              </table>

              <!-- FOOTER -->
              <div class="footer-box">

                <p class="footer-title">
                  Thank you for choosing
                  <span>Adstorx</span>
                </p>

                <p class="copyright">
                  © 2025 Adstorx. All rights reserved.
                </p>

              </div>

              <!-- BOTTOM -->
              <div class="bottom">

                <span class="bottom-item">
                  🛡️ Secure & Trusted
                </span>

                <span class="bottom-item">
                  ⚡ Instant Access
                </span>

                <span class="bottom-item">
                  🎧 24/7 Support
                </span>

              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

/* ============================================================
   ACCOUNT VERIFICATION OTP
============================================================ */
exports.sendAccountVerificationOTP = async (email, otp) => {
  try {

    await transporter.sendMail({
      from: `"Adstorx" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Account",

      html: emailWrapper({
        title: "Verify Your Account",
        subtitle:
          "Use the OTP below to verify your account and complete signup.",
        otp,
        icon: "🔒",
        accent: "#5b42ff",
      }),
    });

    return true;

  } catch (err) {

    console.log("Verification OTP Error:", err);
    return false;

  }
};

/* ============================================================
   WITHDRAWAL OTP
============================================================ */
exports.sendWithdrawalOTP = async (email, otp, amount) => {
  try {

    await transporter.sendMail({
      from: `"Adstorx" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Withdrawal OTP Verification",

      html: emailWrapper({
        title: "Withdrawal Verification",
        subtitle:
          "Confirm your withdrawal request of ₹" + amount,
        otp,
        icon: "💸",
        accent: "#2563eb",
        warningText:
          "⚠️ If you did not request this withdrawal contact support.",
      }),
    });

    return true;

  } catch (err) {

    console.log("Withdrawal OTP Error:", err);
    return false;

  }
};

/* ============================================================
   RESET PASSWORD OTP
============================================================ */
exports.sendResetPasswordOTP = async (email, otp) => {
  try {

    await transporter.sendMail({
      from: `"Adstorx" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password",

      html: emailWrapper({
        title: "Reset Password",
        subtitle:
          "Use the OTP below to reset your password securely.",
        otp,
        icon: "🔑",
        accent: "#7c3aed",
        warningText:
          "⚠️ If you did not request a password reset ignore this email.",
      }),
    });

    return true;

  } catch (err) {

    console.log("Reset Password OTP Error:", err);
    return false;

  }
};