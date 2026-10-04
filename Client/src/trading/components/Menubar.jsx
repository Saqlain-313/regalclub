import { useEffect, useRef, useState } from "react";
import { FaChartArea, FaUser } from "react-icons/fa";
import { PiRanking } from "react-icons/pi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Top from "./top";

const Menubar = ({ closeMenu }) => {
  const [activeMenu, setActiveMenu] = useState("Trade");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set active menu based on URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tradingParam = params.get("trading");

    if (location.pathname === "/trading/SideNavbar") {
      setActiveMenu("Trade");
    } else if (tradingParam) {
      setActiveMenu(tradingParam);
    }
  }, [location]);

  const getMenuClass = (menuName) => {
    return `flex items-center justify-center size-16 rounded-md transition-colors ${
      activeMenu === menuName
        ? "text-white bg-[#026fd3]"
        : "text-[#7e828d] hover:text-white hover:bg-[#282a38]"
    }`;
  };

  const getLinkClass = (menuName) => {
    return `block p-2 hover:bg-[#282a38] rounded ${
      activeMenu === menuName
        ? "text-white bg-[#026fd3]"
        : "text-[#7e828d] hover:text-white"
    }`;
  };

  const handlemove = (data) => {
    navigate(`/Deposite?trading=${data}`);
    localStorage.setItem("menuOpen", false);
  };

  return (
    <div>
      <div className="flex flex-col justify-between h-[90vh] w-[200px] bg-[#191919]">
        <nav className="flex flex-col items-center space-y-2 p-4">
          {/* Trade Button */}
          <div>
            <Link
              to="/trading/SideNavbar"
              className={getMenuClass("Trade")}
              onClick={() => {
                setActiveMenu("Trade");
                closeMenu();
              }}
            >
              <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
                <FaChartArea className="text-[20px]" />
                <span>TRADE</span>
              </div>
            </Link>
          </div>

          {/* Top Button */}
          <div ref={popupRef}>
            <button
              onClick={() => setIsPopupOpen(!isPopupOpen)}
              className={getMenuClass("Top")}
            >
              <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
                <PiRanking className="text-[30px]" />
                <span>TOP</span>
              </div>
            </button>
            {isPopupOpen && (
              <div className="absolute h-screen top-0 left-40 z-10">
                <Top />
              </div>
            )}
          </div>

          {/* Account Button */}
          <Link
            to="/trading/Deposite?trading=Account"
            className={getMenuClass("Account")}
            onClick={() => {
              setActiveMenu("Account");
              closeMenu();
            }}
          >
            <div className="flex flex-col items-center justify-center font-semibold text-xs gap-1">
              <FaUser className="text-[20px]" />
              <span>ACCOUNT</span>
            </div>
          </Link>
        </nav>
        <div className="px-2">
          <ul className="space-y-1">
            <li>
              <span
                className={getLinkClass("Deposit")}
                onClick={() => {
                  setActiveMenu("Deposit");
                  closeMenu();
                }}
              >
                Deposit
              </span>
            </li>
            <li>
              <Link
                to="/trading/Deposite?trading=Withdrawal"
                className={getLinkClass("Withdrawal")}
                onClick={() => {
                  setActiveMenu("Withdrawal");
                  closeMenu();
                }}
              >
                Withdrawal
              </Link>
            </li>
            <li>
              <Link
                to="/trading/Deposite?trading=Transactions"
                className={getLinkClass("Transactions")}
                onClick={() => {
                  setActiveMenu("Transactions");
                  closeMenu();
                }}
              >
                Transactions
              </Link>
            </li>
            <li>
              <Link
                to="/trading/Deposite?trading=Trades"
                className={getLinkClass("Trades")}
                onClick={() => {
                  setActiveMenu("Trades");
                  closeMenu();
                }}
              >
                Trades
              </Link>
            </li>
            <li>
              <Link
                to="/trading/Deposite?trading=Account"
                className={getLinkClass("Account")}
                onClick={() => {
                  setActiveMenu("Account");
                  closeMenu();
                }}
              >
                Account
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Menubar;
