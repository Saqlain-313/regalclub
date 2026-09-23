import { ChevronRight } from "lucide-react";

const CommissionCard = ({
  title,
  subtitle,
  percent,
  color,
  icon,
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

      {/* Top */}
      <div
        className={`${color} text-white p-5 flex items-center justify-between`}
      >
        <div>
          <h3 className="text-lg font-bold">
            {title}
          </h3>

          <p className="text-sm text-white/90 mt-1">
            {subtitle}
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* Bottom */}
      <div className="p-5 flex items-center justify-between">

        <div>
          <p className="text-xs text-gray-500">
            Commission
          </p>

          <h2 className="text-3xl font-bold text-gray-800">
            {percent}
          </h2>
        </div>

        <button className="w-11 h-11 rounded-full bg-yellow-400 hover:bg-yellow-500 transition flex items-center justify-center">
          <ChevronRight
            size={20}
            className="text-white"
          />
        </button>

      </div>

    </div>
  );
};

export default CommissionCard;