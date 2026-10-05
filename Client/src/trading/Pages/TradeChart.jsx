import { useEffect, useRef, useState } from "react";
// MAIN app store - trading bets deduct from the main wallet, so after a
// bet the main profile is refreshed to update the navbar instantly.
import mainStore from "../../redux/store";
import { getProfile } from "../../redux/slices/authSlice";
import {
  FaArrowDown,
  FaArrowUp,
  FaCaretUp,
  FaList,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa6";
import { MdWorkHistory } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import flag3 from "../assets/universalImage/Bangladesh-512.webp";
import flag4 from "../assets/universalImage/brazil.webp";
import flag5 from "../assets/universalImage/can.webp";
import flag2 from "../assets/universalImage/circle-flag-of-japan-free-png.webp";
import flag1 from "../assets/universalImage/circle-flag-of-usa-free-png.webp";
import flag6 from "../assets/universalImage/col.webp";
import flag7 from "../assets/universalImage/turky.webp";

import ChartSection from "../components/ChartSection";
import { getUser } from "../Redux/Reducer/authReducer";
import {
  betHistory,
  getPeriod,
  pendingHistory,
  placebet,
} from "../Redux/Reducer/betReducer";
import { subscribeSocket } from "../Redux/socket";

const tokken = localStorage.getItem("token");

console.log("tokken in trade chart:", tokken);

const TradeChart = () => {
  const { period, bet, traderhistory, pendingResult } = useSelector(
    (state) => state.bet,
  );

  // Investment can now temporarily be an empty string
  const [investment, setInvestment] = useState(70);

  const [activeTab, setActiveTab] = useState("trades");
  const [isExpanded, setIsExpanded] = useState(true);
  // The app renders in a fixed phone-width column on every screen —
  // always use the mobile chart layout
  const [isMobile, setIsMobile] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [history, setHistory] = useState(false);
  const [showButton, SetShowButton] = useState(false);
  const [comming, setComming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const isInitialFetchDone = useRef(false);

  // 30 sec
  const [seconds, setSeconds] = useState(30);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [times, setTime] = useState({
    minute: 0,
    secondtime1: 0,
    secondtime2: 0,
  });

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

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
    const unsubscribe = subscribeSocket((data) => {
      if (data.event === "timeUpdate_30") {
        setTime({
          minute: data.minute,
          secondtime1: data.secondtime1,
          secondtime2: data.secondtime2,
        });
      }
    });

    return unsubscribe;
  }, []);

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
      isInitialFetchDone.current &&
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
      isInitialFetchDone.current &&
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
      setIsMobile(true); // always mobile layout — fixed phone-width column
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const [popup, setPopup] = useState(false);
  const [placing, setPlacing] = useState(false);

  // ============================================================
  // REAL-TRADING BET TRACKING
  // activeBet   -> bet placed, waiting for the round to settle
  // resultPopup -> WIN/LOST card shown when the round settles
  // ============================================================
  const [activeBet, setActiveBet] = useState(null);
  const [resultPopup, setResultPopup] = useState(null);

  // Safe numeric value for calculations/API
  const numericInvestment = Number(investment) || 0;

  const handleUp = async () => {
    if (numericInvestment <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }
    if (placing) return;
    setPlacing(true);
    try {
      const res = await dispatch(
        placebet({
          tradeType: "Crypto",
          amount: numericInvestment,
          period: period,
          bet: "up",
        }),
      );
      if (res.payload?.data?.success) {
        toast.success(res.payload.data.message);
        dispatch(getUser());
        dispatch(betHistory());
        setActiveBet({
          period,
          amount: numericInvestment,
          bet: "up",
          placedAt: Date.now(),
        });
        // MAIN navbar instant update — the bet cut from the main wallet
        mainStore.dispatch(getProfile());
      } else {
        toast.error(res.payload?.data?.message || "Insufficient balance");
      }
    } finally {
      setPlacing(false);
    }
  };

  const handleDown = async () => {
    if (numericInvestment <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }
    if (placing) return;
    setPlacing(true);
    try {
      const res = await dispatch(
        placebet({
          tradeType: "Crypto",
          amount: numericInvestment,
          period: period,
          bet: "down",
        }),
      );
      if (res.payload?.data?.success) {
        toast.success(res.payload.data.message);
        dispatch(getUser());
        dispatch(betHistory());
        setActiveBet({
          period,
          amount: numericInvestment,
          bet: "down",
          placedAt: Date.now(),
        });
        // MAIN navbar instant update — the bet cut from the main wallet
        mainStore.dispatch(getProfile());
      } else {
        toast.error(
          res.payload?.data?.message ||
            res.payload?.message ||
            "Insufficient balance",
        );
      }
    } finally {
      setPlacing(false);
    }
  };

  // ============================================================
  // BET SETTLEMENT WATCHER — when the round settles, resolve the
  // active bet into a WIN/LOST result card (real-trading style).
  // ============================================================
  useEffect(() => {
    if (!activeBet || !Array.isArray(traderhistory)) return;

    const settled = traderhistory.find(
      (b) => Number(b.period) === Number(activeBet.period) && b.status !== 0,
    );
    if (!settled) return;

    if (settled.status === 1) {
      const payout = Number(settled.getAmount) || 0;
      setResultPopup({
        win: true,
        payout,
        profit: Number((payout - activeBet.amount).toFixed(2)),
        stake: activeBet.amount,
        betDir: activeBet.bet,
        result: settled.result,
        period: settled.period,
      });
    } else {
      setResultPopup({
        win: false,
        stake: activeBet.amount,
        betDir: activeBet.bet,
        result: settled.result,
        period: settled.period,
      });
    }

    setActiveBet(null);
    // Winner credit hit the main wallet — refresh the navbar
    mainStore.dispatch(getProfile());
  }, [traderhistory, activeBet]);

  // Auto-dismiss the result card
  useEffect(() => {
    if (!resultPopup) return;
    const t = setTimeout(() => setResultPopup(null), 6000);
    return () => clearTimeout(t);
  }, [resultPopup]);

  const closePopup = () => {
    setPopup(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPopup(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
      link: "/trading/SideNavbar",
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
      } text-white bg-[#0B0410]  overflow-auto `}
    >
      <div
        className={`
          transition-all duration-500 ease-in-out
          overflow-hidden
           hidden
          ${topPopupOpen ? "w-[550px] opacity-100" : "w-0 opacity-0"}
        `}
      ></div>

      {/* Chart Section */}
      <div className={`${isMobile ? "w-full" : "w-4/5"} px-2 `}>
        <div className="rounded-xl h-full relative">
          <ChartSection investment={numericInvestment} />

          {/* ============ BET BADGE — waiting result… → WIN/LOST ============ */}
          {(activeBet || resultPopup) &&
            (() => {
              const b = activeBet || {
                amount: resultPopup.stake,
                bet: resultPopup.betDir,
                period: resultPopup.period,
              };
              const isUp = b.bet === "up";
              const dirIcon = isUp ? "▲ UP" : "▼ DOWN";
              const dirColor = isUp ? "text-[#00E676]" : "text-[#FF5252]";

              // waiting state
              if (activeBet) {
                return (
                  <div className="absolute top-3 left-3 z-30 flex items-center gap-2 rounded-full border border-[#C77AFF]/60 bg-[#1C0F2B]/90 backdrop-blur-sm px-3.5 py-1.5 shadow-[0_0_14px_rgba(180,92,255,0.4)] animate-pulse">
                    <span className={`text-xs font-black ${dirColor}`}>
                      {dirIcon} ₹{b.amount}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Period {b.period} • waiting result…
                    </span>
                  </div>
                );
              }

              // settled state — WIN / LOST in the same badge
              const win = resultPopup.win;
              return (
                <div
                  className={`absolute top-3 left-3 z-30 flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur-sm ${
                    win
                      ? "border-[#00E676]/70 bg-[#07180f]/90 shadow-[0_0_16px_rgba(0,230,118,0.45)]"
                      : "border-[#FF5252]/70 bg-[#1a0d08]/90 shadow-[0_0_16px_rgba(255,82,82,0.4)]"
                  }`}
                >
                  <span className={`text-xs font-black ${dirColor}`}>
                    {dirIcon} ₹{b.amount}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      win ? "text-[#00E676]" : "text-[#FF5252]"
                    }`}
                  >
                    • {win ? `WIN +₹${resultPopup.profit}` : "LOST"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                    Period {b.period}
                  </span>
                </div>
              );
            })()}
        </div>
      </div>

      {/* Control Panel */}
      <div
        className={`${
          isMobile ? "w-full h-[25vh] justify-center mt-5 " : "w-1/5"
        } flex flex-col space-y-2  p-2 `}
      >
        {/* Trading Panel */}
        <div className=" rounded-[14px] border border-[#2a1b3d] shadow-[0_4px_18px_rgba(0,0,0,0.4)] p-2  h-full flex flex-col justify-around">
          {/* Pair Header */}
          <div className="justify-between items-center mb-3  hidden ">
            <div className="flex items-center justify-between w-full space-x-2">
              <span className="text-base  font-bold text-white leading-tight">
                USD/JPY <span className="block">(OTC)</span>
              </span>

              <span
                className={`${purpleGradient} text-white font-bold px-3 py-1.5 rounded-md text-sm`}
              >
                93%
              </span>
            </div>
          </div>

          {/* Mobile Pair Selector */}
          <span>
            <span
              onClick={() => SetShowButton((prev) => !prev)}
              className="flex items-center gap-1 cursor-pointer  bg-[#12061C] border border-[#2a1b3d] p-1 rounded-lg w-fit h-[4vh]"
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
                <span className="font-semibold text-xs text-white">
                  USD/JPY (OTC)
                </span>

                <div className="text-[#C77AFF] font-bold text-xs">93%</div>

                <span>
                  <FaCaretDown className="text-[#C77AFF] text-xl" />
                </span>
              </div>
            </span>
          </span>

          {/* Time + Investment */}
          <div className="flex  gap-1">
            {/* Time Selection */}
            <div className="mb-3  w-full">
              <label className="block text-xs  font-bold mb-1  text-gray-300">
                Time
              </label>

              <div className="text-sm font-bold w-full bg-[#12061C] border border-[#2a1b3d] rounded-[10px] p-1  text-center h-[4vh]  flex items-center justify-center text-[#C77AFF]">
                0{times.minute}: {times.secondtime1}
                {times.secondtime2}s
              </div>
            </div>

            {/* Investment Selection */}
            <div className="mb-4  w-full">
              <label className="block text-xs  font-bold mb-1  text-gray-300">
                Investment
              </label>

              <div className="flex items-center bg-[#12061C] border border-[#2a1b3d] rounded-[10px] px-3 h-[4vh]  focus-within:border-[#B45CFF]/60 focus-within:ring-2 focus-within:ring-[#B45CFF]/10 transition-all">
                {/* Rupee Icon */}
                <span className="text-[#C77AFF] text-base  font-bold mr-2">
                  ₹
                </span>

                {/* Custom Amount Input */}
                <input
                  type="number"
                  min="0"
                  value={investment}
                  onChange={(e) => {
                    setInvestment(e.target.value);
                  }}
                  placeholder="Enter amount"
                  className="w-full bg-transparent border-none outline-none text-white font-bold text-sm text-center placeholder:text-gray-600"
                />
              </div>

              {/* Quick amount chips */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[10, 50, 100, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInvestment(amt)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                      Number(investment) === amt
                        ? "border-[#C77AFF] bg-[#B45CFF]/20 text-white"
                        : "border-[#2a1b3d] bg-[#12061C] text-gray-400 hover:border-[#9B59B6]/50"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            {/* Action Buttons */}
            <div className="grid grid-cols-2  gap-2  mb-3 ">
              {/* UP */}
              <button
                disabled={isDisabled || numericInvestment <= 0 || placing}
                onClick={handleUp}
                className={`${purpleGradient} text-white px-5 py-2   rounded-[11px] h-[5vh]  flex items-center justify-between font-bold space-x-1  transition-all text-xs  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>{placing ? "..." : "Up"}</span>

                <FaArrowUp className="text-xs  bg-white/20 size-6 p-1 rounded-full" />
              </button>

              {/* Payout */}
              <p className="text-center text-sm hidden  items-center justify-center text-gray-300">
                Your payout:{" "}
                <span className="font-bold flex items-center text-white">
                  <span className="mt-1 text-[#C77AFF]">₹</span>

                  {(numericInvestment + numericInvestment * 0.93).toFixed(2)}
                </span>
              </p>

              {/* DOWN */}
              <button
                disabled={isDisabled || numericInvestment <= 0 || placing}
                onClick={handleDown}
                className="bg-[#1C0F2B] border-2 border-[#9B59B6]/50 hover:bg-[#2a1b3d] text-[#E74C3C] px-5 py-2   rounded-[11px] h-[5vh]  flex items-center justify-between font-bold space-x-1  transition-all text-xs  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Down</span>

                <FaArrowDown className="text-xs  bg-red-500/20 text-[#E74C3C] size-6 p-1 rounded-full" />
              </button>
            </div>

            {/* Popup */}
            {popup && (
              <div className="relative">
                <div className="fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-500"></div>

                <div
                  className="sm:w-[350px]   h-[250px] bg-[#1C0F2B] z-50 fixed rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[#2a1b3d] transition-transform duration-500 transform"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <button
                    className={`absolute top-2 right-2 text-white w-[30px] h-[30px] ${purpleGradient} flex items-center justify-center rounded`}
                    onClick={closePopup}
                  >
                    X
                  </button>

                  <div className="flex justify-center items-center h-full text-white text-center px-4">
                    <div className="text-lg">Your bet is successfully won!</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tooltip */}
          <div className="text-xxs  text-gray-400 text-center p-2  hidden  items-center justify-center gap-2 bg-[#12061C] border border-[#2a1b3d] rounded-[10px] leading-relaxed">
            <span className="text-[#C77AFF] text-base">◷</span>

            <span>
              Opening deals by time is currently available only for OTC trading.
            </span>
          </div>
        </div>

        {/* Trades/Orders Panel */}
        <div className="bg-[#1C0F2B] border border-[#2a1b3d] rounded flex-grow hidden  flex-col">
          {/* Tabs */}
          <div className="flex border-b gap-2 border-[#2a1b3d]">
            <button
              className={`flex-1 py-2  flex items-center justify-center rounded text-xs  ${
                activeTab === "trades"
                  ? `${purpleGradient} text-white`
                  : "text-gray-400 hover:bg-[#2a1b3d]"
              } transition-colors`}
              onClick={() => setActiveTab("trades")}
            >
              <span className="mr-1 ">Trades</span>

              <span className="bg-[#9B59B6]/30 text-white px-1  py-0.5 rounded text-xxs ">
                {traderhistory?.length}
              </span>
            </button>

            <button
              className={`flex-1 py-2  flex items-center justify-center text-xs  rounded ${
                activeTab === "orders"
                  ? `${purpleGradient} text-white`
                  : "text-gray-400 hover:bg-[#2a1b3d]"
              } transition-colors`}
              onClick={() => setActiveTab("orders")}
            >
              <FaList className="mr-1  text-xs " />

              <span className="bg-[#9B59B6]/30 text-white px-1  py-0.5 rounded text-xxs ">
                {pendingResult?.length || "0"}
              </span>
            </button>
          </div>

          {/* Content */}
          <div
            className={`flex-grow p-2  ${
              isExpanded ? "block" : "hidden"
            }`}
          >
            {activeTab === "trades" ? (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[40vh]">
                    {traderhistory?.map((trade) => (
                      <div
                        key={trade?._id || trade?.id}
                        className="border-b border-[#2a1b3d]"
                      >
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
                            <span className="text-white text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>

                            <span className="text-gray-400 text-sm font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm font-semibold">
                              {trade.amount}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#F1C40F]"
                                  : trade.getAmount > 0
                                    ? "text-[#00E676]"
                                    : "text-red-400"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "₹" + trade.getAmount}
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
                      <div
                        key={trade?._id || trade?.id}
                        className="border-b border-[#2a1b3d]"
                      >
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
                            <span className="text-white text-base font-semibold">
                              USD/JPY ( OT ....
                            </span>

                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-base font-semibold">
                              {trade.amount}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`text-base font-semibold ${
                                trade.status === 0
                                  ? "text-[#F1C40F]"
                                  : trade.getAmount > 0
                                    ? "text-[#00E676]"
                                    : "text-red-400"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "₹" + trade.getAmount}
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
            className="w-full py-1  bg-[#12061C] hover:bg-[#2a1b3d] transition-colors flex items-center justify-center text-[#C77AFF]"
            onClick={toggleExpand}
          >
            <FaCaretUp
              className={`transition-transform text-xs  ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile History Button */}
      <div className="absolute top-20 left-2 block ">
        <div
          onClick={() => setHistory(!history)}
          className="text-white bg-[#1C0F2B] border border-[#2a1b3d] rounded p-1"
        >
          <MdWorkHistory className="text-2xl text-[#C77AFF]" />
        </div>
      </div>

      {/* Mobile History */}
      {history && (
        <div className="bg-[#1C0F2B] border border-[#2a1b3d] rounded flex-grow  flex-col w-full absolute bottom-10 z-20">
          <div className="flex border-b gap-2 border-[#2a1b3d]">
            <button
              className={`flex-1 py-2  flex items-center justify-center rounded text-xs  ${
                activeTab === "trades"
                  ? `${purpleGradient} text-white`
                  : "text-gray-400 hover:bg-[#2a1b3d]"
              } transition-colors`}
              onClick={() => setActiveTab("trades")}
            >
              <span className="mr-1 ">Trades</span>

              <span className="bg-[#9B59B6]/30 text-white px-1  py-0.5 rounded text-xxs ">
                {traderhistory?.length}
              </span>
            </button>

            <button
              className={`flex-1 py-2  flex items-center justify-center text-xs  rounded ${
                activeTab === "orders"
                  ? `${purpleGradient} text-white`
                  : "text-gray-400 hover:bg-[#2a1b3d]"
              } transition-colors`}
              onClick={() => setActiveTab("orders")}
            >
              <FaList className="mr-1  text-xs " />

              <span className="bg-[#9B59B6]/30 text-white px-1  py-0.5 rounded text-xxs ">
                {pendingResult?.length || "0"}
              </span>
            </button>
          </div>

          <div
            className={`flex-grow p-2  ${
              isExpanded ? "block" : "hidden"
            }`}
          >
            {activeTab === "trades" ? (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[30vh]">
                    {traderhistory?.map((trade) => (
                      <div
                        key={trade?._id || trade?.id}
                        className="border-b border-[#2a1b3d]"
                      >
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
                            <span className="text-white text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>

                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm font-semibold">
                              {trade.amount}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#F1C40F]"
                                  : trade.getAmount > 0
                                    ? "text-[#00E676]"
                                    : "text-red-400"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "₹" + trade.getAmount}
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
                      <div
                        key={trade?._id || trade?.id}
                        className="border-b border-[#2a1b3d]"
                      >
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
                            <span className="text-white text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>

                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm font-semibold">
                              {trade.amount}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#F1C40F]"
                                  : trade.getAmount > 0
                                    ? "text-[#00E676]"
                                    : "text-red-400"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "₹" + trade.getAmount}
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

          <button
            className="w-full py-1  bg-[#12061C] hover:bg-[#2a1b3d] transition-colors flex items-center justify-center text-[#C77AFF]"
            onClick={toggleExpand}
          >
            <FaCaretUp
              className={`transition-transform text-xs  ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
      )}

      {/* Trade Pair Selector */}
      {showButton && (
        <div className="fixed inset-0 z-[999] bg-black/70 flex items-start  justify-center">
          <div className="relative w-full h-full    bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4  py-3.5  border-b border-[#2a1b3d] bg-[#12061C] shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-6 rounded-full ${purpleGradient}`} />

                <h3 className="font-bold text-base  text-white">
                  Select trade pair
                </h3>
              </div>

              <button
                onClick={() => SetShowButton(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1C0F2B] border border-[#2a1b3d] text-[#C77AFF] hover:bg-[#2a1b3d] hover:border-[#9B59B6]/50 transition-all"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* FILTER */}
            <div className="px-4  py-2.5 border-b border-[#2a1b3d] bg-[#12061C] shrink-0">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative px-2 py-2 text-[11px]  font-bold tracking-wide transition-all ${
                    activeFilter === filter
                      ? "text-[#C77AFF]"
                      : "text-gray-500 hover:text-[#9B59B6]"
                  }`}
                >
                  {filter}

                  {activeFilter === filter && (
                    <span
                      className={`absolute left-1 right-1 bottom-0 h-[2px] rounded-full ${purpleGradient}`}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* SEARCH */}
            <div className="px-4  py-3 border-b border-[#2a1b3d] bg-[#12061C] shrink-0">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-[#9B59B6]" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trade pair..."
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/20 transition-all"
                />
              </div>
            </div>

            {/* MOBILE LIST */}
            <div className=" flex-1 overflow-y-auto bg-[#12061C] p-3 space-y-2">
              {filteredAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (index === 0) {
                      navigate("/trading/SideNavbar");
                      SetShowButton(false);
                    } else {
                      setComming(true);
                      SetShowButton(false);
                    }
                  }}
                  className="w-full bg-[#1C0F2B] rounded-xl border border-[#2a1b3d] px-3 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.3)] active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <button
                        className="relative w-10 h-7 mr-3 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();

                          setFavorites((prev) =>
                            prev.includes(asset.id)
                              ? prev.filter((id) => id !== asset.id)
                              : [...prev, asset.id],
                          );
                        }}
                      >
                        <img
                          src={asset.flag1}
                          alt=""
                          className="absolute left-0 top-0 w-7 h-7 rounded-full object-cover border-2 border-[#1C0F2B] shadow-sm z-10"
                        />

                        <img
                          src={asset.flag2}
                          alt=""
                          className="absolute left-[14px] top-0 w-7 h-7 rounded-full object-cover border-2 border-[#1C0F2B] shadow-sm"
                        />
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {asset.pair}
                        </span>

                        <span className="text-[10px] text-gray-500 uppercase mt-0.5">
                          {asset.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`flex items-center text-xs font-bold ${
                          asset.change >= 0
                            ? "text-[#00E676]"
                            : "text-[#E74C3C]"
                        }`}
                      >
                        {asset.change >= 0 ? (
                          <FaArrowUp className="mr-1 text-[10px]" />
                        ) : (
                          <FaArrowDown className="mr-1 text-[10px]" />
                        )}
                        {Math.abs(asset.change)}%
                      </span>

                      <span
                        className={`px-2 py-1 rounded-md ${purpleGradient} text-white text-xs font-bold`}
                      >
                        {asset.payout1}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#2a1b3d] flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      Profit 30 sec
                    </span>

                    <span className="text-[10px] font-semibold text-[#C77AFF]">
                      1+ min: {asset.payout2}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden  flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-[#2a1b3d]">
                <thead className="bg-[#12061C] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                      Name
                    </th>

                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                      24h change
                    </th>

                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                      Profit 30 sec
                    </th>

                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                      1+ min
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-[#1C0F2B] divide-y divide-[#2a1b3d]">
                  {filteredAssets.map((asset, index) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-[#2a1b3d]/50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (index === 0) {
                          navigate("/trading/SideNavbar");
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
                            className="mr-3 text-gray-500 hover:text-[#C77AFF] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();

                              setFavorites((prev) =>
                                prev.includes(asset.id)
                                  ? prev.filter((id) => id !== asset.id)
                                  : [...prev, asset.id],
                              );
                            }}
                          >
                            <div className="flex items-center relative w-8">
                              <img
                                src={asset.flag1}
                                alt=""
                                className="h-5 w-5 rounded-full object-cover border border-[#1C0F2B]"
                              />

                              <img
                                src={asset.flag2}
                                alt=""
                                className="h-5 w-5 rounded-full object-cover absolute left-2.5 border border-[#1C0F2B]"
                              />
                            </div>
                          </button>

                          <span className="text-white font-semibold text-sm">
                            {asset.pair}

                            <span className="text-gray-500 ml-1 font-normal">
                              ({asset.type})
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`flex items-center font-semibold ${
                            asset.change >= 0
                              ? "text-[#00E676]"
                              : "text-[#E74C3C]"
                          }`}
                        >
                          {asset.change >= 0 ? (
                            <FaArrowUp className="mr-1 text-xs" />
                          ) : (
                            <FaArrowDown className="mr-1 text-xs" />
                          )}
                          {Math.abs(asset.change)}%
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/30 text-[#C77AFF] text-xs font-bold">
                          {asset.payout1}%
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/30 text-[#C77AFF] text-xs font-bold">
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

      {/* Coming Soon */}
      {comming && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1C0F2B] border border-[#9B59B6]/40 p-6 rounded text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-2 text-white">
              Coming Soon!
            </h2>

            <p className="text-gray-400">
              This chart is not available at the moment. For technical reasons,
              we cannot show the chart of this pair, please choose another
              trading pair.
            </p>

            <button
              onClick={() => setComming(false)}
              className={`mt-4 px-4 py-2 ${purpleGradient} text-white rounded`}
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
