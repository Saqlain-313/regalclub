import { Headphones, Scale, ShieldCheck, Wallet, Zap } from "lucide-react";

const features = [
  {
    title: "Fast Results",
    icon: Zap,
  },
  {
    title: "Secure & Safe",
    icon: ShieldCheck,
  },
  {
    title: "Instant Payouts",
    icon: Wallet,
  },
  {
    title: "24x7 Support",
    icon: Headphones,
  },
  {
    title: "Fair Play",
    icon: Scale,
  },
];

export default function FeatureBar() {
  return (
    <section className="px-3 bg-[#0B0410]">
      <div className="max-w-7xl mx-auto bg-[#1C0F2B] border border-[#2a1b3d] rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-5">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className={`flex flex-col items-center justify-center py-3 px-2 ${
                  index !== features.length - 1
                    ? "border-r border-[#2a1b3d]"
                    : ""
                }`}
              >
                <Icon
                  className="w-5 h-5 text-[#F1C40F] mb-1.5"
                  strokeWidth={2}
                />

                <span className="text-[10px] sm:text-xs text-gray-300 font-medium text-center leading-tight">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
