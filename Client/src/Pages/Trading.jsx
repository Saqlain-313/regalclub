import { useEffect, useRef, useState } from "react";

import { CandlestickSeries, createChart, LineSeries } from "lightweight-charts";

import { useSelector } from "react-redux";

const TradingChart = () => {
  const chartContainerRef = useRef(null);

  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const maFastRef = useRef(null);
  const maSlowRef = useRef(null);

  const candlesRef = useRef([]);

  const { currentValue, previousValue, direction, connected, status } =
    useSelector((state) => state.trading);

  const [price, setPrice] = useState(0);

  // =====================================================
  // UPDATE PRICE
  // =====================================================

  useEffect(() => {
    if (currentValue !== undefined && currentValue !== null) {
      setPrice(Number(currentValue));
    }
  }, [currentValue]);

  // =====================================================
  // CREATE CHART
  // =====================================================

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 520,

      layout: {
        background: {
          color: "#ffffff",
        },

        textColor: "#6b7280",
      },

      grid: {
        vertLines: {
          color: "#e5e7eb",
        },

        horzLines: {
          color: "#e5e7eb",
        },
      },

      rightPriceScale: {
        borderColor: "#e5e7eb",

        scaleMargins: {
          top: 0.08,
          bottom: 0.08,
        },
      },

      timeScale: {
        borderColor: "#e5e7eb",

        timeVisible: true,

        secondsVisible: false,
      },

      crosshair: {
        mode: 1,
      },

      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },

      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // ===================================================
    // CANDLESTICK
    // ===================================================

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",

      downColor: "#ef4444",

      borderUpColor: "#22c55e",

      borderDownColor: "#ef4444",

      wickUpColor: "#22c55e",

      wickDownColor: "#ef4444",

      priceLineVisible: true,

      lastValueVisible: true,
    });

    candleSeriesRef.current = candleSeries;

    // ===================================================
    // FAST MOVING AVERAGE
    // ===================================================

    const fastLine = chart.addSeries(LineSeries, {
      color: "#ff9f43",

      lineWidth: 2,

      priceLineVisible: false,

      lastValueVisible: false,
    });

    maFastRef.current = fastLine;

    // ===================================================
    // SLOW MOVING AVERAGE
    // ===================================================

    const slowLine = chart.addSeries(LineSeries, {
      color: "#e879f9",

      lineWidth: 2,

      priceLineVisible: false,

      lastValueVisible: false,
    });

    maSlowRef.current = slowLine;

    // ===================================================
    // RESIZE
    // ===================================================

    const resizeObserver = new ResizeObserver(() => {
      if (!chartContainerRef.current) return;

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    });

    resizeObserver.observe(container);

    // ===================================================
    // INITIAL DEMO CANDLES
    // ===================================================

    generateInitialCandles();

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      resizeObserver.disconnect();

      chart.remove();

      chartRef.current = null;

      candleSeriesRef.current = null;

      maFastRef.current = null;

      maSlowRef.current = null;
    };
  }, []);

  // =====================================================
  // LIVE SOCKET VALUE
  // =====================================================

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    if (!currentValue) return;

    updateLiveCandle(Number(currentValue));
  }, [currentValue]);

  // =====================================================
  // GENERATE INITIAL CANDLES
  // =====================================================

  const generateInitialCandles = () => {
    if (!candleSeriesRef.current) return;

    const now = Math.floor(Date.now() / 1000);

    const candles = [];

    let value = Number(currentValue) || 107960;

    for (let i = 120; i >= 0; i--) {
      const time = now - i * 60;

      const open = value;

      const movement = (Math.random() - 0.5) * value * 0.003;

      const close = open + movement;

      const high = Math.max(open, close) + Math.random() * value * 0.0015;

      const low = Math.min(open, close) - Math.random() * value * 0.0015;

      candles.push({
        time,

        open,

        high,

        low,

        close,
      });

      value = close;
    }

    candlesRef.current = candles;

    candleSeriesRef.current.setData(candles);

    updateMovingAverages(candles);

    chartRef.current?.timeScale().fitContent();
  };

  // =====================================================
  // UPDATE LIVE CANDLE
  // =====================================================

  const updateLiveCandle = (liveValue) => {
    if (!candleSeriesRef.current) return;

    const candles = candlesRef.current;

    if (!candles.length) return;

    const last = candles[candles.length - 1];

    const newClose = Number(liveValue);

    const newCandle = {
      time: last.time,

      open: last.open,

      high: Math.max(last.high, newClose),

      low: Math.min(last.low, newClose),

      close: newClose,
    };

    candles[candles.length - 1] = newCandle;

    candleSeriesRef.current.update(newCandle);

    updateMovingAverages(candles);
  };

  // =====================================================
  // MOVING AVERAGES
  // =====================================================

  const calculateMA = (candles, period) => {
    const result = [];

    for (let i = period - 1; i < candles.length; i++) {
      let sum = 0;

      for (let j = i - period + 1; j <= i; j++) {
        sum += candles[j].close;
      }

      result.push({
        time: candles[i].time,

        value: sum / period,
      });
    }

    return result;
  };

  const updateMovingAverages = (candles) => {
    if (!maFastRef.current) return;

    if (!maSlowRef.current) return;

    const fast = calculateMA(candles, 9);

    const slow = calculateMA(candles, 21);

    maFastRef.current.setData(fast);

    maSlowRef.current.setData(slow);
  };

  // =====================================================
  // PRICE COLOR
  // =====================================================

  const isUp = Number(currentValue) >= Number(previousValue);

  const priceColor = isUp ? "#16a34a" : "#ef4444";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">BTC / USD</h2>

            <span
              className={`text-xs px-2 py-1 rounded-full ${
                connected
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-1">Live Trading Market</p>
        </div>

        {/* =============================================
            CURRENT PRICE
        ============================================== */}

        <div className="text-right">
          <div
            className="text-2xl font-bold"
            style={{
              color: priceColor,
            }}
          >
            {Number(price || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div
            className="text-sm font-medium"
            style={{
              color: priceColor,
            }}
          >
            {direction === "up"
              ? "▲ UP"
              : direction === "down"
                ? "▼ DOWN"
                : "— SAME"}
          </div>
        </div>
      </div>

      {/* ================================================
          CHART
      ================================================= */}

      <div ref={chartContainerRef} className="w-full" />

      {/* ================================================
          FOOTER
      ================================================= */}

      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-0.5 inline-block"
              style={{
                backgroundColor: "#ff9f43",
              }}
            />
            MA 9
          </span>

          <span className="flex items-center gap-2">
            <span
              className="w-3 h-0.5 inline-block"
              style={{
                backgroundColor: "#e879f9",
              }}
            />
            MA 21
          </span>
        </div>

        <div>
          Status: <span className="font-medium text-gray-700">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
