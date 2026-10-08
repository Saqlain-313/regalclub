// components/ChangePassword.jsx
//
// /change-password — same design language as /wallet, /deposit and the
// history pages:
//   back-button header -> security tip card -> form section cards
//   -> gradient submit + pill clear button. All logic unchanged.

import {
  CheckCircle2,
  ChevronLeft,
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

const accentGradient =
  "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_10px_rgba(180,92,255,0.5)]";

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

      // Show the relogin notice after 5 seconds
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
      // Even if the logout API fails, clear the local session and go to login
    } finally {
      setIsLoggingOut(false);
      setShowReloginNotice(false);
      navigate("/login", { replace: true });
    }
  };

  // =============================================
  // PASSWORD FIELD — /deposit input style
  // =============================================

  const PasswordField = ({
    label,
    name,
    value,
    placeholder,
    show,
    onToggle,
    error,
  }) => (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-white">
        <Lock size={13} className="text-[#B45CFF]" />
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border bg-[#12061C] px-3.5 pr-10 text-sm font-semibold text-white placeholder-gray-500 outline-none transition-all focus:border-[#B45CFF]/60 ${
            error ? "border-red-500/50" : "border-[#2a1b3d]"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all hover:text-gray-300"
          aria-label={`Toggle ${label} visibility`}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-red-400">{error}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0410] pb-10">
      <div className="mx-auto max-w-md px-4 pt-4">
        {/* ============================================= */}
        {/* HEADER — back / title / (spacer)              */}
        {/* ============================================= */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-white transition-all active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-white">
            Change Password
          </h1>
          <span className="w-9 flex-shrink-0" />
        </div>

        {/* ============================================= */}
        {/* SECURITY TIP                                  */}
        {/* ============================================= */}
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[#9B59B6]/30 bg-[#9B59B6]/10 p-3.5">
          <ShieldCheck
            size={16}
            className="mt-0.5 flex-shrink-0 text-[#9B59B6]"
          />
          <div>
            <p className="text-xs font-bold text-white">Security Tip</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">
              8+ characters with uppercase, number &amp; special character
            </p>
          </div>
        </div>

        {/* ============================================= */}
        {/* FORM                                          */}
        {/* ============================================= */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={form.currentPassword}
            placeholder="Enter current password"
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            error={formErrors.currentPassword}
          />

          {/* New Password */}
          <PasswordField
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            placeholder="Enter new password"
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            error={formErrors.newPassword}
          />

          {/* Confirm Password */}
          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            placeholder="Confirm new password"
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            error={formErrors.confirmPassword}
          />

          {/* ============================================= */}
          {/* PASSWORD STRENGTH — accent-bar checklist      */}
          {/* ============================================= */}
          <div className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-gradient-to-b from-[#B45CFF] to-[#7418F5]" />
              <h2 className="text-sm font-bold text-white">
                Password requirements
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "minLength", label: "8+ characters" },
                { key: "hasUpperCase", label: "Uppercase" },
                { key: "hasNumber", label: "Number" },
                { key: "hasSpecialChar", label: "Special char" },
              ].map(({ key, label }) => {
                const ok = passwordStrength[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[10px] font-bold transition-all ${
                      ok
                        ? "border-[#00E676]/30 bg-[#00E676]/10 text-[#00E676]"
                        : "border-[#2a1b3d] bg-[#12061C] text-gray-500"
                    }`}
                  >
                    <CheckCircle2 size={12} className="flex-shrink-0" />
                    {label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================= */}
          {/* ACTION BUTTONS — wallet/deposit style         */}
          {/* ============================================= */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-full border border-[#C77AFF]/60 bg-[#1C0F2B] py-3 text-xs font-bold text-[#B45CFF] transition-all hover:bg-[#2a1b3d] active:scale-[0.98]"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl py-3 text-sm font-bold text-white transition-all active:scale-[0.98] ${accentGradient} ${
                loading ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ============================================= */}
      {/* RELOGIN NOTICE MODAL                          */}
      {/* ============================================= */}
      {showReloginNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xs rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#9B59B6]/40 bg-[#9B59B6]/15">
              <LogOut size={22} className="text-[#9B59B6]" />
            </div>

            <h3 className="mb-1 text-base font-bold text-white">
              Please Login Again
            </h3>
            <p className="mb-5 text-[11px] leading-relaxed text-gray-400">
              Your password has been updated. For the changes to take effect,
              you need to log in again.
            </p>

            <button
              onClick={handleReloginConfirm}
              disabled={isLoggingOut}
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${accentGradient}`}
            >
              {isLoggingOut ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="animate-spin" size={16} />
                  Logging out...
                </span>
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
