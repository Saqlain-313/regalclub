import { useEffect, useState } from "react";
import {
  FaUser,
  FaCamera,
  FaTrash,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { ForgetPass, getUser, updateUser } from "../Redux/Reducer/authReducer";
import { toast } from "react-toastify";

const Account = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    firstName: userInfo?.name,
    lastName: "",
    birthday: "",
    email: userInfo?.email,
    address: userInfo?.country,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    login2FA: true,
  });


  const [showTooltip, setShowTooltip] = useState({
    Name: false,
    birthday: false,
    aadhaar: false,
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]) 

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    dispatch(updateUser({name: formData.firstName, country: formData.address})).then((res) => {
      if (res?.payload?.success) {
        toast.success(res.payload.message);
        setTimeout(() => {
      }, 500); 
      } else {
        toast.error(res.payload.message);
      }
    });
  };

  const toggleTooltip = (field) => {
    setShowTooltip((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    dispatch(ForgetPass({ email: userInfo?.email, oldPassword: formData.oldPassword, newPassword: formData.newPassword})).then((res) => {
      if (res?.payload?.success) {
        toast.success(res.payload.message);
        setTimeout(() => {
      }, 500); 
      } else {
        toast.error(res.payload.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2 md:gap-6 md:p-4 max-w-full mx-auto mb-4 h-[80vh] overflow-auto">
      {/* Left Column */}
      <div className="flex-1 min-w-[300px]">
        {/* Personal Data Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1f2937] rounded-lg shadow-lg p-2 md:p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4 text-white">Personal data:</h2>

          {/* Avatar Section */}
          <div className="flex items-center mb-6">
            <div className="relative mr-4">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white">
                <FaUser size={36} />
              </div>
              <label className="absolute p-2 -top-2 left-12 rounded-full cursor-pointer text-white hover:bg-gray-300">
                <FaCamera size={20} className="" />
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                />
              </label>
              <button className="absolute top-0 right-0 bg-gray-200 p-1 rounded-full hidden">
                <FaTrash size={10} />
              </button>
            </div>
            <div>
              <div className="font-medium text-gray-300 text-sm">{formData.email}</div>
              <div className="text-gray-300 text-sm">ID: {userInfo?.userId}</div>
              <div className="flex items-center text-green-400 text-sm mt-1">
                <FaExclamationCircle className="mr-1" />
                verified
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-white text-sm font-medium  mb-1">
                Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 bg-[#1f2937] border border-gray-500 text-white rounded focus:ring-[0.5px] focus:ring-white focus:border-white"
                placeholder="name"
                onFocus={() => toggleTooltip("firstName")}
                onBlur={() => toggleTooltip("firstName")}
              />
              {showTooltip.firstName && (
                <div className="absolute z-10 mt-1 p-2 bg-gray-800 text-white text-xs rounded w-64">
                  The name must be specified exactly as in the document. For
                  providing incorrect information, the account may be deleted
                  without warning.
                </div>
              )}
            </div>

            <div>
              {/* Email Input */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-500 text-gray-300 rounded-md focus:outline-none focus:ring-[0.5px] focus:ring-white bg-[#1f2937]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium  mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 bg-[#1f2937] border border-gray-500 text-white rounded focus:ring-[0.5px] focus:ring-white focus:border-white"
                placeholder="address"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Right Column */}
      <div className="flex-1 min-w-[300px]">
        {/* Security Section */}
        <div className="bg-[#1f2937] rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold mb-4 text-white">Security:</h2>
            {/* <button
              type="button"
              className="flex items-center text-red-500 hover:text-red-700"
            >
              <FaTimes className="mr-2" />
              Delete Account
            </button> */}
          </div>

          {/* Password Change Form */}
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label className="block text-white text-sm font-medium  mb-1">
                Old password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full p-2 bg-[#1f2937] border border-gray-500 text-white rounded focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-white text-sm font-medium  mb-1">
                New password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full p-2 bg-[#1f2937] border border-gray-500 text-white rounded focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-medium  mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 bg-[#1f2937] border border-gray-500 text-white rounded focus:ring-[0.5px] focus:ring-white focus:border-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition "
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;
