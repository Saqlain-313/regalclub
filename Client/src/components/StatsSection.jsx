import {
  Users,
  Wallet,
  Gamepad2,
  ShieldCheck,
  Zap,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "25,000+",
    label: "Players",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    icon: Wallet,
    value: "₹15Cr+",
    label: "Total Paid",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    icon: Gamepad2,
    value: "100+",
    label: "Games",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    icon: ShieldCheck,
    value: "99.9%",
    label: "Uptime",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
];

const StatsSection = () => {
  const goldenTextStyle = {
    background: "linear-gradient(135deg, #7b5800 0%, #fdba12 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  return (
    <section className="bg-surface px-3 md:px-6 py-6 md:py-8">
      {/* Heading - WINZOX Style */}
      <div className="flex flex-wrap items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-yellow-400 rounded-full blur-md opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-xl shadow-lg">
              <Zap className="text-white" size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight" style={goldenTextStyle}>
              Platform Stats
            </h2>
            <p className="text-gray-500 text-xs font-medium">Real-time platform metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Stats Cards - WINZOX Glass Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className={`group relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-yellow-50/50 to-transparent pointer-events-none"></div>
              
              {/* Icon with gradient background */}
              <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.bgColor} border ${item.borderColor} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`${item.color} w-6 h-6 md:w-7 md:h-7`} strokeWidth={2} />
              </div>

              {/* Value */}
              <div className="relative z-10">
                <h3 className={`text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 group-hover:${item.color} transition-colors duration-300`}>
                  {item.value}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm font-medium mt-0.5">
                  {item.label}
                </p>
              </div>

              {/* Decorative progress bar */}
              <div className="relative z-10 mt-3 md:mt-4 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${item.color.replace('text', 'bg')} opacity-50 group-hover:opacity-100`}
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                ></div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-yellow-400/5 -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
            </div>
          );
        })}
      </div>


      <style>{`
        .bg-surface {
          background-color: #f7f9fb;
        }
        button:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </section>
  );
};

export default StatsSection;