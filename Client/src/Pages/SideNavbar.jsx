import React, { useState } from "react";
import { FaExchangeAlt, FaQuestionCircle, FaUser } from "react-icons/fa";
import TradeChart from "./TradeChart";
import Top from "../components/top";
import { GoGraph } from "react-icons/go";
import { Link } from "react-router";

const SideNavbar = () => {
  const [isopen, SetIsopen] = useState("Trade");
  const [isPopup, SetIsPopup] = useState("");
  return (
    <div className="w-full bg-[#1c1f2d] p-2 ">
      <div className="w-[5%] h-screen bg-[#1c1f2d] hidden md:block">
        <nav className="flex flex-col items-center space-y-2 p-4">
          {/* Trade Button */}
          <div>
            <a
              onClick={() => SetIsopen((prev) => !prev)}
              className="flex items-center justify-center px-3 py-2 rounded-md text-white bg-[#026fd3] transition-colors"
            >
              <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
                <GoGraph className="w-5 h-5" />
                <span>TRADE</span>
              </div>
            </a>
            {isopen && (
              <div className="absolute w-[94%] left-20 top-20">
                <TradeChart />
              </div>
            )}
          </div>

          {/* Top Button */}
          <div>
            <button
              onClick={() => SetIsPopup((prev) => !prev)}
              className="flex items-center justify-center px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
                <FaQuestionCircle className="w-5 h-5" />
                <span>TOP</span>
              </div>
            </button>
            {isPopup && (
              <div className="absolute h-screen top-20 left-20">
                <Top />
              </div>
            )}
          </div>

          {/* Account Button */}
          <Link
            to={"/Deposite"}
            className="flex items-center px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
              <FaUser className="w-5 h-5" />
              <span>ACCOUNT</span>
            </div>
          </Link>
        </nav>
      </div>
      <div className="w-[80%]"></div>
    </div>
  );
};

export default SideNavbar;
