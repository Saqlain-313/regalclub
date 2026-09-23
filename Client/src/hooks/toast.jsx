import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Info,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

// ================= PREMIUM TOAST CONTENT (TOPX THEME) =================

const ToastContent = ({ icon: Icon, title, message, accent }) => (
  <div className="flex items-start gap-3">
    <div
      className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${accent.iconBg} ${accent.iconBorder}`}
    >
      <Icon size={18} className={accent.iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-bold text-white">{title}</p>
        {accent.showCrown && (
          <Crown size={12} className="text-[#B45CFF] flex-shrink-0" />
        )}
      </div>
      {message && (
        <p className="text-xs text-gray-400 mt-0.5 break-words">{message}</p>
      )}
    </div>
  </div>
);

const ACCENTS = {
  success: {
    iconBg: "bg-[#00E676]/15",
    iconBorder: "border-[#00E676]/40",
    iconColor: "text-[#00E676]",
    showCrown: true,
    className: "premium-toast premium-toast--success",
    progressClassName: "premium-toast-progress premium-toast-progress--success",
  },
  error: {
    iconBg: "bg-red-500/15",
    iconBorder: "border-red-500/40",
    iconColor: "text-red-400",
    showCrown: false,
    className: "premium-toast premium-toast--error",
    progressClassName: "premium-toast-progress premium-toast-progress--error",
  },
  info: {
    iconBg: "bg-[#9B59B6]/15",
    iconBorder: "border-[#9B59B6]/40",
    iconColor: "text-[#C77AFF]",
    showCrown: false,
    className: "premium-toast premium-toast--info",
    progressClassName: "premium-toast-progress",
  },
  warning: {
    iconBg: "bg-[#F1C40F]/15",
    iconBorder: "border-[#F1C40F]/40",
    iconColor: "text-[#F1C40F]",
    showCrown: false,
    className: "premium-toast premium-toast--warning",
    progressClassName: "premium-toast-progress premium-toast-progress--warning",
  },
};

const baseOptions = {
  position: "top-center",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  icon: false,
};

export const showSuccessToast = (title, message) => {
  const accent = ACCENTS.success;
  toast(
    <ToastContent
      icon={CheckCircle2}
      title={title}
      message={message}
      accent={accent}
    />,
    {
      ...baseOptions,
      className: accent.className,
      progressClassName: accent.progressClassName,
    },
  );
};

export const showErrorToast = (title, message) => {
  const accent = ACCENTS.error;
  toast(
    <ToastContent
      icon={XCircle}
      title={title}
      message={message}
      accent={accent}
    />,
    {
      ...baseOptions,
      autoClose: 4500,
      className: accent.className,
      progressClassName: accent.progressClassName,
    },
  );
};

export const showInfoToast = (title, message) => {
  const accent = ACCENTS.info;
  toast(
    <ToastContent
      icon={Info}
      title={title}
      message={message}
      accent={accent}
    />,
    {
      ...baseOptions,
      className: accent.className,
      progressClassName: accent.progressClassName,
    },
  );
};

export const showWarningToast = (title, message) => {
  const accent = ACCENTS.warning;
  toast(
    <ToastContent
      icon={AlertTriangle}
      title={title}
      message={message}
      accent={accent}
    />,
    {
      ...baseOptions,
      className: accent.className,
      progressClassName: accent.progressClassName,
    },
  );
};
