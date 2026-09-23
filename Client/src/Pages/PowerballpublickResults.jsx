import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPowerballResults,
  clearPowerballResults,
} from "../redux/slices/powerballResultSlice";

const countryAliases = {
  india: "india",
  in: "india",
  australia: "australia",
  au: "australia",
  pakistan: "pakistan",
  pk: "pakistan",
  bangladesh: "bangladesh",
  bd: "bangladesh",
  bangla: "bangladesh",
  nepal: "nepal",
  np: "nepal",
  uae: "uae",
  ae: "uae",
  dubai: "uae",
};

const countries = [
  {
    name: "India",
    key: "india",
    flag: "🇮🇳",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    name: "Australia",
    key: "australia",
    flag: "🇦🇺",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    name: "Pakistan",
    key: "pakistan",
    flag: "🇵🇰",
    gradient: "from-green-400 to-green-600",
  },
  {
    name: "Bangladesh",
    key: "bangladesh",
    flag: "🇧🇩",
    gradient: "from-red-400 to-red-600",
  },
  {
    name: "Nepal",
    key: "nepal",
    flag: "🇳🇵",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    name: "UAE",
    key: "uae",
    flag: "🇦🇪",
    gradient: "from-yellow-400 to-yellow-600",
  },
];

const PowerballpublickResults = () => {
  const dispatch = useDispatch();
  const {
    results = [],
    loading,
    error,
    selectedCountry,
  } = useSelector((state) => state.powerballResult || {});

  const [activeCountry, setActiveCountry] = useState("india");
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const country = countryAliases[activeCountry] || "india";
    dispatch(getAllPowerballResults(country));

    return () => {
      dispatch(clearPowerballResults());
    };
  }, [dispatch, activeCountry]);

  const handleCountryClick = (country) => {
    const normalizedCountry = countryAliases[country] || "india";
    setActiveCountry(normalizedCountry);
  };

  const selectedCountryData = countries.find(
    (country) => country.key === (selectedCountry || activeCountry)
  );

  const countryName = selectedCountryData?.name || "India";

  const formatKey = (key) => {
    return String(key)
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Get color for status badges
  const getStatusColor = (value) => {
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower.includes("win")) return "bg-green-100 text-green-700";
      if (lower.includes("loss") || lower.includes("lose")) return "bg-red-100 text-red-700";
      if (lower.includes("draw")) return "bg-yellow-100 text-yellow-700";
      if (lower.includes("pending")) return "bg-blue-100 text-blue-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Animated Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur-lg" />
              <span className="relative text-4xl">🎱</span>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
                Powerball Results
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time lottery results from around the world
              </p>
            </div>
          </div>
        </div>

        {/* Country Selector - Glassmorphism */}
        <div className="mb-6 rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl shadow-blue-100/50 p-6 border border-white/50">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 mr-2">
              🌍 Select Country:
            </span>
            {countries.map((country) => {
              const active = activeCountry === country.key;
              return (
                <button
                  key={country.key}
                  type="button"
                  onClick={() => handleCountryClick(country.key)}
                  className={`
                    group relative flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all duration-300
                    ${active 
                      ? `bg-gradient-to-r ${country.gradient} text-white shadow-lg shadow-blue-500/30 scale-105` 
                      : "bg-white/80 text-gray-700 hover:scale-105 hover:shadow-md hover:bg-white border border-gray-200/50"
                    }
                  `}
                >
                  <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                    {country.flag}
                  </span>
                  <span>{country.name}</span>
                  {active && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Country Card */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-1 shadow-xl shadow-blue-500/30">
          <div className="rounded-2xl bg-white/10 backdrop-blur-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                  Currently Viewing
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  {selectedCountryData?.flag} {countryName}
                </h2>
              </div>
              {loading && (
                <div className="flex items-center gap-3 rounded-full bg-white/20 backdrop-blur px-4 py-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="text-sm font-medium text-white">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {!loading && error && (
          <div className="mb-6 animate-shake rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur p-5 shadow-lg shadow-red-500/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="font-medium text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl bg-white/70 backdrop-blur p-16 text-center shadow-xl">
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
              <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
            <p className="text-lg font-semibold text-gray-700">
              Loading {countryName} Powerball results...
            </p>
            <p className="mt-1 text-sm text-gray-400">Please wait while we fetch the latest data</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && (!Array.isArray(results) || results.length === 0) && (
          <div className="rounded-2xl bg-white/70 backdrop-blur p-16 text-center shadow-xl">
            <div className="mb-4 text-6xl animate-bounce">🎱</div>
            <h3 className="text-xl font-bold text-gray-800">No Results Found</h3>
            <p className="mt-2 text-gray-500">
              No Powerball results available for {countryName}.
              <br />
              <span className="text-sm">Check back later for updates!</span>
            </p>
          </div>
        )}

        {/* Results Table */}
        {!loading && !error && Array.isArray(results) && results.length > 0 && (
          <div className="rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl shadow-blue-100/50 overflow-hidden border border-white/50">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      #
                    </th>
                    {Object.keys(results[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                      >
                        {formatKey(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {results.map((result, index) => {
                    const isHovered = hoveredRow === index;
                    return (
                      <tr
                        key={result?._id || result?.id || index}
                        className={`
                          transition-all duration-300 cursor-pointer
                          ${isHovered ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 scale-[1.001]" : "hover:bg-gray-50/50"}
                        `}
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                            {index + 1}
                          </span>
                        </td>
                        {Object.keys(results[0]).map((key) => {
                          const value = result[key];
                          const formatted = formatValue(value);
                          const isStatus = typeof value === "string" && 
                            ["win", "loss", "draw", "pending"].some(s => 
                              value.toLowerCase().includes(s)
                            );
                          
                          return (
                            <td
                              key={key}
                              className="px-6 py-4 text-sm text-gray-600"
                            >
                              {isStatus ? (
                                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(value)}`}>
                                  {formatted}
                                </span>
                              ) : key.includes("amount") || key.includes("price") ? (
                                <span className="font-semibold text-green-600">
                                  ${formatted}
                                </span>
                              ) : key.includes("date") || key.includes("time") ? (
                                <span className="text-gray-500">
                                  {new Date(formatted).toLocaleDateString()}
                                </span>
                              ) : (
                                formatted
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="border-t border-gray-200/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30 px-6 py-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Showing {results.length} results</span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  Live data
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerballpublickResults;