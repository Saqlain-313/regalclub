import { Gamepad2, TrendingUp, Trophy, Users, Wifi } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "1,240",
    label: "Today's Winners",
    color: "text-[#00E676]",
    bgColor: "bg-[#00E676]/15",
    borderColor: "bg-[#00E676]",
  },
  {
    icon: Gamepad2,
    value: "32,500",
    label: "Games Played",
    color: "text-[#9B59B6]",
    bgColor: "bg-[#9B59B6]/15",
    borderColor: "bg-[#9B59B6]",
  },
  {
    icon: Trophy,
    value: "96%",
    label: "Winning Rate",
    color: "text-[#3498DB]",
    bgColor: "bg-[#3498DB]/15",
    borderColor: "bg-[#3498DB]",
  },
  {
    icon: Wifi,
    value: "5,420",
    label: "Online Users",
    color: "text-[#E67E22]",
    bgColor: "bg-[#E67E22]/15",
    borderColor: "bg-[#E67E22]",
  },
];

export default function StatsSection2() {
  return (
    <section className="px-4 md:px-8 py-6 bg-[#0B0410]">
      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#00E676]/15 flex items-center justify-center border border-[#00E676]/30">
            <TrendingUp className="w-5 h-5 text-[#00E676]" />
          </div>

          <div>
            <h2 className="text-lg md:text-2xl font-bold uppercase text-white">
              Live Stats
            </h2>
            <p className="text-[11px] text-gray-400">
              Real-time platform metrics
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-[#00E676]/10 border border-[#00E676]/30 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
          <span className="text-xs font-semibold text-[#00E676]">LIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="grid grid-cols-4">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className={`group relative flex flex-col items-center justify-center
                px-2 py-4 md:py-6 transition-all duration-300 hover:bg-[#2a1b3d]/40
                ${
                  index !== stats.length - 1 ? "border-r border-[#2a1b3d]" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 md:w-12 md:h-12 rounded-full ${item.bgColor}
                  flex items-center justify-center transition-all duration-300
                  group-hover:scale-110 border border-[#2a1b3d]`}
                >
                  <Icon className={`${item.color} w-5 h-5 md:w-6 md:h-6`} />
                </div>

                {/* Value */}
                <h3
                  className={`mt-2 text-[15px] md:text-2xl font-extrabold ${item.color} transition-colors duration-300`}
                >
                  {item.value}
                </h3>

                {/* Label */}
                <p className="mt-1 text-[10px] md:text-sm text-gray-400 text-center leading-tight font-medium">
                  {item.label}
                </p>

                {/* Bottom Hover Line */}
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300 ${item.borderColor}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
