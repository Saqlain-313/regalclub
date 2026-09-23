import React from "react";
import { ArrowRight } from "lucide-react";

const RewardCard = ({
  title,
  subtitle,
  button,
  image,
}) => {
  return (
    <div className="relative h-56 rounded-2xl overflow-hidden shadow-lg mb-5">

      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/35"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center p-6 text-white">

        <h2 className="text-3xl font-extrabold leading-tight max-w-xs">
          {title}
        </h2>

        <p className="mt-3 text-sm text-gray-100 max-w-xs">
          {subtitle}
        </p>

        <button className="mt-5 w-fit bg-white text-black px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transition">
          {button}
          <ArrowRight size={18} />
        </button>

      </div>

    </div>
  );
};

export default RewardCard;