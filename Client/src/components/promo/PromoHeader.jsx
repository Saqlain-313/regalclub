import { ArrowLeft, Bell } from "lucide-react";

const PromoHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">

        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          <ArrowLeft size={22} />
        </button>

        <h1 className="text-lg font-bold text-gray-800">
          For Promo
        </h1>

        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          <Bell size={20} />

          <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            3
          </span>
        </button>

      </div>
    </header>
  );
};

export default PromoHeader;