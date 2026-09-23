// TradingChart.jsx
import { CandlestickSeries, createChart, LineSeries } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

// ek candle kitne seconds ki hogi (1 min candle)
const CANDLE_INTERVAL_SECONDS = 10;

// max candles jitni chart me rakhni hai (purani hatate rahenge)
const MAX_CANDLES = 200;

function calculateMA(candles, period) {
  const result = [];

  if (candles.length < period) {
    return result;
  }

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
}

export default function TradingChart() {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const fastRef = useRef(null);
  const slowRef = useRef(null);
  const candlesRef = useRef([]); // ✅ ab ye empty se start hoga, koi fake random data nahi

  const currentValue = useSelector((state) => state.trading.currentValue);

  // ---- chart setup (sirf ek baar, mount pe) ----
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 520,

      layout: {
        background: { color: "#ffffff" },
        textColor: "#6b7280",
      },

      grid: {
        vertLines: { color: "#e5e7eb" },
        horzLines: { color: "#e5e7eb" },
      },

      rightPriceScale: {
        borderColor: "#e5e7eb",
      },

      timeScale: {
        borderColor: "#e5e7eb",
        timeVisible: true,
        secondsVisible: false,
      },

      crosshair: { mode: 1 },
    });

    chartRef.current = chart;

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      priceLineVisible: true,
      lastValueVisible: true,
    });

    const fast = chart.addSeries(LineSeries, {
      color: "#ff9f43",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const slow = chart.addSeries(LineSeries, {
      color: "#e879f9",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    candleRef.current = candle;
    fastRef.current = fast;
    slowRef.current = slow;

    // ❌ purana random-walk seed data generation yahan se hata diya
    // chart ab khaali start hoga, jaise hi real currentValue aayega
    // pehla candle wahi se banega

    const resize = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
    });

    resize.observe(container);

    return () => {
      resize.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      fastRef.current = null;
      slowRef.current = null;
      candlesRef.current = [];
    };
  }, []);

  // ---- real live value se candle build/update ----
  useEffect(() => {
    if (!candleRef.current) return;

    const value = Number(currentValue);

    if (!Number.isFinite(value)) {
      return;
    }

    // current time ko candle-interval bucket me daalo (e.g. 60s slot)
    const bucketTime =
      Math.floor(Date.now() / 1000 / CANDLE_INTERVAL_SECONDS) *
      CANDLE_INTERVAL_SECONDS;

    const candles = candlesRef.current;
    const last = candles[candles.length - 1];

    if (!last || last.time !== bucketTime) {
      // naya time-bucket -> naya candle banao
      // open = pichle candle ka close (continuity ke liye), warna current value hi
      const openValue = last ? last.close : value;

      const newCandle = {
        time: bucketTime,
        open: openValue,
        high: Math.max(openValue, value),
        low: Math.min(openValue, value),
        close: value,
      };

      candles.push(newCandle);

      // purani candles trim karo taaki array infinite na badhe
      if (candles.length > MAX_CANDLES) {
        candles.shift();
        // poore series ko reset karna padega kyunki shift() se time-series break hoti hai
        candleRef.current.setData(candles);
      } else {
        candleRef.current.update(newCandle);
      }
    } else {
      // same time-bucket -> existing candle ko hi update karo
      const updated = {
        time: last.time,
        open: last.open,
        high: Math.max(last.high, value),
        low: Math.min(last.low, value),
        close: value,
      };

      candles[candles.length - 1] = updated;
      candleRef.current.update(updated);
    }

    // MA lines ko real candles se recalc karo
    const maFast = calculateMA(candles, 9);
    const maSlow = calculateMA(candles, 21);

    if (maFast.length) fastRef.current?.setData(maFast);
    if (maSlow.length) slowRef.current?.setData(maSlow);
  }, [currentValue]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: 520,
      }}
    />
  );
}
