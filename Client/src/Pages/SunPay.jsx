import { AlertTriangle, ArrowRight, ArrowRightCircle, ChevronDown, ChevronUp, DollarSign, Percent } from "lucide-react";
import React, { useState } from "react";
import { FaArrowCircleRight, FaBitcoin, FaChevronLeft } from "react-icons/fa"; // Import necessary icons
import { Link, useNavigate } from "react-router-dom";
import img1 from '../assets/universalImage/secure-3dsecure-dark@2x.png'
import img2 from '../assets/universalImage/secure-securecode-dark@2x.png'
import img3 from '../assets/universalImage/secure-securepayment-dark@2x.png'
import img4 from '../assets/universalImage/secure-ssl-dark@2x.png'
import img5 from '../assets/universalImage/secure-verified-dark@2x.png'
import { IoIosGift } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux"
import { RechargeSunPay, usePromocode } from "../Redux/Reducer/paymentReducer";
import upi from "../assets/universalImage/upi.svg";

const SunPay = () => {
  const method = localStorage.getItem("method");
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      name: "UPI",
      logo: <FaBitcoin className="text-orange-500 w-6 h-6" />, // Using React Icon here
      minAmount: 1000.0,
      maxAmount: 100000.0,
      active: true,
    },
  ]);
  const [open, setOpen] = useState("faq1");
  const [amount, setAmount] = useState(1000);
  const [promoCode, setPromoCode] = useState("")
  const [message, setMessage] = useState("")
    const [bonus,setBonus]=useState("")
  const dispatch = useDispatch()


  const handleApply =async () => {
    if (!promoCode.trim()) {
      setMessage("Please enter a promo code")
      return
    }
    await dispatch(usePromocode(promoCode)).then((res)=>{
      setMessage(res.payload.message)
      if(res.payload.success){
        setBonus(res.payload.data[0]?.percent)
      }
    })
    // Simulate promo code application
  
  }

  const navigate = useNavigate();

  const activeMethod = paymentMethods.find((method) => method.active);

  const handleAmountClick = (value) => {
    setAmount(value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value >= 1000) {
      setAmount(value); // Update the state only if the value is >= 1000
    } else {
      setAmount(1000); // Optionally, set it to the minimum value if less
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    await dispatch(RechargeSunPay({ amount: amount, type: "USDT" })).then((res) => {
      if (res.payload.status){
        window.location.href = res.payload.url;
      }
    })
  };

  
  return (
    <div className="h-[80vh] overflow-auto">
      <div className=" mx-auto bg-[#212634] flex flex-col lg:flex-row items-center lg:items-start gap-4 p-5">
        {/* Payment method section */}
        <div className="lg:w-[30%]">
          <div className="flex-1 p-2 md:p-6 bg-white rounded shadow-sm">
            <div className="text-lg font-semibold text-gray-700 mb-4">
              Chosen payment method:
            </div>

            {activeMethod && (
              <div className="border border-green-500 rounded p-4 mb-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <img
                          src={upi}
                          alt="logo"
                          className="h-10 w-10 rounded-full"
                        />
                      </div>
                      <span className="font-medium text-gray-800">
                        {activeMethod.name}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Min amount:{" "}
                      <b className="text-gray-800">
                      ₹{activeMethod.minAmount.toFixed(2)}
                      </b>
                    </div>
                    <div className="text-sm text-gray-600">
                      Max amount:{" "}
                      <b className="text-gray-800">
                      ₹{activeMethod.maxAmount.toFixed(2)}
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment data section */}
        <div className="lg:w-[35%]">
          <div className=" rounded">
            {/* Section Header */}
            <div className="text-lg font-semibold text-white mb-4">
              Payment Data
            </div>

            {/* Amount Input Section */}
            <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 bg-[#3a4252] border border-[#4a5466] rounded text-white px-2">
                <input
                  name="amount"
                  className="w-full  p-2 bg-[#3a4252] focus:outline-none  text-white placeholder-gray-400"
                  value={amount}
                  min={1000}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  type="number"
                />
                <div className="text-white mr-2">INR</div>
              </div>

              {/* Predefined Amount Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex space-x-3">
                  {[1000, 2000, 3000, 5000].map((value) => (
                    <button
                      key={value}
                      value={value}
                      className="px-4 py-2 text-sm bg-[#3a4252] text-white font-semibold hover:bg-[#303643] rounded"
                      onClick={() => handleAmountClick(value)}
                    >
                      ₹{value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="">
              <div className="">
                {/* Simple header */}
                <div className="flex items-center gap-2 my-4 text-white">
                  <IoIosGift className="text-xl text-[#22c55e]" />
                  <h2 className="text-lg font-medium">I have promo code</h2>
                </div>

                {/* Simple input and button */}
                <div className="flex">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                className="w-full  pl-4 p-2 bg-[#3a4252] focus:outline-none rounded-l text-white placeholder-gray-400"
                  />
                   <button
                    onClick={handleApply}
                    className="bg-[#22c55e] text-white text-sm font-medium px-4 py-2 rounded-r"
                  >
                    Apply
                  </button>
                </div>

                {/* Simple message */}
                {message && <p className={`mt-3 text-sm ${message==="Invalid promo code"?"text-white":"text-green-500"}  bg-white/20 p-2 rounded `}>{message}</p>}
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div className="bg-[#3a2e2d] border-l-4 border-orange-500 rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="flex-shrink-0 text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1 text-orange-400">
                      Attention!
                    </h4>
                    <p className="text-sm text-gray-300">
                      This address is for{" "}
                      <span className="font-semibold">UPI</span>{" "}
                      transfers only. Do not send smart contracts, TRX coins or
                      any other cryptocurrency to it. Such transfers will not be
                      credited.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#3a2e2d] border-l-4 border-orange-500 rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="flex-shrink-0 text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1 text-orange-400">
                      Attention!
                    </h4>
                    <p className="text-sm text-gray-300">
                      A new wallet address is generated for each transaction. Do
                      not send funds to the same address again, otherwise you
                      will lose them.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {bonus>0&&( <h3 className="text-end text-white font-semibold text-lg">${amount+amount*bonus/100} </h3>)}

            {/* button */}
            <div>
              <div
                onClick={handleDeposit}
                className="deposit-page__submit-button active flex items-center space-x-2 px-2 md:px-3 py-2 bg-green-500 hover:bg-green-700 text-white rounded focus:outline-none mt-5"
              >
                <span>Deposit</span>
                <FaArrowCircleRight className="text-white w-34 h-4" />{" "}
                {/* React Icon here */}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-[35%]">
          <div className=" text-white p-2 md:p-6 max-w-2xl mx-auto text-sm">
            <div className="flex justify-start items-center mb-4">
              <h2 className="text-lg font-bold">FAQ:</h2>
            </div>

            {/* FAQ 1 */}
            <div className="border-b border-gray-700 pb-3 mb-3">
              <button
                className="flex justify-between items-center w-full text-left font-medium text-blue-400"
                onClick={() => setOpen(open === "faq1" ? null : "faq1")}
              >
                <span>   {open === "faq1" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                Is there a minimum amount that I can deposit to my account at registration?

              </button>
              {open === "faq1" && (
                <div className="bg-[#2d2d3d] text-gray-300 mt-3 p-4 rounded text-sm">
                  The advantage of the Company’s trading platform is that you don’t have to deposit
                  large amounts to your account. You can start trading by investing a small amount of
                  money. The minimum deposit is 1000 rupees.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border-b border-gray-700 pb-3 mb-3">
              <button
                className="flex justify-between items-center w-full text-left font-medium"
                onClick={() => setOpen(open === "faq2" ? null : "faq2")}
              >
                <span>   {open === "faq2" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                Do I need to deposit the account of the trading platform and how often do I need to do this?
              </button>
              {open === "faq2" && (
                <div className="bg-[#2d2d3d] text-gray-300 mt-3 p-4 rounded text-sm">
                  To work with binary options you need to open an individual account. To conclude real trades, you will certainly need to make a deposit in the amount of options purchased.
                  <br />
                  You can start trading without cash, only using the company's training account (demo account). Such an account is free of charge and created to demonstrate the functioning of the trading platform. With the help of such an account, you can practice acquiring binary options, understand the basic principles of trading, test various methods and strategies, or evaluate the level of your intuition.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border-b border-gray-700 pb-3 mb-3">
              <button
                className="flex justify-start items-center w-full text-left font-medium"
                onClick={() => setOpen(open === "faq3" ? null : "faq3")}
              >
                <span>   {open === "faq3" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                How can I deposit?
              </button>
              {open === "faq3" && (
                <div className="bg-[#2d2d3d] text-gray-300 mt-3 p-4 rounded text-sm">
                  It is very easy to do. The procedure will take a couple of minutes.
                  <br />
                  <ol>
                    <li>1) Open the trade execution window and click on the green "Deposit" button in the upper right corner of the tab. <br />You can also deposit the account through your Personal Account by clicking the "Deposit" button in the account profile.</li>
                    <li>2) After it is necessary to choose a method of depositing the account (the Company offers a lot of convenient methods that are available to the Client and are displayed in his individual account).</li>
                    <li>3) Next, indicate the currency in which the account will be deposited, and accordingly the currency of the account itself.</li>
                    <li>4) Enter the amount of the deposit.</li>
                    <li>5) Fill out the form by entering the requested payment details.</li>
                    <li>6) Make a payment.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="border-b border-gray-700 pb-3 mb-3">
              <button
                className="flex justify-start items-center w-full text-left font-medium"
                onClick={() => setOpen(open === "faq4" ? null : "faq4")}
              >
                <span>   {open === "faq4" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                What is the minimum deposit amount?
              </button>
              {open === "faq4" && (
                <div className="bg-[#2d2d3d] text-gray-300 mt-3 p-4 rounded text-sm">
                  The advantage of the Company’s trading platform is that you don’t have to deposit large amounts to your account. You can start trading by investing a small amount of money. The minimum deposit is 10 US dollars.
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div>
              <button
                className="flex justify-start items-center w-full text-left font-medium"
                onClick={() => setOpen(open === "faq5" ? null : "faq5")}
              >
                <span>   {open === "faq5" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                Is there any fee for depositing or withdrawing funds from the account?
              </button>
              {open === "faq5" && (
                <div className="bg-[#2d2d3d] text-gray-300 mt-3 p-4 rounded text-sm">
                  No. The company does not charge any fee for either the deposit or for the withdrawal operations. <br />However, it is worth considering that payment systems can charge their fee and use the internal currency conversion rate.
                </div>
              )}
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
              Minimum deposit amount: <span className="text-green-500">$10</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span>
              Minimum withdrawal amount: <span className="text-green-500">$10</span>
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

export default SunPay;
