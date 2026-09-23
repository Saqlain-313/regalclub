import React, { useState, useEffect } from "react";
import DepositInner from "./DepositInner";
import WithDrawInner from "./WithDrawInner";
import Transation from "./Transation";
import Trade from "./Trade";
import Account from "./Account";
import { useLocation, useNavigate } from "react-router";
import BonusPage from "./BouncePage";
import DepositPayment from "./DepositPayment";
import Sidebar from "../components/Sidebar";
import SunPay from "./SunPay";
import Top from "../components/top";

const Deposite = () => {
  const [activeSection, setActiveSection] = useState("Deposit");

  const links = [
    { path: "Deposit", label: "Deposit" },
    { path: "Withdrawal", label: "Withdrawal" },
    { path: "Transactions", label: "Transactions" },
    { path: "Trades", label: "Trades" },
    { path: "Account", label: "Account" },
    { path: "bounce-page",},
    { path: "payment-page",},
  ];

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const querySection = queryParams.get("trading");

  useEffect(() => {
    if (querySection) {
      setActiveSection(querySection);
    }
  }, [location.search]);

  const handlePath = (path) => {
    navigate(`/Deposite?trading=${path}`);
    setActiveSection(path);
  };

    const [topPopupOpen, setTopPopupOpen] = useState(false);
  return (
    <div className="p-2  md:gap-2 rounded-lg flex h-[88vh] mb-4">
    <div className="lg:w-[80px]">
    <Sidebar topPopupOpen={topPopupOpen} setTopPopupOpen={setTopPopupOpen} />
    </div>
      <div
            className={`
        transition-all duration-500 ease-in-out
        overflow-hidden
        ${topPopupOpen ? "w-[550px] opacity-100" : "w-0 opacity-0"}
      `}
          >
            <Top topPopupOpen={topPopupOpen} setTopPopupOpen={setTopPopupOpen} />
          </div>
      <div className="w-full lg:w-[95%] h-[88vh] overflow-hidden">
        <div className="lg:w-[40%] overflow-auto hidden lg:flex sm:flex-wrap items-center px-5 justify-between text-white font-medium text-sm rounded-lg bg-[#2b3040]">
          {links.slice(0,5).map(({ path, label }) => {
            const isActive = activeSection === path;

            return (
              <div key={path}>
                <button
                  onClick={() => handlePath(path)}
                  className={`flex flex-row items-center gap-3 p-1 px-4 my-2 rounded ${
                    isActive ? "bg-[#414553] text-white" : "text-white"
                  }`}
                >
                  <strong>{label}</strong>
                </button>
              </div>
            );
          })}
        </div>
        {/* Conditional content rendering based on active section */}
        <div className="mt-5">
          {activeSection === "Deposit" && <DepositInner />}
          {activeSection === "Withdrawal" && <WithDrawInner />}
          {activeSection === "Transactions" && <Transation />}
          {activeSection === "Trades" && <Trade />}
          {activeSection === "Account" && <Account />}
          {activeSection === "bounce-page" && <BonusPage />}
          {activeSection === "payment-page" && <DepositPayment />}
          {activeSection === "sunpay" && <SunPay/>}
        </div>
      </div>
    </div>
  );
};

export default Deposite;
