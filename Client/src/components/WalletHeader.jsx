import { Bell } from "lucide-react";

export default function WalletHeader() {
  return (
    <div className="sticky top-0 z- bg-white border-b border-gray-200">
      <div className="h-14 flex items-center justify-center relative px-4">
        <h1 className="text-gray-900 text-xl font-semibold">
          Wallet
        </h1>

        <button className="absolute right-4">
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-700" />

            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              3
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}