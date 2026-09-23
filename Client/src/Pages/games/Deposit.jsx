import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdQrCode,
  MdSecurity,
  MdCheckCircle,
  MdWarning,
  MdInfo,
  MdHistory,
  MdPayment,
  MdContentCopy,
  MdAttachMoney,
} from "react-icons/md";
import { FaRupeeSign, FaBitcoin, FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { getProfile } from "../../reducer/authSlice";
import {
  generateUserDepositUpiQR,
  resetUserUpiState,
} from "../../reducer/userUpiSlice";
import {
  createDeposit,
  clearDepositState,
  onlineDeposit,
} from "../../reducer/depositSlice";
import {
  getUserUsdtAddresses,
  resetUsdtState,
} from "../../reducer/usdtSettingSlice";
import { getSetting } from "../../reducer/settingSlice";

// Constants outside component to avoid recreation on every render
const QUICK_AMOUNTS = [300, 500, 1000, 2000, 5000, 10000, 20000, 50000];
const USDT_QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500];

export default function Deposit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [utr, setUtr] = useState("");
  const [remark, setRemark] = useState("");
  const [showUtrInput, setShowUtrInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customUpiAmount, setCustomUpiAmount] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // USDT specific states
  const [usdtAddress, setUsdtAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("TRC20");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [showUsdtDetails, setShowUsdtDetails] = useState(false);

  const {
    loading: upiLoading,
    qrData,
    error: upiError,
  } = useSelector((state) => state.userUpi);
  const {
    loading: depositLoading,
    success: depositSuccess,
    message: depositMessage,
    error: depositError,
  } = useSelector((state) => state.deposit);
  const { userprofile } = useSelector((state) => state.auth);
  const {
    loading: usdtLoading,
    networks,
    error: usdtError,
  } = useSelector((state) => state.usdtSetting);

  const activeNetworks = (networks || []).filter((n) => n.isActive !== false);

  // Load user profile only once
  useEffect(() => {
    if (!userprofile) dispatch(getProfile());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load USDT addresses when USDT method is selected
  useEffect(() => {
    if (selectedMethod === "usdt") {
      dispatch(getUserUsdtAddresses());
      dispatch(getSetting());
    }
  }, [dispatch, selectedMethod]);

  const { setting } = useSelector((state) => state.setting);

  const usdtRate = setting?.usdtRate || 96;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set default USDT address when networks are loaded
  useEffect(() => {
    if (networks && networks.length > 0) {
      const active = networks.filter((n) => n.isActive !== false);
      const defaultNetwork =
        active.find((n) => n.type === "TRC20") || active[0];
      if (defaultNetwork) {
        setUsdtAddress(defaultNetwork.address);
        setSelectedNetwork(defaultNetwork.type);
      }
    }
  }, [networks]);

  // Handle UPI QR success
  useEffect(() => {
    if (qrData?.qrImage) {
      setShowUtrInput(true);
      setSelectedAmount(qrData.amount);
      setAmount(qrData.amount.toString());
    }
  }, [qrData?.qrImage]);

  // Handle UPI error
  useEffect(() => {
    if (upiError) {
      toast.error(upiError);
      dispatch(resetUserUpiState());
    }
  }, [upiError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle deposit success
  useEffect(() => {
    if (depositSuccess) {
      toast.success(
        depositMessage || "Deposit submitted successfully! Awaiting approval.",
        { id: "manual_deposit_success" },
      );
      dispatch(clearDepositState());
      setHasSubmitted(true);
      setUtr("");
      setRemark("");
      setTimeout(handleCloseQR, 2000);
    }
  }, [depositSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle deposit error
  useEffect(() => {
    if (depositError) {
      toast.error(depositError, { id: depositError });
      dispatch(clearDepositState());
    }
  }, [depositError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetUserUpiState());
      dispatch(clearDepositState());
      dispatch(resetUsdtState());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateInrEquivalent = useCallback(
    (usdtValue) => {
      if (!usdtValue || parseFloat(usdtValue) < 0) return 0;
      return parseFloat(usdtValue) * usdtRate;
    },
    [usdtRate],
  );

  const handleAmountClick = useCallback(
    (amt) => {
      setAmount(amt.toString());
      setCustomUpiAmount(amt.toString());
      setSelectedAmount(amt);
      dispatch(generateUserDepositUpiQR(amt));
      setUtr("");
      setRemark("Payment for deposit of ₹" + amt);
      setShowUtrInput(true);
    },
    [dispatch],
  );

  const handleCustomUpiAmountChange = useCallback((e) => {
    const value = e.target.value;
    console.log("Custom UPI Amount Changed:", value);
    setCustomUpiAmount(value);
    setSelectedAmount(value ? parseInt(value) : null);
    setAmount(value);
  }, []);

  const handleGenerateCustomQR = useCallback(() => {
    if (!customUpiAmount || parseInt(customUpiAmount) < 299) {
      toast.error("Please enter valid amount (min ₹299)");
      return;
    }
    const amt = parseInt(customUpiAmount);
    if (amt < 300) {
      toast.error("Minimum deposit amount is ₹300");
      return;
    }
    setAmount(amt.toString());
    setSelectedAmount(amt);
    dispatch(generateUserDepositUpiQR(amt));
    setUtr("");
    setRemark("Payment for deposit of ₹" + amt);
    setShowUtrInput(true);
  }, [customUpiAmount, dispatch]);

  const handleSubmitDeposit = useCallback(() => {
    if (!qrData) {
      toast.error("Select amount first");
      return;
    }
    if (!utr.trim()) {
      toast.error("Enter UTR");
      return;
    }
    if (!remark.trim()) {
      toast.error("Enter Remark");
      return;
    }
    dispatch(
      createDeposit({
        paymentMethod: "upi",
        utr: utr.trim(),
        amount: qrData.amount,
        remark: remark.trim(),
      }),
    );
  }, [qrData, utr, remark, dispatch]);

  // ✅ FIXED: was missing closing ), [deps]) bracket
  const handleUsdtDeposit = useCallback(() => {
    if (!usdtAmount || parseFloat(usdtAmount) < 10) {
      toast.error("Please enter valid USDT amount (min $10)");
      return;
    }
    if (!transactionId.trim()) {
      toast.error("Please enter Transaction ID");
      return;
    }
    dispatch(
      createDeposit({
        paymentMethod: "usdt",
        amount: parseFloat(usdtAmount),
        transactionId: transactionId.trim(),
        network: selectedNetwork,
        remark: remark.trim() || `USDT deposit $${usdtAmount}`,
      }),
    );
  }, [usdtAmount, transactionId, selectedNetwork, remark, dispatch]);

  // ✅ FIXED: was written as plain arrow function then closed with ), [dispatch]) — now consistent
  const handleCloseQR = useCallback(() => {
    dispatch(resetUserUpiState());
    setUtr("");
    setRemark("");
    setAmount("");
    setSelectedAmount(null);
    setCustomUpiAmount("");
    setShowUtrInput(false);
    setHasSubmitted(false);
  }, [dispatch]);

  const clearForm = useCallback(() => {
    setAmount("");
    setUtr("");
    setRemark("");
    setSelectedAmount(null);
    setCustomUpiAmount("");
    setShowUtrInput(false);
    setUsdtAmount("");
    setTransactionId("");
    setShowUsdtDetails(false);
    dispatch(resetUserUpiState());
  }, [dispatch]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // ✅ FIXED: was written as plain function then closed with }, []) — now useCallback
  const handleUsdtAmountClick = useCallback(
    (amt) => {
      setUsdtAmount(amt.toString());
      setAmount(calculateInrEquivalent(amt).toString());
      setShowUsdtDetails(true);
    },
    [calculateInrEquivalent],
  );

  const handleNetworkChange = useCallback(
    (e) => {
      const networkType = e.target.value;
      setSelectedNetwork(networkType);
      const selected = (networks || []).find((n) => n.type === networkType);
      if (selected) setUsdtAddress(selected.address);
    },
    [networks],
  );

  const handleOnlineDeposite = useCallback(
    async (amount) => {
      try {
        if (!amount || parseFloat(amount) < 300) {
          toast.error("Please enter valid amount (min ₹300)");
          return;
        }

        const res = await dispatch(
          onlineDeposit({ amount: parseFloat(amount) }),
        ).unwrap();

        const paymentUrl = res?.paymentUrl;

        if (paymentUrl) {
          // Redirect to payment gateway
          window.location.href = paymentUrl;
        } else {
          toast.error(res?.message || "Failed to start payment");
        }
      } catch (error) {
        toast.error(
          typeof error === "string"
            ? error
            : "An error occurred. Please try again.",
        );
      }
    },
    [dispatch],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-orange-400 hover:text-yellow-400 transition-colors bg-gray-800/50 md:px-4 py-2 rounded-xl backdrop-blur-sm"
        >
          <MdArrowBack />
          <span>Back to Home</span>
        </button>
      </div>

      {/* View History Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => navigate("/deposit-history")}
          className="flex items-center gap-2 text-orange-400 hover:text-yellow-400 transition-colors bg-gray-800/50 px-4 py-2 rounded-xl backdrop-blur-sm"
        >
          <MdHistory />
          <span>View History</span>
        </button>
      </div>

      <div className=" mx-auto md:px-4 pb-8">
        {/* Account credit */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-gray-400 text-sm mb-1">Current credit</div>
              <div className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center sm:justify-start">
                <FaRupeeSign className="mr-2 text-yellow-400" />
                <span>{userprofile?.credit?.toLocaleString() || "0"}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/deposit-history")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 hover:from-orange-500/30 hover:to-yellow-500/30 text-orange-400 border border-orange-500/30 rounded-xl font-bold transition-all"
            >
              <MdHistory />
              Deposit History
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Payment */}
          <div className="lg:w-2/3">
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6">
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-300 mb-4">
                  <div className="flex items-center gap-2">
                    <MdPayment className="text-orange-400" />
                    <span>Select Payment Method</span>
                  </div>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {/*  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod("zilpay");
                      clearForm();
                    }}
                    className={`relative p-6 rounded-xl border-2 transition-all ${selectedMethod === "zilpay"
                      ? "border-orange-500 bg-gradient-to-br from-orange-500/20 to-yellow-500/20"
                      : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                      }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <MdQrCode className="text-2xl" />
                      </div>
                      <div
                        className={`text-lg font-bold ${selectedMethod === "zilpay" ? "text-orange-300" : "text-gray-300"}`}
                      >
                        ZilPay
                      </div>
                      <div className="text-xs text-gray-400">
                        Scan & Pay • Any ZilPay App
                      </div>
                    </div>
                  </button> */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod("upi");
                      clearForm();
                    }}
                    className={`relative p-6 rounded-xl border-2 transition-all ${selectedMethod === "upi"
                      ? "border-orange-500 bg-gradient-to-br from-orange-500/20 to-yellow-500/20"
                      : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                      }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <MdQrCode className="text-2xl" />
                      </div>
                      <div
                        className={`text-lg font-bold ${selectedMethod === "upi" ? "text-orange-300" : "text-gray-300"}`}
                      >
                        UPI QR
                      </div>
                      <div className="text-xs text-gray-400">
                        Scan & Pay • Any UPI App
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod("usdt");
                      clearForm();
                    }}
                    className={`relative p-6 rounded-xl border-2 transition-all ${selectedMethod === "usdt"
                      ? "border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                      : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                      }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <FaBitcoin className="text-2xl" />
                      </div>
                      <div
                        className={`text-lg font-bold ${selectedMethod === "usdt" ? "text-green-300" : "text-gray-300"}`}
                      >
                        USDT
                      </div>
                      <div className="text-xs text-gray-400">
                        Tether • Crypto Deposit
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* UPI QR SECTION */}
              {selectedMethod === "zilpay" && (
                <div className="mb-6">
                  <div className="mb-8">
                    <label className="block text-lg font-medium text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <MdQrCode className="text-orange-400" />
                        <span>Select Amount for ZilPay QR</span>
                      </div>
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      {QUICK_AMOUNTS.map((amt) => (
                        <div
                          key={amt}
                          onClick={() => setSelectedAmount(amt)}
                          className={`cursor-pointer rounded-2xl p-5 text-center font-semibold text-lg transition-all duration-300 ${selectedAmount === amt
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-105 shadow-xl shadow-blue-500/40"
                            : "bg-gray-800 hover:bg-gray-700 hover:scale-105"
                            }`}
                        >
                          ₹ {amt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Or Enter Custom Amount
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={selectedAmount || customUpiAmount}
                          onChange={handleCustomUpiAmountChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="Enter amount (min ₹ 300)"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedAmount && (
                    <div className="mt-6">
                      <button
                        onClick={() => handleOnlineDeposite(selectedAmount)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all"
                      >
                        Pay Now ₹ {selectedAmount}
                      </button>
                    </div>
                  )}

                  {/* {zilpayLoading && (
                    <div className="text-center mb-6 animate-pulse text-blue-400">
                      Generating Secure QR...
                    </div>
                  )} */}
                </div>
              )}
              {/* UPI QR SECTION */}
              {selectedMethod === "upi" && (
                <div className="mb-6">
                  <div className="mb-8">
                    <label className="block text-lg font-medium text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <MdQrCode className="text-orange-400" />
                        <span>Select Amount for UPI QR</span>
                      </div>
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      {QUICK_AMOUNTS.map((amt) => (
                        <div
                          key={amt}
                          onClick={() => handleAmountClick(amt)}
                          className={`cursor-pointer rounded-2xl p-5 text-center font-semibold text-lg transition-all duration-300 ${selectedAmount === amt
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-105 shadow-xl shadow-blue-500/40"
                            : "bg-gray-800 hover:bg-gray-700 hover:scale-105"
                            }`}
                        >
                          ₹ {amt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Or Enter Custom Amount
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={customUpiAmount}
                          onChange={handleCustomUpiAmountChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="Enter amount (min ₹ 300)"
                        />
                      </div>
                      <button
                        onClick={handleGenerateCustomQR}
                        disabled={
                          !customUpiAmount ||
                          parseInt(customUpiAmount) < 100 ||
                          upiLoading
                        }
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                      >
                        Generate QR
                      </button>
                    </div>
                    {customUpiAmount &&
                      parseInt(customUpiAmount) >= 100 &&
                      !qrData && (
                        <p className="text-xs text-gray-400 mt-2">
                          Click "Generate QR" to create QR code for ₹
                          {customUpiAmount}
                        </p>
                      )}
                  </div>

                  {upiLoading && (
                    <div className="text-center mb-6 animate-pulse text-blue-400">
                      Generating Secure QR...
                    </div>
                  )}

                  {qrData?.qrImage && (
                    <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-3xl max-w-md mx-auto text-center shadow-2xl">
                      <button
                        onClick={handleCloseQR}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                      <h3 className="text-2xl font-semibold mb-4">
                        Pay ₹{qrData.amount}
                      </h3>
                      <div className="bg-gray-800 p-4 rounded-2xl inline-block shadow-lg">
                        <img
                          src={qrData.qrImage}
                          alt="UPI QR"
                          className="w-64 h-64"
                          loading="lazy"
                        />
                      </div>
                      <div
                        className="text-gray-400 mt-4 text-sm break-all max-w-full overflow-x-auto"
                        style={{ wordBreak: "break-all" }}
                      >
                        Txn ID: {qrData.transactionId}
                      </div>
                      <div className="mt-6 space-y-4">
                        <input
                          type="text"
                          placeholder="Enter UTR"
                          value={utr}
                          onChange={(e) => {
                            let value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 12);
                            setUtr(value);
                          }}
                          maxLength="12"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleSubmitDeposit}
                          disabled={depositLoading || !utr}
                          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition-all duration-300 shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {depositLoading ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            "Submit Deposit"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* USDT SECTION */}
              {selectedMethod === "usdt" && (
                <div className="mb-6">
                  {/* USDT Rate Display */}
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MdAttachMoney className="text-green-400 text-xl" />
                        <span className="text-gray-300 font-medium">
                          Current USDT Rate
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        1 USDT = $ {usdtRate.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {usdtLoading && (
                    <div className="text-center mb-6 animate-pulse text-green-400">
                      Loading USDT addresses...
                    </div>
                  )}
                  {usdtError && (
                    <div className="text-center text-red-400 mb-6">
                      {usdtError}
                    </div>
                  )}
                  {!usdtLoading &&
                    activeNetworks.length === 0 &&
                    !usdtError && (
                      <div className="text-center text-yellow-400 mb-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        No USDT addresses available. Please contact support.
                      </div>
                    )}

                  {activeNetworks.length > 0 && (
                    <>
                      <div className="mb-8">
                        <label className="block text-lg font-medium text-gray-300 mb-4">
                          <div className="flex items-center gap-2">
                            <FaBitcoin className="text-green-400" />
                            <span>Select USDT Amount</span>
                          </div>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {USDT_QUICK_AMOUNTS.map((amt) => (
                            <div
                              key={amt}
                              onClick={() => handleUsdtAmountClick(amt)}
                              className={`cursor-pointer rounded-2xl p-5 text-center font-semibold text-lg transition-all duration-300 ${parseFloat(usdtAmount) === amt
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 scale-105 shadow-xl shadow-green-500/40"
                                : "bg-gray-800 hover:bg-gray-700 hover:scale-105"
                                }`}
                            >
                              $ {amt}
                              <div className="text-xs text-gray-400 mt-1">
                                ≈ ₹
                                {calculateInrEquivalent(amt).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 0 },
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Or Enter Custom USDT Amount
                        </label>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={usdtAmount}
                            onChange={(e) => {
                              const value = e.target.value;
                              setUsdtAmount(value);
                              if (value && parseFloat(value) >= 10) {
                                setAmount(
                                  calculateInrEquivalent(value).toString(),
                                );
                                setShowUsdtDetails(true);
                              } else {
                                setShowUsdtDetails(false);
                              }
                            }}
                            className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all"
                            placeholder="Enter USDT amount (min $10)"
                          />
                        </div>
                        {usdtAmount && parseFloat(usdtAmount) >= 10 && (
                          <p className="text-xs text-gray-400 mt-2">
                            ≈ ₹
                            {calculateInrEquivalent(usdtAmount).toLocaleString(
                              undefined,
                              { maximumFractionDigits: 2 },
                            )}{" "}
                            INR
                          </p>
                        )}
                      </div>

                      {showUsdtDetails && parseFloat(usdtAmount) >= 10 && (
                        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 space-y-4">
                          <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                            <MdCheckCircle className="text-green-400" />
                            USDT Deposit Details
                          </h3>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Select Network
                            </label>
                            <select
                              value={selectedNetwork}
                              onChange={handleNetworkChange}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              {activeNetworks.map((network) => (
                                <option key={network.type} value={network.type}>
                                  {network.type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Send USDT to this address
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-3 text-white font-mono text-sm break-all">
                                {usdtAddress || "Loading address..."}
                              </div>
                              <button
                                onClick={() => copyToClipboard(usdtAddress)}
                                disabled={!usdtAddress}
                                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                              >
                                <MdContentCopy className="text-white text-xl" />
                              </button>
                            </div>
                            <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                              <MdWarning className="text-yellow-500" />
                              Send only USDT on {selectedNetwork} network. Other
                              tokens will be lost.
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Transaction ID (TXID)
                            </label>
                            <input
                              type="text"
                              placeholder="Enter your transaction ID"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Remark (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="Add a remark for this deposit"
                              value={remark}
                              onChange={(e) => setRemark(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>

                          <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">USDT Amount</span>
                              <span className="text-white font-semibold">
                                ${parseFloat(usdtAmount).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">USDT Rate</span>
                              <span className="text-green-400 font-semibold">
                                1 USDT = $ {usdtRate.toFixed(2)}
                              </span>
                            </div>
                            <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
                              <span className="text-gray-400">
                                INR Equivalent
                              </span>
                              <span className="text-yellow-400 font-bold text-base">
                                ${" "}
                                {calculateInrEquivalent(
                                  usdtAmount,
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={handleUsdtDeposit}
                            disabled={
                              depositLoading ||
                              !transactionId.trim() ||
                              !usdtAmount ||
                              parseFloat(usdtAmount) < 10 ||
                              !usdtAddress
                            }
                            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition-all duration-300 shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {depositLoading ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              "Submit USDT Deposit"
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="mt-6 text-center text-xs text-gray-500">
                <p>By proceeding, you agree to our Terms & Conditions</p>
                <p className="mt-1">
                  Deposits will be verified within 5-15 minutes
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MdInfo className="text-2xl text-orange-400" />
                  <div className="text-lg font-semibold text-white">
                    Deposit Info
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Processing Time</span>
                    <span className="text-green-400">5-15 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Min. Amount</span>
                    <span className="text-white">₹300 / $10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max. Amount</span>
                    <span className="text-white">₹100,000 / $10,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Transaction Fee</span>
                    <span className="text-green-400">0%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MdQrCode className="text-xl text-blue-400" />
                  <div className="text-lg font-semibold text-white">UPI QR</div>
                </div>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>• Scan & Pay with Any UPI App</p>
                  <p>• No Extra Charges</p>
                  <p>• Auto Verification</p>
                  <p>• 24/7 Support</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl border border-green-500/20 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FaBitcoin className="text-xl text-green-400" />
                  <div className="text-lg font-semibold text-white">
                    USDT Deposit
                  </div>
                </div>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    • Send USDT via{" "}
                    {activeNetworks.map((n) => n.type).join("/") ||
                      "TRC20/ERC20/BEP20"}
                  </p>
                  <p>• 0% Transaction Fee</p>
                  <p>• 1 USDT = ₹{usdtRate.toFixed(2)}</p>
                  <p>• Auto Conversion to INR</p>
                  <p>• 24/7 Support</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <div className="text-lg font-semibold text-white mb-3">
                  Need Help?
                </div>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>• Check deposit history for status</p>
                  <p>• Contact support if not credited</p>
                  <p>• Keep UTR/TXID for reference</p>
                  <p>• Minimum deposit ₹300 / $10</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
