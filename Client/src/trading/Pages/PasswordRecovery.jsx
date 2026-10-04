import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { ForgetPass, SendOtp } from "../Redux/Reducer/authReducer";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("recovery");
  const [step, setStep] = useState(1);

  // Forgot password form
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    passwordMatchError: "",
    passwordStrengthError: "",
  });

  // OTP state
  const [otp, setOtp] = useState("");
  const [isOtpValid, setIsOtpValid] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log("Recovery email sent to:", email);
    dispatch(SendOtp({email: email})).then((res) => {
      if (res.payload.success) {
        toast.success(res.payload.message);
        setIsEmailSubmitted(true);
        setStep(2); // Move to OTP step
      } else {
        toast.error(res.payload.message);
      }
    })
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    setErrors({
      passwordMatchError: "",
      passwordStrengthError: "",
    });

    

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        passwordMatchError: "Passwords do not match.",
      }));
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setErrors((prev) => ({
        ...prev,
        passwordStrengthError:
          "Password must contain at least 8 characters, 1 number, 1 letter, and 1 special character.",
      }));
      return;
    }

    
    dispatch(ForgetPass({email: email, newPassword: formData.newPassword, otp: otp})).then((res) => {
      if (res?.payload?.success) {
        toast.success(res.payload.message);
        setTimeout(() => {
          navigate('/', { replace: true });
      }, 500); 
      } else {
        toast.error(res.payload.message);
      }
    });

    console.log("Password reset successful!");
    // Here you would send the new password to your server
  };

  const handleOtpChange = (e) => {
    const { value } = e.target;
    // Ensure only numeric values are entered
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
         setIsOtpValid(true);
         setStep(3); 
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <p className="text-gray-200 mb-6 text-center">
              To change your password, please enter the email address you used
              when registering your account
            </p>
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-100 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-[#3a4252] border border-[#4a5466] rounded-md focus:outline-none  text-white placeholder-gray-400"
                  placeholder="Enter your Mail"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <span>Confirm email</span>
                <div className="relative w-6 h-6">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="absolute inset-0"
                  >
                    <circle
                      opacity="0.3"
                      cx="12"
                      cy="12"
                      r="12"
                      transform="rotate(-90 12 12)"
                      fill="currentColor"
                    ></circle>
                    <path
                      d="M12.5497 7.45321L12.1565 7.84628C12.0329 7.9697 11.9645 8.13467 11.9645 8.31028C11.9645 8.48609 12.0329 8.66599 12.1565 8.7894L14.6827 11.3308H6.65668C6.29473 11.3308 6 11.595 6 11.9568V12.513C6 12.8748 6.29473 13.2058 6.65668 13.2058H14.7113L12.1565 15.7421C12.0329 15.8657 11.9645 16.0212 11.9645 16.197C11.9645 16.3726 12.0329 16.533 12.1565 16.6565L12.5497 17.0475C12.8056 17.3033 13.2219 17.3022 13.4778 17.0464L17.8084 12.7153C17.9317 12.5919 18 12.4265 18 12.2494V12.2475C18 12.0718 17.9317 11.9068 17.8084 11.7835L13.4779 7.45321C13.222 7.19721 12.8056 7.19721 12.5497 7.45321Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>
            </form>
            {isEmailSubmitted}
          </>
        );
      case 2: // OTP verification
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-center text-2xl font-semibold text-white mb-6">
              Enter OTP
            </h2>
            <form onSubmit={handleOtpSubmit} className="w-full">
              <div className="flex gap-2 mb-4 justify-center">
                  <input
               type="text"
    id="otp"
    name="otp"
    value={otp}
    onChange={handleOtpChange}
    maxLength={6} // Limit input to 6 digits
    placeholder="Enter 6-digit OTP"
                    className="w-full h-12 text-center text-2xl font-bold bg-[#444b5d] border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
              </div>
              {!isOtpValid && (
                <p className="text-red-500 text-sm mb-4 text-center">
                  Please enter a valid OTP.
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Verify OTP
              </button>
            </form>
          </div>
        );
      case 3: // Password reset
        return (
          <div className="flex flex-col">
            <h2 className="text-center text-2xl font-semibold text-white mb-6">
              Reset Password
            </h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-white"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-white bg-[#444b5d] text-white"
                  placeholder="Enter your new password"
                />
                {errors.passwordStrengthError && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.passwordStrengthError}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-white"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-[0.5px] focus:ring-white bg-[#444b5d] text-white"
                  placeholder="Confirm your new password"
                />
                {errors.passwordMatchError && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.passwordMatchError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Reset Password
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center z-50 p-4 login-bg min-h-[90vh]">
      {/* Title */}
      <div className="p-6">
 
      </div>
      <div className="bg-[#2d3440] rounded-lg shadow-lg w-full max-w-md relative">
      <h2 className="text-2xl font-bold text-center text-white p-2">
          Password Recovery
        </h2>
        {/* Tabs - Disabled during password recovery */}
    

        {/* Recovery Form */}
        <div className="p-6">
          {renderStep()}

          {/* Social Login (only shown on first step) */}
          {step === 1 && <div></div>}
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;
