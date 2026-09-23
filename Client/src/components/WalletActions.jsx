// components/WalletActions.jsx (Using Link)
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";

export default function WalletActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Deposit */}
      <Link
        to="/deposit"
        className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-green-500 hover:bg-green-50 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-green-500/30 bg-green-50">
            <ArrowDown className="h-6 w-6 text-green-500" />
          </div>

          <div className="text-left">
            <h3 className="text-base font-semibold text-green-600">
              Deposit
            </h3>
            <p className="text-xs text-gray-500">
              Add money to wallet
            </p>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:text-gray-700" />
      </Link>

      {/* Withdrawal */}
      <Link
        to="/withdrawal"
        className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-500/30 bg-blue-50">
            <ArrowUp className="h-6 w-6 text-blue-500" />
          </div>

          <div className="text-left">
            <h3 className="text-base font-semibold text-blue-600">
              Withdrawal
            </h3>
            <p className="text-xs text-gray-500">
              Withdraw to bank
            </p>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:text-gray-700" />
      </Link>
    </div>
  );
}