import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  FaArrowDown,
  FaArrowUp,
  FaCaretDown,
  FaPlus,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTimes,
  FaWindowClose,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import flag3 from "../assets/universalImage/Bangladesh-512.webp";
import flag4 from "../assets/universalImage/brazil.webp";
import flag5 from "../assets/universalImage/can.webp";
import flag2 from "../assets/universalImage/circle-flag-of-japan-free-png.webp";
import flag1 from "../assets/universalImage/circle-flag-of-usa-free-png.webp";
import flag6 from "../assets/universalImage/col.webp";
import flag7 from "../assets/universalImage/turky.webp";
import { getBetGrapgResult } from "../Redux/Reducer/betReducer";
import { subscribeSocket } from "../Redux/socket";

function ChartSection({ investment }) {
  const dispatch = useDispatch();
  const { betResult, allTrade } = useSelector((state) => state.bet);
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

  const [zoomOutStep, setZoomOutStep] = useState(2);

  const [times, setTime] = useState({
    minute: 0,
    secondtime1: 0,
    secondtime2: 0,
  });
  const navigate = useNavigate();

  const [isCandleMoving, setIsCandleMoving] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
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

  const chartWrapperRef = useRef(null);

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  useEffect(() => {
    if (investment > 0) {
      setAnn(investment);
    }
  });

  useEffect(() => {
    const unsubscribe = subscribeSocket((data) => {
      if (data.event === "timeUpdate_30") {
        setTime({
          minute: data.minute,
          secondtime1: data.secondtime1,
          secondtime2: data.secondtime2,
        });

        // Market clock is live — start the per-second candle animation.
        // Without this the last candle never moves.
        setIsCandleMoving(true);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isInitialFetchDone.current) {
      dispatch(getBetGrapgResult());
      isInitialFetchDone.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getBetGrapgResult());
  }, [dispatch]);

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
      .sort((a, b) => a.x - b.x);
  }, [allTrade]);

  const prevPriceRef = useRef("1.44634");
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
  // Price shown on the chart — follows the live animated candle between refetches.
  const displayedPrice = livePrice ?? latestClose;
  const offset = 0.0002;

  const [yAxisRange, setYAxisRange] = useState({
    min: latestClose - offset,
    max: latestClose + offset,
  });

  const transformedDataRef = useRef(transformedData);
  useEffect(() => {
    transformedDataRef.current = transformedData;
  }, [transformedData]);

  const xAxisRangeRef = useRef(xAxisRange);
  useEffect(() => {
    xAxisRangeRef.current = xAxisRange;
  }, [xAxisRange]);

  // ============================================================
  // CHART OPTIONS — TopX Purple Theme
  // ============================================================
  const options = useMemo(
    () => ({
      chart: {
        type: "candlestick",
        height: 1000,
        background: "#1C0F2B", // TopX Dark Purple bg
        foreColor: "#9B59B6", // Purple text
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
          autoSelected: "zoom",
        },
        zoom: {
          enabled: true,
          type: "xy",
          autoScaleYaxis: true,
          limits: {
            y: {
              min: 0.001,
              max: undefined,
            },
          },
          zoomedArea: {
            fill: {
              color: "#B45CFF", // TopX Purple
              opacity: 0.3,
            },
            stroke: {
              color: "#7418F5", // TopX Purple
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

            let minPrice = Infinity;
            let maxPrice = -Infinity;

            visibleData.forEach((d) => {
              minPrice = Math.min(minPrice, d.y[1]);
              maxPrice = Math.max(maxPrice, d.y[2]);
            });

            const stepRatio = [1.0, 1.0, 1.0];
            const currentRatio = stepRatio[zoomOutStep];
            const maxAllowedRange = MAX_ZOOM_RANGE / currentRatio;

            let newStep = zoomOutStep;
            if (
              zoomRange > maxAllowedRange &&
              zoomOutStep < stepRatio.length - 1
            ) {
              newStep = 2;
            } else if (zoomRange < maxAllowedRange && zoomOutStep > 0) {
              newStep = 2;
            }

            if (newStep !== zoomOutStep) {
              const newRatio = stepRatio[newStep];

              setXAxisRange({
                min: center - MAX_ZOOM_RANGE / newRatio / 2,
                max: center + MAX_ZOOM_RANGE / newRatio / 2,
              });

              setZoomOutStep(newStep);

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

          beforeZoom: (chartContext, { xaxis, yaxis }) => {
            const minRange = 30 * 60 * 1000;
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
            y: displayedPrice,
            strokeDashArray: 4,
            label: {
              text: `${displayedPrice >= (transformedData[transformedData.length - 1]?.y[0] || 0) ? "▲" : "▼"} ${Number(displayedPrice).toFixed(5)}`,
              style: {
                color: "#FFFFFF",
                background: displayedPrice >= (transformedData[transformedData.length - 1]?.y[0] || 0) ? "#00A651" : "#D63031",
                borderColor: "#C77AFF",
                borderWidth: 1,
              },
            },
          },
        ],
      },
      // live marker placeholder replaced — no junk x-annotation
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: "#B45CFF",
          width: 1,
          dashArray: 4,
        },
        fill: {
          type: "solid",
          color: "#B45CFF",
          gradient: { opacityFrom: 0.15, opacityTo: 0.05 },
        },
        dropShadow: { enabled: false },
      },
      title: { text: "", align: "left", style: { color: "#B45CFF" } },
      xaxis: {
        type: "datetime",
        min: xAxisRange.min,
        max: xAxisRange.max,
        labels: {
          style: { colors: "#9B59B6" }, // TopX Purple
          datetimeFormatter: { hour: "HH:mm", minute: "HH:mm:ss" },
        },
        axisBorder: { color: "#2a1b3d" },
        axisTicks: { color: "#2a1b3d" },
        tickPlacement: "on",
        range: undefined,
        tickAmount: "dataPoints",
        group: {
          style: {
            colors: [],
          },
          groups: [],
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
          style: { colors: "#9B59B6" }, // TopX Purple
          formatter: (val) => val.toFixed(5),
        },
        forceNiceScale: true,
        yxisBorder: { color: "#2a1b3d" },
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
        borderColor: "#2a1b3d",
        strokeDashArray: 3,
        opacity: 0.5,
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: "#00C853",
            downward: "#FF3B30",
          },
          wick: { useFillColor: true },
          barWidth: "70%",
        },
      },
      states: {
        hover: { filter: { type: "lighten" } },
        active: { filter: { type: "none" } },
      },
      tooltip: {
        theme: "dark",
        shared: false,
        x: { format: "HH:mm:ss" },
        custom: function ({ seriesIndex, dataPointIndex, w }) {
          const candle = w.globals.initialSeries[seriesIndex]?.data?.[dataPointIndex];
          if (!candle || !candle.y) return "";
          const [o, h, l, c] = candle.y;
          const up = c >= o;
          const color = up ? "#00E676" : "#FF5252";
          const row = (label, v) =>
            `<div style="display:flex;justify-content:space-between;gap:14px;">
               <span style="color:#9aa0b5;">${label}</span>
               <span style="font-weight:600;">${Number(v).toFixed(5)}</span>
             </div>`;
          return `
            <div style="padding:8px 10px;font-size:12px;font-family:inherit;">
              <div style="font-weight:700;color:${color};margin-bottom:6px;">
                ${up ? "▲ UP" : "▼ DOWN"} · ${new Date(candle.x).toLocaleTimeString("en-GB")}
              </div>
              ${row("Open", o)}
              ${row("High", h)}
              ${row("Low", l)}
              ${row("Close", c)}
            </div>`;
        },
      },
    }),
    [xAxisRange, transformedData, displayedPrice],
  );

  const getDynamicOffset = () => {
    const baseMinOffset = 0.0005;

    if (transformedData.length === 0) return baseMinOffset;

    const visibleData = transformedData.filter(
      (d) => d.x.getTime() >= xAxisRange.min && d.x.getTime() <= xAxisRange.max,
    );

    if (visibleData.length === 0) return baseMinOffset;

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    visibleData.forEach((d) => {
      minPrice = Math.min(minPrice, d.y[2]);
      maxPrice = Math.max(maxPrice, d.y[1]);
    });

    const priceRange = maxPrice - minPrice;

    return Math.max(baseMinOffset, priceRange * 0.5);
  };

  useEffect(() => {
    if (transformedData.length > 0) {
      const dynamicOffset = getDynamicOffset();
      const latestClose =
        transformedData[transformedData.length - 1]?.y[3] || latestPrice;

      setYAxisRange({
        min: latestClose - dynamicOffset,
        max: latestClose + dynamicOffset,
      });
    }
  }, [transformedData, zoomOutStep, latestPrice]);

  useEffect(() => {
    if (transformedData.length === 0 || !xAxisRange.min || !xAxisRange.max)
      return;

    const visibleData = transformedData.filter(
      (d) => d.x.getTime() >= xAxisRange.min && d.x.getTime() <= xAxisRange.max,
    );

    if (visibleData.length === 0) return;

    let minY = Infinity;
    let maxY = -Infinity;

    visibleData.forEach((d) => {
      minY = Math.min(minY, d.y[2]);
      maxY = Math.max(maxY, d.y[1]);
    });

    const currentRange = maxY - minY;
    const minRequiredRange = 0.001;

    let padding = 0;
    if (currentRange < minRequiredRange) {
      padding = (minRequiredRange - currentRange) / 2;
    } else {
      padding = currentRange * 0.05;
    }

    minY -= padding;
    maxY += padding;

    minY = Math.max(0, minY);

    setYAxisRange({
      min: Number(minY.toFixed(5)),
      max: Number(maxY.toFixed(5)),
    });
  }, [xAxisRange, transformedData]);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (transformedData?.length > 0) {
      if (!initialAnimationDone.current) {
        initialAnimationDone.current = true;

        const lastCandleTime =
          transformedData[transformedData.length - 1].x.getTime();
        const visibleRange = DEFAULT_VISIBLE_CANDLES * CANDLE_INTERVAL;
        setXAxisRange({
          min: lastCandleTime - visibleRange,
          max: lastCandleTime + RIGHT_PADDING,
        });
      } else {
        // Series is replaced ONLY when a new settled candle arrives
        // (length change). The live current candle is animated by the
        // dedicated price interval below — animateCandle() used to run
        // here every second and fight it (chart froze / looped).
        setSeries((prev) => {
          const prevLen = prev[0]?.data?.length || 0;
          return prevLen === transformedData.length
            ? prev
            : [{ data: transformedData }];
        });

        if (transformedData?.length > 0) {
          const newestCandle = transformedData[transformedData.length - 1];
          const newCandleTime = newestCandle.x.getTime() + RIGHT_PADDING;

          const maxZoomRange = 1744393458000 - 1744393888000;

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
  }, [transformedData]);

  const animateCandle = (candle, candleIndex) => {
    setIsAnimating(true);

    const initialData = transformedData.map((c, idx) =>
      idx === candleIndex
        ? { ...c, y: [c.y[0], c.y[0], c.y[0], c.y[0]] }
        : { ...c },
    );

    setSeries([{ data: initialData }]);

    const startTime = Date.now();
    const duration = 3000;
    const targetClose = candle.y[3];

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentClose = candle.y[0] + (targetClose - candle.y[0]) * progress;

      setSeries((prev) => {
        const newData = prev[0].data.map((c, idx) => {
          if (idx !== candleIndex) return c;
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

  // ==========================================================
  // LIVE CANDLE ANIMATION
  // Single stable interval (not recreated every tick). The price
  // oscillates around the candle open within a small band so the
  // y-axis stays stable — a one-direction walk used to drift away
  // and force constant y-axis rescaling (the "looping" jump).
  // ==========================================================
  const livePriceRef = useRef(null);

  useEffect(() => {
    if (!isCandleMoving) return;

    const priceInterval = setInterval(() => {
      setSeries((prev) => {
        if (!prev[0].data.length) return prev;

        const existingData = [...prev[0].data];
        const lastCandle = existingData[existingData.length - 1];

        // Anchor price for the live candle
        if (livePriceRef.current === null) {
          livePriceRef.current = lastCandle.y[3];
        }

        // Oscillate: random direction each tick, bounded to a band
        // around the candle open so the axis never needs rescaling.
        const band = 0.0004;
        const open = lastCandle.y[0];
        const step = 0.00001 * (Math.floor(Math.random() * 9) + 1);
        let newPrice =
          livePriceRef.current + (Math.random() > 0.5 ? step : -step);
        if (newPrice > open + band) newPrice = open + band;
        if (newPrice < open - band) newPrice = open - band;
        newPrice = Number(newPrice.toFixed(5));
        livePriceRef.current = newPrice;
        setLivePrice(newPrice);

        const updatedCandle = {
          ...lastCandle,
          y: [
            lastCandle.y[0],
            Math.max(lastCandle.y[1], newPrice),
            Math.min(lastCandle.y[2], newPrice),
            newPrice,
          ],
        };
        return [{ data: [...existingData.slice(0, -1), updatedCandle] }];
      });
    }, 1000);

    return () => clearInterval(priceInterval);
  }, [isCandleMoving]);

  // Reset the live price anchor whenever a fresh dataset loads
  // (new round) so the next animation starts from the real close.
  useEffect(() => {
    livePriceRef.current = null;
  }, [allTrade]);


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

  useEffect(() => {
    const wrapper = chartWrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e) => {
      e.preventDefault();

      const data = transformedDataRef.current;
      if (!data || data.length === 0) return;

      const currentRange = xAxisRangeRef.current;
      if (currentRange.min == null || currentRange.max == null) return;

      const oldestCandleTime = data[0].x.getTime();
      const newestCandleTime =
        data[data.length - 1].x.getTime() + RIGHT_PADDING;

      const isHorizontalIntent =
        e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);

      setIsManualPan(true);

      if (isHorizontalIntent) {
        const rawDelta = e.shiftKey && e.deltaX === 0 ? e.deltaY : e.deltaX;
        const span = currentRange.max - currentRange.min;
        const panAmount = (rawDelta / 100) * (span * 0.08);

        setXAxisRange((prev) => {
          let newMin = prev.min + panAmount;
          let newMax = prev.max + panAmount;

          if (newMax > newestCandleTime) {
            newMin -= newMax - newestCandleTime;
            newMax = newestCandleTime;
          }
          if (newMin < oldestCandleTime) {
            newMax += oldestCandleTime - newMin;
            newMin = oldestCandleTime;
          }

          return { min: newMin, max: newMax };
        });
      } else {
        const zoomFactor = e.deltaY > 0 ? 1.12 : 0.88;
        const span = currentRange.max - currentRange.min;
        let newSpan = span * zoomFactor;

        newSpan = Math.min(Math.max(newSpan, MIN_ZOOM_RANGE), MAX_ZOOM_RANGE);

        const center = (currentRange.min + currentRange.max) / 2;
        let newMin = center - newSpan / 2;
        let newMax = center + newSpan / 2;

        if (newMax > newestCandleTime) {
          newMax = newestCandleTime;
          newMin = newMax - newSpan;
        }
        if (newMin < oldestCandleTime) {
          newMin = oldestCandleTime;
          newMax = newMin + newSpan;
        }

        setXAxisRange({ min: newMin, max: newMax });
      }
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
    };
  }, []);

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
    <div className="app bg-[#0B0410]">
      <div className="chart-container relative">
        {/* Top bar */}
        <div className="items-center gap-2 p-4 z-[10] absolute -top-6 left-0 hidden ">
          <div>
            <button
              onClick={() => SetShowButton((prev) => !prev)}
              className={`rounded-md text-white p-3 ${purpleGradient} hover:scale-105 transition-all`}
            >
              <FaPlus className="size-4" />
            </button>
            {showButton && (
              <div className="absolute top-[80px] z-50">
                <div className="bg-[#1C0F2B] border border-[#2a1b3d] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] w-[750px] h-[600px] overflow-hidden">
                  {/* Header */}
                  <div className="flex justify-between items-center px-5 py-4 border-b border-[#2a1b3d] bg-[#12061C]">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1 h-6 rounded-full ${purpleGradient}`}
                      />
                      <h3 className="font-semibold text-lg text-white">
                        Select trade pair
                      </h3>
                    </div>

                    <button
                      onClick={() => SetShowButton(false)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1C0F2B] border border-[#2a1b3d] text-[#C77AFF] hover:bg-[#2a1b3d] hover:border-[#9B59B6]/50 transition-all duration-200"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center px-5 py-3 border-b border-[#2a1b3d] bg-[#12061C]">
                    {filters.map((filter) => (
                      <button
                        key={filter}
                        className={`relative px-3 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
                          activeFilter === filter
                            ? "text-[#C77AFF]"
                            : "text-gray-500 hover:text-[#9B59B6]"
                        }`}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter}
                        {activeFilter === filter && (
                          <span
                            className={`absolute left-3 right-3 bottom-0 h-[2px] rounded-full ${purpleGradient}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Search and Favorites */}
                  <div className="flex justify-between items-center gap-4 px-5 py-4 border-b border-[#2a1b3d] bg-[#12061C]">
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1C0F2B] border border-[#2a1b3d] text-[#C77AFF] text-sm font-semibold">
                      {favorites.length > 0 ? (
                        <>
                          <FaStar className="text-[#9B59B6]" />
                          <span>{favorites.length}</span>
                        </>
                      ) : (
                        <>
                          <FaRegStar className="text-gray-500" />
                          <span className="text-gray-500">0</span>
                        </>
                      )}
                    </div>

                    <div className="relative flex-1 max-w-[650px]">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-[#9B59B6]" />
                      </div>

                      <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border border-[#2a1b3d] rounded-lg leading-5 bg-[#1C0F2B] text-white placeholder-gray-500 focus:outline-none focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/20 sm:text-sm transition-all"
                        placeholder="Search trade pair..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-y-auto h-[calc(400px-0px)] scrollbar-thin scrollbar-thumb-[#9B59B6] scrollbar-track-[#12061C]">
                    <table className="min-w-full divide-y divide-[#2a1b3d]">
                      <thead className="bg-[#12061C] sticky top-0 z-10">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em] hidden "
                          >
                            24h change
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]"
                          >
                            Profit 30 sec
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]"
                          >
                            1+ min{" "}
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-[#1C0F2B] divide-y divide-[#2a1b3d]">
                        {filteredAssets.map((asset, index) => (
                          <tr
                            key={asset.id}
                            className="group hover:bg-[#2a1b3d]/50 cursor-pointer transition-all duration-150"
                            onClick={() => {
                              if (index === 0) {
                                navigate("/trading/SideNavbar");
                                SetShowButton(false);
                              } else {
                                setComming(true);
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
                                      className="h-5 w-5 overflow-hidden rounded-full object-cover"
                                    />
                                    <img
                                      src={asset.flag2}
                                      alt=""
                                      className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                                    />
                                  </div>
                                </button>

                                <div className="flex items-center">
                                  <span className="text-white font-semibold text-sm">
                                    {asset.pair}
                                    <span className="text-gray-500 ml-1 font-normal">
                                      ({asset.type})
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap hidden ">
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
                                <span>{Math.abs(asset.change)}%</span>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/30 text-[#C77AFF] text-xs font-bold">
                                {asset.payout1}%
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/30 text-[#C77AFF] text-xs font-bold">
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

          <div className="bg-[#1C0F2B] rounded py-1 px-2 flex items-center justify-between border border-[#2a1b3d]">
            <div
              onClick={() => SetShowButton((prev) => !prev)}
              className="flex items-center justify-between w-full h-[64px] px-3 cursor-pointer rounded-xl bg-[#1C0F2B] border border-[#9B59B6]/40 shadow-[0_3px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(155,89,182,0.3)] hover:border-[#B45CFF]/60 transition-all duration-200"
            >
              {/* LEFT SIDE */}
              <div className="flex items-center min-w-0">
                <div className="relative flex items-center w-[42px] h-[30px] mr-3">
                  <img
                    src={flag1}
                    alt=""
                    className="absolute left-0 w-7 h-7 rounded-full object-cover border-2 border-[#1C0F2B] shadow-[0_2px_5px_rgba(0,0,0,0.4)] z-10"
                  />
                  <img
                    src={flag2}
                    alt=""
                    className="absolute left-[15px] w-7 h-7 rounded-full object-cover border-2 border-[#1C0F2B] shadow-[0_2px_5px_rgba(0,0,0,0.4)]"
                  />
                </div>

                <div className="flex flex-col justify-center leading-none">
                  <span className="text-[18px] font-bold text-white tracking-tight">
                    USD/JPY
                  </span>
                  <span className="mt-1 text-[13px] font-medium text-gray-400">
                    OTC
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-3">
                <div
                  className={`-mt-3 m-2 min-w-[47px] h-[29px] px-3 flex items-center justify-center rounded-[10px] ${purpleGradient} text-white text-[13px] font-bold`}
                >
                  93%
                </div>

                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#12061C] border border-[#2a1b3d]">
                  <FaCaretDown className="text-[#C77AFF] text-[18px]" />
                </div>
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
                          className="relative bg-[#1C0F2B] rounded-md border border-[#2a1b3d]"
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
                              setIndex(index - 1);
                              SetNavbarOpen((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                            }}
                            className="p-1 rounded-full absolute top-0 right-0"
                          >
                            <FaWindowClose className="h-3 w-3 text-[#C77AFF]" />
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

        <div className="time-display text-xs text-gray-400 absolute top-4 right-4">
          {new Date().toLocaleTimeString()} UTC
        </div>

        {/* Navigation controls */}
        <div className="flex justify-center items-center gap-4 mb-2 absolute top-10 right-4 z-10 opacity-100">
          <button
            onClick={handleMoveLeft}
            className={`${purpleGradient} text-white rounded-full p-1 transition-all`}
            title="View older candles"
          >
            <ChevronLeft className="  w-4 h-4" />
          </button>

          <button
            onClick={handleMoveRight}
            className={`${purpleGradient} text-white rounded-full p-1 transition-all`}
            title="View newer candles"
          >
            <ChevronRight className="  w-4 h-4" />
          </button>
        </div>

        {/* Main chart */}
        <div
          ref={chartWrapperRef}
          className="chart-wrapper  h-[50vh] "
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1C0F2B] p-6 rounded-md text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-lg w-full border border-[#2a1b3d]">
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
}

export default ChartSection;
