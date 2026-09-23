// src/components/PageHeader.jsx
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Reusable Page Header with back button — TopX Purple Theme
 */
export default function PageHeader({ title, subtitle, emoji = "🎮" }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-bold transition-colors bg-[#1C0F2B] border border-[#2a1b3d] hover:bg-[#2a1b3d] hover:border-[#9B59B6]/50 px-3 py-2 rounded-xl flex-shrink-0"
        >
          <FaArrowLeft className="text-xs" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[24px] flex-shrink-0">{emoji}</span>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-extrabold text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
