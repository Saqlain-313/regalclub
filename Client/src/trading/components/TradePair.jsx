import { useState } from "react";
import {
  FaSearch,
  FaStar,
  FaRegStar,
  FaArrowUp,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

const TradePair = () => {
  const [activeFilter, setActiveFilter] = useState("Crypto");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  const filters = ["Crypto"];

  const assets = [
    {
      id: 1,
      pair: "AUD/USD",
      type: "OTC",
      change: -0.81,
      payout1: 93,
      payout2: 93,
      flag1: "aud",
      flag2: "usd",
    },
    {
      id: 2,
      pair: "USD/BRL",
      type: "OTC",
      change: -1.22,
      payout1: 93,
      payout2: 93,
      flag1: "usd",
      flag2: "brl",
    },
  ];

  const filteredAssets = assets.filter(
    (asset) =>
      asset.pair.toLowerCase().includes(searchQuery.toLowerCase()) &&
      activeFilter === "Crypto" // Only showing Crypto for this example
  );

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const FlagIcon = ({ code }) => (
    <img
      src={`https://flagcdn.com/16x12/${code}.png`}
      alt={code}
      className="w-4 h-3 mr-1"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );

  

  return (
    <div className="bg-[#191919] rounded-lg shadow-md w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4 ">
        <h3 className="font-semibold text-lg text-white">Select trade pair</h3>
        <button className="text-white hover:text-gray-100">
          <FaTimes />
        </button>
      </div>

      {/* Filters */}
      <div className="flex p-4">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === filter
                ? "text-green-500 border-b-2 border-green-500"
                : "text-white hover:text-gray-100"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Search and Favorites */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center text-gray-500 border p-1 px-2 rounded-md border-gray-500 ">
          {favorites.length > 0 ? (
            <>
              <FaStar className="text-yellow-500 mr-1" />
              <span>{favorites.length}</span>
            </>
          ) : (
            <>
              <FaRegStar className=" mr-1" />
              <span>0</span>
            </>
          )}
        </div>
        <div className="relative w-[90%]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-white" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-none border-gray-300 rounded-md leading-5 bg-[#3b3b3b] placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#191919]">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden md:table-cell"
              >
                24h changing
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Profit 1+ min
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                5+ min
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#191919]  ">
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-[#232323]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleFavorite(asset.id)}
                      className="mr-2 text-gray-50 hover:text-yellow-400"
                    >
                      {favorites.includes(asset.id) ? (
                        <FaStar className="text-yellow-400" />
                      ) : (
                        <FaRegStar />
                      )}
                    </button>
                    <div className="flex items-center">
                      <FlagIcon code={asset.flag1} />
                      <FlagIcon code={asset.flag2} />
                      <span className="ml-1 text-white">
                        {asset.pair}{" "}
                        <span className=" text-white">({asset.type})</span>
                        {asset.isNew && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <FaCheck className="mr-1" size={8} />
                            New
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <div
                    className={`flex items-center ${
                      asset.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {asset.change >= 0 ? (
                      <FaArrowUp className="mr-1" />
                    ) : (
                      <FaArrowDown className="mr-1" />
                    )}
                    <span>{Math.abs(asset.change)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {asset.payout1}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {asset.payout2}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradePair;
