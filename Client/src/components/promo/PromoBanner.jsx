const PromoBanner = () => {
  return (
    <div className="rounded-3xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-6 flex items-center justify-between gap-4 overflow-hidden relative">
      {/* Decorative purple glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-[#9B59B6]/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white leading-snug">
          Share your link and
        </h2>
        <h2 className="text-2xl font-black bg-gradient-to-r from-[#B45CFF] via-[#C77AFF] to-[#B45CFF] bg-clip-text text-transparent leading-snug">
          EARN BIG REWARDS!
        </h2>
      </div>

      <img
        src="https://i.ibb.co/8gXCwzjp/wallet.png"
        alt="Gift rewards"
        className="w-28 h-28 md:w-32 md:h-32 object-contain flex-shrink-0 relative z-10 drop-shadow-[0_0_12px_rgba(155,89,182,0.5)]"
      />
    </div>
  );
};

export default PromoBanner;
