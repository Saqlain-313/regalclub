import { useState } from "react";
import { FaQuestionCircle, FaUser } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { Link } from "react-router";
import TradeChart from "./TradeChart";

const SideNavbar = () => {
  const [isopen, SetIsopen] = useState("Trade");
  const [isPopup, SetIsPopup] = useState("");
  return (
    <div className="w-full bg-white p-2 ">
      <div className="w-[5%] h-screen bg-white hidden ">
        <nav className="flex flex-col items-center space-y-2 p-4">
          {/* Trade Button */}
          <div>
            <a
              onClick={() => SetIsopen((prev) => !prev)}
              className="flex items-center justify-center px-3 py-2 rounded-md text-white bg-gradient-to-b from-[#E8C860] via-[#C99A29] to-[#A97808] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_3px_8px_rgba(169,120,8,0.22)] transition-colors"
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
              className="flex items-center justify-center px-3 py-2 rounded-md text-[#8A6514] bg-white border border-[#E8D49A] hover:bg-[#FBF5E5] hover:text-[#B8860B] transition-colors"
            >
              <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
                <FaQuestionCircle className="w-5 h-5" />
                <span>TOP</span>
              </div>
            </button>
            {isPopup && (
              <div className="absolute h-screen top-20 left-20">
              </div>
            )}
          </div>

          {/* Account Button */}
          <Link
            to={"/trading/Deposite"}
            className="flex items-center px-3 py-2 rounded-md text-[#8A6514] bg-white border border-[#E8D49A] hover:bg-[#FBF5E5] hover:text-[#B8860B] transition-colors"
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
