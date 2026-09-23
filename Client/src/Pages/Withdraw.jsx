import React, { useState } from "react";
import DepositInner from "./DepositInner";
import WithDrawInner from "./WithDrawInner";
import Transation from "./Transation";
import Trade from "./Trade";
// import Withdraw from './Withdraw';

const Withdraw = () => {
  const [activeSection, setActiveSection] = useState("Withdrawal");

  const links = [
    { path: "Deposit", label: "Deposit" },
    { path: "Withdrawal", label: "Withdrawal" },
    { path: "Transactions", label: "Transactions" },
    { path: "Trades", label: "Trades" },
  ];

  return (
    <div className="p-5 bg-[#212634] h-screen m-5 rounded-lg ">
      <div>
        <div
          className={`w-[40%] flex items-center px-5 justify-between text-white font-medium text-lg rounded-lg bg-[#2b3040]`}
        >
          {links.map(({ path, label }) => {
            const isActive = activeSection === path;

            return (
              <div key={path}>
                <button
                  onClick={() => setActiveSection(path)}
                  className={`flex flex-row items-center gap-3 p-1 px-4 my-2 rounded-lg ${
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
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
