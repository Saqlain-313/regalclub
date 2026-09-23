import {
  ChevronDown,
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearError, register } from "../redux/slices/authSlice";

const countries = [
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "AE", name: "UAE", flag: "🇦🇪", dialCode: "+971" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dialCode: "+880" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dialCode: "+977" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, success, message } = useSelector(
    (state) => state.auth,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    country: "IN",
    termsAccepted: false,
  });

  const [formErrors, setFormErrors] = useState({});

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const inputWrapper = (hasError) =>
    `flex items-center border ${
      hasError
        ? "border-red-500/60"
        : "border-[#2a1b3d] focus-within:border-[#B45CFF]/60"
    } rounded-full h-10 bg-[#0B0410] transition-colors`;

  const selectedCountry = countries.find(
    (country) => country.code === formData.country,
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const refCode = queryParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode.toUpperCase() }));
    }
  }, [location.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const handleCountrySelect = (countryCode) => {
    setFormData((prev) => ({ ...prev, country: countryCode }));
    setShowCountryDropdown(false);
    if (formErrors.country) {
      setFormErrors((prev) => ({ ...prev, country: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else {
      const mobileDigits = formData.mobile.replace(/\D/g, "");
      if (formData.country === "IN" && !/^[0-9]{10}$/.test(mobileDigits)) {
        errors.mobile = "Please enter a valid 10-digit mobile number";
      } else if (
        formData.country === "BD" &&
        !/^[0-9]{10}$/.test(mobileDigits)
      ) {
        errors.mobile = "Please enter a valid 10-digit mobile number";
      } else if (
        formData.country === "AE" &&
        !/^[0-9]{9}$/.test(mobileDigits)
      ) {
        errors.mobile = "Please enter a valid 9-digit mobile number";
      } else if (
        formData.country === "PK" &&
        !/^[0-9]{10}$/.test(mobileDigits)
      ) {
        errors.mobile = "Please enter a valid 10-digit mobile number";
      } else if (
        formData.country === "NP" &&
        !/^[0-9]{10}$/.test(mobileDigits)
      ) {
        errors.mobile = "Please enter a valid 10-digit mobile number";
      } else if (
        formData.country === "AU" &&
        !/^4[0-9]{8}$/.test(mobileDigits)
      ) {
        errors.mobile =
          "Please enter a valid 9-digit Australian mobile number starting with 4";
      }
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = "You must accept the Terms & Conditions";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData = {
      name: formData.name.trim().toLowerCase(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      country: formData.country,
      countryCode: selectedCountry.dialCode,
      referralCode: formData.referralCode.trim().toUpperCase() || undefined,
    };

    try {
      const result = await dispatch(register(userData)).unwrap();
      console.log("Registration successful:", result);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Registration failed:", err);
      const errorElement = document.querySelector(".error-message");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="bg-[#0B0410] flex justify-center items-start p-3 md:p-6">
      <div className="w-full max-w-md relative">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-24 -right-20 w-64 h-64 bg-[#9B59B6]/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -left-20 w-56 h-56 bg-[#B45CFF]/15 rounded-full blur-3xl" />

        {/* Welcome Banner */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/40 px-3 py-1 text-[11px] font-bold text-[#C77AFF] backdrop-blur-sm">
            <Sparkles size={12} className="text-[#B45CFF]" />
            WELCOME
          </span>
          <h1 className="mt-2 max-w-[75%] text-xl font-black leading-tight text-white">
            Join us & start winning today
          </h1>
          <p className="mt-1 max-w-[75%] text-xs font-medium text-gray-400">
            Create your free account in under a minute
          </p>
        </div>

        {/* Form Card */}
        <div className="relative z-10 mt-4 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full border border-[#B45CFF]/40 bg-[#B45CFF]/10 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-[#B45CFF]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Create your account
              </h3>
              <p className="text-gray-400 text-[11px]">
                Fill in your details below
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {formData.referralCode && (
              <div className="p-2.5 bg-[#9B59B6]/10 border border-[#9B59B6]/40 rounded-xl text-[#C77AFF] text-xs flex items-center gap-2">
                <Gift size={14} className="text-[#B45CFF] flex-shrink-0" />
                <span className="flex-1">
                  <strong>Referral code applied:</strong>{" "}
                  {formData.referralCode}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, referralCode: "" }))
                  }
                  className="text-[#B45CFF] hover:text-[#C77AFF]"
                >
                  ✕
                </button>
              </div>
            )}

            {error && (
              <div className="error-message p-2.5 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs flex items-center justify-between">
                <span>
                  <strong>Error:</strong> {error}
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(clearError())}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            )}

            {success && message && (
              <div className="p-2.5 bg-[#00E676]/10 border border-[#00E676]/40 rounded-xl text-[#00E676] text-xs">
                <strong>Success!</strong> {message}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Full Name
              </label>
              <div className={`${inputWrapper(formErrors.name)} px-3.5`}>
                <User size={14} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="bg-transparent flex-1 outline-none px-2 text-sm text-white placeholder-gray-500"
                />
              </div>
              {formErrors.name && (
                <p className="text-red-400 text-[11px] mt-0.5 ml-1">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Mobile Number
              </label>
              <div className="relative" ref={countryDropdownRef}>
                <div className={`${inputWrapper(formErrors.mobile)} pr-3.5`}>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-1 pl-3.5 pr-2 h-full flex-shrink-0 border-r border-[#2a1b3d]"
                  >
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="text-xs font-semibold text-gray-300">
                      {selectedCountry.dialCode}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-gray-500 transition-transform ${
                        showCountryDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <Phone
                    size={14}
                    className="text-gray-500 flex-shrink-0 ml-2"
                  />
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className="bg-transparent flex-1 outline-none px-2 text-sm text-white placeholder-gray-500 min-w-0"
                  />
                </div>

                {/* Country Dropdown */}
                {showCountryDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-[#1C0F2B] border border-[#2a1b3d] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] max-h-56 overflow-auto">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country.code)}
                        className={`w-full flex items-center px-3.5 py-2.5 hover:bg-[#2a1b3d] transition-colors ${
                          formData.country === country.code
                            ? "bg-[#9B59B6]/10"
                            : ""
                        }`}
                      >
                        <span className="text-lg mr-2.5">{country.flag}</span>
                        <span className="flex-1 text-left text-sm text-white">
                          {country.name}
                        </span>
                        <span className="text-xs text-gray-400 mr-2">
                          {country.dialCode}
                        </span>
                        {formData.country === country.code && (
                          <span className="text-[#B45CFF]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {formErrors.mobile && (
                <p className="text-red-400 text-[11px] mt-0.5 ml-1">
                  {formErrors.mobile}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Email Address
              </label>
              <div className={`${inputWrapper(formErrors.email)} px-3.5`}>
                <Mail size={14} className="text-gray-500 flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="bg-transparent flex-1 outline-none px-2 text-sm text-white placeholder-gray-500"
                />
              </div>
              {formErrors.email && (
                <p className="text-red-400 text-[11px] mt-0.5 ml-1">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Password
              </label>
              <div className={`${inputWrapper(formErrors.password)} px-3.5`}>
                <Lock size={14} className="text-gray-500 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="bg-transparent flex-1 outline-none px-2 text-sm text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-[#B45CFF] transition-colors flex-shrink-0"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-400 text-[11px] mt-0.5 ml-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Confirm Password
              </label>
              <div
                className={`${inputWrapper(formErrors.confirmPassword)} px-3.5`}
              >
                <Lock size={14} className="text-gray-500 flex-shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="bg-transparent flex-1 outline-none px-2 text-sm text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-500 hover:text-[#B45CFF] transition-colors flex-shrink-0"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-400 text-[11px] mt-0.5 ml-1">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Referral Code (Optional)
              </label>
              <div className={`${inputWrapper(false)} px-3.5`}>
                <Gift size={14} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Enter referral code (if any)"
                  className="bg-transparent flex-1 outline-none px-2 text-sm text-white placeholder-gray-500"
                  maxLength="10"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className={`mt-0.5 w-4 h-4 accent-[#B45CFF] ${
                  formErrors.termsAccepted
                    ? "outline outline-1 outline-red-400"
                    : ""
                } rounded`}
              />
              <div>
                <p className="text-[11px] text-gray-400">
                  I agree to the{" "}
                  <span className="text-[#B45CFF] font-semibold cursor-pointer hover:underline">
                    Terms &amp; Conditions
                  </span>{" "}
                  &{" "}
                  <span className="text-[#B45CFF] font-semibold cursor-pointer hover:underline">
                    Privacy Policy
                  </span>
                </p>
                {formErrors.termsAccepted && (
                  <p className="text-red-400 text-[11px] mt-0.5">
                    {formErrors.termsAccepted}
                  </p>
                )}
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className={`h-11 rounded-full w-full ${purpleGradient} text-white font-bold text-sm tracking-wide transition-all duration-300 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? "REGISTERING..." : "REGISTER"}
            </button>

            {/* Secure Registration */}
            <div className="rounded-2xl border border-[#2a1b3d] bg-[#0B0410] p-3 flex gap-2.5 items-center">
              <div className="w-9 h-9 rounded-full border border-[#B45CFF]/40 bg-[#B45CFF]/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={17} className="text-[#B45CFF]" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">
                  100% Secure Registration
                </h4>
                <p className="text-gray-400 text-[11px]">
                  Your data is encrypted and always protected.
                </p>
              </div>
            </div>

            <p className="text-center text-gray-400 text-xs pb-1">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#B45CFF] font-semibold hover:text-[#C77AFF] hover:underline transition-colors"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
