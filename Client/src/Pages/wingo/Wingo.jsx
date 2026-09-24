import debounce from "lodash/debounce";
import { Crown, Gem, Shuffle, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCircle, FaMinus, FaPlus } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";

import EmptyData from "../../components/EmptyData.jsx";
import { host } from "../../redux/slices/api.js";
import { getProfile } from "../../redux/slices/authSlice.js";
import {
  getMyBets,
  getOrderList,
  placeBet,
} from "../../redux/slices/betSlice.js";
import { getCurrencyRates } from "../../redux/slices/currencyRateSlice.js";
import "./wingo.css";

// Assets
import Audio1 from "../../assets/audio/di1.mp3";
import Audio2 from "../../assets/audio/di2.mp3";
import EightImg from "../../assets/eight.png";
import FiveImg from "../../assets/five.png";
import FourImg from "../../assets/four.png";
import NineImg from "../../assets/nine.png";
import OneImg from "../../assets/one.png";
import SevenImg from "../../assets/seven.png";
import SixImg from "../../assets/six.png";
import ThreeImg from "../../assets/three.png";
import TimeImg from "../../assets/time.png";
import TimeActiveImg from "../../assets/time_aactive.png";
import TwoImg from "../../assets/two.png";
import ZeroImg from "../../assets/zero.png";

// Constants
const WinImg = "https://i.ibb.co/ssJ2HLw/win-popup.png";
const LoseImg = "https://i.ibb.co/8zTQQmx/loss-popup.png";

const ImgData = [
  ZeroImg,
  OneImg,
  TwoImg,
  ThreeImg,
  FourImg,
  FiveImg,
  SixImg,
  SevenImg,
  EightImg,
  NineImg,
];

const X_DATA = [1, 5, 10, 20, 50, 100];
const credit_OPTIONS = [1, 10, 100, 1000];
const TIME_OPTIONS = [
  { value: 10, label: "30s", game: "wingo10" },
  { value: 1, label: "1Min", game: "wingo" },
  { value: 3, label: "3Min", game: "wingo3" },
  { value: 5, label: "5Min", game: "wingo5" },
];

// Game mapping for socket events
const GAME_EVENT_MAP = {
  10: { event: "timeUpdate_30", game: "wingo10", type: 10 },
  1: { event: "timeUpdate_11", game: "wingo", type: 1 },
  3: { event: "timeUpdate_3", game: "wingo3", type: 3 },
  5: { event: "timeUpdate_5", game: "wingo5", type: 5 },
};

const socket = io(host, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// ============================================================
// CURRENCY - USER COUNTRY BASED
// ============================================================
const COUNTRY_ALIASES = {
  in: "IN",
  india: "IN",
  au: "AU",
  australia: "AU",
  pk: "PK",
  pakistan: "PK",
  bd: "BD",
  bangladesh: "BD",
  np: "NP",
  nepal: "NP",
  ae: "AE",
  uae: "AE",
  dubai: "AE",
  "united arab emirates": "AE",
  ca: "CA",
  canada: "CA",
  us: "US",
  usa: "US",
  "united states": "US",
  gb: "GB",
  uk: "GB",
  "united kingdom": "GB",
  nz: "NZ",
  "new zealand": "NZ",
  sg: "SG",
  singapore: "SG",
  my: "MY",
  malaysia: "MY",
  ph: "PH",
  philippines: "PH",
  jp: "JP",
  japan: "JP",
  cn: "CN",
  china: "CN",
  th: "TH",
  thailand: "TH",
  id: "ID",
  indonesia: "ID",
  vn: "VN",
  vietnam: "VN",
  tr: "TR",
  turkey: "TR",
  sa: "SA",
  "saudi arabia": "SA",
  za: "ZA",
  "south africa": "ZA",
  ng: "NG",
  nigeria: "NG",
  ke: "KE",
  kenya: "KE",
  br: "BR",
  brazil: "BR",
  mx: "MX",
  mexico: "MX",
  de: "DE",
  germany: "DE",
  fr: "FR",
  france: "FR",
  it: "IT",
  italy: "IT",
  es: "ES",
  spain: "ES",
};

const CURRENCY_CONFIG = {
  IN: { code: "INR", symbol: "₹", locale: "en-IN" },
  NP: { code: "NPR", symbol: "रू", locale: "en-IN" },
  AU: { code: "AUD", symbol: "A$", locale: "en-AU" },
  PK: { code: "PKR", symbol: "₨", locale: "en-PK" },
  BD: { code: "BDT", symbol: "৳", locale: "en-BD" },
  AE: { code: "AED", symbol: "د.إ", locale: "en-AE" },
  CA: { code: "CAD", symbol: "C$", locale: "en-CA" },
  US: { code: "USD", symbol: "$", locale: "en-US" },
  GB: { code: "GBP", symbol: "£", locale: "en-GB" },
  NZ: { code: "NZD", symbol: "NZ$", locale: "en-NZ" },
  SG: { code: "SGD", symbol: "S$", locale: "en-SG" },
  MY: { code: "MYR", symbol: "RM", locale: "en-MY" },
  PH: { code: "PHP", symbol: "₱", locale: "en-PH" },
  JP: { code: "JPY", symbol: "¥", locale: "ja-JP" },
  CN: { code: "CNY", symbol: "¥", locale: "zh-CN" },
  TH: { code: "THB", symbol: "฿", locale: "en-TH" },
  ID: { code: "IDR", symbol: "Rp", locale: "id-ID" },
  VN: { code: "VND", symbol: "₫", locale: "vi-VN" },
  TR: { code: "TRY", symbol: "₺", locale: "tr-TR" },
  SA: { code: "SAR", symbol: "﷼", locale: "en-SA" },
  ZA: { code: "ZAR", symbol: "R", locale: "en-ZA" },
  NG: { code: "NGN", symbol: "₦", locale: "en-NG" },
  KE: { code: "KES", symbol: "KSh", locale: "en-KE" },
  BR: { code: "BRL", symbol: "R$", locale: "pt-BR" },
  MX: { code: "MXN", symbol: "MX$", locale: "es-MX" },
  DE: { code: "EUR", symbol: "€", locale: "de-DE" },
  FR: { code: "EUR", symbol: "€", locale: "fr-FR" },
  IT: { code: "EUR", symbol: "€", locale: "it-IT" },
  ES: { code: "EUR", symbol: "€", locale: "es-ES" },
};

const normalizeCountryCode = (country) => {
  if (!country) return "IN";
  const key = String(country).trim().toLowerCase();
  return COUNTRY_ALIASES[key] || key.toUpperCase();
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const Wingo = () => {
  const dispatch = useDispatch();

  const authUser = useSelector((state) => state.auth?.user || null);
  const currencyRates = useSelector(
    (state) => state.currencyRate?.currencies || [],
  );

  // ---- State ----
  const [wingoPeriodListData, setWingoPeriodListData] = useState(null);
  const [wingoHistoryData, setWingoHistoryData] = useState(null);
  const [loader, setLoader] = useState(false);
  const [messages, setMessage] = useState("");
  const [activeTime, setActiveTime] = useState(10);
  const [activeX, setActiveX] = useState(0);
  const [gameHistory, setGameHistory] = useState("ghistory");
  const [openPopup, setOpenPopup] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [openHowtoPlay, setHowtoPlay] = useState(false);
  const [details, setDetails] = useState(null);
  const [refershPopup, setRefeshPopup] = useState(false);
  const [pageno, setPage] = useState(1);
  const [pageto, setPageto] = useState(10);
  const [typeid1, setTypeid1] = useState(10);
  const [minutetime1, setMinutetime1] = useState(0);
  const [minutetime2, setMinutetime2] = useState(0);
  const [secondtime1, setSecondtime1] = useState(0);
  const [secondtime2, setSecondtime2] = useState(0);
  const [betAlert, setBetAlert] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [activeVoice, setActiveVoice] = useState(true);
  const [winResult, setWinResult] = useState(null);
  const [resultPopup, setResultPopup] = useState(false);
  const [copyPopup, setCopyPopup] = useState(false);
  const [selectBet, setSelectBet] = useState("");
  const [animate, setAnimate] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [credit, setcredit] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [numbers, setNumbers] = useState([4, 16, 3, 14, 18, 18, 1, 9, 7, 22]);
  const [number2, setNumber2] = useState([4, 1, 9, 14, 18, 11, 10, 9, 12, 22]);
  const [number3, setNumber3] = useState([4, 16, 3, 14, 18, 18, 1, 9, 7, 22]);
  const [number4, setNumber4] = useState([4, 16, 3, 14, 18, 18, 1, 9, 7, 22]);
  const [periodData, setPeriodData] = useState(null);
  const [lastResultPeriod, setLastResultPeriod] = useState(null);
  const [hasUserBet, setHasUserBet] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCountdownOverlay, setShowCountdownOverlay] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(0);
  const [activeBigSmall, setActiveBigSmall] = useState(null);

  // ---- Refs ----
  const intervalRef = useRef(null);
  const calledRef = useRef(false);
  const isConnectedRef = useRef(false);
  const audio1Ref = useRef(new Audio(Audio1));
  const audio2Ref = useRef(new Audio(Audio2));
  const timerIntervalRef = useRef(null);
  const resultProcessedRef = useRef(new Set());
  const displayedResultRef = useRef(new Set());
  const lastPlayedCountdownRef = useRef(null);

  // ---- Router ----
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const Game = queryParams.get("Game");

  // ---- Derived ----
  const totalAmount = credit * multiplier;
  const currentGameInfo = GAME_EVENT_MAP[typeid1] || GAME_EVENT_MAP[10];

  useEffect(() => {
    if (currencyRates.length === 0) {
      dispatch(getCurrencyRates());
    }
  }, [dispatch, currencyRates.length]);

  const currentCountry = authUser?.country || "india";
  const userCountryCode = normalizeCountryCode(currentCountry);
  const currencyConfig = CURRENCY_CONFIG[userCountryCode] || CURRENCY_CONFIG.IN;

  const userCurrencyRate = useMemo(() => {
    if (userCountryCode === "IN") return null;
    const rates = Array.isArray(currencyRates) ? currencyRates : [];
    return (
      rates.find((item) => {
        const itemCountry = String(
          item?.countryCode ?? item?.country_code ?? item?.country ?? "",
        )
          .trim()
          .toUpperCase();
        return itemCountry === userCountryCode && item?.status !== false;
      }) || null
    );
  }, [currencyRates, userCountryCode]);

  const formatMoney = (amount, sign = "") => {
    const numericAmount = Number(amount);
    const baseAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
    const rate = Number(userCurrencyRate?.rate);
    const convertedAmount =
      userCountryCode === "IN"
        ? baseAmount
        : Number.isFinite(rate) && rate > 0
          ? baseAmount / rate
          : baseAmount;
    const formatted = convertedAmount.toLocaleString(currencyConfig.locale, {
      minimumFractionDigits: currencyConfig.code === "JPY" ? 0 : 2,
      maximumFractionDigits: currencyConfig.code === "JPY" ? 0 : 2,
    });
    return `${sign}${currencyConfig.symbol} ${formatted}`;
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const getRandomNumbers = (length, max) =>
    Array.from({ length }, () => Math.floor(Math.random() * max) + 1);

  const getColorClass = (value, type = "text") => {
    if ([1, 3, 7, 9].includes(Number(value))) return `${type}-green-500`;
    if ([2, 4, 6, 8].includes(Number(value))) return `${type}-red-500`;
    return "";
  };

  const getBetLabel = (bet) => {
    const map = { x: "Green", d: "Red", t: "Violet", l: "Big", n: "Small" };
    return map[bet] || bet;
  };

  const getBetClass = (bet) => {
    const map = {
      x: "text-green-400",
      d: "text-red-400",
      t: "text-violet-400",
      l: "text-yellow-400",
      n: "text-blue-400",
    };
    if (map[bet]) return map[bet];
    const num = Number(bet);
    if ([1, 3, 7, 9].includes(num)) return "bgs-green";
    if (num === 5) return "bg-green-voilet";
    if (num === 0) return "bg-red-voilet";
    return "bgs-red-200";
  };

  const getHowToPlayContent = () => {
    const base = (period, total) => (
      <>
        <p className="font-bold text-white">
          {period} 1 issue,{" "}
          {period === "30 seconds" ? "25" : String(parseInt(period) * 60 - 15)}{" "}
          seconds to order, 15 seconds waiting for the draw. It opens all day.
          Total {total} issues.
        </p>
        <p className="font-bold mt-2 text-[#9B59B6]">
          If you spend 100 to trade, after deducting 2 service fee, your
          contract amount is 98:
        </p>
        <ul className="list-disc pl-4 space-y-1 text-gray-300">
          <li>
            <span className="text-green-400">Green</span>: 1,3,7,9 → (98×2)=196;
            5 → (98×1.5)=147
          </li>
          <li>
            <span className="text-red-400">Red</span>: 2,4,6,8 → (98×2)=196; 0 →
            (98×1.5)=147
          </li>
          <li>
            <span className="text-purple-400">Violet</span>: 0 or 5 →
            (98×4.5)=441
          </li>
          <li>
            <span className="text-blue-400">Number</span>: match → (98×9)=882
          </li>
          <li>
            <span className="text-yellow-400">Big</span>: 5-9 → (98×2)=196
          </li>
          <li>
            <span className="text-cyan-400">Small</span>: 0-4 → (98×2)=196
          </li>
        </ul>
      </>
    );
    const map = {
      10: base("30 seconds", 2880),
      1: base("1 Minute", 1440),
      3: base("3 Minutes", 480),
      5: base("5 Minutes", 288),
    };
    return map[activeTime] || map[10];
  };

  // ============================================================
  // FUNCTIONS
  // ============================================================
  const openAudio = () => {
    audio1Ref.current.muted = true;
    audio2Ref.current.muted = true;
    audio1Ref.current.play().catch(() => {});
    audio2Ref.current.play().catch(() => {});
  };

  const playAudio = (ref) => {
    ref.current.muted = false;
    ref.current.play().catch(() => {});
  };

  const updateNumbers = () => {
    setNumbers(getRandomNumbers(10, 30));
    setNumber2(getRandomNumbers(10, 20));
    setNumber3(getRandomNumbers(10, 25));
    setNumber4(getRandomNumbers(10, 29));
  };

  const chartFunction = () => {
    const trendList = document.getElementById("trendList");
    if (!trendList) return;
    const existingSvg = document.querySelector(".svg-line");
    if (existingSvg) existingSvg.remove();
    const activeElements = document.querySelectorAll(".container2 .active");
    if (activeElements.length < 2) return;
    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("class", "svg-line");
    for (let i = 0; i < activeElements.length - 1; i++) {
      const first = activeElements[i];
      const second = activeElements[i + 1];
      const line = document.createElementNS(svgns, "line");
      line.setAttribute("x1", `${first.offsetLeft + first.offsetWidth / 2}px`);
      line.setAttribute("y1", `${first.offsetTop + first.offsetHeight / 2}px`);
      line.setAttribute(
        "x2",
        `${second.offsetLeft + second.offsetWidth / 2}px`,
      );
      line.setAttribute(
        "y2",
        `${second.offsetTop + second.offsetHeight / 2}px`,
      );
      line.setAttribute("stroke", "#B45CFF");
      line.setAttribute("stroke-width", "0.6");
      svg.appendChild(line);
    }
    trendList.style.position = "relative";
    trendList.appendChild(svg);
  };

  const fetchHistory = async () => {
    try {
      const res = await dispatch(
        getMyBets({ typeid: typeid1, pageno, pageto }),
      ).unwrap();
      setWingoHistoryData({
        ...res,
        gameslist: res?.data?.gameslist || [],
      });
      setHistoryPage(res?.page);
    } catch (err) {
      console.error("fetchHistory failed:", err);
    }
  };

  const fetchNewData = async (pageno, pageto) => {
    try {
      const res = await dispatch(
        getOrderList({ typeid: typeid1, pageno, pageto }),
      ).unwrap();
      if (res.status) {
        setWingoPeriodListData(res);
        setPeriodData(res);
        if (res.period) setCurrentPeriod(res.period);
        setTimeout(chartFunction, 100);
      }
    } catch (err) {
      console.error("fetchNewData failed:", err);
    }
    await fetchHistory();
  };

  const debouncedFetch = useCallback(
    debounce(async (typeid1, pageno, pageto) => {
      try {
        const res = await dispatch(
          getOrderList({ typeid: typeid1, pageno, pageto }),
        ).unwrap();
        if (res.status) {
          setWingoPeriodListData(res);
          setPeriodData(res);
          if (res.period) setCurrentPeriod(res.period);
          setTimeout(chartFunction, 100);
        }
      } catch (err) {
        console.error("debouncedFetch (period list) failed:", err);
      }

      try {
        const historyRes = await dispatch(
          getMyBets({ typeid: typeid1, pageno, pageto }),
        ).unwrap();
        setWingoHistoryData(historyRes);
        setHistoryPage(historyRes?.page);
      } catch (err) {
        console.error("debouncedFetch (history) failed:", err);
      }

      updateNumbers();
    }, 500),
    [dispatch],
  );

  const setSocketListeners = useCallback(
    (typeid) => {
      const gameInfo = GAME_EVENT_MAP[typeid];
      if (!gameInfo) return;

      const { event: timerEvent, game: currentGame } = gameInfo;

      socket.off(timerEvent);
      socket.off("data-server");

      const handleTimerUpdate = (data) => {
        if (!data) return;
        const minute = Number(data.minute) || 0;
        const second1 = Number(data.secondtime1) || 0;
        const second2 = Number(data.secondtime2) || 0;

        if (Number(typeid1) !== Number(typeid)) return;

        setMinutetime2(minute);
        setSecondtime1(second1);
        setSecondtime2(second2);

        if (minute === 0 && second1 === 0 && second2 === 0) {
          setOpenTime(true);
          setOpenPopup(false);
          debouncedFetch(typeid, 1, 10);
          if (activeVoice) playAudio(audio1Ref);
        } else {
          setOpenTime(false);
        }

        if (minute === 0 && second1 === 5 && second2 === 9 && activeVoice) {
          playAudio(audio2Ref);
        }
      };

      socket.on(timerEvent, handleTimerUpdate);

      const handleDataServer = async (msg) => {
        if (!msg?.data || !Array.isArray(msg.data)) return;
        const resultForCurrentGame = msg.data.find(
          (item) => item?.game === currentGame,
        );
        if (!resultForCurrentGame) return;
        if (Number(typeid1) !== Number(typeid)) return;

        const period = String(resultForCurrentGame.period ?? "");
        if (!period) return;

        const processKey = `${currentGame}:${typeid}:${period}`;

        if (resultProcessedRef.current.has(processKey)) {
          console.log(`[${currentGame}] ${period} already handled. SKIP.`);
          return;
        }
        resultProcessedRef.current.add(processKey);

        try {
          await debouncedFetch(typeid, 1, 10);
          if (Number(typeid1) !== Number(typeid)) return;

          const historyRes = await dispatch(
            getMyBets({ typeid, pageno: 1, pageto: 10 }),
          ).unwrap();
          if (Number(typeid1) !== Number(typeid)) return;

          const gameslist = historyRes?.data?.gameslist || [];
          setWingoHistoryData({
            ...historyRes,
            data: historyRes?.data || { gameslist: [] },
            gameslist,
          });

          const betInThisPeriod = gameslist.some(
            (bet) => String(bet?.stage) === period,
          );

          if (betInThisPeriod) {
            const lastBet = gameslist.find(
              (bet) => String(bet?.stage) === period,
            );
            setHasUserBet(true);
            setWinResult(lastBet ? lastBet.status === 1 : true);
            setResultPopup(true);
            setLastResultPeriod(period);
          } else {
            setHasUserBet(false);
            setResultPopup(false);
          }

          try {
            await dispatch(getProfile()).unwrap();
          } catch (err) {
            console.error("Profile refresh failed:", err);
          }
        } catch (err) {
          console.error(`Result processing failed:`, err);
          setResultPopup(false);
        }
      };

      socket.on("data-server", handleDataServer);

      return () => {
        socket.off(timerEvent, handleTimerUpdate);
        socket.off("data-server", handleDataServer);
      };
    },
    [activeVoice, debouncedFetch, dispatch, typeid1],
  );

  // ============================================================
  // EVENT HANDLERS
  // ============================================================
  const handleWingoMinut = (data) => {
    const nextType = Number(data);
    if (!GAME_EVENT_MAP[nextType]) return;

    setActiveTime(nextType);
    setTypeid1(nextType);
    localStorage.setItem("wingominute", String(nextType));

    setPage(1);
    setPageto(10);

    setWingoPeriodListData(null);
    setWingoHistoryData(null);
    setPeriodData(null);
    setCurrentPeriod(null);
    setMinutetime2(0);
    setSecondtime1(0);
    setSecondtime2(0);

    resultProcessedRef.current = {};
    setHasUserBet(false);
    setResultPopup(false);
    setWinResult(null);
    setLastResultPeriod(null);

    debouncedFetch(nextType, 1, 10);
    navigate(`/wingo?Game=${nextType}`);
  };

  const handleVoice = () => {
    const newState = !activeVoice;
    setActiveVoice(newState);
    localStorage.setItem("voice", newState);
  };

  const handleDetail = (i) => setDetails(details === i ? null : i);

  const handleRefersh = async () => {
    try {
      await dispatch(getProfile()).unwrap();
      setRefeshPopup(true);
      setTimeout(() => setRefeshPopup(false), 2000);
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  };

  const handleIncrease = async () => {
    const newPage = pageno + 10;
    const newPageTo = pageto + 10;
    setPage(newPage);
    setPageto(newPageTo);
    await fetchNewData(newPage, newPageTo);
  };

  const handleDecrease = async () => {
    if (pageno >= 10) {
      const newPage = pageno - 10;
      const newPageTo = pageto - 10;
      setPage(newPage);
      setPageto(newPageTo);
      await fetchNewData(newPage, newPageTo);
    }
  };

  const handleBet = async () => {
    if (!selectBet && selectBet !== 0) {
      setMessage("Please select a bet first");
      setBetAlert(true);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoader(true);
    try {
      await dispatch(
        placeBet({
          typeid: typeid1,
          join: selectBet,
          x: multiplier,
          money: credit,
        }),
      ).unwrap();

      setOpenPopup(false);
      setShowSuccessPopup(true);
      setcredit(1);
      setMultiplier(1);
      setActiveX(0);
      localStorage.setItem("bet", true);
      setTimeout(() => setShowSuccessPopup(false), 1800);

      await fetchHistory();

      try {
        await dispatch(getProfile()).unwrap();
      } catch (err) {
        console.error("Profile refresh after bet failed:", err);
      }
    } catch (err) {
      setBetAlert(true);
      setMessage(typeof err === "string" ? err : "Bet failed");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoader(false);
    }
  };

  const selectBetHandle = (data) => {
    setSelectBet(data);
    setTimeout(() => setOpenPopup(true), 100);
  };

  const generateRandomNumber = () => {
    const number = Math.floor(Math.random() * 10);
    setTimeout(() => selectBetHandle(number), 5000);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 5000);
  };

  const copyToClipboard = (number) => {
    navigator.clipboard
      .writeText(String(number))
      .then(() => {
        setCopyPopup(true);
        setTimeout(() => setCopyPopup(false), 1500);
      })
      .catch(console.error);
  };

  const handleClose = () => {
    setWinResult(null);
    setResultPopup(false);
    setHasUserBet(false);
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    const voiceState = localStorage.getItem("voice");
    if (voiceState !== null) setActiveVoice(JSON.parse(voiceState));
    setActiveTime(Number(Game) || 10);
    setTypeid1(Number(Game) || 10);
    document.body.style.overflow = openPopup ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [Game, openPopup]);

  useEffect(() => {
    debouncedFetch(typeid1, pageno, pageto);
    fetchHistory();
  }, []);

  useEffect(() => {
    if (typeid1 !== null) {
      updateNumbers();
      openAudio();
      setHasUserBet(false);
      setResultPopup(false);
    }
  }, [typeid1]);

  useEffect(() => {
    if (typeid1 !== null) {
      setTimeout(chartFunction, 100);
    }
  }, [gameHistory, openTime, wingoPeriodListData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!isConnectedRef.current) {
      socket.connect();
      isConnectedRef.current = true;
    }
    const cleanupListeners = setSocketListeners(typeid1);
    return () => {
      if (typeof cleanupListeners === "function") cleanupListeners();
    };
  }, [typeid1, activeVoice, setSocketListeners]);

  useEffect(() => {
    return () => {
      socket.disconnect();
      isConnectedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (resultPopup && winResult !== null && hasUserBet) {
      const timer = setTimeout(() => handleClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [resultPopup, winResult, hasUserBet]);

  useEffect(() => {
    const totalRemainingSeconds =
      minutetime2 * 60 + secondtime1 * 10 + secondtime2;
    const countdownStartAt = activeTime === 10 ? 5 : 10;

    if (
      totalRemainingSeconds > 0 &&
      totalRemainingSeconds <= countdownStartAt
    ) {
      setShowCountdownOverlay(true);
      setCountdownNumber(totalRemainingSeconds);
      if (
        lastPlayedCountdownRef.current !== totalRemainingSeconds &&
        activeVoice
      ) {
        playAudio(audio1Ref);
        lastPlayedCountdownRef.current = totalRemainingSeconds;
      }
    } else {
      setShowCountdownOverlay(false);
      setCountdownNumber(0);
      if (totalRemainingSeconds === 0) lastPlayedCountdownRef.current = null;
    }
  }, [minutetime2, secondtime1, secondtime2, activeTime, activeVoice]);

  // ============================================================
  // RENDER HELPERS (TopX Purple Theme)
  // ============================================================

  const goldCard =
    "rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_8px_24px_rgba(0,0,0,0.5)]";

  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const renderTimeTabs = () => (
    <section className={`${goldCard} p-1.5 sm:p-2`}>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {TIME_OPTIONS.map(({ value, label }) => {
          const active = activeTime === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleWingoMinut(value)}
              className={`min-w-0 rounded-xl px-1 py-2.5 transition-all duration-200 sm:py-3 ${
                active
                  ? `${purpleGradient} text-white`
                  : "bg-[#12061C] text-gray-400 hover:bg-[#2a1b3d] hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <img
                  src={active ? TimeActiveImg : TimeImg}
                  alt={label}
                  className={`h-7 w-7 object-contain sm:h-8 sm:w-8 ${
                    active ? "scale-105" : "opacity-70"
                  }`}
                />
                <div className="min-w-0 text-left leading-tight">
                  <p
                    className={`truncate text-[10px] font-extrabold sm:text-[11px] ${
                      active ? "text-white" : "text-gray-500"
                    }`}
                  >
                    WIN GO
                  </p>
                  <p
                    className={`text-[11px] font-black sm:text-xs ${
                      active ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );

  const WINGO_BANNER_BG =
    "https://i.ibb.co/0ycw4GQp/Chat-GPT-Image-Sep-3-2026-04-52-17-PM-100kb.jpg";

  const renderPeriodSection = () => (
    <section
      className="relative mt-3 h-[230px] overflow-hidden rounded-2xl py-3 border border-[#9B59B6]/40 bg-cover bg-center bg-no-repeat shadow-[0_8px_24px_rgba(0,0,0,0.5)] sm:min-h-[240px]"
      style={{ backgroundImage: `url(${WINGO_BANNER_BG})` }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#9B59B6] sm:text-xs">
            Current Game
          </p>
          <h2 className="truncate font-black border-b border-[#9B59B6]/60 text-white drop-shadow-sm text-xl">
            Wingo {activeTime === 10 ? "30s" : `${activeTime}Min`}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setHowtoPlay(true)}
          className="shrink-0 px-3 py-1.5 text-[11px] font-extrabold text-[#9B59B6] transition mr-4 -mt-[2.25rem] hover:text-[#B45CFF]"
        >
          How to play
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 px-4 pb-[0.5rem] sm:grid-cols-[1fr_auto] sm:items-center sm:px-5 sm:pb-5">
        <div className="min-w-0">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
              Recent results
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            {(wingoPeriodListData?.data?.gameslist || [])
              .slice(0, 5)
              .map((item, i) => (
                <img
                  key={i}
                  src={ImgData[item.amount]}
                  alt={String(item.amount)}
                  className="h-8 w-8 shrink-0 rounded-full border border-[#9B59B6]/50 bg-[#12061C] p-0.5 shadow-sm sm:h-9 sm:w-9"
                />
              ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#2a1b3d] bg-[#12061C]/95 px-3 pt-1 pb-1 text-center shadow-md backdrop-blur-sm w-[180px]">
          <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-gray-400">
            Time remaining
          </p>
          <div className="mt-1 flex items-center justify-center">
            <span
              className={`mx-0.5 flex h-8 w-6 items-center justify-center rounded-md ${purpleGradient} text-xl font-black text-white`}
            >
              {minutetime1}
            </span>
            <span
              className={`mx-0.5 flex h-8 w-6 items-center justify-center rounded-md ${purpleGradient} text-xl font-black text-white`}
            >
              {minutetime2}
            </span>
            <span className="mx-0.5 flex h-8 w-6 items-center justify-center rounded-md bg-transparent text-xl font-black text-white shadow-none">
              :
            </span>
            <span
              className={`mx-0.5 flex h-8 w-6 items-center justify-center rounded-md ${purpleGradient} text-xl font-black text-white`}
            >
              {secondtime1}
            </span>
            <span
              className={`mx-0.5 flex h-8 w-6 items-center justify-center rounded-md ${purpleGradient} text-xl font-black text-white`}
            >
              {secondtime2}
            </span>
          </div>
          <p className="mt-1 truncate text-[12px] font-semibold text-gray-300">
            Period: {wingoPeriodListData?.period || "Loading..."}
          </p>
        </div>
      </div>
    </section>
  );

  const renderBetSection = () => (
    <section className={`${goldCard} relative mt-3 overflow-hidden p-3 sm:p-4`}>
      {showCountdownOverlay && countdownNumber > 0 && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#1C0F2B]/95 backdrop-blur-[2px]">
          <span
            className={`rounded-lg ${purpleGradient} px-5 py-2 text-5xl font-black leading-none text-white sm:text-6xl`}
          >
            {String(countdownNumber).padStart(2, "0")}
          </span>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 text-[#9B59B6]">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#9B59B6]/70" />
          <h3 className="shrink-0 text-sm font-black uppercase tracking-[.1em] text-[#9B59B6] sm:text-base">
            Place your bet
          </h3>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#9B59B6]/70" />
        </div>
        <button
          type="button"
          onClick={generateRandomNumber}
          className="shrink-0 flex items-center gap-1 rounded-full border border-[#9B59B6]/40 bg-[#12061C] px-3 py-1.5 text-[11px] font-black text-[#9B59B6] shadow-sm transition hover:bg-[#2a1b3d] hover:text-white"
        >
          <Shuffle className="h-3.5 w-3.5" />
          Random
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          {
            key: "x",
            label: "Green",
            gradient: "from-[#1a5c2e] to-[#0d3a1a]",
            border: "border-[#00E676]/50",
            text: "text-[#00E676]",
            gem: "text-[#00E676]",
          },
          {
            key: "t",
            label: "Violet",
            gradient: "from-[#5b2f9c] to-[#3a1d6a]",
            border: "border-[#B45CFF]/50",
            text: "text-[#C77AFF]",
            gem: "text-[#C77AFF]",
          },
          {
            key: "d",
            label: "Red",
            gradient: "from-[#7a1c1c] to-[#4a0d0d]",
            border: "border-[#E74C3C]/50",
            text: "text-[#E74C3C]",
            gem: "text-[#E74C3C]",
          },
        ].map(({ key, label, gradient, border, text, gem }) => (
          <button
            key={key}
            type="button"
            onClick={() => selectBetHandle(key)}
            className={`bg-gradient-to-br ${gradient} rounded-2xl border ${border} px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-black ${text} sm:text-base`}>
                {label}
              </span>
              <Gem className={`h-6 w-6 ${gem} drop-shadow-sm`} />
            </div>
          </button>
        ))}
      </div>

      {/* ===== Pick a number + Multiplier ===== */}
      <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[#2a1b3d] bg-[#12061C] p-3 shadow-sm lg:grid lg:grid-cols-[1fr_auto_auto] lg:items-stretch lg:gap-4 lg:p-4">
        {/* Pick a number */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9B59B6] sm:text-xs">
              Pick a number
            </span>
          </div>
          <div>
            <div className="grid grid-cols-5 gap-2">
              {ImgData.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectBetHandle(i)}
                  className={`flex items-center justify-center rounded-xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-sm transition hover:-translate-y-0.5 hover:border-[#9B59B6]/50 hover:shadow-[0_4px_12px_rgba(155,89,182,.25)] active:scale-95 ${
                    animate ? "animate-bounce" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <img
                    src={item}
                    alt={i}
                    className="h-16 w-16 object-contain sm:h-9 sm:w-9"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical divider — only on lg+ */}
        <div className="hidden self-stretch border-l border-[#2a1b3d] lg:block" />

        {/* Multiplier */}
        <div className="lg:w-[190px]">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9B59B6] sm:text-xs">
              Multiplier
            </span>
            <Zap className="h-3.5 w-3.5 text-[#9B59B6]" fill="currentColor" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {X_DATA.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActiveX(i);
                  setMultiplier(item);
                }}
                className={`rounded-lg px-2 py-2 text-[11px] font-black transition sm:text-xs ${
                  activeX === i
                    ? `${purpleGradient} text-white`
                    : "border border-[#2a1b3d] bg-[#1C0F2B] text-gray-300 hover:bg-[#2a1b3d] hover:text-white"
                }`}
              >
                X{item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            setActiveBigSmall("l");
            selectBetHandle("l");
          }}
          className={`relative flex items-center justify-center gap-1.5 overflow-hidden rounded-xl py-3.5 text-sm font-black shadow-md transition hover:-translate-y-0.5 sm:text-base ${
            activeBigSmall === "l"
              ? `${purpleGradient} text-white`
              : "border border-[#2a1b3d] bg-[#12061C] text-gray-300 hover:bg-[#2a1b3d]"
          }`}
        >
          Big <span className="text-[11px] opacity-70">5–9</span>
          <Crown
            className={`absolute right-3 h-5 w-5 ${activeBigSmall === "l" ? "text-white/60" : "text-gray-600"}`}
          />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveBigSmall("n");
            selectBetHandle("n");
          }}
          className={`relative flex items-center justify-center gap-1.5 overflow-hidden rounded-xl py-3.5 text-sm font-black shadow-md transition hover:-translate-y-0.5 sm:text-base ${
            activeBigSmall === "n"
              ? `${purpleGradient} text-white`
              : "border border-[#2a1b3d] bg-[#12061C] text-gray-300 hover:bg-[#2a1b3d]"
          }`}
        >
          Small <span className="text-[11px] opacity-70">0–4</span>
          <Crown
            className={`absolute right-3 h-5 w-5 ${activeBigSmall === "n" ? "text-white/60" : "text-gray-600"}`}
          />
        </button>
      </div>

      {openTime && (
        <>
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-[#0B0410]/90 backdrop-blur-[2px]">
            <span
              className={`flex h-20 w-16 items-center justify-center rounded-xl ${purpleGradient} text-5xl font-black text-white shadow-2xl sm:h-24 sm:w-20 sm:text-6xl`}
            >
              0
            </span>
            <span
              className={`flex h-20 w-16 items-center justify-center rounded-xl ${purpleGradient} text-5xl font-black text-white shadow-2xl sm:h-24 sm:w-20 sm:text-6xl`}
            >
              {secondtime2}
            </span>
          </div>
          <div className="overlay-section2 pointer-events-none absolute inset-0 z-10" />
        </>
      )}
    </section>
  );

  const renderHistoryTabs = () => (
    <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
      {[
        { key: "ghistory", label: "History" },
        { key: "chart", label: "Chart" },
        { key: "mhistory", label: "My Bets" },
      ].map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`rounded-xl py-2.5 text-xs font-black transition sm:text-sm ${
            gameHistory === key
              ? `${purpleGradient} text-white`
              : "text-gray-400 hover:bg-[#2a1b3d] hover:text-white"
          }`}
          onClick={() => {
            setGameHistory(key);
            if (key === "chart") setTimeout(chartFunction, 100);
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const renderGameHistory = () => {
    if (gameHistory === "ghistory") {
      return (
        <section className={`${goldCard} mt-3 overflow-hidden`}>
          <div className="grid grid-cols-12 border-b border-[#2a1b3d] bg-[#12061C] px-2.5 py-2.5 text-[10px] font-black uppercase tracking-wide text-[#9B59B6] sm:text-xs">
            <div className="col-span-4 text-center">Period</div>
            <div className="col-span-2 text-center">Number</div>
            <div className="col-span-3 text-center">Size</div>
            <div className="col-span-3 text-center">Color</div>
          </div>
          {(wingoPeriodListData?.data?.gameslist || []).map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center border-b border-[#2a1b3d]/50 px-2.5 py-2.5 last:border-0 hover:bg-[#2a1b3d]/40"
            >
              <div className="col-span-4 truncate text-center text-[10px] font-semibold text-gray-400 sm:text-xs">
                {item.period}
              </div>
              <div className="col-span-2 text-center">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#2a1b3d] text-lg font-black shadow-sm ${getColorClass(item.amount, "text")} bg-[#12061C]`}
                >
                  {item.amount}
                </span>
              </div>
              <div className="col-span-3 text-center">
                <span
                  className={`rounded-full px-2 py-1 text-[9px] font-black ${
                    item.amount > 4
                      ? "bg-[#9B59B6]/20 text-[#9B59B6]"
                      : "bg-[#2a1b3d] text-gray-400"
                  }`}
                >
                  {item.amount > 4 ? "BIG" : "SMALL"}
                </span>
              </div>
              <div className="col-span-3 flex justify-center gap-1">
                {[0, 5].includes(item.amount) ? (
                  <>
                    <FaCircle
                      className={
                        item.amount === 0 ? "text-red-500" : "text-green-500"
                      }
                    />
                    <FaCircle className="text-purple-500" />
                  </>
                ) : (
                  <FaCircle
                    className={`${getColorClass(item.amount, "text")} text-sm`}
                  />
                )}
              </div>
            </div>
          ))}
          {renderPagination()}
        </section>
      );
    }

    if (gameHistory === "chart") {
      return (
        <section className={`${goldCard} mt-3 overflow-hidden p-3 sm:p-4`}>
          <div className="rounded-xl bg-[#12061C] p-2.5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#9B59B6] sm:text-xs">
              <span>Period</span>
              <span>Winning Number</span>
            </div>
            <div className="mt-3 grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className="flex h-6 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-[9px] font-black text-gray-300"
                >
                  {i}
                </span>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {[
                { label: "Missing", data: numbers },
                { label: "Avg Missing", data: number2 },
                { label: "Frequency", data: number3 },
                { label: "Max Consecutive", data: number4 },
              ].map(({ label, data }, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[92px_1fr] items-center gap-2"
                >
                  <span className="text-[9px] font-bold text-gray-400 sm:text-xs">
                    {label}
                  </span>
                  <div className="grid grid-cols-10 gap-1">
                    {data.map((num, i) => (
                      <span
                        key={i}
                        className="text-center text-[9px] font-black text-gray-300"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="container2 mt-3 max-w-full overflow-x-auto rounded-xl border border-[#2a1b3d] bg-[#12061C] p-2">
            <ul id="trendList" className="relative space-y-1">
              {(wingoPeriodListData?.data?.gameslist || []).map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-[#2a1b3d] bg-[#1C0F2B] px-2"
                >
                  <span className="w-20 shrink-0 text-[12px] ml-3 font-bold text-gray-400">
                    {item.period}
                  </span>
                  <div className="sec flex gap-1">
                    {Array.from({ length: 10 }, (_, n) => (
                      <span
                        key={n}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                          item.amount === n
                            ? "active bg-[#B45CFF] text-white shadow-md"
                            : "border border-[#2a1b3d] text-gray-500"
                        }`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                  <span
                    className={`third shrink-0 rounded-full px-2 py-1 text-[13px] ml-3 font-black ${
                      item.amount > 4
                        ? "bg-[#9B59B6]/20 text-[#9B59B6]"
                        : "bg-[#2a1b3d] text-gray-400"
                    }`}
                  >
                    {item.amount > 4 ? "B" : "S"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {renderPagination()}
        </section>
      );
    }

    return (
      <section className={`${goldCard} mt-3 overflow-hidden p-3 sm:p-4`}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#9B59B6]">
              Your activity
            </p>
            <h3 className="text-base font-black text-white">My Bets</h3>
          </div>
          <Link
            className="rounded-full border border-[#9B59B6]/50 px-3 py-1 text-[10px] font-black text-[#9B59B6]"
            to="#"
          >
            Details
          </Link>
        </div>
        {wingoHistoryData?.gameslist?.length === 0 ? (
          <EmptyData />
        ) : (
          (wingoHistoryData?.data?.gameslist || []).map((item, i) => (
            <div
              key={i}
              className="mb-2 rounded-xl border border-[#2a1b3d] bg-[#12061C] p-3 last:mb-0"
            >
              <div
                className="flex min-w-0 cursor-pointer items-center justify-between gap-3"
                onClick={() => handleDetail(i)}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[9px] font-black shadow-sm ${getBetClass(item.bet)}`}
                  >
                    {["x", "d", "t"].includes(item.bet)
                      ? "●"
                      : getBetLabel(item.bet)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-black text-white sm:text-sm">
                      {item.stage}
                    </h3>
                    <p className="truncate text-[10px] text-gray-400">
                      {item.today}
                    </p>
                  </div>
                </div>
                {item.status !== 0 && (
                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${
                        item.status === 1
                          ? "border-green-500 text-green-400"
                          : "border-red-400 text-red-400"
                      }`}
                    >
                      {item.status === 1 ? "Succeed" : "Failed"}
                    </span>
                    <p
                      className={`mt-1 text-xs font-black ${
                        item.status === 1 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatMoney(
                        item.status === 1 ? item.get : item.money,
                        item.status === 1 ? "+" : "-",
                      )}
                    </p>
                  </div>
                )}
              </div>
              {details === i && (
                <div className="mt-3 space-y-1.5 rounded-xl bg-[#0B0410] p-3 text-[10px] sm:text-xs">
                  {[
                    ["Order number", item.id_product],
                    ["Period", item.stage],
                    [
                      "Purchase amount",
                      formatMoney(Number(item.money) + Number(item.fee)),
                    ],
                    ["Quantity", item.amount],
                    ["Amount after tax", formatMoney(item.money)],
                    ["Tax", formatMoney(item.fee)],
                    ["Result", item.result],
                    ["Select", getBetLabel(item.bet)],
                    ["Status", item.status === 1 ? "Succeed" : "Failed"],
                    [
                      "Win/Loss",
                      formatMoney(
                        item.status === 1 ? item.get : item.money,
                        item.status === 1 ? "+" : "-",
                      ),
                    ],
                    ["Order time", item.today],
                  ].map(([label, value], n) => (
                    <div
                      key={n}
                      className="flex items-start justify-between gap-3 border-b border-[#2a1b3d] py-1 last:border-0"
                    >
                      <span className="text-gray-400">{label}</span>
                      <span className="break-all text-right font-bold text-gray-200">
                        {value}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.id_product)}
                    className="mt-1 font-black text-[#9B59B6]"
                  >
                    Copy order number
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {renderPagination()}
      </section>
    );
  };

  const renderPagination = () => (
    <div className="flex items-center justify-center gap-3 border-t border-[#2a1b3d] px-2 pb-1 pt-3">
      <button
        type="button"
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
          pageto / 10 >= 2
            ? "border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] text-white hover:scale-105"
            : "border-[#2a1b3d] bg-[#12061C] text-gray-600"
        }`}
        disabled={pageto / 10 < 2}
        onClick={handleDecrease}
      >
        <IoIosArrowBack />
      </button>
      <span className="min-w-[64px] text-center text-xs font-black text-gray-300">
        {pageto / 10}/{wingoPeriodListData?.page || 1}
      </span>
      <button
        type="button"
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
          wingoPeriodListData?.page > pageto / 10
            ? "border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] text-white hover:scale-105"
            : "border-[#2a1b3d] bg-[#12061C] text-gray-600"
        }`}
        disabled={!(wingoPeriodListData?.page > pageto / 10)}
        onClick={handleIncrease}
      >
        <IoIosArrowForward />
      </button>
    </div>
  );

  // ============================================================
  // RENDER - MAIN
  // ============================================================
  return (
    <>
      <main className="min-h-screen w-full overflow-x-hidden bg-[#0B0410] text-white">
        <div className="mx-auto w-full max-w-[520px] overflow-x-hidden px-3 pb-8 pt-3 sm:px-4 sm:pt-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#9B59B6]">
                TopX Gaming
              </p>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                WIN GO
              </h1>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[#9B59B6]/40 bg-[#1C0F2B] px-3 py-1.5 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00E676]" />
              <span className="text-[10px] font-black text-[#9B59B6]">
                LIVE
              </span>
            </div>
          </div>

          {renderTimeTabs()}
          {renderPeriodSection()}
          {renderBetSection()}
          {renderHistoryTabs()}
          {renderGameHistory()}
        </div>
      </main>

      {/* ====== BET POPUP ====== */}
      {openPopup && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setOpenPopup(false)}
          />
          <div className="fixed bottom-[76px] left-1/2 z-50 w-[calc(100%-16px)] max-w-[500px] -translate-x-1/2 overflow-hidden rounded-t-[26px] border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
            <div
              className={`p-4 text-center ${getBetClass(selectBet)} popup-select-effect`}
            >
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/80">
                Win Go {activeTime === 10 ? "30s" : `${activeTime}Min`}
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Select {getBetLabel(selectBet)}
              </h2>
            </div>
            <div className="max-h-[72vh] overflow-y-auto p-4 bg-[#12061C]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-white">credit</span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {credit_OPTIONS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                        credit === val
                          ? `${purpleGradient} text-white`
                          : "border border-[#2a1b3d] bg-[#1C0F2B] text-gray-300 hover:bg-[#2a1b3d]"
                      }`}
                      onClick={() => setcredit(val)}
                    >
                      {formatMoney(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-white">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${purpleGradient} font-black text-white`}
                    onClick={() => setMultiplier(Math.max(1, multiplier - 1))}
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={multiplier}
                    className="h-9 w-16 rounded-lg border border-[#2a1b3d] bg-[#1C0F2B] text-center font-black text-white outline-none"
                    onChange={(e) => setMultiplier(Number(e.target.value) || 1)}
                  />
                  <button
                    type="button"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${purpleGradient} font-black text-white`}
                    onClick={() => setMultiplier(multiplier + 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-6 gap-1.5">
                {X_DATA.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`rounded-lg py-2 text-[10px] font-black ${
                      activeX === i
                        ? `${purpleGradient} text-white`
                        : "border border-[#2a1b3d] bg-[#1C0F2B] text-gray-300 hover:bg-[#2a1b3d]"
                    }`}
                    onClick={() => {
                      setActiveX(i);
                      setMultiplier(item);
                    }}
                  >
                    X{item}
                  </button>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="h-4 w-4 accent-[#B45CFF]"
                />
                <span>I agree</span>
                <span className="font-bold text-[#9B59B6]">Pre-sale rules</span>
              </label>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOpenPopup(false)}
                  className="group relative overflow-hidden rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] py-3.5 text-sm font-extrabold text-gray-300 shadow-sm transition-all duration-200 hover:bg-[#2a1b3d] hover:text-white active:scale-[.97]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-base opacity-70">✕</span>
                    Cancel
                  </span>
                </button>

                <button
                  type="button"
                  disabled={loader || !isChecked}
                  onClick={handleBet}
                  className={`group relative overflow-hidden rounded-xl ${purpleGradient} py-3.5 text-sm font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loader ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="text-base">✓</span>
                        Submit Bet
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ====== HOW TO PLAY POPUP ====== */}
      {openHowtoPlay && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setHowtoPlay(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-24px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_15px_50px_rgba(0,0,0,0.7)]">
            <div className={`${purpleGradient} px-4 py-4 text-center`}>
              <h3 className="text-lg font-black text-white">
                How to Play — Win Go
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-white/80">
                {activeTime === 10 ? "30s" : `${activeTime}Min`}
              </p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto bg-[#12061C] p-5 text-sm leading-7 text-gray-300">
              <div className="[&_p]:mb-3 [&_strong]:font-extrabold [&_strong]:text-white [&_li]:mb-2 [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-black [&_h3]:text-[#9B59B6]">
                {getHowToPlayContent()}
              </div>
            </div>
            <div className="border-t border-[#2a1b3d] bg-[#1C0F2B] p-3">
              <button
                type="button"
                className={`w-full rounded-xl ${purpleGradient} px-6 py-2.5 text-sm font-black text-white`}
                onClick={() => setHowtoPlay(false)}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ====== RESULT POPUP ====== */}
      {resultPopup && winResult !== null && hasUserBet && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-28px)] max-w-[390px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[#2a1b3d] bg-[#1C0F2B] p-5 text-center shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <img
              src={winResult ? WinImg : LoseImg}
              alt="result"
              className="mx-auto h-auto max-h-32 w-auto max-w-[80%] object-contain"
            />
            <p
              className={`mt-3 text-2xl font-black ${winResult ? "text-[#F1C40F]" : "text-[#9B59B6]"}`}
            >
              {winResult ? "Congratulations!" : "Better Luck Next Time"}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-gray-400">Result</span>
              {(() => {
                const resultValue =
                  wingoHistoryData?.data?.gameslist?.[0]?.result ??
                  wingoHistoryData?.gameslist?.[0]?.result ??
                  null;
                const resultNum =
                  resultValue !== null && resultValue !== undefined
                    ? Number(resultValue)
                    : null;

                if (resultNum === null || isNaN(resultNum)) {
                  return (
                    <span className="rounded-full px-3 py-1 font-black text-white bg-gray-600">
                      --
                    </span>
                  );
                }

                let colorClass = "bg-gray-600";
                let colorName = "";
                if (resultNum === 0 || resultNum === 5) {
                  colorClass = resultNum === 0 ? "bg-red-600" : "bg-green-600";
                  colorName = resultNum === 0 ? "Red" : "Green";
                } else if ([1, 3, 7, 9].includes(resultNum)) {
                  colorClass = "bg-green-600";
                  colorName = "Green";
                } else if ([2, 4, 6, 8].includes(resultNum)) {
                  colorClass = "bg-red-600";
                  colorName = "Red";
                }

                return (
                  <>
                    <span
                      className={`rounded-full px-3 py-1 font-black text-white ${colorClass}`}
                    >
                      {colorName}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-black text-white ${winResult ? "bg-[#B45CFF]" : "bg-gray-600"}`}
                    >
                      {resultNum}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 font-black text-white ${resultNum > 4 ? "bg-[#9B59B6]" : "bg-gray-600"}`}
                    >
                      {resultNum > 4 ? "Big" : "Small"}
                    </span>
                  </>
                );
              })()}
            </div>

            <p className="mt-4 text-[10px] text-gray-400">
              Period:{" "}
              {wingoHistoryData?.data?.gameslist?.[0]?.stage ||
                wingoHistoryData?.gameslist?.[0]?.stage ||
                wingoHistoryData?.data?.gameslist?.[0]?.period ||
                wingoHistoryData?.gameslist?.[0]?.period ||
                "Loading..."}
            </p>

            <button
              type="button"
              className="mt-4 rounded-full border border-[#2a1b3d] bg-[#12061C] px-6 py-2 text-xs font-black text-gray-300 hover:bg-[#2a1b3d] hover:text-white transition"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* ====== SUCCESS POPUP ====== */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none">
          <div className="animate-in fade-in zoom-in duration-300 rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl text-[#00E676]">✓</span>
              <div className="text-left">
                <h3 className="text-base font-black text-white">
                  Bet Placed Successfully
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Your bet has been placed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== BET ALERT ====== */}
      <div className={`place-bet-popup ${betAlert ? "active" : ""}`}>
        <div className="text-sm font-bold">{messages}</div>
      </div>
    </>
  );
};

export default Wingo;
