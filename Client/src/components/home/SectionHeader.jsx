// components/home/SectionHeader.jsx
// Professional section header — sab home game sections ke liye consistent
// icon: react-icons (Google Material Design) icon node pass karo
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon badge */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.5)] flex items-center justify-center flex-shrink-0">
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight text-white sm:text-xl leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
};

export default SectionHeader;
