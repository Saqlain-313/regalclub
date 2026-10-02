import { toast } from "react-toastify";
import "./../styles/premium-toast.css";

/* =====================================================
   PURPLE RING TOAST — existing toast system redesign
   Same library (react-toastify), same triggers, same
   messages. Only the popup UI is restyled.
===================================================== */

/* =====================================================
   MESSAGE SANITIZER
   Raw technical errors (JSON parse errors, [object Object],
   stack traces) should never reach the user. Convert them
   into a clean, friendly message.
===================================================== */

const friendlyMessage = (message) => {
  if (message === null || message === undefined) return "";

  let text = typeof message === "string" ? message : "";

  if (!text && typeof message === "object") {
    text =
      message.message ||
      message.error?.message ||
      message.error ||
      JSON.stringify(message);
  }

  text = String(text).trim();

  // Hide raw technical errors from the user
  if (
    /unexpected token/i.test(text) ||
    /is not valid json/i.test(text) ||
    /json parse/i.test(text) ||
    /\[object object\]/i.test(text) ||
    /^{"|\[{"/i.test(text.slice(0, 2)) ||
    text.length > 220
  ) {
    return "Something went wrong. Please try again.";
  }

  return text;
};

/* ---------------- RING + CONTENT ---------------- */

const ToastContent = ({ title, message, accent }) => {
  const cleanMessage = friendlyMessage(message);

  return (
    <div className="pr-toast-body">
      {/* Animated conic-gradient ring with status icon */}
      <div className="pr-toast-ring">
        <div className="pr-toast-ring-inner">
          <span className={`pr-toast-icon pr-toast-icon--${accent.kind}`}>
            {accent.iconChar}
          </span>
        </div>
      </div>

      {/* Title + message */}
      <div className="pr-toast-text">
        {title ? <p className="pr-toast-title">{title}</p> : null}
        {cleanMessage && <p className="pr-toast-message">{cleanMessage}</p>}
      </div>
    </div>
  );
};

const ACCENTS = {
  success: {
    kind: "success",
    iconChar: "✓",
    className: "premium-toast premium-toast--success",
  },
  error: {
    kind: "error",
    iconChar: "×",
    className: "premium-toast premium-toast--error",
  },
  info: {
    kind: "info",
    iconChar: "i",
    className: "premium-toast premium-toast--info",
  },
  warning: {
    kind: "warning",
    iconChar: "!",
    className: "premium-toast premium-toast--warning",
  },
};

/* ---------------- BASE OPTIONS ---------------- */

const baseOptions = {
  position: "top-right",
  autoClose: 4000,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: false,
  icon: false,
};

/* ---------------- SHOW FUNCTIONS (same API as before) ---------------- */

export const showSuccessToast = (title, message) => {
  const accent = ACCENTS.success;
  toast(
    <ToastContent title={title} message={message} accent={accent} />,
    {
      ...baseOptions,
      className: accent.className,
    },
  );
};

export const showErrorToast = (title, message) => {
  const accent = ACCENTS.error;
  toast(
    <ToastContent title={title} message={message} accent={accent} />,
    {
      ...baseOptions,
      className: accent.className,
    },
  );
};

export const showInfoToast = (title, message) => {
  const accent = ACCENTS.info;
  toast(
    <ToastContent title={title} message={message} accent={accent} />,
    {
      ...baseOptions,
      className: accent.className,
    },
  );
};

export const showWarningToast = (title, message) => {
  const accent = ACCENTS.warning;
  toast(
    <ToastContent title={title} message={message} accent={accent} />,
    {
      ...baseOptions,
      className: accent.className,
    },
  );
};

/* =====================================================
   PLAIN toast.success / toast.error / toast.info CALLS
   Lots of older pages call react-toastify directly with a
   plain string. Patch the default export so those get the
   same Purple Ring design and a guaranteed auto-close.
===================================================== */

const plainToPremium = (kind) => (content) => {
  const accent = ACCENTS[kind] || ACCENTS.info;
  const message =
    typeof content === "string"
      ? content
      : String(content?.props?.children || content || "");

  toast(<ToastContent title="" message={message} accent={accent} />, {
    ...baseOptions,
    className: accent.className,
  });
};

toast.success = plainToPremium("success");
toast.error = plainToPremium("error");
toast.info = plainToPremium("info");
toast.warning = plainToPremium("warning");
