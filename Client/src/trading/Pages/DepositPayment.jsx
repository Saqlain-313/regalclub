import {
  ArrowRightCircle,
  DollarSign,
  LoaderIcon,
  Percent,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaExclamationCircle } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Recharge } from "../Redux/Reducer/paymentReducer";

import img1 from "../assets/universalImage/secure-3dsecure-dark@2x.png";
import img2 from "../assets/universalImage/secure-securecode-dark@2x.png";
import img3 from "../assets/universalImage/secure-securepayment-dark@2x.png";
import img4 from "../assets/universalImage/secure-ssl-dark@2x.png";
import img5 from "../assets/universalImage/secure-verified-dark@2x.png";
import { getadmin } from "../Redux/Reducer/authReducer";

const DepositPayment = () => {
  const { admininfo } = useSelector((state) => state.auth);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(0);
  const [url, setUrl] = useState("");
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [image, setMainImage] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [copying, setCopying] = useState(null);

  const amount = localStorage.getItem("amount");
  const bonus = localStorage.getItem("bonus");
  const method = localStorage.getItem("method");

  console.log(method, "method");

  const handleCopy = async (text, type) => {
    setCopying(type);
    await navigator.clipboard.writeText(text);
    setTimeout(() => setCopying(null), 1000);
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimeLeft(5 * 60);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    dispatch(getadmin());
  }, [dispatch]);

  // Handle QR Code submit
  const handleQRCodeSubmit = (e) => {
    e.preventDefault();
  };

  const handlePayment = (e) => {
    e.preventDefault();
    // Handle payment logic
    dispatch(
      Recharge({
        amount: amount,
        type: method,
        utrNo: utr,
        image: image,
        bonus: bonus,
      }),
    ).then((res) => {
      if (res.payload.success) {
        toast.success(res.payload.message);
        localStorage.removeItem("amount");
        localStorage.removeItem("method");
        setTimeout(() => {
          navigate("/trading/Deposite?trading=Deposit");
        }, 2000);
      } else {
        toast.error(res.payload.message);
      }
    });
  };

  const handleMainImageChange = async (e) => {
    const file = Array.from(e.target.files || []);

    if (!file) {
      toast.error("Please select an image.");
      return;
    }

    // Create a FormData object
    const formData = new FormData();
    formData.append("image", file[0]);

    try {
      // Upload the image to ImgBB
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=18e63ff899cb908d823daa101c023095`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (data && data.data && data.data.url) {
        setMainImage(data.data.url); // Set the image URL from ImgBB
      } else {
        console.error("Invalid ImgBB response:", data);
        toast.error("Failed to upload image to ImgBB.");
      }
    } catch (error) {
      console.error("Error uploading image to ImgBB:", error);
      toast.error("Failed to upload image to ImgBB.");
    }
  };

  return (
    <div className="h-[80vh] overflow-auto">
      <div className="w-full mx-auto bg-[#212634] flex flex-col lg:flex-row items-start md:p-5">
        <div className="flex flex-col lg:flex-row text-white min-h-[400px]">
          {/* Left column */}
          <div className="w-full lg:w-[40%] p-6 border-r border-gray-800">
            <h2 className="text-xl font-medium mb-4">Chosen payment method</h2>

            <div className="bg-[#1c1f2d] rounded p-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-2 rounded-full">
                  <img
                    src="http://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png"
                    alt="logo"
                    className="h-10 w-10 rounded-full"
                  />
                </div>
                <span className="text-gray-800 font-medium">{method}</span>
              </div>
            </div>

            <Link
              to="/trading/Deposite?trading=bounce-page"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FaArrowLeft size={16} />
              <span>Change amount</span>
            </Link>
          </div>

          {/* Right column */}
          <div className="lg:w-[60%] p-6">
            <h2 className="text-xl font-medium mb-4">
              Deposit ${amount} via {method}
            </h2>

            {/* Warning box */}
            <div className="bg-[#3a2e27] border border-[#5a4a40] rounded p-4 mb-6">
              <div className="flex gap-3">
                <div className="mt-1">
                  <FaExclamationCircle className="text-orange-400" size={24} />
                </div>
                <div>
                  <p className="mb-2">
                    When transferring funds indicate the amount exactly as
                    indicated in the instructions below.
                  </p>
                  <Link
                    to="/trading/support"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Contact support
                  </Link>
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* QR Code */}
              {console.log("admininfo", admininfo)}
              <div className="bg-[#1c1f2d] p-2 w-[200px] h-[200px] flex items-center justify-center">
                <img
                  src={
                    method === " USD Tether (TRC-20)"
                      ? admininfo?.usdtImg
                      : admininfo?.usdtImg2
                  }
                  width={180}
                  height={180}
                  alt="QR Code for payment"
                  className="object-contain"
                />
              </div>

              {/* Instructions */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className="mb-2">
                    To complete the payment transfer {amount} USD to address
                  </p>
                  <p className="font-mono text-sm break-all mb-4">
                    {" "}
                    {method === " USD Tether (TRC-20)"
                      ? admininfo?.usdt
                      : admininfo?.usdt2}
                  </p>
                  <p className="mb-6">Expires: 24h</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center"
                    onClick={() =>
                      handleCopy(
                        method === " USD Tether (TRC-20)"
                          ? admininfo?.usdt
                          : admininfo?.usdt2,
                        "address",
                      )
                    }
                  >
                    <span>
                      <MdContentCopy />
                    </span>{" "}
                    {copying === "address" ? "Copied!" : "Copy address"}
                  </button>

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors  flex items-center"
                    onClick={() => handleCopy(amount, "amount")}
                  >
                    <span>
                      <MdContentCopy />
                    </span>{" "}
                    {copying === "amount" ? "Copied!" : "Copy amount"}
                  </button>
                </div>
              </div>
            </div>

            {/* Payment status */}
            <div className="flex items-center gap-2 mt-6 text-blue-400">
              <LoaderIcon className="animate-spin" size={18} />
              <span>Waiting for Payment...</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[25%] border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-4 shadow-sm bg-[#1c1f2d] dark:bg-gray-800">
          <div className="w-full flex flex-col justify-center items-center">
            {/* QR Code Section */}
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
                Payment Verification
              </h3>

              <form onSubmit={handleQRCodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="Enter UTR/Transaction ID"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[#1c1f2d] dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Screenshot
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded">
                    <div className="space-y-1 text-center">
                      {image ? (
                        <div className="mt-2">
                          <img
                            src={image}
                            alt="Payment preview"
                            className="mx-auto max-h-48 rounded object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="mt-2 text-xs text-red-500 hover:text-red-700"
                          >
                            Remove image
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-[#1c1f2d] dark:bg-gray-800 rounded font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                required
                                accept="image/*"
                                onChange={handleMainImageChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handlePayment}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-green-500 transition-colors duration-200"
                >
                  Verify Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row w-full bg-gray-900 text-white rounded-lg overflow-hidden">
        {/* Left section - Payment info */}
        <div className="p-3 border-r border-gray-800 flex flex-col space-y-2 md:w-1/3 text-sm">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span>
              Minimum deposit amount:{" "}
              <span className="text-green-500">$10</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span>
              Minimum withdrawal amount:{" "}
              <span className="text-green-500">$10</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ArrowRightCircle className="h-5 w-5 text-green-500" />
            <span>Quick withdrawal from your account</span>
          </div>

          <div className="flex items-center gap-3">
            <Percent className="h-5 w-5 text-green-500" />
            <span>Without a fee</span>
          </div>
        </div>

        {/* Right section - Security badges */}
        <div className="p-6 flex-1 flex items-center justify-around flex-wrap gap-4">
          <div className="flex items-center">
            <img src={img1} alt="logo" className="h-10 w-auto" />
          </div>

          <div className="flex items-center">
            <img src={img2} alt="logo" className="h-10 w-auto" />
          </div>

          <div className="flex items-center">
            <img src={img3} alt="logo" className="h-10 w-auto" />
          </div>

          <div className="flex items-center">
            <img src={img4} alt="logo" className="h-10 w-auto" />
          </div>

          <div className="flex items-center">
            <img src={img5} alt="logo" className="h-10 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositPayment;
