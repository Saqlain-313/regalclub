// TradingPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import TradingChart from "../components/TradingChart";

import {
  clearTradingError, // ✅ FIXED: was 'clearTradeError'
  getCurrentTradingRound,
  getMyActiveTrade,
  placeTradingTrade,
} from "../redux/slices/tradingSlice.js";

import {
  connectTradingSocket,
  disconnectTradingSocket,
} from "../socket/tradingSocket.js";

export default function TradingPage() {
  const dispatch = useDispatch();

  const {
    roundId,
    currentValue,
    previousValue,
    direction,
    status,
    connected,
    endsAt,
    tradeLoading,
    tradeError,
    activeTrade,
  } = useSelector((state) => state.trading);

  const [amount, setAmount] = useState("");

  const [selectedDirection, setSelectedDirection] = useState(null);

  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    dispatch(getCurrentTradingRound());
    dispatch(getMyActiveTrade());

    const socket = connectTradingSocket(dispatch);

    return () => {
      socket?.off("trading:round");
      socket?.off("trading:value");
      socket?.off("trading:completed");
      disconnectTradingSocket();
    };
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!endsAt) {
        setSecondsLeft(0);
        return;
      }

      const left = Math.max(
        0,
        Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000),
      );

      setSecondsLeft(left);
    }, 250);

    return () => clearInterval(timer);
  }, [endsAt]);

  const priceDirection = Number(currentValue) >= Number(previousValue);

  const priceClass = priceDirection ? "text-green-600" : "text-red-600";

  const quickAmounts = [10, 50, 100, 500, 1000];

  const canTrade =
    status === "active" &&
    connected &&
    !!roundId &&
    secondsLeft > 0 &&
    !activeTrade &&
    !tradeLoading;

  const formattedPrice = useMemo(
    () =>
      Number(currentValue || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [currentValue],
  );

  const handleTrade = async (tradeDirection) => {
    dispatch(clearTradingError()); // ✅ FIXED: was 'clearTradeError'

    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    if (!canTrade) {
      return;
    }

    setSelectedDirection(tradeDirection);

    const result = await dispatch(
      placeTradingTrade({
        roundId,
        amount: value,
        direction: tradeDirection,
      }),
    );

    if (placeTradingTrade.fulfilled.match(result)) {
      setAmount("");
    } else {
      setSelectedDirection(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Live Demo Trading
              </h1>

              <p className="text-sm text-gray-500">
                Round: {roundId || "Connecting..."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-2xl font-bold ${priceClass}`}>
                  {formattedPrice}
                </div>

                <div className={`text-sm font-semibold ${priceClass}`}>
                  {direction === "up"
                    ? "▲ UP"
                    : direction === "down"
                      ? "▼ DOWN"
                      : "— SAME"}
                </div>
              </div>

              <div
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  connected
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {connected ? "LIVE" : "OFFLINE"}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <TradingChart />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Place Demo Trade
              </h2>

              <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold">
                {secondsLeft}s
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>

              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter virtual amount"
                disabled={!canTrade}
                className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={!canTrade}
                  onClick={() => setAmount(String(value))}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                >
                  ₹{value}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!canTrade || !Number(amount)}
                onClick={() => handleTrade("up")}
                className="rounded-xl bg-green-500 py-4 text-lg font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {tradeLoading && selectedDirection === "up"
                  ? "PLACING..."
                  : "▲ UP"}
              </button>

              <button
                type="button"
                disabled={!canTrade || !Number(amount)}
                onClick={() => handleTrade("down")}
                className="rounded-xl bg-red-500 py-4 text-lg font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {tradeLoading && selectedDirection === "down"
                  ? "PLACING..."
                  : "▼ DOWN"}
              </button>
            </div>

            {tradeError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {tradeError}
              </div>
            )}

            {!connected && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
                Connecting to live market...
              </div>
            )}

            {activeTrade && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-blue-800">Active Trade</h3>

                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                    {activeTrade.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Amount</div>
                    <div className="font-bold">₹{activeTrade.amount}</div>
                  </div>

                  <div>
                    <div className="text-gray-500">Direction</div>
                    <div className="font-bold uppercase">
                      {activeTrade.direction}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">Entry</div>
                    <div className="font-bold">
                      {Number(activeTrade.entryValue).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">Round</div>
                    <div className="font-bold">{activeTrade.roundId}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800">Market Status</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Connection</span>
                <span className="font-semibold">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Round</span>
                <span className="font-semibold">{status}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Time left</span>
                <span className="font-semibold">{secondsLeft}s</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Live value</span>
                <span className="font-semibold">{formattedPrice}</span>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
              Demo mode: the amount is stored as a virtual trade amount. No
              real-money wallet debit or payout is performed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
