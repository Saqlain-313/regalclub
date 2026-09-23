import { useEffect, useState } from "react";
import { FaChartArea, FaUser } from "react-icons/fa";
import { PiDotDuotone, PiRanking } from "react-icons/pi";
import { TbHelpOctagonFilled } from "react-icons/tb";
import { Link } from "react-router";
// import Supportbar from './Supportbar';

const Sidebar = ({ topPopupOpen, setTopPopupOpen }) => {
  // Initialize state with the value from localStorage or default to "Trade"
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("activeTab");
    return savedTab || "Trade";
  });

  const [openPopup, setOpenPopup] = useState(null);

  // Update localStorage whenever activeTab changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setOpenPopup(null);
    if (tabName !== "top") {
      setTopPopupOpen(false);
    }
  };

  const handlePopupToggle = (popupName) => {
    // Close all other popups when opening a new one
    if (popupName === "top") {
      setTopPopupOpen(!topPopupOpen);
      setOpenPopup(topPopupOpen ? null : popupName);
    } else {
      setTopPopupOpen(false);
      setOpenPopup(openPopup === popupName ? null : popupName);
    }

    // Set the active tab
    setActiveTab(popupName);
  };

  return (
    <div className="hidden lg:flex flex-col justify-between h-[88vh]">
      <nav className="flex flex-col items-center space-y-2 p-4 pt-0">
        {/* Trade Button */}
        <div>
          <Link
            to="/SideNavbar"
            className={`flex items-center justify-center size-16 rounded-md text-white transition-colors ${activeTab === "Trade" ? "bg-[#026fd3]" : "bg-none"}`}
          >
            <div
              onClick={() => handleTabClick("Trade")}
              className="flex flex-col items-center justify-center font-semibold text-xs gap-1"
            >
              <FaChartArea className="text-[20px]" />
              <span>TRADE</span>
            </div>
          </Link>
        </div>

        {/* Top Button */}
        <div>
          <button
            onClick={() => handlePopupToggle("top")}
            className={`flex items-center justify-center size-16 rounded-md text-white transition-colors ${activeTab === "top" && topPopupOpen ? "bg-[#026fd3]" : "bg-none"}`}
          >
            <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
              <PiRanking className="text-[25px]" />
              <span>TOP</span>
            </div>
          </button>
        </div>

        {/* Account Button */}
        <Link
          to={"/Deposite?trading=Account"}
          className={`flex items-center justify-center size-16 rounded-md text-white transition-colors ${activeTab === "account" ? "bg-[#026fd3]" : "bg-none"}`}
        >
          <div
            onClick={() => handleTabClick("account")}
            className="flex flex-col items-center justify-center font-semibold text-xs gap-1"
          >
            <FaUser className="text-[20px]" />
            <span>ACCOUNT</span>
          </div>
        </Link>

        {/* Support Button */}
        <div
          onClick={() => handlePopupToggle("support")}
          className={`flex items-center justify-center size-16 rounded-md text-white transition-colors ${activeTab === "support" ? "bg-[#026fd3]" : "bg-none"}`}
        >
          <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
            <TbHelpOctagonFilled className="text-[20px]" />
            <span>SUPPORT</span>
          </div>
        </div>
      </nav>

      <div className="px-2">
        <Link
          to={"/support"}
          className="flex items-center justify-center size-16 rounded-md text-white transition-colors bg-green-500"
        >
          <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
            <PiDotDuotone className="text-2xl text-white" />
            <span>Help</span>
          </div>
        </Link>
      </div>

      {/* {openPopup === "support" && (
                <div className="absolute h-auto top-20 left-20 z-10">
                    <Supportbar />
                </div>
            )} */}
    </div>
  );
};

export default Sidebar;
