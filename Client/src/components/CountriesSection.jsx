import { CheckCircle, Globe, MapPin } from "lucide-react";

const countries = [
  { name: "India", flag: "https://flagcdn.com/w80/in.png", code: "IN" },
  { name: "Australia", flag: "https://flagcdn.com/w80/au.png", code: "AU" },
  { name: "Pakistan", flag: "https://flagcdn.com/w80/pk.png", code: "PK" },
  { name: "Bangladesh", flag: "https://flagcdn.com/w80/bd.png", code: "BD" },
  { name: "Nepal", flag: "https://flagcdn.com/w80/np.png", code: "NP" },
  { name: "Dubai", flag: "https://flagcdn.com/w80/ae.png", code: "UAE" },
];

const CountriesAndDailyClaim = () => {
  return (
    <section className="bg-[#0B0410] px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="relative p-2">
                <Globe className="text-[#F1C40F]" size={20} />
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-2xl font-black text-white">
                Available in Countries
              </h2>

              <p className="text-xs text-gray-400 font-medium">
                Global Lottery Access
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#00E676]/10 border border-[#00E676]/30 rounded-full px-3 py-1">
            <CheckCircle className="w-4 h-4 text-[#00E676]" />
            <span className="text-xs font-bold text-[#00E676]">ACTIVE</span>
          </div>
        </div>

        {/* Countries */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-6">
            {countries.map((country, index) => (
              <div
                key={country.code}
                className={`group flex flex-col items-center justify-center px-2 py-4 md:py-6 transition-all duration-300 hover:bg-[#1C0F2B] hover:-translate-y-1 rounded-xl`}
              >
                <div className="relative">
                  <img
                    src={country.flag}
                    alt={country.name}
                    loading="lazy"
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-16 md:h-16 rounded-full border-2 border-[#2a1b3d] object-cover transition-all duration-300 group-hover:border-[#F1C40F] group-hover:scale-110 shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                  />
                </div>

                <span className="mt-3 text-[8px] sm:text-[9px] md:text-xs font-medium text-gray-300 text-center leading-tight">
                  {country.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2a1b3d]">
          <div className="flex items-center gap-2">
            <MapPin className="text-[#F1C40F]" size={15} />
            <span className="text-xs text-gray-400 font-medium">
              {countries.length} Countries Supported
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span className="text-xs text-gray-400">Available Worldwide</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountriesAndDailyClaim;
