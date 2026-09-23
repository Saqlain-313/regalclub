import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../hooks/toast";
import {
  changePassword,
  clearError,
  clearMessage,
  logout,
} from "../redux/slices/authSlice";

export default function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReloginNotice, setShowReloginNotice] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const reloginTimerRef = useRef(null);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    return () => {
      dispatch(clearMessage());
      dispatch(clearError());
      if (reloginTimerRef.current) {
        clearTimeout(reloginTimerRef.current);
      }
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "newPassword") checkPasswordStrength(value);
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.currentPassword)
      errors.currentPassword = "Current password is required";
    else if (form.currentPassword.length < 6)
      errors.currentPassword = "Password must be at least 6 characters";
    if (!form.newPassword) errors.newPassword = "New password is required";
    else if (form.newPassword.length < 8)
      errors.newPassword = "Password must be at least 8 characters";
    else if (!passwordStrength.hasUpperCase)
      errors.newPassword =
        "Password must contain at least one uppercase letter";
    else if (!passwordStrength.hasNumber)
      errors.newPassword = "Password must contain at least one number";
    else if (!passwordStrength.hasSpecialChar)
      errors.newPassword =
        "Password must contain at least one special character";
    if (!form.confirmPassword)
      errors.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const result = await dispatch(
        changePassword({
          oldPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      ).unwrap();

      showSuccessToast(
        "Password Changed",
        result?.message || "Password changed successfully!",
      );

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStrength({
        minLength: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });

      // 5 second baad relogin notice dikhao
      reloginTimerRef.current = setTimeout(() => {
        setShowReloginNotice(true);
      }, 5000);
    } catch (err) {
      showErrorToast("Change Failed", err || "Failed to change password");
    }
  };

  const handleReset = () => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setFormErrors({});
    setPasswordStrength({
      minLength: false,
      hasUpperCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    });
    dispatch(clearError());
    dispatch(clearMessage());
  };

  const handleReloginConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
    } catch (err) {
      // logout API fail bhi ho to local session clear karke login pe bhej dete hain
    } finally {
      setIsLoggingOut(false);
      setShowReloginNotice(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0B0410]">
      <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-5">
        {/* Header Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] flex items-center justify-center text-white flex-shrink-0">
            <Lock size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Change Password
            </h2>
            <p className="text-sm text-gray-400">Keep your account secure</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#1C0F2B] border border-[#2a1b3d] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-4 sm:p-6 md:p-8">
          {/* Security Recommendation */}
          <div className="mb-5 sm:mb-6 flex items-start gap-3 rounded-xl bg-[#9B59B6]/10 border border-[#9B59B6]/30 p-3 sm:p-4">
            <ShieldCheck
              className="text-[#9B59B6] flex-shrink-0 mt-0.5"
              size={18}
            />
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Security Tip
              </h3>
              <p className="text-sm text-gray-400">
                8+ characters with uppercase, number & special character
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Current Password */}
            <div>
              <label className="block mb-1.5 font-medium text-gray-300 text-sm sm:text-base">
                Current Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className={`w-full h-11 sm:h-12 rounded-xl border ${
                    formErrors.currentPassword
                      ? "border-red-500/50"
                      : "border-[#2a1b3d]"
                  } bg-[#12061C] text-white px-4 pr-11 text-sm sm:text-base focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/20 outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.currentPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block mb-1.5 font-medium text-gray-300 text-sm sm:text-base">
                New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={`w-full h-11 sm:h-12 rounded-xl border ${
                    formErrors.newPassword
                      ? "border-red-500/50"
                      : "border-[#2a1b3d]"
                  } bg-[#12061C] text-white px-4 pr-11 text-sm sm:text-base focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/20 outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.newPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-1.5 font-medium text-gray-300 text-sm sm:text-base">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className={`w-full h-11 sm:h-12 rounded-xl border ${
                    formErrors.confirmPassword
                      ? "border-red-500/50"
                      : "border-[#2a1b3d]"
                  } bg-[#12061C] text-white px-4 pr-11 text-sm sm:text-base focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/20 outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Strength Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  passwordStrength.minLength
                    ? "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                    : "bg-[#12061C] text-gray-500 border-[#2a1b3d]"
                }`}
              >
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">8+ chars</span>
              </div>
              <div
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  passwordStrength.hasUpperCase
                    ? "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                    : "bg-[#12061C] text-gray-500 border-[#2a1b3d]"
                }`}
              >
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  Uppercase
                </span>
              </div>
              <div
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  passwordStrength.hasNumber
                    ? "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                    : "bg-[#12061C] text-gray-500 border-[#2a1b3d]"
                }`}
              >
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Number</span>
              </div>
              <div
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  passwordStrength.hasSpecialChar
                    ? "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                    : "bg-[#12061C] text-gray-500 border-[#2a1b3d]"
                }`}
              >
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Special</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 h-11 sm:h-12 rounded-xl border border-[#2a1b3d] bg-[#12061C] text-gray-300 font-semibold hover:bg-[#2a1b3d] hover:text-white transition text-sm sm:text-base px-4"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 h-11 sm:h-12 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-bold transition text-sm sm:text-base px-4 ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Updating...</span>
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Relogin Notice Modal */}
      {showReloginNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] w-full max-w-xs p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
            <div className="w-14 h-14 rounded-full border border-[#9B59B6]/40 bg-[#9B59B6]/15 flex items-center justify-center mx-auto mb-3">
              <LogOut size={22} className="text-[#9B59B6]" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Please Login Again
            </h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Your password has been updated. For the changes to take effect,
              you need to log in again.
            </p>

            <button
              onClick={handleReloginConfirm}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-bold text-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Logging out...
                </>
              ) : (
                "OK"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
