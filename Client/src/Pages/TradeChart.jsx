import { useEffect, useRef, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCaretUp,
  FaList,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa6";
import { FiDollarSign } from "react-icons/fi";
import { MdWorkHistory } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import flag3 from "../assets/universalImage/Bangladesh-512.webp";
import flag4 from "../assets/universalImage/brazil.webp";
import flag5 from "../assets/universalImage/can.webp";
import flag2 from "../assets/universalImage/circle-flag-of-japan-free-png.webp";
import flag1 from "../assets/universalImage/circle-flag-of-usa-free-png.webp";
import flag6 from "../assets/universalImage/col.webp";
import flag7 from "../assets/universalImage/turky.webp";
import ChartSection from "../components/ChartSection";
import Sidebar from "../components/Sidebar";
import { getProfile } from "../redux/slices/authSlice";
import {
  betHistory,
  getPeriod,
  pendingHistory,
  placebet,
} from "../redux/slices/tradingReducer";

const TradeChart = () => {
  const { period, bet, traderhistory, pendingResult } = useSelector(
    (state) => state.trading,
  );
  const [investment, setInvestment] = useState(70);
  const [activeTab, setActiveTab] = useState("trades");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [history, setHistory] = useState(false);
  const [showButton, SetShowButton] = useState(false);
  const [comming, setComming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  // Track if initial fetch has happened
  const isInitialFetchDone = useRef(false);

  //30 sec
  const [seconds, setSeconds] = useState(30);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [times, setTime] = useState({
    minute: 0,
    secondtime1: 0,
    secondtime2: 0,
  });
  // console.log(period, "period");

  useEffect(() => {
    if (
      times.minute === 0 &&
      times.secondtime1 === 0 &&
      times.secondtime2 <= 5
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [times.minute, times.secondtime1, times.secondtime2]);

  useEffect(() => {
    const socket = io("http://localhost:8097", {
      path: "/ws",
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log(
        "✅ Socket.IO Connected:",
        socket.id,
        "| transport:",
        socket.io.engine.transport.name,
      );
    });

    socket.io.engine.on("upgrade", () => {
      console.log("⬆️ Socket.IO upgraded to:", socket.io.engine.transport.name);
    });

    socket.on("timeUpdate_20", (data) => {
      console.log("Received timeUpdate_20:", data);
      setTime({
        minute: Number(data?.minute) || 0,
        secondtime1: Number(data?.secondtime1) || 0,
        secondtime2: Number(data?.secondtime2) || 0,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO Connection Error:", error.message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  // Call once on mount
  useEffect(() => {
    if (!isInitialFetchDone.current) {
      dispatch(getPeriod({ page: 1, limit: 10 }));
      isInitialFetchDone.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(betHistory());
  }, [dispatch]);
  useEffect(() => {
    dispatch(pendingHistory());
  }, [dispatch]);

  useEffect(() => {
    if (
      isInitialFetchDone.current && // Only after initial fetch
      times.minute === 0 &&
      times.secondtime1 === 0 &&
      times.secondtime2 === 4
    ) {
      dispatch(getPeriod({ page: 1, limit: 10 }));
      dispatch(betHistory());
    }
  }, [times, dispatch]);

  useEffect(() => {
    if (
      isInitialFetchDone.current && // Only after initial fetch
      times.minute === 0 &&
      times.secondtime1 === 3 &&
      times.secondtime2 === 0
    ) {
      dispatch(betHistory());
    }
  }, [times, dispatch]);

  useEffect(() => {
    if (seconds === 0) return;
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [seconds]);

  useEffect(() => {
    if (seconds === 0) {
      const timeoutId = setTimeout(() => {
        setSeconds(30);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [seconds]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInvestmentChange = (amount) => {
    setInvestment((prev) => Math.max(0, prev + amount));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  //popup
  const [popup, setPopup] = useState(false);

  const handleUp = () => {
    dispatch(
      placebet({
        tradeType: "Crypto",
        amount: investment,
        period: period,
        bet: "up",
      }),
    ).then((res) => {
      if (res.payload.data.success) {
        toast.success(res.payload.data.message);
        dispatch(getProfile());
        dispatch(betHistory());
      } else {
        toast.error("Insufficient credit");
      }
    });
  };

  const handleDown = () => {
    dispatch(
      placebet({
        tradeType: "Crypto",
        amount: investment,
        period: period,
        bet: "down",
      }),
    ).then((res) => {
      if (res.payload.data.success) {
        toast.success(res.payload.data.message);
        dispatch(getProfile());
        dispatch(betHistory());
      } else {
        toast.error(res.payload.message);
      }
    });
  };

  const closePopup = () => {
    setPopup(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPopup(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 0: // Pending
        return "bg-yellow-500 bg-opacity-20 text-yellow-400";
      case 1: // Completed
        return "bg-green-500 bg-opacity-20 text-green-400";
      default: // Failed
        return "bg-red-500 bg-opacity-20 text-red-400";
    }
  };
  const [topPopupOpen, setTopPopupOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("CURRENCIES");

  const filters = ["CURRENCIES"];

  const assets = [
    {
      id: 1,
      pair: "USD/JPY",
      type: "OTC",
      change: 0.81,
      payout1: 93,
      payout2: 93,
      link: "/SideNavbar",
      flag1: flag1,
      flag2: flag2,
    },
    {
      id: 2,
      pair: "USD/BRL",
      type: "OTC",
      change: -1.22,
      payout1: 86,
      payout2: 86,
      flag1: flag1,
      flag2: flag4,
    },
    {
      id: 3,
      pair: "USD/BDT",
      type: "OTC",
      change: 0.45,
      payout1: 24,
      payout2: 93,
      flag1: flag1,
      flag2: flag3,
    },
    {
      id: 4,
      pair: "USD/TRY",
      type: "OTC",
      change: -0.32,
      payout1: 93,
      payout2: 93,
      flag1: flag1,
      flag2: flag7,
    },
    {
      id: 5,
      pair: "USD/COP",
      type: "OTC",
      change: -0.32,
      payout1: 93,
      payout2: 93,
      flag1: flag1,
      flag2: flag6,
    },
    {
      id: 6,
      pair: "NZD/CAD",
      type: "OTC",
      change: -0.32,
      payout1: 93,
      payout2: 93,
      flag1: flag1,
      flag2: flag5,
    },
  ];

  const filteredAssets = assets.filter(
    (asset) =>
      asset.pair.toLowerCase().includes(searchQuery.toLowerCase()) &&
      activeFilter === "CURRENCIES",
  );

  return (
    <div
      className={`flex ${
        isMobile ? "flex-col " : "h-screen"
      }  text-white bg-[#1c1f2d] lg:h-[89.5vh] overflow-auto lg:overflow-hidden`}
    >
      <div className="lg:w-[90px]">
        <Sidebar
          topPopupOpen={topPopupOpen}
          setTopPopupOpen={setTopPopupOpen}
        />
      </div>

      {/* Chart Section */}
      <div className={`${isMobile ? "w-full" : "w-4/5"} px-2 md:p-4`}>
        <div className=" rounded-xl h-full">
          <ChartSection investment={investment} />
        </div>
      </div>

      {/* Control Panel */}
      <div
        className={`${
          isMobile ? "w-full h-[25vh] justify-center" : "w-1/5"
        } flex flex-col space-y-2 md:space-y-4 p-2 md:p-2`}
      >
        {/* Trading Panel */}
        <div className="md:bg-[#2b3040] rounded p-2 md:p-4 h-full flex flex-col justify-around">
          <div className="justify-between items-center mb-3 md:mb-4 hidden lg:flex">
            <div className="flex items-center space-x-2">
              <span className="text-base md:text-lg font-semibold">
                USD/JPY (OTC)
              </span>
              <span className="bg-green-500 text-white px-2 py-0.5 md:py-1 rounded text-xs">
                93%
              </span>
            </div>
          </div>
          <span>
            <span
              onClick={() => SetShowButton((prev) => !prev)}
              className="flex items-center gap-1 cursor-pointer lg:hidden bg-[#2b3040] p-1 rounded w-fit h-[4vh]"
            >
              <div className="flex items-center relative w-8">
                <img
                  src={flag1}
                  alt=""
                  className="h-4 w-4 overflow-hidden rounded-full object-cover"
                />
                <img
                  src={flag2}
                  alt=""
                  className="h-4 w-4 overflow-hidden rounded-full object-cover absolute left-2.5"
                />
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-xs">USD/JPY (OTC)</span>
                <div className="text-[#ffa723] font-semibold text-xs">93%</div>
                <span>
                  {" "}
                  <FaCaretDown className="text-white text-xl" />
                </span>
              </div>
            </span>
          </span>

          {/* Time Selection */}
          {/* <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
              period
            </label>
            <div className="text-sm font-semibold w-full bg-gray-700 rounded p-1 md:p-2 text-center">
              {period}
            </div>
          </div> */}
          <div className="flex md:flex-col gap-1">
            {/* Time Selection */}
            <div className="mb-3 md:mb-2 w-full">
              <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                Time
              </label>
              <div className="text-sm font-semibold w-full bg-gray-700 rounded p-1 md:p-2 text-center h-[4vh] md:h-[5vh] flex items-center justify-center">
                0{times.minute}: {times.secondtime1}
                {times.secondtime2}s
              </div>
            </div>

            {/* Investment Selection */}
            <div className="mb-4 md:mb-4 w-full">
              <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                Investment
              </label>
              <div className="flex items-center justify-between bg-gray-700 rounded p-1 md:p-1 h-[4vh] md:h-[5vh]">
                <button
                  onClick={() => handleInvestmentChange(-1)}
                  className="bg-gray-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm"
                >
                  -
                </button>
                <div className="flex items-center space-x-1 text-center text-xs md:text-sm">
                  <p className="text-sm font-semibold size-fit mt-[2px]">
                    <FiDollarSign />
                  </p>
                  <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    placeholder="investment"
                    className="text-white font-semibold text-sm w-[50px] bg-transparent border-none focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleInvestmentChange(1)}
                  className="bg-gray-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3 mb-3 md:mb-4">
              <button
                disabled={isDisabled}
                onClick={handleUp} // Show the popup when clicked
                className="bg-[#0faf59] hover:bg-[#05c65e] hover:shadow-[0px_0px_5px] hover:shadow-[#05c65e] text-white px-5 py-2 md:px-10 md:py-3 rounded h-[5vh] md:h-[6vh] flex items-center justify-between font-bold space-x-1 md:space-x-2 transition-colors text-xs md:text-sm"
              >
                <span>Up</span>
                <FaArrowUp className="text-xs md:text-sm bg-[#ffffff3b] size-5 p-1 rounded-full" />
              </button>
              <p className="text-center text-sm hidden md:flex items-center justify-center">
                Your payout:{" "}
                <span className="font-semibold flex items-center">
                  {" "}
                  <FiDollarSign className="mt-1" />
                  {(investment + investment * 0.93).toFixed(2)}
                </span>
              </p>
              <button
                disabled={isDisabled}
                onClick={handleDown} // Show the popup when clicked
                className="bg-[#ff6251] hover:bg-[#ff402b] hover:shadow-[0px_0px_5px] hover:shadow-[#ff402b] text-white px-5 py-2 md:px-10 md:py-3 rounded h-[5vh] md:h-[6vh] flex items-center justify-between font-bold space-x-1 md:space-x-2 transition-colors text-xs md:text-sm"
              >
                <span>Down</span>
                <FaArrowDown className="text-xs md:text-sm bg-[#ffffff3b] size-5 p-1 rounded-full" />
              </button>
            </div>

            {/* Conditionally Render the Popup */}
            {popup && (
              <div className="relative">
                {/* Background Overlay */}
                <div className="fixed inset-0 bg-black bg-opacity-80 z-30 transition-opacity duration-500"></div>

                {/* Popup Content */}
                <div
                  className="sm:w-[350px] lg:w-[400px] md:w-[500px] h-[250px] bg-[#1c1f2d] z-50 fixed rounded-3xl overflow-hidden shadow-xl transition-transform duration-500 transform"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Close Button */}
                  <button
                    className="absolute top-2 right-2 text-white w-[30px] h-[30px] bg-[#464f50] flex items-center justify-center rounded"
                    onClick={closePopup} // Close the popup when clicked
                  >
                    X
                  </button>

                  {/* Popup Content */}
                  <div className="flex justify-center items-center h-full text-white text-center px-4">
                    <div className="text-lg">Your bet is successfully won!</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tooltip */}
          <div className="text-xxs md:text-xs text-gray-400 text-center p-1 md:p-2 hidden md:block">
            Opening deals by time is currently available only for OTC trading.
          </div>
        </div>

        {/* Trades/Orders Panel */}
        <div className="bg-[#2b3040] rounded flex-grow hidden md:flex flex-col">
          {/* Tabs */}
          <div className="flex border-b gap-2 border-gray-700">
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center rounded text-xs md:text-sm ${
                activeTab === "trades" ? "bg-gray-700" : "hover:bg-gray-700"
              } transition-colors`}
              onClick={() => setActiveTab("trades")}
            >
              <span className="mr-1 md:mr-2">Trades</span>
              <span className="bg-gray-600 text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {traderhistory?.length}
              </span>
            </button>
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center text-xs md:text-sm rounded ${
                activeTab === "orders" ? "bg-gray-700" : "hover:bg-gray-700"
              } transition-colors`}
              onClick={() => setActiveTab("orders")}
            >
              <FaList className="mr-1 md:mr-2 text-xs md:text-sm" />
              <span className="bg-gray-600 text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {pendingResult?.length || "0"}
              </span>
            </button>
          </div>

          {/* Content */}
          <div
            className={`flex-grow p-2 md:p-2 ${
              isExpanded ? "block" : "hidden"
            }`}
          >
            {activeTab === "trades" ? (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[40vh]">
                    {traderhistory?.map((trade) => (
                      <div className="border-b border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center relative w-8">
                            <img
                              src={flag1}
                              alt=""
                              className="h-4 w-4 overflow-hidden rounded-full object-cover"
                            />
                            <img
                              src={flag2}
                              alt=""
                              className="h-4 w-4 overflow-hidden rounded-full object-cover absolute left-2.5"
                            />
                          </div>
                          <div className="flex justify-between item-center w-full">
                            <span className="text-gray-200 text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-gray-400 text-sm font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-200 text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-orange-400"
                                  : trade.getAmount > 0
                                    ? "text-green-500"
                                    : "text-red-500"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "$" + trade.getAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[40vh]">
                    {pendingResult?.map((trade) => (
                      <div className="border-b border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center relative w-8">
                            <img
                              src={flag1}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover"
                            />
                            <img
                              src={flag2}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                            />
                          </div>
                          <div className="flex justify-between item-center w-full">
                            <span className="text-gray-200 text-base font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-200 text-base font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-base font-semibold ${
                                trade.status === 0
                                  ? "text-orange-400"
                                  : trade.getAmount > 0
                                    ? "text-green-500"
                                    : "text-red-500"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "$" + trade.getAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            className="w-full py-1 md:py-2 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center"
            onClick={toggleExpand}
          >
            <FaCaretUp
              className={`transition-transform text-xs md:text-sm ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="absolute top-20 left-2 block md:hidden">
        <div
          onClick={() => setHistory(!history)}
          className="text-white bg-[#2b3040] rounded p-1"
        >
          <MdWorkHistory className="text-2xl" />
        </div>
      </div>
      {history && (
        <div className="bg-[#2b3040] rounded flex-grow md:flex flex-col w-full absolute bottom-10 z-20">
          {/* Tabs */}
          <div className="flex border-b gap-2 border-gray-700">
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center rounded text-xs md:text-sm ${
                activeTab === "trades" ? "bg-gray-700" : "hover:bg-gray-700"
              } transition-colors`}
              onClick={() => setActiveTab("trades")}
            >
              <span className="mr-1 md:mr-2">Trades</span>
              <span className="bg-gray-600 text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {traderhistory?.length}
              </span>
            </button>
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center text-xs md:text-sm rounded ${
                activeTab === "orders" ? "bg-gray-700" : "hover:bg-gray-700"
              } transition-colors`}
              onClick={() => setActiveTab("orders")}
            >
              <FaList className="mr-1 md:mr-2 text-xs md:text-sm" />
              <span className="bg-gray-600 text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {pendingResult?.length || "0"}
              </span>
            </button>
          </div>

          {/* Content */}
          <div
            className={`flex-grow p-2 md:p-2 ${
              isExpanded ? "block" : "hidden"
            }`}
          >
            {activeTab === "trades" ? (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[30vh]">
                    {traderhistory?.map((trade) => (
                      <div className="border-b border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center relative w-8">
                            <img
                              src={flag1}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover"
                            />
                            <img
                              src={flag2}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                            />
                          </div>
                          <div className="flex justify-between item-center w-full">
                            <span className="text-gray-200 text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-200 text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-orange-400"
                                  : trade.getAmount > 0
                                    ? "text-green-500"
                                    : "text-red-500"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "$" + trade.getAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[40vh]">
                    {pendingResult?.map((trade) => (
                      <div className="border-b border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center relative w-8">
                            <img
                              src={flag1}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover"
                            />
                            <img
                              src={flag2}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                            />
                          </div>
                          <div className="flex justify-between item-center w-full">
                            <span className="text-gray-200 text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-200 text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-orange-400"
                                  : trade.getAmount > 0
                                    ? "text-green-500"
                                    : "text-red-500"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "$" + trade.getAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            className="w-full py-1 md:py-2 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center"
            onClick={toggleExpand}
          >
            <FaCaretUp
              className={`transition-transform text-xs md:text-sm ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
      )}

      {showButton && (
        <div className="absolute top-0 h-[100vh] z-50 bg-[#191919]">
          <div className="bg-[#191919]md shadow-md w-full full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="font-semibold text-lg text-white">
                Select trade pair
              </h3>
              <button
                onClick={() => SetShowButton(false)}
                className="text-white hover:text-gray-100 bg-[#2e2d2d] p-2 rounded"
              >
                <FaTimes />
              </button>
            </div>

            {/* Filters */}
            <div className="flex p-4 border-b border-gray-700">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`px-1 text-xs font-medium ${
                    activeFilter === filter
                      ? " text-white rounded-sm bg-blue-500"
                      : "text-white hover:text-gray-100"
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Search and Favorites */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <div className="relative w-[90%]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-white" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border-none rounded leading-5 bg-[#3b3b3b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-y-auto h-[calc(400px-0px)]">
              <table className=" divide-y divide-gray-700">
                <thead className="bg-[#191919] sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell"
                    >
                      24h change
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      Profit 30 sec
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      1+ min
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#191919] divide-y divide-gray-700">
                  {filteredAssets.map((asset, index) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-[#232323] cursor-pointer"
                      onClick={() => {
                        if (index === 0) {
                          navigate("/SideNavbar");
                          SetShowButton(false);
                        } else {
                          setComming(true);
                          SetShowButton(false);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            className="mr-2 text-gray-400 hover:text-yellow-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFavorites((prev) =>
                                prev.includes(asset.id)
                                  ? prev.filter((id) => id !== asset.id)
                                  : [...prev, asset.id],
                              );
                            }}
                          >
                            <span>
                              <div className="flex items-center relative w-8">
                                <img
                                  src={asset.flag1}
                                  alt=""
                                  className="h-4 w-4 overflow-hidden rounded-full object-cover"
                                />
                                <img
                                  src={asset.flag2}
                                  alt=""
                                  className="h-4 w-4 overflow-hidden rounded-full object-cover absolute left-2.5"
                                />
                              </div>
                            </span>
                          </button>
                          <div className="flex items-center text-xs">
                            <span className="text-white">
                              {asset.pair}
                              <span className="text-gray-400 ml-1">
                                ({asset.type})
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div
                          className={`flex items-center ${
                            asset.change >= 0
                              ? "text-green-500"
                              : "text-red-500"
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-orange-400">
                          {asset.payout1}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-orange-400">
                          {asset.payout2}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {comming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2b3040] p-6 rounded text-center shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-2">Coming Soon!</h2>
            <p className="text-gray-300">
              This chart is not available at the moment. For technical reasons,
              we cannot show the chart of this pair, please choose another
              trading pair.
            </p>
            <button
              onClick={() => setComming(false)}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded "
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeChart;
