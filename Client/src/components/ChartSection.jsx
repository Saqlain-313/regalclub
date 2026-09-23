import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  FaArrowDown,
  FaArrowUp,
  FaPlus,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTimes,
  FaWindowClose,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";
import flag3 from "../assets/universalImage/Bangladesh-512.webp";
import flag4 from "../assets/universalImage/brazil.webp";
import flag5 from "../assets/universalImage/can.webp";
import flag2 from "../assets/universalImage/circle-flag-of-japan-free-png.webp";
import flag1 from "../assets/universalImage/circle-flag-of-usa-free-png.webp";
import flag6 from "../assets/universalImage/col.webp";
import flag7 from "../assets/universalImage/turky.webp";
import { getBetGrapgResult } from "../redux/slices/tradingReducer";

function ChartSection({ investment }) {
  const dispatch = useDispatch();
  const { betResult, allTrade } = useSelector((state) => state.trading);
  const [series, setSeries] = useState([{ data: [] }]);
  const [comming, setComming] = useState(false);
  const [latestPrice, setLatestPrice] = useState("1.44634");
  const [currentCandle, setCurrentCandle] = useState(null);
  const isInitialFetchDone = useRef(false);
  const [xAxisRange, setXAxisRange] = useState({
    min: undefined,
    max: undefined,
  });
  const [touchState, setTouchState] = useState({
    startDistance: null,
    startRange: null,
  });

  const [zoomOutStep, setZoomOutStep] = useState(2); // values: 0, 1, 2

  // const dragState = useRef({ isDragging: false, startX: 0, startRange: null });

  const [times, setTime] = useState({
    minute: 0,
    secondtime1: 0,
    secondtime2: 0,
  });
  const navigate = useNavigate();

  const [isCandleMoving, setIsCandleMoving] = useState(false);

  useEffect(() => {
    latestPriceRef.current = latestPrice;
  }, [latestPrice]);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startRange: { min: null, max: null },
    chartX: 0,
    chartWidth: 0,
  });
  const [isManualPan, setIsManualPan] = useState(false);
  const [ann, setAnn] = useState(70);
  const newestCandleTimeRef = useRef(null);
  const initialRangeSet = useRef(false);
  const DEFAULT_VISIBLE_CANDLES = 30;
  const CANDLE_INTERVAL = 10000;
  const candleStartTimeRef = useRef(null);
  const initialAnimationDone = useRef(false);
  useEffect(() => {
    if (investment > 0) {
      setAnn(investment);
    }
  }, [investment]);
  // WebSocket connection for time updates
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

  // Initial data fetch
  useEffect(() => {
    if (!isInitialFetchDone.current) {
      dispatch(getBetGrapgResult());
      isInitialFetchDone.current = true;
    }
  }, [dispatch]);

  // Periodic data refresh
  useEffect(() => {
    if (
      isInitialFetchDone.current &&
      times.minute === 0 &&
      times.secondtime1 === 0 &&
      times.secondtime2 === 4
    ) {
      dispatch(getBetGrapgResult());
    }
  }, [times, dispatch]);

  // Transform trade data for chart
  const transformedData = useMemo(() => {
    if (!allTrade) return [];
    return allTrade
      .map((trade) => ({
        y: [
          parseFloat(trade.open),
          parseFloat(trade.high),
          parseFloat(trade.low),
          parseFloat(trade.close),
        ],
        x: new Date(trade.x),
      }))
      .sort((a, b) => a.x - b.x); // Ensure chronological order
  }, [allTrade]);

  const prevPriceRef = useRef("1.44634");
  const latestPriceRef = useRef(latestPrice);
  const MIN_ZOOM_RANGE = 100 * 1000;
  const MAX_ZOOM_RANGE = 200 * 1000;
  const DEFAULT_WINDOW_SIZE = 30;
  const MAX_CANDLE_HISTORY = 350;
  const RIGHT_PADDING = 130000;
  const SHIFT_AMOUNT = 5 * 10000;

  const generatePriceMovement = (basePrice) => {
    const direction = betResult > 4 ? 1 : -1;
    const change = direction * (0.00005 + Math.random() * 0.0002);
    return Number((basePrice + change).toFixed(5));
  };

  const latestClose = transformedData[transformedData.length - 1]?.y[3];
  const offset = 0.0002;
  // console.log(offset, 'latestClose')

  const [yAxisRange, setYAxisRange] = useState({
    min: latestClose - offset,
    max: latestClose + offset,
  });

  // Chart options configuration
  const options = useMemo(
    () => ({
      chart: {
        type: "candlestick",
        height: 1000,
        background: "#1c1f2d",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
        toolbar: {
          show: false,
          tools: {
            download: false,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
          autoSelected: "zoom", // Default to zoom mode
        },
        zoom: {
          enabled: true,
          type: "xy",
          autoScaleYaxis: true,
          limits: {
            y: {
              min: 0.001, // Minimum y-axis range
              max: "malik",
            },
          },
          zoomedArea: {
            fill: {
              color: "#90CAF9",
              opacity: 0.4,
            },
            stroke: {
              color: "#0D47A1",
              opacity: 0.8,
              width: 1,
            },
          },
        },
        pan: { enabled: true, mode: "xy" },
        events: {
          zoomed: (chartContext, { xaxis, yaxis }) => {
            const newMin = xaxis.min;
            const newMax = xaxis.max;
            const zoomRange = newMax - newMin;
            const center = (newMin + newMax) / 2;
            const visibleData = transformedData.filter(
              (d) => d.x >= xaxis.min && d.x <= xaxis.max,
            );

            // Calculate min/max of visible prices
            let minPrice = Infinity;
            let maxPrice = -Infinity;

            visibleData.forEach((d) => {
              minPrice = Math.min(minPrice, d.y[1]); // low price
              maxPrice = Math.max(maxPrice, d.y[2]); // high price
            });

            const stepRatio = [1.0, 1.0, 1.0];
            const currentRatio = stepRatio[zoomOutStep];
            const maxAllowedRange = MAX_ZOOM_RANGE / currentRatio;

            // Determine new zoom step
            let newStep = zoomOutStep;
            if (
              zoomRange > maxAllowedRange &&
              zoomOutStep < stepRatio.length - 1
            ) {
              newStep = 2; // Zooming OUT
            } else if (zoomRange < maxAllowedRange && zoomOutStep > 0) {
              newStep = 2; // Zooming IN
            }

            // Only update if step changed
            if (newStep !== zoomOutStep) {
              const newRatio = stepRatio[newStep];

              setXAxisRange({
                min: center - MAX_ZOOM_RANGE / newRatio / 2,
                max: center + MAX_ZOOM_RANGE / newRatio / 2,
              });

              setZoomOutStep(newStep);

              // Update y-axis range based on new zoom level
              const dynamicOffset = getDynamicOffset();
              const latestClose =
                transformedData[transformedData.length - 1]?.y[3] ||
                latestPrice;

              setYAxisRange({
                min: latestClose - dynamicOffset,
                max: latestClose + dynamicOffset,
              });
            } else {
              setXAxisRange({ min: newMin, max: newMax });
            }
          },

          events: {
            // ... existing events ...
            beforeZoom: (chartContext, { xaxis, yaxis }) => {
              // Maintain a minimum zoom level
              const minRange = 30 * 60 * 1000; // 30 minutes in milliseconds
              if (xaxis.max - xaxis.min < minRange) {
                return {
                  xaxis: {
                    min: xaxis.min,
                    max: xaxis.min + minRange,
                  },
                };
              }
              return { xaxis, yaxis };
            },
          },

          mouseDown: (event, chartContext, config) => {
            setIsManualPan(true);
            const xAxis = chartContext.w.globals.minX;
            const xAxisMax = chartContext.w.globals.maxX;
            const chartWidth = chartContext.w.globals.gridWidth;

            dragState.current = {
              isDragging: true,
              startX: event.clientX,
              startRange: { min: xAxis.min, max: xAxis.max },
              chartX: xAxis,
              chartWidth: chartWidth,
            };
          },
          mouseMove: (event, chartContext, config) => {
            if (!dragState.current.isDragging) return;

            const deltaX = event.clientX - dragState.current.startX;
            const timePerPixel =
              (dragState.current.startRange.max -
                dragState.current.startRange.min) /
              dragState.current.chartWidth;

            const transformedDataTimes = transformedData.map((d) =>
              d.x.getTime(),
            );
            const oldestCandle = Math.min(...transformedDataTimes);
            const newestCandle =
              Math.max(...transformedDataTimes) + RIGHT_PADDING;

            setXAxisRange((prev) => {
              let newMin =
                dragState.current.startRange.min - deltaX * timePerPixel;
              let newMax =
                dragState.current.startRange.max - deltaX * timePerPixel;

              // Prevent dragging beyond data boundaries
              if (newMax > newestCandle) {
                newMin -= newMax - newestCandle;
                newMax = newestCandle;
              }

              if (newMin < oldestCandle) {
                newMax += oldestCandle - newMin;
                newMin = oldestCandle;
              }

              return {
                min: Math.max(oldestCandle, newMin),
                max: Math.min(newestCandle, newMax),
              };
            });
          },
          mouseUp: () => {
            dragState.current.isDragging = false;
          },
        },
      },

      annotations: {
        yaxis: [
          {
            y: latestClose,
            borderColor: "#fff",
            strokeDashArray: 4,
            label: {
              text: `(${latestClose})`,
              style: {
                color: "#fff",
                background: "#026fd3",
                borderColor: "#026fd3",
              },
            },
          },
        ],
        xaxis: [
          {
            x: latestPrice,
            borderColor: "#775DD0",
            label: {
              style: {
                color: "#fff",
              },
              text: "X-axis annotation - 22 Nov",
            },
          },
        ],
      },
      title: { text: "", align: "left", style: { color: "#e2e8f0" } },
      xaxis: {
        type: "datetime",
        min: xAxisRange.min,
        max: xAxisRange.max,
        labels: {
          style: { colors: "#a0aec0" },
          datetimeFormatter: { hour: "HH:mm", minute: "HH:mm:ss" },
        },
        axisBorder: { color: "#2d3748" },
        axisTicks: { color: "#2d3748" },
        tickPlacement: "on",
        range: "stark", // Let chart auto-calculate range
        tickAmount: "dataPoints", // Show tick for each data point
        group: {
          style: {
            colors: [], // Remove grouping colors
          },
          groups: [], // Remove any grouping
        },
      },
      series: [
        {
          data: transformedData,
        },
      ],
      yaxis: {
        min: yAxisRange.min,
        max: yAxisRange.max,
        tooltip: { enabled: true },
        labels: {
          style: { colors: "#a0aec0" },
          formatter: (val) => val.toFixed(5),
        },
        forceNiceScale: true,
        yxisBorder: { color: "#2d3748" },
        tickAmount: 8,
        stepSize: 4,
        opposite: true,
      },
      transition: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
      grid: {
        borderColor: "#252a39",
        strokeDashArray: 0,
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      plotOptions: {
        candlestick: {
          colors: { upward: "#10a055", downward: "#e85b4e" },
          wick: { useFillColor: true },
          barWidth: "100%",
        },
      },
      tooltip: {
        theme: "dark",
        x: { format: "HH:mm:ss" },
        y: { formatter: (val) => val.toFixed(5) },
      },
    }),
    [xAxisRange, transformedData],
  );

  // Calculate dynamic offset based on zoom level
  const getDynamicOffset = () => {
    // Base minimum offset to ensure at least 0.00100 difference
    const baseMinOffset = 0.0005; // Half of 0.00100 since we add to both sides

    // Calculate dynamic offset based on visible price range
    if (transformedData.length === 0) return baseMinOffset;

    const visibleData = transformedData.filter(
      (d) => d.x.getTime() >= xAxisRange.min && d.x.getTime() <= xAxisRange.max,
    );

    if (visibleData.length === 0) return baseMinOffset;

    // Calculate price range of visible candles
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    visibleData.forEach((d) => {
      minPrice = Math.min(minPrice, d.y[2]); // Low price
      maxPrice = Math.max(maxPrice, d.y[1]); // High price
    });

    const priceRange = maxPrice - minPrice;

    // Use whichever is larger - the actual price range or our minimum offset
    return Math.max(baseMinOffset, priceRange * 0.5); // 0.5 because we add to both sides
  };

  useEffect(() => {
    if (transformedData.length === 0) return;

    const dynamicOffset = getDynamicOffset();
    const latestClose =
      transformedData[transformedData.length - 1]?.y[3] ||
      Number.parseFloat(latestPrice) ||
      1.44634;

    const nextMin = latestClose - dynamicOffset;
    const nextMax = latestClose + dynamicOffset;

    setYAxisRange((prev) => {
      if (
        Math.abs((prev.min ?? 0) - nextMin) < 0.00000001 &&
        Math.abs((prev.max ?? 0) - nextMax) < 0.00000001
      ) {
        return prev;
      }

      return { min: nextMin, max: nextMax };
    });
  }, [transformedData, zoomOutStep, latestPrice]);
  // Update the y-axis range calculation useEffect
  useEffect(() => {
    if (transformedData.length === 0 || !xAxisRange.min || !xAxisRange.max)
      return;

    const visibleData = transformedData.filter(
      (d) => d.x.getTime() >= xAxisRange.min && d.x.getTime() <= xAxisRange.max,
    );

    if (visibleData.length === 0) return;

    // Calculate min/max prices from visible candles
    let minY = Infinity;
    let maxY = -Infinity;

    visibleData.forEach((d) => {
      minY = Math.min(minY, d.y[2]); // Low price
      maxY = Math.max(maxY, d.y[1]); // High price
    });

    // Calculate the required padding to ensure at least 0.00100 difference
    const currentRange = maxY - minY;
    const minRequiredRange = 0.001;

    let padding = 0;
    if (currentRange < minRequiredRange) {
      padding = (minRequiredRange - currentRange) / 2;
    } else {
      // Add 5% padding if we're already above minimum range
      padding = currentRange * 0.05;
    }

    // Apply the padding
    minY -= padding;
    maxY += padding;

    // Ensure we don't go below 0 for currency pairs
    minY = Math.max(0, minY);

    const nextMin = Number(minY.toFixed(5));
    const nextMax = Number(maxY.toFixed(5));

    setYAxisRange((prev) => {
      if (prev.min === nextMin && prev.max === nextMax) {
        return prev;
      }

      return {
        min: nextMin,
        max: nextMax,
      };
    });
  }, [xAxisRange, transformedData]);

  // Remove the existing useEffect that sets yAxisRange based on latestClose

  // console.log("Zoom Out Step:", zoomOutStep);
  // console.log("Initial X-Axis Range:", xAxisRange);

  // First, update your state to track animation state
  const [isAnimating, setIsAnimating] = useState(false);

  // Then modify your main useEffect for data handling
  useEffect(() => {
    if (transformedData?.length > 0) {
      if (!initialAnimationDone.current) {
        initialAnimationDone.current = true;

        // Set initial range
        const lastCandleTime =
          transformedData[transformedData.length - 1].x.getTime();
        const visibleRange = DEFAULT_VISIBLE_CANDLES * CANDLE_INTERVAL;
        setXAxisRange({
          min: lastCandleTime - visibleRange,
          max: lastCandleTime + RIGHT_PADDING,
        });
      } else {
        // Check if we have new data that needs animation
        const shouldAnimate = isInitialFetchDone.current;

        if (
          shouldAnimate &&
          !isAnimating &&
          times.minute === 0 &&
          times.secondtime1 === 0 &&
          times.secondtime2 <= 3
        ) {
          // Animate the newest candle (leftmost)
          animateCandle(transformedData[0], 0);
          initialAnimationDone.current = true;
          animateCandle(
            transformedData[transformedData.length - 1],
            transformedData.length - 1,
          );

          console.log("animation callled");
        } else if (!isAnimating) {
          // Regular update without animation
          setSeries([{ data: transformedData }]);
        }

        // Always adjust view to show newest data on right
        if (transformedData?.length > 0) {
          const newestCandle = transformedData[transformedData.length - 1];
          const newCandleTime = newestCandle.x.getTime() + RIGHT_PADDING;

          const maxZoomRange = 1744393458000 - 1744393888000;

          // Only auto-update range if:
          // 1. Not in manual pan mode
          // 2. We have new candles
          if (xAxisRange.min - xAxisRange.max > maxZoomRange) {
            setXAxisRange({
              min: xAxisRange.min + maxZoomRange,
              max: xAxisRange.max,
            });
          }
          if (!isManualPan && newCandleTime !== newestCandleTimeRef.current) {
            const visibleRange = xAxisRange.max - xAxisRange.min;

            setXAxisRange({
              min: newCandleTime - visibleRange,
              max: newCandleTime,
            });
          }

          newestCandleTimeRef.current = newCandleTime;
        }
      }
    }
  }, [transformedData, times]);

  // Extract animation logic into a separate function
  const animateCandle = (candle, candleIndex) => {
    setIsAnimating(true);

    // Create initial data with the target candle as a flat line
    const initialData = transformedData.map((c, idx) =>
      idx === candleIndex
        ? { ...c, y: [c.y[0], c.y[0], c.y[0], c.y[0]] }
        : { ...c },
    );

    setSeries([{ data: initialData }]);

    const startTime = Date.now();
    const duration = 3000; // Shorter duration for smoother animation
    const targetClose = candle.y[3];

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentClose = candle.y[0] + (targetClose - candle.y[0]) * progress;

      setSeries((prev) => {
        const newData = prev[0].data.map((c, idx) => {
          if (idx !== candleIndex) return c; // Skip other candles
          return {
            ...c,
            y: [
              c.y[0],
              Math.max(c.y[0], currentClose),
              Math.min(c.y[0], currentClose),
              currentClose,
            ],
          };
        });

        return [{ data: newData }];
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  // Price movement animation - stable interval.
  // latestPrice is read from a ref so the interval is not recreated every tick.
  useEffect(() => {
    if (!isCandleMoving) return;

    const priceInterval = setInterval(() => {
      const parsedPrice = Number.parseFloat(latestPriceRef.current);
      const currentPrice = Number.isFinite(parsedPrice) ? parsedPrice : 1.44634;

      const newPrice = generatePriceMovement(currentPrice);
      const nextPrice = newPrice.toFixed(5);

      latestPriceRef.current = nextPrice;
      setLatestPrice(nextPrice);

      setSeries((prev) => {
        if (!prev?.[0]?.data?.length) return prev;

        const existingData = prev[0].data;
        const lastIndex = existingData.length - 1;
        const lastCandle = existingData[lastIndex];

        if (!lastCandle?.y?.length) return prev;

        const updatedCandle = {
          ...lastCandle,
          y: [
            lastCandle.y[0],
            Math.max(lastCandle.y[1], newPrice),
            Math.min(lastCandle.y[2], newPrice),
            newPrice,
          ],
        };

        const newData = [...existingData];
        newData[lastIndex] = updatedCandle;

        return [{ data: newData }];
      });
    }, 1000);

    return () => clearInterval(priceInterval);
  }, [isCandleMoving, betResult]);

  // Navigation handlers
  // Updated navigation handlers
  const handleMoveLeft = () => {
    setIsManualPan(true);
    if (transformedData.length === 0) return;

    const oldestCandleTime = transformedData[0].x.getTime();
    const currentRange = xAxisRange.max - xAxisRange.min;

    setXAxisRange((prev) => {
      const newMin = Math.max(oldestCandleTime, prev.min - SHIFT_AMOUNT);
      return {
        min: newMin,
        max: newMin + currentRange,
      };
    });
  };

  const handleMoveRight = () => {
    setIsManualPan(true);
    if (transformedData.length === 0) return;

    const newestCandleTime =
      transformedData[transformedData.length - 1].x.getTime() + RIGHT_PADDING;
    const currentRange = xAxisRange.max - xAxisRange.min;

    setXAxisRange((prev) => {
      const newMax = Math.min(newestCandleTime, prev.max + SHIFT_AMOUNT);
      return {
        min: newMax - currentRange,
        max: newMax,
      };
    });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      setTouchState({
        startDistance: distance,
        startRange: { ...xAxisRange },
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchState.startDistance) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );

      const scale = currentDistance / touchState.startDistance;
      const range = touchState.startRange.max - touchState.startRange.min;
      const newRange = range / scale;

      // Calculate center point
      const centerX =
        (touchState.startRange.min + touchState.startRange.max) / 2;

      setXAxisRange({
        min: centerX - newRange / 2,
        max: centerX + newRange / 2,
      });
    }
  };

  useEffect(() => {
    const preventDefault = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  // Dropdown content state
  const [showButton, SetShowButton] = useState(false);
  const [activeFilter, setActiveFilter] = useState("CURRENCIES");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [navbarOpen, SetNavbarOpen] = useState([]);
  const [index, setIndex] = useState(0);

  const setData = (data) => {
    SetNavbarOpen((prev) => [...prev, data]);
    setIndex(index + 1);
  };

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
    <div className="app">
      <div className="chart-container relative">
        {/* Top bar */}
        <div className="items-center gap-2 p-4 z-[10] absolute -top-6 left-0 hidden lg:flex">
          <div>
            <button
              onClick={() => SetShowButton((prev) => !prev)}
              className="bg-[#026fd3] rounded-md text-white p-3"
            >
              <FaPlus className="size-4" />
            </button>
            {showButton && (
              <div className="absolute top-[80px] z-50">
                <div className="bg-[#191919] rounded-lg shadow-md w-[750px] h-[600px] overflow-hidden">
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
                            ? " text-white rounded-sm bg-[#026fd3]"
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
                    <div className="flex items-center text-gray-500 border p-1 px-2 rounded-md border-gray-500">
                      {favorites.length > 0 ? (
                        <>
                          <FaStar className="text-yellow-500 mr-1" />
                          <span>{favorites.length}</span>
                        </>
                      ) : (
                        <>
                          <FaRegStar className="mr-1" />
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
                        className="block w-full pl-10 pr-3 py-2 border-none rounded-md leading-5 bg-[#3b3b3b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#026fd3] sm:text-sm"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-y-auto h-[calc(400px-0px)]">
                    <table className="min-w-full divide-y divide-gray-700">
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
                                        className="h-5 w-5 overflow-hidden rounded-full object-cover"
                                      />
                                      <img
                                        src={asset.flag2}
                                        alt=""
                                        className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                                      />
                                    </div>
                                  </span>
                                </button>
                                <div className="flex items-center">
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
          </div>

          <div className="bg-[#2b3040] rounded py-1 px-2 flex items-center justify-between">
            <div
              onClick={() => SetShowButton((prev) => !prev)}
              className="flex items-center gap-2 cursor-pointer"
            >
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
              <div className="flex flex-col">
                <span className="font-semibold text-sm">USD/JPY (OTC)</span>
                <div className="text-[#ffa723] font-semibold text-sm">93%</div>
              </div>
            </div>

            <div>
              {navbarOpen.length > 0 && (
                <div className="relative">
                  <div className="absolute -top-7">
                    <div className="flex gap-2 items-start ml-5">
                      {navbarOpen.slice(0, index).map((item, idx) => (
                        <div
                          key={idx}
                          className="relative bg-[#2b3040] rounded-md"
                        >
                          <div className="flex">
                            <div className="text-white px-7 flex flex-col p-1 items-start">
                              <div>{item.pair}</div>
                              <div>{item.payout1}%</div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIndex((prev) => Math.max(0, prev - 1));
                              SetNavbarOpen((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                            }}
                            className="p-1 rounded-full absolute top-0 right-0"
                          >
                            <FaWindowClose className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="time-display text-xs text-gray-300 absolute top-4 right-4">
          {new Date().toLocaleTimeString()} UTC
        </div>

        {/* Navigation controls */}
        <div className="flex justify-center items-center gap-4 mb-2 absolute top-10 right-4 z-10 opacity-100">
          <button
            onClick={handleMoveLeft}
            className="bg-[#026fd3] hover:bg-blue-600 text-white rounded-full p-1 shadow-lg transition"
            title="View older candles"
          >
            <ChevronLeft className="md:h-5 md:w-5 w-4 h-4" />
          </button>
          <button
            onClick={handleMoveRight}
            className="bg-[#026fd3] hover:bg-blue-600 text-white rounded-full p-1 shadow-lg transition"
            title="View newer candles"
          >
            <ChevronRight className="md:h-5 md:w-5 w-4 h-4" />
          </button>
        </div>

        {/* Main chart */}
        <div
          className="chart-wrapper md:pt-1 h-[50vh] lg:h-[88vh]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <ReactApexChart
            options={options}
            series={series}
            type="candlestick"
            height="100%"
            width="100%"
          />
        </div>
      </div>
      {comming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2b3040] p-6 rounded-md text-center shadow-lg max-w-lg w-full">
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
}

export default ChartSection;
