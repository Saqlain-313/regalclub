import { useEffect, useState } from "react";
import { GoInfinity } from "react-icons/go";
import { IoMdTrophy } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../redux/slices/authSlice";

const Top = ({ topPopupOpen, setTopPopupOpen }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Generate random user data
  const generateRandomUsers = (count) => {
    const countries = [
      "us",
      "gb",
      "ca",
      "au",
      "de",
      "fr",
      "jp",
      "br",
      "in",
      "cn",
    ];
    const medals = ["gold", "silver", "bronze"];
    const users = [];

    for (let i = 1; i <= count; i++) {
      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];
      const randomAmount = (Math.random() * 50000).toFixed(2);
      const medal = i <= 3 ? medals[i - 1] : null;

      users.push({
        id: i,
        place: i,
        country: randomCountry,
        name: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
        amount: `$${randomAmount}`,
        medal,
        hasDefaultAvatar: Math.random() > 0.5,
      });
    }

    return users;
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Update leaderboard data
  const updateLeaderboard = () => {
    // Generate between 15-20 users
    const userCount = 15 + Math.floor(Math.random() * 6);
    let newUsers = generateRandomUsers(userCount);

    // Shuffle positions (except top 3)
    if (newUsers.length > 3) {
      const top3 = newUsers.slice(0, 3);
      const rest = shuffleArray(newUsers.slice(3));
      newUsers = [...top3, ...rest];
    }

    // Reassign places
    newUsers = newUsers.map((user, index) => ({
      ...user,
      place: index + 1,
    }));

    setLeaderboardData(newUsers);
  };

  // Initialize and update every minute
  useEffect(() => {
    dispatch(getProfile());
    updateLeaderboard(); // Initial load

    const interval = setInterval(() => {
      updateLeaderboard();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <aside className="w-full lg:w-80 bg-gray-900 text-white shadow-lg h-[100vh] lg:h-[90vh] z-[]">
      {/* Leaderboard Panel */}
      <div className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Leader Board</h2>
              <p className="text-gray-400 font-semibold text-sm">of the Day</p>
            </div>
            <div
              onClick={() => setTopPopupOpen(false)}
              className="cursor-pointer hidden lg:block"
            >
              <RxCross1 />
            </div>
          </div>
        </div>

        {/* User Position */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 z-20">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs mr-2">
                {userInfo?.email?.charAt(0).toUpperCase()}
              </span>
              <span>#{userInfo?.userId}</span>
            </div>
            <span className="text-green-400">${userInfo?.money}</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full mb-2">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: "0%" }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Your position:</span>
            <span>
              <GoInfinity className="h-5 w-5" />
            </span>
          </div>
        </div>

        {/* Rating Info */}
        <div className="flex items-center text-gray-400 text-sm mb-4 bg-[#19273e] p-2 rounded-lg ">
          <IoMdTrophy className="w-4 h-4 mr-2" />
          <span>How does this rating work?</span>
        </div>

        {/* Leaderboard Items */}
        <div className="flex-1 overflow-y-auto">
          {leaderboardData.map((item) => (
            <div
              key={`${item.id}-${Date.now()}`} // Add timestamp to force re-render
              className="flex justify-between items-center py-3 px-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center">
                {/* Medal or Place */}
                {item.medal ? (
                  <div className="relative mr-3">
                    <span
                      className={`${
                        item.medal === "gold"
                          ? "bg-yellow-500"
                          : item.medal === "silver"
                            ? "bg-gray-400"
                            : "bg-amber-600"
                      } w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold`}
                    >
                      {item.place}
                    </span>
                  </div>
                ) : (
                  <span className="w-6 h-6 flex items-center justify-center text-gray-400 text-sm mr-3">
                    {item.place}
                  </span>
                )}

                {/* Flag and Avatar */}
                <div className="flex items-center mr-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs mr-2">
                    {item.country.toUpperCase()}
                  </span>
                </div>

                {/* Name */}
                <span className="truncate max-w-[100px]">{item.name}</span>
              </div>

              {/* Amount */}
              <span className="text-green-400">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Top;
