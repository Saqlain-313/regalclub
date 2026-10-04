import React, { useState } from "react";
import { FiAlertTriangle, FiCreditCard, FiDollarSign, FiInfo, FiArrowUpRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Withdrawl } from "../Redux/Reducer/paymentReducer";
import { toast } from "react-toastify";

const WithdrawInner = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usdt, setUsdt] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const dispatch = useDispatch();
  

  const paymentMethods = [
    { id: "trc", name: " USD Tether (TRC-20)", min: 10, max: 50000 },
    { id: "bep", name: "USD Tether (BEP-20)", min: 10, max: 20000 },
    { id: "upi", name: "UPI", min: 1000, max: 100000 },
  ];

  
  console.log( userInfo?.userId)


  const accountBalance = 15000.00;
  const availableForWithdrawal = 12000.00;
  const commissionRate = 0.02;

  const handleWithdrawal = (e) => {
    e.preventDefault();
    dispatch(Withdrawl({ amount: withdrawAmount, type: selectedMethod, orderId: userInfo.userId, usdt: usdt })).then((res) => {
      if (res.payload.success) {
        toast.success(res.payload.message);
      } else {
        toast.error(res.payload.message);
      }
    })
    // setIsSubmitting(true);
    
    // setTimeout(() => {
    //   setIsSubmitting(false);
    //   setSuccessMessage(`Withdrawal request for ₹${withdrawAmount} submitted successfully!`);
    //   setWithdrawAmount("");
    //   setSelectedMethod("");
    // }, 1500);
  };

  const calculateCommission = (amount) => {
    return (amount * commissionRate).toFixed(2);
  };

  return (
    <div className="w-full mx-auto md:p-4 h-[80vh] overflow-auto">
      {/* Account Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Account Balance Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
            <FiDollarSign className="mr-2 text-green-500" />
            Account Summary
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <div>
                <p className="text-gray-400 font-medium">Current Balance</p>
                <p className="text-sm text-gray-500">Total funds in your account</p>
              </div>
              <p className=" md:text-2xl font-bold text-white">₹{userInfo?.money}</p>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <div>
                <p className="text-gray-400 font-medium">Available for Withdrawal</p>
                <p className="text-sm text-gray-500">After trade commitments</p>
              </div>
              <p className="md:text-2xl font-bold text-green-400">₹{userInfo?.money}</p>
            </div>
            
            {/* <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 font-medium">Withdrawal Commission</p>
                <p className="text-sm text-gray-500">{(commissionRate * 100)}% per transaction</p>
              </div>
              <p className="text-2xl font-bold text-white">₹{calculateCommission(availableForWithdrawal)}</p>
            </div> */}
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-gray-800 p-2 md:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
            <FiCreditCard className="mr-2 text-green-500" />
            Withdraw Funds
          </h2>
          
          {successMessage ? (
            <div className="bg-green-900/30 border border-green-500 p-4 rounded-md mb-6">
              <p className="text-green-400">{successMessage}</p>
              <button 
                onClick={() => setSuccessMessage("")}
                className="mt-2 text-green-400 hover:text-green-300 text-sm flex items-center"
              >
                Make another withdrawal <FiArrowUpRight className="ml-1" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdrawal} className="mb-[100px] lg:mb-0">
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Amount {selectedMethod === "upi" ? "(₹)" : "($)"} </label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter amount"
                    min="100"
                    max={availableForWithdrawal}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setWithdrawAmount(availableForWithdrawal)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min: {selectedMethod === "upi" ? "₹1000" : "$10"}  - Max: {selectedMethod === "upi" ? "₹" : "$"} {availableForWithdrawal.toLocaleString('en-IN')}
                </p>
              </div>
              {selectedMethod === "upi" ? (
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">UPI id</label>
                <div className="relative">
                  <input
                    type="text"
                    value={usdt}
                    onChange={(e) => setUsdt(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter upi id"
                    required
                  />
                </div>
              </div>
              ) : (
                <div className="mb-4">
                <label className="block text-gray-400 mb-2">USDT address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={usdt}
                    onChange={(e) => setUsdt(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter usdt address"
                    required
                  />
                </div>
              </div>
              )}
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-3 border rounded-md text-center transition-colors ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-900/20 text-white'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {method.name === "UPI" ? "₹" : "$"} {method.min} -  {method.name === "UPI" ? "₹" : "$"} {method.max.toLocaleString('en-IN')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {withdrawAmount && selectedMethod && (
                <div className="mb-6 bg-gray-700 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-medium">{selectedMethod === "upi" ? "₹" : "$"}{parseFloat(withdrawAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Commission 0%:</span>
                    <span className="font-medium">{selectedMethod === "upi" ? "₹" : "$"}00</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-300">You'll receive:</span>
                    <span className="font-bold text-green-400">
                    {selectedMethod === "upi" ? "₹" : "$"}{parseFloat(withdrawAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={!withdrawAmount || !selectedMethod || isSubmitting || 
                  withdrawAmount < (selectedMethod === "upi" ? 1000 : 10) || withdrawAmount > availableForWithdrawal
                }
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  !withdrawAmount || !selectedMethod || isSubmitting ||  withdrawAmount < (selectedMethod === "upi" ? 1000 : 10) || withdrawAmount > availableForWithdrawal
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </form>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default WithdrawInner;