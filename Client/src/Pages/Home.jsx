import React, { useEffect, useState } from "react";
import { FaArrowRight, FaEye, FaEyeSlash, FaUser, FaLock, FaGlobe, FaMoneyBillWave } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getUser, loginUser, Register, SendOtp } from "../Redux/Reducer/authReducer";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const Home = () => {
  const { userInfo, errorMessage, successMessage, loading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    country: "",
    currency: "USD",
    rememberMe: false,
    rulesAccepted: false,
    notUsCitizen: false
  });
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!isLogin) {
      if (!formData.rulesAccepted || !formData.notUsCitizen) {
        toast.error("Please accept all terms and conditions");
        setIsSubmitting(false);
        return;
      }
      
      dispatch(Register(formData)).then((res) => {
        setIsSubmitting(false);
        if (res?.payload?.success) {
          toast.success(res.payload.message);
          setTimeout(() => {
            navigate('/SideNavbar', { replace: true });
          }, 1000);
        } else {
          toast.error(res.payload.message);
        }
      });
    } else {
      dispatch(SendOtp({ email: formData.email })).then((res) => {
        setIsSubmitting(false);
        if (res?.payload?.success) {
          setShowOtpPopup(true);
        } else {
          toast.error(res.payload.message);
        }
      });
    }
  };

  const handleOtpSubmit = () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }
    
    setIsSubmitting(true);
    const loginDataWithOtp = {
      ...formData,
      otp,
    };
  
    dispatch(loginUser(loginDataWithOtp)).then((res) => {
      setIsSubmitting(false);
      if (res?.payload?.success) {
        dispatch(getUser());
        toast.success(res.payload.message);
        setShowOtpPopup(false);
        setLoader(true);
        setTimeout(() => {
          navigate("/SideNavbar", { replace: true });
        }, 1000);
        setTimeout(() => {
          setLoader(false);
        }, 1500);
      } else {
        toast.error(res.payload.message);
      }
    });
  };

  const handleTabChange = (tab) => {
    setIsLogin(tab);
  };

  return (
    <div className="flex flex-col justify-center items-center login-bg min-h-[90vh] p-4">
      <div className="w-full max-w-md">
        {/* <div className="text-center mb-8 text-white">
          <h2 className=" text-xl md:text-3xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-300 mt-2">
            {isLogin ? "Sign in to continue" : "Get started with your account"}
          </p>
        </div> */}
        
        <div className="bg-[#2d3440] rounded-md shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#3e4655]">
            <button
              className={`flex-1 py-4 font-medium text-center transition-colors ${
                isLogin
                  ? "bg-[#3a4252] text-white border-b-2 border-[#4a8ded]"
                  : "text-gray-400 hover:text-white hover:bg-[#353c4a]"
              }`}
              onClick={() => handleTabChange(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-4 font-medium text-center transition-colors ${
                !isLogin
                  ? "bg-[#3a4252] text-white border-b-2 border-[#4a8ded]"
                  : "text-gray-400 hover:text-white hover:bg-[#353c4a]"
              }`}
              onClick={() => handleTabChange(false)}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdEmail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#3a4252] border border-[#4a5466] rounded-md focus:outline-none  text-white placeholder-gray-400"
                    placeholder="you@gmail.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-[#3a4252] border border-[#4a5466] rounded-md focus:outline-none  text-white placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-400">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-[#1f893f]"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/PasswordRecovery"
                    className="text-sm text-blue-500 underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Registration Fields */}
              {!isLogin && (
                <>
                  {/* Country Field */}
                  <div className="space-y-2">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-300">
                      Country
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaGlobe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                               id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                    className="w-full pl-10 pr-4 py-3 bg-[#3a4252] border border-[#4a5466] rounded-md focus:outline-none  text-white placeholder-gray-400"
                    placeholder="Country"
                  />
                    </div>
                  </div>

                  {/* Currency Field */}
                  <div className="space-y-2">
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-300">
                      Currency
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-[#3a4252] border border-[#4a5466] rounded-md focus:outline-none  text-white appearance-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  {/* Terms Checkboxes */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="rulesAccepted"
                          name="rulesAccepted"
                          type="checkbox"
                          required
                          checked={formData.rulesAccepted}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-[#22c55e] border-gray-600 rounded bg-[#3a4252]"
                        />
                      </div>
                      <label htmlFor="rulesAccepted" className="ml-2 block text-sm text-gray-300">
                        I confirm that I am 18 years old or older and accept the{' '}
                        <a href="#" className="text-blue-400 hover:underline">
                          Terms of Service
                        </a>
                      </label>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notUsCitizen"
                          name="notUsCitizen"
                          type="checkbox"
                          required
                          checked={formData.notUsCitizen}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-[#22c55e] border-gray-600 rounded bg-[#3a4252]"
                        />
                      </div>
                      <label htmlFor="notUsCitizen" className="ml-2 block text-sm text-gray-300">
                        I declare that I am not a citizen or resident of the US for tax purposes
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white ${
                  isSubmitting ? 'bg-[#4a8ded]' : 'bg-[#4a8ded] hover:bg-[#4a8ded]'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a8ded] transition-colors`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Switch between Login/Register */}
            <div className="mt-6 text-center text-sm text-gray-400">
              {isLogin ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => handleTabChange(false)}
                    className="text-blue-500 hover:text-blue-300 font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => handleTabChange(true)}
                    className="text-blue-500 hover:text-blue-300 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Popup */}
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#444b5d] p-6 rounded-md w-full max-w-md mx-4 shadow-xl border border-[#575d6e]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Verify Your Email</h3>
              <button 
                onClick={() => {
                  setShowOtpPopup(false);
                  setOtp("");
                }}
                className="text-gray-300 hover:text-white text-xl"
              >
                &times;
              </button>
            </div>
            
            <p className="text-gray-300 mb-6">
              We've sent a 6-digit verification code to <span className="text-white font-medium">{formData.email}</span>
            </p>

            <div className="mb-6">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const newOtp = otp.split("");
                      newOtp[index] = e.target.value.replace(/[^0-9]/g, "");
                      setOtp(newOtp.join(""));
                      
                      if (e.target.value && index < 5) {
                        document.getElementById(`otp-${index + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }
                    }}
                    id={`otp-${index}`}
                    className="w-12 h-12 text-center text-2xl bg-[#353a4d] border border-[#575d6e] rounded-md focus:outline-none  text-white"
                    autoFocus={index === 0}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleOtpSubmit}
                disabled={otp.length !== 6 || isSubmitting}
                className={`w-full py-3 rounded-md font-medium flex items-center justify-center ${
                  otp.length !== 6 || isSubmitting
                    ? "bg-[#666975] cursor-not-allowed"
                    : "bg-[#22c55e]"
                } text-white transition-colors`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : "Verify Account"}
              </button>

              <div className="text-center">
                <button
                  onClick={() => {
                    dispatch(SendOtp({ email: formData.email }));
                    toast.success("New OTP sent to your email");
                  }}
                  disabled={isSubmitting}
                  className="text-blue-500 hover:text-blue-400 text-sm disabled:text-gray-500"
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-xs mt-4 text-center">
              The code will expire in 10 minutes. Make sure to enter it promptly.
            </p>
          </div>
        </div>
      )}

      {/* Full Page Loader */}
      {loader && (
        <div className="fixed inset-0 bg-[#1c1f2d] bg-opacity-90 flex items-center justify-center z-50">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default Home;