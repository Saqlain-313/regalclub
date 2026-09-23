import React from "react";
import { FaExclamationCircle, FaBitcoin, FaEthereum, FaPaypal, FaUniversity, FaGift } from "react-icons/fa";
import usd from "../assets/universalImage/usdt_trc20.svg";
import usd2 from "../assets/universalImage/usdt_bep20.svg";
import upi from "../assets/universalImage/upi.svg";
// import bank from "../assets/universalImage/bank.svg"; // Add a sample bank logo
// import gift from "../assets/universalImage/gift.svg"; // Add a sample gift card logo
import { Link } from "react-router-dom";

const DepositInner = () => {
  const cryptoProviders = [
    {
      name: " USD Tether (TRC-20)",
      link: "",
      logo: usd,
    },
    {
      name: "USD Tether (BEP-20)",
      link: "",
      logo: usd2,
    },
  ];

  const ePaymentProviders = [
    {
      name: "UPI",
      link: "sunpay",
      logo: upi,
    },
  ];

  const bankTransferProviders = [
    {
      name: "HDFC Bank",
      link: "",
      logo: "bank",
    },
  ];

  const giftCardProviders = [
    {
      name: "Amazon Gift Card",
      link: "",
      logo: "gift",
    },
  ];

  return (
    <div className="w-full">
      {/* Info Banner */}
      <div className="w-[90%] flex items-center bg-[#1e2d45] p-2 rounded-md space-x-3 mb-5">
        <FaExclamationCircle className="text-blue-500 w-6 h-6" />
        <p className="text-sm font-semibold text-gray-100">
       IF YOU DEPOSIT WITH UPI <b> ₹86 = 1$ </b>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-3 md:p-5">
        {/* Cryptocurrencies */}
        <div className="flex flex-col w-full lg:w-[48%]">
          <div>
            <div className="pt-5 flex items-center space-x-2 text-lg font-semibold">
              <FaBitcoin className="w-5 h-5 text-white" />
              <span className="text-white">Cryptocurrencies</span>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {cryptoProviders.map((provider, index) => (
                <div key={index} onClick={() => localStorage.setItem( "method", provider.name)}>
                <Link to={`/Deposite?trading=bounce-page`} className="bg-white flex items-center space-x-4 p-3 md:p-5 rounded-md">
                  <img src={provider.logo} alt={provider.name} className="w-8 h-auto" />
                  <span className="font-semibold ">{provider.name}</span>
                </Link>
                </div>
              ))}
            </div>
          </div>
        </div>


        


        {/* E-payments */}
        <div className="flex flex-col w-full lg:w-[48%]">
          <div className="pt-5 flex items-center space-x-2 text-lg font-semibold">
            <FaPaypal className="w-5 h-5 text-white" />
            <span className="text-white">E-payments</span>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {ePaymentProviders.map((provider, index) => (
              <Link key={index} to={`/Deposite?trading=${provider.link}`} className="bg-white  flex items-center space-x-4 p-3 md:p-5 rounded-md">
                <img src={provider.logo} alt={provider.name} className="w-8 h-auto" />
                <span className="font-semibold text-black ">{provider.name}</span>
              </Link>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default DepositInner;
