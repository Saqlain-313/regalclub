const MemberStatCard = ({ icon: Icon, iconColor, label, value, fullWidth }) => {
  return (
    <div
      className={`rounded-3xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-4 ${
        fullWidth ? "col-span-2" : ""
      }`}
    >
      <Icon size={22} className={iconColor} />

      <p className="text-xs text-gray-400 mt-2 whitespace-pre-line leading-snug">
        {label}
      </p>

      <p className="text-xl font-black text-white mt-1">{value}</p>
    </div>
  );
};

export default MemberStatCard;
