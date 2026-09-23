import {
  BadgeCheck,
  Calendar,
  Camera,
  Copy,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearError,
  clearMessage,
  getProfile,
  updateProfile,
} from "../redux/slices/authSlice";

// ======================================================
// CURRENCY SYMBOL
// ======================================================

const getCurrencySymbol = (country) => {
  const symbols = {
    IN: "₹",
    NP: "रु",
    PK: "Rs",
    AU: "$",
    CA: "$",
    default: "₹",
  };

  return symbols[country] || symbols.default;
};

// ======================================================
// COUNTRY PHONE CONFIG
// ======================================================

const getCountryPhoneConfig = (countryCode) => {
  const config = {
    IN: {
      countryCode: "+91",
      length: 10,
      pattern: /^[6-9]\d{9}$/,
      errorMessage: "Please enter a valid 10-digit Indian mobile number",
      placeholder: "9876543210",
    },
    NP: {
      countryCode: "+977",
      length: 10,
      pattern: /^[9][6-9]\d{8}$/,
      errorMessage: "Please enter a valid 10-digit Nepali mobile number",
      placeholder: "9812345678",
    },
    PK: {
      countryCode: "+92",
      length: 10,
      pattern: /^[3]\d{9}$/,
      errorMessage: "Please enter a valid 10-digit Pakistani mobile number",
      placeholder: "3012345678",
    },
    AU: {
      countryCode: "+61",
      length: 9,
      pattern: /^[4]\d{8}$/,
      errorMessage: "Please enter a valid 9-digit Australian mobile number",
      placeholder: "412345678",
    },
    CA: {
      countryCode: "+1",
      length: 10,
      pattern: /^[2-9]\d{9}$/,
      errorMessage: "Please enter a valid 10-digit Canadian mobile number",
      placeholder: "4165551234",
    },
    US: {
      countryCode: "+1",
      length: 10,
      pattern: /^[2-9]\d{9}$/,
      errorMessage: "Please enter a valid 10-digit US mobile number",
      placeholder: "2125551234",
    },
    default: {
      countryCode: "+91",
      length: 10,
      pattern: /^[0-9]{10}$/,
      errorMessage: "Please enter a valid 10-digit mobile number",
      placeholder: "Enter mobile number",
    },
  };

  return config[countryCode] || config.default;
};

// ======================================================
// COMPONENT
// ======================================================

export default function ProfileContent({
  formatCurrency: propFormatCurrency,
  currencySymbol: propCurrencySymbol,
}) {
  const dispatch = useDispatch();

  const { user, loading, error, profileLoaded } = useSelector(
    (state) => state.auth,
  );

  // ======================================================
  // CURRENCY
  // ======================================================

  const currencySymbol = propCurrencySymbol || getCurrencySymbol(user?.country);

  const formatCurrency =
    propFormatCurrency ||
    ((amount) =>
      `${currencySymbol}${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`);

  // ======================================================
  // COUNTRY PHONE CONFIG
  // ======================================================

  const phoneConfig = getCountryPhoneConfig(user?.country || "IN");

  // ======================================================
  // PROFILE STATE
  // ======================================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    referralCode: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [updateStatus, setUpdateStatus] = useState(null);

  // ======================================================
  // PROFILE IMAGE STATE
  // ======================================================

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  // ======================================================
  // GET PROFILE
  // ======================================================

  useEffect(() => {
    if (!profileLoaded && !loading) {
      dispatch(getProfile());
    }
  }, [dispatch, profileLoaded, loading]);

  // ======================================================
  // SET PROFILE DATA
  // ======================================================

  useEffect(() => {
    if (user && !loading) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        city: user.city || "",
        referralCode: user.referralCode || "",
      });
    }
  }, [user, loading]);

  // ======================================================
  // ACCOUNT AGE
  // ======================================================

  const calculateAccountAge = () => {
    if (!user?.createdAt) return "N/A";

    const createdDate = new Date(user.createdAt);
    const today = new Date();

    const diffTime = Math.abs(today - createdDate);

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} Days`;
  };

  // ======================================================
  // STATS
  // ======================================================

  const stats = [
    {
      title: "Available credit",
      value: formatCurrency(user?.credit || 0),
      icon: WalletCards,
      color: "text-[#9B59B6]",
    },
    {
      title: "Wallet credit",
      value: formatCurrency(user?.credit || 0),
      icon: Wallet,
      color: "text-[#00E676]",
    },
    {
      title: "Referral Earnings",
      value: formatCurrency(user?.referralEarning || 0),
      icon: Users,
      color: "text-[#3498DB]",
    },
    {
      title: "Total Referrals",
      value: user?.totalReferrals || 0,
      icon: Users,
      color: "text-[#B45CFF]",
    },
    {
      title: "Account Age",
      value: calculateAccountAge(),
      icon: Calendar,
      color: "text-[#E91E63]",
    },
  ];

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      dispatch(clearError());
    }

    setUpdateStatus(null);
  };

  // ======================================================
  // HANDLE MOBILE CHANGE (with country code prefix)
  // ======================================================

  const handleMobileChange = (e) => {
    const rawValue = e.target.value;

    let value = rawValue;
    if (value.startsWith(phoneConfig.countryCode)) {
      value = value.substring(phoneConfig.countryCode.length).trim();
    }

    value = value.replace(/\D/g, "");

    value = value.slice(0, phoneConfig.length);

    setProfile((prev) => ({
      ...prev,
      mobile: value,
    }));

    if (formErrors.mobile) {
      setFormErrors((prev) => ({
        ...prev,
        mobile: "",
      }));
    }

    if (error) {
      dispatch(clearError());
    }

    setUpdateStatus(null);
  };

  // ======================================================
  // IMAGE CHANGE
  // ======================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUpdateStatus({
        type: "error",
        message: "Please select a valid image file.",
      });

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUpdateStatus({
        type: "error",
        message: "Image size must be less than 5MB.",
      });

      e.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setUpdateStatus(null);
  };

  // ======================================================
  // VALIDATE FORM
  // ======================================================

  const validateForm = () => {
    const errors = {};

    if (!profile.name.trim()) {
      errors.name = "Full name is required";
    } else if (profile.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!profile.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    const cleanMobile = profile.mobile.replace(/\D/g, "");

    if (!profile.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (cleanMobile.length !== phoneConfig.length) {
      errors.mobile = `Mobile number must be ${phoneConfig.length} digits`;
    } else if (!phoneConfig.pattern.test(cleanMobile)) {
      errors.mobile = phoneConfig.errorMessage;
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsEditing(true);
    setUpdateStatus(null);

    try {
      const formData = new FormData();

      formData.append("fullName", profile.name.trim());
      formData.append("email", profile.email.trim());

      const cleanMobile = profile.mobile.replace(/\D/g, "");
      formData.append("mobile", cleanMobile);

      formData.append("city", profile.city.trim());

      if (selectedImage) {
        formData.append("profilePic", selectedImage);
      }

      await dispatch(updateProfile(formData)).unwrap();

      setUpdateStatus({
        type: "success",
        message: "Profile updated successfully!",
      });

      setSelectedImage(null);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await dispatch(getProfile());

      dispatch(clearMessage());
    } catch (err) {
      setUpdateStatus({
        type: "error",
        message:
          typeof err === "string"
            ? err
            : err?.message || "Failed to update profile",
      });
    } finally {
      setIsEditing(false);
    }
  };

  // ======================================================
  // RESET
  // ======================================================

  const handleReset = () => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        city: user.city || "",
        referralCode: user.referralCode || "",
      });
    }

    setFormErrors({});
    setUpdateStatus(null);
    setSelectedImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (error) {
      dispatch(clearError());
    }
  };

  // ======================================================
  // COPY REFERRAL
  // ======================================================

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(profile.referralCode || "");

      setUpdateStatus({
        type: "success",
        message: "Referral code copied to clipboard!",
      });

      setTimeout(() => {
        setUpdateStatus(null);
      }, 3000);
    } catch {
      setUpdateStatus({
        type: "error",
        message: "Failed to copy referral code.",
      });
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0410]">
        <div className="text-center">
          <Loader2
            className="animate-spin text-[#B45CFF] mx-auto mb-4"
            size={48}
          />

          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // PROFILE IMAGE
  // ======================================================

  const profileImage =
    imagePreview ||
    user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User",
    )}&background=ffffff&color=amber&size=128`;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0B0410] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* ================================================
            PROFILE HEADER
        ================================================ */}

        <div className="bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-4">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <img
                src={profileImage}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/30 object-cover"
              />

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isEditing}
                className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#7418F5] hover:bg-gray-100 transition disabled:opacity-50"
                title="Change profile picture"
              >
                <Camera size={15} />
              </button>

              {/* Hidden Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                {user?.name || "User"}
              </h2>

              <p className="text-white/80 text-sm truncate">
                UID: WINZOX{user?.userId || "N/A"}
              </p>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <BadgeCheck size={14} className="text-white flex-shrink-0" />

                <span className="text-white/90 text-xs sm:text-sm font-medium">
                  {user?.status === "blocked" ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {selectedImage && (
            <p className="mt-3 text-white/90 text-xs">
              New profile picture selected. Click "Save Changes" to upload it.
            </p>
          )}
        </div>

        {/* ================================================
            STATS
        ================================================ */}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="bg-[#1C0F2B] rounded-xl border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] p-2.5 sm:p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#12061C] flex items-center justify-center flex-shrink-0 border border-[#2a1b3d]">
                    <Icon className={item.color} size={14} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-[10px] sm:text-xs truncate">
                      {item.title}
                    </p>

                    <h2
                      className={`text-xs sm:text-sm font-bold ${item.color} truncate`}
                    >
                      {item.value}
                    </h2>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================================================
            PERSONAL INFORMATION
        ================================================ */}

        <div className="mt-3 sm:mt-4 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <div className="px-4 py-3 sm:py-4 border-b border-[#2a1b3d]">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Personal Information
            </h2>

            <p className="text-gray-400 text-xs sm:text-sm">
              Update your account information.
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Status */}
            {updateStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs sm:text-sm ${
                  updateStatus.type === "success"
                    ? "bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {updateStatus.message}
              </div>
            )}

            <div className="space-y-4">
              {/* ==========================================
                  FULL NAME
              ========================================== */}

              <div>
                <label className="font-semibold text-gray-300 text-xs sm:text-sm">
                  Full Name *
                </label>

                <div className="relative mt-1">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={16}
                  />

                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={isEditing}
                    className={`w-full h-10 rounded-xl border ${
                      formErrors.name ? "border-red-500/50" : "border-[#2a1b3d]"
                    } pl-9 pr-3 bg-[#12061C] text-white focus:border-[#B45CFF]/60 focus:ring-4 focus:ring-[#B45CFF]/20 outline-none text-sm disabled:opacity-60`}
                  />
                </div>

                {formErrors.name && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* ==========================================
                  EMAIL
              ========================================== */}

              <div>
                <label className="font-semibold text-gray-300 text-xs sm:text-sm">
                  Email Address *
                </label>

                <div className="relative mt-1">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={16}
                  />

                  <input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={isEditing}
                    className={`w-full h-10 rounded-xl border ${
                      formErrors.email
                        ? "border-red-500/50"
                        : "border-[#2a1b3d]"
                    } pl-9 pr-3 bg-[#12061C] text-white focus:border-[#B45CFF]/60 focus:ring-4 focus:ring-[#B45CFF]/20 outline-none text-sm disabled:opacity-60`}
                  />
                </div>

                {formErrors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* ==========================================
                  MOBILE - WITH COUNTRY CODE PREFIX
              ========================================== */}

              <div>
                <label className="font-semibold text-gray-300 text-xs sm:text-sm">
                  Mobile Number *
                </label>

                <div className="relative mt-1">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10"
                    size={16}
                    strokeWidth={1.8}
                  />

                  <div
                    className={`flex items-center w-full h-11 rounded-xl border bg-[#12061C] overflow-hidden transition-all ${
                      formErrors.mobile
                        ? "border-red-500/50 focus-within:border-red-500/70 focus-within:ring-4 focus-within:ring-red-500/10"
                        : "border-[#2a1b3d] hover:border-[#9B59B6]/40 focus-within:border-[#B45CFF]/60 focus-within:ring-4 focus-within:ring-[#B45CFF]/20"
                    } ${isEditing ? "bg-[#0B0410]" : ""}`}
                  >
                    {/* Country Code */}
                    <div className="pl-10 pr-3 h-full flex items-center border-r border-[#2a1b3d] bg-[#1C0F2B]">
                      <span className="text-sm font-semibold text-gray-200 whitespace-nowrap">
                        {phoneConfig.countryCode}
                      </span>
                    </div>

                    {/* Phone Number */}
                    <input
                      name="mobile"
                      value={profile.mobile || ""}
                      onChange={handleMobileChange}
                      disabled={isEditing}
                      inputMode="numeric"
                      placeholder={phoneConfig.placeholder}
                      className="flex-1 h-full px-3 bg-transparent outline-none text-sm text-white placeholder:text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>

                  {formErrors.mobile && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {formErrors.mobile}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Country:{" "}
                  <span className="font-medium text-gray-300">
                    {user?.country || "India"}
                  </span>{" "}
                  • Format:{" "}
                  <span className="font-medium text-gray-300">
                    {phoneConfig.countryCode} XXXXXXXXXX
                  </span>
                </p>
              </div>

              {/* ==========================================
                  CITY
              ========================================== */}

              <div>
                <label className="font-semibold text-gray-300 text-xs sm:text-sm">
                  City
                </label>

                <div className="relative mt-1">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={16}
                  />

                  <input
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    disabled={isEditing}
                    className="w-full h-10 rounded-xl border border-[#2a1b3d] pl-9 pr-3 bg-[#12061C] text-white focus:border-[#B45CFF]/60 focus:ring-4 focus:ring-[#B45CFF]/20 outline-none text-sm disabled:opacity-60"
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              {/* ==========================================
                  REFERRAL CODE
              ========================================== */}

              <div>
                <label className="font-semibold text-gray-300 text-xs sm:text-sm">
                  Referral Code
                </label>

                <div className="relative mt-1">
                  <input
                    readOnly
                    value={profile.referralCode}
                    className="w-full h-10 rounded-xl border border-[#2a1b3d] bg-[#0B0410] px-3 pr-12 uppercase font-mono text-sm text-gray-300"
                  />

                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B59B6] hover:text-[#B45CFF] transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* ==========================================
                BUTTONS
            ========================================== */}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={isEditing}
                className="w-full h-10 rounded-xl border border-[#2a1b3d] font-semibold text-gray-300 hover:bg-[#2a1b3d] transition text-sm disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isEditing}
                className={`w-full h-10 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white font-semibold transition text-sm ${
                  isEditing
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:scale-[1.02]"
                }`}
              >
                {isEditing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
