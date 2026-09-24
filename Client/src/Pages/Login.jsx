import { Eye, EyeOff, Lock, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../hooks/toast";
import { clearError, login } from "../redux/slices/authSlice";

const HERO_IMAGE =
  "https://i.ibb.co/1t9xywcJ/Whats-App-Image-2026-09-23-at-16-22-36-removebg-preview.png";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    country: "IN",
  });

  const [formErrors, setFormErrors] = useState({});

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let inputValue = value;

    if (name === "mobile") {
      inputValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (dispatch) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else {
      const mobileDigits = formData.mobile.replace(/\D/g, "");

      if (!/^[0-9]{10}$/.test(mobileDigits)) {
        errors.mobile = "Please enter a valid 10-digit mobile number";
      }
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      mobile: formData.mobile.trim(),
      password: formData.password,
      country: formData.country,
    };

    try {
      const result = await dispatch(login(userData)).unwrap();
      showSuccessToast("Login Successful", result?.message || "Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      showErrorToast("Login Failed", err || "Invalid mobile or password");
    }
  };

  return (
    <div className="bg-[#0B0410] flex justify-center items-start md:items-center p-3 md:p-6">
      <div className="w-full max-w-md bg-[#1C0F2B] rounded-3xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Decorative purple glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 bg-[#9B59B6]/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 bg-[#B45CFF]/15 rounded-full blur-3xl" />

        {/* Hero */}
        <div className="relative z-10 text-center pt-2">
          <img
            src={HERO_IMAGE}
            alt="WINZOX"
            className="w-56 mx-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          <h2 className="text-2xl font-bold text-white mt-3">Welcome Back!</h2>

          <p className="text-sm text-gray-400 mt-0.5">
            Login to continue your winning journey
          </p>
        </div>

        {/* Form Card */}
        <div className="relative z-10 mt-6 rounded-2xl border border-[#2a1b3d] bg-[#12061C] p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full border border-[#B45CFF]/40 bg-[#B45CFF]/10 flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-[#B45CFF]" />
            </div>

            <div>
              <h3 className="font-bold text-base text-white">
                Login to your account
              </h3>

              <p className="text-gray-400 text-xs">Enter your details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Number */}
            <div>
              <label className="text-sm font-bold block mb-1.5 text-gray-300">
                Mobile Number
              </label>

              <div
                className={`flex items-center border ${
                  formErrors.mobile
                    ? "border-red-500/60"
                    : "border-[#2a1b3d] focus-within:border-[#B45CFF]/60"
                } rounded-full px-4 h-12 bg-[#0B0410] transition-colors`}
              >
                <Phone size={16} className="text-gray-500 flex-shrink-0" />

                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  className="bg-transparent flex-1 outline-none px-2.5 text-sm text-white placeholder-gray-500"
                />
              </div>

              {formErrors.mobile && (
                <p className="text-red-400 text-xs mt-1 ml-1">
                  {formErrors.mobile}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-bold block mb-1.5 text-gray-300">
                Password
              </label>

              <div
                className={`flex items-center border ${
                  formErrors.password
                    ? "border-red-500/60"
                    : "border-[#2a1b3d] focus-within:border-[#B45CFF]/60"
                } rounded-full px-4 h-12 bg-[#0B0410] transition-colors`}
              >
                <Lock size={16} className="text-gray-500 flex-shrink-0" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="bg-transparent flex-1 outline-none px-2.5 text-sm text-white placeholder-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-[#B45CFF] transition-colors flex-shrink-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {formErrors.password && (
                <p className="text-red-400 text-xs mt-1 ml-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-[#B45CFF] text-sm font-semibold hover:text-[#C77AFF] hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`h-12 rounded-full w-full ${purpleGradient} text-white font-bold text-base tracking-wide transition-all duration-300 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>

            {/* Secure Login */}
            <div className="rounded-2xl border border-[#2a1b3d] bg-[#0B0410] p-4 flex gap-3 items-center">
              <div className="w-11 h-11 rounded-full border border-[#B45CFF]/40 bg-[#B45CFF]/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-[#B45CFF]" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">
                  100% Secure Login
                </h4>

                <p className="text-gray-400 text-xs">
                  Your data is encrypted and always protected with us.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
